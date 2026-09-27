import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function PasswordResetRequest() {
	const { requestPasswordReset } = useAuth();
	const [email, setEmail] = useState("");
	const [sent, setSent] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await requestPasswordReset(email);
			setSent(true);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] flex items-center justify-center px-4">
			<div className="w-full max-w-[572px] bg-black/50 border border-[#E0E0E0] p-10">
				<h1 className="text-white text-center text-2xl font-bold mb-8">
					Восстановление пароля
				</h1>
				{sent ? (
					<p className="text-green-400 text-center">
						Если email зарегистрирован — на него отправлена ссылка для сброса.
					</p>
				) : (
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="border border-[#212121] bg-black p-4">
							<label className="block text-white text-[10px] mb-2">
								Email
							</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="w-full bg-transparent text-white outline-none"
							/>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="w-full h-16 bg-[#212121] text-white hover:bg-[#2a2a2a] disabled:opacity-50"
						>
							{loading ? "Отправка..." : "ОТПРАВИТЬ ССЫЛКУ"}
						</button>
					</form>
				)}
				<p className="text-center text-white/25 text-sm mt-6">
					<Link to="/login" className="hover:text-white/40">
						Вернуться ко входу
					</Link>
				</p>
			</div>
		</div>
	);
}