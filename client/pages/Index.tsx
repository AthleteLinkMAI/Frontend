import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { User } from "lucide-react";
import SmallRequestCard from "@/components/SmallRequestCard";

interface Request {
  id: number;
  eventName: string;
  date: string;
  sport: string;
  applicationStatus: string;
  gameResult: string;
  resultColor: "gray" | "black" | "green" | "red";
}

export default function Index() {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const navigate = useNavigate();

  // Состояния для выпадающего списка заявок
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeRequests, setActiveRequests] = useState<Request[]>([]);
  const [isRequestsLoading, setIsRequestsLoading] = useState(true);
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
    if (!user) return; // Загружаем только для авторизованных пользователей

    const fetchActiveRequests = async () => {
      try {
        setIsRequestsLoading(true);
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
        setIsRequestsLoading(false);
      }
    };

    fetchActiveRequests();
  }, [apiUrl, user]);

  const scrollToFeatures = () => {
    const element = document.getElementById("features");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCardClick = (id: number) => {
    navigate(`/requests/${id}`);
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#312900] to-[#524502]">
      {/* Header */}
      <header className="w-full px-8 md:px-16 py-6 flex justify-between items-center relative">
        <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-white tracking-tight leading-[110%] letter-spacing-[-1.68px]">
          AthleteLink
        </h1>

        {/* Центральный выпадающий список (только для авторизованных) */}
        {user && (
          <div className="absolute left-1/2 transform -translate-x-1/2" ref={dropdownRef}>
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
                {isRequestsLoading ? (
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
        )}

        <nav className="flex items-center gap-6 md:gap-10">
          {user ? (
            <div className="flex items-center gap-4">
              {/* Search */}
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

              {/* Stats */}
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

              {/* Notifications */}
              <div className="w-[46px] h-[45px] rounded-[10px] bg-white/50 flex items-center justify-center">
                <svg
                  className="w-[21px] h-[21px]"
                  viewBox="0 0 22 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.6279 5.62871V8.53921"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10.6457 1.74805C7.38654 1.74805 4.74729 4.35264 4.74729 7.56904V9.40449C4.74729 9.99883 4.4993 10.8903 4.18932 11.3973L3.06454 13.2502C2.37373 14.3952 2.85199 15.6712 4.12733 16.0908C8.36076 17.4805 12.9396 17.4805 17.173 16.0908C18.3687 15.6975 18.8823 14.3165 18.2358 13.2502L17.111 11.3973C16.801 10.8903 16.5531 9.99009 16.5531 9.40449V7.56904C16.5442 4.37012 13.8872 1.74805 10.6457 1.74805Z"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13.5772 16.4491C13.5772 18.0486 12.2487 19.3596 10.6279 19.3596C9.822 19.3596 9.07805 19.0275 8.54665 18.5031C8.01526 17.9787 7.67871 17.2445 7.67871 16.4491"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                  />
                </svg>
              </div>

              {/* Profile Picture */}
              <button onClick={() => navigate("/profile")}>
                <img
                  src="/placeholder_avatar.jpg"
                  alt="Profile"
                  className="w-[47px] h-[44px] rounded-[10px]"
                />
              </button>
            </div>
          ) : (
            <>
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
                onClick={() => navigate("/register")}
                className="text-white text-sm md:text-base font-medium hover:opacity-80 transition-opacity capitalize"
              >
                Зарегистрироваться
              </button>
              <button
                onClick={() => navigate("/login")}
                className="text-white text-sm md:text-base font-medium hover:opacity-80 transition-opacity capitalize"
              >
                Войти
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-8 md:px-16 py-20 md:py-32 flex flex-col items-center gap-12 overflow-hidden">
        {/* Animated Emojis */}
        <div className="absolute left-0 top-0 w-full h-full pointer-events-none">
          <img
            src="/lev_biceps.png"
            className="absolute left-[5%] top-[10%] w-[135px] h-[135px] md:w-[173px] md:h-[173px] lg:w-[215px] lg:h-[215px] opacity-50 animate-levitate-slow"
            style={{ transform: "rotate(15deg)" }}
          />
          <img
            src="/lev_medal.png"
            className="absolute right-[5%] top-[15%] w-[154px] h-[154px] md:w-[211px] md:h-[211px] lg:w-[264px] lg:h-[264px] opacity-50 animate-levitate"
            style={{ transform: "rotate(15deg)" }}
          />
        </div>

        <div className="flex flex-col items-center gap-8 max-w-4xl z-10">
          <h2 className="text-4xl md:text-5xl lg:text-[64px] font-bold text-white text-center leading-[110%] tracking-tight">
            Инновационное приложение для спорта
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-white/55 text-center font-medium leading-[145%] max-w-3xl">
            Находи спортивные игры, создавай свои матчи, прокачай рейтинг и поднимайся на вершину таблицы!
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 z-10">
          <button
            onClick={scrollToFeatures}
            className="px-4 md:px-6 py-3 bg-[#493D02] text-[#F1F1F1] rounded-xl border border-black text-base md:text-lg font-medium hover:bg-[#5a4a02] transition-colors"
          >
            Подробнее о проекте
          </button>
          <button
            onClick={() => navigate("/requests")}
            className="px-4 md:px-6 py-3 bg-[#493D02] text-white rounded-xl border border-black text-base md:text-lg font-medium hover:bg-[#5a4a02] transition-colors"
          >
            Найди мероприятие по душе прямо сейчас!
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-8 md:px-16 py-20 md:py-32">
        {/* Feature 1 - Rating System */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 mb-20 md:mb-32">
          <div className="flex-1 flex flex-col gap-12">
            <div className="flex flex-col gap-6">
              <h3 className="text-3xl md:text-4xl lg:text-[48px] font-bold text-white leading-[120%] tracking-tight">
                Уникальная система рейтинга
              </h3>
              <p className="text-base md:text-lg text-white/55 font-medium leading-[145%]">
                Сражайся за место лидера в своём городе! Рейтинговые таблицы и
                ранговая система уровней не дадут тебе заскучать, а реферальная
                программа поможет сделать быстрый старт в мире спорта! Стань
                первым среди лучших и покажи всем свой потенциал!
              </p>
            </div>
          </div>
          <div className="flex-1 w-full">
            <img
              src="/prev_ranks.png"
              className="w-full h-auto rounded-2xl"
            />
          </div>
        </div>

        {/* Feature 2 - Sports Matches */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16 mb-20 md:mb-32">
          <div className="flex-1 flex flex-col gap-12">
            <div className="flex flex-col gap-6">
              <h3 className="text-3xl md:text-4xl lg:text-[48px] font-bold text-white leading-[120%] tracking-tight">
                Проводи матчи в любых видах спорта - от футбола до шахмат
              </h3>
              <p className="text-base md:text-lg text-white/55 font-medium leading-[145%]">
                Тебя ждёт захватывающее спортивное приключение! Будь то футбол,
                волейбол или шахматы - ты отыщешь себе спорт
                по душе! С нашим приложением легко найти партнёров для
                тренировок, команду для соревнований или просто друзей, с
                которыми хочется побегать в парке, сыграть в волейбол или
                попробовать что-то новое.
              </p>
            </div>
          </div>
          <div className="flex-1 w-full">
            <img
              src="/prev_sport.jpg"
              className="w-full h-auto rounded-2xl"
            />
          </div>
        </div>

        {/* Feature 3 - Find Friends */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 flex flex-col gap-12">
            <div className="flex flex-col gap-6">
              <h3 className="text-3xl md:text-4xl lg:text-[48px] font-bold text-white leading-[120%] tracking-tight">
                Находи новых друзей по интересам в твоем городе!
              </h3>
              <p className="text-base md:text-lg text-white/55 font-medium leading-[145%]">
                С помощью нашего сервиса ты обязательно найдёшь себе новых
                друзей и мейтов по спорту! Объединяйтесь в группы,
                организовывайте митапы и соревнования, все в ваших руках!
              </p>
            </div>
          </div>
          <div className="flex-1 w-full">
            <img
              src="/prev_peop.jpg"
              className="w-full h-auto rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="relative px-8 md:px-16 py-20 md:py-32 flex flex-col items-center gap-12 overflow-hidden">
        <div className="absolute left-0 bottom-0 w-full h-full pointer-events-none">
          <img
            src="/lev_pawn.png"
            className="absolute left-[2%] bottom-[10%] w-[154px] h-[154px] md:w-[230px] md:h-[230px] lg:w-[245px] lg:h-[245px] opacity-50"
          />
          <img
            src="/lev_basket.png"
            className="absolute right-[2%] bottom-[10%] w-[154px] h-[154px] md:w-[230px] md:h-[230px] lg:w-[246px] lg:h-[246px] opacity-50"
          />
        </div>

        <div className="max-w-6xl text-center z-10">
          <h2 className="text-2xl md:text-4xl lg:text-[48px] font-bold text-white leading-[130%] tracking-tight mb-8">
            Ты все еще здесь? Чего же ты ждешь? Регистрируйся и преврати спорт в
            игру!
          </h2>
          <p className="text-2xl md:text-4xl lg:text-[48px] font-bold text-white leading-[130%] tracking-tight">
            "Спорт - это дар жизни. Соцсеть для спорта - способ подарить жизнь
            как можно большему количеству людей"
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 md:px-16 py-20 md:py-32 flex flex-col items-center gap-12">
        <div className="flex flex-wrap items-center justify-center gap-4">
        {user ? (
            <button
              onClick={() => navigate("/profile")}
              className="w-full sm:w-auto min-w-[280px] md:min-w-[325px] h-20 px-6 bg-[#313030] text-white rounded-xl border-[1.5px] border-black shadow-[0_8px_4px_0_rgba(0,0,0,0.5)] text-xl md:text-2xl font-medium hover:bg-[#3f3f3f] transition-colors"
            >
              Перейти в профиль
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/register")}
                className="w-full sm:w-auto min-w-[280px] md:min-w-[325px] h-20 px-6 bg-[#313030] text-white rounded-xl border-[1.5px] border-black shadow-[0_8px_4px_0_rgba(0,0,0,0.5)] text-xl md:text-2xl font-medium hover:bg-[#3f3f3f] transition-colors"
              >
                Я новенький
              </button>
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto min-w-[280px] md:min-w-[325px] h-20 px-6 bg-[#313030] text-white rounded-xl border-[1.5px] border-black shadow-[0_8px_4px_0_rgba(0,0,0,0.5)] text-xl md:text-2xl font-medium hover:bg-[#3f3f3f] transition-colors"
              >
                Я уже смешарик
              </button>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 md:px-16 py-12 flex justify-center items-center">
        <p className="text-xl md:text-2xl font-bold text-white text-center leading-[120%] tracking-tight">
          Copyright Team Layar, 2025.
        </p>
      </footer>
    </div>
  );
}