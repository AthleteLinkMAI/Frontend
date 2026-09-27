import type { RequestListItem } from "@/hooks/useActiveRequest";

interface SmallRequestCardProps {
 	request: RequestListItem;
}

export default function SmallRequestCard({ request }: SmallRequestCardProps) {
	const getStatusColor = (status: RequestListItem["status"]) => {
		switch (status) {
			case "ACTIVE": return "bg-[#48FF55]";
			case "PLANNED": return "bg-black";
			case "COMPLETED": return "bg-[#848484]";
			case "CANCELLED": return "bg-[#FF7B7B]";
			default: return "bg-gray-400";
		}
	};

	return (
		<div className="border border-black rounded-[20px] p-3 flex items-center justify-between backdrop-blur-sm relative overflow-hidden mb-2 bg-white/30 hover:bg-white/40 transition-colors cursor-pointer">
			<div
				className="absolute inset-0 -z-10 rounded-[20px]"
				style={{
				backgroundImage: "url('/silver.png')",
				backgroundSize: "120px 120px",
				opacity: 0.05,
				}}
			></div>

			<div className="flex-1 relative z-10">
				<h3 className="text-black text-sm font-medium mb-1 truncate max-w-[150px]">
					{request.title}
				</h3>
				<div className="flex items-center gap-2">
					<div className="border border-black rounded-[15px] px-2 py-1">
						<span className="text-black text-xs font-light">
							{request.eventDate}
						</span>
					</div>
					<div className="border border-black rounded-[15px] px-2 py-0.5">
						<span className="text-black text-xs font-light">
							{request.sport.name}
						</span>
					</div>
				</div>
			</div>

			<div className="border border-black rounded-[15px] px-3 py-1.5 min-w-[180px] relative z-10 bg-white/30 backdrop-blur-sm">
				<div className="space-y-1">
					<div className="flex items-center justify-between">
						<span className="text-black text-xs font-light">Статус:</span>
						<span className="text-black text-xs font-medium">
							{request.statusDisplay}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-black text-xs font-light">Игроков:</span>
						<div className="flex items-center gap-1">
							<div
								className={`w-[12px] h-[12px] rounded-full border border-black ${getStatusColor(request.status)}`}
							></div>
						<span className="text-black text-xs font-medium">
							{request.currentPlayers}/{request.playersCount}
						</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}