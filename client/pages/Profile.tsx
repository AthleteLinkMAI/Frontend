import { useParams } from "react-router-dom";
import { usePublicProfile } from "@/hooks/usePublicProfile"
import HeaderMenu from "@/components/HeaderMenu";
import SidebarNav from "@/components/SidebarMenu";
import { useAuth } from "@/hooks/useAuth";
import ProfileCard from "@/components/ProfileCard";


// const SportIcon = ({ sport }: { sport: string }) => {
// 	// Здесь можно добавить логику выбора иконки в зависимости от sport
// 	return (
// 		<div className="w-12 h-12 rounded-full bg-red-900 border-2 border-red-500 flex items-center justify-center shrink-0">
// 			<span className="text-white text-xl">🏆</span>
// 		</div>
// 	);
// };

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

export default function Profile() {
	const { user } = useAuth();
	const { data: profile, isLoading, isError } = usePublicProfile(user?.id);

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
			<div className="flex min-h-screen">
				<SidebarNav activePage="profile" />


				<div className="flex-1 p-7 overflow-y-auto">
					<HeaderMenu />

					<div className="w-full max-w-[1400px] mx-auto">
						<ProfileCard 
							common={common}
							bestSport={bestSport} 
							otherSports={otherSports}
							lastGame={lastGame}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}