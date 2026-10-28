import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom"
import { useAuth } from "@/hooks/useAuth";
import HeaderMenu from "@/components/HeaderMenu";
import SidebarNav from "@/components/SidebarMenu";
import { Calendar } from "@/components/ui/calendar";
import { ApiError } from "@/lib/apiClient";

export default function Settings() {
	const {
		user,
		isLoading,
		updateUser,
		changeEmail,
		changePassword,
		logoutUser,
		deleteUser,
	} = useAuth();

	// --- Профиль ---
	const [nickname, setNickname] = useState("");
	const [name, setName] = useState("");
	const [surname, setSurname] = useState("");
	const [birthdate, setBirthdate] = useState<Date | undefined>(undefined);
	const birthdateBtnRef = useRef<HTMLButtonElement>(null);
	const [calendarPos, setCalendarPos] = useState<{ top: number; left: number } | null>(null);
	const [showCalendar, setShowCalendar] = useState(false);
	const [email, setEmail] = useState("");
	const [profileSuccess, setProfileSuccess] = useState("");
	const [profileError, setProfileError] = useState("");
	const [isSavingProfile, setIsSavingProfile] = useState(false);

	// --- Пароль ---
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [passwordErrors, setPasswordErrors] = useState<string[] | null>(null);
	const [passwordErrorSingle, setPasswordErrorSingle] = useState<string | null>(null);
	const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
	const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

	// --- Выход/удаление ---
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [isDeletingAccount, setIsDeletingAccount] = useState(false);

	// --- Хелперы для даты ---
	const parseDate = (value: string | null | undefined): Date | undefined => {
		if (!value) return undefined;
		const [y, m, d] = value.slice(0, 10).split("-").map(Number);
		if (!y || !m || !d) return undefined;
		return new Date(y, m - 1, d);
	};

	const formatDateForApi = (date: Date) => {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, "0");
		const d = String(date.getDate()).padStart(2, "0");
		return `${y}-${m}-${d}`;
	};

	const formatDateDisplay = (date: Date) => {
		const d = String(date.getDate()).padStart(2, "0");
		const m = String(date.getMonth() + 1).padStart(2, "0");
		return `${d}.${m}.${date.getFullYear()}`;
	};

	// Заполняем поля при загрузке
	const initializedForUserRef = useRef<string | null>(null);

	useEffect(() => {
		if (isLoading || !user) return;
		if (initializedForUserRef.current === user.id) return;
		initializedForUserRef.current = user.id;

		setNickname(user.nickname || "");
		setName(user.name ?? "");
		setSurname(user.surname ?? "");
		setEmail(user.email || "");
		setBirthdate(parseDate((user as any).birthdate));
	}, [user, isLoading]);

	const openCalendar = () => {
		if (showCalendar) {
			setShowCalendar(false);
			return;
		}
		const rect = birthdateBtnRef.current?.getBoundingClientRect();
		if (rect) {
			setCalendarPos({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX });
		}
		setShowCalendar(true);
	};

	// Закрытие по клику вне и по Escape
	useEffect(() => {
		if (!showCalendar) return;
		const onDocClick = (e: MouseEvent) => {
			const target = e.target as Node;
			if (birthdateBtnRef.current?.contains(target)) return;
			// если клик внутри самого календаря — не закрываем
			const cal = document.getElementById("birthdate-calendar-portal");
			if (cal?.contains(target)) return;
			setShowCalendar(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setShowCalendar(false);
		};
		document.addEventListener("mousedown", onDocClick);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDocClick);
			document.removeEventListener("keydown", onKey);
		};
	}, [showCalendar]);

	// ------------------------------------------------------------------
	// Хендлеры
	// ------------------------------------------------------------------

	const handleSaveProfile = async () => {
		if (!user) return;
		setProfileSuccess("");
		setProfileError("");
		setIsSavingProfile(true);

		try {
			const nameForApi = name.trim() === "" ? null : name.trim();
			const surnameForApi = surname.trim() === "" ? null : surname.trim();
			const birthdateForApi = birthdate ? formatDateForApi(birthdate) : "";

			const nicknameChanged = nickname !== user.nickname;
			const nameChanged = nameForApi !== user.name;
			const surnameChanged = surnameForApi !== user.surname;
			const birthdateChanged =
				birthdateForApi !== (((user as any).birthdate ?? "") as string).slice(0, 10);
			const emailChanged = email !== user.email;

			if (nicknameChanged || nameChanged || surnameChanged || birthdateChanged) {
				await updateUser(nickname, nameForApi, surnameForApi, birthdateForApi);
			}
			if (emailChanged) {
				await changeEmail(email);
			}

			setProfileSuccess("Данные профиля успешно сохранены");
		} catch (e) {
			if (e instanceof ApiError) {
				setProfileError(e.body?.message ?? "Не удалось сохранить данные");
			} else {
				setProfileError("Сетевая ошибка. Проверьте соединение.");
			}
		} finally {
			setIsSavingProfile(false);
		}
	};

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

		setIsSubmittingPassword(true);

		try {
			await changePassword(currentPassword, newPassword);
			setPasswordSuccess("Пароль успешно изменён.");
			setCurrentPassword("");
			setNewPassword("");
		} catch (err) {
			if (err instanceof ApiError) {
				const body = err.body;
				if (body?.message) {
					setPasswordErrorSingle(body.message);
				} else {
					setPasswordErrorSingle(`Не удалось изменить пароль. Код: ${err.status}`);
				}
			} else {
				console.error("Network error:", err);
				setPasswordErrorSingle("Сетевая ошибка. Проверьте соединение.");
			}
		} finally {
			setIsSubmittingPassword(false);
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

	const handleDeleteAccount = async () => {
		const confirmed = window.confirm(
			"Вы уверены, что хотите удалить учетную запись? Это действие необратимо."
		);
		if (confirmed) {
			setIsDeletingAccount(true);
			try {
				await deleteUser();
			} catch (err) {
				if (err instanceof ApiError) {
					window.alert(err.body?.message ?? "Не удалось удалить аккаунт");
				} else {
					window.alert("Ошибка соединения с сервером");
				}
			} finally {
				setIsDeletingAccount(false);
			}
		}
	};

	// ------------------------------------------------------------------
	// Рендер
	// ------------------------------------------------------------------

	return (
		<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
			<div className="flex min-h-screen">
				<SidebarNav activePage="settings" />

				<div className="flex-1 p-7 overflow-y-auto">
					<HeaderMenu />

					{/* Загрузка */}
					{isLoading && (
						<div className="flex items-center justify-center py-24">
							<p className="text-white text-2xl">Загрузка настроек...</p>
						</div>
					)}

					{/* Не авторизован */}
					{!isLoading && !user && (
						<div className="flex items-center justify-center py-24">
							<p className="text-red-400 text-2xl">
								Ошибка: пользователь не авторизован
							</p>
						</div>
					)}

					{/* Контент настроек */}
					{!isLoading && user && (
						<div className="max-w-[1000px] mx-auto space-y-8">
							{/* --- БЛОК 1: ПРОФИЛЬ --- */}
							<div className="rounded-[10px] bg-white/50 p-8 relative overflow-hidden">
								<h2 className="text-black text-3xl font-bold mb-6">Профиль</h2>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
									<div>
										<label className="block text-black/80 text-base mb-2">
											Имя пользователя
										</label>
										<input
											type="text"
											value={nickname}
											onChange={(e) => setNickname(e.target.value)}
											className="w-full bg-[#F9F9F9]/50 rounded-lg px-4 py-3 text-black/80 text-base outline-none"
										/>
									</div>
									<div>
										<label className="block text-black/80 text-base mb-2">
											Адрес электронной почты
										</label>
										<input
											type="email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											className="w-full bg-[#F9F9F9]/50 rounded-lg px-4 py-3 text-black/80 text-base outline-none"
										/>
									</div>
									<div>
										<label className="block text-black/80 text-base mb-2">
											Имя
										</label>
										<input
											type="text"
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder="Иван"
											className="w-full bg-[#F9F9F9]/50 rounded-lg px-4 py-3 text-black/80 text-base outline-none placeholder:text-black/30"
										/>
									</div>
									<div>
										<label className="block text-black/80 text-base mb-2">
											Фамилия
										</label>
										<input
											type="text"
											value={surname}
											onChange={(e) => setSurname(e.target.value)}
											placeholder="Иванов"
											className="w-full bg-[#F9F9F9]/50 rounded-lg px-4 py-3 text-black/80 text-base outline-none placeholder:text-black/30"
										/>
									</div>
									<div>
										<label className="block text-black/80 text-base mb-2">
											Дата рождения
										</label>
										<button
											ref={birthdateBtnRef}
											type="button"
											onClick={openCalendar}
											className="w-full text-left bg-[#F9F9F9]/50 rounded-lg px-4 py-3 text-base outline-none"
										>
											{birthdate ? (
												<span className="text-black/80">{formatDateDisplay(birthdate)}</span>
											) : (
												<span className="text-black/30">дд.мм.гггг</span>
											)}
										</button>

										{showCalendar && calendarPos &&
											createPortal(
												<div
													id="birthdate-calendar-portal"
													style={{ position: "absolute", top: calendarPos.top, left: calendarPos.left, zIndex: 50 }}
												>
													<Calendar
														mode="single"
														selected={birthdate}
														onSelect={(d) => {
															if (d instanceof Date) {
																setBirthdate(d);
																setShowCalendar(false);
															}
														}}
														defaultMonth={birthdate || new Date(2000, 0)}
														disabled={{ after: new Date() }}
													/>
												</div>,
												document.body
											)
										}
									</div>
								</div>

								<div className="flex items-center gap-4">
									<button
										onClick={handleSaveProfile}
										disabled={isSavingProfile}
										className="bg-[#4182F9] text-white px-6 py-2 rounded-lg text-base disabled:opacity-50"
									>
										{isSavingProfile ? "Сохранение..." : "Сохранить изменения"}
									</button>

									{profileError && (
										<p className="text-red-700 text-sm">{profileError}</p>
									)}
									{!profileError && profileSuccess && (
										<p className="text-green-700 text-sm">{profileSuccess}</p>
									)}
								</div>
							</div>

							{/* --- БЛОК 2: БЕЗОПАСНОСТЬ (ПАРОЛЬ) --- */}
							<div className="rounded-[10px] bg-white/50 p-8 relative">
								<h2 className="text-black text-3xl font-bold mb-6">
									Смена пароля
								</h2>

								<div className="flex flex-col gap-4 mb-4 max-w-[526px]">
									<input
										type="password"
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
										placeholder="Ваш текущий пароль"
										className="w-full h-[46px] rounded-lg bg-[#F9F9F9]/50 px-4 text-black/80 text-base outline-none placeholder:text-black/40"
									/>
									<input
										type="password"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										placeholder="Ваш новый пароль"
										className="w-full h-[46px] rounded-lg bg-[#F9F9F9]/50 px-4 text-black/80 text-base outline-none placeholder:text-black/40"
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
									disabled={isSubmittingPassword}
									className={`w-[217px] h-[38px] rounded-lg text-white text-base text-center ${
										isSubmittingPassword ? "bg-[#6ea0ff]/60" : "bg-[#4182F9]"
									}`}
								>
									{isSubmittingPassword ? "Отправка..." : "Изменить пароль"}
								</button>
							</div>

							{/* --- БЛОК 3: УПРАВЛЕНИЕ АККАУНТОМ --- */}
							<div className="rounded-[10px] bg-white/50 p-8 relative">
								<h2 className="text-black text-3xl font-bold mb-6">
									Управление аккаунтом
								</h2>

								<div className="flex flex-col md:flex-row gap-4 md:justify-between md:items-center">
									<div>
										<p className="text-black/80 font-medium mb-1">
											Выход из системы
										</p>
										<p className="text-black/50 text-sm">
											Завершить текущую сессию на этом устройстве.
										</p>
									</div>
									<button
										onClick={handleLogout}
										disabled={isLoggingOut}
										className="w-[257px] h-[38px] rounded-lg bg-[#B52626] text-white text-base text-center disabled:opacity-50"
									>
										{isLoggingOut ? "Выход..." : "Выйти"}
									</button>
								</div>

								<div className="border-t border-black/10 my-6" />

								<div className="flex flex-col md:flex-row gap-4 md:justify-between md:items-center">
									<div>
										<p className="text-black/80 font-medium mb-1">
											Удаление аккаунта
										</p>
										<p className="text-black/50 text-sm">
											Это действие необратимо. Все ваши данные будут удалены.
										</p>
									</div>
									<button
										onClick={handleDeleteAccount}
										disabled={isDeletingAccount}
										className="w-[257px] h-[38px] rounded-lg bg-[#B52626] text-white text-base text-center disabled:opacity-50"
									>
										{isDeletingAccount ? "Удаление..." : "Удалить учетную запись"}
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}