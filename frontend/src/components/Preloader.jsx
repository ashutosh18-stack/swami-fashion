import React, { useState, useEffect, useRef } from 'react';

export default function Preloader({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const videoRef = useRef(null);
  const hasFinishedRef = useRef(false);

  const handleFinish = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 120); // Faster execution reveal
  };

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      // Speed up video execution for snappy load
      video.playbackRate = 1.4;

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.muted = true;
          video.playbackRate = 1.4;
          video.play().catch(() => {
            setTimeout(handleFinish, 2500);
          });
        });
      }

      const onLoadedMetadata = () => {
        video.playbackRate = 1.4;
        if (video.duration && !isNaN(video.duration)) {
          const fastDurationMs = ((video.duration / 1.4) * 1000) + 80;
          setTimeout(handleFinish, fastDurationMs);
        }
      };

      video.addEventListener('loadedmetadata', onLoadedMetadata);
      return () => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
      };
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div
      id="swami-preloader"
      onClick={handleFinish}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        backgroundColor: '#FAF8F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'opacity 0.12s ease-out',
        opacity: isFading ? 0 : 1,
        cursor: 'pointer'
      }}
    >
      <video
        ref={videoRef}
        src="/load_animation.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleFinish}
        className="swami-load-video"
      />

      <style>{`
        .swami-load-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          object-fit: cover;
          object-position: center;
          display: block;
        }
      `}</style>
    </div>
  );
}
