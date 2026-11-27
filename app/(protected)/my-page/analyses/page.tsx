import LoginGuard from "@/components/common/LoginGuard";
import MyAnalysisList from "../_component/MyAnalysisList";
import MyPageShell from "../_component/MyPageShell";

// 마이페이지 · 내 분석 (저장한 분석 전체 목록)
export default function MyAnalysesPage() {
    return (
        <LoginGuard>
            <MyPageShell>
                <MyAnalysisList />
            </MyPageShell>
        </LoginGuard>
    );
}
