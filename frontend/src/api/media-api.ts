import { apiClient } from './client';

export interface MediaSearchResult {
  externalId: string;
  provider: number; // ServiceProvider enum (1 = AniList)
  title: string;
  nativeTitle?: string;
  description?: string;
  coverImageUrl?: string;
  bannerImageUrl?: string;
  mediaType: string;
  releaseYear?: number;
  averageScore?: number;
  genres: string[];
  episodesOrChaptersCount?: number;
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
