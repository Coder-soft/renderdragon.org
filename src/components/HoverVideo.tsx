import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface HoverVideoProps {
  src: string;
  poster?: string;
  className?: string;
  /** Frame (in seconds) used as the static thumbnail. */
  thumbnailTime?: number;
  ariaLabel?: string;
  /** Play when the video receives keyboard focus (adds it to the tab order). */
  focusable?: boolean;
  /** Allow touch users to toggle playback by tapping the preview. */
  tapToPlay?: boolean;
}

/**
 * Displays the first frame of a video as a lightweight thumbnail
 * (`preload="metadata"` + a `#t=` fragment) and only decodes/plays it while
 * hovered, focused, or tapped. Avoids autoplaying every card at once.
 */
const HoverVideo: React.FC<HoverVideoProps> = ({
  src,
  poster,
  className,
  thumbnailTime = 0.1,
  ariaLabel,
  focusable = false,
  tapToPlay = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  const seekToThumbnail = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    try {
      video.currentTime = thumbnailTime;
    } catch {
      /* not seekable yet */
    }
  }, [thumbnailTime]);

  // Reset transient state when the source changes (memoized component reuses state).
  useEffect(() => {
    setIsActive(false);
    setIsReady(false);
    setHasError(false);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasError) return;

    if (isActive) {
      void video.play().catch((err: DOMException) => {
        // A pending play() rejects with AbortError when interrupted by pause()
        // (e.g. a quick hover in/out). That is not a real failure.
        if (err.name !== "AbortError") setHasError(true);
      });
    } else {
      video.pause();
      seekToThumbnail();
    }
  }, [isActive, hasError, seekToThumbnail]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) videoRef.current?.pause();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  if (hasError) return null;

  return (
    <video
      ref={videoRef}
      src={`${src}#t=${thumbnailTime}`}
      poster={poster}
      preload="metadata"
      loop
      muted
      playsInline
      aria-label={ariaLabel}
      tabIndex={focusable ? 0 : undefined}
      className={cn(
        "w-full h-full object-cover transition-opacity duration-300",
        isReady ? "opacity-100" : "opacity-0",
        className,
      )}
      onLoadedData={() => setIsReady(true)}
      onSeeked={() => setIsReady(true)}
      onLoadedMetadata={seekToThumbnail}
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") setIsActive(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "touch") setIsActive(false);
      }}
      onPointerDown={(e) => {
        if (tapToPlay && e.pointerType === "touch") {
          e.stopPropagation();
          setIsActive((active) => !active);
        }
      }}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
      onError={() => setHasError(true)}
    />
  );
};

export default React.memo(HoverVideo);
