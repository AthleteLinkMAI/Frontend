import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getTimeGreeting } from '@/components/TimeParse';
import { useNavigate } from "react-router-dom";
import HeaderMenu from "@/components/HeaderMenu";
import SidebarNav from "@/components/SidebarMenu";
import { getCurrentDateFormatted } from "@/lib/dateFormatter";
import { getCookie } from "@/lib/csrf";

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SECRET_QUESTIONS = [
  "Девичья фамилия матери",
  "Имя первого питомца",
  "Город, где вы родились",
  "Любимый школьный учитель",
  "Любимая компьютерная игра",
  "Номер машины вашего отца"
];

export default function Settings() {
  const navigate = useNavigate();
  const { logoutUser, user, isLoading, refetchUser } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSecretAnswer, setPasswordSecretAnswer] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[] | null>(null);
  const [passwordErrorSingle, setPasswordErrorSingle] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showQuestionDropdown, setShowQuestionDropdown] = useState(false);
  const [selectedSecretQuestion, setSelectedSecretQuestion] = useState<string>("");
  const [secretAnswer, setSecretAnswer] = useState("");
  const [currentSecretAnswer, setCurrentSecretAnswer] = useState("");
  const [secretError, setSecretError] = useState<string | null>(null);
  const [secretSuccess, setSecretSuccess] = useState<string | null>(null);
  const [isSavingSecret, setIsSavingSecret] = useState(false);

  if (isLoading) {
    return <div>Загрузка настроек...</div>
  }

  if (!user) {
    return <div>Ошибка: пользователь не авторизован</div>
  }

  const userHasQuestion = Boolean(user.secret_question);

  const checkClientPasswordRequirements = (pwd: string) => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push("Не менее 8 символов.");
    if (!/[A-Z]/.test(pwd)) errors.push("Не менее 1 заглавной буквы.");
    if (!/[a-z]/.test(pwd)) errors.push("Не менее 1 строчной буквы.");
    if (!/[0-9]/.test(pwd)) errors.push("Не менее 1 цифры.");
    return errors;
  };

  const handleChangePassword = async () => {
    setPasswordErrors(null);
    setPasswordErrorSingle(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordErrorSingle("Введите текущий пароль.");
      return;
    }
    if (!newPassword) {
      setPasswordErrorSingle("Введите новый пароль.");
      return;
    }

    const clientErrors = checkClientPasswordRequirements(newPassword);
    if (clientErrors.length > 0) {
      setPasswordErrors(clientErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const csrfToken = getCookie('csrftoken');
      if (!csrfToken) {
        setPasswordErrorSingle("CSRF token отсутствует. Попробуйте перезагрузить страницу.");
        setIsSubmitting(false);
        return;
      }

      const resp = await fetch(`${apiUrl}/profile/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          secret_answer: user.secret_question ? passwordSecretAnswer : null
        }),
      });

      if (resp.ok) {
        const data = await resp.json().catch(() => null);
        setPasswordSuccess(data?.detail || "Пароль успешно изменён. Перезагрузите страницу");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        let json: any = null;
        try { json = await resp.json(); } catch (e) { json = null; }

        if (json) {
          if (json.errors && Array.isArray(json.errors)) {
            setPasswordErrors(json.errors);
          } else if (json.error) {
            setPasswordErrorSingle(json.error);
          } else {
            setPasswordErrorSingle("Не удалось изменить пароль. Попробуйте ещё раз.");
          }
        } else {
          setPasswordErrorSingle(`Ошибка сервера: ${resp.status}`);
        }
      }
    } catch (err) {
      console.error("Network error:", err);
      setPasswordErrorSingle("Сетевая ошибка. Проверьте соединение.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSecretQuestion = async () => {
    setSecretError(null);
    setSecretSuccess(null);

    if (!selectedSecretQuestion) {
      setSecretError("Выберите секретный вопрос.");
      return;
    }
    if (!secretAnswer) {
      setSecretError("Введите ответ на секретный вопрос.");
      return;
    }

    if (userHasQuestion && !currentSecretAnswer) {
      setSecretError("Введите текущий ответ на секретный вопрос.");
      return;
    }

    setIsSavingSecret(true);

    try {
      const csrfToken = getCookie('csrftoken');
      if (!csrfToken) {
        setSecretError("CSRF token отсутствует. Попробуйте перезагрузить страницу.");
        setIsSavingSecret(false);
        return;
      }

      const payload: any = {
        new_secret_question: selectedSecretQuestion,
        new_secret_answer: secretAnswer,
      };

      if (userHasQuestion) {
        payload.current_secret_answer = currentSecretAnswer;
      }

      const resp = await fetch(`${apiUrl}/profile/change-secret-question/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await resp.json().catch(() => null);

      if (resp.ok) {
        setSecretSuccess(json?.detail || "Секретный вопрос сохранён.");
        setSelectedSecretQuestion("");
        setSecretAnswer("");
        setCurrentSecretAnswer("");
        await refetchUser();
      } else {
        if (json && json.error) {
          setSecretError(json.error);
        } else {
          setSecretError("Ошибка при сохранении секретного вопроса.");
        }
      }
    } catch (err) {
      console.error("Network error:", err);
      setSecretError("Сетевая ошибка. Проверьте соединение.");
    } finally {
      setIsSavingSecret(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm("Вы действительно хотите выйти?");
    if (confirmed) {
      setIsLoggingOut(true);

      try {
        await logoutUser();
      } finally {
        setIsLoggingOut(false);
      }
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Вы уверены, что хотите удалить учетную запись? Это действие необратимо.",
    );
    if (confirmed) {
      console.log("Deleting account...");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
      <div className="flex min-h-screen">
        <SidebarNav activePage="settings" />

        <div className="flex-1 p-7 overflow-y-auto">
          <HeaderMenu
            greeting={`${getTimeGreeting()}, ${user.full_name}`}
            date={getCurrentDateFormatted()}
          />

          <div className="rounded-[10px] bg-white/50 p-8 relative min-h-[748px]">
            <h2 className="text-black text-4xl font-bold mb-6">Смена пароля</h2>

            <div className="flex flex-col gap-4 mb-6">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ваш текущий пароль"
                className="w-full max-w-[526px] h-[46px] rounded-lg bg-[#F9F9F9]/50 px-4 text-black/40 text-base outline-none placeholder:text-black/40"
              />

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ваш новый пароль"
                className="w-full max-w-[526px] h-[45px] rounded-lg bg-[#F9F9F9]/50 px-4 text-black/40 text-base outline-none placeholder:text-black/40"
              />
            </div>
            {user.secret_question && (
              <input
                type="text"
                value={passwordSecretAnswer}
                onChange={(e) => setPasswordSecretAnswer(e.target.value)}
                placeholder="Ответ на текущий секретный вопрос"
                className="w-full max-w-[526px] h-[46px] rounded-lg bg-[#F9F9F9]/50 px-4 text-black/40 text-base outline-none placeholder:text-black/40"
              />
            )}

            <p className="text-black text-base opacity-80 mb-3 max-w-[526px]">
              Требования: не менее 8 символов, не менее 1 заглавной буквы, не
              менее 1 строчной буквы, не менее 1 цифры
            </p>

            <div className="mb-4 max-w-[526px]">
              {passwordSuccess && (
                <div className="text-green-700 bg-green-100 p-3 rounded-md mb-2">
                  {passwordSuccess}
                </div>
              )}

              {passwordErrorSingle && (
                <div className="text-red-700 bg-red-100 p-3 rounded-md mb-2">
                  {passwordErrorSingle}
                </div>
              )}

              {passwordErrors && passwordErrors.length > 0 && (
                <div className="text-red-700 bg-red-100 p-3 rounded-md mb-2">
                  <ul className="list-disc pl-5">
                    {passwordErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={handleChangePassword}
              className={`w-[217px] h-[38px] rounded-lg text-white text-base text-center mb-20 ${isSubmitting ? 'bg-[#6ea0ff]/60' : 'bg-[#4182F9]'}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Отправка..." : "Изменить пароль"}
            </button>

            <h2 className="text-black text-4xl font-bold mb-2">
              Секретный вопрос
            </h2>

            {userHasQuestion ? (
              <p className="text-black text-base opacity-80 mb-4">
                Текущий секретный вопрос: <span className="font-medium">{user.secret_question}</span>
              </p>
            ) : (
              <p className="text-black text-base opacity-80 mb-4">
                Текущий секретный вопрос: не установлен.
              </p>
            )}

            <div className="space-y-4 mb-6 relative">
              {userHasQuestion && (
                <input
                  type="text"
                  value={currentSecretAnswer}
                  onChange={(e) => setCurrentSecretAnswer(e.target.value)}
                  placeholder="Ответ на текущий секретный вопрос"
                  className="w-full max-w-[526px] h-[46px] rounded-lg bg-[#F9F9F9]/50 px-4 text-black/40 text-base outline-none placeholder:text-black/40"
                />
              )}

              <div className="relative w-full max-w-[526px]">
                <input
                  type="text"
                  value={selectedSecretQuestion}
                  onChange={(e) => setSelectedSecretQuestion(e.target.value)}
                  onClick={() => setShowQuestionDropdown(!showQuestionDropdown)}
                  placeholder="Выберите вопрос из списка"
                  className="w-full h-[46px] rounded-lg bg-[#F9F9F9]/50 px-4 text-black/40 text-base outline-none placeholder:text-black/40 pr-12"
                  readOnly
                />
                <button
                  onClick={() => setShowQuestionDropdown(!showQuestionDropdown)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <svg
                    className="w-[22px] h-[21px] opacity-50"
                    viewBox="0 0 22 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.2602 7.83124L12.2836 13.5362C11.5777 14.21 10.4227 14.21 9.7169 13.5362L3.74023 7.83124"
                      stroke="#292D32"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {showQuestionDropdown && (
                  <div className="absolute z-50 mt-2 w-full bg-white border border-black/10 rounded-lg shadow-xl overflow-hidden">
                    {SECRET_QUESTIONS.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedSecretQuestion(question);
                          setShowQuestionDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 text-black hover:bg-[#F9F9F9] transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="text"
                value={secretAnswer}
                onChange={(e) => setSecretAnswer(e.target.value)}
                placeholder="Введите ответ"
                className="w-full max-w-[526px] h-[46px] rounded-lg bg-[#F9F9F9]/50 px-4 text-black/40 text-base outline-none placeholder:text-black/40"
              />
            </div>

            <div className="mb-4 max-w-[526px]">
              {secretSuccess && (
                <div className="text-green-700 bg-green-100 p-3 rounded-md mb-2">
                  {secretSuccess}
                </div>
              )}
              {secretError && (
                <div className="text-red-700 bg-red-100 p-3 rounded-md mb-2">
                  {secretError}
                </div>
              )}
            </div>

            <div className="flex gap-4 items-center  mb-6">
              <button
                onClick={handleSaveSecretQuestion}
                className="w-[217px] h-[38px] rounded-lg bg-[#4182F9] text-white text-base text-center"
                disabled={isSavingSecret}
              >
                {isSavingSecret ? "Сохранение..." : (userHasQuestion ? "Изменить секретный вопрос" : "Сохранить секретный вопрос")}
              </button>
            </div>

            <div className="flex gap-4 items-center justify-end mb-6">
              <button
                onClick={handleLogout}
                className="w-[257px] h-[38px] rounded-lg bg-[#B52626] text-white text-base text-center"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Выход...' : 'Выйти'}
              </button>
            </div>

            <div className="flex gap-4 items-center justify-end ">
              <button
                onClick={handleDeleteAccount}
                className="w-[257px] h-[38px] rounded-lg bg-[#B52626] text-white text-base text-center"
              >
                Удалить учетную запись
              </button>
            </div>

            <div className="flex justify-between items-end">
              <p className="text-black text-base opacity-80">
                App Version: 0.1 Alphadev 13.10.25
              </p>
            </div>

            <img
              src="/MAI_logo.png"
              alt="MAI Logo"
              className="absolute right-8 top-[280px] w-[367px] h-[354px] object-contain animate-levitate-active"
            />
          </div>
        </div>
      </div>
    </div>
  );
}