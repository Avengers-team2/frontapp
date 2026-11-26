import LoginGuard from "@/components/common/LoginGuard";
import MyPageShell from "../_component/MyPageShell";
import MyReportList from "../_component/MyReportList";

// 마이페이지 · 기획서 검토 목록
export default function ReportsPage() {
    return (
        <LoginGuard>
            <MyPageShell>
                <MyReportList />
            </MyPageShell>
        </LoginGuard>
    );
}
