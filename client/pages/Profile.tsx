import { usePublicProfile } from "@/hooks/usePublicProfile"
import HeaderMenu from "@/components/HeaderMenu";
import SidebarNav from "@/components/SidebarMenu";
import { useAuth } from "@/hooks/useAuth";
import ProfileCard from "@/components/ProfileCard";


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