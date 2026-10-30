import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { useSports } from "@/hooks/useSports";

export interface CommonStatsDto {
	id: string;
	nickname: string;
	name: string | null;
	surname: string | null;
	age: number;
	registrationDate: string;
}

export interface BestSportDto {
	sportId: string;
	score: number;
	nextRankScore: number;
	leaderboardPlace: number;
	wins: number;
	winRatePercent: number;
	rank: { name: string; tier: number; scoreMin: number; scoreMax: number };
}

export interface OtherSportDto {
	sportId: string;
	score: number;
	nextRankScore: number;
	rank: { name: string; tier: number; scoreMin: number; scoreMax: number };
}

export type BestSportWithName = BestSportDto & { sportName: string };
export type OtherSportWithName = OtherSportDto & { sportName: string };

export interface PublicProfile {
	common: CommonStatsDto;
	bestSport: BestSportWithName | null;
	otherSports: OtherSportWithName[];
}

interface RawProfile {
	common: CommonStatsDto;
	bestSport: BestSportDto | null;
	otherSports: OtherSportDto[];
}

export function usePublicProfile(userId: string | undefined) {
	const { data: sports } = useSports();

	return useQuery({
		queryKey: ["public-profile", userId],
		queryFn: async (): Promise<RawProfile> => {
			if (!userId) throw new Error("No userId");

			const [commonArr, bestSport, otherSports] = await Promise.all([
				api.get<CommonStatsDto[]>(`user?userIds=${userId}`),
				api.get<BestSportDto>(`players/${userId}/best-sport`).catch(() => null),
				api.get<OtherSportDto[]>(`players/${userId}/other-sports`).catch(() => []),
			]);

			if (!commonArr || commonArr.length === 0) {
				throw new Error("No common data about user");
			}

			return {
				common: commonArr[0],
				bestSport: bestSport ?? null,
				otherSports: otherSports ?? [],
			};
		},
		select: (raw): PublicProfile => {
			const nameById = new Map((sports ?? []).map((s) => [s.id, s.name]));

			const enrich = <T extends { sportId: string }>(
				item: T | null
			): (T & { sportName: string }) | null =>
				item ? { ...item, sportName: nameById.get(item.sportId) ?? "" } : null;

			return {
				common: raw.common,
				bestSport: enrich(raw.bestSport),
				otherSports: raw.otherSports.map(
					(s) => ({ ...s, sportName: nameById.get(s.sportId) ?? "" })
				),
			};
		},
		enabled: !!userId,
		staleTime: 1000 * 60 * 5,
	});
}