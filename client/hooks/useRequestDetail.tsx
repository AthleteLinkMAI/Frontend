import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/apiClient";
import { useAuth } from "./useAuth";


export interface Participant {
	userId: string;
	role: "ORGANIZER" | "PLAYER";
	status: "PENDING" | "ACCEPTED" | "KICKED" | "LEFT";
	joinedAt: string;
}

export type RequestStatus =
	| "PLANNED"
	| "ACTIVE"
	| "CONFIRMATION"
	| "COMPLETED"
	| "CANCELLED"
	| "FROZEN";

export interface RequestDetail {
	id: string;
	title: string;
	description: string;
	sportName: string;
	maxPlayers: number;
	currentPlayers: number;
	eventDate: string;
	addressText: string;
	numberOfRounds: number;
	latitude: number;
	longitude: number;
	status: RequestStatus;
	registrationOpen: boolean;
	organizerId: string;
	participants: Participant[];
}

export type GameResultStatus = "PENDING" | "CONFIRMED" | "DISPUTED";
export type GameOutcome = "WIN" | "LOSS" | "DRAW";

export interface PlayerResultDto {
	userId: string;
	outcome: GameOutcome;
	ratingChange: number | null;
}

export interface RoundResultDetailsDto {
	id: string;
	activityRequestId: string;
	roundNumber: number;
	sportId: number;
	status: GameResultStatus;
	createdAt: string;
	players: PlayerResultDto[];
}

export function useRequestDetail(id: string) {
	const { user } = useAuth();

	return useQuery({
		queryKey: ["request", id],
		queryFn: () => api.get<RequestDetail>(`requests/${id}`),
		enabled: !!id && !!user,
	})
}

export function useGameResult(id: string | undefined, enabled: boolean) {
	return useQuery({
		queryKey: ["request", id, "result"],
		queryFn: async (): Promise<RoundResultDetailsDto[]> => {
			const data = await api.get<RoundResultDetailsDto[] | null>(
				`results/by-request/${id}`
			);
			if (!data) return [];
			return data
				.slice()
				.sort((a, b) => a.roundNumber - b.roundNumber)
				.map((r) => ({ ...r, players: r.players ?? [] }));
		},
		enabled: !!id && enabled,
		staleTime: 30_000,
		retry: (failureCount, error) => {
			// 404 — результата ещё нет, ретраим
			if (error instanceof ApiError && error.status === 404) {
				return failureCount < 5;
			}
			return false;
		},
		retryDelay: 2000,
	});
}