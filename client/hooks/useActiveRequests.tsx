// hooks/useActiveRequests.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { useAuth } from "./useAuth";

export interface RequestItem {
	id: number;
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
}

function getPosition(): Promise<GeolocationPosition | null> {
	return new Promise((resolve) => {
		if (!navigator.geolocation) return resolve(null);
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

async function fetchActiveRequests(): Promise<RequestItem[]> {
	const geo = await getPosition();
	const latitude = geo?.coords.latitude ?? 0;
	const longitude = geo?.coords.longitude ?? 0;

	const params = new URLSearchParams({
		lat: String(latitude),
		lon: String(longitude),
		radius: "50000000000000",
		startDate: toIsoNoMs(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
		endDate: toIsoNoMs(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)),
	});

	// TODO: доделать у бека — сейчас координаты часто 0,0, если нет разрешения
	const data = await api.get<RequestItem[]>(`requests?${params.toString()}`);
	console.log(data);
	return data;
}

export function useActiveRequests() {
	const { user } = useAuth();
	
	return useQuery({
		queryKey: ["requests", "active"],
		queryFn: fetchActiveRequests,
		enabled: !!user,
		staleTime: 30_000,
	});
}
