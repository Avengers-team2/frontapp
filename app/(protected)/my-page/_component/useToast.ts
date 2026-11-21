import { useEffect, useRef, useState } from "react";

// 알림 문구를 잠깐(2초) 보여주는 훅
export default function useToast(duration = 2000) {
    const [message, setMessage] = useState<string | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = (next: string) => {
        if (timer.current) clearTimeout(timer.current);
        setMessage(next);
        timer.current = setTimeout(() => setMessage(null), duration);
    }

    // 화면을 떠날 때 타이머 정리
    useEffect(() => () => {
        if (timer.current) clearTimeout(timer.current);
    }, []);

    return { message, showToast };
}
