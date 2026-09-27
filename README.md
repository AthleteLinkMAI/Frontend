# Фронтенд-часть для AthleteLink
Структура проекта
```
client/
├── App.tsx                             # Роутинг + провайдеры (QueryClient, Toaster, BrowserRouter)
├── main.tsx                            # Точка входа
├── global.css                          # Tailwind + CSS-переменные темы
├── components/
│   ├── HeaderMenu.tsx                  # Верхнее меню с выпадающим списком активных заявок
│   ├── SidebarMenu.tsx                 # Левое меню профиля (профиль/статистика/заявки/настройки)
│   ├── ProtectedRoute.tsx              # Обёртка для авторизованных роутов
│   ├── RequestCard.tsx                 # Большая карточка заявки
│   ├── SmallRequestCard.tsx            # Мини-карточка для дропдауна
│   ├── DisplayMap.tsx                  # Яндекс.Карта для просмотра
│   ├── YandexMap.tsx                   # Яндекс.Карта с выбором адреса
│   ├── TimeParse.tsx                   # Приветствие по времени суток
│   ├── guards/ProfileOwnerGuard.jsx    # Проверка, что это профиль владельца
│   └── ui/                             # shadcn/ui компоненты (кнопки, диалоги и т.д.)
├── pages/
│   ├── Index.tsx                       # Лендинг
│   ├── Login.tsx / Register.tsx
│   ├── Profile.tsx                     # Редактирование профиля
│   ├── ProfileStats.tsx                # Статистика/ранги
│   ├── PublicProfile.tsx               # Публичный профиль /:username
│   ├── Requests.tsx                    # Мои заявки
│   ├── AllRequests.tsx                 # Все заявки с фильтрами
│   ├── CreateRequest.tsx               # Создание заявки
│   ├── RequestData.tsx                 # Детали заявки + управление игрой
│   ├── Settings.tsx                    # Смена пароля, секретный вопрос
│   ├── Leaderboard.tsx                 # Таблица лидеров
│   ├── Authors.tsx                     # Авторы проекта
│   └── NotFound.tsx
├── hooks/
│   ├── useAuth.tsx                     # React Query + /profile/me
│   └── use-toast.ts
├── lib/
│   ├── csrf.ts                         # Чтение csrftoken из cookie
│   └── dateFormatter.ts
└── data/russianCities.ts               # Список городов для автокомплита

server/
├── index.ts                            # Express: /api/ping, /api/demo, /api/geocode (Nominatim)
└── node-build.ts                       # Прод-сервер, раздаёт dist/spa
```