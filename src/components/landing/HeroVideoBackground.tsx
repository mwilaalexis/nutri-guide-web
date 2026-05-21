import { useEffect, useRef, useState } from "react";

const POSTER =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80";

/** Local file (recommended): place `hero.mp4` in `public/videos/hero.mp4` */
const LOCAL_MP4 = "/videos/hero.mp4";

/** Free fallback if local file is missing (Mixkit license — preview CDN) */
const FALLBACK_MP4 =
  "https://assets.mixkit.co/videos/preview/mixkit-serving-food-on-a-plate-29009-large.mp4";

const ENV_MP4 = (import.meta.env.VITE_HERO_VIDEO_URL as string | undefined)?.trim();

export default function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [usePosterOnly, setUsePosterOnly] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () => {
      const reduced = mq.matches;
      setUsePosterOnly(reduced);
      const v = videoRef.current;
      if (!v) return;
      if (reduced) {
        v.pause();
        v.removeAttribute("src");
      }
    };
    applyMotion();
    mq.addEventListener("change", applyMotion);
    return () => mq.removeEventListener("change", applyMotion);
  }, []);

  useEffect(() => {
    if (usePosterOnly) return;
    const v = videoRef.current;
    if (!v) return;

    const sources = [ENV_MP4, LOCAL_MP4, FALLBACK_MP4].filter(Boolean) as string[];
    let index = 0;

    const tryNext = () => {
      if (index >= sources.length) {
        setUsePosterOnly(true);
        return;
      }
      v.src = sources[index];
      index += 1;
      v.load();
    };

    const onError = () => tryNext();
    const onLoaded = () => {
      void v.play().catch(() => {
        /* autoplay blocked — poster still visible */
      });
    };

    v.addEventListener("error", onError);
    v.addEventListener("loadeddata", onLoaded);
    tryNext();

    return () => {
      v.removeEventListener("error", onError);
      v.removeEventListener("loadeddata", onLoaded);
    };
  }, [usePosterOnly]);

  if (usePosterOnly) {
    return (
      <div className="hero-video" aria-hidden>
        <div
          className="hero-video__poster"
          style={{ backgroundImage: `url(${POSTER})` }}
        />
      </div>
    );
  }

  return (
    <div className="hero-video" aria-hidden>
      <video
        ref={videoRef}
        className="hero-video__media"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={POSTER}
      />
    </div>
  );
}
