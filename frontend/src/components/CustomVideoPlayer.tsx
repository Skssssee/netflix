'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

interface PlayerProps {
  src: string;
  poster?: string;
  title?: string;
}

export default function CustomVideoPlayer({ src, poster, title }: PlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Helper to extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = ''; // Clean up container

    const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');
    const isHls = src.includes('.m3u8');
    const options: Plyr.Options = {
      controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'pip', 'airplay', 'fullscreen'],
      settings: ['quality', 'speed'],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] }, // Explicitly configure speed to force settings gear menu to render
      autoplay: true,
      ratio: '16:9',
    };

    if (isYouTube) {
      const ytId = getYouTubeId(src);
      if (ytId) {
        // Standard Plyr YouTube DOM element structure
        const div = document.createElement('div');
        div.className = 'plyr__video-embed w-full h-full';
        div.setAttribute('data-plyr-provider', 'youtube');
        div.setAttribute('data-plyr-embed-id', ytId);
        container.appendChild(div);

        // Initialize Plyr on the native element
        // Added &vq=large (480p) to the embed options to default YouTube to 480p quality
        const plyrInstance = new Plyr(div, {
          ...options,
          youtube: {
            noCookie: true,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            vq: 'large' // Request 480p quality level
          }
        });
        playerRef.current = plyrInstance;
      } else {
        const video = document.createElement('video');
        video.src = src;
        video.playsInline = true;
        video.controls = true;
        container.appendChild(video);
        playerRef.current = new Plyr(video, options);
      }
    } else {
      const video = document.createElement('video');
      video.playsInline = true;
      video.controls = true;
      video.className = 'plyr-react w-full h-full';
      if (poster) video.poster = poster;
      container.appendChild(video);

      if (isHls) {
        if (Hls.isSupported()) {
          const hls = new Hls({
            maxMaxBufferLength: 10,
            enableWorker: true
          });
          hlsRef.current = hls;
          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            const levels = hls.levels; // Levels sorted by bitrate ascending
            
            // 1. Find and restrict Hls.js auto-adaptive selection levels to [240, 480]
            let minIndex = 0;
            let maxIndex = levels.length - 1;

            // Find index of first level >= 240p
            for (let i = 0; i < levels.length; i++) {
              if (levels[i].height >= 240) {
                minIndex = i;
                break;
              }
            }

            // Find index of last level <= 480p
            for (let i = levels.length - 1; i >= 0; i--) {
              if (levels[i].height <= 480) {
                maxIndex = i;
                break;
              }
            }

            // Apply adaptive limits to Hls.js instance
            (hls as any).minAutoLevel = minIndex;
            (hls as any).maxAutoLevel = maxIndex;

            // 2. Filter the UI qualities list to only show heights between 240 and 480
            const qualities = Array.from(
              new Set(
                levels
                  .filter((l) => l.height >= 240 && l.height <= 480)
                  .map((l) => l.height)
              )
            ).sort((a, b) => b - a);

            // If no qualities match the range, fallback to original levels list
            const finalQualities = qualities.length > 0 ? qualities : Array.from(new Set(levels.map(l => l.height))).filter(h => h && h > 0).sort((a,b)=>b-a);
            
            // Add 'Auto' quality options
            const plyrQualities = [0, ...finalQualities];

            const hlsOptions = {
              ...options,
              quality: {
                default: 0, // Auto
                options: plyrQualities,
                forced: true,
                onChange: (newQuality: number) => {
                  if (newQuality === 0) {
                    hls.currentLevel = -1; // Auto (restricted within [240, 480] range)
                  } else {
                    const index = levels.findIndex((l) => l.height === newQuality);
                    hls.currentLevel = index;
                  }
                },
              },
            };

            // Instantiate Plyr with the quality levels capped inside the 240p-480p range
            playerRef.current = new Plyr(video, hlsOptions);
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error('HLS Network error, trying to recover...', data);
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error('HLS Media error, trying to recover...', data);
                  hls.recoverMediaError();
                  break;
                default:
                  console.error('HLS fatal error, cannot recover:', data);
                  break;
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          playerRef.current = new Plyr(video, options);
        }
      } else {
        // Standard video (MP4 etc)
        video.src = src;
        playerRef.current = new Plyr(video, options);
      }
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      container.innerHTML = '';
    };
  }, [src, poster, title]);

  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden relative">
      {/* Scoped CSS to handle YouTube redirect blocks and crop title/branding */}
      <style dangerouslySetInnerHTML={{__html: `
        .plyr--youtube .plyr__video-embed iframe {
          width: 116% !important;
          height: 116% !important;
          top: -8% !important;
          left: -8% !important;
          pointer-events: none !important;
        }
        /* Make progress bar full width on top of controls (YouTube style) */
        .plyr__controls {
          flex-wrap: wrap !important;
          padding: 8px 12px !important;
          position: relative !important;
        }
        .plyr__progress {
          flex-basis: 100% !important;
          order: -1 !important;
          margin-bottom: 8px !important;
          width: 100% !important;
        }
        /* Position volume, pip, and settings at the top right of the player */
        .plyr__volume,
        .plyr__controls [data-plyr="pip"],
        .plyr__controls [data-plyr="settings"] {
          position: absolute !important;
          top: 15px !important;
          z-index: 10 !important;
          background: rgba(0, 0, 0, 0.5) !important;
          border-radius: 50% !important;
          transition: opacity 0.3s ease, transform 0.3s ease !important;
        }
        /* Hide them when Plyr controls are hidden */
        .plyr--hide-controls .plyr__volume,
        .plyr--hide-controls .plyr__controls [data-plyr="pip"],
        .plyr--hide-controls .plyr__controls [data-plyr="settings"] {
          opacity: 0 !important;
          pointer-events: none !important;
          transform: translateY(-10px) !important;
        }
        /* Position them neatly in the top right */
        .plyr__controls [data-plyr="settings"] {
          right: 15px !important;
        }
        .plyr__controls [data-plyr="pip"] {
          right: 60px !important;
        }
        .plyr__volume {
          right: 105px !important;
          border-radius: 20px !important;
          padding-right: 8px !important;
        }
      `}} />
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
