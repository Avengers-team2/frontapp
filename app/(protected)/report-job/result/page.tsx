import { Suspense } from "react";
import ReportExport from "./ReportExport";

type SearchParams = Promise<{ job?: string; status?: string }>;

// 주소 값을 읽는 부분만 따로 분리
async function ResultContent({ searchParams }: { searchParams: SearchParams }) {
    const { job, status } = await searchParams;
    return <ReportExport jobId={job ? Number(job) : null} failed={status === "failed"} />;
}

export default function ReportResultPage({ searchParams }: { searchParams: SearchParams }) {
    return (
        <Suspense fallback={null}>
            <ResultContent searchParams={searchParams} />
        </Suspense>
    );
}