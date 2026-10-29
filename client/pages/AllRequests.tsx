import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import HeaderMenu from "@/components/HeaderMenu";
import { useActiveRequests, RequestItem } from "@/hooks/useActiveRequests";
import { DATE_FILTERS } from "@/constants/filterConstants";
import { useSports, type Sport } from "@/hooks/useSports";

// --- Преобразование выбранного date-фильтра в { startDate, endDate } ---
function getDateRange(filter: string): { startDate: string | null; endDate: string | null } {
	const startOfDay = (d: Date) => {
		const x = new Date(d);
		x.setHours(0, 0, 0, 0);
		return x;
	};
	const endOfDay = (d: Date) => {
		const x = new Date(d);
		x.setHours(23, 59, 59, 999);
		return x;
	};
	const toIso = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");

	const today = startOfDay(new Date());

	switch (filter) {
		case "Сегодня":
			return { startDate: toIso(today), endDate: toIso(endOfDay(today)) };
		case "Завтра": {
			const t = new Date(today);
			t.setDate(t.getDate() + 1);
			return { startDate: toIso(t), endDate: toIso(endOfDay(t)) };
		}
		case "На этой неделе": {
			const day = today.getDay();
			const diff = day === 0 ? -6 : 1 - day;
			const start = new Date(today);
			start.setDate(today.getDate() + diff);
			const end = new Date(start);
			end.setDate(start.getDate() + 6);
			return { startDate: toIso(start), endDate: toIso(endOfDay(end)) };
		}
		case "На следующей неделе": {
			const day = today.getDay();
			const diff = day === 0 ? -6 : 1 - day;
			const start = new Date(today);
			start.setDate(today.getDate() + diff + 7);
			const end = new Date(start);
			end.setDate(start.getDate() + 6);
			return { startDate: toIso(start), endDate: toIso(endOfDay(end)) };
		}
		case "В этом месяце": {
			const start = new Date(today.getFullYear(), today.getMonth(), 1);
			const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
			return { startDate: toIso(start), endDate: toIso(endOfDay(end)) };
		}
		case "За все время":
		default:
			return { startDate: null, endDate: null };
	}
}

export default function AllRequests() {
	const navigate = useNavigate();

	const [sportFilter, setSportFilter] = useState("Все виды спорта");
	const [dateFilter, setDateFilter] = useState("За все время");

	const [showSportDropdown, setShowSportDropdown] = useState(false);
	const [showDateDropdown, setShowDateDropdown] = useState(false);
	const sportDropdownRef = useRef<HTMLDivElement>(null);
	const dateDropdownRef = useRef<HTMLDivElement>(null);

	// Справочник видов спорта — для сопоставления name → id
	const { data: sports = [] } = useSports();

	// ID выбранного спорта (null = все)
	const selectedSportId = useMemo(() => {
		if (sportFilter === "Все виды спорта") return null;
		return sports.find((s) => s.name === sportFilter)?.id ?? null;
	}, [sportFilter, sports]);

	// Диапазон дат для запроса
	const { startDate, endDate } = useMemo(() => getDateRange(dateFilter), [dateFilter]);

	const { data, isLoading, error } = useActiveRequests({
		sportId: selectedSportId,
		startDate,
		endDate,
		// radius не задаём — бэкенд трактует null как «без ограничения»
	});

	const requests: RequestItem[] = useMemo(
		() => (Array.isArray(data) ? data : []),
		[data]
	);

	// Опции для фильтра спорта строим по справочнику (name), а не по заявкам,
	// чтобы список не «прыгал» при подгрузке.
	const availableSportOptions = useMemo(() => {
		const names = new Set<string>();
		sports.forEach((s) => {
			if (s.name) names.add(s.name);
		});
		// на случай, если в заявках есть спорт, которого нет в справочнике
		requests.forEach((r) => {
			if (r.sportName) names.add(r.sportName);
		});
		return ["Все виды спорта", ...Array.from(names).sort()];
	}, [sports, requests]);

	useEffect(() => {
		if (!availableSportOptions.includes(sportFilter)) {
			setSportFilter("Все виды спорта");
		}
	}, [availableSportOptions, sportFilter]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				sportDropdownRef.current &&
				!sportDropdownRef.current.contains(event.target as Node)
			) {
				setShowSportDropdown(false);
			}
			if (
				dateDropdownRef.current &&
				!dateDropdownRef.current.contains(event.target as Node)
			) {
				setShowDateDropdown(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Сервер уже фильтрует по sportId/датам — клиентская фильтрация не нужна.
	const filteredRequests = requests;

	const formatDateTime = (isoString: string) => {
		try {
			const date = new Date(isoString);
			const day = String(date.getDate()).padStart(2, "0");
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const year = date.getFullYear();
			const hours = String(date.getHours()).padStart(2, "0");
			const minutes = String(date.getMinutes()).padStart(2, "0");
			return `${day}.${month}.${year}, ${hours}:${minutes}`;
		} catch {
			return isoString;
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
			<div className="flex min-h-screen">
				<div className="flex-1 p-7 overflow-y-auto">
					<HeaderMenu />

					<div className="rounded-[10px] bg-[#797777]/50 p-8 min-h-[918px]">
						<div className="flex items-center justify-between mb-8">
							<h1 className="text-white text-[50px] font-light">Заявки</h1>

							<div className="flex gap-4">
								{/* Sport Filter */}
								<div className="relative" ref={sportDropdownRef}>
									<button
										onClick={() => setShowSportDropdown((v) => !v)}
										className="w-[380px] h-[76px] rounded-[20px] border-[2.6px] border-black bg-[#D9D9D9]/40 flex items-center justify-center px-6"
									>
										<span className="text-white text-[32px] font-light">
											{sportFilter}
										</span>
									</button>

									{showSportDropdown && (
										<div className="absolute top-[88px] left-0 w-[380px] bg-[#2a2a2a] border-[2.6px] border-black rounded-[20px] shadow-lg z-50 max-h-[400px] overflow-y-auto">
											{availableSportOptions.map((sport) => (
												<button
													key={sport}
													onClick={() => {
														setSportFilter(sport);
														setShowSportDropdown(false);
													}}
													className="w-full px-6 py-4 text-left text-white text-[20px] font-light hover:bg-[#3a3a3a] transition-colors border-b border-white/20 last:border-b-0"
												>
													{sport}
												</button>
											))}
										</div>
									)}
								</div>

								{/* Date Filter */}
								<div className="relative" ref={dateDropdownRef}>
									<button
										onClick={() => setShowDateDropdown((v) => !v)}
										className="w-[380px] h-[76px] rounded-[20px] border-[2.6px] border-black bg-[#D9D9D9]/40 flex items-center justify-center px-6"
									>
										<span className="text-white text-[32px] font-light">
											{dateFilter}
										</span>
									</button>

									{showDateDropdown && (
										<div className="absolute top-[88px] left-0 w-[380px] bg-[#2a2a2a] border-[2.6px] border-black rounded-[20px] shadow-lg z-50 max-h-[400px] overflow-y-auto">
											{DATE_FILTERS.map((date) => (
												<button
													key={date}
													onClick={() => {
														setDateFilter(date);
														setShowDateDropdown(false);
													}}
													className="w-full px-6 py-4 text-left text-white text-[20px] font-light hover:bg-[#3a3a3a] transition-colors border-b border-white/20 last:border-b-0"
												>
													{date}
												</button>
											))}
										</div>
									)}
								</div>
							</div>
						</div>

						{isLoading && (
							<div className="text-white text-center text-3xl py-10">
								Загрузка...
							</div>
						)}

						{!isLoading && error && (
							<div className="text-red-400 text-center text-3xl py-10">
								Ошибка загрузки:{" "}
								{error instanceof Error ? error.message : String(error)}
							</div>
						)}

						{!isLoading && !error && filteredRequests.length === 0 && (
							<div className="text-white text-center text-3xl py-10">
								Нет запланированных заявок, соответствующих текущим фильтрам.
							</div>
						)}

						{!isLoading && !error && filteredRequests.length > 0 && (
							<div className="space-y-0 max-h-[600px] overflow-y-auto pr-2">
								{filteredRequests.map((request) => (
									<div
										key={request.id}
										className="border-[0.5px] border-white rounded-[30px] px-6 py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between transition-colors hover:bg-white/10 mb-3"
									>
										<div className="flex-1">
											<button
												onClick={() => navigate(`/requests/${request.id}`)}
												className="text-left w-full"
											>
												<h3 className="text-white text-[20px] font-light mb-1">
													{request.title}
												</h3>
											</button>
											<p className="text-white text-[15px] font-light">
												{request.status ?? "Активна"}
											</p>
										</div>

										<div className="flex items-center gap-3 flex-wrap">
											<div className="border border-white rounded-[50px] px-4 py-1.5 min-w-[226px] text-center">
												<span className="text-white text-[15px] font-light">
													{request.addressText}
												</span>
											</div>

											<div className="border border-white rounded-[50px] px-4 py-1.5 min-w-[165px] text-center">
												<span className="text-white text-base font-light">
													{formatDateTime(request.eventDate)}
												</span>
											</div>

											<div className="border border-white rounded-[50px] px-4 py-1.5 min-w-[165px] text-center">
												<span className="text-white text-[15px] font-light">
													Игроков: {request.currentPlayers}/{request.maxPlayers}
												</span>
											</div>

											<div className="border border-white rounded-[50px] px-4 py-1.5 min-w-[106px] text-center">
												<span className="text-white text-[15px] font-light">
													{request.sportName}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						)}

						<div className="flex justify-center mt-14">
							<button
								onClick={() => navigate("/requests/create")}
								className="px-8 py-3 bg-[#4182F9] rounded-[25px] text-white text-[22px] font-normal hover:bg-[#3571e8] transition-colors shadow-[0_8px_4px_rgba(0,0,0,0.5)]"
							>
								Создать заявку
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}