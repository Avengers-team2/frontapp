import { Suspense } from "react";
import ReportJob from "./_components/ReportJob";

type SearchParams = Promise<{ resume?: string }>;

// 주소 값을 읽는 부분만 따로 분리
async function ReportJobContent({ searchParams }: { searchParams: SearchParams }) {
    const { resume } = await searchParams;
    return <ReportJob resumeJobId={resume ? Number(resume) : null} />;
}

export default function ReportJobPage({ searchParams }: { searchParams: SearchParams }) {
    return (
        <Suspense fallback={null}>
            <ReportJobContent searchParams={searchParams} />
        </Suspense>
    );
}