export interface Player {
  id: number;
  name: string;
  nickname: string;
  avatar: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface RequestData {
  requestNumber: string;
  title: string;
  subtitle: string;
  gameDescription: string;
  dateTime: string;
  playerCount: string;
  maxPlayers: string;
  avgRating: string;
  venueLabel: string;
  venueMapImage: string;
  hasApplied: boolean;
  notAppliedMessage: string;
  stickerImage: string;
  players: Player[];
}

export const REQUEST_DATA_MOCK: RequestData = {
  requestNumber: "4,539,222",
  title: "Bootcamp with Absolute Vodka",
  subtitle: "Вы будете играть в Литрбол!",
  gameDescription:
    'Lorem Ipsum - это текст-"рыба", часто используемый в печати и вэб-дизайне. Lorem Ipsum является стандартной "рыбой" для текстов на латинице с начала XVI века.',
  dateTime: "18.10.2025, 23:33",
  playerCount: "256",
  maxPlayers: "256",
  avgRating: "~50000",
  venueLabel: "Место проведения",
  venueMapImage: "/map.webp",
  hasApplied: false,
  notAppliedMessage:
    "Вы еще не подавали запроса на участие в этом мероприятии.",
  stickerImage: "/cat_in_a_cap.webm",
  players: [
    {
      id: 1,
      name: "Крылов (Spectrum) Даниил",
      nickname: "Spectrum",
      avatar: "/placeholder_avatar.jpg",
      gradientFrom: "#4F0A0A",
      gradientTo: "#780000",
    },
    {
      id: 2,
      name: "Крылов (Spectrum) Даниил",
      nickname: "Spectrum",
      avatar: "/placeholder_avatar.jpg",
      gradientFrom: "#4F0A0A",
      gradientTo: "#780000",
    },
    {
      id: 3,
      name: "Крылов (Spectrum) Даниил",
      nickname: "Spectrum",
      avatar: "/placeholder_avatar.jpg",
      gradientFrom: "#4F0A0A",
      gradientTo: "#780000",
    },
    {
      id: 4,
      name: "Крылов (Spectrum) Даниил",
      nickname: "Spectrum",
      avatar: "/placeholder_avatar.jpg",
      gradientFrom: "#4F0A0A",
      gradientTo: "#780000",
    },
    {
      id: 5,
      name: "Крылов (Spectrum) Даниил",
      nickname: "Spectrum",
      avatar: "/placeholder_avatar.jpg",
      gradientFrom: "#4F0A0A",
      gradientTo: "#780000",
    },
    {
      id: 6,
      name: "Крылов (Spectrum) Даниил",
      nickname: "Spectrum",
      avatar: "/placeholder_avatar.jpg",
      gradientFrom: "#4F0A0A",
      gradientTo: "#780000",
    },
    {
      id: 7,
      name: "Крылов (Spectrum) Даниил",
      nickname: "Spectrum",
      avatar: "/placeholder_avatar.jpg",
      gradientFrom: "#4F0A0A",
      gradientTo: "#780000",
    },
    {
      id: 8,
      name: "Крылов (Spectrum) Даниил",
      nickname: "Spectrum",
      avatar: "/placeholder_avatar.jpg",
      gradientFrom: "#4F0A0A",
      gradientTo: "#780000",
    },
    {
      id: 9,
      name: "Крылов (Spectrum) Даниил",
      nickname: "Spectrum",
      avatar: "/placeholder_avatar.jpg",
      gradientFrom: "#4F0A0A",
      gradientTo: "#780000",
    },
    {
      id: 10,
      name: "Крылов (Spectrum) Даниил",
      nickname: "Spectrum",
      avatar: "/placeholder_avatar.jpg",
      gradientFrom: "#4F0A0A",
      gradientTo: "#780000",
    },
    {
      id: 11,
      name: "Крылов (Spectrum) Даниил",
      nickname: "Spectrum",
      avatar: "/placeholder_avatar.jpg",
      gradientFrom: "#4F0A0A",
      gradientTo: "#780000",
    },
    {
      id: 12,
      name: "Крылов (Spectrum) Даниил",
      nickname: "Spectrum",
      avatar: "/placeholder_avatar.jpg",
      gradientFrom: "#4F0A0A",
      gradientTo: "#780000",
    },
  ],
};

export const HEADER_DATA = {
  userName: "Захар",
  currentDate: "Сб, 11 октября 2025",
  profileImage: "/placeholder_avatar.jpg",
};
