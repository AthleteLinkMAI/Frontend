import { useEffect, useRef } from "react";
import { loadYmaps } from "@/lib/yandexMaps";

interface DisplayMapProps {
	latitude: number;
	longitude: number;
	address: string;
	height?: string;
}

export default function DisplayMap({
	latitude,
	longitude,
	address,
	height = "327px",
}: DisplayMapProps) {
	const mapContainer = useRef<HTMLDivElement>(null);
	const mapInstance = useRef<any>(null);
	const placemarkRef = useRef<any>(null);

	useEffect(() => {
		let cancelled = false;

		loadYmaps()
			.then((ymaps) => {
				if (cancelled || !mapContainer.current || mapInstance.current) return;

				const map = new ymaps.Map(mapContainer.current, {
					center: [latitude, longitude],
					zoom: 17,
					controls: ["zoomControl", "fullscreenControl"],
				});

				const placemark = new ymaps.Placemark(
					[latitude, longitude],
					{
						balloonContentHeader: "Место события",
						balloonContentBody: address,
						balloonContentFooter: `Координаты: ${latitude}, ${longitude}`,
					},
					{ preset: "islands#blueDotIcon" }
				);

				map.geoObjects.add(placemark);
				placemark.balloon.open();

				mapInstance.current = map;
				placemarkRef.current = placemark;
			})
			.catch((e) => console.error(e));

		return () => {
			cancelled = true;
			if (mapInstance.current) {
				mapInstance.current.destroy();
				mapInstance.current = null;
			}
			placemarkRef.current = null;
		};
	}, []);

	// обновление координат без пересоздания карты
	useEffect(() => {
		if (!mapInstance.current) return;
		const ymaps = (window as any).ymaps;
		if (!ymaps) return;

		mapInstance.current.setCenter([latitude, longitude], 17, { duration: 200 });

		if (placemarkRef.current) {
			placemarkRef.current.geometry.setCoordinates([latitude, longitude]);
			placemarkRef.current.properties.set({
				balloonContentBody: address,
				balloonContentFooter: `Координаты: ${latitude}, ${longitude}`,
			});
		} else {
			const placemark = new ymaps.Placemark(
				[latitude, longitude],
				{
					balloonContentHeader: "Место события",
					balloonContentBody: address,
					balloonContentFooter: `Координаты: ${latitude}, ${longitude}`,
				},
				{ preset: "islands#blueDotIcon" }
			);
			mapInstance.current.geoObjects.add(placemark);
			placemarkRef.current = placemark;
		}
	}, [latitude, longitude, address]);

	return (
		<div
			ref={mapContainer}
			style={{ width: "100%", height, borderRadius: "40px", overflow: "hidden" }}
		/>
	);
}