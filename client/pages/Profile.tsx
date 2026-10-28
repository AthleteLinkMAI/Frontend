import { usePublicProfile } from "@/hooks/usePublicProfile"
import HeaderMenu from "@/components/HeaderMenu";
import SidebarNav from "@/components/SidebarMenu";
import { useAuth } from "@/hooks/useAuth";
import ProfileCard from "@/components/ProfileCard";


export default function Profile() {
	const { user, isLoading: isAuthLoading } = useAuth();
	const { data: profile, isLoading, isError } = usePublicProfile(user?.id);

	const isProfileLoading = isAuthLoading || isLoading;

	return (
		<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
			<div className="flex min-h-screen">
				<SidebarNav activePage="profile" />


				<div className="flex-1 p-7 overflow-y-auto">
					<HeaderMenu />

					{isProfileLoading && 
						<div className="flex items-center justify-center py-24">
							<p className="text-white text-2xl">Загрузка профиля...</p>
						</div>
					}

					{!isProfileLoading && (isError || !profile) &&
						<div className="flex items-center justify-center py-24">
							<p className="text-red-400 text-2xl">Ошибка загрузки профиля.</p>
						</div>
					}

					{!isProfileLoading && !isError && profile &&
						<div className="w-full max-w-[1400px] mx-auto">
							<ProfileCard 
								profile={profile}
							/>
						</div>
					}
				</div>
			</div>
		</div>
	);
}