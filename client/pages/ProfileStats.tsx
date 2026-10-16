import { useNavigate } from "react-router-dom";
import HeaderMenu from "@/components/HeaderMenu";
import SidebarNav from "@/components/SidebarMenu";
import BestSportCard from "@/components/profile/BestSportCard";
import RecentGamesList from "@/components/profile/RecentGamesList";
import ProfilePreviewCard from "@/components/profile/ProfilePreviewCard";
import PrestigeBar from "@/components/profile/PrestigeBar";
import BouncingCat from "@/components/profile/BouncingCat";
import { useAuth } from "@/hooks/useAuth";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { clamp } from "@/lib/profileStats";

export default function ProfileStats() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { data: stats, isLoading, error } = usePlayerStats();

	return (
		<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
			<div className="flex min-h-screen">
				<SidebarNav activePage="stats" />

				<div className="flex-1 p-7 overflow-y-auto">
					<HeaderMenu />

					<div className="rounded-[10px] bg-white/50 p-8 relative min-h-[850px]">
						{/* Loading / Error / Empty — ВНУТРИ layout */}
						{isLoading && (
							<div className="text-black text-2xl text-center py-20">
								Загрузка данных...
							</div>
						)}

						{!isLoading && error && (
							<div className="bg-red-100 border border-red-400 text-red-700 rounded-xl p-6 text-center">
								Ошибка загрузки статистики. Обновите страницу.
							</div>
						)}

						{!isLoading && !error && !stats && (
							<div className="text-black text-2xl text-center py-20">
								Данные статистики не найдены.
							</div>
						)}

						{!isLoading && !error && stats && (
							<StatsContent
								stats={stats}
								username={user?.username}
								onOpenPublicProfile={() =>
									navigate(`/${user?.username}/`)
								}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

interface StatsContentProps {
	stats: import("@/types/playerStats").PlayerStatsDto;
	username?: string;
	onOpenPublicProfile: () => void;
}

function StatsContent({
	stats,
	username,
	onOpenPublicProfile,
}: StatsContentProps) {
	const {
		prestige_info,
		best_sport_card,
		recent_games,
		global_rank_position,
		best_sport_icon_url,
	} = stats;

	const prestigeProgress = clamp(Number(prestige_info?.progress_percent ?? 0));

	return (
		<>
			<h2 className="text-black text-[46px] font-medium mb-4">
				Спортивный престиж
			</h2>

			<p className="text-black/80 text-base mb-6 max-w-[710px]">
				Зарабатывайте опыт в товарищеских/рейтинговых встречах, чтобы
				повышать уровень!
				<br />
				До следующего уровня престижа:
				<span className="font-bold">
					{" "}
					{prestige_info?.points_needed_next_level} очков опыта{" "}
				</span>
			</p>

			<PrestigeBar percent={prestigeProgress} level={prestige_info?.level} />

			<div className="grid grid-cols-3 gap-6 mt-20">
				<BestSportCard card={best_sport_card} />

				<RecentGamesList games={recent_games} />

				<div className="flex flex-col gap-6">
					<p className="text-black text-2xl font-medium opacity-80">
						Сейчас в рейтинге Вы выглядите так:
					</p>

					<ProfilePreviewCard stats={stats} username={username} />

					<BouncingCat />

					<button
						onClick={onOpenPublicProfile}
						className="w-full bg-[#4182F9] text-white text-sm rounded-lg px-6 py-2 drop-shadow-[0_8px_4px_rgba(0,0,0,0.50)] hover:bg-[#3671E8] transition-colors"
					>
						Как мой профиль видят другие люди?
					</button>
				</div>
			</div>
		</>
	);
}