import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface Sport {
	id: string;
	name: string;
	minPlayers: number;
	maxPlayers: number;
	iconUrl: string;
}

export function useSports() {
	return useQuery({
		queryKey: ["sports"],
		// queryFn: () => api.get<Sport[]>("sports"),
		queryFn: () => [
			{
				id: "1",
				name: "Шахматы",
				minPlayers: 2,
				maxPlayers: 2,
				iconUrl: "check",
			},
			{
				id: "2",
				name: "Литрбол",
				minPlayers: 2,
				maxPlayers: 10,
				iconUrl: "beer",
			},
			{
				id: "3",
				name: "Футбол",
				minPlayers: 12,
				maxPlayers: 22,
				iconUrl: "ball",
			},
		],
		staleTime: 1000 * 60 * 10,
	});
}