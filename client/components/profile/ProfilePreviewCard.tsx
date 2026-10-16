import type { PlayerStatsDto } from "@/types/playerStats";
import { RANK_STYLES, detectTierFromImage } from "@/lib/profileStats";

interface Props {
	stats: PlayerStatsDto;
	username?: string;
}

export default function ProfilePreviewCard({ stats, username }: Props) {
	const tier = detectTierFromImage(stats.best_sport_card?.rank_info?.rank_image);
	const style = RANK_STYLES[tier];

	return (
		<div
			className="rounded-[55px] border-[1.5px] border-black p-6"
			style={{
				background: `linear-gradient(90deg, ${style.from} 0%, ${style.to} 100%)`,
			}}
		>
			<div className="rounded-[50px] border-[3px] border-black p-4 flex items-center gap-4">
				<img
					src="/placeholder_avatar.jpg"
					alt="Profile"
					className="w-[58px] h-[58px] rounded-full object-cover"
				/>

				<div className="flex-1">
					<h4 className="text-white text-base font-bold flex items-center gap-2">
						{username || "Неизвестный"}
						{stats.best_sport_icon_url && (
							<img
								src={stats.best_sport_icon_url}
								alt=""
								className="w-5 h-5 object-contain"
							/>
						)}
					</h4>
					<p className="text-xs font-bold bg-gradient-to-b from-[#BCFFAB] via-[#F596FF] to-white bg-clip-text text-transparent">
						Уровень престижа: {stats.prestige_info?.level}
						<br />
						<span className="text-white">Рейтинг: {stats.global_rating}</span>
					</p>
				</div>

				<div className="text-white text-2xl font-bold">
					#{stats.global_rank_position}
				</div>
			</div>
		</div>
	);
}