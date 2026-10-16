export interface PrestigeInfo {
	level: number;
	progress_percent: number;
	points_needed_next_level: number;
}

export interface RankInfo {
	rank_name: string;
	rank_image: string | null;
}

export interface BestSportCard {
	sport_name: string;
	rating: number;
	position_in_sport: number | string;
	rank_info: RankInfo | null;
	wins: number;
	win_rate: number;
}

export interface RecentGame {
	id: string;
	title: string;
	date: string;
	time: string;
	sport_name: string;
	personal_result: "Win" | "Loss" | "Draw" | string;
}

export interface PlayerStatsDto {
	prestige_info: PrestigeInfo;
	best_sport_card: BestSportCard;
	recent_games: RecentGame[];
	global_rank_position: number;
	global_rating: number;
	best_sport_icon_url: string | null;
}