import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderMenu from "@/components/HeaderMenu";
import { useAuth } from "@/hooks/useAuth";
import { getTimeGreeting } from '@/components/TimeParse';
import { LEADERBOARD_DATA, HEADER_DATA } from "@/constants/leaderboardConstants";
import { RATING_SPORTS } from "@/constants/filterConstants";
import { getCurrentDateFormatted } from "@/lib/dateFormatter";

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overall");
  const [sportFilter, setSportFilter] = useState("Литрбол");
  const [showSportDropdown, setShowSportDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);


  const sportDropdownRef = useRef(null);
  const dateDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sportDropdownRef.current && !sportDropdownRef.current.contains(event.target)) {
        setShowSportDropdown(false);
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target)) {
        setShowDateDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
      <div className="flex min-h-screen">
        <div className="flex-1 p-7">
          <HeaderMenu
            greeting={`${getTimeGreeting()}, ${user.full_name}`}
            date={getCurrentDateFormatted()}
          />

          <div className="rounded-[10px] bg-[#797777]/50 p-8 min-h-[918px] relative">
            <div className="flex gap-4 mb-12">
              

              <button
                onClick={() => setActiveTab("me")}
                className={`h-[76px] px-8 rounded-[20px] border-[2.6px] border-black transition-all ${activeTab === "me" ? "bg-[#D9D9D9]/40" : "bg-[#D9D9D9]/20"}`}
              >
                <span className="text-white text-[24px] font-light">Показать меня</span>
              </button>
              <div className="flex gap-4">
                <div className="relative" ref={sportDropdownRef}>
                  <button
                    onClick={() => setShowSportDropdown(!showSportDropdown)}
                    className="w-[380px] h-[76px] rounded-[20px] border-[2.6px] border-black bg-[#D9D9D9]/40 flex items-center justify-center px-6 relative"
                  >
                    <span className="text-white text-[32px] font-light">{sportFilter}</span>
                  </button>

                  {showSportDropdown && (
                    <div className="absolute top-[88px] left-0 w-[380px] bg-[#2a2a2a] border-[2.6px] border-black rounded-[20px] shadow-lg z-50">
                      {RATING_SPORTS.map((sport) => (
                        <button
                          key={sport}
                          onClick={() => {
                            setSportFilter(sport);
                            setShowSportDropdown(false);
                          }}
                          className="w-full px-6 py-4 text-left text-white text-[20px] font-light hover:bg-[#3a3a3a] transition-colors border-b border-white/20 last:border-b-0"
                        >
                          {sport}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            

            <div className="space-y-3 pr-2 max-h-[700px] overflow-y-auto custom-scrollbar">
              {LEADERBOARD_DATA.map((player) => (
                <div key={player.id} className="flex items-center gap-3 h-[78px]">
                  <div className="w-[81px] h-[76px] flex items-center justify-center rounded-[20px] border-[2.6px] border-black bg-[#D9D9D9]/20 flex-shrink-0">
                    <span className="text-[#D9D9D9]/50 text-2xl font-bold">{player.rank}</span>
                  </div>

                  <div className="flex-1 flex items-center gap-4 h-[78px] rounded-[20px] border-[1.5px] border-black bg-gradient-to-r from-[#4F0A0A] to-[#780000] px-4">
                    <div className="w-[40px] h-[36px] rounded-full flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${player.avatar})` }} />

                    <div className="min-w-[141px]">
                      <p className="text-white text-[10px] font-bold leading-tight [text-shadow:_1px_1px_0_rgb(0_0_0)]">{player.name}</p>
                    </div>

                    <div className="flex-1 min-w-[229px]">
                      <p
                        className="text-[12px] font-bold leading-tight [text-shadow:_1px_1px_0_rgb(0_0_0)]"
                        style={{
                          background: `linear-gradient(180deg, ${player.badgeGradientFrom} 10.58%, ${player.badgeGradientTo} 50%, #FFF 100%)`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {player.badge}
                      </p>
                      <p className="text-white text-[12px] font-bold leading-tight [text-shadow:_1px_1px_0_rgb(0_0_0)]">
                        Уровень опыта: {player.level} ({player.currentXP}/{player.maxXP})
                      </p>
                    </div>

                    <img src={player.medalImage} alt="Medal" className="w-[66px] h-[66px] flex-shrink-0" />
                  </div>
                </div>
              ))}
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
