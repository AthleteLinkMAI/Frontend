import { useParams } from "react-router-dom";
import { usePublicProfile } from "@/hooks/usePublicProfile"
import HeaderMenu from "@/components/HeaderMenu";
import ProfileCard from "@/components/ProfileCard";


export default function PublicProfile() {
	const { userId } = useParams<{ userId: string }>();
	const { data: profile, isLoading, isError } = usePublicProfile(userId);

	return (
		<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
			<div className="flex-1 p-7 overflow-y-auto">
				<HeaderMenu />

				{isLoading && 
					<div className="flex items-center justify-center py-24">
						<p className="text-white text-2xl">Загрузка профиля...</p>
					</div>
				}

				{!isLoading && (isError || !profile) &&
					<div className="flex items-center justify-center py-24">
						<p className="text-red-400 text-2xl">Ошибка загрузки профиля.</p>
					</div>
				}

				{!isLoading && !isError && profile &&
					<div className="w-full max-w-[1400px] mx-auto">
						<ProfileCard 
							profile={profile}
						/>
					</div>
				}
			</div>
		</div>
	);
}