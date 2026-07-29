export const storageKeys = {
  local: {
    theme: 'favorites_theme_mode',
    userPreferences: 'favorites_user_prefs',
    sessionToken: 'favorites_jwt_token',
  },
  session: {
    activeCategoryTab: 'favorites_active_category_tab',
    searchQueryDraft: 'favorites_search_query_draft',
  },
  cookies: {
    authToken: 'favorites_auth_token',
    refreshToken: 'favorites_refresh_token',
    googleIdToken: 'favorites_google_id_token',
  },
} as const;
