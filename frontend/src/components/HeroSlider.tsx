'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import { Play, Info } from 'lucide-react';
import Link from 'next/link';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1616530940355-351fabd9524b';

function getSliderBg(slider: any): string {
  // Priority: slider.imageUrl → movie thumbnailUrl → dynamic thumb API
  const img = slider.imageUrl || '';
  if (img && !img.startsWith('n') && img.startsWith('http')) return img;
  
  const movieThumb = slider.movieId?.thumbnailUrl || '';
  if (movieThumb && !movieThumb.startsWith(PLACEHOLDER)) return movieThumb;
  
  // Fall back to dynamic Telegram thumbnail
  const fileId = slider.movieId?.telegramFileId;
  if (fileId) {
    const apiBase = (typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001') : 'http://localhost:5001').replace(/\/$/, '');
    return `${apiBase}/api/public/thumb/${fileId}`;
  }
  
  return PLACEHOLDER + '?q=80&w=1974&auto=format&fit=crop';
}

export default function HeroSlider({ sliders }: { sliders: any[] }) {
  if (!sliders || sliders.length === 0) return null;

  return (
    <div className="relative w-full h-[40vh] md:h-[50vh] lg:h-[55vh] overflow-hidden">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={true}
        className="w-full h-full"
      >
        {sliders.map((slider) => (
          <SwiperSlide key={slider._id}>
            <div className="relative w-full h-full">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${getSliderBg(slider)})` }}
              />
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

              {/* Content */}
              <div className="absolute bottom-8 left-4 md:left-12 max-w-xl text-left space-y-2.5">
                <p className="text-[10px] font-poppins font-semibold uppercase tracking-widest text-red-500">Now Streaming</p>
                <h1 className="text-2xl md:text-4xl font-outfit font-bold text-white drop-shadow-lg leading-tight">
                  {slider.title || slider.movieId?.title}
                </h1>
                <p className="text-xs md:text-sm text-gray-300 line-clamp-2 drop-shadow-md font-poppins">
                  {slider.description || slider.movieId?.description}
                </p>
                <div className="flex gap-3 pt-2">
                  {slider.movieId?._id && (
                    <Link href={`/movie/${slider.movieId._id}`}>
                      <button className="flex items-center gap-1.5 bg-white text-black px-5 py-2 rounded-lg hover:bg-white/90 transition font-poppins font-semibold text-sm shadow-xl">
                        <Play className="w-4 h-4 fill-current" /> Play
                      </button>
                    </Link>
                  )}
                  <button className="flex items-center gap-1.5 bg-gray-600/70 backdrop-blur text-white px-5 py-2 rounded-lg hover:bg-gray-600/50 transition font-poppins font-semibold text-sm">
                    <Info className="w-4 h-4" /> More Info
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

