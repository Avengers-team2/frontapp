import MyPageShell from "../_component/MyPageShell";
import MyPostList from "../_component/MyPostList";

// 마이페이지 · 내가 쓴 글
export default function MyPostsPage() {
    return (
        <MyPageShell>
            <MyPostList />
        </MyPageShell>
    );
}
