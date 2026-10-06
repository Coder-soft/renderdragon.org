import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface HoverVideoProps {
  src: string;
  poster?: string;
  className?: string;
  /** Frame (in seconds) used as the static thumbnail. */
  thumbnailTime?: number;
  ariaLabel?: string;
}

/**
 * Displays the first frame of a video as a lightweight thumbnail and only
 * decodes/plays it while hovered. Avoids the cost of autoplaying every card.
 */
const HoverVideo: React.FC<HoverVideoProps> = ({
  src,
  poster,
  className,
  thumbnailTime = 0.1,
  ariaLabel,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasError) return;

    if (isHovered) {
      void video.play().catch(() => setHasError(true));
    } else {
      video.pause();
      try {
        video.currentTime = thumbnailTime;
      } catch {
        /* not seekable yet */
      }
    }
  }, [isHovered, hasError, thumbnailTime]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) videoRef.current?.pause();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const markReady = useCallback(() => setIsReady(true), []);

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
      className={cn(
        "w-full h-full object-cover transition-opacity duration-300",
        isReady ? "opacity-100" : "opacity-0",
        className,
      )}
      onLoadedData={markReady}
      onSeeked={markReady}
      onLoadedMetadata={() => {
        const video = videoRef.current;
        if (!video) return;
        try {
          video.currentTime = thumbnailTime;
        } catch {
          /* ignore */
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onError={() => setHasError(true)}
    />
  );
};

export default React.memo(HoverVideo);
