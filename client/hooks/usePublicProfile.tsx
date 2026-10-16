import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";

export interface PlayerSummary {
	sportsPlayed: number;
	gamesPlayed: number;
	wins: number;
	losses: number;
	draws: number;
}

export interface PublicProfileDto {
	userId: string;
	summary: PlayerSummary;
}

export function usePublicProfile(userId: string | undefined) {
	const { user } = useAuth();

	return useQuery({
		queryKey: ["public-profile", userId],
		queryFn: async () => {
			try {
				return await api.get<PublicProfileDto>(`players/${userId}`);
			} catch (err) {
				if (err instanceof ApiError && err.status === 404) {
					return null;
				}
				throw err;
			}
		},
		enabled: !!userId && !!user,
		staleTime: 60_000,
		retry: false,
	});
}