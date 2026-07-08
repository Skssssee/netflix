import { Metadata } from 'next';
import MoviePlayerClient from './MoviePlayerClient';

type Props = {
  params: Promise<{ id: string }>;
};

// 1. Fetch movie details directly on the Server Side
async function getMovieData(id: string) {
  try {
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').replace(/\/$/, '');
    const res = await fetch(`${apiBase}/api/movies/${id}`, {
      next: { revalidate: 5 } // Cache API response for 5 seconds to prevent backend surges but allow fast updates
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching movie on server:", error);
    return null;
  }
}

// 2. Generate optimized Dynamic Metadata on the Server Side (Google Rank Boost)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovieData(id);

  if (!movie) {
    return {
      title: 'Watch Free Movies & Web Series Online | Mizofy Movies',
      description: 'Stream latest Desi web series and influencer video leaks online for free.'
    };
  }

  // Create highly optimized, localized SEO keywords string
  const cleanTitle = movie.title || 'Untitled Video';
  const categoryName = movie.category?.name || 'Desi Web Series';
  
  // Inject trending search target terms into the meta headers
  const seoTitle = `Watch ${cleanTitle} (${categoryName} New Leaks) Online | Mizofy`;
  const seoDesc = `Watch ${cleanTitle} online in HD. Free streaming for latest ${categoryName} episodes, Indian influencer leaks, and Desi webseries online.`;

  return {
    title: seoTitle,
    description: seoDesc,
    keywords: `${cleanTitle}, ${categoryName}, desi, new leaks, influencer leaks, new webseries, watch free online`,
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      images: [{ url: movie.thumbnailUrl }],
      type: 'video.other'
    }
  };
}

export default async function MoviePage({ params }: Props) {
  const { id } = await params;
  const movie = await getMovieData(id);

  if (!movie) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <span className="text-white font-poppins">Movie not found</span>
      </div>
    );
  }

  const isDirectUrl = movie.telegramFileId.startsWith('http://') || movie.telegramFileId.startsWith('https://');
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').replace(/\/$/, '');
  const videoSrc = isDirectUrl ? movie.telegramFileId : `${apiBase}/api/stream/${movie.telegramFileId}`;

  // Structured Data Schema for Google Video Indexing
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": movie.title,
    "description": movie.description || `Watch free ${movie.title} stream on Mizofy Movies.`,
    "thumbnailUrl": movie.thumbnailUrl || "https://images.unsplash.com/photo-1616530940355-351fabd9524b",
    "uploadDate": movie.createdAt ? new Date(movie.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    "contentUrl": videoSrc
  };

  return (
    <>
      {/* Structural Schema loaded instantly in Head on Server Side */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MoviePlayerClient 
        initialMovie={movie} 
        movieId={id} 
        videoSrc={videoSrc} 
      />
    </>
  );
}
