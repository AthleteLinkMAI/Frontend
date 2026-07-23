import {useEffect, useRef} from "react";

interface DisplayMapProps{
    latitude: number;
    longitude: number;
    address: string;
    height?: string;
}

export default function DisplayMap({
    latitude,
    longitude,
    address,
    height="327px",
}: DisplayMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);

    const centerCoords: [number, number] = [latitude, longitude];

    useEffect(() => {
        const loadYandexMaps = () => {
            if ((window as any).ymaps) {
                (window as any).ymaps.ready(initializeMap);
                return;
            }

            const script = document.createElement("script");
            script.src = "https://api-maps.yandex.ru/2.1/?apikey=fc9d5a45-9eb0-4980-a2c8-21b53a4ddbd4&lang=ru_RU";
            script.async = true;
            script.onload = () => {
                (window as any).ymaps.ready(initializeMap);
            };
            document.head.appendChild(script);
        };

        const initializeMap = () => {
            if(!mapContainer.current) return;

            const ymaps = (window as any).ymaps;

            const map = new ymaps.Map(mapContainer.current, {
                center: centerCoords,
                zoom: 17,
                controls: ["zoomControl", "fullscreenControl"],
            });

            const placemark = new ymaps.Placemark(
                centerCoords,
                {
                    balloonContentHeader: "Место события",
                    balloonContentBody: address,
                    balloonContentFooter: `Координаты: ${latitude}, ${longitude}`,
                },
                {
                    preset: "islands#blueDotIcon",
                }
            );
            map.geoObjects.add(placemark);
            placemark.balloon.open();
        };

        loadYandexMaps();

        return () => {

        };
    }, [latitude, longitude, address]);

    return (
        <div
            ref={mapContainer}
            style={{
                width: "100%",
                height: height,
                borderRadius: "40px",
                overflow: "hidden",
            }}
        />
    );
}