import LoginGuard from "@/components/common/LoginGuard";
import MyBookmarkList from "../_component/MyBookmarkList";
import MyPageShell from "../_component/MyPageShell";

// 마이페이지 · 관심 지원사업 (지원사업 북마크)
export default function BookmarksPage() {
    return (
        <LoginGuard>
            <MyPageShell>
                <MyBookmarkList />
            </MyPageShell>
        </LoginGuard>
    );
}
