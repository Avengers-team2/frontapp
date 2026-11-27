import LoginGuard from "@/components/common/LoginGuard";
import MyPageOverview from "./_component/MyPageOverview";
import MyPageShell from "./_component/MyPageShell";

// 마이페이지 · 내 정보 (처음 들어오면 보이는 화면: 각 목록 미리보기 + 더보기)
export default function MyPage() {
    return (
        <LoginGuard>
            <MyPageShell>
                <MyPageOverview />
            </MyPageShell>
        </LoginGuard>
    );
}
