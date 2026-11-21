"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/common/Header";
import HeaderWhite from "@/components/common/HeaderWhite";

// 메인(/)은 검정 헤더, 그 외 서브페이지는 흰색 헤더를 보여줍니다.
export default function HeaderSwitch() {
    const pathname = usePathname();

    return pathname === "/" ? <Header /> : <HeaderWhite />;
}
