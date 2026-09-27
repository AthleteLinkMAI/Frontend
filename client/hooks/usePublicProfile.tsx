// hooks/usePublicProfile.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface PublicProfileDto {
	user_info: {
		username: string;
		formatted_name: string;
		avatar?: string;
		created_at: string;
		gender?: "male" | "female" | string;
		age?: number;
		city?: string;
	};
	best_sport: {
		sport_name: string;
		rating: number;
		wins: number;
		losses: number;
		win_rate: number;
		rank_info: {
			rank_name: string;
			rank_image: string;
			roman_numeral: string;
			progress_percent: number;
		};
	};
	other_sports: Array<{
		sport_name: string;
		rating: number;
		rank_image: string;
		roman_numeral: string;
		gradientFrom?: string;
		gradientTo?: string;
		badgeColor?: string;
	}>;
	last_game?: {
		title: string;
		date: string;
		time: string;
		sport_name: string;
		personal_result: "Win" | "Loss" | "Active";
	};
	global_stats: {
		global_win_rate: number;
		global_rank_position: number;
	};
}

export function usePublicProfile(username: string | undefined) {
	return useQuery({
		queryKey: ["public-profile", username],
		queryFn: () => api.get<PublicProfileDto>(`/api/profile/public-profile/${username}`),
		enabled: !!username,
		retry: false,
	});
}