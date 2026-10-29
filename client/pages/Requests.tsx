import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HeaderMenu from "@/components/HeaderMenu";
import SidebarNav from "@/components/SidebarMenu";
import RequestCard from "@/components/RequestCard";
import { useAuth } from "@/hooks/useAuth";
import { useUserRequests } from "@/hooks/useUserRequests";

export default function Requests() {
	const navigate = useNavigate();
	const { user } = useAuth();

	const {
		data,
		isLoading,
		error,
		isFetching,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
	} = useUserRequests({
		userId: user?.id,
		forOrganizer: false, // все заявки, где участвует пользователь
	});

	// разворачиваем страницы в один массив
	const requests = data?.pages.flatMap((p) => p.content) ?? [];
	const totalElements = data?.pages[0]?.page?.totalElements ?? 0;

	// --- IntersectionObserver для подгрузки ---
	const loadMoreRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = loadMoreRef.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const first = entries[0];
				if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ rootMargin: "200px" } // подгружаем заранее, до самого низа
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	return (
		<div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
			<div className="flex min-h-screen">
				<SidebarNav activePage="requests" />

				<div className="flex-1 p-7 overflow-y-auto">
					<HeaderMenu />

					<div className="rounded-[10px] bg-[#DDD]/50 p-8 min-h-[800px] relative">
						<h2 className="text-black text-[50px] font-light text-center mb-2">
							Мои заявки
						</h2>
						{totalElements > 0 && (
							<p className="text-center text-gray-600 mb-8">
								Всего: {totalElements}
							</p>
						)}
						{totalElements === 0 && <div className="mb-8" />}

						{isLoading && (
							<p className="text-center text-xl">Загрузка...</p>
						)}
						{error && (
							<p className="text-center text-red-600 text-xl">
								Ошибка загрузки данных
							</p>
						)}
						{!isLoading && !error && requests.length === 0 && (
							<p className="text-center text-xl text-gray-700">
								У вас пока нет заявок.
							</p>
						)}

						{/* Список */}
						<div
							className={`space-y-5 mb-8 transition-opacity ${
								isFetching && !isFetchingNextPage ? "opacity-50" : "opacity-100"
							}`}
						>
							{requests.map((request) => (
								<RequestCard key={request.id} request={request} />
							))}
						</div>

						{/* Триггер подгрузки / индикаторы */}
						<div ref={loadMoreRef} className="h-px" />

						{isFetchingNextPage && (
							<p className="text-center text-lg py-4">Загрузка ещё...</p>
						)}
						{!hasNextPage && requests.length > 0 && (
							<p className="text-center text-gray-500 py-4">
								Больше заявок нет
							</p>
						)}

						{/* Кнопка создания */}
						<div className="flex justify-center mt-12">
							<button
								onClick={() => navigate("/requests/create")}
								className="w-full max-w-[404px] h-[68px] bg-[#4182F9] rounded-[25px] text-white text-[24px] font-normal shadow-[0_8px_4px_rgba(0,0,0,0.5)] hover:bg-[#3571e8] transition-all active:scale-95"
							>
								Создать свою заявку
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}