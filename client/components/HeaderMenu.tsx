import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import SmallRequestCard from "@/components/SmallRequestCard";
import { useAuth } from "@/hooks/useAuth";

interface HeaderMenuProps {
  greeting: string;
  date: string;
  onProfileClick?: () => void;
}

interface Request {
  id: number;
  eventName: string;
  date: string;
  sport: string;
  applicationStatus: string;
  personalResult: 'Win' | 'Loss' | '-' | string;
  resultColor: "gray" | "black" | "green" | "red";
}

export default function HeaderMenu({
  greeting,
  date,
  onProfileClick,
}: HeaderMenuProps) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, isLoading: isAuthLoading } = useAuth();
  const [activeRequests, setActiveRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Закрытие выпадающего меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Функция для загрузки активных заявок
  useEffect(() => {
    const fetchActiveRequests = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${apiUrl}/requests/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          // Фильтруем только активные заявки со статусом "Активно"
          const active = data.filter((req: Request) =>
            req.applicationStatus.toLowerCase() === "активно"
          );
          setActiveRequests(active);
        }
      } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveRequests();
  }, [apiUrl]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCardClick = (id: number) => {
    navigate(`/requests/${id}`);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex items-center justify-between mb-12">
      <div>
        <h1 className="text-[#C9D2FF] text-2xl font-medium mb-1">
          {greeting}
        </h1>
        <p className="text-white text-base font-light">{date}</p>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="w-[250px] h-[47px] rounded-[10px] bg-white/50 flex items-center justify-between px-4 hover:bg-white/70 transition-colors relative z-10"
        >
          <span className="text-black text-base font-medium">
            Активные заявки {activeRequests.length > 0 && `(${activeRequests.length})`}
          </span>
          <svg
            className={`w-5 h-5 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="black"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full mt-2 w-[500px] max-h-[400px] overflow-y-auto bg-[#DDD]/95 backdrop-blur-md rounded-[15px] border border-white/30 shadow-xl z-[9999] p-4">
            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-black text-sm">Загрузка...</p>
              </div>
            ) : activeRequests.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-black text-sm">Активные заявки отсутствуют</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-black text-lg font-medium">Активные заявки ({activeRequests.length})</h3>
                  <button
                    onClick={() => {
                      navigate(`/${user.username}/requests/`);
                      setIsDropdownOpen(false);
                    }}
                    className="text-[#4182F9] text-sm hover:underline font-medium"
                  >
                    Все заявки →
                  </button>
                </div>
                <div className="space-y-2">
                  {activeRequests.slice(0, 5).map((request) => (
                    <div
                      key={request.id}
                      onClick={() => handleCardClick(request.id)}
                      className="cursor-pointer"
                    >
                      <SmallRequestCard request={request} />
                    </div>
                  ))}
                  {activeRequests.length > 5 && (
                    <div className="text-center">
                      <p className="text-black text-xs mt-2">
                        ...и еще {activeRequests.length - 5} заявок
                      </p>
                      <button
                        onClick={() => {
                          navigate("/requests");
                          setIsDropdownOpen(false);
                        }}
                        className="text-[#4182F9] text-xs hover:underline mt-1"
                      >
                        Показать все
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/requests")}
          className="w-[46px] h-[47px] rounded-[10px] bg-white/50 flex items-center justify-center hover:bg-white/70 transition-colors"
        >
          <svg
            className="w-[22px] h-[22px]"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.4399 18.1558L15.3026 12.0068C15.9579 10.8276 16.3026 9.50113 16.3041 8.15207C16.3041 6.53974 15.826 4.96362 14.9303 3.62302C14.0345 2.28242 12.7613 1.23755 11.2717 0.620543C9.78213 0.00353215 8.14303 -0.157906 6.56168 0.156643C4.98033 0.471193 3.52777 1.2476 2.38769 2.38769C1.2476 3.52777 0.471193 4.98033 0.156643 6.56168C-0.157906 8.14303 0.00353215 9.78213 0.620543 11.2717C1.23755 12.7613 2.28242 14.0345 3.62302 14.9303C4.96362 15.826 6.53974 16.3041 8.15207 16.3041C9.50113 16.3026 10.8276 15.9579 12.0068 15.3026L18.1558 21.4399C18.6014 21.8215 19.1745 22.0209 19.7607 21.9983C20.3469 21.9756 20.903 21.7326 21.3178 21.3178C21.7326 20.903 21.9756 20.3469 21.9983 19.7607C22.0209 19.1745 21.8215 18.6014 21.4399 18.1558ZM2.32916 8.15207C2.32916 7.00041 2.67067 5.87461 3.3105 4.91704C3.95033 3.95946 4.85974 3.21313 5.92374 2.77241C6.98774 2.33169 8.15853 2.21637 9.28806 2.44105C10.4176 2.66573 11.4551 3.22031 12.2695 4.03465C13.0838 4.849 13.6384 5.88654 13.8631 7.01608C14.0878 8.14561 13.9725 9.3164 13.5317 10.3804C13.091 11.4444 12.3447 12.3538 11.3871 12.9936C10.4295 13.6335 9.30373 13.975 8.15207 13.975C6.60774 13.975 5.12666 13.3615 4.03465 12.2695C2.94265 11.1775 2.32916 9.6964 2.32916 8.15207Z"
              fill="black"
              fillOpacity="0.6"
            />
          </svg>
        </button>

        <button
          onClick={() => navigate("/leaderboard")}
          className="w-[46px] h-[47px] rounded-[10px] bg-white/50 flex items-center justify-center hover:bg-white/70 transition-colors"
        >
          <div className="w-[46px] h-[47px] rounded-[10px] bg-white/50 flex items-center justify-center relative">
            <div className="w-[7px] h-[20px] border-[0.3px] border-black bg-[#D9D9D9] absolute left-3 top-[13px]"></div>
            <div className="w-[7px] h-[11px] border-[0.3px] border-black bg-[#D9D9D9] absolute left-[19px] top-[22px]"></div>
            <div className="w-[7px] h-[16px] border-[0.3px] border-black bg-[#D9D9D9] absolute left-[26px] top-[17px]"></div>
          </div>
        </button>

        <button onClick={onProfileClick || (() => navigate("/profile"))}>
          <img
            src="/placeholder_avatar.jpg"
            alt="Profile"
            className="w-[47px] h-[44px] rounded-[10px]"
          />
        </button>
      </div>
    </div>
  );
}