import { Suspense } from "react";
import PostForm from "../../_component/PostForm";
import Loading from "@/components/common/Loading";
import LoginGuard from "@/components/common/LoginGuard";

interface Params {
    params: Promise<{id: string}>
}

// 게시글 수정 페이지 (글쓰기 폼 재사용)
export default function page({params}: Params) {
    return (
        <Suspense fallback={<Loading />}>
            <LoginGuard>
                <PostForm mode="edit" params={params} />
            </LoginGuard>
        </Suspense>
    );
}
