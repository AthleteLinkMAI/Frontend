import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/apiClient";
import { tokenStorage } from "@/lib/tokenStorage";

export interface User {
	id: number;
	full_name: string;
	username: string;
	email: string;
	telegram?: string;
	gender?: string;
	birth_date?: string;
	city?: string;
}

export interface RegisterPayload {
	username: string;
	email: string;
	password: string;
	full_name: string;
	telegram?: string;
	birth_date?: string;
	city?: string;
}

const fetchMe = async (): Promise<User | null> => {
	if (!tokenStorage.getAccess() && !tokenStorage.getRefresh()) return null;
	try {
		return await api.get<User>("/api/profile/me");
	} catch {
		return null;
	}
};

export function useAuth() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { data: user, isLoading, refetch } = useQuery({
		queryKey: ["auth-user"],
		queryFn: fetchMe,
		retry: false,
		staleTime: 1000 * 60 * 5,
	});

	// Реакция на 401 из apiClient
	useEffect(() => {
		const handler = () => {
			queryClient.setQueryData(["auth-user"], null);
			navigate("/login", { replace: true });
		};
		window.addEventListener("auth:logout", handler);
		return () => window.removeEventListener("auth:logout", handler);
	}, [navigate, queryClient]);

	const login = async (email: string, password: string, remember = false) => {
		const data = await api.post<{ accessToken: string; refreshToken: string }>(
			"/api/auth/login",
			{ email: email, password: password },
			{ skipAuth: true }
		);
		tokenStorage.setTokens(data.accessToken, data.refreshToken);
		if (!remember) {
			// опционально: сессионное хранение
		}
		await queryClient.invalidateQueries({ queryKey: ["auth-user"] });
	};

	const register = async (payload: RegisterPayload) => {
		const data = await api.post<{ accessToken: string; refreshToken: string }>(
				"/api/auth/register",
				payload,
				{ skipAuth: true }
			);
			tokenStorage.setTokens(data.accessToken, data.refreshToken);
			await queryClient.invalidateQueries({ queryKey: ["auth-user"] });
	};

	const logoutUser = async () => {
		try {
			await api.delete("/api/auth/logout", {});
		} catch {
			/* игнорим — всё равно чистим локально */
		}
		tokenStorage.clear();
		queryClient.setQueryData(["auth-user"], null);
		navigate("/");
	};

	const requestPasswordReset = (email: string) =>
		api.post("/api/auth/password-reset/request", { email }, { skipAuth: true });

	const confirmPasswordReset = (token: string, newPassword: string) =>
		api.post(
			"/api/auth/password-reset/confirm",
			{ token, newPassword },
			{ skipAuth: true }
		);

	return {
		user,
		isLoading,
		isAuth: !!user,
		login,
		register,
		logoutUser,
		refetchUser: refetch,
		requestPasswordReset,
		confirmPasswordReset,
	};
}