import { useParams } from "react-router-dom";
import { usePublicProfile } from "@/hooks/usePublicProfile"
import HeaderMenu from "@/components/HeaderMenu";
import SidebarNav from "@/components/SidebarMenu";
import { requestResultForPlayer } from "@/constants/requestResult";


// const SportIcon = ({ sport }: { sport: string }) => {
// 	// Здесь можно добавить логику выбора иконки в зависимости от sport
// 	return (
// 		<div className="w-12 h-12 rounded-full bg-red-900 border-2 border-red-500 flex items-center justify-center shrink-0">
// 			<span className="text-white text-xl">🏆</span>
// 		</div>
// 	);
// };

const ProgressBar = ({ current, max }: { current: number; max: number }) => {
	const percentage = Math.min(100, Math.max(0, (current / max) * 100));
	return (
		<div className="w-full bg-black/40 rounded-full h-2.5 mt-2 overflow-hidden">
			<div
				className="bg-white h-2.5 rounded-full"
				style={{ width: `${percentage}%` }}
			/>
		</div>
	);
};

export default function PublicProfile() {
	const { userId } = useParams<{ userId: string }>();
	const { data: profile, isLoading, isError } = usePublicProfile(userId);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-[#2C3030] flex items-center justify-center">
				<p className="text-white text-2xl">Загрузка профиля...</p>
			</div>
		);
	}

	if (isError || !profile) {
		return (
			<div className="min-h-screen bg-[#2C3030] flex items-center justify-center">
				<p className="text-red-400 text-2xl">Ошибка загрузки профиля.</p>
			</div>
		);
	}

	const { common, bestSport, otherSports, lastGame } = profile;

	return (
		<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
			<div className="flex-1 p-7 overflow-y-auto">
				<HeaderMenu />

				<div className="max-w-[1280px] mx-auto px-9 py-6">
					<div className="rounded-[10px] bg-[#4A4D4D]/80 p-8 relative min-h-[900px] shadow-2xl text-white">
						
						{/* Шапка профиля */}
						<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/10 pb-6">
							<div className="flex items-center gap-6">
								<div>
									<h1 className="text-[32px] font-light">{common.username}</h1>
									<div className="flex gap-3 mt-4">
										<span className="px-4 py-1.5 rounded-full border border-white/30 text-sm">Возраст: {common.age} лет</span>
									</div>
								</div>
							</div>
						</div>

						{/* Основной контент */}
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
							
							{/* Левая колонка - Лучший спорт */}
							<div className="lg:col-span-4 bg-gradient-to-b from-[#6B0F0F] to-[#3A0505] rounded-[20px] p-6 border border-red-900/50 shadow-lg flex flex-col items-center">
								<div className="text-6xl mb-4 drop-shadow-lg">🦁</div>
								<h2 className="text-xl text-white/80 mb-1">Лучший спорт</h2>
								<p className="text-2xl font-bold mb-6">{bestSport.sportName}</p>
								
								<div className="w-full text-center space-y-2 mb-8">
									<p className="text-white/70">Ранг: <span className="text-white font-semibold">{bestSport.rank}</span></p>
									<p className="text-white/70">({bestSport.ratePoints} / {bestSport.maxRatePoints})</p>
									<p className="text-white/70">Глобальный рейтинг: <span className="text-white font-semibold">#{bestSport.globalRates}</span></p>
								</div>

								<div className="w-full bg-black/30 rounded-xl p-4 mt-auto">
									<div className="flex justify-between mb-1">
										<span className="text-sm text-white/60">Всего побед:</span>
										<span className="font-bold">{bestSport.wins}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sm text-white/60">Win Rate:</span>
										<span className="font-bold">{bestSport.winRate}%</span>
									</div>
								</div>
							</div>

							{/* Центральная колонка - Другие виды спорта */}
							<div className="lg:col-span-5 space-y-4">
								<h3 className="text-white/60 mb-2">Также играет в:</h3>
								{otherSports.map((sport, idx) => (
									<div key={idx} className="bg-[#1D2C4D] rounded-full p-2 pr-6 flex items-center gap-4 border border-white/10 relative overflow-hidden">
										{/* Цветная полоска */}
										<div className="absolute left-0 top-0 bottom-0 w-2 bg-purple-500" />
										{/* <SportIcon sport={sport.sportName} /> */}
										<div className="flex-1">
											<div className="flex justify-between text-sm mb-1">
												<span>{sport.sportName}</span>
												<span className="text-white/60">({sport.ratePoints} / {sport.maxRatePoints})</span>
											</div>
											<ProgressBar current={sport.ratePoints} max={sport.maxRatePoints} />
										</div>
									</div>
								))}
								
								{otherSports.length === 0 && (
									<p className="text-white/40 text-sm italic">Нет данных о других видах спорта.</p>
								)}
							</div>

							{/* Правая колонка - Последняя игра */}
							<div className="lg:col-span-3 space-y-6">
								<h3 className="text-white/60 mb-2">Последняя игра:</h3>
								
								{lastGame ? (
									<div className="bg-[#3D3A22] rounded-[20px] p-5 border border-yellow-900/30">
										<h4 className="text-xl font-medium mb-3">{lastGame.gameName}</h4>
										<div className="flex gap-2 mb-4">
											<span className="px-3 py-1 rounded-full border border-white/20 text-xs">{new Date(lastGame.dateGame).toLocaleString()}</span>
											<span className="px-3 py-1 rounded-full border border-white/20 text-xs">{lastGame.sportName}</span>
										</div>
										<div className="flex items-center gap-2 mb-4">
											<span className="text-white/60 text-sm">Результат игры:</span>
											<div className={`w-4 h-4 rounded-full ${lastGame.result === requestResultForPlayer.WIN ? 'bg-green-500' : lastGame.result === requestResultForPlayer.LOSE ? 'bg-red-500' : 'bg-yellow-500'}`} />
										</div>
										<p className="text-lg font-semibold mb-6">
											{lastGame.result === requestResultForPlayer.WIN ? 'Победа' : lastGame.result === requestResultForPlayer.LOSE ? 'Поражение' : 'Ничья'}
										</p>

										<div className="mt-4">
											<p className="text-white/60 text-sm mb-3">Последние соперники:</p>
											<div className="flex flex-wrap gap-2">
												{lastGame.players.map(p => (
													<div key={p.userId} className="bg-[#5A0A0A] rounded-xl px-3 py-2 flex items-center gap-2 border border-red-900">
														<div className="w-6 h-6 rounded-full bg-black/50 text-xs flex items-center justify-center">
															{p.username[0]}
														</div>
														<span className="text-xs">{p.username}</span>
													</div>
												))}
											</div>
										</div>
									</div>
								) : (
									<div className="bg-[#3D3A22] rounded-[20px] p-5 border border-yellow-900/30 text-center text-white/50">
										Нет недавних игр
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}