import { useParams } from "react-router-dom";
import { usePublicProfile } from "@/hooks/usePublicProfile"
import HeaderMenu from "@/components/HeaderMenu";
import { requestResultForPlayer } from "@/constants/requestResult";
import ProfileCard from "@/components/ProfileCard";


const ProgressBar = ({ current, max }: { current: number; max: number }) => {
	const percentage = Math.min(100, Math.max(0, (current / max) * 100));
	return (
		<div className="w-full bg-black/40 rounded-full h-2.5 mt-2 overflow-hidden">
			<div
				className="bg-white h-2.5 rounded-full"
				style={{ width: `${percentage}%` }}
			/>
		</div>
	);
};

export default function PublicProfile() {
	const { userId } = useParams<{ userId: string }>();
	const { data: profile, isLoading, isError } = usePublicProfile(userId);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-[#2C3030] flex items-center justify-center">
				<p className="text-white text-2xl">Загрузка профиля...</p>
			</div>
		);
	}

	if (isError || !profile) {
		return (
			<div className="min-h-screen bg-[#2C3030] flex items-center justify-center">
				<p className="text-red-400 text-2xl">Ошибка загрузки профиля.</p>
			</div>
		);
	}

	const { common, bestSport, otherSports, lastGame } = profile;

	return (
		<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
			<div className="flex-1 p-7 overflow-y-auto">
				<HeaderMenu />

				<div className="max-w-[1280px] mx-auto px-4 py-6">
					
					{/* Встраиваем компонент карточки */}
					<ProfileCard
						common={common}
						bestSport={bestSport}
						otherSports={otherSports}
						lastGame={lastGame}
					/>

				</div>
			</div>
		</div>
	);
}