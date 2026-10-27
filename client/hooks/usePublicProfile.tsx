import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient"; // Путь к вашему apiClient
import HeaderMenu from "@/components/HeaderMenu";
import { requestResultForPlayer } from "@/constants/requestResult";

// ------------------------------------------------------------------
// 1. Типы данных на основе рукописных записей
// ------------------------------------------------------------------

export interface CommonStatsDto {
	username: string;
	age: number;
}

export interface BestSportDto {
	sportName: string;
	rank: string;
	ratePoints: number;
	maxRatePoints: number;
	globalRates: number;
	wins: number;
	winRate: number;
}

export interface OtherSportDto {
	sportName: string;
	ratePoints: number;
	maxRatePoints: number;
	rank: string;
}

export interface LastGamePlayerDto {
	userId: string;
	username: string;
}

export interface LastGameDto {
	gameName: string;
	sportName: string;
	dateGame: string;
	result: requestResultForPlayer;
	players: LastGamePlayerDto[];
}

export function usePublicProfile(userId: string | undefined) {
	return useQuery({
		queryKey: ["public-profile", userId],
		queryFn: async () => {
			userId = "1";
			if (!userId) throw new Error("No userId");

			const [common, bestSport, otherSports, lastGame] = await Promise.all([
				api.get<CommonStatsDto>(`stats/user?userId=${userId}`),
				api.get<BestSportDto>(`stats/best-sport?userId=${userId}`),
				api.get<OtherSportDto[]>(`stats/other-sports?userId=${userId}`),
				api.get<LastGameDto>(`stats/last-game?userId=${userId}`).catch(() => null), // Игра может отсутствовать
			]);

			return { common, bestSport, otherSports, lastGame };
		},
		// enabled: !!userId,
		enabled: true,
		staleTime: 1000 * 60 * 5,
	});
}
