import { useEffect, useRef } from "react";
import { loadYmaps } from "@/lib/yandexMaps";

interface MapSelectionData {
	address: string;
	latitude: number;
	longitude: number;
}

interface YandexMapProps {
	onAddressSelect: (data: MapSelectionData) => void;
	height?: string;
}

export default function YandexMap({
	onAddressSelect,
	height = "327px",
}: YandexMapProps) {
	const mapContainer = useRef<HTMLDivElement>(null);
	const mapInstance = useRef<any>(null);

	// держим актуальный колбэк в ref, чтобы не пересоздавать карту
	const onAddressSelectRef = useRef(onAddressSelect);
	useEffect(() => {
		onAddressSelectRef.current = onAddressSelect;
	}, [onAddressSelect]);

	useEffect(() => {
		let cancelled = false;

		loadYmaps()
			.then((ymaps) => {
				if (cancelled || !mapContainer.current || mapInstance.current) return;

				const map = new ymaps.Map(mapContainer.current, {
					center: [55.75, 37.57],
					zoom: 12,
					controls: ["zoomControl", "fullscreenControl"],
				});

				mapInstance.current = map;

				map.events.add("click", (e: any) => {
					const coords = e.get("coords");
					if (!coords) return;

					const placemark = new ymaps.Placemark(coords, {}, {
						preset: "islands#redDotIcon",
					});

					map.geoObjects.removeAll();
					map.geoObjects.add(placemark);

					const [latitude, longitude] = coords;

					fetch(`/api/geocode?longitude=${longitude}&latitude=${latitude}`)
						.then((response) => {
							if (!response.ok) {
								return response.json().then(
									(errorData) => {
										throw new Error(
											`HTTP ${response.status}: ${errorData?.error ?? "unknown"}`
										);
									},
									() => {
										throw new Error(`HTTP ${response.status}`);
									}
								);
							}
							return response.json();
						})
						.then((data) => {
							if (data.address) {
								onAddressSelectRef.current({
									address: data.address,
									latitude: parseFloat(latitude.toFixed(7)),
									longitude: parseFloat(longitude.toFixed(7)),
								});
							}
						})
						.catch((error) => {
							console.error("Geocoding error:", error);
						});
				});
			})
			.catch((e) => console.error(e));

		return () => {
			cancelled = true;
			if (mapInstance.current) {
				mapInstance.current.destroy();
				mapInstance.current = null;
			}
		};
	}, []); // ← пустой массив — карта создаётся один раз

	return (
		<div
			ref={mapContainer}
			style={{ width: "100%", height, borderRadius: "40px", overflow: "hidden" }}
		/>
	);
}