import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import HeaderMenu from "@/components/HeaderMenu";
import DisplayMap from "@/components/DisplayMap";
import { api, ApiError } from "@/lib/apiClient";
import {
	useRequestDetail,
	useGameResult,
	type Participant,
	type GameResult,
} from "@/hooks/useRequestDetail";
import { useUserNames } from "@/hooks/useUserNames";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

/* ------------------------------------------------------------------ */
/*  Модалка ввода результата раунда                                    */
/* ------------------------------------------------------------------ */

interface RoundModalProps {
	isOpen: boolean;
	roundNumber: number;
	participants: Participant[];
	usernames: Record<string, string>;
	onClose: () => void;
	onSubmit: (winners: string[], losers: string[]) => void;
	isSubmitting: boolean;
}

const RoundModal: React.FC<RoundModalProps> = ({
	isOpen,
	roundNumber,
	participants,
	usernames,
	onClose,
	onSubmit,
	isSubmitting,
}) => {
	const [selected, setSelected] = useState<Record<string, "win" | "lose">>({});

	useEffect(() => {
		if (isOpen) setSelected({});
	}, [isOpen, roundNumber]);

	if (!isOpen) return null;

	const accepted = participants.filter((p) => p.status === "ACCEPTED");
	const winners = accepted
		.filter((p) => selected[p.userId] === "win")
		.map((p) => p.userId);
	const losers = accepted
		.filter((p) => selected[p.userId] === "lose")
		.map((p) => p.userId);

	const toggle = (userId: string, value: "win" | "lose") => {
		setSelected((prev) => {
			const next = { ...prev };
			if (next[userId] === value) delete next[userId];
			else next[userId] = value;
			return next;
		});
	};

	const canSubmit =
		!isSubmitting &&
		winners.length > 0 &&
		losers.length > 0 &&
		winners.length === losers.length;

	return (
		<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
			<div className="bg-[#2a2a2a] p-8 rounded-[25px] w-full max-w-lg border border-white/20 shadow-2xl">
				<h2 className="text-white text-3xl font-light mb-2">
					{/* Раунд {roundNumber} */}
					Результат
				</h2>
				<p className="text-white/60 text-sm mb-6">
					Отметьте победителей и проигравших. Группы должны быть
					непустыми и равными по размеру.
				</p>

				<div className="max-h-[320px] overflow-y-auto mb-6 space-y-2 pr-2">
					{accepted.map((p) => {
						const mark = selected[p.userId];
						return (
							<div
								key={p.userId}
								className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/5"
							>
								<span className="text-white text-base truncate">
									{usernames[p.userId] ??
										`Игрок ${p.userId.slice(0, 8)}`}
								</span>
								<div className="flex gap-2">
									<button
										type="button"
										onClick={() => toggle(p.userId, "win")}
										className={`px-3 py-1 rounded-lg text-sm border ${
											mark === "win"
												? "bg-green-600 border-green-400 text-white"
												: "border-white/30 text-white/70 hover:bg-white/10"
										}`}
									>
										Победа
									</button>
									<button
										type="button"
										onClick={() => toggle(p.userId, "lose")}
										className={`px-3 py-1 rounded-lg text-sm border ${
											mark === "lose"
												? "bg-red-700 border-red-400 text-white"
												: "border-white/30 text-white/70 hover:bg-white/10"
										}`}
									>
										Поражение
									</button>
								</div>
							</div>
						);
					})}
				</div>

				<div className="flex justify-between items-center text-white/60 text-sm mb-4">
					<span>Победителей: {winners.length}</span>
					<span>Проигравших: {losers.length}</span>
				</div>

				<div className="flex justify-end gap-4">
					<button
						type="button"
						onClick={onClose}
						disabled={isSubmitting}
						className="px-6 py-3 text-white/70 hover:text-white transition-colors text-lg"
					>
						Отмена
					</button>
					<button
						type="button"
						onClick={() => onSubmit(winners, losers)}
						disabled={!canSubmit}
						className={`px-8 py-3 rounded-2xl text-white font-semibold text-lg transition-all duration-300 ${
							!canSubmit
								? "bg-gray-500 cursor-not-allowed"
								: "bg-[#4182F9] shadow-lg hover:bg-[#3571e8]"
						}`}
					>
						{/* {isSubmitting ? "Отправка..." : "Записать раунд"} */}
						{isSubmitting ? "Отправка..." : "Записать результат"}
					</button>
				</div>
			</div>
		</div>
	);
};

/* ------------------------------------------------------------------ */
/*  Блок результата игры (Game Service)                               */
/* ------------------------------------------------------------------ */

const GameResultBlock: React.FC<{
	result: GameResult;
	usernames: Record<string, string>;
}> = ({ result, usernames }) => {
	const name = (id: string) => usernames[id] ?? `Игрок ${id.slice(0, 8)}`;

	return (
		<div className="mb-8">
			<h3 className="text-3xl font-semibold mb-4 text-white">
				Результат игры
			</h3>
			<div className="text-white/60 text-sm mb-3">
				Статус: {result.status} · Записано:{" "}
				{new Date(result.createdAt).toLocaleString()}
			</div>
			<div className="space-y-2">
				{result.players.map((p) => {
					const color =
						p.outcome === "WIN"
							? "text-green-400"
							: p.outcome === "LOSS"
								? "text-red-400"
								: "text-white/70";
					const sign = p.ratingChange >= 0 ? "+" : "";
					return (
						<div
							key={p.userId}
							className="flex justify-between border border-white/30 rounded-2xl p-3 text-white"
						>
							<span>{name(p.userId)}</span>
							<span className={color}>
								{p.outcome} {sign}
								{p.ratingChange}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};

/* ------------------------------------------------------------------ */
/*  Страница                                                            */
/* ------------------------------------------------------------------ */

export default function RequestData() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { user } = useAuth();
	const { id } = useParams<{ id: string }>();

	const {
		data: requestData,
		isLoading,
		error: loadError,
	} = useRequestDetail(id);

	const isCompleted = requestData?.status === "COMPLETED";
	const { data: gameResult } = useGameResult(id, isCompleted);

	const [actionLoading, setActionLoading] = useState(false);
	const [actionError, setActionError] = useState<string | null>(null);

	// Модалка раунда
	const [modalOpen, setModalOpen] = useState(false);
	const [roundSubmitting, setRoundSubmitting] = useState(false);

	// TODO: когда появится GET /requests/{id}/rounds — брать отсюда,
	// а не из локального состояния. Пока — компромисс: один раунд
	// в пределах одной сессии.
	const [roundSubmitted, setRoundSubmitted] = useState(false);

	const participantIds = useMemo(
		() => requestData?.participants.map((p) => p.userId) ?? [],
		[requestData],
	);
	const { data: usernames = {} } = useUserNames(participantIds);

	const refetchAll = useCallback(() => {
		if (!id) return;
		queryClient.invalidateQueries({ queryKey: ["request", id] });
		queryClient.invalidateQueries({ queryKey: ["request", id, "result"] });
	}, [id, queryClient]);

	const performAction = useCallback(
		async (endpoint: string, body: unknown = null) => {
			if (!id) return;
			setActionLoading(true);
			setActionError(null);
			try {
				await api.post(`requests/${id}/${endpoint}`, body ?? undefined);

				if (endpoint === "cancel") {
					navigate("/requests");
					return;
				}

				await refetchAll();
			} catch (err) {
				console.error("Action error:", err);
				const message =
					err instanceof ApiError
						? err.body?.message ?? err.message
						: "Произошла ошибка при выполнении действия";
				setActionError(message);
			} finally {
				setActionLoading(false);
			}
		},
		[id, navigate, refetchAll],
	);

	const handleJoin = () => performAction("join");
	const handleLeave = () => performAction("leave");
	const handleStart = () => performAction("start");
	const handleCloseRegistration = () =>
		performAction("registration/close");
	const handleOpenRegistration = () =>
		performAction("registration/open");
	const handleComplete = () => performAction("complete");

	const handleCancel = () => {
		if (window.confirm("Вы действительно хотите отменить заявку?")) {
			performAction("cancel");
		}
	};

	const handleKick = (userId: string) => {
		if (window.confirm("Исключить игрока?")) {
			performAction(`kick/${userId}`);
		}
	};

	// Записать результат раунда №1 (пока раунд только один)
	const handleRecordRound = useCallback(
		async (winners: string[], losers: string[]) => {
			if (!id) return;
			setRoundSubmitting(true);
			setActionError(null);
			try {
				await api.post(`requests/${id}/rounds/1/result`, {
					winners,
					losers,
				});
				setRoundSubmitted(true);
				setModalOpen(false);
				await refetchAll();
			} catch (err) {
				console.error("Record round error:", err);
				const message =
					err instanceof ApiError
						? err.body?.message ?? err.message
						: "Не удалось записать результат раунда";
				setActionError(message);
			} finally {
				setRoundSubmitting(false);
			}
		},
		[id, refetchAll],
	);

	const isOrganizer =
		!!requestData && !!user && user.id === requestData.organizerId;

	const isParticipant = useMemo(() => {
		if (!requestData || !user) return false;
		return requestData.participants.some((p) => p.userId === user.id);
	}, [requestData, user]);

	const showMap = !!(requestData?.latitude && requestData?.longitude);

	/* -------------------------------------------------------------- */
	/*  Ранние возвраты                                               */
	/* -------------------------------------------------------------- */

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] flex items-center justify-center">
				<p className="text-white text-2xl">Загрузка данных...</p>
			</div>
		);
	}

	if (loadError || !requestData) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] p-8">
				<div className="bg-red-900/50 p-6 rounded-xl text-white text-center">
					<p className="text-2xl font-bold mb-4">Ошибка</p>
					<p>
						{loadError instanceof Error
							? loadError.message
							: "Заявка не найдена."}
					</p>
					<button
						onClick={() => navigate("/profile")}
						className="mt-4 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
					>
						Вернуться
					</button>
				</div>
			</div>
		);
	}

	const {
		id: requestId,
		title,
		sportName,
		description,
		eventDate,
		addressText,
		currentPlayers,
		maxPlayers,
		participants,
		organizerId,
		status,
		registrationOpen,
	} = requestData;

	/* -------------------------------------------------------------- */
	/*  Кнопки                                                         */
	/* -------------------------------------------------------------- */

	const renderActionButtons = () => {
		const isFull = currentPlayers >= maxPlayers;

		if (status === "COMPLETED" || status === "CANCELLED") {
			return (
				<button
					onClick={() => navigate("/profile")}
					className="rounded-[25px] bg-[#1D2C4D] shadow-[0_8px_4px_0_rgba(0,0,0,0.50)] px-4 py-7 hover:bg-[#2a3d5e] transition-colors w-full"
				>
					<span className="text-white text-[25px] font-normal">
						Вернуться в профиль
					</span>
				</button>
			);
		}

		if (isOrganizer) {
			if (status === "PLANNED") {
				return (
					<>
						<button
							onClick={handleStart}
							disabled={actionLoading || currentPlayers < 2}
							className={`rounded-[25px] px-4 py-6 mb-6 w-full text-white text-[25px] font-normal shadow-[0_8px_4px_0_rgba(0,0,0,0.50)] transition-colors ${
								actionLoading || currentPlayers < 2
									? "bg-gray-500 cursor-not-allowed"
									: "bg-[#304A7D] hover:bg-[#3d5a94]"
							}`}
						>
							{actionLoading ? "Загрузка..." : "Начать игру"}
						</button>

						{registrationOpen ? (
							<button
								onClick={handleCloseRegistration}
								disabled={actionLoading}
								className="rounded-[25px] px-4 py-6 w-full text-white text-[25px] font-normal shadow-[0_8px_4px_0_rgba(0,0,0,0.50)] transition-colors bg-[#4A4A4A] hover:bg-[#5c5c5c] mb-6"
							>
								{actionLoading
									? "Загрузка..."
									: "Закрыть регистрацию"}
							</button>
						) : (
							<button
								onClick={handleOpenRegistration}
								disabled={actionLoading}
								className="rounded-[25px] px-4 py-6 w-full text-white text-[25px] font-normal shadow-[0_8px_4px_0_rgba(0,0,0,0.50)] transition-colors bg-[#4A4A7D] hover:bg-[#5c5c94] mb-6"
							>
								{actionLoading
									? "Загрузка..."
									: "Открыть регистрацию"}
							</button>
						)}

						<button
							onClick={handleCancel}
							disabled={actionLoading}
							className={`rounded-[25px] px-4 py-6 w-full text-white text-[25px] font-normal shadow-[0_8px_4px_0_rgba(0,0,0,0.50)] transition-colors ${
								actionLoading
									? "bg-gray-500 cursor-not-allowed"
									: "bg-[#7D3030] hover:bg-[#994040]"
							}`}
						>
							{actionLoading ? "Загрузка..." : "Отменить заявку"}
						</button>
					</>
				);
			}

			if (status === "ACTIVE") {
				if (!roundSubmitted) {
					return (
						<button
							onClick={() => setModalOpen(true)}
							disabled={
								actionLoading || roundSubmitting ||
								participants.filter(
									(p) => p.status === "ACCEPTED",
								).length < 2
							}
							className={`rounded-[25px] px-4 py-6 mb-6 w-full text-white text-[25px] font-normal shadow-[0_8px_4px_0_rgba(0,0,0,0.50)] transition-colors ${
								actionLoading || roundSubmitting
									? "bg-gray-500 cursor-not-allowed"
									: "bg-[#4182F9] hover:bg-[#3571e8]"
							}`}
						>
							{roundSubmitting
								? "Отправка..."
								// : "Ввести результат раунда 1"
								: "Ввести результат"}
						</button>
					);
				}

				return (
					<button
						onClick={handleComplete}
						disabled={actionLoading}
						className={`rounded-[25px] px-4 py-6 mb-6 w-full text-white text-[25px] font-normal shadow-[0_8px_4px_0_rgba(0,0,0,0.50)] transition-colors ${
							actionLoading
								? "bg-gray-500 cursor-not-allowed"
								: "bg-green-700 hover:bg-green-800"
						}`}
					>
						{actionLoading ? "Загрузка..." : "Завершить игру"}
					</button>
				);
			}
		}

		if (isParticipant && status === "PLANNED") {
			return (
				<button
					onClick={handleLeave}
					disabled={actionLoading}
					className={`rounded-[25px] px-4 py-6 w-full text-white text-[25px] font-normal shadow-[0_8px_4px_0_rgba(0,0,0,0.50)] transition-colors ${
						actionLoading
							? "bg-gray-500 cursor-not-allowed"
							: "bg-[#7D3030] hover:bg-[#994040]"
					}`}
				>
					{actionLoading ? "Загрузка..." : "Покинуть игру"}
				</button>
			);
		}

		if (!isOrganizer && !isParticipant && status === "PLANNED") {
			if (!registrationOpen) {
				return (
					<div className="rounded-[25px] px-4 py-6 w-full text-center text-white/70 text-[20px] bg-[#2a2a2a]">
						Регистрация закрыта
					</div>
				);
			}
			return (
				<button
					onClick={handleJoin}
					disabled={actionLoading || isFull}
					className={`rounded-[25px] px-4 py-6 mb-6 w-full text-white text-[25px] font-normal shadow-[0_8px_4px_0_rgba(0,0,0,0.50)] transition-colors ${
						actionLoading || isFull
							? "bg-gray-500 cursor-not-allowed"
							: "bg-[#304A7D] hover:bg-[#3d5a94]"
					}`}
				>
					{actionLoading
						? "Загрузка..."
						: isFull
							? "Нет свободных мест"
							: "Подать запрос на вступление"}
				</button>
			);
		}

		return null;
	};

	/* -------------------------------------------------------------- */
	/*  Статус                                                        */
	/* -------------------------------------------------------------- */

	const renderStatusMessage = () => {
		if (status === "COMPLETED") {
			return (
				<div className="p-4 rounded-xl border mb-6 bg-gray-900/50 border-gray-600">
					<p className="text-white text-[34px] font-bold leading-tight mb-2">
						Игра завершена
					</p>
					<p className="text-white/80 text-xl">Статус: {status}</p>
				</div>
			);
		}
		if (status === "CANCELLED") {
			return (
				<div className="p-4 rounded-xl bg-red-900/50 border border-red-600 mb-6">
					<p className="text-white text-[34px] font-light leading-tight">
						Заявка <span className="font-bold">отменена</span>.
					</p>
				</div>
			);
		}
		if (status === "ACTIVE") {
			return (
				<div className="p-4 rounded-xl bg-yellow-900/50 border border-yellow-600 mb-6">
					<p className="text-white text-[34px] font-light leading-tight">
						Игра <span className="font-bold">активна</span>.
					</p>
				</div>
			);
		}
		return (
			<div className="mt-[100px]">
				<p className="text-white text-[34px] font-light leading-tight">
					Заявка в статусе <span className="font-bold">{status}</span>.
				</p>
			</div>
		);
	};

	/* -------------------------------------------------------------- */
	/*  Участник                                                       */
	/* -------------------------------------------------------------- */

	const renderParticipant = (player: Participant, isCreator: boolean) => {
		const isCurrentUser = user?.id === player.userId;

		let gradientFrom = "#1D2C4D";
		let gradientTo = "#304A7D";

		if (isCreator) {
			gradientFrom = "#493D02";
			gradientTo = "#7D5C05";
		} else if (isCurrentUser) {
			gradientFrom = "#304A7D";
			gradientTo = "#4182F9";
		}

		const dimmed =
			player.status === "KICKED" || player.status === "LEFT";

		return (
			<div
				key={player.userId}
				className={`rounded-[25px] border-[1.5px] border-black p-3 flex items-center gap-3 relative ${
					dimmed ? "opacity-40" : ""
				}`}
				style={{
					background: `linear-gradient(90deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
				}}
			>
				<div className="flex items-center justify-center flex-1 min-w-0">
					<p className="text-white text-[12px] font-bold text-center leading-tight truncate px-1">
						{usernames[player.userId] ??
							`Игрок ${player.userId.slice(0, 8)}`}
					</p>
				</div>

				{isCreator && (
					<span
						className="text-yellow-300 text-lg absolute top-1 right-2"
						title="Организатор"
					>
						★
					</span>
				)}

				{isOrganizer &&
					!isCurrentUser &&
					!isCreator &&
					status === "PLANNED" &&
					player.status === "ACCEPTED" && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								handleKick(player.userId);
							}}
							className="w-5 h-5 bg-red-600 rounded-full text-white text-xs flex items-center justify-center absolute top-1 right-1 hover:bg-red-800 transition-colors"
							title="Исключить"
							disabled={actionLoading}
						>
							&times;
						</button>
					)}
			</div>
		);
	};

	const creator = participants.find((p) => p.userId === organizerId);

	/* -------------------------------------------------------------- */
	/*  Разметка                                                       */
	/* -------------------------------------------------------------- */

	return (
		<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
			<div className="flex-1 p-7 overflow-y-auto">
				<HeaderMenu />
				<div className="px-7 py-9">
					{actionLoading && (
						<div className="fixed top-0 left-0 right-0 p-3 bg-blue-500 text-white text-center z-50">
							Выполняется действие...
						</div>
					)}
					{actionError && (
						<div className="fixed top-0 left-0 right-0 p-3 bg-red-600 text-white text-center z-50">
							Ошибка: {actionError}
						</div>
					)}

					<div className="relative">
						<div className="rounded-[10px] bg-[#797777]/50 px-9 py-12 min-h-[1064px]">
							<div className="flex gap-8">
								<div className="flex-1">
									<div className="border-[0.5px] border-white rounded-[50px] p-8 mb-8 relative">
										<h1 className="text-white text-[50px] font-light text-center mb-8">
											Заявка №{requestId}
										</h1>

										<div className="mb-6">
											<h2 className="text-white text-[30px] font-light mb-2">
												{title}
											</h2>
											<p className="text-white text-[25px] font-light">
												{sportName}
											</p>
										</div>

										<div className="mb-6">
											<p className="text-white text-[17px] font-light leading-relaxed">
												Описание игры:
												<br />
												{description || "Описание отсутствует."}
											</p>
										</div>

										<div className="flex gap-3 justify-end mb-6 flex-wrap">
											<div className="border border-white rounded-[50px] px-4 py-2">
												<span className="text-white text-base font-light">
													{new Date(eventDate).toLocaleString()}
												</span>
											</div>
											<div className="border border-white rounded-[50px] px-4 py-2">
												<span className="text-white text-[15px] font-light">
													Игроков: {currentPlayers}/{maxPlayers}
												</span>
											</div>
										</div>

										<div className="relative">
											<div className="grid grid-cols-4 gap-x-[18px] gap-y-3 mb-8 max-h-[260px] overflow-y-auto pr-4">
												{creator && renderParticipant(creator, true)}
												{participants
													.filter(
														(p) => p.userId !== creator?.userId,
													)
													.map((p) =>
														renderParticipant(p, false),
													)}
											</div>
										</div>
									</div>

									{status === "COMPLETED" && gameResult && (
										<GameResultBlock
											result={gameResult}
											usernames={usernames}
										/>
									)}

									{status === "COMPLETED" && !gameResult && (
										<div className="mb-8 text-white/60 text-center">
											Результат игры ещё не готов, обновите
											страницу чуть позже.
										</div>
									)}

									<div className="my-8">
										<h3 className="text-3xl font-semibold mb-4 text-white">
											Местоположение
										</h3>
										<div className="rounded-[40px] shadow-lg overflow-hidden">
											{showMap ? (
												<DisplayMap
													latitude={requestData.latitude}
													longitude={requestData.longitude}
													address={addressText}
													height="400px"
												/>
											) : (
												<p className="p-8 bg-[#DDD]/50 text-center">
													Данные о местоположении загружаются
													или отсутствуют.
												</p>
											)}
										</div>
									</div>
								</div>

								<div className="w-[412px] flex flex-col">
									<div className="relative mb-[30px] flex justify-end">
										<div className="relative w-110 h-110">
											<img
												src="/basket_decor.webp"
												className="w-full h-full object-contain rounded-xl"
											/>
										</div>
									</div>

									{renderStatusMessage()}

									<div className="flex flex-col gap-6">
										{renderActionButtons()}
									</div>

									{status !== "COMPLETED" &&
										status !== "CANCELLED" && (
											<button
												onClick={() => navigate("/profile")}
												className="rounded-[25px] bg-[#1D2C4D] shadow-[0_8px_4px_0_rgba(0,0,0,0.50)] px-4 py-7 mt-6 hover:bg-[#2a3d5e] transition-colors"
											>
												<span className="text-white text-[25px] font-normal">
													Вернуться в профиль
												</span>
											</button>
										)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<RoundModal
				isOpen={modalOpen}
				roundNumber={1}
				participants={participants}
				usernames={usernames}
				onClose={() => setModalOpen(false)}
				onSubmit={handleRecordRound}
				isSubmitting={roundSubmitting}
			/>
		</div>
	);
}