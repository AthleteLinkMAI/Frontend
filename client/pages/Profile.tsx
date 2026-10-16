import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import HeaderMenu from "@/components/HeaderMenu";
import SidebarNav from "@/components/SidebarMenu";

export default function Profile() {
	const { user, isLoading, updateUser, changeEmail } = useAuth();

	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");

	useEffect(() => {
		if (!isLoading && user) {
			setUsername(user.username || "");
			setEmail(user.email || "");
		}
	}, [user, isLoading]);

	if (isLoading) return <div>Загрузка данных профиля...</div>;
	if (!user) return <div>Ошибка: пользователь не авторизован</div>;

	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	const handleSaveSettings = async () => {
		setSuccessMessage("");

		setErrorMessage("");

		try {
			if (username !== user.username) {
				await updateUser(username);
			}
			if (email !== user.email) {
				await changeEmail(email);
			}
			setSuccessMessage("Настройки успешно сохранены");
		} catch (e) {
			console.error("Network error:", e);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
			<div className="flex min-h-screen">
				<SidebarNav activePage="profile" />

				<div className="flex-1 p-7 overflow-y-auto">
					<HeaderMenu />

					<div className="rounded-[10px] overflow-hidden">
						<div className="h-[88px] bg-gradient-to-r from-[#878DB3] to-[#001AFF]/30 relative">
							<div className="flex items-center px-7 py-8 gap-6">
								<div className="ml-[120px] mt-28">
									<h2 className="text-black text-xl font-medium">{user.username}</h2>
									<p className="text-black/50 text-base">{email}</p>
								</div>
								<div className="ml-auto mt-32 flex flex-col items-end">
									<button
										onClick={handleSaveSettings}
										className="bg-[#4182F9] text-white px-5 py-2 rounded-lg text-base"
									>
										Сохранить настройки
									</button>

									<div className="min-h-[24px] mt-1">
										{errorMessage && (
											<p className="text-red-700 text-sm">
												{errorMessage}
											</p>
										)}
										{!errorMessage && successMessage && (
											<p className="text-green-700 text-sm">
												{successMessage}
											</p>
										)}
									</div>
								</div>
							</div>
						</div>

						<div className="bg-white/50 p-8 min-h-[600px]">
							<div className="grid grid-cols-2 gap-x-8 gap-y-6">
								<div>
									<label className="block text-black/80 text-base mb-2 mt-40 ml-2">
										Имя пользователя
									</label>
									<input
										type="text"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										className="w-full bg-[#F9F9F9]/50 rounded-lg px-4 py-3 text-black/80 text-base outline-none"
									/>
								</div>
							</div>

							<div className="mt-12">
								<h3 className="text-black text-lg font-medium mb-4">
									Адрес электронной почты
								</h3>
								<div className="flex items-start gap-4">
									<div className="w-[42px] h-[42px] rounded-full bg-[#4182F9]/10 flex items-center justify-center flex-shrink-0">
										<svg
											className="w-[23px] h-[20px]"
											viewBox="0 0 23 20"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M16.2915 2.91669H6.70817C3.83317 2.91669 1.9165 4.16669 1.9165 7.08335V12.9167C1.9165 15.8334 3.83317 17.0834 6.70817 17.0834H16.2915C19.1665 17.0834 21.0832 15.8334 21.0832 12.9167V7.08335C21.0832 4.16669 19.1665 2.91669 16.2915 2.91669ZM16.7419 7.99169L13.7423 10.075C13.1098 10.5167 12.3048 10.7334 11.4998 10.7334C10.6948 10.7334 9.88025 10.5167 9.25734 10.075L6.25775 7.99169C5.95109 7.77502 5.90317 7.37502 6.14275 7.10835C6.39192 6.84169 6.84234 6.79169 7.149 7.00835L10.1486 9.09169C10.8769 9.60002 12.1132 9.60002 12.8415 9.09169L15.8411 7.00835C16.1478 6.79169 16.6078 6.83335 16.8473 7.10835C17.0965 7.37502 17.0486 7.77502 16.7419 7.99169Z"
												fill="#4182F9"
											/>
										</svg>
									</div>
									<div>
										<p className="text-black text-base">{email}</p>
										<p className="text-black/50 text-base">
											Изменен 10 дней назад
										</p>
									</div>
									<button className="ml-auto bg-[#4182F9] text-white px-5 py-2 rounded-lg text-base">
										Изменить адрес эл. почты
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}