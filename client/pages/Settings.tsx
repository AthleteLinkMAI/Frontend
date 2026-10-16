import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import HeaderMenu from "@/components/HeaderMenu";
import SidebarNav from "@/components/SidebarMenu";
import { ApiError } from "@/lib/apiClient";

export default function Settings() {
	const navigate = useNavigate();
	const { logoutUser, user, isLoading, changePassword } = useAuth();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [passwordErrors, setPasswordErrors] = useState<string[] | null>(null);
	const [passwordErrorSingle, setPasswordErrorSingle] = useState<string | null>(null);
	const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (isLoading) {
		return <div>Загрузка настроек...</div>;
	}

	if (!user) {
		return <div>Ошибка: пользователь не авторизован</div>;
	}

	const checkClientPasswordRequirements = (pwd: string) => {
		const errors: string[] = [];
		if (pwd.length < 8) errors.push("Не менее 8 символов.");
		if (!/[A-Z]/.test(pwd)) errors.push("Не менее 1 заглавной буквы.");
		if (!/[a-z]/.test(pwd)) errors.push("Не менее 1 строчной буквы.");
		if (!/[0-9]/.test(pwd)) errors.push("Не менее 1 цифры.");
		return errors;
	};

	const handleChangePassword = async () => {
		setPasswordErrors(null);
		setPasswordErrorSingle(null);
		setPasswordSuccess(null);

		if (!currentPassword) {
			setPasswordErrorSingle("Введите текущий пароль.");
			return;
		}
		if (!newPassword) {
			setPasswordErrorSingle("Введите новый пароль.");
			return;
		}

		const clientErrors = checkClientPasswordRequirements(newPassword);
		if (clientErrors.length > 0) {
			setPasswordErrors(clientErrors);
			return;
		}

		setIsSubmitting(true);

		try {
			const data = await changePassword(currentPassword, newPassword);

			// const data = await api.post<{ detail?: string }>(
			// 	"/api/profile/change-password",
			// 	{
			// 		currentPassword,
			// 		newPassword
			// 	}
			// );

			setPasswordSuccess(
				"Пароль успешно изменён. Перезагрузите страницу."
			);
			setCurrentPassword("");
			setNewPassword("");
		} catch (err) {
		if (err instanceof ApiError) {
			const body = err.body;
			if (body?.message) {
				setPasswordErrorSingle(body.message);
			} else {
				setPasswordErrorSingle(
					`Не удалось изменить пароль. Код: ${err.status}`
				);
			}
		} else {
			console.error("Network error:", err);
			setPasswordErrorSingle("Сетевая ошибка. Проверьте соединение.");
		}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleLogout = async () => {
		const confirmed = window.confirm("Вы действительно хотите выйти?");
		if (!confirmed) return;

		setIsLoggingOut(true);
		try {
			await logoutUser();
		} finally {
			setIsLoggingOut(false);
		}
	};

	const handleDeleteAccount = () => {
		const confirmed = window.confirm(
			"Вы уверены, что хотите удалить учетную запись? Это действие необратимо."
		);
		if (confirmed) {
			// TODO: заменить на api.delete('/api/profile/me') когда бэк будет готов
			console.log("Deleting account...");
			navigate("/");
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
			<div className="flex min-h-screen">
				<SidebarNav activePage="settings" />

				<div className="flex-1 p-7 overflow-y-auto">
					<HeaderMenu />

					<div className="rounded-[10px] bg-white/50 p-8 relative min-h-[748px]">
						<h2 className="text-black text-4xl font-bold mb-6">
							Смена пароля
						</h2>

						<div className="flex flex-col gap-4 mb-6">
							<input
								type="password"
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								placeholder="Ваш текущий пароль"
								className="w-full max-w-[526px] h-[46px] rounded-lg bg-[#F9F9F9]/50 px-4 text-black/40 text-base outline-none placeholder:text-black/40"
							/>

							<input
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								placeholder="Ваш новый пароль"
								className="w-full max-w-[526px] h-[45px] rounded-lg bg-[#F9F9F9]/50 px-4 text-black/40 text-base outline-none placeholder:text-black/40"
							/>
						</div>

						<p className="text-black text-base opacity-80 mb-3 max-w-[526px]">
							Требования: не менее 8 символов, не менее 1 заглавной буквы, не
							менее 1 строчной буквы, не менее 1 цифры
						</p>

						<div className="mb-4 max-w-[526px]">
							{passwordSuccess && (
								<div className="text-green-700 bg-green-100 p-3 rounded-md mb-2">
									{passwordSuccess}
								</div>
							)}

							{passwordErrorSingle && (
								<div className="text-red-700 bg-red-100 p-3 rounded-md mb-2">
								{passwordErrorSingle}
								</div>
							)}

							{passwordErrors && passwordErrors.length > 0 && (
								<div className="text-red-700 bg-red-100 p-3 rounded-md mb-2">
									<ul className="list-disc pl-5">
										{passwordErrors.map((err, i) => (
										<li key={i}>{err}</li>
										))}
									</ul>
								</div>
							)}
						</div>

						<button
						onClick={handleChangePassword}
						className={`w-[217px] h-[38px] rounded-lg text-white text-base text-center mb-20 ${
							isSubmitting ? "bg-[#6ea0ff]/60" : "bg-[#4182F9]"
						}`}
						disabled={isSubmitting}
						>
						{isSubmitting ? "Отправка..." : "Изменить пароль"}
						</button>

						<div className="flex gap-4 items-center justify-end mb-6">
						<button
							onClick={handleLogout}
							className="w-[257px] h-[38px] rounded-lg bg-[#B52626] text-white text-base text-center"
							disabled={isLoggingOut}
						>
							{isLoggingOut ? "Выход..." : "Выйти"}
						</button>
						</div>

						<div className="flex gap-4 items-center justify-end ">
						<button
							onClick={handleDeleteAccount}
							className="w-[257px] h-[38px] rounded-lg bg-[#B52626] text-white text-base text-center"
						>
							Удалить учетную запись
						</button>
						</div>

						<div className="flex justify-between items-end">
							<p className="text-black text-base opacity-80">
								App Version: 0.1 Alphadev 13.10.25
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}