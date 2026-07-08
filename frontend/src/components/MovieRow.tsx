'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const SHOW_LIMIT = 20;
const PLACEHOLDER = 'https://images.unsplash.com/photo-1616530940355-351fabd9524b';
const DYNAMIC_THUMB_BASE = (typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001') : 'http://localhost:5001').replace(/\/$/, '') + '/api/public/thumb/';

function getThumbnail(movie: any): string {
  const thumb = (movie.thumbnailUrl || '').trim();

  // If a real custom thumbnail has been set (not empty, not the Unsplash placeholder), use it as-is
  if (thumb && !thumb.startsWith(PLACEHOLDER)) {
    return thumb;
  }

  // Fall back to the dynamic Telegram thumbnail API using the message/file ID
  return `${DYNAMIC_THUMB_BASE}${movie.telegramFileId}`;
}

export default function MovieRow({ title, movies, categoryId }: { title: string; movies: any[]; categoryId?: string }) {
  const visible = movies.slice(0, SHOW_LIMIT);
  const hasMore = movies.length > SHOW_LIMIT;

  return (
    <div className="space-y-4" id="categories">
      {/* Row header */}
      <div className="flex items-center justify-between pr-4 md:pr-12">
        <h2 className="text-2xl md:text-3xl font-semibold font-outfit tracking-wide text-white/90">{title}</h2>
        {hasMore && (
          <Link
            href={`/category/${categoryId ?? encodeURIComponent(title)}`}
            className="flex items-center gap-1 text-red-500 hover:text-red-400 text-sm font-poppins font-medium transition group"
          >
            Show All
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Horizontal scroll row */}
      <div className="flex overflow-x-auto gap-4 scrollbar-hide py-4 px-2 -mx-2">
        {visible.map((movie) => (
          <Link key={movie._id} href={`/movie/${movie._id}`}>
            <div className="group relative flex-none w-[200px] md:w-[250px] aspect-video rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:z-10 cursor-pointer bg-gray-800 shadow-xl ring-1 ring-white/5">
              <img
                src={getThumbnail(movie)}
                alt={movie.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PLACEHOLDER + '?q=80&w=400';
                }}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white font-medium truncate font-outfit text-base leading-tight">{movie.title}</h3>
                <div className="flex gap-2 text-xs text-gray-400 mt-1 font-poppins">
                  <span>{movie.duration}</span>
                  <span>•</span>
                  <span>{movie.views} views</span>
                </div>
              </div>
              {/* Always-visible title bar at bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 group-hover:opacity-0 transition-opacity duration-200">
                <p className="text-white text-xs font-poppins truncate">{movie.title}</p>
              </div>
            </div>
          </Link>
        ))}

        {/* "Show All" card at end of row */}
        {hasMore && (
          <Link href={`/category/${categoryId ?? encodeURIComponent(title)}`} className="flex-none">
            <div className="flex flex-col items-center justify-center w-[150px] md:w-[180px] aspect-video rounded-xl bg-gray-800/50 border border-gray-700 hover:border-red-500/50 hover:bg-gray-800 transition-all duration-300 cursor-pointer gap-2 group">
              <div className="w-10 h-10 rounded-full bg-red-600/20 group-hover:bg-red-600 flex items-center justify-center transition-colors">
                <ChevronRight className="w-5 h-5 text-red-500 group-hover:text-white" />
              </div>
              <span className="text-gray-400 group-hover:text-white text-xs font-poppins font-medium transition-colors text-center px-2">
                View all {movies.length} videos
              </span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
