"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

const KAKAO_SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`;

export default function KakaoMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const drawMap = () => {
      window.kakao.maps.load(() => {
        if (!containerRef.current) return;
        new window.kakao.maps.Map(containerRef.current, {
          center: new window.kakao.maps.LatLng(37.5244, 127.0236),
          level: 3,
        });
      });
    };

    if (window.kakao?.maps) {
      drawMap();
      return;
    }
    const script = document.createElement("script");
    script.src = KAKAO_SDK_URL;
    script.onload = drawMap;
    document.head.appendChild(script);
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-[0]" />;
}