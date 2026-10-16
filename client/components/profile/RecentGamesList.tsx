import { useNavigate } from "react-router-dom";
import type { RecentGame } from "@/types/playerStats";
import { getResultColor, getResultLabel } from "@/lib/profileStats";

interface Props {
	games: RecentGame[];
}

export default function RecentGamesList({ games }: Props) {
	const navigate = useNavigate();

	return (
		<div className="rounded-[55px] border-[3px] border-black bg-[#4986F9]/40 shadow-[0_14px_4px_0_rgba(0,0,0,0.50)] p-6">
			<h3 className="text-black text-[30px] text-center mb-6">
				Последние игры ({games.length})
			</h3>

			<div className="space-y-4">
				{games.map((game) => (
					<div
						key={game.id}
						onClick={() => navigate(`/requests/${game.id}`)}
						className="border-[3px] border-black rounded-[55px] p-4 cursor-pointer hover:bg-white/20 transition-colors"
					>
						<div className="border-[3px] border-black rounded-[50px] px-4 py-3 mb-2">
							<p className="text-black text-sm font-semibold">{game.title}</p>
							<p className="text-black text-xs">
								{game.date} в {game.time} — {game.sport_name}
							</p>
						</div>
						<div
							className={`border-[3px] border-black rounded-[50px] px-4 py-3 text-center ${getResultColor(
								game.personal_result,
							)}`}
						>
							<p className="text-white text-sm font-bold">
								{getResultLabel(game.personal_result)}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}