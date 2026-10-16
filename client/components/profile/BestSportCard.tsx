import type { BestSportCard as BestSportCardDto } from "@/types/playerStats";
import {
	RANK_STYLES,
	detectTierFromImage,
	getRomanNumeral,
} from "@/lib/profileStats";

interface Props {
	card: BestSportCardDto | null;
}

export default function BestSportCard({ card }: Props) {
	const rankName = card?.rank_info?.rank_name ?? "Искра I";
	const rankImage = card?.rank_info?.rank_image ?? null;
	const tier = detectTierFromImage(rankImage);
	const style = RANK_STYLES[tier];

	return (
		<div
			className="relative rounded-[55px] border-[1.5px] border-black shadow-[0_14px_4px_0_rgba(0,0,0,0.50)] p-6 flex flex-col items-center overflow-visible"
			style={{
				background: `linear-gradient(90deg, ${style.from} 0%, ${style.to} 100%)`,
			}}
		>
			{rankImage && (
				<div className="absolute -top-24 right-6 rotate-[10deg]">
					<img
						src={rankImage}
						alt={rankName}
						className="w-[299px] h-[298px] object-contain"
					/>
				</div>
			)}

			<div
				className="mt-24 text-[100px] font-bold leading-none"
				style={{
					color: style.text,
					WebkitTextStroke: "3px black",
					textShadow: "0 10px 4px rgba(0,0,0,0.50)",
					fontFamily: "Piazzolla, serif",
				}}
			>
				{getRomanNumeral(rankName)}
			</div>

			<h3 className="text-white text-[32px] font-light text-center mt-8">
				Ваш лучший спорт: {card?.sport_name ?? "Не определен"}
			</h3>

			<p className="text-white text-xl text-center mt-4">
				Ранг: {rankName} ({card?.rating ?? 0} очков)
				<br />
				Позиция в рейтинге: {card?.position_in_sport ?? "-"}
			</p>

			<p className="text-white text-xl text-center mt-4">
				Всего побед: {card?.wins ?? 0}
				<br />
				Win Rate: {card?.win_rate ?? 0}%
			</p>
		</div>
	);
}