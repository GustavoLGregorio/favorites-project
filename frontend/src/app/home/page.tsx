'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Film, BookOpen, Gamepad2, Tv, Sparkles, Filter } from 'lucide-react';
import { queryKeys } from '@/constants/query-keys';
import { mediaService } from '@/api/client';
import { useAuth } from '@/context/auth-context';
import { MediaShelf } from '@/components/lists/media-shelf';
import { MediaCard } from '@/components/media/media-card';
import { Button } from '@/components/ui/button';
import type { MediaItem } from '@/api/mock-data';

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'in_progress' | 'completed' | 'planning'>('all');
  const { user } = useAuth();

  const { data: mediaItems = [], isLoading } = useQuery({
    queryKey: queryKeys.media.list(activeFilter),
    queryFn: () => mediaService.getMediaItems(),
  });

  const handleQuickLog = (item: MediaItem) => {
    alert(`Logged progress for "${item.title}"! (+1 ${item.progress.unit})`);
  };

  const filteredItems = React.useMemo(() => {
    if (activeFilter === 'all') return mediaItems;
    return mediaItems.filter((item) => item.status === activeFilter);
  }, [mediaItems, activeFilter]);

  const animeItems = filteredItems.filter((item) => item.mediaType === 'anime');
  const bookItems = filteredItems.filter((item) => item.mediaType === 'book' || item.mediaType === 'manga');
  const gameItems = filteredItems.filter((item) => item.mediaType === 'game');
  const showItems = filteredItems.filter((item) => item.mediaType === 'movie' || item.mediaType === 'series');

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Welcome & Filter Bar */}
      <div className="bg-[#121622] border border-[#263044] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-[#0B0E14]/50">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FB3DB5]/15 text-[#FB3DB5] text-xs font-semibold border border-[#FB3DB5]/30 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>User Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-[#FB3DB5]">{user ? user.name : 'Guest'}</span>
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            {user
              ? `Tracking ${mediaItems.length} active entries across your personal media library.`
              : 'Sign in with Google to sync your media library and track movies, anime, books, and games.'}
          </p>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="h-4 w-4 text-[#94A3B8] mr-1 hidden sm:block" />
          <Button
            variant={activeFilter === 'all' ? 'magenta' : 'silver'}
            size="sm"
            onClick={() => setActiveFilter('all')}
          >
            All Entries ({mediaItems.length})
          </Button>
          <Button
            variant={activeFilter === 'in_progress' ? 'magenta' : 'silver'}
            size="sm"
            onClick={() => setActiveFilter('in_progress')}
          >
            In Progress
          </Button>
          <Button
            variant={activeFilter === 'completed' ? 'magenta' : 'silver'}
            size="sm"
            onClick={() => setActiveFilter('completed')}
          >
            Completed
          </Button>
          <Button
            variant={activeFilter === 'planning' ? 'magenta' : 'silver'}
            size="sm"
            onClick={() => setActiveFilter('planning')}
          >
            Planning
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-[#FB3DB5] border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          {/* Shelf 1: Anime in Progress */}
          {animeItems.length > 0 && (
            <MediaShelf title="Anime in Progress" count={animeItems.length} icon={<Film className="h-4 w-4" />}>
              <MediaShelf.Grid>
                {animeItems.map((item) => (
                  <MediaCard key={item.id} item={item} onLogProgress={handleQuickLog} />
                ))}
              </MediaShelf.Grid>
            </MediaShelf>
          )}

          {/* Shelf 2: Manga & Books in Progress */}
          {bookItems.length > 0 && (
            <MediaShelf
              title="Manga & Books in Progress"
              count={bookItems.length}
              icon={<BookOpen className="h-4 w-4" />}
            >
              <MediaShelf.Grid>
                {bookItems.map((item) => (
                  <MediaCard key={item.id} item={item} onLogProgress={handleQuickLog} />
                ))}
              </MediaShelf.Grid>
            </MediaShelf>
          )}

          {/* Shelf 3: Games in Progress */}
          {gameItems.length > 0 && (
            <MediaShelf title="Games in Progress" count={gameItems.length} icon={<Gamepad2 className="h-4 w-4" />}>
              <MediaShelf.Grid>
                {gameItems.map((item) => (
                  <MediaCard key={item.id} item={item} onLogProgress={handleQuickLog} />
                ))}
              </MediaShelf.Grid>
            </MediaShelf>
          )}

          {/* Shelf 4: Movies & Series in Progress */}
          {showItems.length > 0 && (
            <MediaShelf title="Movies & Series in Progress" count={showItems.length} icon={<Tv className="h-4 w-4" />}>
              <MediaShelf.Grid>
                {showItems.map((item) => (
                  <MediaCard key={item.id} item={item} onLogProgress={handleQuickLog} />
                ))}
              </MediaShelf.Grid>
            </MediaShelf>
          )}
        </>
      )}
    </div>
  );
}
