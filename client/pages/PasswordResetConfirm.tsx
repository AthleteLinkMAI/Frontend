import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/apiClient";

export default function PasswordResetConfirm() {
	const [params] = useSearchParams();
	const token = params.get("token") || "";
	const { confirmPasswordReset } = useAuth();
	const navigate = useNavigate();

	const [pwd, setPwd] = useState("");
	const [pwd2, setPwd2] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		if (pwd !== pwd2) return setError("Пароли не совпадают");
		setLoading(true);
		try {
			await confirmPasswordReset(token, pwd);
			navigate("/login");
		} catch (err) {
			setError(err instanceof ApiError ? err.body?.message : "Ошибка");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] flex items-center justify-center px-4">
			<div className="w-full max-w-[572px] bg-black/50 border border-[#E0E0E0] p-10">
				<h1 className="text-white text-center text-2xl font-bold mb-8">
					Новый пароль
				</h1>
				<form onSubmit={handleSubmit} className="space-y-6">
					<input
						type="password"
						placeholder="Новый пароль"
						value={pwd}
						onChange={(e) => setPwd(e.target.value)}
						required
						className="w-full h-14 bg-black border border-[#212121] text-white px-4 outline-none"
					/>
					<input
						type="password"
						placeholder="Повторите пароль"
						value={pwd2}
						onChange={(e) => setPwd2(e.target.value)}
						required
						className="w-full h-14 bg-black border border-[#212121] text-white px-4 outline-none"
					/>
					{error && <p className="text-red-500 text-sm">{error}</p>}
					<button
						type="submit"
						disabled={loading}
						className="w-full h-16 bg-[#212121] text-white hover:bg-[#2a2a2a] disabled:opacity-50"
					>
						{loading ? "Сохранение..." : "СОХРАНИТЬ"}
					</button>
				</form>
				<p className="text-center text-white/25 text-sm mt-6">
					<Link to="/login" className="hover:text-white/40">Ко входу</Link>
				</p>
			</div>
		</div>
	);
}