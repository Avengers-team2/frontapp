import { Suspense } from "react";
import JoinSignUp from "./_component/page";

export default function Page() {
    return (
        <>
            {/* JoinSignUp 이 useSearchParams 를 쓰므로 Suspense 로 감싼다 */}
            <Suspense>
                <JoinSignUp />
            </Suspense>
        </>
    );
}
