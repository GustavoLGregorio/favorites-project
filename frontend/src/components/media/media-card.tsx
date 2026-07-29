'use client';

import React from 'react';
import Image from 'next/image';
import { Star, Plus, Play, BookOpen, Gamepad2, Film } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import type { MediaItem } from '@/api/mock-data';

interface MediaCardContextValue {
  item: MediaItem;
}

const MediaCardContext = React.createContext<MediaCardContextValue | null>(null);

function useMediaCard() {
  const context = React.useContext(MediaCardContext);
  if (!context) {
    throw new Error('MediaCard sub-components must be rendered within <MediaCard>');
  }
  return context;
}

export interface MediaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  item: MediaItem;
  onLogProgress?: (item: MediaItem) => void;
}

export function MediaCard({ item, onLogProgress, className, children, ...props }: MediaCardProps) {
  const value = React.useMemo(() => ({ item }), [item]);

  return (
    <MediaCardContext.Provider value={value}>
      <div
        className={cn(
          'group relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-[#121622] border border-[#263044] hover:border-[#FB3DB5]/60 hover:shadow-2xl hover:shadow-[#FB3DB5]/15 transition-all duration-300 ease-out transform hover:-translate-y-1',
          className
        )}
        {...props}
      >
        {children ? (
          children
        ) : (
          <>
            <MediaCard.Cover />
            <MediaCard.ProgressBar />
            <MediaCard.HoverOverlay onLogProgress={onLogProgress} />
          </>
        )}
      </div>
    </MediaCardContext.Provider>
  );
}

// Sub-component: Cover Image
MediaCard.Cover = function MediaCardCover({ className }: { className?: string }) {
  const { item } = useMediaCard();

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      <Image
        src={item.coverUrl}
        alt={item.title}
        fill
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        priority={false}
      />
    </div>
  );
};

// Sub-component: Subtle Bottom Progress Bar
MediaCard.ProgressBar = function MediaCardProgressBar({ className }: { className?: string }) {
  const { item } = useMediaCard();

  if (!item.progress || item.progress.total <= 0) return null;

  const percentage = Math.min(
    100,
    Math.max(0, Math.round((item.progress.current / item.progress.total) * 100))
  );

  return (
    <div className={cn('absolute bottom-0 left-0 right-0 h-1.5 bg-[#0B0E14]/80 z-10', className)}>
      <div
        className="h-full bg-gradient-to-r from-[#FB3DB5] to-[#E0269B] transition-all duration-500 rounded-r-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// Sub-component: Hover Overlay (Fades in smoothly on mouse hover)
MediaCard.HoverOverlay = function MediaCardHoverOverlay({
  onLogProgress,
  className,
}: {
  onLogProgress?: (item: MediaItem) => void;
  className?: string;
}) {
  const { item } = useMediaCard();

  const getMediaIcon = (type: MediaItem['mediaType']) => {
    switch (type) {
      case 'anime':
      case 'series':
      case 'movie':
        return <Film className="h-3.5 w-3.5" />;
      case 'manga':
      case 'book':
        return <BookOpen className="h-3.5 w-3.5" />;
      case 'game':
        return <Gamepad2 className="h-3.5 w-3.5" />;
      default:
        return <Play className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div
      className={cn(
        'absolute inset-0 z-20 flex flex-col justify-between p-4 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/85 to-[#0B0E14]/40 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out backdrop-blur-[2px]',
        className
      )}
    >
      {/* Top Header inside overlay */}
      <div className="flex items-center justify-between gap-2 transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <Badge variant="magenta" className="flex items-center gap-1 bg-[#FB3DB5]/20 backdrop-blur-md">
          {getMediaIcon(item.mediaType)}
          <span>{item.mediaType}</span>
        </Badge>

        {item.score > 0 && (
          <div className="flex items-center gap-1 bg-[#121622]/90 border border-[#263044] px-2 py-0.5 rounded-full text-xs font-semibold text-[#CBD5E1]">
            <Star className="h-3 w-3 fill-[#FB3DB5] text-[#FB3DB5]" />
            <span>{item.score.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Bottom Content inside overlay */}
      <div className="flex flex-col gap-2.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <div>
          <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug drop-shadow-sm">
            {item.title}
          </h3>
          {item.subtitle && (
            <p className="text-[11px] text-[#94A3B8] mt-0.5 line-clamp-1">{item.subtitle}</p>
          )}
        </div>

        {/* Progress Tracker Info */}
        <div className="flex items-center justify-between text-xs text-[#CBD5E1] font-medium bg-[#1A2130]/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-[#263044]">
          <span>Progress</span>
          <span className="text-[#FB3DB5] font-semibold">
            {item.progress.current} / {item.progress.total} {item.progress.unit}
          </span>
        </div>

        {/* Quick Log Action Button */}
        <Button
          variant="magenta"
          size="sm"
          className="w-full text-xs mt-0.5"
          onClick={(e) => {
            e.stopPropagation();
            if (onLogProgress) onLogProgress(item);
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Quick Log</span>
        </Button>
      </div>
    </div>
  );
};
