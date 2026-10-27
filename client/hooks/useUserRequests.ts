import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface UserRequestItem {
	id: string;
	title: string;
	sportName: string;
	maxPlayers: number;
	currentPlayers: number;
	eventDate: string;
	addressText: string;
	numberOfRounds: number;
	status: string;
	registrationOpen: boolean;
	latitude: number;
	longitude: number;
}

interface PagedModel<T> {
	content: T[];
	page: {
		size: number;
		number: number;
		totalElements: number;
		totalPages: number;
	};
}

interface UseUserRequestsParams {
	userId: string | undefined;
	statuses?: string[];
	page?: number;
	forOrganizer?: boolean;
	enabled?: boolean;
}

const EMPTY_PAGE = {
	size: 0,
	number: 0,
	totalElements: 0,
	totalPages: 0,
};

function normalize(data: unknown): PagedModel<UserRequestItem> {
	if (Array.isArray(data)) {
		return {
			content: data as UserRequestItem[],
			page: {
				size: data.length,
				number: 0,
				totalElements: data.length,
				totalPages: data.length > 0 ? 1 : 0,
			},
		};
	}

	if (data && typeof data === "object" && "content" in data) {
		const paged = data as PagedModel<UserRequestItem>;
		return {
			content: Array.isArray(paged.content) ? paged.content : [],
			page: paged.page ?? EMPTY_PAGE,
		};
	}

	return { content: [], page: EMPTY_PAGE };
}

export function useUserRequests({
	userId,
	statuses,
	page = 0,
	forOrganizer = true,
	enabled = true,
}: UseUserRequestsParams) {
	return useQuery({
		queryKey: ["user-requests", userId, { statuses, page, forOrganizer }],
		queryFn: async (): Promise<PagedModel<UserRequestItem>> => {
			if (!userId) return { content: [], page: EMPTY_PAGE };

			const params = new URLSearchParams();
			params.set("page", String(page));
			params.set("forOrganizer", String(forOrganizer));
			statuses?.forEach((status) => params.append("statuses", status));

			const data = await api.get<unknown>(
				`users/${userId}/requests?${params.toString()}`
			);

			return normalize(data);
		},
		enabled: !!userId && enabled,
		staleTime: 30_000,
		retry: false,
	});
}