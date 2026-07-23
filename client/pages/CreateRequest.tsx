import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import HeaderMenu from "@/components/HeaderMenu";
import { SPORTS } from "@/constants/filterConstants";
import { Calendar } from "@/components/ui/calendar";
import { getTimeGreeting } from '@/components/TimeParse';
import { getCurrentDateFormatted } from "@/lib/dateFormatter";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import YandexMap from "@/components/YandexMap";
import { getCookie } from "@/lib/csrf";

interface MapSelectionData {
  address: string;
  latitude: number;
  longitude: number;
}

interface Sport {
  id: number,
  name: string,
  min_required_players: number,
  max_required_players: number,
}

export default function CreateRequest() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  // --- State ---

  const [sports, setSports] = useState<Sport[]>([]);
  const [playersCount, setPlayersCount] = useState("");
  const [selectedSportId, setSelectedSportId] = useState<number | null>(null);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch(`${apiUrl}/requests/sports/`);
        if(response.ok){
          const data: Sport[] = await response.json();
          setSports(data);
        } else {
          console.error('Failed to fetch sports for some reason');
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    };
    fetchSports();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sportDropdownRef.current && !sportDropdownRef.current.contains(event.target as Node)) {
        setShowSportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [title, setTitle] = useState("");
  const [numberOfPlayers, setNumberOfPlayers] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [dateInput, setDateInput] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [isEventLoading, setIsEventLoading] = useState(false);

  const [formData, setFormData] = useState({
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
  })

  // --- Dropdowns State ---
  const [showSportDropdown, setShowSportDropdown] = useState(false);
  const [showDatePopover, setShowDatePopover] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const sportDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  const locationSuggestions = [
    "г. Москва, ул. 1-я Лагерная, д. 1",
    "г. Москва, Московский авиационный институт",
    "г. Москва, ул. Ленина, д. 10",
  ];

  // --- Handlers ---
  const handleSportSelect = (sportId: number) => {
    setSelectedSportId(sportId);
    setShowSportDropdown(false);
    setPlayersCount("");
  };

  const handlePlayerCountChange = (val: string) => {
    if (val === "" || /^\d+$/.test(val)) {
       setNumberOfPlayers(val);
    }
  };

  const handleMapSelect = (data: MapSelectionData) => {
    setFormData(prev => ({
      ...prev,
      location: data.address, 
      latitude: data.latitude,      
      longitude: data.longitude,
    }));
  };

  const formatDateToDisplay = (date: Date | undefined): string => {
    if (!date) return "";
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
  };

  const parseDateFromInput = (input: string): Date | null => {
    const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    const match = input.match(regex);
    if (match) {
      const d = parseInt(match[1], 10);
      const m = parseInt(match[2], 10) - 1;
      const y = parseInt(match[3], 10);
      const parsedDate = new Date(y, m, d);
      if (parsedDate.getDate() === d && parsedDate.getMonth() === m && parsedDate.getFullYear() === y) {
        return parsedDate;
      }
    }
    return null;
  };

  const handleDateInputChange = (input: string) => {
    setDateInput(input);
    const parsed = parseDateFromInput(input);
    if (parsed) setDate(parsed);
  };

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setDateInput(formatDateToDisplay(selectedDate));
      setShowDatePopover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const csrfToken = getCookie('csrftoken');

    if(!csrfToken) {
      console.error("CSRF token is missing! Check Django configuration.");
      alert("Ошибка безопасности: Отсутствует CSRF-токен.");
      return;
    }
    
    if (!title || !selectedSportId || !playersCount || !dateInput || !time || !formData.location) {
      alert("Пожалуйста, заполните все обязательные поля.");
      return;
    }

    const players = parseInt(numberOfPlayers, 10);

    setIsEventLoading(true);

    const payload = {
      title,
      sport: selectedSportId,
      numberOfPlayers: playersCount,
      date: dateInput,
      time,
      location: formData.location,
      description,
      longitude: formData.longitude,
      latitude: formData.latitude
    };

    try {
      const response = await fetch(`${apiUrl}/requests/create/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
         },
        credentials: 'include', 
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        navigate(`/${user.username}/requests/`);
      } else {
        const err = await response.json();
        console.error(err);
        alert("Ошибка создания заявки. Проверьте данные.");
      }
    } catch (error) {
      console.error(error);
      alert("Ошибка сети.");
    } finally {
      setIsEventLoading(false);
    }
  };

  const getSelectedSport = (): Sport | undefined => {
    if (!selectedSportId) return undefined;
    return sports.find(s => s.id === Number(selectedSportId));
  };

  const sportLimits = getSelectedSport();
  const selectedSportName = sportLimits ? sportLimits.name : "Выберите из списка";

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
      <div className="flex min-h-screen">
        {/* Main Content */}
        <div className="flex-1 p-7">
          <HeaderMenu
            greeting={`${getTimeGreeting()}, ${user.full_name}`}
            date={getCurrentDateFormatted()}
          />

          {/* Main Content Area */}
          <div className="rounded-[10px] bg-[#797777]/50 p-8 min-h-[918px]">
            <div
              className="absolute inset-0 -z-10 rounded-[50px]"
              style={{
                backgroundImage: "url('/silver.png')",
                backgroundSize: "250px 250px",
                backgroundPosition: "0 0",
                backgroundRepeat: "repeat",
                opacity: 0.05,
              }}
            ></div>
            
            <h1 className="text-white text-[64px] font-light text-center mb-8 stroke-black">
              Создание новой заявки
            </h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                
                {/* --- 1. TITLE (Название игры) --- */}
                <div>
                  <label className="block text-white text-[32px] font-normal mb-2 opacity-80">
                    Название игры
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Например: Дворовой матч 5x5"
                    maxLength={100}
                    className="w-full h-[68px] rounded-[15px] bg-[#F9F9F9]/50 px-5 text-[28px] text-black placeholder:text-black/40 outline-none"
                  />
                  <p className="text-white/60 text-sm mt-1 ml-2">
                    Придумайте короткое и емкое название (до 100 символов).
                  </p>
                </div>

                <div>
                  <label className="block text-white text-[32px] font-normal mb-2 opacity-80">
                      Выберите вид спорта
                  </label>
                  <div className="relative" ref={sportDropdownRef}>
                      <button
                          type="button"
                          onClick={() => setShowSportDropdown(!showSportDropdown)}
                          className="w-full h-[68px] rounded-[15px] bg-[#F9F9F9]/50 px-5 flex items-center justify-between"
                      >
                          <span className={`text-[26px] ${sportLimits ? "text-black" : "text-black/40"}`}>
                              {/* 🔑 Используем вычисленное имя */}
                              {selectedSportName} 
                          </span>
                          <span className="text-black/50 text-xl">▼</span>
                      </button>
                      {showSportDropdown && (
                          <div className="absolute top-[76px] left-0 w-full bg-[#2a2a2a] border-2 border-black rounded-[15px] shadow-lg z-50 max-h-[300px] overflow-y-auto">
                              {sports.map((sportOption) => (
                                  <button
                                      key={sportOption.id}
                                      type="button"
                                      onClick={() => {
                                          // 🔑 Устанавливаем только ID
                                          setSelectedSportId(sportOption.id); 
                                          setShowSportDropdown(false);
                                          setPlayersCount(''); 
                                      }}
                                      className="w-full px-5 py-3 text-left text-white text-[20px] font-light hover:bg-[#3a3a3a] border-b border-white/20"
                                  >
                                      {sportOption.name}
                                  </button>
                              ))}
                              {sports.length === 0 && (
                                  <div className="w-full px-5 py-3 text-white/50 text-center">
                                      Загрузка... или Список пуст.
                                  </div>
                              )}
                          </div>
                      )}
                  </div>

                  {/* 🔑 Рендерим поле, только если sportLimits существует (т.е. спорт выбран) */}
                  {sportLimits && ( 
                      <div className="mt-4">
                          <label className="block text-white text-[32px] font-normal mb-2 opacity-80">
                              Количество игроков
                          </label>
                          <input
                              type="number"
                              // 🔑 Используем найденные лимиты
                              min={sportLimits.min_required_players}
                              max={sportLimits.max_required_players}
                              value={playersCount}
                              onChange={(e) => setPlayersCount(e.target.value)}
                              placeholder={`От ${sportLimits.min_required_players} до ${sportLimits.max_required_players}`}
                              className="w-full h-[68px] rounded-[15px] bg-[#F9F9F9]/50 px-5 text-[26px] text-black focus:outline-none"
                              required
                          />
                          <p className="text-white/70 text-sm mt-1">
                              Для выбранного спорта требуется от {sportLimits.min_required_players} до {sportLimits.max_required_players} игроков.
                          </p>
                      </div>
                  )}
              </div>

                {/* --- 4. DATE --- */}
                <div>
                  <label className="block text-white text-[32px] font-normal mb-2 opacity-80">
                    Выберите дату
                  </label>
                  <Popover open={showDatePopover} onOpenChange={setShowDatePopover}>
                    <PopoverTrigger asChild>
                      <button type="button" className="w-full h-[68px] rounded-[15px] bg-[#F9F9F9]/50 px-5 flex items-center justify-between">
                        <span className={`text-[24px] ${dateInput ? "text-black" : "text-black/40"}`}>
                          {dateInput || "ДД.ММ.ГГГГ"}
                        </span>
                        <span className="text-black/50 text-xl">📅</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white">
                       <div className="p-4">
                          <input 
                            type="text" 
                            value={dateInput} 
                            onChange={e => handleDateInputChange(e.target.value)} 
                            placeholder="ДД.ММ.ГГГГ"
                            className="w-full h-[40px] border border-black rounded mb-2 px-2 text-black"
                          />
                          {/* @ts-ignore */}
                          <Calendar selected={date} onSelect={handleCalendarSelect} mode="single" />
                       </div>
                    </PopoverContent>
                  </Popover>
                </div>

                 {/* --- 5. TIME --- */}
                 <div>
                  <label className="block text-white text-[32px] font-normal mb-2 opacity-80">
                    Время
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="ЧЧ:ММ"
                    className="w-full h-[68px] rounded-[15px] bg-[#F9F9F9]/50 px-5 text-[28px] text-black placeholder:text-black/40 outline-none"
                  />
                </div>

              </div>

              {/* Right Column */}
              <div className="space-y-8">
                
                 {/* --- 6. DESCRIPTION (Описание) --- */}
                 <div>
                  <label className="block text-white text-[32px] font-normal mb-2 opacity-80">
                    Описание (опционально)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Правила, требования к экипировке и т.д."
                    maxLength={512}
                    className="w-full h-[260px] rounded-[40px] bg-[#F9F9F9]/50 p-6 text-[24px] text-black placeholder:text-black/40 outline-none resize-none"
                  />
                  <p className="text-white/60 text-sm mt-1 ml-2 text-right">
                    {description.length} / 512 символов
                  </p>
                </div>

                {/* --- 7. LOCATION (Место) --- */}
                <div>
                  <label className="block text-white text-[32px] font-normal mb-2 opacity-80">
                    Место проведения
                  </label>
                  <div className="relative" ref={locationDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                      className="w-full h-[68px] rounded-[15px] bg-[#F9F9F9]/50 px-5 flex items-center justify-between mb-4"
                    >
                      <span className={`text-[22px] truncate ${formData.location ? "text-black" : "text-black/40"}`}>
                        {formData.location || "Адрес или точка на карте"}
                      </span>
                      <span className="text-black/50 text-xl">📍</span>
                    </button>
                    {showLocationDropdown && (
                      <div className="absolute top-[76px] left-0 w-full bg-[#2a2a2a] border-2 border-black rounded-[15px] shadow-lg z-50">
                        {locationSuggestions.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                location: loc,
                                latitude: null,
                                longitude: null,
                              }));

                              setShowLocationDropdown(false);
                            }}
                            className="w-full px-5 py-3 text-left text-white text-[18px] hover:bg-[#3a3a3a] border-b border-white/20"
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <YandexMap onAddressSelect={handleMapSelect} height="250px" />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                  

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-[68px] bg-[#4182F9] rounded-[25px] text-white text-[24px] font-normal shadow-lg hover:bg-[#3571e8] transition-all active:scale-95 disabled:opacity-70"
                    >
                    {isLoading ? "Создание..." : "Создать игру"}
                    </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}