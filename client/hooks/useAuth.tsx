import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError, refreshAccessToken } from "@/lib/apiClient";
import { tokenStorage } from "@/lib/tokenStorage";


const ME_QUERY_KEY = ["auth-user"] as const;


interface MeDto {
	id: string;
	nickname: string;
	name: string | null;
	surname: string | null;
	email: string;
	isVerified: boolean;
	birthdate: string;
}


export interface User {
	id: string;
	nickname: string;
	name: string | null;
	surname: string | null;
	email: string;
	isVerified: boolean;
	age: number;
	birthdate: string;
}


interface RegisterPayload {
	nickname: string;
	name: string | null;
	surname: string | null;
	email: string;
	password: string;
	birthdate: string;
}


function calcAge(birthdate: string | null | undefined): number {
	if (!birthdate) return 0;

	// Ожидаем "YYYY-MM-DD" (или ISO). Берём только дату.
	const [y, m, d] = birthdate.slice(0, 10).split("-").map(Number);
	if (!y || !m || !d) return 0;

	const birth = new Date(y, m - 1, d);
	if (Number.isNaN(birth.getTime())) return 0;

	const now = new Date();
	let age = now.getFullYear() - birth.getFullYear();

	const hadBirthdayThisYear =
		now.getMonth() > birth.getMonth() ||
		(now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());

	if (!hadBirthdayThisYear) age -= 1;

	return age < 0 ? 0 : age;
}

async function fetchMe(): Promise<User | null> {
	const me = await api.get<MeDto>("user/me");
	if (!me) return;
	return {
		...me,
		age: calcAge(me.birthdate),
	}
}


export function useAuth() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	//MOCK
	// const user = {
	// 		id: "Azaza_id",
	// 		nickname: "Azaza",
	// 		name: "Олег",
	// 		surname: "Тинькоф",
	// 		email: "oleg@mail,com",
	// 		isVerified: true,
	// 		age: 23,
	// 		birthdate: "2026-10-27",
	// 	};

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
		async (
			nickname: string,
			name: string | null,
			surname: string | null,
			birthdate: string
		) => {
			await api.put<void>("user/update-user",
				{
					"nickname": nickname,
					"name": name,
					"surname": surname,
					"birthdate": birthdate,
				});
			await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
		},
		[queryClient]
	)

	const deleteUser = useCallback( async () => {
		await api.delete("user/delete");
		tokenStorage.clear();
		queryClient.setQueryData(ME_QUERY_KEY, null);
		queryClient.invalidateQueries({queryKey: ME_QUERY_KEY});
		console.log("Deleting account...");
		navigate("/", { replace: true });
	}, [queryClient, navigate]);

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
		deleteUser
	};
	// return {
	// 	user,
	// 	isLoading: false,
	// 	isAuth: !!user,
	// 	login: (data: any) => {console.log("login:", data)},
	// 	register: (data: any) => {console.log("register:", data)},
	// 	logoutUser: () => {console.log("logout")},
	// 	refetchUser: (data: any) => {console.log("refetch:", data)},
	// 	sendPasswordResetCode: (data: any) => {console.log("sendPasswordResetCode:", data)},
	// 	confirmPasswordReset: (data: any) => {console.log("confirmPasswordReset:", data)},
	// 	changePassword: (...data: any) => {console.log("changePassword:", data)},
	// 	changeEmail: (data: any) => {console.log("changeEmail:", data)},
	// 	updateUser: (...data: any) => {console.log("updateUser:", data)},
	// 	deleteUser: () => {console.log("deleteUser: null")},
	// };
}