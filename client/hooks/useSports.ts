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
		queryFn: () => api.get<Sport[]>("sports"),
		staleTime: 1000 * 60 * 10,
	});
}