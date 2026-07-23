import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getTimeGreeting } from '@/components/TimeParse';
import HeaderMenu from "@/components/HeaderMenu";
import { getCurrentDateFormatted } from "@/lib/dateFormatter";
import { useEffect, useState } from "react";
import { getCookie } from "@/lib/csrf";

const OtherSportCard = ({ sport, index }) => {
  const gradientStyle = {
      background: `linear-gradient(90deg, ${sport.gradientFrom || '#2E353D'} 0%, ${sport.gradientTo || '#424D5B'} 100%)`,
  };

  const textStyle = {
      color: sport.badgeColor || '#D9D9D9',
      WebkitTextStroke: "1px black",
      textShadow: "0 10px 4px rgba(0, 0, 0, 0.50)",
      fontFamily: "Piazzolla, serif",
  };

  return (
      <div className="flex items-center relative" key={index}>
          <div className="relative z-10">
              <img
                  src={`${sport.rank_image}?width=234`}
                  alt={sport.sport_name}
                  className="w-[117px] h-[116px] object-contain -rotate-[15deg] scale-125"
              />
              <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[48px] font-medium -rotate-[25deg] text-center mt-7 ml-4"
                  style={textStyle}
              >
                  {sport.roman_numeral}
              </div>
          </div>
          <div
              className="flex-1 rounded-[55px] border-[1.5px] border-black shadow-[0_14px_4px_0_rgba(0,0,0,0.50)] px-6 py-4 -ml-[87px] pl-[130px]"
              style={gradientStyle}
          >
              <p className="text-white text-[22px] font-medium">
                  {sport.sport_name} (
                  {sport.rating})
              </p>
          </div>
      </div>
  );
};

export default function PublicProfile() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const csrfToken = getCookie('csrftoken');
  const { username } = useParams();

  if(!csrfToken) {
    console.error("CSRF token is missing! Check Django configuration.");
    alert("Ошибка безопасности: Отсутствует CSRF-токен.");
    return;
  }

  const fetchPublicProfile = (username) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
      if (!username) return;

      const fetchData = async () => {
        setIsLoading(true);
        setIsError(false);
        try {
          const response = await fetch(`${apiUrl}/profile/public-profile/${username}/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken,
            },
            credentials: 'include'
          });
          if (!response.ok) {
            const errorText = await response.text(); 
            console.log(errorText)
            throw new Error(`Ошибка HTTP-запроса: ${response.status}. Тело ответа: ${errorText.substring(0, 100)}...`);
          }
          const data = await response.json()
          setData(data);
        } catch (err) {
          console.log(err);
          setIsError(true);
          setIsLoading(false);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, [username]);

    return { data, isLoading, isError };
  }

  const {data: profileData, isLoading, isError} = fetchPublicProfile(username);
  const { user: currentUser } = useAuth();

  if (isLoading || !profileData) {
      return <div className="min-h-screen bg-black text-white p-20 text-center">Загрузка профиля...</div>;
  }

  if (isError || !profileData.user_info) {
    console.log(profileData.user_info, isError)
    return <div className="min-h-screen bg-black text-red-500 p-20 text-center">Профиль пользователя не найден или ошибка загрузки.</div>;
  }

  const { user_info, best_sport, other_sports, last_game, global_stats } = profileData;

  const bestRank = best_sport.rank_info;
  const bestWinRate = best_sport.win_rate;
  const totalGames = best_sport.wins + best_sport.losses;

  const getBestSportStyles = (sportName) => {
      return {
          gradientFrom: '#4F0A0A',
          gradientTo: '#780000',
          badgeColor: '#760000',
      };
  };

  const bestSportStyles = getBestSportStyles(best_sport.sport_name);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
        <div className="p-7 pb-0">
            <HeaderMenu
                greeting={`${getTimeGreeting()}, ${currentUser?.full_name}`}
                date={getCurrentDateFormatted()}
                onProfileClick={() => navigate("/profile")}
            />
        </div>

        <div className="max-w-[1280px] mx-auto px-9 py-6">
            <div className="rounded-[10px] bg-[#797777]/50 p-8 relative min-h-[932px]">
                
                {/* Градиентная шапка фона */}
                <div
                    className="absolute top-0 left-0 right-0 h-[88px] rounded-t-[10px]"
                    style={{
                        background: "linear-gradient(90deg, #878DB3 0%, rgba(0, 26, 255, 0.31) 100%)",
                        opacity: 0.5,
                    }}
                />

                {/* === ВЕРХНИЙ БЛОК: ИНФО О ПОЛЬЗОВАТЕЛЕ === */}
                <div className="relative z-10 flex items-start gap-6 mb-8">
                    {/* Аватар */}
                    <img
                        src={user_info.avatar || '/placeholder_avatar.jpg'} // Заглушка, если нет аватара
                        alt="Profile Avatar"
                        className="w-[140px] h-[140px] rounded-full object-cover mt-20 flex-shrink-0"
                    />

                    {/* Текстовая информация */}
                    <div className="flex-1 mt-16">
                        <h1 className="text-white text-[36px] font-light mb-6">
                            {user_info.formatted_name}
                        </h1>

                        <p className="text-white text-[18px] font-medium mb-6">
                            Зарегистрировался в AthleteLink:{" "}
                            {user_info.created_at}
                        </p>

                        <div className="flex gap-4 flex-wrap">
                            <div className="border border-white rounded-[20px] px-6 py-3">
                                <p className="text-white text-xl opacity-80">
                                    Пол: {user_info.gender === 'male' ? 'Мужской' : user_info.gender === 'female' ? 'Женский' : 'Не указан'}
                                </p>
                            </div>
                            <div className="border border-white rounded-[20px] px-6 py-3">
                                <p className="text-white text-xl opacity-80">
                                    Возраст: {user_info.age || 'Не указан'}
                                </p>
                            </div>
                            <div className="border border-white rounded-[20px] px-6 py-3">
                                <p className="text-white text-xl opacity-80">
                                    Местоположение: {user_info.city || 'Не указано'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* === ОСНОВНАЯ СЕТКА (GRID) === */}
                <div className="grid grid-cols-12 gap-6 mt-8">
                    
                    {/* 1. ЛЕВАЯ КОЛОНКА: ЛУЧШИЙ СПОРТ (col-span-3) */}
                    <div className="col-span-3">
                        <div
                            className="rounded-[55px] border-[1.5px] border-black shadow-[0_14px_4px_0_rgba(0,0,0,0.50)] p-6 flex flex-col items-center relative overflow-visible min-h-[445px] mt-10"
                            style={{
                                background: `linear-gradient(90deg, ${bestSportStyles.gradientFrom} 0%, ${bestSportStyles.gradientTo} 100%)`,
                            }}
                        >
                            {/* Иконка и Римская цифра (вынесены вверх) */}
                            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 scale-[1.8] flex items-center justify-center w-[273px] h-[270px]">
                                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 scale-150 flex items-center justify-center w-[75px] h-[75px] mt-[200px]">
                                  <img
                                      src={`${bestRank.rank_image}?width=546`}
                                      alt="Badge"
                                      className="absolute inset-0 w-full h-full object-contain z-10"
                                  />
                                </div>
                                <div
                                    className="absolute inset-0 flex items-center justify-center z-20 text-[100px] font-bold text-center mt-6" // mt-6 для визуальной центровки
                                    style={{
                                        color: bestSportStyles.badgeColor,
                                        WebkitTextStroke: "3px black",
                                        textShadow: "0 10px 4px rgba(0, 0, 0, 0.50)",
                                        fontFamily: "Piazzolla, serif",
                                    }}
                                >
                                    {bestRank.roman_numeral}
                                </div>
                            </div>

                            {/* Текст карточки */}
                            <h3 className="text-[#D9D9D9] text-2xl font-light text-center mt-48">
                                Лучший спорт
                                <br />
                                {user_info.username}: <strong>{best_sport.sport_name}</strong>
                            </h3>

                            <p className="text-[#D9D9D9] text-lg text-center mt-4">
                                Ранг: <strong>{bestRank.rank_name}</strong> ({Math.round(bestRank.progress_percent)}%)
                                <br />
                                Глобальный рейтинг:{" "}
                                <strong>{best_sport.rating}</strong>
                            </p>

                            <p className="text-[#D9D9D9] text-lg text-center mt-4">
                                Всего побед: {best_sport.wins}
                                <br />
                                Win Rate: {best_sport.win_rate}%
                            </p>
                        </div>
                    </div>

                    {/* 2. ЦЕНТРАЛЬНАЯ КОЛОНКА: ТАКЖЕ ИГРАЕТ В (col-span-5) */}
                    <div className="col-span-5 space-y-6">
                        <h3 className="text-white text-xl font-light">
                            {user_info.username} также играет в:
                        </h3>

                        {other_sports.length > 0 ? (
                            other_sports.map((sport, index) => (
                                <OtherSportCard key={index} sport={sport} index={index} />
                            ))
                        ) : (
                            <p className="text-white/50 pl-4">Нет других видов спорта.</p>
                        )}
                    </div>

                    {/* 3. ПРАВАЯ КОЛОНКА: СТАТИСТИКА (col-span-4) */}
                    <div className="col-span-4 space-y-6">
                        
                        {/* Блок: Последняя игра */}
                        <div>
                            <h3 className="text-white text-xl font-light mb-4">
                                Последняя игра:
                            </h3>

                            {last_game ? (
                                <div className="border-[0.3px] border-white rounded-[50px] p-6 space-y-4">
                                    <h4 className="text-white text-[30px] font-light truncate">
                                        {last_game.title}
                                    </h4>

                                    <div className="flex gap-2">
                                        <div className="border-[0.3px] border-white rounded-[50px] px-4 py-2 flex-1">
                                            <p className="text-white text-right text-base font-light">
                                                {last_game.date}, {last_game.time}
                                            </p>
                                        </div>
                                        <div className="border-[0.3px] border-white rounded-[50px] px-4 py-2">
                                            <p className="text-white text-right text-base font-light">
                                                {last_game.sport_name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <p className="text-white text-2xl font-light">
                                            Результат игры:
                                        </p>
                                        {/* Индикатор цвета */}
                                        {last_game.personal_result === 'Win' && <div className="w-6 h-6 rounded-full bg-[#48FF55]/60 border border-black" />}
                                        {last_game.personal_result === 'Loss' && <div className="w-6 h-6 rounded-full bg-[#FF4848]/60 border border-black" />}
                                        {last_game.personal_result === 'Active' && <div className="w-6 h-6 rounded-full bg-yellow-400/60 border border-black" />}
                                    </div>

                                    <p className="text-white text-2xl font-light">
                                        {last_game.personal_result}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-white opacity-70">Нет активных игр.</p>
                            )}
                        </div>

                        {/* Блок: Винрейт (Добавил в дизайн, чтобы заполнить место) */}
                        <div>
                            <h3 className="text-white text-xl font-light mb-4">
                                Общий Win Rate:
                            </h3>
                            <div className="rounded-[20px] border-[1.5px] border-black bg-gradient-to-r from-[#0E6C5C] to-[#12A08B] p-4 text-center">
                                <p className="text-white text-[48px] font-bold">
                                    {global_stats.global_win_rate}%
                                </p>
                            </div>
                        </div>

                        {/* Блок: Положение в общем рейтинге */}
                        <div>
                            <h3 className="text-white text-xl font-light mb-4">
                                Положение в общем рейтинге:
                            </h3>

                            <div className="flex items-center gap-4">
                                {/* Номер места */}
                                <div className="w-[76px] h-[76px] rounded-[20px] border-[2.6px] border-black bg-[#D9D9D9]/20 flex items-center justify-center">
                                    <p className="text-[#D9D9D9]/50 text-2xl font-bold">
                                        {global_stats.global_rank_position}
                                    </p>
                                </div>

                                {/* Карточка профиля */}
                                <div className="flex-1 rounded-[20px] border-[1.5px] border-black bg-gradient-to-r from-[#4F0A0A] to-[#780000] p-4 flex items-center gap-3">
                                    <img
                                        src={user_info.avatar || '/placeholder_avatar.jpg'}
                                        alt={user_info.formatted_name}
                                        className="w-[38px] h-[36px] rounded-full object-cover"
                                    />
                                    <p
                                        className="text-white text-[10px] leading-tight flex-1"
                                        style={{ WebkitTextStroke: "1px white" }}
                                    >
                                        {user_info.formatted_name}
                                    </p>
                                    <img
                                        src={bestRank.rank_image}
                                        alt="Rank Badge"
                                        className="w-[40px] h-[40px] object-contain"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
      </div>
    </div>
  );
}

