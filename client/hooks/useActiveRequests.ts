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

interface PagedResponse<T> {
	content: T[];
	page?: {
		size: number;
		number: number;
		totalElements: number;
		totalPages: number;
	};
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
		const content = (data as PagedResponse<RequestItem>).content;
		return Array.isArray(content) ? content : [];
	}
	return [];
}

async function fetchActiveRequests(): Promise<RequestItem[]> {
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

	const params = new URLSearchParams({
		lat: String(latitude),
		lon: String(longitude),
		radius: "50000000000000",
		startDate: toIsoNoMs(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
		endDate: toIsoNoMs(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)),
	});

	const data = await api.get<unknown>(`requests?${params.toString()}`);
	return normalizeRequests(data);
}

export function useActiveRequests() {
	const { user, isLoading: isAuthLoading } = useAuth();

	return useQuery({
		queryKey: ["requests", "active"],
		queryFn: fetchActiveRequests,
		enabled: !isAuthLoading && !!user,
		staleTime: 30_000,
		retry: false,
	});
}