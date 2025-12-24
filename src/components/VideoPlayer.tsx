
import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    autoplay?: boolean;
    controls?: boolean;
    className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    src,
    poster,
    autoplay = false,
    controls = true,
    className = ""
}) => {
    const videoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);

    useEffect(() => {
        // Make sure Video.js player is only initialized once
        if (!playerRef.current) {
            const videoElement = document.createElement("video-js");

            videoElement.classList.add('vjs-big-play-centered');
            videoElement.classList.add('vjs-custom-skin');
            if (className) {
                className.split(' ').forEach(cls => videoElement.classList.add(cls));
            }

            if (videoRef.current) {
                videoRef.current.appendChild(videoElement);
            }

            const player = playerRef.current = videojs(videoElement, {
                autoplay,
                controls,
                responsive: true,
                fluid: true,
                sources: [{ src }],
                poster
            }, () => {
                // Player is ready
            });

            player.on('error', () => {
                const error = player.error();
                console.warn('VideoJS Error:', error);
            });

        } else {
            // Update src if it changes
            const player = playerRef.current;
            player.src({ src });
            if (poster) player.poster(poster);
        }
    }, [src, poster, autoplay, controls, className]);

    // Dispose the player on unmount
    useEffect(() => {
        const player = playerRef.current;

        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, [playerRef]);

    return (
        <div data-vjs-player className="rounded-md overflow-hidden">
            <div ref={videoRef} />
        </div>
    );
};

export default VideoPlayer;
