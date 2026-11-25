"use client"

import { getMyPostsApi } from "@/api/post/post.api";
import useAuthStore from "@/stores/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getMyAnalysesApi } from "../_lib/myAnalysis.api";
import { getMySupportBookmarksApi, MY_SUPPORT_BOOKMARKS_QUERY_KEY } from "../_lib/myBookmark.api";
import { BUSINESS_STATUS_OPTIONS } from "./mockData";

// 프로필 + 숫자 요약 (저장한 분석 / 관심 지원사업 / 내가 쓴 글)
export default function MyPageProfile() {
    const user = useAuthStore((state) => state.user);

    // 로그인 정보 (값이 없으면 빈 글자 / "미설정")
    const nickname = user?.user_nickname || "";
    const email = user?.user_email || "";
    // DB에는 코드값(PREPARING 등)으로 저장돼 있어서 화면용 한글로 바꿈
    const businessStatus = BUSINESS_STATUS_OPTIONS.find((s) => s.value === user?.user_business_status)?.label ?? "";
    const region = user?.user_interest_region || "미설정";
    const industry = user?.user_interest_industry || "미설정";

    // 내가 쓴 글 개수: 목록 1개만 요청해서 total_count만 사용 (GET /post/me)
    const { data: myPosts } = useQuery({
        queryKey: ["myPostsCount"],
        queryFn: () => getMyPostsApi(1, 1),
    });
    const myPostCount = myPosts?.data?.total_count ?? 0;

    // 저장한 분석 개수 (GET /analyses/me, 최근 10개까지만 와서 10이면 "10+")
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

    // 숫자를 누르면 해당 목록으로 이동
    const stats = [
        { label: "저장한 분석", value: analysisCount >= 10 ? "10+" : analysisCount, href: "/my-page" },
        { label: "관심 지원사업", value: bookmarkCount, href: "/my-page/bookmarks" },
        { label: "내가 쓴 글", value: myPostCount, href: "/my-page/posts" },
    ];

    return (
        <section className="mt-11.75 flex items-center justify-between">
            <div className="flex items-start gap-8">
                <div className="flex size-19.25 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-sub to-main-dark text-[34px] font-bold leading-none text-white">
                    {nickname.slice(0, 1) || "?"}
                </div>
                <div>
                    <div className="flex items-center gap-3">
                        <p className="text-[34px] font-bold leading-[1.3] text-ink-900">{nickname}</p>
                        <span className="bg-[#DDF9F4] px-3 py-0.5 text-[17px] font-semibold leading-normal text-sub-700">{businessStatus}</span>
                    </div>
                    <p className="mt-6 whitespace-pre text-[19px] leading-[1.6] text-ink-400">
                        {`${email}  ·  관심 지역 ${region}  ·  ${industry}`}
                    </p>
                </div>
            </div>

            <div className="flex items-center">
                {stats.map((stat, i) => (
                    <div key={stat.label} className="flex items-center">
                        {i > 0 && <span className="h-16.75 w-px bg-line-gray" />}
                        <Link href={stat.href} className="flex flex-col items-center px-13">
                            <p className="font-outfit text-5xl font-semibold leading-none text-ink-900">{stat.value}</p>
                            <p className="mt-9 text-lg leading-[1.6] text-ink-400">{stat.label}</p>
                        </Link>
                    </div>
                ))}
                <Link
                    href="/my-page/edit"
                    className="ml-4 flex h-13 items-center rounded-full border border-line bg-white px-6 text-[19px] font-semibold text-ink-700 shadow-[0px_4px_14px_0px_rgba(11,27,51,0.05)]"
                >
                    정보 수정
                </Link>
            </div>
        </section>
    );
}
