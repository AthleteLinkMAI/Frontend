import { api } from "@/lib/apiClient";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useUserNames } from "./useUserNames";

export interface RankInfo {
	name: string;
	scoreMin: number;
	scoreMax: number;
}

export interface LeaderboardEntryDto {
	place: number;
	userId: string;
	score: number;
	wins: number;
	losses: number;
	draws: number;
	rank: RankInfo;
}

export interface LeaderboardEntry extends LeaderboardEntryDto {
	nickname: string;
}

const PAGE_SIZE = 20;

export function useLeaderboard(sportId: string | null) {
	const query = useInfiniteQuery({
		queryKey: ["leaderboard", sportId],
		queryFn: async ({ pageParam }) => {
			const res = await api.get<LeaderboardEntryDto[]>(
				`leaderboards/${sportId}/${pageParam}/${PAGE_SIZE}`
			);
			return Array.isArray(res) ? res : [];
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage || lastPage.length === 0) return undefined;
			if (lastPage.length < PAGE_SIZE) return undefined;
			return allPages.length + 1;
		},
		enabled: !!sportId,
		staleTime: 1000 * 60 * 5,
	});

	// Все userId со всех загруженных страниц
	const userIds = useMemo(() => {
		const set = new Set<string>();
		query.data?.pages.forEach((page) => {
			page.forEach((e) => set.add(e.userId));
		});
		return Array.from(set);
	}, [query.data]);

	// Ники
	const namesQuery = useUserNames(userIds);
	const namesById = namesQuery.data ?? {};

	// Обогащаем
	const entries: LeaderboardEntry[] = useMemo(() => {
		return (
			query.data?.pages.flatMap((page) =>
				page.map((e) => ({
					...e,
					nickname: namesById[e.userId] ?? "",
				}))
			) ?? []
		);
	}, [query.data, namesById]);

	return {
		...query,
		entries,
		isLoading: query.isLoading || (query.isSuccess && namesQuery.isLoading),
		isFetchingNextPage: query.isFetchingNextPage,
		hasNextPage: query.hasNextPage,
		fetchNextPage: query.fetchNextPage,
	};
}
