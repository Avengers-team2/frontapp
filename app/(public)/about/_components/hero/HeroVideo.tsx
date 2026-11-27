"use client"

import { useEffect, useRef } from "react";

const PLAYBACK_RATE = 0.6; // 1 = 원래 속도, 작을수록 느리게

export default function HeroVideo() {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = ref.current;
        if (!video) return;

        // 영상을 불러올 때마다 속도가 초기화되므로 다시 설정
        const applyRate = () => {
            video.defaultPlaybackRate = PLAYBACK_RATE;
            video.playbackRate = PLAYBACK_RATE;
        };
        applyRate();
        video.addEventListener("loadedmetadata", applyRate);
        return () => video.removeEventListener("loadedmetadata", applyRate);
    }, []);

    return (
        <video
            ref={ref}
            className="absolute inset-0 w-full h-full object-cover"
            src="/assets/videos/about/about01-pingpong.mp4"
            poster="/assets/images/about/hero-street.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
        />
    );
}