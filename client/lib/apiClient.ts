import { tokenStorage } from "./tokenStorage";


const API_URL = import.meta.env.VITE_API_URL || "https://localhost:8080";
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
		case 400: return "Invalid request";
		case 401: return "Authorization required";
		case 403: return "No access"
		case 404: return "Not found"
		case 409: return "Status conflict"
		case 502: return "Service unavailable"
		case 503: return "Service overloaded"
		case 504: return "Service timeout"
		default: return `Error: ${status}`
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

    const url = `${API_URL}/${API_PREFIX}/${path}`;
    const method = rest.method || "GET";

    const buildHeaders = (token?: string | null): HeadersInit => ({
        "Content-Type": "application/json",
        ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
    });

    const doFetch = (token?: string | null) => {
        const finalHeaders = buildHeaders(token);
        return fetch(url, {
            ...rest,
            credentials: "include",
            headers: finalHeaders,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    };

    let response: Response;
    try {
        response = await doFetch(tokenStorage.getAccess());
    } catch (err) {
        throw err;
    }

    // Access истёк — пробуем refresh и повторяем один раз
    if (response.status === 401 && !skipAuth && !noRetryOn401) {
        const newToken = await refreshAccessToken();

        if (newToken) {
            response = await doFetch(newToken);
        } else {
            window.dispatchEvent(new Event("auth:logout"));
            parseApiError(401, {
                code: "UNATHORIZATION",
                message: "The session has ended.",
            });
        }
    }

    // 204/205 — нет тела
    if (response.status === 204 || response.status === 205) {
		// console.log("Succes api:", path);
        return undefined as T;
    }

    const contentType = response.headers.get("Content-Type") || "";
    const raw = await response.text();

    const isJson =
        contentType.includes("application/json") || /^[\[{]/.test(raw.trim());
    const parsed = isJson && raw ? JSON.parse(raw) : raw;

    if (!response.ok) {
        parseApiError(response.status, parsed);
    }
	// console.log("Succes api:", path);
    return parsed as T;
}

export const api = {
    get: <T>(path: string, opts?: RequestOptions) =>
        apiRequest<T>(path, { ...opts, method: "GET" }),
    post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
        apiRequest<T>(path, { ...opts, method: "POST", body }),
    put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
        apiRequest<T>(path, { ...opts, method: "PUT", body }),
    patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
        apiRequest<T>(path, { ...opts, method: "PATCH", body }),
    delete: <T>(path: string, opts?: RequestOptions) =>
        apiRequest<T>(path, { ...opts, method: "DELETE" }),
};
