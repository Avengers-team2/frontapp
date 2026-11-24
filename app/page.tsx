"use client"

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EffectFade, Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";


import 'swiper/css';
import 'swiper/css/effect-fade';



const slideData = [
    { 
        id: 1, 
        video: "/assets/videos/intro/main01.mp4",
        badge: "LOCATION ANALYSIS · DATA INSIGHT", 
        title1: '이곳에서,',
        title2: '시작해도 괜찮을까요?',
        sub: "유동인구부터 경쟁업체, 임대료까지. 창업 전 필요한 상권 정보를 한눈에 확인하세요."
    },
    { 
        id: 2, 
        video: "/assets/videos/intro/main02.mp4",
        badge: "STABILITY FIRST", 
        title1: '잘 팔리는 곳보다',
        title2: '오래 버틸 곳',
        sub: "매출 가능성부터 폐업 위험까지, 창업의 지속 가능성을 살펴보세요."
    },
    { 
        id: 3, 
        video: "/assets/videos/intro/main03.mp4",
        badge: "SEOUL · 25 DISTRICTS · PUBLIC DATA", 
        title1: '창업',
        title2: '데이터로 먼저',
        sub: "데이터 기반 상권 분석으로 더 나은 창업을 준비하세요."
    },
];
// 활성 슬라이드의 영상을 처음부터 재생
const playActiveVideo = (swiper: SwiperType) => {
    const video = swiper.slides[swiper.activeIndex]?.querySelector("video");
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => {});
};

// 비활성 슬라이드의 영상은 정지
const pauseInactiveVideos = (swiper: SwiperType) => {
    swiper.slides.forEach((slide, i) => {
        if (i !== swiper.activeIndex) slide.querySelector("video")?.pause();
    });
};

export default function Slide() {
    const router = useRouter();
    const swiperRef = useRef<SwiperType | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;
    return (
        <div className="h-screen overflow-hidden">
            <div className="h-full">
                <Swiper
                    onSwiper={(swiper) => (swiperRef.current = swiper)}
                    onInit={(swiper) => {
                        pauseInactiveVideos(swiper);
                        playActiveVideo(swiper);
                    }}
                    onSlideChangeTransitionStart={(swiper) => playActiveVideo(swiper)}
                    onSlideChangeTransitionEnd={(swiper) => pauseInactiveVideos(swiper)}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                    }}
                    loop={true}
                    spaceBetween={30}
                    effect={'fade'}
                    navigation={false}
                    pagination={false}
                    modules={[EffectFade, Navigation, Pagination, Autoplay]}
                    className="mySwiper h-full"
                    allowTouchMove={false}

                >
                    {slideData.map((slide) => (
                        <SwiperSlide key={slide.id}>
                            <video muted loop playsInline preload="auto" className="absolute inset-0 w-full h-full object-cover">
                                <source src={slide.video} type="video/mp4" />
                            </video>

                            <div className="absolute inset-0 z-10 flex items-center justify-center px-[5%]">
                                <div className="w-full max-w-[1440px] flex flex-col gap-5">
                                    <p className="text-[12px] text-[#7FE9DA]">{slide.badge}</p>
                                    <div className="text-[#fff] text-[72px] font-extrabold  leading-[1.2]">
                                        <div>{slide.title1}</div>
                                        <div className="text-[#5EF0DC]">{slide.title2}</div>
                                    </div>
                                    <p className="text-[#C9D3E1] font-regular">{slide.sub}</p>

                                    <div className="flex items-stretch border-1 border-white/14 rounded-[14px] bg-[#0A1424]/55 px-2 py-2 h-[64px] w-[560px]">
                                        <input type="text" className="text-[#8FA3BC] w-full px-2 py-1 outline-none" placeholder="분석할 주소를 입력하세요"/>
                                        <button
                                            type="button"
                                            onClick={() => router.push("/analysis")}
                                            className="flex justify-center items-center bg-[#ffc875] rounded-[12px] font-bold w-[140px] h-[full] text-[16px] text-[#1a1206] cursor-pointer transition-colors duration-300 hover:bg-[#ffb547] active:scale-[0.97] ml-4"
                                        >체크시작</button>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
}
