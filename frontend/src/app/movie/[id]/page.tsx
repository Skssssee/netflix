'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { Share2, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Load CustomVideoPlayer dynamically to avoid SSR window issues
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

export default function MoviePlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const movieId = unwrappedParams.id;
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Related movies states
  const [relatedMovies, setRelatedMovies] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/movies/${movieId}`);
        setMovie(res.data);
      } catch (error) {
        console.error("Error fetching movie:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [movieId]);

  useEffect(() => {
    if (!movie?.category?._id) return;
    
    const fetchRelated = async () => {
      setLoadingRelated(true);
      try {
        const res = await axios.get(`http://localhost:5001/api/categories/${movie.category._id}/movies`, {
          params: { page: 1, limit: 20 }
        });
        // Filter out the current playing movie
        const filtered = res.data.movies.filter((m: any) => m._id !== movieId);
        setRelatedMovies(filtered);
        setHasMore(res.data.hasMore);
        setPage(1);
      } catch (e) {
        console.error("Error fetching related movies:", e);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelated();
  }, [movie?.category?._id, movieId]);

  const loadMoreRelated = async () => {
    if (loadingRelated || !hasMore || !movie?.category?._id) return;
    setLoadingRelated(true);
    const nextPage = page + 1;
    try {
      const res = await axios.get(`http://localhost:5001/api/categories/${movie.category._id}/movies`, {
        params: { page: nextPage, limit: 20 }
      });
      // Filter out the current playing movie
      const filtered = res.data.movies.filter((m: any) => m._id !== movieId);
      setRelatedMovies(prev => [...prev, ...filtered]);
      setHasMore(res.data.hasMore);
      setPage(nextPage);
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

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-black"><span className="text-white font-poppins">Loading...</span></div>;
  if (!movie) return <div className="h-screen w-full flex items-center justify-center bg-black"><span className="text-white font-poppins">Movie not found</span></div>;

  const isDirectUrl = movie.telegramFileId.startsWith('http://') || movie.telegramFileId.startsWith('https://');
  const apiBase = (typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001') : 'http://localhost:5001').replace(/\/$/, '');
  const videoSrc = isDirectUrl ? movie.telegramFileId : `${apiBase}/api/stream/${movie.telegramFileId}`;

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": movie.title,
      "description": movie.description || "Watch free streaming video on Mizofy Movies.",
      "thumbnailUrl": movie.thumbnailUrl || "https://images.unsplash.com/photo-1616530940355-351fabd9524b",
      "uploadDate": movie.createdAt ? new Date(movie.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      "contentUrl": videoSrc
    })}} />
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
                      {/* Thumbnail Container */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
                        <img 
                          src={m.thumbnailUrl} 
                          alt={m.title} 
                          className="w-full h-full object-cover group-hover:scale-102 transition duration-200"
                        />
                        <span className="absolute bottom-2 right-2 bg-black/85 px-1.5 py-0.5 rounded text-[10px] text-gray-200 font-medium font-mono">
                          {m.duration}
                        </span>
                      </div>
                      
                      {/* Details row */}
                      <div className="flex gap-3 px-1">
                        {/* Channel Avatar Placeholder */}
                        <div className="w-8 h-8 rounded-full bg-red-700 hover:bg-red-600 flex-shrink-0 flex items-center justify-center font-bold text-xs text-white select-none">
                          {movie.category?.name ? movie.category.name.charAt(0).toUpperCase() : 'M'}
                        </div>

                        {/* Title and metadata */}
                        <div className="flex flex-col gap-1 leading-snug">
                          <h4 className="font-semibold text-sm text-gray-100 group-hover:text-white line-clamp-2 transition leading-tight">
                            {m.title}
                          </h4>
                          <div className="text-xs text-gray-400 flex flex-col gap-0.5 font-poppins">
                            <span>{movie.category?.name || 'Uncategorized'}</span>
                            <div className="flex items-center gap-1.5">
                              <span>{m.views || 0} views</span>
                              <span className="text-[10px] text-gray-600">•</span>
                              <span>{m.updatedAt ? new Date(m.updatedAt).toLocaleDateString() : 'Recently'}</span>
                            </div>
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
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-850 disabled:text-gray-500 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition shadow-lg shadow-red-900/20 flex items-center gap-2"
                  >
                    {loadingRelated && <Loader2 className="w-4 h-4 animate-spin" />}
                    View All / Load More
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
