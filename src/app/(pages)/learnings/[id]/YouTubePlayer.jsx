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

export default function YouTubePlayer({ url, title, onReady, onError }) {
  const wrapperRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoId = getYouTubeId(url);

  // Track fullscreen state of OUR wrapper (not the iframe)
  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(document.fullscreenElement === wrapperRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    const el = wrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch((err) =>
        console.error(`Fullscreen error: ${err.message}`),
      );
    } else {
      document.exitFullscreen();
    }
  };

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

  // Mask sizes differ slightly between normal and fullscreen layouts
  const bottomHeight = isFullscreen ? "7.5%" : "10%";

  return (
    <div
      ref={wrapperRef}
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
        style={{ bottom: 0, left: 0, width: "25%", height: bottomHeight }}
      />

      {/* Bottom-right: "More videos" + YouTube logo */}
      <Mask
        style={{ bottom: 0, right: 0, width: "32%", height: bottomHeight }}
      />

      {/* Custom fullscreen button (targets the wrapper, so masks stay) */}
      <button
        type="button"
        onClick={toggleFullscreen}
        title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
        className="absolute z-20 right-4 p-2.5 rounded-lg bg-gray-800/60 hover:bg-gray-800 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
        style={{ bottom: "16%" }}
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
    </div>
  );
}