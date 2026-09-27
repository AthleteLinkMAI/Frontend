import { tokenStorage } from "./tokenStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
    const refresh = tokenStorage.getRefresh();
    if (!refresh) return null;

    // Защита от параллельных refresh-запросов
    if (!refreshPromise) {
        refreshPromise = fetch(`${API_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: refresh }),
        })
        .then(async (res) => {
            if (!res.ok) {
                tokenStorage.clear();
                return null;
            }
            const data = await res.json();
            tokenStorage.setTokens(data.accessToken, data.refreshToken ?? refresh);
            return data.accessToken as string;
        })
        .finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
}

interface RequestOptions extends RequestInit {
    skipAuth?: boolean;
}

export async function apiRequest<T = any>(
    path: string,
    options: RequestOptions = {}
): Promise<T> {
    const { skipAuth, headers, ...rest } = options;

    const buildHeaders = (token?: string | null): HeadersInit => ({
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
    });

    const doFetch = (token?: string | null) =>
        fetch(`${API_URL}${path}`, { ...rest, headers: buildHeaders(token) });

    let response = await doFetch(skipAuth ? null : tokenStorage.getAccess());

    // Access истёк — пробуем refresh и повторяем один раз
    if (response.status === 401 && !skipAuth) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            response = await doFetch(newToken);
        } else {
            // редирект на логин делаем в ProtectedRoute через событие
            window.dispatchEvent(new Event("auth:logout"));
            throw new Error("Unauthorized");
        }
    }

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new ApiError(response.status, errorBody);
    }

    if (response.status === 204) return undefined as T;
    return response.json();
}

export class ApiError extends Error {
    constructor(public status: number, public body: any) {
        super(body?.message || `HTTP ${status}`);
    }
}

export const api = {
    get: <T>(path: string, opts?: RequestOptions) =>
        apiRequest<T>(path, { ...opts, method: "GET" }),
    post: <T>(path: string, body?: any, opts?: RequestOptions) =>
        apiRequest<T>(path, { ...opts, method: "POST", body: JSON.stringify(body) }),
    patch: <T>(path: string, body?: any, opts?: RequestOptions) =>
        apiRequest<T>(path, { ...opts, method: "PATCH", body: JSON.stringify(body) }),
    delete: <T>(path: string, opts?: RequestOptions) =>
        apiRequest<T>(path, { ...opts, method: "DELETE" }),
};