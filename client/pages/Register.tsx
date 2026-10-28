import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/apiClient";
import { Calendar } from "@/components/ui/calendar";

export default function Register() {
	const { register } = useAuth();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [nickname, setNickname] = useState("");
	const [name, setName] = useState("");
	const [surname, setSurname] = useState("");
	const [birthdate, setBirthdate] = useState<Date | undefined>(undefined);
	const [showCalendar, setShowCalendar] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const validatePasswordStrength = (password: string) => {
		const lengthOk = password.length >= 8;
		const upperOk = /[A-ZА-Я]/.test(password);
		const lowerOk = /[a-zа-я]/.test(password);
		const digitOk = /\d/.test(password);
		return lengthOk && upperOk && lowerOk && digitOk;
	};

	// Формат YYYY-MM-DD
	const formatDate = (date: Date) => {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, "0");
		const d = String(date.getDate()).padStart(2, "0");
		return `${y}-${m}-${d}`;
	};

	// Для отображения в поле
	const formatDateDisplay = (date: Date) => {
		const d = String(date.getDate()).padStart(2, "0");
		const m = String(date.getMonth() + 1).padStart(2, "0");
		const y = date.getFullYear();
		return `${d}.${m}.${y}`;
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!nickname || !email || !password || !confirmPassword || !birthdate) {
			setError("Пожалуйста, заполните все обязательные поля!");
			return;
		}

		if (password !== confirmPassword) {
			setError("Пароли не совпадают!");
			return;
		}

		if (!validatePasswordStrength(password)) {
			setError(
				"Пароль должен содержать минимум 8 символов, одну заглавную букву, одну строчную букву и одну цифру."
			);
			return;
		}

		setIsLoading(true);
		try {
			await register({
				nickname,
				name: name.trim() === "" ? null : name.trim(),
				surname: surname.trim() === "" ? null : surname.trim(),
				email,
				password,
				birthdate: formatDate(birthdate),
			});
			navigate("/profile");
		} catch (err) {
			if (err instanceof ApiError) {
				setError(err.body?.message || "Ошибка регистрации");
			} else {
				setError("Ошибка соединения");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setNickname(e.target.value);
		setError(null);
	};

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setName(e.target.value);
		setError(null);
	};

	const handleSurnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSurname(e.target.value);
		setError(null);
	};

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
		setError(null);
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
		setError(null);
	};

	const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setConfirmPassword(e.target.value);
		setError(null);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] flex items-center justify-center px-4 py-8 relative overflow-hidden">
			<div className="absolute left-0 top-0 w-full h-full pointer-events-none">
				<img
					src="/lev_dartz.webp"
					alt=""
					className="absolute left-0 md:left-0 top-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 lg:w-[350px] lg:h-[350px] opacity-90 animate-levitate-active"
				/>
				<img
					src="/lev_dartz.webp"
					alt=""
					className="absolute right-0 md:right-0 top-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 lg:w-[350px] lg:h-[350px] opacity-90 animate-levitate-active-slow"
				/>
			</div>

			<div className="relative z-10 w-full max-w-[572px]">
				<div className="bg-black/50 border border-[#E0E0E0] shadow-[0_82px_40px_rgba(100,100,100,0.08)] p-8 md:p-12 lg:p-16 transition-all duration-300">
					<h1 className="text-2xl md:text-3xl lg:text-[31px] font-bold text-white text-center mb-8 md:mb-12 leading-[120%] tracking-tight">
						Регистрация в AthleteLink
					</h1>

					<form onSubmit={handleRegister} className="space-y-6">
						{/* Nickname */}
						<div className="relative">
							<div className="border border-[#212121] bg-black p-4">
								<label className="block text-white text-[10px] font-medium mb-2">
									Имя пользователя <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={nickname}
									onChange={handleNicknameChange}
									placeholder="pauchuck"
									className="w-full bg-transparent text-[#616161] text-base outline-none placeholder:text-[#616161]"
									required
									disabled={isLoading}
								/>
							</div>
						</div>

						{/* Name */}
						<div className="relative">
							<div className="border border-[#212121] bg-black p-4">
								<label className="block text-white text-[10px] font-medium mb-2">
									Имя
								</label>
								<input
									type="text"
									value={name}
									onChange={handleNameChange}
									placeholder="Иван"
									className="w-full bg-transparent text-[#757575] text-base outline-none placeholder:text-[#757575]"
									disabled={isLoading}
								/>
							</div>
						</div>

						{/* Surname */}
						<div className="relative">
							<div className="border border-[#212121] bg-black p-4">
								<label className="block text-white text-[10px] font-medium mb-2">
									Фамилия
								</label>
								<input
									type="text"
									value={surname}
									onChange={handleSurnameChange}
									placeholder="Иванов"
									className="w-full bg-transparent text-[#757575] text-base outline-none placeholder:text-[#757575]"
									disabled={isLoading}
								/>
							</div>
						</div>

						{/* Birthdate */}
						<div className="relative">
							<div className="border border-[#212121] bg-black p-4">
								<label className="block text-white text-[10px] font-medium mb-2">
									Дата рождения <span className="text-red-500">*</span>
								</label>
								<button
									type="button"
									onClick={() => setShowCalendar((v) => !v)}
									disabled={isLoading}
									className="w-full text-left bg-transparent text-base outline-none"
								>
									{birthdate ? (
										<span className="text-white">
											{formatDateDisplay(birthdate)}
										</span>
									) : (
										<span className="text-[#757575]">дд.мм.гггг</span>
									)}
								</button>
								{showCalendar && (
									<div className="mt-3">
										<Calendar
											mode="single"
											selected={birthdate}
											onSelect={(d) => {
												if (d instanceof Date) {
													setBirthdate(d);
													setShowCalendar(false);
													setError(null);
												}
											}}
											defaultMonth={birthdate || new Date(2000, 0)}
											disabled={{ after: new Date() }}
										/>
									</div>
								)}
							</div>
						</div>

						{/* Email */}
						<div className="relative">
							<div className="border border-[#212121] bg-black p-4">
								<label className="block text-white text-[10px] font-medium mb-2">
									Адрес электронной почты <span className="text-red-500">*</span>
								</label>
								<input
									type="email"
									value={email}
									onChange={handleEmailChange}
									placeholder="mai@mai.education"
									className="w-full bg-transparent text-[#757575] text-base outline-none placeholder:text-[#757575]"
									required
									disabled={isLoading}
								/>
							</div>
						</div>

						{/* Password */}
						<div className="relative">
							<div className="border border-[#212121] bg-black p-4">
								<label className="block text-white text-[10px] font-medium mb-2">
									Пароль <span className="text-red-500">*</span>
								</label>
								<div className="flex items-center gap-2">
									<input
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={handlePasswordChange}
										placeholder="**********"
										className="flex-1 bg-transparent text-[#757575] text-base outline-none placeholder:text-[#757575]"
										required
										disabled={isLoading}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										disabled={isLoading}
										className="w-4 h-4 flex items-center justify-center"
									>
										<svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path fillRule="evenodd" clipRule="evenodd" d="M16 5.5C16 5.5 13 0 8 0C3 0 0 5.5 0 5.5C0 5.5 3 11 8 11C13 11 16 5.5 16 5.5ZM1.173 5.5C1.65652 6.23488 2.21265 6.91931 2.83301 7.543C4.12 8.832 5.88 10 8 10C10.12 10 11.879 8.832 13.168 7.543C13.7884 6.91931 14.3445 6.23487 14.828 5.5C14.3445 4.76512 13.7884 4.08068 13.168 3.457C11.879 2.168 10.119 1 8 1C5.88 1 4.121 2.168 2.832 3.457C2.21164 4.08069 1.65551 4.76513 1.172 5.50001L1.173 5.5Z" fill="#BEBEBE"/>
											<path fillRule="evenodd" clipRule="evenodd" d="M3.5 1C2.11929 1 1 2.11928 1 3.49999C0.999996 4.8807 2.11928 5.99999 3.49999 6C4.8807 6 5.99999 4.88072 5.99999 3.50001C6 2.1193 4.88072 1.00001 3.50001 1H3.5ZM0 3.5C0 2.24957 0.667096 1.09413 1.75 0.468912C2.8329 -0.156303 4.16709 -0.156304 5.25 0.46891C6.3329 1.09412 7 2.24957 7 3.5C7 4.75043 6.3329 5.90587 5.25 6.53109C4.1671 7.1563 2.8329 7.1563 1.75 6.53109C0.667097 5.90587 0 4.75043 0 3.5V3.5Z" fill="#BEBEBE" transform="translate(5, 5)"/>
										</svg>
									</button>
								</div>
							</div>
						</div>

						{/* Confirm Password */}
						<div className="relative">
							<div className="border border-[#212121] bg-black p-4">
								<label className="block text-white text-[10px] font-medium mb-2">
									Подтвердите пароль <span className="text-red-500">*</span>
								</label>
								<div className="flex items-center gap-2">
									<input
										type={showConfirmPassword ? "text" : "password"}
										value={confirmPassword}
										onChange={handleConfirmPasswordChange}
										placeholder="**********"
										className="flex-1 bg-transparent text-[#757575] text-base outline-none placeholder:text-[#757575]"
										required
										disabled={isLoading}
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										disabled={isLoading}
										className="w-4 h-4 flex items-center justify-center"
									>
										<svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path fillRule="evenodd" clipRule="evenodd" d="M16 5.5C16 5.5 13 0 8 0C3 0 0 5.5 0 5.5C0 5.5 3 11 8 11C13 11 16 5.5 16 5.5ZM1.173 5.5C1.65652 6.23488 2.21265 6.91931 2.83301 7.543C4.12 8.832 5.88 10 8 10C10.12 10 11.879 8.832 13.168 7.543C13.7884 6.91931 14.3445 6.23487 14.828 5.5C14.3445 4.76512 13.7884 4.08068 13.168 3.457C11.879 2.168 10.119 1 8 1C5.88 1 4.121 2.168 2.832 3.457C2.21164 4.08069 1.65551 4.76513 1.172 5.50001L1.173 5.5Z" fill="#BEBEBE"/>
											<path fillRule="evenodd" clipRule="evenodd" d="M3.5 1C2.11929 1 1 2.11928 1 3.49999C0.999996 4.8807 2.11928 5.99999 3.49999 6C4.8807 6 5.99999 4.88072 5.99999 3.50001C6 2.1193 4.88072 1.00001 3.50001 1H3.5ZM0 3.5C0 2.24957 0.667096 1.09413 1.75 0.468912C2.8329 -0.156303 4.16709 -0.156304 5.25 0.46891C6.3329 1.09412 7 2.24957 7 3.5C7 4.75043 6.3329 5.90587 5.25 6.53109C4.1671 7.1563 2.8329 7.1563 1.75 6.53109C0.667097 5.90587 0 4.75043 0 3.5V3.5Z" fill="#BEBEBE" transform="translate(5, 5)"/>
										</svg>
									</button>
								</div>
							</div>
						</div>

						{error && (
							<div className="mb-6 p-4 border border-red-500 bg-red-500/10">
								<p className="text-red-500 text-center text-sm">{error}</p>
							</div>
						)}

						<button
							type="submit"
							disabled={isLoading}
							className="w-full h-16 bg-[#212121] text-white text-base font-medium shadow-[0_8px_4px_rgba(0,0,0,0.5)] hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? "Загрузка..." : "ЗАРЕГИСТРИРОВАТЬСЯ"}
						</button>
					</form>

					<p className="text-center text-white/25 text-[13px] mt-6">
						Уже зарегистрированы?{" "}
						<Link to="/login" className="hover:text-white/40 transition-colors">
							Войти
						</Link>
					</p>
				</div>

				<p className="text-center text-white text-lg md:text-xl font-bold mt-8 leading-[120%] tracking-tight">
					Copyright Team Layar, 2025.
				</p>
			</div>
		</div>
	);
}