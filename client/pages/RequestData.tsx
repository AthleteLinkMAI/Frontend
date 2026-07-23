import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import YandexMap from "@/components/YandexMap"
import { getTimeGreeting } from '@/components/TimeParse';
import HeaderMenu from "@/components/HeaderMenu";
import { getCurrentDateFormatted } from "@/lib/dateFormatter";
import { includes, string } from "zod/v4";
import React, { useCallback, useEffect, useState } from "react";
import { request } from "http";
import DisplayMap from "@/components/DisplayMap";

function getCookie(name: string): string | null {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

interface Participant {
  id: number;
  username: string;
  full_name: string;
  formatted_name: string;
}

interface RequestDetail {
  id: number;
  title: string;
  sport: string;
  sport_id: number;
  description: string | null;
  date: string;
  location: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  status_display: string;
  players_count: number;
  current_players: number;
  creator: Participant;
  participants: Participant[];
  is_organizer: boolean;
  is_participant: boolean;
  avgRating: number;
  game_result_text: string | null;
  personal_result: 'Win' | 'Loss' | null;
  latitude: number;
  longitude: number;
}

interface WinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  onConfirm: (winnerIds: number[], gameResult: string) => void;
}

const WinnerModal: React.FC<WinnerModalProps> = ({
  isOpen,
  onClose,
  participants,
  onConfirm
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [gameResult, setGameResult] = useState('');

  if(!isOpen) return null;

  const toggleId = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleConfirm = () => {
    if(!gameResult.trim()) {
      console.error('Неизвестный результат');
      return;
    }
    onConfirm(selectedIds, gameResult);
  };
  return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#2a2a2a] p-8 rounded-[25px] w-full max-w-lg border border-white/20 shadow-2xl">
                <h2 className="text-white text-3xl font-light mb-6">Завершение игры</h2>
                
                <textarea
                    value={gameResult} 
                    onChange={(e) => setGameResult(e.target.value)} 
                    placeholder="Введите результат игры (например: Победа 3:1)"
                    className="w-full p-3 mb-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                />

                <h3 className="text-white/80 text-lg mb-3">Выберите победителей (для начисления рейтинга):</h3>
                
                <div className="max-h-[200px] overflow-y-auto mb-6 space-y-2 pr-2">
                    {participants.map(p => (
                        <div 
                            key={p.id}
                            onClick={() => toggleId(p.id)}
                            className={`p-3 rounded-xl cursor-pointer flex justify-between items-center transition-all duration-200 ${selectedIds.includes(p.id) ? 'bg-[#4182F9]/30 border border-[#4182F9]' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}
                        >
                            <span className="text-white text-base">{p.formatted_name}</span>
                            {selectedIds.includes(p.id) && <span className="text-[#4182F9] text-xl">✅</span>}
                        </div>
                    ))}
                </div>
                
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-6 py-3 text-white/70 hover:text-white transition-colors text-lg">Отмена</button>
                    <button 
                        onClick={handleConfirm}
                        disabled={!gameResult.trim()} 
                        className={`px-8 py-3 rounded-2xl text-white font-semibold text-lg transition-all duration-300 ${!gameResult.trim() ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#4182F9] shadow-lg hover:bg-[#3571e8]'}`}
                    >
                        Завершить
                    </button>
                </div>
            </div>
        </div>
  );
};

export default function RequestData() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { id } = useParams<{ id: string }>();
  
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"

  const [requestData, setRequestData] = useState<RequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  const fetchRequestData = useCallback(async () => {
    if (!id || !user.username) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/requests/${id}/`, {
        headers: {
          'Content-Type': 'applcation/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Заявка не найдена');
        }
        throw new Error(`Ошибка загрузки данных: ${response.statusText}`);
      }
      const data = await response.json();
      console.log(data);
      setRequestData(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : 'Не удалось загрузить информацию об игре');
    } finally {
      setIsLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (user && !isAuthLoading) {
      fetchRequestData();
    }
  }, [user, isAuthLoading, fetchRequestData]);

  const performAction = useCallback(async (endpoint: string, body: any = null) => {
    if(!requestData || !user.username) return;

    setActionLoading(true);
    setError(null);

    const csrfToken = getCookie('csrftoken');

    try {
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken || '',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      };

      if(body) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(`${apiUrl}/requests/${requestData.id}/${endpoint}/`, fetchOptions);

      if (!response.ok){
        let errorMessage = response.statusText;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.error || response.statusText;
        } catch (e) {

        }
        throw new Error(errorMessage);
      }
      
      if(endpoint === 'cancel') {
        navigate('/requests');
        return;
      }

      await fetchRequestData();

      if (endpoint === 'finish') {
        setShowWinnerModal(false);
      }
    } catch (err) {
      console.error('Action Error', err);
      alert(err instanceof Error ? err.message : 'Произошла ошибка при выполнении действия');
    } finally {
      setActionLoading(false);
    }
  }, [requestData, user, fetchRequestData]);


  const handleJoin = () => performAction('join');
  const handleLeave = () => performAction('leave');
  const handleStart = () => performAction('start');
  const handleCancel = () => {
    if(window.confirm('Вы действительно хотите отменить/удалить заявку')){
      performAction('cancel');
    }
  };

  const handleKick = (userId: number) => {
    if(window.confirm('Исключить игрока?')) {
      performAction('kick', {user_id: userId})
    }
  };

  const handleFinish = (winnerIds: number[], gameResultText: string) => {
    performAction('finish', { winners_ids: winnerIds, game_result_text: gameResultText});
  };

  const showMap = requestData?.latitude && requestData?.longitude && requestData?.location;

  if(isAuthLoading || isLoading) {
    return (
            <div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] flex items-center justify-center">
                <p className="text-white text-2xl">Загрузка данных...</p>
            </div>
    );
  }

  if(error) {
    return (
            <div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] p-8">
                <div className="bg-red-900/50 p-6 rounded-xl text-white text-center">
                    <p className="text-2xl font-bold mb-4">Ошибка</p>
                    <p>{error}</p>
                    <button onClick={() => navigate("/profile")} className="mt-4 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700">
                        Вернуться
                    </button>
                </div>
            </div>
    );
  }

  if(!requestData) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] flex items-center justify-center">
            <p className="text-white text-2xl">Заявка не найдена.</p>
        </div>
    );
  }

  const renderActionButtons = () => {
    const {status, is_organizer, is_participant, current_players, players_count} = requestData;
    const isFull = current_players >= players_count;

    if(status === 'completed' || status === 'cancelled') {
      return (
          <button
              onClick={() => navigate("/profile")}
              className="rounded-[25px] bg-[#1D2C4D] shadow-[0_8px_4px_0_rgba(0,0,0,0.50)] px-4 py-7 hover:bg-[#2a3d5e] transition-colors w-full"
          >
              <span className="text-white text-[25px] font-normal">
                  Вернуться в профиль
              </span>
          </button>
      );
    }

    if(is_organizer) {
      if (status === 'planned') {
        return (
            <>
                <button 
                    onClick={handleStart} 
                    disabled={actionLoading || current_players < 2}
                    className={`rounded-[25px] px-4 py-6 mb-6 w-full text-white text-[25px] font-normal shadow-[0_8px_4px_0_rgba(0,0,0,0.50)] transition-colors ${actionLoading || current_players < 2 ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#304A7D] hover:bg-[#3d5a94]'}`}
                >
                    {actionLoading ? 'Загрузка...' : 'Начать игру'}
                </button>
                <button 
                    onClick={handleCancel} 
                    disabled={actionLoading}
                    className={`rounded-[25px] px-4 py-6 w-full text-white text-[25px] font-normal shadow-[0_8px_4px_0_rgba(0,0,0,0.50)] transition-colors ${actionLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#7D3030] hover:bg-[#994040]'}`}
                >
                    {actionLoading ? 'Загрузка...' : 'Отменить заявку'}
                </button>
            </>
        );
      }
      if (status === 'active') {
        return (
            <button 
                onClick={() => setShowWinnerModal(true)} 
                disabled={actionLoading}
                className={`rounded-[25px] px-4 py-6 mb-6 w-full text-white text-[25px] font-normal shadow-[0_8px_4px_0_rgba(0,0,0,0.50)] transition-colors ${actionLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800'}`}
            >
                {actionLoading ? 'Загрузка...' : 'Завершить игру'}
            </button>
        );
      }
    }
      
      if (is_participant) {
            if (status === 'planned' || status === 'active') {
                return (
                    <button 
                        onClick={handleLeave} 
                        disabled={actionLoading}
                        className={`rounded-[25px] px-4 py-6 w-full text-white text-[25px] font-normal shadow-[0_8px_4px_0_rgba(0,0,0,0.50)] transition-colors ${actionLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#7D3030] hover:bg-[#994040]'}`}
                    >
                        {actionLoading ? 'Загрузка...' : 'Покинуть игру'}
                    </button>
                );
            }
        }

        // 4. Если гость (не участник и не организатор)
        if (!is_organizer && !is_participant && status === 'planned') {
            return (
                <button 
                    onClick={handleJoin} 
                    disabled={actionLoading || isFull}
                    className={`rounded-[25px] px-4 py-6 mb-6 w-full text-white text-[25px] font-normal shadow-[0_8px_4px_0_rgba(0,0,0,0.50)] transition-colors ${actionLoading || isFull ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#304A7D] hover:bg-[#3d5a94]'}`}
                >
                    {actionLoading ? 'Загрузка...' : isFull ? 'Нет свободных мест' : 'Подать запрос на вступление'}
                </button>
            );
        }

        return null;
    };
    
    const renderStatusMessage = () => {
      const { status, status_display, game_result_text, personal_result} = requestData;

      if (status === 'completed') {
        let resultText = "Неизвестно";
        let resultColorClass = "bg-gray-900/50 border-gray-600";
        if (personal_result === 'Win') {
            resultColorClass = "bg-green-900/50 border-green-500";
            resultText = "Победа";
        } else if (personal_result === 'Loss') {
            resultColorClass = "bg-red-900/50 border-red-500";
            resultText = "Поражение";
        }
        return (
                <div className={`p-4 rounded-xl border mb-6 ${resultColorClass}`}>
                    <p className="text-white text-[34px] font-bold leading-tight mb-2">
                        {resultText}
                    </p>
                    <p className="text-white/80 text-xl">
                        Статус: {status_display}
                    </p>
                    {game_result_text && (
                        <p className="text-white text-2xl mt-2 font-mono bg-black/20 p-2 rounded inline-block">
                           Счет: {game_result_text}
                        </p>
                    )}
                </div>
            );
      }
        
        if (status === 'cancelled') {
             return (
                <div className="p-4 rounded-xl bg-red-900/50 border border-red-600 mb-6">
                    <p className="text-white text-[34px] font-light leading-tight">
                        Заявка <span className="font-bold">{status_display}</span>.
                    </p>
                </div>
            );
        }

        if (status === 'active') {
             return (
                <div className="p-4 rounded-xl bg-yellow-900/50 border border-yellow-600 mb-6">
                    <p className="text-white text-[34px] font-light leading-tight">
                        Игра <span className="font-bold">{status_display}</span>.
                    </p>
                </div>
            );
        }

        return (
            <div className="mt-[100px]">
                <p className="text-white text-[34px] font-light leading-tight">
                    Заявка в статусе <span className="font-bold">{status_display}</span>.
                </p>
            </div>
        );
    };
    
    const renderParticipant = (player: Participant, isCreator: boolean) => {
      const {is_organizer} = requestData;
      const isCurrentUser = user && user.username === player.username;

      let gradientFrom = '#1D2C4D';
        let gradientTo = '#304A7D';

        if (isCreator) {
             gradientFrom = '#493D02'; // Золотистый оттенок для создателя
             gradientTo = '#7D5C05';
        } else if (isCurrentUser) {
             gradientFrom = '#304A7D'; // Синий для себя
             gradientTo = '#4182F9';
        }


        return (
            <div
                key={player.id}
                className="rounded-[25px] border-[1.5px] border-black p-3 flex items-center gap-3 relative"
                style={{
                    background: `linear-gradient(90deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
                }}
            >   
                <div className="flex items-center justify-center flex-1 min-w-0">
                    <p
                        className="text-white text-[12px] font-bold text-center leading-tight truncate px-1"
                        style={{
                            WebkitTextStroke: "0px black",
                        }}
                    >
                        {player.formatted_name}
                    </p>
                </div>

                {/* ИКОНКА ОРГАНИЗАТОРА */}
                {isCreator && (
                     <span className="text-yellow-300 text-lg absolute top-1 right-2" title="Организатор">★</span>
                )}
                
                {/* КНОПКА ИСКЛЮЧЕНИЯ (только для организатора, не для себя) */}
                {is_organizer && !isCurrentUser && !isCreator && requestData.status === 'planned' && (
                    <button
                        onClick={(e) => { e.stopPropagation(); handleKick(player.id); }}
                        className="w-5 h-5 bg-red-600 rounded-full text-white text-xs flex items-center justify-center absolute top-1 right-1 hover:bg-red-800 transition-colors"
                        title="Исключить"
                        disabled={actionLoading}
                    >
                        &times;
                    </button>
                )}
            </div>
        );
    }

  const {
    id: requestNumber,
    title,
    sport,
    description,
    date: dateTime,
    location: venueLabel, 
    avgRating, 
    current_players: playerCount, 
    players_count: maxPlayers, 
    participants, 
    creator,
  } = requestData;

  return (
      <div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
        <div className="flex-1 p-7 overflow-y-auto">
          <HeaderMenu
            greeting={`${getTimeGreeting()}, ${user.full_name}`}
            date={getCurrentDateFormatted()}
          />
          <div className="px-7 py-9">
            {actionLoading && (
              <div className="fixed top-0 left-0 right-0 p-3 bg-blue-500 text-white text-center z-50">
                Выполняется действие...
              </div>
            )}
            {error && (
              <div className="fixed top-0 left-0 right-0 p-3 bg-red-600 text-white text-center z-50">
                Ошибка: {error}
              </div>
            )}

            <div className="relative">
              <div className="rounded-[10px] bg-[#797777]/50 px-9 py-12 min-h-[1064px]">
                <div className="flex gap-8">
                  {/* ЛЕВАЯ КОЛОНКА (ДЕТАЛИ И УЧАСТНИКИ) */}
                  <div className="flex-1">
                    <div className="border-[0.5px] border-white rounded-[50px] p-8 mb-8 relative">
                      <h1 className="text-white text-[50px] font-light text-center mb-8">
                        Заявка №{requestNumber}
                      </h1>

                      <div className="mb-6">
                        <h2 className="text-white text-[30px] font-light mb-2">
                          {title}
                        </h2>
                        <p className="text-white text-[25px] font-light">
                          {sport}
                        </p>
                      </div>

                      <div className="mb-6">
                        <p className="text-white text-[17px] font-light leading-relaxed">
                          Описание игры:
                          <br />
                          {description || "Описание отсутствует."}
                        </p>
                      </div>

                      <div className="flex gap-3 justify-end mb-6">
                        {/* Ср. рейтинг */}
                        <div className="border border-white rounded-[50px] px-5 py-2">
                          <span className="text-white text-[17px] font-light">
                            Ср. рейтинг: {avgRating}
                          </span>
                        </div>
                        {/* Дата/Время */}
                        <div className="border border-white rounded-[50px] px-4 py-2">
                          <span className="text-white text-base font-light">
                            {dateTime}
                          </span>
                        </div>
                        {/* Игроки */}
                        <div className="border border-white rounded-[50px] px-4 py-2">
                          <span className="text-white text-[15px] font-light">
                            Игроков: {playerCount}/{maxPlayers}
                          </span>
                        </div>
                      </div>

                      {/* СПИСОК УЧАСТНИКОВ */}
                      <div className="relative">
                        <div className="grid grid-cols-4 gap-x-[18px] gap-y-3 mb-8 max-h-[260px] overflow-y-auto pr-4">
                          {/* Сначала организатор */}
                          {renderParticipant(creator, true)}

                          {/* Затем остальные участники */}
                          {participants.filter(p => p.id !== creator.id).map(p => renderParticipant(p, false))}
                        </div>
                      </div>
                    </div>

                    <div className="my-8">
                      <h3 className="text-3xl font-semibold mb-4 text-white">
                          Местоположение
                      </h3>
                      <div className="rounded-[40px] shadow-lg overflow-hidden">
                      {showMap ? (
                          <DisplayMap
                              latitude={requestData.latitude}
                              longitude={requestData.longitude}
                              address={requestData.location}
                              height="400px" // Можно настроить высоту
                          />
                      ) : (
                          <p className="p-8 bg-[#DDD]/50 text-center">
                              Данные о местоположении загружаются или отсутствуют.
                          </p>
                      )}
                      </div>
                      
                  </div>
                  </div>

                  <div className="w-[412px] flex flex-col">
                    <div className="relative mb-[30px] flex justify-end">
                      <div className="relative w-110 h-110">
                        <img
                          src="/basket_decor.webp"
                          className="w-full h-full object-contain rounded-xl"
                        />
                      </div>
                    </div>

                    {/* СООБЩЕНИЕ О СТАТУСЕ */}
                    {renderStatusMessage()}

                    {/* ДИНАМИЧЕСКИЕ КНОПКИ */}
                    <div className="flex flex-col gap-6">
                      {renderActionButtons()}
                    </div>

                    {/* КНОПКА НАЗАД (если динамическая не отображается) */}
                    {requestData.status !== 'completed' && requestData.status !== 'cancelled' && (
                      <button
                        onClick={() => navigate("/profile")}
                        className="rounded-[25px] bg-[#1D2C4D] shadow-[0_8px_4px_0_rgba(0,0,0,0.50)] px-4 py-7 mt-6 hover:bg-[#2a3d5e] transition-colors"
                      >
                        <span className="text-white text-[25px] font-normal">
                          Вернуться в профиль
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* МОДАЛЬНОЕ ОКНО */}
          <WinnerModal
            isOpen={showWinnerModal}
            onClose={() => setShowWinnerModal(false)}
            participants={participants}
            onConfirm={handleFinish}
          />
        </div>
      </div>
    );
}