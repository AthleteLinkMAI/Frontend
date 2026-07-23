import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getTimeGreeting } from "@/components/TimeParse";
import { format } from "date-fns";
import HeaderMenu from "@/components/HeaderMenu";
import SidebarNav from "@/components/SidebarMenu";
import { getCurrentDateFormatted } from "@/lib/dateFormatter";
import { getCookie } from "@/lib/csrf";
import { RUSSIAN_CITIES } from "@/data/russianCities";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Profile() {
  const navigate = useNavigate();
  const { user, isLoading, refetchUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [telegram, setTelegram] = useState("");
  const [email, setEmail] = useState("");

  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [birthdateObj, setBirthdateObj] = useState<Date | undefined>(undefined);
  const [showBirthCalendar, setShowBirthCalendar] = useState(false);


  const genderOptions = [
    { label: "Мужской", value: "male" },
    { label: "Женский", value: "female" },
  ];

  const [cityQuery, setCityQuery] = useState("");
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const handleCityInput = (value: string) => {
    setCity(value);
    setCityQuery(value);

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

  useEffect(() => {
    if (!isLoading && user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setFullName(user.full_name || "");
      setTelegram(user.telegram || "");
      setCity(user.city || "");
      setGender(user.gender || "");

      if (user.birth_date) {
        try {
          const dateObj = new Date(user.birth_date);
          setBirthdate(format(dateObj, "dd.MM.yyyy"));
          setBirthdateObj(new Date(user.birth_date));
        } catch {
          setBirthdate(user.birth_date);
        }
      }
    }
  }, [user, isLoading]);

  if (isLoading) return <div>Загрузка данных профиля...</div>;
  if (!user) return <div>Ошибка: пользователь не авторизован</div>;

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const parseDateToISO = (d: string) => {
    if (!d) return null;
    if (d.includes(".")) {
      const parts = d.split(".");
      if (parts.length !== 3) return null;
      const [dd, mm, yyyy] = parts;
      return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }
    return d;
  };

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const getAgeFromDateStr = (dateStr: string): number | null => {
      if (!dateStr) return null;
      const parts = dateStr.split(".");
      if (parts.length !== 3) return null;

      const [dd, mm, yyyy] = parts;
      const day = Number(dd);
      const month = Number(mm) - 1;
      const year = Number(yyyy);

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

  const handleSaveSettings = async () => {
    setSuccessMessage("");

    setErrorMessage("");

    if (birthdate) {
      const age = getAgeFromDateStr(birthdate);

      if (age === null) {
        setErrorMessage("Введите корректную дату рождения.");
        return;
      }

      if (age < 14) {
        setErrorMessage("Вам должно быть не менее 14 лет.");
        return;
      }
    }

    const csrfToken = getCookie("csrftoken");
    if (!csrfToken) {
      console.error("CSRF token is missing");
      return;
    }

    const parsedDate = parseDateToISO(birthdate);

    const body: any = {
      full_name: fullName,
      username: username,
      telegram: telegram,
      city: city,
      gender: gender,
    };
    if (parsedDate) body.birth_date = parsedDate;

    try {
      const response = await fetch(`${apiUrl}/profile/me/update/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
          const data = await response.json().catch(() => null);

          if (data) {
            if (data.username?.[0]) setErrorMessage(data.username[0]);
            else if (data.email?.[0]) setErrorMessage(data.email[0]);
            else if (data.birth_date?.[0]) setErrorMessage(data.birth_date[0]);
            else setErrorMessage("Ошибка обновления данных профиля.");
          } else {
            setErrorMessage("Ошибка обновления данных профиля.");
          }

          return;
      }

      await refetchUser();
      setSuccessMessage("Настройки успешно сохранены");
    } catch (e) {
      console.error("Network error:", e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#493D02] overflow-y-auto">
      <div className="flex min-h-screen">
        <SidebarNav activePage="profile" />

        <div className="flex-1 p-7 overflow-y-auto">
          <HeaderMenu
            greeting={`${getTimeGreeting()}, ${user.full_name}`}
            date={getCurrentDateFormatted()}
          />

          <div className="rounded-[10px] overflow-hidden">
            <div className="h-[88px] bg-gradient-to-r from-[#878DB3] to-[#001AFF]/30 relative">
              <div className="flex items-center px-7 py-8 gap-6">
                <img
                  src="/placeholder_avatar.jpg"
                  alt={fullName}
                  className="w-[89px] h-[86px] rounded-full absolute left-7 top-[100px] mt-6"
                />
                <div className="ml-[120px] mt-28">
                  <h2 className="text-black text-xl font-medium">{fullName}</h2>
                  <p className="text-black/50 text-base">{email}</p>
                </div>
                <div className="ml-auto mt-32 flex flex-col items-end">
                  <button
                    onClick={handleSaveSettings}
                    className="bg-[#4182F9] text-white px-5 py-2 rounded-lg text-base"
                  >
                    Сохранить настройки
                  </button>

                  <div className="min-h-[24px] mt-1">
                      {errorMessage && (
                        <p className="text-red-700 text-sm">
                          {errorMessage}
                        </p>
                      )}
                      {!errorMessage && successMessage && (
                        <p className="text-green-700 text-sm">
                          {successMessage}
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/50 p-8 min-h-[600px]">
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-black/80 text-base mb-2 mt-40 ml-2">
                    Фамилия и имя
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#F9F9F9]/50 rounded-lg px-4 py-3 text-black/80 text-base outline-none"
                  />
                </div>

                <div>
                  <label className="block text-black/80 text-base mb-2 mt-40 ml-2">
                    Имя пользователя
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#F9F9F9]/50 rounded-lg px-4 py-3 text-black/80 text-base outline-none"
                  />
                </div>

                <div className="relative">
                  <label className="block text-black/80 text-base mb-2">
                    Пол
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={
                        genderOptions.find((g) => g.value === gender)?.label ||
                        "Выберите пол"
                      }
                      onClick={() =>
                        setShowGenderDropdown(!showGenderDropdown)
                      }
                      className="w-full bg-[#F9F9F9]/50 rounded-lg px-4 py-3 text-black/80 text-base outline-none cursor-pointer pr-10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowGenderDropdown(!showGenderDropdown)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      ▼
                    </button>

                    {showGenderDropdown && (
                      <div className="absolute mt-2 w-full bg-white border border-black/10 rounded-lg shadow-md z-50">
                        {genderOptions.map((option) => (
                          <div
                            key={option.value}
                            onClick={() => {
                              setGender(option.value);
                              setShowGenderDropdown(false);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-black/80 text-base mb-2">
                    Город
                  </label>

                  <input
                    type="text"
                    value={city}
                    onChange={(e) => handleCityInput(e.target.value)}
                    onFocus={() => {
                      if (filteredCities.length > 0) setShowCityDropdown(true);
                    }}
                    className="w-full bg-[#F9F9F9]/50 rounded-lg px-4 py-3 text-black/80 text-base outline-none"
                    placeholder="Начните вводить город..."
                  />

                  {showCityDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-black/10 rounded-lg shadow-md z-50 max-h-60 overflow-y-auto">
                      {filteredCities.map((c) => (
                        <div
                          key={c}
                          onClick={() => {
                            setCity(c);
                            setCityQuery(c);
                            setShowCityDropdown(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {c}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-black/80 text-base mb-2">
                    Дата рождения
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      value={birthdate}
                      onChange={(e) => setBirthdate(e.target.value)}
                      placeholder="ДД.ММ.ГГГГ"
                      className="w-full bg-[#F9F9F9]/50 rounded-lg px-4 py-3 pr-12 text-black/80 text-base outline-none"
                    />

                    <Popover open={showBirthCalendar} onOpenChange={setShowBirthCalendar}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-xl"
                          onClick={() => setShowBirthCalendar(true)}
                        >
                          📅
                        </button>
                      </PopoverTrigger>

                      <PopoverContent className="p-0 bg-white shadow-lg rounded-lg w-auto">
                        <Calendar
                          mode="single"
                          selected={birthdateObj}
                          onSelect={(d) => {
                            if (!d) return;
                            setBirthdate(format(d, "dd.MM.yyyy"));
                            setBirthdateObj(d);
                            setShowBirthCalendar(false);
                          }}
                          defaultMonth={birthdateObj || new Date(2000, 0)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div>
                  <label className="block text-black/80 text-base mb-2">
                    Идентификатор пользователя в Telegram
                  </label>
                  <input
                    type="text"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    className="w-full bg-[#F9F9F9]/50 rounded-lg px-4 py-3 text-black/80 text-base outline-none"
                  />
                </div>
              </div>

              <div className="mt-12">
                <h3 className="text-black text-lg font-medium mb-4">
                  Адрес электронной почты
                </h3>
                <div className="flex items-start gap-4">
                  <div className="w-[42px] h-[42px] rounded-full bg-[#4182F9]/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-[23px] h-[20px]"
                      viewBox="0 0 23 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M16.2915 2.91669H6.70817C3.83317 2.91669 1.9165 4.16669 1.9165 7.08335V12.9167C1.9165 15.8334 3.83317 17.0834 6.70817 17.0834H16.2915C19.1665 17.0834 21.0832 15.8334 21.0832 12.9167V7.08335C21.0832 4.16669 19.1665 2.91669 16.2915 2.91669ZM16.7419 7.99169L13.7423 10.075C13.1098 10.5167 12.3048 10.7334 11.4998 10.7334C10.6948 10.7334 9.88025 10.5167 9.25734 10.075L6.25775 7.99169C5.95109 7.77502 5.90317 7.37502 6.14275 7.10835C6.39192 6.84169 6.84234 6.79169 7.149 7.00835L10.1486 9.09169C10.8769 9.60002 12.1132 9.60002 12.8415 9.09169L15.8411 7.00835C16.1478 6.79169 16.6078 6.83335 16.8473 7.10835C17.0965 7.37502 17.0486 7.77502 16.7419 7.99169Z"
                        fill="#4182F9"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-black text-base">{email}</p>
                    <p className="text-black/50 text-base">
                      Изменен 10 дней назад
                    </p>
                  </div>
                  <button className="ml-auto bg-[#4182F9] text-white px-5 py-2 rounded-lg text-base">
                    Изменить адрес эл. почты
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}