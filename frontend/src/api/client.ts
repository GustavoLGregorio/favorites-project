import axios from 'axios';
import { storageKeys } from '@/constants/storage-keys';
import { MOCK_MEDIA_ITEMS, type MediaItem } from './mock-data';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach Authorization bearer token interceptor
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(storageKeys.local.sessionToken);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Fallback Mock API Service methods for media demo
export const mediaService = {
  async getMediaItems(mediaType?: string): Promise<MediaItem[]> {
    if (!mediaType || mediaType === 'all') {
      return MOCK_MEDIA_ITEMS;
    }
    return MOCK_MEDIA_ITEMS.filter((item) => item.mediaType === mediaType);
  },

  async getMediaById(id: string): Promise<MediaItem | undefined> {
    return MOCK_MEDIA_ITEMS.find((item) => item.id === id);
  },

  async updateProgress(id: string, newProgress: number): Promise<MediaItem> {
    const item = MOCK_MEDIA_ITEMS.find((i) => i.id === id);
    if (!item) throw new Error('Item not found');
    item.progress.current = newProgress;
    return { ...item };
  },
};
