// hooks/useActiveRequests.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface RequestListItem {
	id: number;
	title: string;
	eventDate: string;
	sport: { id: number; name: string };
	status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
	statusDisplay: string;
	location: string;
	currentPlayers: number;
	playersCount: number;
	personalResult?: "WIN" | "LOSS" | "DRAW" | null;
}

export function useActiveRequests(enabled: boolean) {
	return useQuery({
		queryKey: ["requests", "active"],
		queryFn: async () => {
			const data = await api.get<RequestListItem[]>("/api/requests/my");
			return data.filter((r) => r.status === "ACTIVE");
		},
		enabled,
		staleTime: 30_000,
	});
}