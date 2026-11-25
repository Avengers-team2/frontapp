import ReportExport from "./ReportExport";

type Props = {
    searchParams: Promise<{ job?: string; status?: string }>;
};

export default async function ReportResultPage({ searchParams }: Props) {
    const { job, status } = await searchParams;
    return <ReportExport jobId={job ? Number(job) : null} failed={status === "failed"} />;
}