import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { RUSSIAN_CITIES } from "@/data/russianCities";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Добавлено состояние для ошибки

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [cityQuery, setCityQuery] = useState("");


  const [fullName, setFullName] = useState("");
  const [telegram, setTelegram] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [city, setCity] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const datePickerRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validateDate = (dateStr: string): boolean => {
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.(19|20)\d{2}$/;
    if (!dateRegex.test(dateStr)) return false;
    const [day, month, year] = dateStr.split(".").map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  const getAgeFromDateStr = (dateStr: string): number | null => {
      const parts = dateStr.split(".");
      if (parts.length !== 3) return null;
      const [dayS, monthS, yearS] = parts;
      const day = Number(dayS);
      const month = Number(monthS) - 1;
      const year = Number(yearS);
      if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return null;
      const dob = new Date(year, month, day);
      if (isNaN(dob.getTime())) return null;

      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setBirthdate(format(date, "dd.MM.yyyy"));
      setShowDatePicker(false);
      setError(null); // Сбрасываем ошибку при изменении
    }
  };

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setShowCityDropdown(false);
    setError(null); // Сбрасываем ошибку при изменении
  };

  const handleCityInput = (value: string) => {
      setCity(value);
      setCityQuery(value);
      setError(null);

      if (!value.trim()) {
        setFilteredCities([]);
        setShowCityDropdown(false);
        return;
      }

      const filtered = RUSSIAN_CITIES.filter((c) =>
        c.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8);

      setFilteredCities(filtered);
      setShowCityDropdown(filtered.length > 0);
  };

  const validatePasswordStrength = (password: string) => {
    const lengthOk = password.length >= 8;
    const upperOk = /[A-ZА-Я]/.test(password);
    const lowerOk = /[a-zа-я]/.test(password);
    const digitOk = /\d/.test(password);

    return lengthOk && upperOk && lowerOk && digitOk;
  };

  const handleContinueStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Сбрасываем ошибку

    if (!username || !email || !password || !confirmPassword) {
      setError("Пожалуйста, заполните все поля!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают!");
      return;
    }

    if (!validatePasswordStrength(password)) {
      setError("Пароль должен содержать минимум 8 символов, одну заглавную букву, одну строчную букву и одну цифру.");
      return;
    }

    setStep(2);
  };

  const handleRegisterStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Сбрасываем ошибку перед отправкой
    setIsLoading(true);

    if (!fullName || !telegram || !birthdate || !city) {
      setError("Пожалуйста, заполните все поля!");
      setIsLoading(false);
      return;
    }

    // Validate birthdate format
    if (!validateDate(birthdate)) {
      setError("Пожалуйста, введите корректную дату рождения в формате ДД.ММ.ГГГГ");
      setIsLoading(false);
      return;
    }

    const age = getAgeFromDateStr(birthdate);
    if (age === null) {
      setError("Неверный формат даты рождения.");
      setIsLoading(false);
      return;
    }
    if (age < 14) {
      setError("Для регистрации вам должно быть не менее 14 лет.");
      setIsLoading(false);
      return;
    }

    const [day, month, year] = birthdate.split(".");
    const formattedDate = `${year}-${month}-${day}`;

    const payload = {
      username,
      email,
      password,
      password_confirm: confirmPassword,
      full_name: fullName,
      telegram,
      birth_date: formattedDate,
      city,
    };

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      const response = await fetch(`${apiUrl}/user/register/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if(response.ok) {
        console.log("Registration complete:", data);
        navigate(`/${data.username}/profile/`);
      } else {
        console.error("Registration failed:", data);
        let errorMessage = "Ошибка регистрации";
        if (data.errors) {
          // Обрабатываем различные форматы ошибок
          if (data.errors.non_field_errors) {
            errorMessage = data.errors.non_field_errors[0];
          } else if (data.errors.username) {
            errorMessage = `Имя пользователя: ${data.errors.username[0]}`;
          } else if (data.errors.email) {
            errorMessage = `Email: ${data.errors.email[0]}`;
          } else if (data.errors.password) {
            errorMessage = `Пароль: ${data.errors.password[0]}`;
          } else if (data.errors.full_name) {
            errorMessage = `Имя: ${data.errors.full_name[0]}`;
          } else if (data.errors.telegram) {
            errorMessage = `Telegram: ${data.errors.telegram[0]}`;
          } else if (data.errors.birth_date) {
            errorMessage = `Дата рождения: ${data.errors.birth_date[0]}`;
          } else if (data.errors.city) {
            errorMessage = `Город: ${data.errors.city[0]}`;
          } else {
            // Если ошибки в неизвестном формате, собираем все в строку
            const errorMessages = Object.entries(data.errors)
              .map(([field, msgs]: [string, any]) => `${field}: ${msgs.join(', ')}`)
              .join('; ');
            errorMessage = errorMessages;
          }
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.message) {
          errorMessage = data.message;
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Network error:", error);
      setError("Ошибка соединения с сервером. Проверьте соединение с интернетом или статус сервера.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setError(null); // Сбрасываем ошибку при возврате
  };

  // Функции для сброса ошибки при изменении полей
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setError(null);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(null);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setError(null);
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    setError(null);
  };

  const handleTelegramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelegram(e.target.value);
    setError(null);
  };

  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthdate(e.target.value);
    setError(null);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated Dart Emojis */}
      <div className="absolute left-0 top-0 w-full h-full pointer-events-none">
        <img
          src="/lev_dartz.webp"
          alt=""
          className="absolute left-0 md:left-0 top-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 lg:w-[350px] lg:h-[350px] opacity-90 animate-levitate-active"
        />
        <img
          src="/lev_dartz.webp"
          alt=""
          className="absolute right-0 md:right-0 top-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 lg:w-[350px] lg:h-[350px] opacity-90 animate-levitate-active-slow"
        />
      </div>

      {/* Registration Form Container */}
      <div className="relative z-10 w-full max-w-[572px]">
        <div className="bg-black/50 border border-[#E0E0E0] shadow-[0_82px_40px_rgba(100,100,100,0.08)] p-8 md:p-12 lg:p-16 transition-all duration-300">
          <h1 className="text-2xl md:text-3xl lg:text-[31px] font-bold text-white text-center mb-8 md:mb-12 leading-[120%] tracking-tight">
            Регистрация в AthleteLink
          </h1>

          {/* Отображение ошибки */}
          {error && (
            <div className="mb-6 p-4 border border-red-500 bg-red-500/10">
              <p className="text-red-500 text-center text-sm">{error}</p>
            </div>
          )}

          {step === 1 ? (
            // STEP 1: Basic Account Info
            <form onSubmit={handleContinueStep1} className="space-y-6">
              {/* Username Field */}
              <div className="relative">
                <div className="border border-[#212121] bg-black p-4">
                  <label className="block text-white text-[10px] font-medium mb-2">
                    Имя пользователя
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="pauchuck"
                    className="w-full bg-transparent text-[#616161] text-base outline-none placeholder:text-[#616161]"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="relative">
                <div className="border border-[#212121] bg-black p-4">
                  <label className="block text-white text-[10px] font-medium mb-2">
                    Адрес электронной почты
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="mai@mai.education"
                    className="w-full bg-transparent text-[#757575] text-base outline-none placeholder:text-[#757575]"
                    required
                    disabled={isLoading}
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
                      onChange={handlePasswordChange}
                      placeholder="**********"
                      className="flex-1 bg-transparent text-[#757575] text-base outline-none placeholder:text-[#757575]"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="w-4 h-4 flex items-center justify-center"
                    >
                       <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M16 5.5C16 5.5 13 0 8 0C3 0 0 5.5 0 5.5C0 5.5 3 11 8 11C13 11 16 5.5 16 5.5ZM1.173 5.5C1.65652 6.23488 2.21265 6.91931 2.83301 7.543C4.12 8.832 5.88 10 8 10C10.12 10 11.879 8.832 13.168 7.543C13.7884 6.91931 14.3445 6.23487 14.828 5.5C14.3445 4.76512 13.7884 4.08068 13.168 3.457C11.879 2.168 10.119 1 8 1C5.88 1 4.121 2.168 2.832 3.457C2.21164 4.08069 1.65551 4.76513 1.172 5.50001L1.173 5.5Z" fill="#BEBEBE"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M3.5 1C2.11929 1 1 2.11928 1 3.49999C0.999996 4.8807 2.11928 5.99999 3.49999 6C4.8807 6 5.99999 4.88072 5.99999 3.50001C6 2.1193 4.88072 1.00001 3.50001 1H3.5ZM0 3.5C0 2.24957 0.667096 1.09413 1.75 0.468912C2.8329 -0.156303 4.16709 -0.156304 5.25 0.46891C6.3329 1.09412 7 2.24957 7 3.5C7 4.75043 6.3329 5.90587 5.25 6.53109C4.1671 7.1563 2.8329 7.1563 1.75 6.53109C0.667097 5.90587 0 4.75043 0 3.5V3.5Z" fill="#BEBEBE" transform="translate(5, 5)"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <div className="border border-[#212121] bg-black p-4">
                  <label className="block text-white text-[10px] font-medium mb-2">
                    Подтвердите пароль
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      placeholder="**********"
                      className="flex-1 bg-transparent text-[#757575] text-base outline-none placeholder:text-[#757575]"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                      className="w-4 h-4 flex items-center justify-center"
                    >
                      <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M16 5.5C16 5.5 13 0 8 0C3 0 0 5.5 0 5.5C0 5.5 3 11 8 11C13 11 16 5.5 16 5.5ZM1.173 5.5C1.65652 6.23488 2.21265 6.91931 2.83301 7.543C4.12 8.832 5.88 10 8 10C10.12 10 11.879 8.832 13.168 7.543C13.7884 6.91931 14.3445 6.23487 14.828 5.5C14.3445 4.76512 13.7884 4.08068 13.168 3.457C11.879 2.168 10.119 1 8 1C5.88 1 4.121 2.168 2.832 3.457C2.21164 4.08069 1.65551 4.76513 1.172 5.50001L1.173 5.5Z" fill="#BEBEBE"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M3.5 1C2.11929 1 1 2.11928 1 3.49999C0.999996 4.8807 2.11928 5.99999 3.49999 6C4.8807 6 5.99999 4.88072 5.99999 3.50001C6 2.1193 4.88072 1.00001 3.50001 1H3.5ZM0 3.5C0 2.24957 0.667096 1.09413 1.75 0.468912C2.8329 -0.156303 4.16709 -0.156304 5.25 0.46891C6.3329 1.09412 7 2.24957 7 3.5C7 4.75043 6.3329 5.90587 5.25 6.53109C4.1671 7.1563 2.8329 7.1563 1.75 6.53109C0.667097 5.90587 0 4.75043 0 3.5V3.5Z" fill="#BEBEBE" transform="translate(5, 5)"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 bg-[#212121] text-white text-base font-medium shadow-[0_8px_4px_rgba(0,0,0,0.5)] hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Загрузка..." : "ПРОДОЛЖИТЬ"}
              </button>
            </form>
          ) : (
            // STEP 2: Additional Info
            <form onSubmit={handleRegisterStep2} className="space-y-6">
              <p className="text-white text-[13px] text-center mb-8 md:mb-12">
                Осталось всего пару шагов - и ты с нами!
              </p>

              {/* Full Name Field */}
              <div className="relative">
                <div className="border border-[#212121] bg-black p-4">
                  <label className="block text-white text-[10px] font-medium mb-2">
                    Ваше реальное имя (для коммуникации)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={handleFullNameChange}
                    placeholder="Захар Смирнов"
                    className="w-full bg-transparent text-[#616161] text-base outline-none placeholder:text-[#616161]"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Telegram Field */}
              <div className="relative">
                <div className="border border-[#212121] bg-black p-4">
                  <label className="block text-white text-[10px] font-medium mb-2">
                    Идентификатор пользователя в Telegram
                  </label>
                  <input
                    type="text"
                    value={telegram}
                    onChange={handleTelegramChange}
                    placeholder="@Lovely_Specty"
                    className="w-full bg-transparent text-[#757575] text-base outline-none placeholder:text-[#757575]"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Birthdate Field */}
              <div className="relative" ref={datePickerRef}>
                <div className="border border-[#212121] bg-black p-4">
                  <label className="block text-white text-[10px] font-medium mb-2">
                    Дата рождения
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      disabled={isLoading}
                      className="flex-shrink-0 text-white/50 hover:text-white transition-colors disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.66667 1.66667V4.16667" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M13.3333 1.66667V4.16667" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2.91667 7.575H17.0833" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M17.5 7.08333V14.1667C17.5 16.6667 16.25 18.3333 13.3333 18.3333H6.66667C3.75 18.3333 2.5 16.6667 2.5 14.1667V7.08333C2.5 4.58333 3.75 2.91667 6.66667 2.91667H13.3333C16.25 2.91667 17.5 4.58333 17.5 7.08333Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <input
                      type="text"
                      value={birthdate}
                      onChange={handleBirthdateChange}
                      placeholder="Вводите в формате ДД.ММ.ГГГГ"
                      className="flex-1 bg-transparent text-[#757575] text-base outline-none placeholder:text-[#757575]"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                {showDatePicker && (
                  <div className="absolute z-50 mt-2 bg-white border border-[#212121] rounded-lg shadow-xl p-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </div>
                )}
              </div>

              {/* City Field */}
              <div className="relative" ref={cityDropdownRef}>
                <div className="border border-[#212121] bg-black p-4">
                  <label className="block text-white text-[10px] font-medium mb-2">
                    Город
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => handleCityInput(e.target.value)}
                      onClick={() => setShowCityDropdown(true)}
                      placeholder="Введите или выберите из выпадающего списка"
                      className="flex-1 bg-transparent text-[#757575] text-[15px] outline-none placeholder:text-[#757575]"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCityDropdown(!showCityDropdown)}
                      disabled={isLoading}
                      className="flex-shrink-0 text-white/50 hover:text-white transition-colors disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.28 5.96667L8.9333 10.3133C8.41997 10.8267 7.57997 10.8267 7.06664 10.3133L2.71997 5.96667" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
                {showCityDropdown && (
                  <div className="absolute z-50 mt-2 w-full bg-black border border-[#212121] rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {filteredCities.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => handleCitySelect(c)}
                        className="w-full text-left px-4 py-3 text-white hover:bg-[#212121] transition-colors"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Button Group */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-16 bg-[#212121] text-white text-base font-medium shadow-[0_8px_4px_rgba(0,0,0,0.5)] hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Загрузка..." : "ЗАРЕГИСТРИРОВАТЬСЯ"}
                </button>
                <button
                  type="button"
                  onClick={handleBackToStep1}
                  disabled={isLoading}
                  className="w-full h-12 bg-transparent text-white text-base font-medium border border-[#212121] hover:border-[#4a4a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Назад
                </button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <p className="text-center text-white/25 text-[13px] mt-6">
            Уже зарегистрированы?{" "}
            <Link
              to="/login"
              className="hover:text-white/40 transition-colors"
            >
              Войти
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