import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import HeaderMenu from "@/components/HeaderMenu";
import { useLeaderboard, type Sport, type LeaderboardEntry, useSports } from "@/hooks/useLeaderboard";


// interface Sport {
// 	id: number;
// 	name: string;
// 	minPlayers: number;
// 	maxPlayers: number;
// 	iconUrl: string | number;
// }

// interface RankInfo {
// 	name: string;
// 	scoreMin: number;
// 	scoreMax: number;
// }

// interface LeaderboardEntry {
// 	place: number;
// 	userId: string;
// 	username: string;
// 	score: number;
// 	wins: number;
// 	losses: number;
// 	draws: number;
// 	rank: RankInfo;
// }


// const MOCK_SPORTS: Sport[] = [
// 	{ id: 1, name: "Литрбол", minPlayers: 2, maxPlayers: 10, iconUrl: 1 },
// 	{ id: 2, name: "Шахматы", minPlayers: 2, maxPlayers: 2, iconUrl: 2 },
// 	{ id: 3, name: "Футбол", minPlayers: 10, maxPlayers: 22, iconUrl: 3 },
// 	{ id: 4, name: "Баскетбол", minPlayers: 6, maxPlayers: 12, iconUrl: 4 },
// ];

// const generateMockPlayers = (sportId: number, page: number, count: number): LeaderboardEntry[] => {
// 	if (page > 3) return [];

// 	return Array.from({ length: count }).map((_, i) => {
// 		const globalIndex = (page - 1) * count + i + 1;
// 		return {
// 			place: globalIndex,
// 			userId: `user-${sportId}-${globalIndex}`,
// 			username: `Игрок_${sportId}_${globalIndex}`,
// 			score: 1500 - globalIndex * 10,
// 			wins: 10 + i,
// 			losses: 2 + i,
// 			draws: i,
// 			rank: {
// 				name: globalIndex <= 5 ? "GOLD" : globalIndex <= 15 ? "SILVER" : "BRONZE",
// 				scoreMin: 1000,
// 				scoreMax: 2000,
// 			},
// 		};
// 	});
// };

// const PAGE_SIZE = 15;


export default function Leaderboard() {
	const navigate = useNavigate();

	const { data: sports = [], isLoading: isSportsLoading } = useSports();
	const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
	const [showSportDropdown, setShowSportDropdown] = useState(false);

	const sportDropdownRef = useRef<HTMLDivElement>(null);

	// Автовыбор первого спорта
	useEffect(() => {
		if (!selectedSportId && sports.length > 0) {
			setSelectedSportId(sports[0].id);
		}
	}, [sports, selectedSportId]);

	// Закрытие дропдауна по клику вне
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				sportDropdownRef.current &&
				!sportDropdownRef.current.contains(event.target as Node)
			) {
				setShowSportDropdown(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const {
		data: leaderboardData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: isLeaderboardLoading,
	} = useLeaderboard(selectedSportId);

	// Собираем все записи из всех загруженных страниц
	const allEntries: LeaderboardEntry[] =
		leaderboardData?.pages.flatMap((page) => page ?? []) ?? [];

	const selectedSport = sports.find((s) => s.id === selectedSportId);

	// ------------------------------------------------------------------
	// Бесконечная прокрутка
	// ------------------------------------------------------------------
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);

	// IntersectionObserver для подгрузки следующей страницы
	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ root: scrollContainerRef.current, rootMargin: "200px" }
		);

		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);


	return (
		<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
			<div className="flex min-h-screen">
				<div className="flex-1 p-7">
					<HeaderMenu />

					<div className="rounded-[10px] bg-[#797777]/50 p-8 min-h-[918px] relative">
						
						{/* Заголовок + выбор спорта */}
						<div className="flex gap-4 mb-12">
							<div className="relative" ref={sportDropdownRef}>
								<button
									onClick={() => setShowSportDropdown(!showSportDropdown)}
									className="w-[380px] h-[76px] rounded-[20px] border-[2.6px] border-black bg-[#D9D9D9]/40 flex items-center justify-center px-6 relative"
								>
									<span className="text-white text-[32px] font-light">
										{selectedSport?.name ?? "Выберите спорт"}
									</span>
								</button>

								{showSportDropdown && (
									<div className="absolute top-[88px] left-0 w-[380px] bg-[#2a2a2a] border-[2.6px] border-black rounded-[20px] shadow-lg z-50 max-h-[400px] overflow-y-auto">
										{sports.map((sport) => (
											<button
												key={sport.id}
												onClick={() => {
													setSelectedSportId(sport.id);
													setShowSportDropdown(false);
												}}
												className={`w-full px-6 py-4 text-left text-white text-[20px] font-light hover:bg-[#3a3a3a] transition-colors border-b border-white/20 last:border-b-0 ${
													selectedSportId === sport.id ? "bg-[#3a3a3a]" : ""
												}`}
											>
												{sport.name}
											</button>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Список лидерборда */}
						<div
							ref={scrollContainerRef}
							className="space-y-3 pr-2 max-h-[700px] overflow-y-auto custom-scrollbar"
						>
							{isLeaderboardLoading && (
								<p className="text-white text-center py-8">Загрузка лидерборда...</p>
							)}

							{!isLeaderboardLoading && allEntries.length === 0 && (
								<p className="text-white/60 text-center py-8">
									Нет данных для этого спорта.
								</p>
							)}

							{allEntries.map((player) => (
								<div
									key={player.userId}
									onClick={() => navigate(`/user/${player.userId}`)}
									className="flex items-center gap-3 h-[78px] cursor-pointer hover:opacity-90 transition-opacity"
								>
									<div className="w-[81px] h-[76px] flex items-center justify-center rounded-[20px] border-[2.6px] border-black bg-[#D9D9D9]/20 flex-shrink-0">
										<span className="text-[#D9D9D9]/50 text-2xl font-bold">
											{player.place}
										</span>
									</div>

									<div className="flex-1 flex items-center gap-4 h-[78px] rounded-[20px] border-[1.5px] border-black bg-gradient-to-r from-[#4F0A0A] to-[#780000] px-4">
										<div className="w-[40px] h-[36px] rounded-full flex-shrink-0 bg-[#5A0A0A] flex items-center justify-center text-white font-bold">
											{player.username?.[0] ?? "?"}
										</div>

										<div className="min-w-[141px]">
											<p className="text-white text-[14px] font-bold leading-tight [text-shadow:_1px_1px_0_rgb(0_0_0)]">
												{player.username}
											</p>
										</div>

										<div className="flex-1 min-w-[229px] flex flex-col justify-center">
											<p
												className="text-[16px] font-extrabold leading-tight tracking-wide uppercase"
												style={{
													background:
														player.rank.name === "GOLD"
															? "linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)"
															: player.rank.name === "SILVER"
															? "linear-gradient(180deg, #E0E0E0 0%, #B0B0B0 50%, #808080 100%)"
															: "linear-gradient(180deg, #CD7F32 0%, #A0522D 50%, #6B3E1F 100%)",
													WebkitBackgroundClip: "text",
													WebkitTextFillColor: "transparent",
													backgroundClip: "text",
													filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.8))",
												}}
											>
												{player.rank.name}
											</p>
											<p className="text-white text-[12px] font-bold leading-tight [text-shadow:_1px_1px_0_rgb(0_0_0)] mt-0.5">
												Очки: {player.score}
											</p>
										</div>

										<div className="text-right text-white text-[11px] leading-tight min-w-[80px]">
											<p className="text-green-400">W: {player.wins}</p>
											<p className="text-red-400">L: {player.losses}</p>
											<p className="text-yellow-400">D: {player.draws}</p>
										</div>
									</div>
								</div>
							))}

							{hasNextPage && (
								<div
									ref={sentinelRef}
									className="h-10 flex items-center justify-center text-white/50 text-sm"
								>
									{isFetchingNextPage ? "Загрузка..." : "Прокрутите вниз"}
								</div>
							)}

							{!hasNextPage && allEntries.length > 0 && (
								<div className="h-10 flex items-center justify-center text-white/30 text-sm">
									Это все участники
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			<style>{`
				.custom-scrollbar::-webkit-scrollbar { width: 6px; }
				.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
				.custom-scrollbar::-webkit-scrollbar-thumb { background: #5D5D5D; border-radius: 40px; }
				.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #7D7D7D; }
			`}</style>
		</div>
	);
}