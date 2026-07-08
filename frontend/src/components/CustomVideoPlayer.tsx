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
    
    // Configured controls to HIDE sound/volume and settings/speed, keeping Play, Progress, Time, PIP, and Fullscreen.
    // Enabled automatic looping (loop: { active: true }).
    const options: Plyr.Options = {
      controls: ['play-large', 'play', 'progress', 'current-time', 'pip', 'fullscreen'],
      autoplay: true,
      loop: { active: true },
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
        const plyrInstance = new Plyr(div, {
          ...options,
          youtube: {
            noCookie: true,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            loop: 1, // Loop YouTube video
            playlist: ytId // Required by YouTube iframe API to support looping a single video
          }
        });
        playerRef.current = plyrInstance;
      } else {
        const video = document.createElement('video');
        video.src = src;
        video.playsInline = true;
        video.controls = true;
        video.loop = true;
        container.appendChild(video);
        playerRef.current = new Plyr(video, options);
      }
    } else {
      const video = document.createElement('video');
      video.playsInline = true;
      video.controls = true;
      video.loop = true; // Loop HTML5/HLS video natively
      video.className = 'plyr-react w-full h-full';
      if (poster) video.poster = poster;
      container.appendChild(video);

      if (isHls) {
        if (Hls.isSupported()) {
          // Optimized for low-latency fast-start buffering
          const hls = new Hls({
            maxMaxBufferLength: 10,
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsRef.current = hls;
          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            const levels = hls.levels; // Levels sorted by bitrate ascending
            
            // Restrict auto quality levels to [240, 480]
            let minIndex = 0;
            let maxIndex = levels.length - 1;

            for (let i = 0; i < levels.length; i++) {
              if (levels[i].height >= 240) {
                minIndex = i;
                break;
              }
            }
            for (let i = levels.length - 1; i >= 0; i--) {
              if (levels[i].height <= 480) {
                maxIndex = i;
                break;
              }
            }

            (hls as any).minAutoLevel = minIndex;
            (hls as any).maxAutoLevel = maxIndex;

            // Instantiate Plyr with loop enabled and without speed/volume controls
            playerRef.current = new Plyr(video, options);
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
          flex-grow: 1 !important;
        }
      `}} />
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
