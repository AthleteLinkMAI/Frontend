import { useEffect, useRef } from "react";

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

  useEffect(() => {
    const loadYandexMaps = () => {
      if ((window as any).ymaps) {
        (window as any).ymaps.ready(initializeMap);
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://api-maps.yandex.ru/2.1/?apikey=fc9d5a45-9eb0-4980-a2c8-21b53a4ddbd4&lang=ru_RU";
      script.async = true;
      script.onload = () => {
        (window as any).ymaps.ready(initializeMap);
      };
      script.onerror = () => {
        console.error("Failed to load Yandex Maps API");
      };
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapContainer.current) return;

      const ymaps = (window as any).ymaps;

      const map = new ymaps.Map(mapContainer.current, {
        center: [55.75, 37.57],
        zoom: 12,
        controls: ["zoomControl", "fullscreenControl"],
      });

      mapInstance.current = map;

      map.events.add("click", (e: any) => {
        const coords = e.get("coords");
        if (!coords) return;

        const placemark = new ymaps.Placemark(
          coords,
          {},
          {
            preset: "islands#redDotIcon",
          },
        );

        map.geoObjects.removeAll();
        map.geoObjects.add(placemark);

        const [latitude, longitude] = coords;
        const apiUrl = `/api/geocode?longitude=${longitude}&latitude=${latitude}`;

        fetch(apiUrl)
          .then((response) => {
            console.log("Geocoding response status:", response.status);
            if (!response.ok) {
              return response
                .json()
                .then((errorData) => {
                  console.error("Server error response:", errorData);
                  throw new Error(
                    `HTTP error! status: ${response.status}, message: ${errorData.error}`,
                  );
                })
                .catch(() => {
                  throw new Error(`HTTP error! status: ${response.status}`);
                });
            }
            return response.json();
          })
          .then((data) => {
            console.log("Geocoding response data:", data, longitude, latitude);
            if (data.address) {
              const fixedLatitude = parseFloat(latitude.toFixed(7));
              const fixedLongitude = parseFloat(longitude.toFixed(7));

              onAddressSelect({
                address: data.address,
                latitude: fixedLatitude,
                longitude: fixedLongitude,
              });
            } else {
              console.warn("No address found in response");
            }
          })
          .catch((error) => {
            console.error("Geocoding error:", error);
          });
      });
    };

    loadYandexMaps();
  }, [onAddressSelect]);

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
