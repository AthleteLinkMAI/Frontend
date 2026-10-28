import { api } from "@/lib/apiClient";
import { useInfiniteQuery } from "@tanstack/react-query";


export interface RankInfo {
	name: string;
	scoreMin: number;
	scoreMax: number;
}

export interface LeaderboardEntry {
	place: number;
	userId: string;
	nickname: string;
	score: number;
	wins: number;
	losses: number;
	draws: number;
	rank: RankInfo;
}

const PAGE_SIZE = 20;

export function useLeaderboard(sportId: string | null) {
	return useInfiniteQuery({
		queryKey: ["leaderboard", sportId],
		queryFn: async ({ pageParam = 1 }) => {
			if (!sportId) return [];
			const res = await api.get<LeaderboardEntry[]>(
				`leaderboards/${sportId}/${pageParam}/${PAGE_SIZE}`
			);
			return Array.isArray(res) ? res : [];
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage || lastPage.length === 0) return [];
			return allPages.length + 1;
		},
		enabled: !!sportId,
		staleTime: 1000 * 60 * 5,
	});
}
