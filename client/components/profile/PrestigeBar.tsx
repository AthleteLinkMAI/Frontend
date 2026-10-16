interface PrestigeBarProps {
	percent: number;
	level?: number;
}

export default function PrestigeBar({ percent, level }: PrestigeBarProps) {
	return (
		<div className="relative mb-12 w-full max-w-[90%] mx-auto">
			<div className="h-[46px] rounded-[50px] border-[3px] border-black shadow-[0_6px_4px_4px_rgba(0,0,0,0.33)] relative overflow-hidden bg-black">
				<div
					className="h-full rounded-[5000px] transition-[width] duration-500"
					style={{
						width: `${percent}%`,
						background:
							"linear-gradient(90deg, #4986F9 0%, #2A387B 100%)",
					}}
				/>
			</div>
			<div className="absolute inset-0 flex items-center justify-end pr-6 pointer-events-none">
				<span
					className="text-white text-[50px] font-bold leading-none"
					style={{ WebkitTextStroke: "4px black" }}
				>
					{level}
				</span>
			</div>
		</div>
	);
}