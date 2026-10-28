import { PublicProfile } from "@/hooks/usePublicProfile";

interface ProfileCardProps {
	profile: PublicProfile;
}

// --- Прогресс-бар ---
const ProgressBar = ({
	current,
	min,
	max,
	label,
}: {
	current: number;
	min: number;
	max: number;
	label?: string;
}) => {
	const range = max - min;
	const percentage = range > 0 ? Math.min(100, Math.max(0, ((current - min) / range) * 100)) : 0;

	return (
		<div className="w-full">
			{/* Шкала: min слева, max справа — над баром */}
			<div className="relative text-xs text-white/60 h-4">
				<span className="absolute left-0">{min}</span>
				<span className="absolute right-0">{max}</span>
			</div>

			{/* Бар + маркер текущего значения */}
			<div className="relative mt-1 mb-5">
				<div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden">
					<div
						className="bg-white h-2.5 rounded-full transition-all"
						style={{ width: `${percentage}%` }}
					/>
				</div>

				{/* Маркер текущего значения */}
				<div
					className="absolute -top-4 -translate-x-1/2 flex flex-col items-center pointer-events-none"
					style={{ left: `${percentage}%` }}
				>
					<span className="text-xs font-semibold text-white whitespace-nowrap bg-black/40 px-1.5 rounded">
						{label ?? current}
					</span>
				</div>
			</div>
		</div>
	);
};

const formatDate = (iso: string | null | undefined) => {
	if (!iso) return "—";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleDateString("ru-RU", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
};

export default function ProfileCard({ profile }: ProfileCardProps) {
	const { common, bestSport } = profile;
	const otherSports = Array.isArray(profile.otherSports) ? profile.otherSports : [];

	const fullName =
		[common.name, common.surname].filter(Boolean).join(" ") || null;
	
	const pluralYears = (age: number): string => {
		const abs = Math.abs(Math.trunc(age));
		const mod10 = abs % 10;
		const mod100 = abs % 100;

		if (mod100 >= 11 && mod100 <= 14) return "лет";
		if (mod10 === 1) return "год";
		if (mod10 >= 2 && mod10 <= 4) return "года";
		return "лет";
	}

	return (
		<div className="w-full rounded-[10px] bg-white/50 p-8 relative text-slate-800 shadow-xl">
			{/* Шапка */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-300 pb-6">
				<div>
					<h1 className="text-[32px] font-semibold text-slate-900">
						{fullName ?? common.nickname}
					</h1>
					{fullName && (
						<p className="text-slate-800 text-lg">@{common.nickname}</p>
					)}
					<div className="flex flex-wrap gap-3 mt-4">
						<span className="px-4 py-1.5 rounded-full border border-slate-400 text-sm text-slate-700 bg-white/50">
							Возраст: {common.age} {pluralYears(common.age)}
						</span>
						{common.registrationDate && (
							<span className="px-4 py-1.5 rounded-full border border-slate-400 text-sm text-slate-700 bg-white/50">
								На платформе с {formatDate(common.registrationDate)}
							</span>
						)}
					</div>
				</div>
			</div>

			{/* Основной контент: 2 колонки */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* Левая колонка — Лучший спорт */}
				<div className="lg:col-span-6 bg-gradient-to-b from-[#6B0F0F] to-[#3A0505] rounded-[20px] p-6 border border-red-900/50 shadow-lg flex flex-col">
					{bestSport ? (
						<>
							<h2 className="text-xl text-white/80 mb-1">Лучший спорт</h2>
							<p className="text-2xl font-bold mb-6 text-white">
								{bestSport.sportName || "—"}
							</p>

							<div className="w-full text-center space-y-2 mb-6">
								<p className="text-white/70">
									Ранг:{" "}
									<span className="text-white font-semibold">
										{bestSport.rank.name} {bestSport.rank.tier}
									</span>
								</p>
								<p className="text-white/70">
									({bestSport.score} / {bestSport.nextRankScore})
								</p>
								<p className="text-white/70">
									Диапазон ранга: {bestSport.rank.scoreMin}–{bestSport.rank.scoreMax}
								</p>
								<p className="text-white/70">
									Глобальный рейтинг:{" "}
									<span className="text-white font-semibold">
										#{bestSport.leaderboardPlace}
									</span>
								</p>
							</div>

							<div className="w-full mb-6">
								<ProgressBar
									current={bestSport.score}
									min={bestSport.rank.scoreMin}
									max={bestSport.rank.scoreMax}
								/>
								<div className="flex justify-between text-xs text-white/60 mt-1">
									<span>Текущий счёт</span>
									<span>
										До следующего ранга:{" "}
										{Math.max(0, bestSport.nextRankScore - bestSport.score)} очк.
									</span>
								</div>
							</div>

							<div className="w-full bg-black/30 rounded-xl p-4 mt-auto space-y-2">
								<div className="flex justify-between">
									<span className="text-sm text-white/60">Всего побед:</span>
									<span className="font-bold text-white">{bestSport.wins}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-white/60">Win Rate:</span>
									<span className="font-bold text-white">
										{bestSport.winRatePercent}%
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-white/60">Место в рейтинге:</span>
									<span className="font-bold text-white">
										#{bestSport.leaderboardPlace}
									</span>
								</div>
							</div>
						</>
					) : (
						<div className="flex-1 flex items-center justify-center text-white/60">
							Пока нет данных о лучшем спорте
						</div>
					)}
				</div>

				{/* Правая колонка — Другие виды спорта */}
				<div className="lg:col-span-6 space-y-4">
					<h3 className="text-slate-600 font-medium mb-2">Также играет в:</h3>

					{otherSports.map((sport) => (
						<div
							key={sport.sportId}
							className="bg-[#1D2C4D] rounded-2xl p-4 flex items-center gap-4 border border-slate-700 relative overflow-hidden shadow-md"
						>
							<div className="absolute left-0 top-0 bottom-0 w-2 bg-purple-500" />

							<div className="flex-1 ml-3">
								<div className="flex justify-between text-sm mb-1 text-white gap-3">
									<span>
										{sport.sportName || "—"} — {sport.rank.name}{" "}
										{sport.rank.tier}
									</span>
								</div>
								<ProgressBar
									current={sport.score}
									min={sport.rank.scoreMin}
									max={sport.rank.scoreMax}
								/>
								<div className="flex justify-between text-xs text-white/50 mt-2">
									<span>
										До следующего:{" "}
										{Math.max(0, sport.nextRankScore - sport.score)}
									</span>
								</div>
							</div>
						</div>
					))}

					{otherSports.length === 0 && (
						<p className="text-slate-500 text-sm italic">
							Нет данных о других видах спорта.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}