// Public profile placeholder data (for future Django/Postgres integration)

export interface Sport {
  id: number;
  name: string;
  score: string;
  rank: string;
  gradientFrom: string;
  gradientTo: string;
  badgeColor: string;
}

export interface Opponent {
  id: number;
  name: string;
  avatar: string;
}

export interface LastGame {
  id: number;
  name: string;
  date: string;
  time: string;
  sport: string;
  result: string;
  isWin: boolean;
}

export const PUBLIC_PROFILE_DATA = {
  // Player basic info
  playerName: "Крылов (Spectrum) Даниил",
  username: "Spectrum",
  gender: "Мужской",
  age: "1800 лет",
  location: "г.Москва",
  registrationDate: "31 февраля 2020 года",
  
  // Profile images
  avatar: "/placeholder_avatar.jpg",
  
  // Best sport
  bestSport: {
    name: "Шахматы",
    rank: "Искра III",
    rankProgress: "9800/10000",
    globalRanking: "#1",
    totalWins: 255,
    winRate: "99.5%",
    romanNumeral: "III",
    gradientFrom: "#4F0A0A",
    gradientTo: "#780000",
    badgeColor: "#760000",
    badgeImage: "/legendary.png",
  },
  
  // Other sports
  otherSports: [
    {
      id: 1,
      name: "Волейбол",
      score: "9700/10000",
      rank: "III",
      gradientFrom: "#4F0A0A",
      gradientTo: "#780000",
      badgeColor: "#760000",
      badgeImage: "/legendary.png",
    },
    {
      id: 2,
      name: "Баскетбол",
      score: "9700/10000",
      rank: "III",
      gradientFrom: "#34064F",
      gradientTo: "#680288",
      badgeColor: "#8700BC",
      badgeImage: "/mythic.png",
    },
    {
      id: 3,
      name: "Футбол",
      score: "9700/10000",
      rank: "III",
      gradientFrom: "#008E79",
      gradientTo: "#00A9C0",
      badgeColor: "#0BA2C4",
      badgeImage: "/diamond.png",
    },
    {
      id: 4,
      name: "Настольный теннис",
      score: "9700/10000",
      rank: "III",
      gradientFrom: "#763700",
      gradientTo: "#FFA04D",
      badgeColor: "#FF6200",
      badgeImage: "/master.png",
    },
  ] as Sport[],
  
  // Last game
  lastGame: {
    id: 1,
    name: "Bootcamp with Absolute Vodka",
    date: "18.10.2025",
    time: "23:33",
    sport: "Литрбол",
    result: "Победа",
    isWin: true,
  } as LastGame,
  
  // Recent opponents
  recentOpponents: [
    {
      id: 1,
      name: "Крылов (Spectrum) Даниил",
      avatar: "/placeholder_avatar.jpg",
    },
    {
      id: 2,
      name: "Крылов (Spectrum) Даниил",
      avatar: "/placeholder_avatar.jpg",
    },
  ] as Opponent[],
  
  // Overall ranking
  overallRanking: {
    position: "1",
    name: "Крылов (Spectrum) Даниил",
    avatar: "/placeholder_avatar.jpg",
    badge: "/legendary.png",
  },
  
  // Header info
  welcomeMessage: "Добрый день, Захар",
  currentDate: "Сб, 11 октября 2025",
};
