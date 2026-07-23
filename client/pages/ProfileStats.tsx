import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { getTimeGreeting } from "@/components/TimeParse";
import HeaderMenu from "@/components/HeaderMenu";
import SidebarNav from "@/components/SidebarMenu";
import { getCurrentDateFormatted } from "@/lib/dateFormatter";
import { getCookie } from "@/lib/csrf";

const useStats = (userUsername: string | undefined) => {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const csrfToken = getCookie("csrftoken");

  useEffect(() => {
    if (!userUsername) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch(`${apiUrl}/my-stats/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Ошибка HTTP-запроса: ${response.status}. Тело ответа: ${errorText.substring(
              0,
              100
            )}...`
          );
        }
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Ошибка загрузки статистики. Обновите страницу");
        setLoading(false);
      }
    };

    fetchStats();
  }, [userUsername, csrfToken]);

  return { stats, loading, error };
};

const RANK_STYLES: Record<
  string,
  { from: string; to: string; text: string; accent: string }
> = {
  bronze: { from: "#7B5D3B", to: "#483219", text: "#3B2A18", accent: "#6a4f33" },
  silver: { from: "#747474", to: "#383838", text: "#2E2E2E", accent: "#5c5c5c" },
  gold: { from: "#D5AB13", to: "#FFF94A", text: "#7A6505", accent: "#b98f0f" },
  diamond: { from: "#00CDDB", to: "#BEFBFF", text: "#0A5F63", accent: "#00a6b0" },
  mythic: { from: "#34064F", to: "#9F49B9", text: "#220436", accent: "#53206d" },
  legendary: { from: "#4F0A0A", to: "#AD3535", text: "#3C0505", accent: "#7a1313" },
  master: { from: "#763700", to: "#FFA04D", text: "#4D2400", accent: "#8b4b1f" },
};

const detectTierFromImage = (path?: string | null) => {
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

const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));

export default function ProfileStats() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { stats, loading: isStatsLoading, error: statsError } = useStats(
    user?.username
  );
  const [bounceCount, setBounceCount] = useState(0);

  const isLoading = isAuthLoading || isStatsLoading;

  const getResultColor = (result: string) => {
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

  const getRomanNumeral = (rankName?: string) => {
    if (!rankName) return "";
    const parts = rankName.split(" ");
    if (parts.length < 2) return "";
    const numeral = parts[1];
    if (["I", "II", "III"].includes(numeral)) return numeral;
    return "";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] text-white p-10">
        Загрузка данных...
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] text-red-500 p-10">
        Ошибка: {statsError}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] text-white p-10">
        Данные статистики не найдены.
      </div>
    );
  }

  const {
    prestige_info,
    best_sport_card,
    recent_games,
    global_rank_position,
    best_sport_icon_url,
  } = stats;

  const prestigeProgress = clamp(Number(prestige_info?.progress_percent ?? 0));
  const bestSportRankName =
    best_sport_card?.rank_info?.rank_name ?? "Искра I";
  const bestSportRating = best_sport_card?.rating ?? 0;
  const bestSportPosition = best_sport_card?.position_in_sport ?? "-";
  const rankImage = best_sport_card?.rank_info?.rank_image ?? null;

  const tier = detectTierFromImage(rankImage);
  const rankStyle = RANK_STYLES[tier] || RANK_STYLES.bronze;

  const progressBarBlueStart = "#4986F9";
  const progressBarBlueEnd = "#2A387B";

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
      <div className="flex min-h-screen">
        <SidebarNav activePage="stats" />
        <div className="flex-1 p-7 overflow-y-auto">
          <HeaderMenu
            greeting={`${getTimeGreeting()}, ${user.full_name}`}
            date={getCurrentDateFormatted()}
          />

          <div className="rounded-[10px] bg-white/50 p-8 relative min-h-[850px]">
            <h2 className="text-black text-[46px] font-medium mb-4">
              Спортивный престиж
            </h2>

            <p className="text-black/80 text-base mb-6 max-w-[710px]">
              Зарабатывайте опыт в товарищеских/рейтинговых встречах, чтобы
              повышать уровень!
              <br />
              До следующего уровня престижа:
              <span className="font-bold">
                {" "}
                {prestige_info?.points_needed_next_level} очков опыта{" "}
              </span>
            </p>

            <div className="relative mb-12 w-full mx-auto">
              <div
                className="h-[46px] rounded-[50px] border-[3px] border-black shadow-[0_6px_4px_4px_rgba(0,0,0,0.33)] relative overflow-hidden max-w-[90%] mx-auto"
                style={{
                  background: "#000",
                }}
              >
                <div
                  className="h-full rounded-[5000px]"
                  style={{
                    width: `${prestigeProgress}%`,
                    background: `linear-gradient(90deg, ${progressBarBlueStart} 0%, ${progressBarBlueEnd} 100%)`,
                  }}
                />
              </div>

              <div
                className="absolute top-[-19px] right-[170px] text-white text-[50px] font-bold"
                style={{ WebkitTextStroke: "4px black" }}
              >
                {prestige_info?.level}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-20">
              <div
                className="rounded-[55px] border-[1.5px] border-black shadow-[0_14px_4px_0_rgba(0,0,0,0.50)] p-6 flex flex-col items-center relative overflow-visible"
                style={{
                  background: `linear-gradient(90deg, ${rankStyle.from} 0%, ${rankStyle.to} 100%)`,
                }}
              >
                <div className="-top-10 left-1/2 transform -translate-x-1/2 rotate-10 transform-origin-center scale-125 ml-[254px]">
                  <img src={rankImage} alt="Badge" className="w-[299px] h-[298px] object-contain" />
                </div>

                <div
                  className="absolute text-[100px] font-bold text-center mt-48"
                  style={{
                    color: rankStyle.text,
                    WebkitTextStroke: "3px black",
                    textShadow: "0 10px 4px rgba(0,0,0,0.50)",
                    fontFamily: "Piazzolla, serif",
                  }}
                >
                  {getRomanNumeral(bestSportRankName)}
                </div>

                <h3 className="text-white text-[32px] font-light text-center mt-8">
                  Ваш лучший спорт: {best_sport_card?.sport_name || "Не определен"}
                </h3>

                <p className="text-white text-xl text-center mt-4">
                  Ранг: {bestSportRankName} ({bestSportRating} очков)
                  <br />
                  Позиция в рейтинге: {bestSportPosition}
                </p>

                <p className="text-white text-xl text-center mt-4">
                  Всего побед: {best_sport_card?.wins || 0}
                  <br />
                  Win Rate: {best_sport_card?.win_rate || 0}%
                </p>
              </div>

              <div className="rounded-[55px] border-[3px] border-black bg-[#4986F9]/40 shadow-[0_14px_4px_0_rgba(0,0,0,0.50)] p-6">
                <h3 className="text-black text-[30px] text-center mb-6">
                  Последние игры ({recent_games.length})
                </h3>

                <div className="space-y-4">
                  {recent_games.map((game: any) => (
                    <div
                      key={game.id}
                      onClick={() => navigate(`/requests/${game.id}`)}
                      className="border-[3px] border-black rounded-[55px] p-4 cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      <div className="border-[3px] border-black rounded-[50px] px-4 py-3 mb-2">
                        <p className="text-black text-sm font-semibold">{game.title}</p>
                        <p className="text-black text-xs">
                          {game.date} в {game.time} - {game.sport_name}
                        </p>
                      </div>
                      <div
                        className={`border-[3px] border-black rounded-[50px] px-4 py-3 text-center transition-all ${getResultColor(
                          game.personal_result
                        )}`}
                      >
                        <p className="text-white text-sm font-bold">
                          {game.personal_result === "Win"
                            ? "ПОБЕДА"
                            : game.personal_result === "Loss"
                            ? "ПОРАЖЕНИЕ"
                            : game.personal_result === "Draw"
                            ? "НИЧЬЯ"
                            : "АКТИВНА"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate(`/${user.username}/`)}
                  className="w-full mt-6 bg-[#4182F9] text-white text-sm rounded-lg px-6 py-2 drop-shadow-[0_8px_4px_rgba(0,0,0,0.50)] hover:bg-[#3671E8] transition-colors"
                >
                  Как мой профиль видят другие люди?
                </button>
              </div>

              <div className="flex flex-col gap-6">
                <p className="text-black text-2xl font-medium opacity-80">
                  Сейчас в рейтинге Вы выглядите так:
                </p>

                <div
                  className="rounded-[55px] border-[1.5px] border-black p-6"
                  style={{
                    background: `linear-gradient(90deg, ${rankStyle.from} 0%, ${rankStyle.to} 100%)`,
                  }}
                >
                  <div className="rounded-[50px] border-[3px] border-black p-4 flex items-center gap-4">
                    <img
                      src={"/placeholder_avatar.jpg"}
                      alt="Profile"
                      className="w-[58px] h-[58px] rounded-full object-cover"
                    />

                    <div className="flex-1">
                      <h4 className="text-white text-base font-bold flex items-center gap-2">
                        {user?.full_name || "Неизвестный"}
                        {best_sport_icon_url && (
                          <img src={best_sport_icon_url} alt="Best Sport Icon" className="w-5 h-5 object-contain" />
                        )}
                      </h4>
                      <p className="text-xs font-bold bg-gradient-to-b from-[#BCFFAB] via-[#F596FF] to-white bg-clip-text text-transparent">
                        Уровень престижа: {prestige_info?.level}
                        <br />
                        <span className="text-white">Рейтинг: {stats.global_rating}</span>
                      </p>
                    </div>

                    <div className="text-white text-2xl font-bold">#{global_rank_position}</div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <motion.div
                    key={bounceCount}
                    className="cursor-pointer"
                    onClick={() => setBounceCount((prev) => prev + 1)}
                    initial={{ scale: 1 }}
                    animate={{
                      scale: [1, 0.6, 1.4, 0.9, 1.1, 0.95, 1.05, 1],
                      rotate: [0, -5, 5, -3, 3, 0],
                      y: [0, -15, -30, -20, -10, -3, 0],
                    }}
                    transition={{
                      duration: 0.8,
                      times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1],
                      ease: "easeInOut",
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.img
                      src="/wawa_cat.webp"
                      alt="Chubby cat"
                      className="w-[360px] h-[360px] object-contain drop-shadow-2xl select-none"
                      animate={{
                        scaleX: [1, 0.8, 1.3, 0.9, 1.1, 1],
                        scaleY: [1, 1.3, 0.7, 1.1, 0.95, 1],
                      }}
                      transition={{
                        duration: 0.8,
                        times: [0, 0.15, 0.3, 0.5, 0.7, 1],
                        ease: [0.34, 1.56, 0.64, 1],
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}