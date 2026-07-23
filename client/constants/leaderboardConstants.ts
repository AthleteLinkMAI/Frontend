// Leaderboard data constants (for future Django+Postgres integration)

export interface LeaderboardPlayer {
  id: number;
  rank: number;
  name: string;
  avatar: string;
  badge: string;
  badgeGradientFrom: string;
  badgeGradientTo: string;
  level: number;
  currentXP: number;
  maxXP: number;
  medalImage: string;
}

export const LEADERBOARD_DATA: LeaderboardPlayer[] = [
  {
    id: 1,
    rank: 1,
    name: "Крылов (Spectrum) Даниил",
    avatar: "/placeholder_avatar.jpg",
    badge: "",
    badgeGradientFrom: "#A2E1B1",
    badgeGradientTo: "#AE349C",
    level: 9,
    currentXP: 4500,
    maxXP: 5000,
    medalImage: "/legendary.png",
  },
  {
    id: 2,
    rank: 2,
    name: "Крылов (Spectrum) Даниил",
    avatar: "/placeholder_avatar.jpg",
    badge: "",
    badgeGradientFrom: "#A2E1B1",
    badgeGradientTo: "#AE349C",
    level: 9,
    currentXP: 4500,
    maxXP: 5000,
    medalImage: "/legendary.png",
  },
  {
    id: 3,
    rank: 3,
    name: "Крылов (Spectrum) Даниил",
    avatar: "/placeholder_avatar.jpg",
    badge: "",
    badgeGradientFrom: "#A2E1B1",
    badgeGradientTo: "#AE349C",
    level: 9,
    currentXP: 4500,
    maxXP: 5000,
    medalImage: "/legendary.png",
  },
  {
    id: 4,
    rank: 4,
    name: "Крылов (Spectrum) Даниил",
    avatar: "/placeholder_avatar.jpg",
    badge: "",
    badgeGradientFrom: "#A2E1B1",
    badgeGradientTo: "#AE349C",
    level: 9,
    currentXP: 4500,
    maxXP: 5000,
    medalImage: "/legendary.png",
  },
  {
    id: 5,
    rank: 5,
    name: "Крылов (Spectrum) Даниил",
    avatar: "/placeholder_avatar.jpg",
    badge: "",
    badgeGradientFrom: "#A2E1B1",
    badgeGradientTo: "#AE349C",
    level: 9,
    currentXP: 4500,
    maxXP: 5000,
    medalImage: "/legendary.png",
  },
  {
    id: 6,
    rank: 6,
    name: "Крылов (Spectrum) Даниил",
    avatar: "/placeholder_avatar.jpg",
    badge: "",
    badgeGradientFrom: "#A2E1B1",
    badgeGradientTo: "#AE349C",
    level: 9,
    currentXP: 4500,
    maxXP: 5000,
    medalImage: "/legendary.png",
  },
  {
    id: 7,
    rank: 7,
    name: "Крылов (Spectrum) Даниил",
    avatar: "/placeholder_avatar.jpg",
    badge: "",
    badgeGradientFrom: "#A2E1B1",
    badgeGradientTo: "#AE349C",
    level: 9,
    currentXP: 4500,
    maxXP: 5000,
    medalImage: "/legendary.png",
  },
  {
    id: 8,
    rank: 8,
    name: "Крылов (Spectrum) Даниил",
    avatar: "/placeholder_avatar.jpg",
    badge: "",
    badgeGradientFrom: "#A2E1B1",
    badgeGradientTo: "#AE349C",
    level: 9,
    currentXP: 4500,
    maxXP: 5000,
    medalImage: "/legendary.png",
  },
  {
    id: 9,
    rank: 9,
    name: "Крылов (Spectrum) Даниил",
    avatar: "/placeholder_avatar.jpg",
    badge: "",
    badgeGradientFrom: "#A2E1B1",
    badgeGradientTo: "#AE349C",
    level: 9,
    currentXP: 4500,
    maxXP: 5000,
    medalImage: "/legendary.png",
  },
  {
    id: 10,
    rank: 10,
    name: "Крылов (Spectrum) Даниил",
    avatar: "/placeholder_avatar.jpg",
    badge: "",
    badgeGradientFrom: "#A2E1B1",
    badgeGradientTo: "#AE349C",
    level: 9,
    currentXP: 4500,
    maxXP: 5000,
    medalImage: "/legendary.png",
  },
];

export const HEADER_DATA = {
  welcomeMessage: "Добрый день, Захар",
  currentDate: "Сб, 11 октября 2025",
};
