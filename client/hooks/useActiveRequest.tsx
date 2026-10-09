// hooks/useActiveRequests.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface RequestListItem {
	id: number;
	title: string;
	sportName: string;
	maxPlayers: number;
	currentPlayers: number;
	eventDate: string;
	addressText: string;
	numberOfRounds: number;
	registrationOpened: boolean;
	latitude: number;
	longitude: number;
}

export function useActiveRequests(enabled: boolean) {
	return useQuery({
		queryKey: ["requests", "active"],
		queryFn: async () => {
			//TODO: доделать у бека
			const data = await api.get<RequestListItem[]>("/api/requests/my");
			return data;
		},
		enabled,
		staleTime: 30_000,
	});
}