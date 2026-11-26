"use client"

import Loading from "@/components/common/Loading";
import useAuthStore from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface LoginGuardProps {
    children: ReactNode;
}

// 로그인한 회원만 보는 화면용 (마이페이지, 게시판 글쓰기·수정)
// 로그인 안 한 상태로 들어오면(주소를 직접 쳐도) 로그인 화면으로 보냄
export default function LoginGuard({children}: LoginGuardProps) {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoggedIn = isAuthenticated && user !== null;

    // 로그인 정보는 브라우저 저장소에서 불러오므로, 다 불러온 뒤에 판단해야 새로고침 때 잘못 튕기지 않음
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        if (useAuthStore.persist.hasHydrated()) setHydrated(true);
        const unsubscribe = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (hydrated && !isLoggedIn) router.replace("/login");
    }, [hydrated, isLoggedIn, router]);

    if (!hydrated || !isLoggedIn) return <Loading />;

    return <>{children}</>;
}
