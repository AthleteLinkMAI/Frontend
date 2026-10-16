import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError, refreshAccessToken } from "@/lib/apiClient";
import { tokenStorage } from "@/lib/tokenStorage";


const ME_QUERY_KEY = ["auth-user"] as const;


export interface User {
	id: string;
	username: string;
	email: string;
	isVerified: boolean;
}


interface RegisterPayload {
	username: string;
	email: string;
	password: string;
}


async function fetchMe(): Promise<User | null> {
	return api.get<User>("user/me");
}


export function useAuth() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { data: user, isLoading, refetch } = useQuery({
		queryKey: ["auth-user"],
		queryFn: fetchMe,
		retry: false,
		staleTime: 1000 * 60 * 5,
	});

	//Выход при 401
	useEffect(() => {
		const onLogout = () => {
			tokenStorage.clear();
			queryClient.setQueryData(["auth-user"], null);
			navigate("/login", {replace: true});
		};
		window.addEventListener("auth:logout", onLogout);
		return () => window.removeEventListener("auth:logout", onLogout);
	}, [navigate, queryClient]);


	const login = useCallback(
		async (email, password) => {
			await api.post<{}>(
				"auth/login",
				{ "email": email, "password": password },
				{ skipAuth: true }
			);

			const access = await refreshAccessToken();
			if (!access) {
				throw new ApiError(500, {
					code: "NO_ACCESS_TOKEN",
					message: "The server did not issue an access token",
				});
			}

			const me = await queryClient.fetchQuery({
				queryKey:ME_QUERY_KEY,
				queryFn: fetchMe
			});

			if (!me) {
				throw new ApiError(500, {
					code: "NO_USER",
					message: "Failed to load user after login",
				})
			}

			return me;
		},
		[queryClient]
	);

	
	const register = useCallback(
		async (payload: RegisterPayload) => {
			await api.post<void>("user/register", payload, {
				skipAuth: true,
			});
			await login(payload.email, payload.password);
		},
		[login]
	);


	const logoutUser = useCallback(async () => {
		try {
			await api.delete<void>("auth/logout");
		} catch {
			//Неважно
		} finally {
			tokenStorage.clear();
			queryClient.setQueryData(ME_QUERY_KEY, null);
			navigate("/");
		}
	}, [navigate, queryClient]);


	const sendPasswordResetCode = useCallback((email: string) => {
		return api.post<void>(
			"verification/send-password-reset-code",
			email,
			{ skipAuth: true },
		);
	}, []);


	const confirmPasswordReset = useCallback((email: string, code: string) => {
		return api.post<void>(
			"verification/verify-password-reset",
			{"email": email, "code": code},
			{ skipAuth: true },
		);
	}, []);


	const changePassword = useCallback((oldPassword: string, newPassword: string) => {
		return api.put<void>(
			"user/change-password",
			{"oldPassword": oldPassword, "newPassword": newPassword}
		);
	}, []);


	const changeEmail = useCallback((email: string) => {
		return api.put<void>(
			"user/change-email",
			email,
		);
	}, []);


	const updateUser = useCallback(
		async (username: string) => {
			await api.put<void>("user/update-user", { "username": username });
			await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
		},
		[queryClient]
	)

	return {
		user,
		isLoading,
		isAuth: !!user,
		login,
		register,
		logoutUser,
		refetchUser: refetch,
		sendPasswordResetCode,
		confirmPasswordReset,
		changePassword,
		changeEmail,
		updateUser,
	};
}