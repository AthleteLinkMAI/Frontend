let ymapsPromise: Promise<any> | null = null;

export function loadYmaps(): Promise<any> {
	if (ymapsPromise) return ymapsPromise;

	ymapsPromise = new Promise((resolve, reject) => {
		if ((window as any).ymaps) {
			(window as any).ymaps.ready(() => resolve((window as any).ymaps));
			return;
		}

		const apiKey = import.meta.env.VITE_API_KEY_YANDEX_MAP;
		if (!apiKey) {
			reject(new Error("VITE_API_KEY_YANDEX_MAP не задан"));
			return;
		}

		const script = document.createElement("script");
		script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
		script.async = true;

		script.onload = () => {
			if (!(window as any).ymaps) {
				reject(new Error("ymaps не появился после загрузки скрипта"));
				return;
			}
			(window as any).ymaps.ready(() => resolve((window as any).ymaps));
		};
		script.onerror = () => reject(new Error("Не удалось загрузить Yandex Maps"));

		document.head.appendChild(script);
	});

	return ymapsPromise;
}

export async function reverseGeocode(coords: number[]): Promise<string | null> {
	const ymaps = await loadYmaps();
	const res = await ymaps.geocode(coords, { results: 1 });
	const place = res.geoObjects.get(0);
	if (!place) return null;

	// Same format as before: "Тверская улица, д. 7, г. Москва"
	const street = place.getThoroughfare();
	const house = place.getPremiseNumber();
	const city = place.getLocalities()?.[0];
	const parts = [street, house && `д. ${house}`, city && `г. ${city}`].filter(Boolean);
	return parts.length ? parts.join(", ") : place.getAddressLine();
}