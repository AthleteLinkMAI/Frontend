/* Стили рангов */
export type RankTier =
	| "bronze"
	| "silver"
	| "gold"
	| "diamond"
	| "mythic"
	| "legendary"
	| "master";

export interface RankStyle {
	from: string;
	to: string;
	text: string;
	accent: string;
}

export const RANK_STYLES: Record<RankTier, RankStyle> = {
	bronze: { from: "#7B5D3B", to: "#483219", text: "#3B2A18", accent: "#6a4f33" },
	silver: { from: "#747474", to: "#383838", text: "#2E2E2E", accent: "#5c5c5c" },
	gold: { from: "#D5AB13", to: "#FFF94A", text: "#7A6505", accent: "#b98f0f" },
	diamond: { from: "#00CDDB", to: "#BEFBFF", text: "#0A5F63", accent: "#00a6b0" },
	mythic: { from: "#34064F", to: "#9F49B9", text: "#220436", accent: "#53206d" },
	legendary: { from: "#4F0A0A", to: "#AD3535", text: "#3C0505", accent: "#7a1313" },
	master: { from: "#763700", to: "#FFA04D", text: "#4D2400", accent: "#8b4b1f" },
};

export const detectTierFromImage = (path?: string | null): RankTier => {
	if (!path) return "bronze";
	const p = path.toLowerCase();
	if (p.includes("bronze")) return "bronze";
	if (p.includes("silver")) return "silver";
	if (p.includes("gold")) return "gold";
	if (p.includes("diamond")) return "diamond";
	if (p.includes("mythic")) return "mythic";
	if (p.includes("legendary")) return "legendary";
	if (p.includes("master")) return "master";
	return "bronze";
};

export const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));

export const getRomanNumeral = (rankName?: string): string => {
	if (!rankName) return "";
	const [, numeral] = rankName.split(" ");
	return ["I", "II", "III"].includes(numeral) ? numeral : "";
};

export type GameResult = "Win" | "Loss" | "Draw" | string;

export const getResultColor = (result: GameResult): string => {
	switch (result) {
		case "Win":
			return "bg-[#4CAF50]";
		case "Loss":
			return "bg-[#F44336]";
		case "Draw":
			return "bg-[#FFEB3B] text-black";
		default:
			return "bg-gray-500";
	}
};

export const getResultLabel = (result: GameResult): string => {
	switch (result) {
		case "Win":
			return "ПОБЕДА";
		case "Loss":
			return "ПОРАЖЕНИЕ";
		case "Draw":
			return "НИЧЬЯ";
		default:
			return "АКТИВНА";
	}
};