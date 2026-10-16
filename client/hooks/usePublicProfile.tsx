// hooks/usePublicProfile.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface PublicProfileDto {
	summary: {
		sportsPlayed: number;
		gamesPlayed: number;
		wins: number;
		losses: number;
		draws: number;
	}
}

export function usePublicProfile(username: string | undefined) {
	return useQuery({
		queryKey: ["public-profile", username],
		queryFn: () => api.get<PublicProfileDto>("players"),
		enabled: !!username,
		retry: false,
	});
}