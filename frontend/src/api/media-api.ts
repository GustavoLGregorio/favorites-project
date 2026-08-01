import { apiClient } from './client';

export interface MediaSearchResult {
  external_id: string;
  provider: string; // Lowercase string enum ("anilist", "tmdb", etc.)
  title: string;
  native_title?: string;
  description?: string;
  cover_image_url?: string;
  banner_image_url?: string;
  media_type: string;
  release_year?: number;
  average_score?: number;
  genres: string[];
  episodes_or_chapters_count?: number;
}

export const mediaApi = {
  searchMedia: async (query: string, type?: string): Promise<MediaSearchResult[]> => {
    if (!query || query.trim().length === 0) return [];
    const response = await apiClient.get<MediaSearchResult[]>('/media/search', {
      params: { query: query.trim(), type },
    });
    return response.data;
  },
};
