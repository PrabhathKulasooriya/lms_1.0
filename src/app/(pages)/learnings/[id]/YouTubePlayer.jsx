"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import "youtube-video-element/react"; // Preload lazy chunk for react-player (fallback only)
import { Maximize, Minimize } from "lucide-react";

// Fallback for non-YouTube URLs
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

const getYouTubeId = (rawUrl) => {
  if (!rawUrl) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = rawUrl.trim().match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Transparent blocker that swallows clicks/taps/right-clicks
function Mask({ style }) {
  return (
    <div
      aria-hidden="true"
      onContextMenu={(e) => e.preventDefault()}
      className="absolute z-10"
      style={{ pointerEvents: "auto", background: "transparent", ...style }}
    />
  );
}

const getFsElement = () =>
  document.fullscreenElement || document.webkitFullscreenElement || null;

export default function YouTubePlayer({ url, title, onReady, onError }) {
  const wrapperRef = useRef(null);
  const [isNativeFs, setIsNativeFs] = useState(false); // real Fullscreen API
  const [isFakeFs, setIsFakeFs] = useState(false); // CSS fullscreen (iPhone)
  const [isPortrait, setIsPortrait] = useState(false);
  const videoId = getYouTubeId(url);

  const isFullscreen = isNativeFs || isFakeFs;

  // ── Real fullscreen state (wrapper only, never the iframe) ──
  useEffect(() => {
    const onChange = () => {
      const active = getFsElement() === wrapperRef.current;
      setIsNativeFs(active);
      if (!active) {
        try {
          screen.orientation?.unlock?.();
        } catch {}
      }
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  // ── Track device orientation (used to auto-rotate the CSS fullscreen) ──
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const update = () => setIsPortrait(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // ── CSS fullscreen: lock page scroll + Escape to exit ──
  useEffect(() => {
    if (!isFakeFs) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setIsFakeFs(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isFakeFs]);

  const enterFullscreen = async () => {
    const el = wrapperRef.current;
    if (!el) return;

    const request = el.requestFullscreen || el.webkitRequestFullscreen;
    if (request) {
      try {
        await request.call(el);
        // Android / iPad: rotate to landscape while fullscreen (best effort)
        try {
          await screen.orientation?.lock?.("landscape");
        } catch {}
      } catch {
        setIsFakeFs(true);
      }
    } else {
      // iPhone Safari: no Fullscreen API on a div -> CSS fullscreen
      setIsFakeFs(true);
    }
  };

  const exitFullscreen = () => {
    if (isFakeFs) {
      setIsFakeFs(false);
      return;
    }
    (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
  };

  const toggleFullscreen = () =>
    isFullscreen ? exitFullscreen() : enterFullscreen();

  if (!videoId) {
    return (
      <ReactPlayer
        url={url}
        controls={true}
        width="100%"
        height="100%"
        onReady={onReady}
        onError={onError}
      />
    );
  }

  // fs=0 removes YouTube's own fullscreen button so the iframe never goes
  // fullscreen by itself (which would hide our masks).
  const params = new URLSearchParams({
    controls: "1",
    rel: "0",
    modestbranding: "1",
    fs: "0",
    iv_load_policy: "3",
    playsinline: "1",
  });

  // CSS fullscreen layout. If the phone is held upright, rotate the player
  // 90° so the video fills the screen sideways.
  let wrapperStyle;
  if (isFakeFs) {
    wrapperStyle = isPortrait
      ? {
          position: "fixed",
          top: 0,
          left: "100%",
          width: "100dvh",
          height: "100dvw",
          transform: "rotate(90deg)",
          transformOrigin: "top left",
          zIndex: 9999,
        }
      : {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 9999,
        };
  }

  // Mask sizes differ slightly between normal and fullscreen layouts
  // YouTube's controls have a fixed pixel size, so on small (mobile) players
  // a percentage alone is too short. max() keeps a minimum height in px.
  const bottomHeight = isFullscreen ? "max(7.5%, 56px)" : "max(10%, 60px)";

  return (
    <div
      ref={wrapperRef}
      style={wrapperStyle}
      className="group relative w-full h-full bg-black overflow-hidden"
    >
      <iframe
        key={videoId}
        src={`https://www.youtube.com/embed/${videoId}?${params.toString()}`}
        title={title || "Course Video"}
        className="absolute inset-0 w-full h-full border-none"
        // No allow-popups / allow-top-navigation => links can't open or navigate
        sandbox="allow-scripts allow-same-origin allow-presentation"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        onLoad={onReady}
        onError={onError}
      />

      {/* Top-left: channel avatar, title, channel name.
          Stops before the top-right cluster (volume / CC / settings). */}
      <Mask style={{ top: 0, left: 0, width: "78%", height: "12%" }} />

      {/* Bottom-left: share + watch later */}
      <Mask
        style={{
          bottom: 0,
          left: 0,
          width: "max(25%, 150px)",
          height: bottomHeight,
        }}
      />

      {/* Bottom-right: "More videos" + YouTube logo */}
      <Mask
        style={{
          bottom: 0,
          right: 0,
          width: "max(32%, 240px)",
          height: bottomHeight,
        }}
      />

      {/* Custom fullscreen button (targets the wrapper, so masks stay).
          Always slightly visible so touch users can find it. */}
      <button
        type="button"
        onClick={toggleFullscreen}
        title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
        aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
        className="absolute z-20 right-4 p-2.5 rounded-lg bg-gray-800/60 hover:bg-gray-800 text-white backdrop-blur-sm transition-all opacity-70 hover:opacity-100 focus:opacity-100"
        style={{ bottom: "16%" }}
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
    </div>
  );
}