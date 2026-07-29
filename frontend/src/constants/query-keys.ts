export const queryKeys = {
  auth: {
    user: () => ['auth', 'user'] as const,
    linkedAccounts: () => ['auth', 'linked-accounts'] as const,
  },
  externalMedia: {
    all: ['external-media'] as const,
    search: (provider: string, query: string) => [...queryKeys.externalMedia.all, 'search', provider, query] as const,
    details: (provider: string, externalId: string) => [...queryKeys.externalMedia.all, 'detail', provider, externalId] as const,
  },
  collections: {
    all: ['collections'] as const,
    detail: (id: string) => [...queryKeys.collections.all, id] as const,
    userLists: (userId: string) => [...queryKeys.collections.all, 'user', userId] as const,
  },
  media: {
    all: ['media'] as const,
    lists: () => [...queryKeys.media.all, 'list'] as const,
    list: (category: string) => [...queryKeys.media.lists(), category] as const,
    details: () => [...queryKeys.media.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.media.details(), id] as const,
  },
} as const;
