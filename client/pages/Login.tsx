import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

    try {
        const response = await fetch(`${apiUrl}/user/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', 
            body: JSON.stringify({ email, password }),
        });

      const data = await response.json();

      if(response.ok) {
        await queryClient.invalidateQueries({ queryKey: ['auth-user'] });
        await queryClient.refetchQueries({ queryKey: ['auth-user'] });
        console.log("Login success:", data);
        navigate(`/profile/`);
        console.log("navigate successfull");
      } else{
        console.error("Login error:", data);
        let errorMessage = "Произошла ошибка при входе";
        if (data.errors){
          if (data.errors.non_field_errors) errorMessage = data.errors.non_field_errors[0];
          else if (data.errors.email) errorMessage = data.errors.email[0];
          else if (data.errors.password) errorMessage = data.errors.password[0];
        }
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Ошибка соединения с сервером. Скорее всего, Docker не запущен.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated Trophy Emojis */}
      <div className="absolute left-0 top-0 w-full h-full pointer-events-none">
        <img
          src="/lev_trophy.webp"
          alt=""
          className="absolute left-0 md:left-0 top-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 lg:w-[354px] lg:h-[354px] opacity-90 animate-levitate-active"
        />
        <img
          src="/lev_trophy.webp"
          alt=""
          className="absolute right-0 md:right-0 top-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 lg:w-[354px] lg:h-[354px] opacity-90 animate-levitate-active-slow"
        />
      </div>

      {/* Login Form Container */}
      <div className="relative z-10 w-full max-w-[572px]">
        <div className="bg-black/50 border border-[#E0E0E0] shadow-[0_82px_40px_rgba(100,100,100,0.08)] p-8 md:p-12 lg:p-16">
          <h1 className="text-2xl md:text-3xl lg:text-[31px] font-bold text-white text-center mb-8 md:mb-12 leading-[120%] tracking-tight">
            Авторизация в AthleteLink
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email/Username Field */}
            <div className="relative">
              <div className="border border-[#212121] bg-black p-4">
                <label className="block text-white text-[10px] font-medium mb-2">
                  Адрес электронной почты/имя пользователя
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mai@mai.education"
                  className="w-full bg-transparent text-[#616161] text-base outline-none placeholder:text-[#616161]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="border border-[#212121] bg-black p-4">
                <label className="block text-white text-[10px] font-medium mb-2">
                  Пароль
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="**********"
                    className="flex-1 bg-transparent text-[#757575] text-base outline-none placeholder:text-[#757575]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="w-4 h-4 flex items-center justify-center"
                  >
                    <svg
                      width="16"
                      height="11"
                      viewBox="0 0 16 11"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M16 5.5C16 5.5 13 0 8 0C3 0 0 5.5 0 5.5C0 5.5 3 11 8 11C13 11 16 5.5 16 5.5ZM1.173 5.5C1.65652 6.23488 2.21265 6.91931 2.83301 7.543C4.12 8.832 5.88 10 8 10C10.12 10 11.879 8.832 13.168 7.543C13.7884 6.91931 14.3445 6.23487 14.828 5.5C14.3445 4.76512 13.7884 4.08068 13.168 3.457C11.879 2.168 10.119 1 8 1C5.88 1 4.121 2.168 2.832 3.457C2.21164 4.08069 1.65551 4.76513 1.172 5.50001L1.173 5.5Z"
                        fill="#BEBEBE"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.5 1C2.11929 1 1 2.11928 1 3.49999C0.999996 4.8807 2.11928 5.99999 3.49999 6C4.8807 6 5.99999 4.88072 5.99999 3.50001C6 2.1193 4.88072 1.00001 3.50001 1H3.5ZM0 3.5C0 2.24957 0.667096 1.09413 1.75 0.468912C2.8329 -0.156303 4.16709 -0.156304 5.25 0.46891C6.3329 1.09412 7 2.24957 7 3.5C7 4.75043 6.3329 5.90587 5.25 6.53109C4.1671 7.1563 2.8329 7.1563 1.75 6.53109C0.667097 5.90587 0 4.75043 0 3.5V3.5Z"
                        fill="#BEBEBE"
                        transform="translate(5, 5)"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="w-[22px] h-[22px] border border-white flex items-center justify-center bg-transparent"
              >
                {rememberMe && (
                  <svg
                    width="13"
                    height="10"
                    viewBox="0 0 13 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.536133 3.79723L4.80542 8.16086L12.2767 0.524506"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                  </svg>
                )}
              </button>
              <label
                className="text-white text-[11px] underline cursor-pointer"
                onClick={() => setRememberMe(!rememberMe)}
              >
                Запомнить меня
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 bg-[#212121] text-white text-base font-medium shadow-[0_8px_4px_rgba(0,0,0,0.5)] hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Загрузка..." : "ВОЙТИ"}
            </button>
          </form>

          {error && (
          <div className="mt-6 p-4 border border-red-500 bg-red-500/10">
            <p className="text-red-500 text-center text-sm">{error}</p>
          </div>
        )}

          {/* Register Link */}
          <p className="text-center text-white/25 text-[13px] mt-6">
            Нет учетной записи?{" "}
            <Link
              to="/register"
              className="hover:text-white/40 transition-colors"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-white text-lg md:text-xl font-bold mt-8 leading-[120%] tracking-tight">
          Copyright Team Layar, 2025.
        </p>
      </div>
    </div>
  );
}
