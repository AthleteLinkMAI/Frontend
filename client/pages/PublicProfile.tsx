import { useParams } from "react-router-dom";
import HeaderMenu from "@/components/HeaderMenu";
import {
	usePublicProfile,
	type PublicProfileDto,
} from "@/hooks/usePublicProfile";

const STAT_LABELS: Record<keyof PublicProfileDto["summary"], string> = {
	sportsPlayed: "Видов спорта",
	gamesPlayed: "Всего игр",
	wins: "Побед",
	losses: "Поражений",
	draws: "Ничьих",
};

export default function PublicProfile() {
	const { userId } = useParams<{ userId: string }>();
	const {
		data: profile,
		isLoading,
		isError,
	} = usePublicProfile(userId);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] flex items-center justify-center">
				<p className="text-white text-2xl">Загрузка профиля...</p>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] flex items-center justify-center">
				<p className="text-red-400 text-2xl">Ошибка загрузки профиля.</p>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] flex items-center justify-center">
				<p className="text-white text-2xl">Профиль не найден.</p>
			</div>
		);
	}

	const { summary } = profile;

	return (
		<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
			<div className="p-7 pb-0">
				<HeaderMenu />
			</div>

			<div className="max-w-[1280px] mx-auto px-9 py-6">
				<div className="rounded-[10px] bg-[#797777]/50 p-8 relative min-h-[932px]">
					{/* Декоративная шапка */}
					<div
						className="absolute top-0 left-0 right-0 h-[88px] rounded-t-[10px]"
						style={{
							background:
								"linear-gradient(90deg, #878DB3 0%, rgba(0, 26, 255, 0.31) 100%)",
							opacity: 0.5,
						}}
					/>

					<div className="relative z-10">
						<h1 className="text-white text-[36px] font-light mb-2">
							Профиль игрока
						</h1>
						<p className="text-white/60 text-base mb-10">
							Сводная статистика по всем видам спорта
						</p>

						<SummaryGrid summary={summary} />
					</div>
				</div>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Сводка                                                             */
/* ------------------------------------------------------------------ */

interface SummaryGridProps {
	summary: PublicProfileDto["summary"];
}

function SummaryGrid({ summary }: SummaryGridProps) {
	const winRate =
		summary.gamesPlayed > 0
			? Math.round((summary.wins / summary.gamesPlayed) * 100)
			: 0;

	return (
		<div className="space-y-8">
			{/* 5 счётчиков */}
			<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
				{(Object.keys(STAT_LABELS) as Array<keyof typeof STAT_LABELS>).map(
					(key) => (
						<StatCard
							key={key}
							label={STAT_LABELS[key]}
							value={summary[key]}
						/>
					),
				)}
			</div>

			{/* Win Rate — отдельно, потому что это производная величина */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="rounded-[20px] border-[1.5px] border-black bg-gradient-to-r from-[#0E6C5C] to-[#12A08B] p-6 text-center">
					<p className="text-white/80 text-lg mb-2">Win Rate</p>
					<p className="text-white text-[48px] font-bold leading-none">
						{winRate}%
					</p>
				</div>

				<div className="rounded-[20px] border-[1.5px] border-black bg-gradient-to-r from-[#4F0A0A] to-[#780000] p-6 text-center">
					<p className="text-white/80 text-lg mb-2">
						Соотношение побед / поражений
					</p>
					<p className="text-white text-[48px] font-bold leading-none">
						{summary.wins} / {summary.losses}
					</p>
				</div>
			</div>
		</div>
	);
}

interface StatCardProps {
	label: string;
	value: number;
}

function StatCard({ label, value }: StatCardProps) {
	return (
		<div className="rounded-[20px] border-[1.5px] border-black bg-[#1D2C4D] px-4 py-6 text-center">
			<p className="text-white/60 text-sm mb-2">{label}</p>
			<p className="text-white text-[36px] font-light leading-none">
				{value}
			</p>
		</div>
	);
}