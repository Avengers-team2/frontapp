import { NextRequest, NextResponse } from "next/server";

// 로그인해야 들어갈 수 있는 경로 = app/(protected) 안의 페이지들
const PROTECTED = ["/my-page", "/analysis", "/report-job", "/posts/write"];
const isProtected = (pathname: string) =>
    PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    /^\/posts\/[^/]+\/edit$/.test(pathname); // 글 수정

// 로그인한 사람은 못 들어가는 경로
const GUEST_ONLY = ["/login", "/join", "/find-account"];

// SSR: cookie 접근 가능 / CSR: HttpOnly 쿠키라 접근 불가 → 여기서 체크
export function proxy(request: NextRequest) {
    const refreshToken = request.cookies.get("refresh_token");
    const { pathname } = request.nextUrl;

    if (!refreshToken && isProtected(pathname)) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (refreshToken && GUEST_ONLY.some((p) => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/login", "/join", "/find-account",
        "/my-page/:path*", "/analysis/:path*", "/report-job/:path*",
        "/posts/write", "/posts/:postId/edit",
    ],
};
