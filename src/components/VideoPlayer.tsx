
import React, { useEffect, useRef, useState } from 'react';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    autoplay?: boolean;
    controls?: boolean;
    className?: string;
}
type VideoPlayerInstance = ReturnType<typeof import('video.js').default>;

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    src,
    poster,
    autoplay = false,
    controls = true,
    className = ""
}) => {
    const videoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<VideoPlayerInstance | null>(null);
    const [loadError, setLoadError] = useState(false);
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        let activePlayer: VideoPlayerInstance | null = null;
        const videoElement = document.createElement("video-js");
        setLoadError(false);

        videoElement.classList.add('vjs-big-play-centered');
        videoElement.classList.add('vjs-custom-skin');
        if (className) {
            className.split(' ').forEach(cls => videoElement.classList.add(cls));
        }

        const initializePlayer = async () => {
            if (!videoRef.current || cancelled) return;
            videoRef.current.appendChild(videoElement);

            try {
            const { default: videojs } = await import('video.js');
            if (cancelled) return;
            const player = videojs(videoElement, {
                autoplay,
                controls,
                responsive: true,
                fluid: true,
                sources: [{ src }],
                poster
            }, () => {
                // Player is ready
            });
            if (cancelled) {
                player.dispose();
                return;
            }
            activePlayer = player;
            playerRef.current = player;

            player.on('error', () => {
                const error = player.error();
                console.warn('VideoJS Error:', error);
            });
            } catch (error) {
                if (!cancelled) {
                    console.error('Failed to load Video.js:', error);
                    setLoadError(true);
                }
            }
        };
        initializePlayer();

        return () => {
            cancelled = true;
            if (activePlayer && !activePlayer.isDisposed()) {
                activePlayer.dispose();
            }
            if (playerRef.current === activePlayer) {
                playerRef.current = null;
            }
            videoElement.remove();
        }
    }, [src, poster, autoplay, controls, className, retryKey]);

    return (
        <div data-vjs-player className="rounded-md overflow-hidden">
            <div ref={videoRef} />
            {loadError && <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground"><span>Video preview unavailable.</span><button type="button" className="underline" onClick={() => setRetryKey((key) => key + 1)}>Retry</button></div>}
        </div>
    );
};

export default VideoPlayer;
