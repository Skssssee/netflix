'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import HeroSlider from '@/components/HeroSlider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2, Search, Film, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [homeData, setHomeData] = useState<any>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moviesLoading, setMoviesLoading] = useState(false);

  // Filter & Search states
  const [searchVal, setSearchVal] = useState(''); // current typing value
  const [activeSearch, setActiveSearch] = useState(''); // actual search executed
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [safeSearch, setSafeSearch] = useState(false); // SafeSearch content filter
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMovies, setTotalMovies] = useState(0);

  const chipsRef = useRef<HTMLDivElement>(null);

  // Fetch static home layout data (sliders, categories, socials)
  useEffect(() => {
    const fetchHomeLayout = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/home');
        setHomeData(res.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeLayout();
  }, []);

  // Fetch paginated, filtered, searched movies
  useEffect(() => {
    const fetchMoviesData = async () => {
      setMoviesLoading(true);
      try {
        const res = await axios.get('http://localhost:5001/api/movies', {
          params: {
            categoryId: selectedCategory,
            search: activeSearch,
            page,
            limit: 50,
            safeSearch: safeSearch ? 'true' : 'false'
          }
        });
        setMovies(res.data.movies);
        setTotalPages(res.data.totalPages || 1);
        setTotalMovies(res.data.total || 0);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setMoviesLoading(false);
      }
    };
    fetchMoviesData();
  }, [selectedCategory, activeSearch, page, safeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchVal);
  };

  const handleCategorySelect = (categoryId: string) => {
    setPage(1);
    setSelectedCategory(categoryId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black flex-col gap-4">
        <span className="text-2xl font-outfit font-extrabold tracking-widest text-red-600 animate-pulse">MIZOFY</span>
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!homeData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-gray-400 font-poppins">Error loading content. Please try again.</p>
      </div>
    );
  }

  return (
    <>
      <Header />

      <main className="bg-black text-white min-h-screen pt-16 pb-12">
        {/* Featured Slider */}
        <section aria-label="Featured content">
          <HeroSlider sliders={homeData.sliders} />
        </section>

        {/* Search & Category Chips Container */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10 space-y-6">
          {/* YouTube-style Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex justify-center max-w-xl mx-auto">
            <div className="flex w-full bg-gray-900 border border-gray-700 rounded-full overflow-hidden focus-within:border-red-600 transition">
              <input
                type="text"
                placeholder="Search movies, categories..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-transparent px-5 py-3 outline-none text-white text-sm"
              />
              <button type="submit" className="bg-gray-800 border-l border-gray-700 px-6 hover:bg-gray-700 text-gray-300 transition flex items-center justify-center">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* YouTube-style Category Chips */}
          <div className="relative">
            <div
              ref={chipsRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide py-2 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* "All" chip */}
              <button
                onClick={() => handleCategorySelect('all')}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition duration-200 ${
                  selectedCategory === 'all'
                    ? 'bg-white text-black'
                    : 'bg-gray-850 hover:bg-gray-750 text-white'
                }`}
              >
                All
              </button>

              {/* Db Category chips */}
              {homeData.categories.map((cat: any) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategorySelect(cat._id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition duration-200 ${
                    selectedCategory === cat._id
                      ? 'bg-white text-black'
                      : 'bg-gray-850 hover:bg-gray-750 text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <section aria-label="Videos list" className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
          {moviesLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              <span className="text-sm text-gray-400">Loading videos...</span>
            </div>
          ) : movies.length === 0 ? (
            <div className="text-center py-20">
              <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No videos found. Try a different search or category.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* YouTube Style Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
                {movies.map((m: any) => (
                  <Link key={m._id} href={`/movie/${m._id}`}>
                    <div className="group cursor-pointer flex flex-col gap-3">
                      {/* Thumbnail Container */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
                        <img
                          src={m.thumbnailUrl}
                          alt={m.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition duration-200"
                        />
                        {/* Duration label */}
                        <span className="absolute bottom-2 right-2 bg-black/85 px-1.5 py-0.5 rounded text-[10px] text-gray-200 font-medium font-mono">
                          {m.duration}
                        </span>
                      </div>

                      {/* Details row */}
                      <div className="flex gap-3 px-1">
                        {/* Channel Avatar Placeholder */}
                        <div className="w-9 h-9 rounded-full bg-red-700 hover:bg-red-600 flex-shrink-0 flex items-center justify-center font-bold text-sm text-white select-none">
                          {m.category?.name ? m.category.name.charAt(0).toUpperCase() : 'M'}
                        </div>

                        {/* Title and metadata */}
                        <div className="flex flex-col gap-1 leading-snug">
                          <h2 className="font-semibold text-sm text-gray-100 group-hover:text-white line-clamp-2 transition leading-tight">
                            {m.title}
                          </h2>
                          <div className="text-xs text-gray-400 flex flex-col gap-0.5 font-poppins">
                            <span>{m.category?.name || 'Uncategorized'}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="flex items-center gap-0.5"><Eye className="w-3.5 h-3.5" /> {m.views || 0}</span>
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

              {/* YouTube Style Pagination Buttons */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-850">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    className="px-6 py-2.5 rounded-full bg-gray-850 hover:bg-gray-750 text-sm font-semibold disabled:opacity-40 disabled:hover:bg-gray-850 transition"
                  >
                    &larr; Previous Page
                  </button>
                  <span className="text-sm font-semibold text-gray-400 font-poppins">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    className="px-6 py-2.5 rounded-full bg-gray-850 hover:bg-gray-750 text-sm font-semibold disabled:opacity-40 disabled:hover:bg-gray-850 transition"
                  >
                    Next Page &rarr;
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* SEO Directory & Dynamic Keywords Tag Cloud from Database Categories */}
        <section aria-label="SEO Directory" className="max-w-7xl mx-auto px-4 md:px-8 mt-20 pt-10 border-t border-gray-800/60 space-y-6">
          <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800/50">
            <h3 className="text-lg font-outfit font-bold text-white/90 mb-4">Popular Search Directories</h3>
            
            {/* Dynamic Keywords/Backlinks Cloud */}
            <div className="flex flex-wrap gap-2.5 mb-6">
              {homeData.categories.map((cat: any) => (
                <button
                  key={cat._id}
                  onClick={() => {
                    handleCategorySelect(cat._id);
                    window.scrollTo({ top: chipsRef.current?.offsetTop || 400, behavior: 'smooth' });
                  }}
                  className="text-xs bg-gray-850/60 hover:bg-red-600 hover:text-white border border-gray-850/50 hover:border-red-600 px-3 py-1.5 rounded-lg text-gray-400 transition"
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Crawlable SEO Text */}
            <div className="text-xs text-gray-500 font-poppins space-y-3 leading-relaxed border-t border-gray-800/40 pt-4">
              <p>
                Welcome to Mizofy Movies, the top community directory to search, stream, and discover popular video series and regional dramas. Filter through high-volume descriptive genres and watch latest releases from our admin category directories.
              </p>
              <p>
                Our community-driven indexing provides direct access to broad media types such as OTT web series, amateur creator videos, and lifestyle romance stories. Use our search directory to quickly filter specific category listings designed for maximum organic reach.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer socials={homeData.socials} />
    </>
  );
}
