'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Share2, ArrowLeft, Loader2, Eye } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CustomVideoPlayer = dynamic(() => import('@/components/CustomVideoPlayer'), { ssr: false });

function formatDuration(duration: string): string {
  if (!duration) return '0m';
  const clean = duration.replace(/s$/, '').trim();
  const num = parseFloat(clean);
  if (!isNaN(num)) {
    const minutes = Math.floor(num / 60);
    const seconds = Math.round(num % 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }
  if (duration.includes('m') && duration.includes('s')) {
    const match = duration.match(/(\d+)m\s+([\d\.]+)s/);
    if (match) {
      const minutes = match[1];
      const seconds = Math.round(parseFloat(match[2]));
      return `${minutes}m ${seconds}s`;
    }
  }
  return duration;
}

interface MoviePlayerClientProps {
  initialMovie: any;
  movieId: string;
  videoSrc: string;
}

export default function MoviePlayerClient({ initialMovie, movieId, videoSrc }: MoviePlayerClientProps) {
  const [movie] = useState<any>(initialMovie);
  const [relatedMovies, setRelatedMovies] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    if (!movie?.category?._id) return;
    
    const fetchRelated = async () => {
      setLoadingRelated(true);
      try {
        const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').replace(/\/$/, '');
        const res = await axios.get(`${apiBase}/api/categories/${movie.category._id}/movies`, {
          params: { page: 1, limit: 20 }
        });
        // Filter out current movie from related videos
        const filtered = res.data.movies.filter((m: any) => m._id !== movieId);
        setRelatedMovies(filtered);
        setHasMore(res.data.hasMore);
      } catch (error) {
        console.error("Error fetching related movies:", error);
      } finally {
        setLoadingRelated(false);
      }
    };
    fetchRelated();
  }, [movie, movieId]);

  const loadMoreRelated = async () => {
    if (loadingRelated || !hasMore) return;
    setLoadingRelated(true);
    try {
      const nextPage = page + 1;
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').replace(/\/$/, '');
      const res = await axios.get(`${apiBase}/api/categories/${movie.category._id}/movies`, {
        params: { page: nextPage, limit: 20 }
      });
      const filtered = res.data.movies.filter((m: any) => m._id !== movieId);
      setRelatedMovies((prev) => [...prev, ...filtered]);
      setPage(nextPage);
      setHasMore(res.data.hasMore);
    } catch (e) {
      console.error("Error loading more related movies:", e);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie?.title || 'Check out this movie',
          text: `Watch ${movie?.title} on our streaming platform!`,
          url: url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <>
    <Header />
    <div className="min-h-screen bg-black text-white flex flex-col font-poppins pt-16">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <Link href="/">
          <button className="flex items-center gap-2 hover:text-gray-300 transition">
            <ArrowLeft className="w-6 h-6" />
            <span className="text-lg font-medium">Back to Browse</span>
          </button>
        </Link>
        <button onClick={handleShare} className="p-2 hover:bg-white/10 rounded-full transition">
          <Share2 className="w-6 h-6" />
        </button>
      </div>

      {/* Video Player */}
      <div className="w-full bg-black py-4">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-8">
          <div className="rounded-xl overflow-hidden shadow-2xl bg-gray-900 aspect-video">
            <CustomVideoPlayer 
              src={videoSrc}
              poster={movie.thumbnailUrl}
              title={movie.title}
            />
          </div>
        </div>
      </div>

      {/* Details — always visible below player */}
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-outfit font-bold mb-3 tracking-tight">{movie.title}</h1>
          <div className="flex flex-wrap gap-3 text-sm mb-6">
            <span className="bg-white/10 px-3 py-1 rounded-full text-white font-medium">{formatDuration(movie.duration)}</span>
            <span className="bg-red-600/20 text-red-400 px-3 py-1 rounded-full font-medium">{movie.category?.name}</span>
            <span className="bg-white/10 px-3 py-1 rounded-full text-gray-300">{movie.views} views</span>
          </div>
          <div className="bg-gray-900/60 p-5 rounded-xl border border-gray-800">
            <h2 className="text-lg font-outfit font-semibold mb-2 text-white/90">Description</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{movie.description}</p>
          </div>
        </div>

        {/* Related Videos */}
        <div className="border-t border-gray-800 pt-8">
          <h3 className="text-xl md:text-2xl font-outfit font-bold mb-6 text-white">More from this Category</h3>
          {relatedMovies.length === 0 ? (
            <p className="text-gray-500 text-sm">No other videos in this category.</p>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
                {relatedMovies.map((m: any) => (
                  <Link key={m._id} href={`/movie/${m._id}`}>
                    <div className="group cursor-pointer flex flex-col gap-3">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
                        <img 
                          src={m.thumbnailUrl} 
                          alt={m.title} 
                          className="w-full h-full object-cover group-hover:scale-102 transition duration-200"
                          loading="lazy"
                        />
                        <span className="absolute bottom-2 right-2 bg-black/85 text-[10px] font-semibold px-2 py-0.5 rounded font-poppins text-white">
                          {formatDuration(m.duration)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex flex-col gap-1 leading-snug">
                          <h4 className="font-semibold text-sm text-gray-100 group-hover:text-white line-clamp-2 transition leading-tight">
                            {m.title}
                          </h4>
                          <div className="text-xs text-gray-400 flex items-center gap-1.5 font-poppins">
                            <span>{m.views} views</span>
                            <span className="text-[10px] text-gray-650">•</span>
                            <span>{m.updatedAt ? new Date(m.updatedAt).toLocaleDateString() : 'Recently'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center pt-4">
                  <button 
                    onClick={loadMoreRelated} 
                    disabled={loadingRelated} 
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-750 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition"
                  >
                    {loadingRelated ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load More Videos"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
    </>
  );
}
