import PostForm from "../_component/PostForm";
import LoginGuard from "@/components/common/LoginGuard";

// 게시글 작성 페이지
export default function page() {
    return (
        <>
            <LoginGuard>
                <PostForm mode="create" />
            </LoginGuard>
        </>
    );
}
