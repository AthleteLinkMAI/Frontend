import { useInfiniteQuery } from "@tanstack/react-query";
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
	forOrganizer = true,
	enabled = true,
}: UseUserRequestsParams) {
	return useInfiniteQuery({
		queryKey: ["user-requests", userId, { statuses, forOrganizer }],
		initialPageParam: 0,
		queryFn: async ({ pageParam }): Promise<PagedModel<UserRequestItem>> => {
			if (!userId) return { content: [], page: EMPTY_PAGE };

			const params = new URLSearchParams();
			params.set("page", String(pageParam));
			params.set("forOrganizer", String(forOrganizer));
			statuses?.forEach((status) => params.append("statuses", status));

			const data = await api.get<unknown>(
				`requests/users/${userId}?${params.toString()}`
			);

			return normalize(data);
		},
		// есть ли следующая страница
		getNextPageParam: (lastPage) => {
			const { number, totalPages } = lastPage.page;
			return number + 1 < totalPages ? number + 1 : undefined;
		},
		enabled: !!userId && enabled,
		staleTime: 30_000,
		retry: false,
	});
}