'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft, Loader2 } from 'lucide-react';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1616530940355-351fabd9524b';
function getThumbnail(movie: any): string {
  const t = (movie.thumbnailUrl || '').trim();
  if (t && !t.startsWith(PLACEHOLDER)) return t;
  const apiBase = (typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001') : 'http://localhost:5001').replace(/\/$/, '');
  return `${apiBase}/api/public/thumb/${movie.telegramFileId}`;
}

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [movies, setMovies] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const homeRes = await axios.get('http://localhost:5001/api/home');
        const cat = homeRes.data.categories.find(
          (c: any) => c._id === id || encodeURIComponent(c.name) === id
        );
        if (cat) {
          setCategoryName(cat.name);
          setMovies(cat.movies || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 px-4 md:px-12 pb-16">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="flex items-center gap-4 mb-10">
              <Link href="/" className="text-gray-400 hover:text-white transition">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <p className="text-xs text-gray-500 font-poppins uppercase tracking-widest mb-1">Category</p>
                <h1 className="text-3xl md:text-4xl font-outfit font-bold text-white">{categoryName}</h1>
                <p className="text-gray-500 font-poppins text-sm mt-1">{movies.length} videos</p>
              </div>
            </div>

            {/* Movies Grid */}
            {movies.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-500 font-poppins">
                No videos found in this category.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {movies.map((movie) => (
                  <Link key={movie._id} href={`/movie/${movie._id}`}>
                    <div className="group relative aspect-video rounded-xl overflow-hidden bg-gray-800 ring-1 ring-white/5 hover:ring-red-600/50 shadow-xl transition-all duration-300 hover:scale-105 hover:z-10">
                      <img
                        src={getThumbnail(movie)}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER + '?q=80&w=400'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                        <h3 className="text-white font-outfit font-medium text-sm truncate">{movie.title}</h3>
                        <div className="flex gap-2 text-xs text-gray-400 mt-0.5 font-poppins">
                          <span>{movie.duration}</span>
                          <span>•</span>
                          <span>{movie.views} views</span>
                        </div>
                      </div>
                      {/* Always visible bottom bar */}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent group-hover:opacity-0 transition-opacity">
                        <p className="text-white text-xs font-poppins truncate">{movie.title}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
