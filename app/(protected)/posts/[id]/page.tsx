import { Suspense } from "react";
import PostDetailContainer from "../_component/PostDetailContainer";
import Loading from "@/components/common/Loading";

interface Params {
    params: Promise<{id: string}>
}

// 게시글 상세 페이지
// params는 여기서 await 하지 않고 Suspense 안쪽 컴포넌트로 넘긴다 (cacheComponents Blocking Route 방지)
export default function page({params}: Params) {
    return (
        <Suspense fallback={<Loading />}>
            <PostDetailContainer params={params} />
        </Suspense>
    );
}
