import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";

export interface RequestItem {
	id: string;
	title: string;
	sportName: string;
	maxPlayers: number;
	currentPlayers: number;
	eventDate: string;
	addressText: string;
	numberOfRounds: number;
	registrationOpen: boolean;
	latitude: number;
	longitude: number;
	status?: string;
}

export interface ActiveRequestsParams {
	sportId?: string | null;
	startDate?: string | null; // ISO без мс, "YYYY-MM-DDTHH:mm:ssZ"
	endDate?: string | null;
	radius?: number | null;
}

function getPosition(): Promise<GeolocationPosition | null> {
	return new Promise((resolve) => {
		if (typeof navigator === "undefined" || !navigator.geolocation) {
			return resolve(null);
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => resolve(pos),
			() => resolve(null),
			{ enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
		);
	});
}

function toIsoNoMs(date: Date): string {
	return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function normalizeRequests(data: unknown): RequestItem[] {
	if (!data) return [];
	if (Array.isArray(data)) return data as RequestItem[];
	if (typeof data === "object" && "content" in data) {
		const content = (data as { content: RequestItem[] }).content;
		return Array.isArray(content) ? content : [];
	}
	return [];
}

async function fetchActiveRequests(
	params: ActiveRequestsParams
): Promise<RequestItem[]> {
	let latitude = 0;
	let longitude = 0;

	try {
		const geo = await getPosition();
		if (geo) {
			latitude = geo.coords.latitude;
			longitude = geo.coords.longitude;
		}
	} catch {
		// игнорируем — работаем без геолокации
	}

	const search = new URLSearchParams({
		lat: String(latitude),
		lon: String(longitude),
	});

	// radius: null → без ограничения (не передаём)
	if (params.radius != null) {
		search.set("radius", String(params.radius));
	}

	if (params.sportId) {
		search.set("sportId", params.sportId);
	}

	if (params.startDate) {
		search.set("startDate", params.startDate);
	}

	if (params.endDate) {
		search.set("endDate", params.endDate);
	}

	const data = await api.get<unknown>(`requests?${search.toString()}`);
	return normalizeRequests(data);
}

export function useActiveRequests(params: ActiveRequestsParams = {}) {
	const { user, isLoading: isAuthLoading } = useAuth();

	return useQuery({
		queryKey: ["requests", "active", params],
		queryFn: () => fetchActiveRequests(params),
		enabled: !isAuthLoading && !!user,
		staleTime: 30_000,
		retry: false,
	});
}