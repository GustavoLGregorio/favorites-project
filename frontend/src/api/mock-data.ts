export interface MediaItem {
  id: string;
  title: string;
  mediaType: 'anime' | 'manga' | 'game' | 'book' | 'movie' | 'series';
  coverUrl: string;
  progress: {
    current: number;
    total: number;
    unit: string;
  };
  score: number;
  status: 'in_progress' | 'completed' | 'planning';
  subtitle?: string;
  releaseYear?: number;
}

export const MOCK_MEDIA_ITEMS: MediaItem[] = [
  // Anime
  {
    id: 'anime-1',
    title: "Frieren: Beyond Journey's End",
    mediaType: 'anime',
    coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    progress: { current: 22, total: 28, unit: 'Episodes' },
    score: 9.8,
    status: 'in_progress',
    subtitle: 'Madhouse • 2023',
    releaseYear: 2023,
  },
  {
    id: 'anime-2',
    title: 'Chainsaw Man',
    mediaType: 'anime',
    coverUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    progress: { current: 12, total: 12, unit: 'Episodes' },
    score: 9.2,
    status: 'completed',
    subtitle: 'MAPPA • 2022',
    releaseYear: 2022,
  },
  {
    id: 'anime-3',
    title: 'Jujutsu Kaisen Season 2',
    mediaType: 'anime',
    coverUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    progress: { current: 18, total: 23, unit: 'Episodes' },
    score: 9.5,
    status: 'in_progress',
    subtitle: 'MAPPA • 2023',
    releaseYear: 2023,
  },
  {
    id: 'anime-4',
    title: 'Demon Slayer: Hashira Training',
    mediaType: 'anime',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    progress: { current: 5, total: 8, unit: 'Episodes' },
    score: 8.9,
    status: 'in_progress',
    subtitle: 'ufotable • 2024',
    releaseYear: 2024,
  },

  // Manga & Books
  {
    id: 'book-1',
    title: 'Words of Radiance',
    mediaType: 'book',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    progress: { current: 540, total: 1088, unit: 'Pages' },
    score: 9.6,
    status: 'in_progress',
    subtitle: 'Brandon Sanderson',
    releaseYear: 2014,
  },
  {
    id: 'manga-1',
    title: 'Berserk',
    mediaType: 'manga',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    progress: { current: 140, total: 374, unit: 'Chapters' },
    score: 9.9,
    status: 'in_progress',
    subtitle: 'Kentaro Miura',
    releaseYear: 1989,
  },
  {
    id: 'manga-2',
    title: 'Solo Leveling',
    mediaType: 'manga',
    coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80',
    progress: { current: 200, total: 200, unit: 'Chapters' },
    score: 9.0,
    status: 'completed',
    subtitle: 'Chugong',
    releaseYear: 2018,
  },

  // Games
  {
    id: 'game-1',
    title: 'Elden Ring: Shadow of the Erdtree',
    mediaType: 'game',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    progress: { current: 48, total: 60, unit: 'Hours' },
    score: 9.7,
    status: 'in_progress',
    subtitle: 'FromSoftware • PC',
    releaseYear: 2024,
  },
  {
    id: 'game-2',
    title: 'Cyberpunk 2077: Phantom Liberty',
    mediaType: 'game',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    progress: { current: 85, total: 85, unit: 'Hours' },
    score: 9.4,
    status: 'completed',
    subtitle: 'CD Projekt Red • PS5',
    releaseYear: 2023,
  },
  {
    id: 'game-3',
    title: 'Hollow Knight: Silksong',
    mediaType: 'game',
    coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    progress: { current: 0, total: 40, unit: 'Hours' },
    score: 0,
    status: 'planning',
    subtitle: 'Team Cherry',
    releaseYear: 2025,
  },

  // Movies & Series
  {
    id: 'series-1',
    title: 'Severance Season 2',
    mediaType: 'series',
    coverUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80',
    progress: { current: 6, total: 10, unit: 'Episodes' },
    score: 9.3,
    status: 'in_progress',
    subtitle: 'Apple TV+ • 2025',
    releaseYear: 2025,
  },
  {
    id: 'movie-1',
    title: 'Dune: Part Two',
    mediaType: 'movie',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    progress: { current: 166, total: 166, unit: 'Mins' },
    score: 9.6,
    status: 'completed',
    subtitle: 'Denis Villeneuve • 2024',
    releaseYear: 2024,
  },
];
