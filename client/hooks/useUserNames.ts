import { resolveUsernames } from "@/lib/usernames";
import { useQuery } from "@tanstack/react-query";

export function useUserNames(ids: string[]) {
	const sorted = [...ids].sort();
	return useQuery({
		queryKey: ["usernames", sorted],
		queryFn: async () => (await resolveUsernames(sorted)) ?? {},
		enabled: sorted.length > 0,
		staleTime: 5 * 60_000,
	})
}