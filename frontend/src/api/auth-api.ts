import { apiClient } from './client';

export interface UserProfile {
  id: string;
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAtUtc: string;
}

export interface AuthResponse {
  token: string;
  expiresAtUtc: string;
  user: UserProfile;
}

export const authApi = {
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/google', { idToken });
    return response.data;
  },

  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/auth/me');
    return response.data;
  },
};
