import { string, unknown } from "zod/v4";
import { tokenStorage } from "./tokenStorage";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const API_PREFIX = "api/v1"

let refreshPromise: Promise<string | null> | null = null;


export class ApiError extends Error {
	code: string;
	details: Record<string, string> | null;

    constructor(
		public status: number,
		public body: {code?: string; message?: string, details?: Record<string, string> | null}
	) {
        super(body?.message ?? `HTTP ${status}`);
		this.name = "ApiError";
		this.code = body.code ?? `HTTP_${status}`;
		this.details = body.details ?? null;
    }
}


function parseApiError(status: number, body: any) {
	const code = body?.code ?? `HTTP_${status}`;
	const message = body?.message ?? defaultMessage(status);
	const details = body?.details ?? null;
	throw new ApiError(status, {code, message, details});
}


function defaultMessage(status: number) {
	switch (status) {
		case 400: "Invalid request";
		case 401: "Authorization required";
		case 403: "No access"
		case 404: "Not found"
		case 409: "Status conflict"
		case 502: "Service unavailable"
		case 503: "Service overloaded"
		case 504: "Service timeout"
		default: `Error: ${status}`
	}
}


export async function refreshAccessToken(): Promise<string | null> {
    // Защита от параллельных refresh-запросов
    if (!refreshPromise) {
        refreshPromise = fetch(`${API_URL}/${API_PREFIX}/auth/refresh`, {
            method: "POST",
			credentials: "include"
        })
        .then(async (res) => {
            if (!res.ok) {
                tokenStorage.clear();
                return null;
            }
            
			const access = (await res.text()).trim().replace(/^"|"$/g, "");
			if (!access) {
				tokenStorage.clear();
				return null;
			}
			tokenStorage.setAccess(access);
			return access;
        })
		.catch(() => {
			tokenStorage.clear();
			return null;
		})
        .finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
}


interface RequestOptions extends Omit<RequestInit, "body"> {
    skipAuth?: boolean;
	noRetryOn401?: boolean;
	body?: unknown;
}


export async function apiRequest<T = unknown>(
    path: string,
    options: RequestOptions = {}
): Promise<T> {
    const { skipAuth, noRetryOn401, body, headers, ...rest } = options;

    const buildHeaders = (token?: string | null): HeadersInit => ({
        "Content-Type": "application/json",
		...(body !== undefined ? {"Content-Type": "application/json"} : {}),
        ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
    });

    const doFetch = (token?: string | null) =>
        fetch(`${API_URL}/${API_PREFIX}/${path}`, {
			...rest,
			credentials: "include",
			headers: buildHeaders(token),
			body: body !== undefined ? JSON.stringify(body) : undefined,
		});

    let response = await doFetch(tokenStorage.getAccess());

    // Access истёк — пробуем refresh и повторяем один раз
    if (response.status === 401 && !skipAuth && !noRetryOn401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            response = await doFetch(newToken);
        } else {
            // редирект на логин делаем в ProtectedRoute через событие
            window.dispatchEvent(new Event("auth:logout"));
            throw parseApiError(401, {code: "UNATHORIZATION", message: "The session has ended."});
        }
    }

	if (response.status === 204 || response.status === 205) {
		return undefined as T;
	}

	const contentType = response.headers.get("Context-Type") || "";
	const raw = await response.text();
	const isJson = contentType.includes("application/json") || /^[\[{}]]/.test(raw.trim());
    const parsed = isJson && raw ? JSON.parse(raw) : raw;
	
	if (!response.ok) {
        throw parseApiError(response.status, parsed);
    }

	return parsed as T;
}


export const api = {
    get: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
        apiRequest<T>(path, { ...opts, method: "GET", body: JSON.stringify(body) }),
    post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
        apiRequest<T>(path, { ...opts, method: "POST", body: JSON.stringify(body) }),
	put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
		apiRequest<T>(path, { ...opts, method: "PUT", body: JSON.stringify(body) }),
    patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
        apiRequest<T>(path, { ...opts, method: "PATCH", body: JSON.stringify(body) }),
    delete: <T>(path: string, opts?: RequestOptions) =>
        apiRequest<T>(path, { ...opts, method: "DELETE" }),
};
