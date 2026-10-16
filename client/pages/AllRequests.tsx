import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import HeaderMenu from "@/components/HeaderMenu";
import { useAuth } from "@/hooks/useAuth";
import { useActiveRequests, RequestItem } from "@/hooks/useActiveRequests";
import { DATE_FILTERS } from "@/constants/filterConstants";


export default function AllRequests() {
	const navigate = useNavigate();
	const { user, isLoading: isAuthLoading } = useAuth();

	const [sportFilter, setSportFilter] = useState("Все виды спорта");
	const [dateFilter, setDateFilter] = useState("За все время");

	const [showSportDropdown, setShowSportDropdown] = useState(false);
	const [showDateDropdown, setShowDateDropdown] = useState(false);
	const sportDropdownRef = useRef<HTMLDivElement>(null);
	const dateDropdownRef = useRef<HTMLDivElement>(null);

	const {
		data: requests = [],
		isLoading: isRequestLoading,
		error,
	} = useActiveRequests();

	const availableSportOptions = useMemo(() => {
		const uniqueSports = new Set(
			requests.map(request => request.sportName)
		);

		const options = ["Все виды спорта", ...Array.from(uniqueSports)];
		if (!options.includes(sportFilter)) {
			setSportFilter("Все виды спорта");
		}
		return options;
	}, [requests, sportFilter]);

	// Если выбранного вида спорта больше нет в списке — сбрасываем
	useEffect(() => {
		if (!availableSportOptions.includes(sportFilter)) {
			setSportFilter("Все виды спорта");
		}
	}, [availableSportOptions, sportFilter]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
		if (sportDropdownRef.current && !sportDropdownRef.current.contains(event.target as Node)) {
			setShowSportDropdown(false);
		}
		if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
			setShowDateDropdown(false);
		}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const filteredRequests = useMemo(() => {
		let currentRequests = requests;
		if (sportFilter !== "Все виды спорта") {
			currentRequests = currentRequests.filter(
				(request) => request.sportName === sportFilter
			);
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const startOfWeek = new Date(today);
		const dayOfWeek = today.getDay();
		const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
		startOfWeek.setDate(today.getDate() + diffToMonday);
		startOfWeek.setHours(0, 0, 0, 0);

		const endOfWeek = new Date(startOfWeek);
		endOfWeek.setDate(startOfWeek.getDate() + 6);
		endOfWeek.setHours(23, 59, 59, 999);

		const startOfNextWeek = new Date(endOfWeek);
		startOfNextWeek.setDate(endOfWeek.getDate() + 1);
		startOfNextWeek.setHours(0, 0, 0, 0);

		const endOfNextWeek = new Date(startOfNextWeek);
		endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
		endOfNextWeek.setHours(23, 59, 59, 999);

		const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		startOfMonth.setHours(0, 0, 0, 0);

		const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
		endOfMonth.setHours(23, 59, 59, 999);

		const byDateAsc = (a: RequestItem, b: RequestItem) =>
			new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();

		switch (dateFilter) {
			case "За все время":
				return [...currentRequests].sort(byDateAsc);

			case "Сегодня":
				return currentRequests
					.filter((r) => {
						const d = new Date(r.eventDate);
						d.setHours(0, 0, 0, 0);
						return d.getTime() === today.getTime();
					})
					.sort(byDateAsc);

			case "Завтра":
				return currentRequests
					.filter((r) => {
						const d = new Date(r.eventDate);
						d.setHours(0, 0, 0, 0);
						return d.getTime() === tomorrow.getTime();
					})
					.sort(byDateAsc);

			case "На этой неделе":
				return currentRequests
					.filter((r) => {
						const d = new Date(r.eventDate);
						return d >= startOfWeek && d <= endOfWeek;
					})
					.sort(byDateAsc);

			case "На следующей неделе":
				return currentRequests
					.filter((r) => {
						const d = new Date(r.eventDate);
						return d >= startOfNextWeek && d <= endOfNextWeek;
					})
					.sort(byDateAsc);

			case "В этом месяце":
				return currentRequests
					.filter((r) => {
						const d = new Date(r.eventDate);
						return d >= startOfMonth && d <= endOfMonth;
					})
					.sort(byDateAsc);

			default:
				return [...currentRequests].sort(byDateAsc);
		}
	}, [requests, sportFilter, dateFilter]);



	const formatDateTime = (isoString: string) => {
		try {
			const date = new Date(isoString);
			const day = String(date.getDate()).padStart(2, '0');
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const year = date.getFullYear();
			const hours = String(date.getHours()).padStart(2, '0');
			const minutes = String(date.getMinutes()).padStart(2, '0');
			return `${day}.${month}.${year}, ${hours}:${minutes}`;
		} catch {
			return isoString;
		}
	};

	if (isAuthLoading) {
		return <div className="text-white text-center p-10">Загрузка профиля...</div>;
	}
	
	return (
		<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
			<div className="flex min-h-screen">
				<div className="flex-1 p-7 overflow-y-auto">
				
					<HeaderMenu />

					{/* Main Content Area */}
					<div className="rounded-[10px] bg-[#797777]/50 p-8 min-h-[918px]">
						{/* Title and Filters */}
						<div className="flex items-center justify-between mb-8">
							<h1 className="text-white text-[50px] font-light">Заявки</h1>

							<div className="flex gap-4">
								{/* Sport Filter */}
								<div className="relative" ref={sportDropdownRef}>
								<button
									onClick={() => setShowSportDropdown(!showSportDropdown)}
									className="w-[380px] h-[76px] rounded-[20px] border-[2.6px] border-black bg-[#D9D9D9]/40 flex items-center justify-center px-6 relative"
								>
									<svg
									className="absolute left-6"
									width="29"
									height="2"
									viewBox="0 0 29 2"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									>
									<line
										y1="1"
										x2="29"
										y2="1"
										stroke="#9D9D9D"
										strokeWidth="2"
									/>
									</svg>
									<svg
									className="absolute left-[62px]"
									width="29"
									height="2"
									viewBox="0 0 29 2"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									>
									<line
										y1="1"
										x2="29"
										y2="1"
										stroke="#9D9D9D"
										strokeWidth="2"
									/>
									</svg>
									<span className="text-white text-[32px] font-light">
									{sportFilter}
									</span>
								</button>

								{/* Sport Dropdown Menu */}
								{showSportDropdown && (
									<div className="absolute top-[88px] left-0 w-[380px] bg-[#2a2a2a] border-[2.6px] border-black rounded-[20px] shadow-lg z-50">
									{availableSportOptions.map((sport) => (
										<button
										key={sport}
										onClick={() => {
											setSportFilter(sport);
											setShowSportDropdown(false);
										}}
										className="w-full px-6 py-4 text-left text-white text-[20px] font-light hover:bg-[#3a3a3a] transition-colors first:rounded-t-[16px] last:rounded-b-[16px] border-b border-white/20 last:border-b-0"
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
									onClick={() => setShowDateDropdown(!showDateDropdown)}
									className="w-[380px] h-[76px] rounded-[20px] border-[2.6px] border-black bg-[#D9D9D9]/40 flex items-center justify-center px-6 relative"
								>
									<svg
									className="absolute left-6"
									width="29"
									height="2"
									viewBox="0 0 29 2"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									>
									<line
										y1="1"
										x2="29"
										y2="1"
										stroke="#9D9D9D"
										strokeWidth="2"
									/>
									</svg>
									<svg
									className="absolute left-[62px]"
									width="29"
									height="2"
									viewBox="0 0 29 2"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									>
									<line
										y1="1"
										x2="29"
										y2="1"
										stroke="#9D9D9D"
										strokeWidth="2"
									/>
									</svg>
									<span className="text-white text-[32px] font-light">
									{dateFilter}
									</span>
								</button>

								{/* Date Dropdown Menu */}
								{showDateDropdown && (
									<div className="absolute top-[88px] left-0 w-[380px] bg-[#2a2a2a] border-[2.6px] border-black rounded-[20px] shadow-lg z-50">
									{DATE_FILTERS.map((date) => (
										<button
										key={date}
										onClick={() => {
											setDateFilter(date);
											setShowDateDropdown(false);
										}}
										className="w-full px-6 py-4 text-left text-white text-[20px] font-light hover:bg-[#3a3a3a] transition-colors first:rounded-t-[16px] last:rounded-b-[16px] border-b border-white/20 last:border-b-0"
										>
										{date}
										</button>
									))}
									</div>
								)}
								</div>
							</div>
						</div>
							
						{isRequestLoading && (
							<div className="text-white text-center text-3xl py-10">
								Загрузка...
							</div>
						)}

						{error && (
							<div className="text-red-400 text-center text-3xl py-10">
								Ошибка загрузки: {String(error)}
							</div>
						)}
						
						{!isRequestLoading && !error && filteredRequests.length === 0 && (
							<div className="text-white text-center text-3xl py-10">
								Нет запланированных заявок, соответствующих текущим фильтрам.
							</div>
						)}

						{/* Requests List */}
						<div className="space-y-0 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent hover:scrollbar-thumb-white/50">
						{filteredRequests.map((request) => (
							<div
							key={request.id}
							className="border-[0.5px] border-white rounded-[30px] px-6 py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between transition-colors hover:bg-white/10"
							>
								{/* Left Side - Event Info */}
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
										Активна
									</p>
								</div>

								{/* Right Side - Details */}
								<div className="flex items-center gap-3">
									{/* Venue */}
									<div className="border border-white rounded-[50px] px-4 py-1.5 min-w-[226px] text-center">
										<span className="text-white text-[15px] font-light text-right">
											{request.addressText}
										</span>
									</div>

									{/* Date/Time */}
									<div className="border border-white rounded-[50px] px-4 py-1.5 min-w-[165px] text-center">
										<span className="text-white text-base font-light text-right">
											{formatDateTime(request.eventDate)}
										</span>
									</div>

									{/* Players */}
									<div className="border border-white rounded-[50px] px-4 py-1.5 min-w-[165px] text-center">
										<span className="text-white text-[15px] font-light text-right">
											Игроков: {request.maxPlayers}
										</span>
									</div>

									{/* Average Rating */}
									{/* <div className="border border-white rounded-[50px] px-4 py-1.5 min-w-[167px] text-center">
										<span className="text-white text-[15px] font-light text-right">
											{formatRating(request.avgRating)}
										</span>
									</div> */}

									{/* Sport Type */}
									<div className="border border-white rounded-[50px] px-4 py-1.5 min-w-[106px] text-center">
										<span className="text-white text-[15px] font-light">
											{request.sportName}
										</span>
									</div>
								</div>
							</div>
						))}
						</div>

						{/* Create Request Button */}
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
