import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import type { PlayerStatsDto } from "@/types/playerStats";

export function usePlayerStats() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["player-stats", user?.username],
		queryFn: () => api.get<PlayerStatsDto>(`players/${user.id}`),
		enabled: !!user,
		staleTime: 60_000,
	});
}