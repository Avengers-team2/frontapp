import MyAnalysisList from "./_component/MyAnalysisList";
import MyPageShell from "./_component/MyPageShell";

// 마이페이지 · 내 분석
export default function MyPage() {
    return (
        <MyPageShell>
            <MyAnalysisList />
        </MyPageShell>
    );
}
