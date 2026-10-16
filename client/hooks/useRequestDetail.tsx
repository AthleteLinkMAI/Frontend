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

export interface GameResultPlayer {
	userId: string;
	outcome: "WIN" | "LOSS" | "DRAW";
	ratingChange: number;
}

export interface GameResult {
	id: string;
	activityRequestId: string;
	sportId: number;
	status: "PENDING" | "CONFIRMED" | "DISPUTED";
	createdAt: string;
	players: GameResultPlayer[];
}


export function useRequestDetail(id: string) {
	const { user } = useAuth();

	return useQuery({
		queryKey: ["request", id],
		queryFn: () => api.get<RequestDetail>(`requests/${id}`),
		enabled: !!id && !!user,
	})
}

export function useGameResult(
	id: string | undefined,
	enabled: boolean,
) {
	return useQuery({
		queryKey: ["request", id, "result"],
		queryFn: () => api.get<GameResult>(`results/by-request/${id}`),
		enabled: !!id && enabled,
		staleTime: 30_000,
		retry: (failureCount, error) => {
			// ретраим только 404 — Game Service может создать результат не сразу
			if (error instanceof ApiError && error.status === 404) {
				return failureCount < 5;
			}
			return false;
		},
		retryDelay: 2000,
	});
}