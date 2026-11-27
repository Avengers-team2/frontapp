"use client"

import { logoutApi } from "@/api/auth/auth.api";
import useAuthStore from "@/stores/useAuthStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getMyAnalysesApi } from "../../_lib/myAnalysis.api";
import { getMySupportBookmarksApi, MY_SUPPORT_BOOKMARKS_QUERY_KEY } from "../../_lib/myBookmark.api";
import { withdrawApi } from "../_lib/profile.api";

interface WithdrawModalProps {
    onClose: () => void;
}

// 회원 탈퇴 팝업 (비밀번호 확인 + 안내 확인 체크해야 탈퇴하기 활성화)
export default function WithdrawModal({onClose}: WithdrawModalProps) {
    const [password, setPassword] = useState("");
    const [agreed, setAgreed] = useState(false);
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

    // 저장한 분석 개수 (GET /analyses/me, 최근 10개까지만 와서 10이면 "10건 이상")
    const { data: myAnalyses } = useQuery({
        queryKey: ["myAnalyses"],
        queryFn: getMyAnalysesApi,
    });
    const analysisCount = myAnalyses?.data?.length ?? 0;

    // 관심 지원사업 개수 (GET /bookmarks/support/me)
    const { data: myBookmarks } = useQuery({
        queryKey: [MY_SUPPORT_BOOKMARKS_QUERY_KEY, ""],
        queryFn: () => getMySupportBookmarksApi(""),
        staleTime: 0, // 들어올 때마다 새로 불러오기
    });
    const bookmarkCount = myBookmarks?.data?.length ?? 0;

    // 탈퇴 (DELETE /users/{user_id}) → 로그아웃 처리 후 메인으로
    // TODO: 백엔드가 비밀번호를 확인하지 않음 → 확인 기능이 생기면 password도 같이 보내기
    const withdrawMutation = useMutation({
        mutationFn: () => withdrawApi(user!.user_id),
        onSuccess: async () => {
            try {
                await logoutApi(); // 쿠키(토큰) 정리, 실패해도 탈퇴는 끝난 상태라 무시
            } catch {}
            setUser(null);
            setIsAuthenticated(false);
            window.alert("탈퇴가 완료됐어요. 그동안 이용해 주셔서 감사합니다.");
            router.replace("/");
        },
        onError: (error) => window.alert(error.message),
    });

    const canWithdraw = password.length > 0 && agreed && !withdrawMutation.isPending;

    const removedItems = [
        `저장한 분석 결과 ${analysisCount >= 10 ? "10건 이상" : `${analysisCount}건`}`,
        `관심 지원사업 ${bookmarkCount}건 · 마감 알림`,
        "회원정보 (닉네임 · 사업자 상태)",
    ];

    const handleWithdrawClick = () => {
        if (!user) {
            window.alert("로그인 정보가 없어요. 다시 로그인해 주세요.");
            return;
        }
        withdrawMutation.mutate();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50" onClick={onClose}>
            <div className="w-156 bg-white p-12" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-[34px] font-bold leading-[1.4] text-ink-900">사장님 어디가세요?</h2>
                <p className="mt-3.5 text-[19px] leading-[1.6] text-ink-800">
                    탈퇴하면 아래 정보가 모두 지워지고 되돌릴 수 없어요. 작성한 게시글과 댓글은 ‘탈퇴한 회원’으로 남아요.
                </p>

                <div className="mt-9.75 h-[1.2px] bg-line-gray" />
                <ul className="flex flex-col gap-4.75 py-5">
                    {removedItems.map((item) => (
                        <li key={item} className="flex items-center gap-4 text-[19px] leading-[1.6]">
                            <span className="font-semibold text-danger">—</span>
                            <span className="text-ink-900">{item}</span>
                        </li>
                    ))}
                </ul>
                <div className="h-[1.2px] bg-line-gray" />

                <label className="mt-8 block">
                    <p className="text-xl font-semibold leading-normal text-ink-900">비밀번호 확인</p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-4 h-15.25 w-full rounded-xl border-[1.2px] border-line-strong bg-white px-4.75 text-[22px] text-ink-900 focus:border-sub focus:outline-none"
                    />
                </label>

                <label className="mt-7 flex cursor-pointer items-center gap-1">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="sr-only" />
                    {agreed ? (
                        <span className="flex h-6.25 w-7.25 items-center justify-center rounded-md bg-main-dark text-[17px] font-bold text-white">✓</span>
                    ) : (
                        <span className="h-6.25 w-7.25 rounded-md border-[1.5px] border-[#C9D2DC] bg-white" />
                    )}
                    <span className="ml-1 text-xl leading-[1.6] text-ink-900">안내 내용을 확인했어요</span>
                </label>

                <div className="mt-14 flex justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-13 items-center rounded-full border border-line bg-white px-7.5 text-xl font-semibold text-ink-700 shadow-[0px_4px_14px_0px_rgba(11,27,51,0.05)]"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={handleWithdrawClick}
                        disabled={!canWithdraw}
                        className="flex h-13 items-center rounded-full border border-danger bg-white px-7.5 text-xl font-bold text-danger shadow-[0px_6px_16px_0px_rgba(229,72,77,0.25)] transition-colors enabled:hover:bg-danger enabled:hover:text-white disabled:opacity-40"
                    >
                        탈퇴하기
                    </button>
                </div>
            </div>
        </div>
    );
}
