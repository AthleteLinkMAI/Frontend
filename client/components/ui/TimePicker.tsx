import { useEffect, useRef, useState } from "react";

export interface TimePickerProps {
	value: string;
	onChange: (value: string) => void;
	minuteStep?: number;
	className?: string;
	placeholder?: string;
}

export function TimePicker({
	value,
	onChange,
	minuteStep = 5,
	className,
	placeholder = "ЧЧ:ММ",
}: TimePickerProps) {
	const [open, setOpen] = useState(false);

	const [hh, mm] = value ? value.split(":") : ["", ""];
	const hours = hh ? Number(hh) : 0;
	const minutes = mm ? Number(mm) : 0;

	const rootRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const onDocClick = (e: MouseEvent) => {
			if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", onDocClick);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDocClick);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	const setTime = (h: number, m: number) => {
		onChange(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
	};

	return (
		<div ref={rootRef} className="relative">
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className={
					className ??
					"w-full h-[68px] rounded-[15px] bg-[#F9F9F9]/50 px-5 flex items-center justify-between text-[28px] text-black"
				}
			>
				<span className={value ? "text-black" : "text-black/40"}>
					{value || placeholder}
				</span>
				<span className="text-black/50 text-xl">🕒</span>
			</button>

			{open && (
				<div className="absolute z-50 mt-2 w-[260px] rounded-md border bg-white shadow-md p-4">
					<div className="flex items-center justify-center gap-2">
						{/* Часы */}
						<select
							value={hours}
							onChange={(e) => setTime(Number(e.target.value), minutes)}
							className="border rounded px-2 py-1 bg-white text-black text-lg"
						>
							{Array.from({ length: 24 }, (_, i) => (
								<option key={i} value={i}>
									{String(i).padStart(2, "0")}
								</option>
							))}
						</select>

						<span className="text-lg text-black">:</span>

						{/* Минуты */}
						<select
							value={minutes}
							onChange={(e) => setTime(hours, Number(e.target.value))}
							className="border rounded px-2 py-1 bg-white text-black text-lg"
						>
							{Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => {
								const m = i * minuteStep;
								return (
									<option key={m} value={m}>
										{String(m).padStart(2, "0")}
									</option>
								);
							})}
						</select>
					</div>

					<div className="flex justify-between gap-2 mt-3">
						<button
							type="button"
							onClick={() => {
								const now = new Date();
								setTime(now.getHours(), Math.floor(now.getMinutes() / minuteStep) * minuteStep);
							}}
							className="flex-1 text-sm py-1.5 rounded border border-slate-300 hover:bg-slate-100 text-black"
						>
							Сейчас
						</button>
						<button
							type="button"
							onClick={() => {
								onChange("");
								setOpen(false);
							}}
							className="flex-1 text-sm py-1.5 rounded border border-slate-300 hover:bg-slate-100 text-black"
						>
							Очистить
						</button>
					</div>
				</div>
			)}
		</div>
	);
}