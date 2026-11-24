import ReportExport from "./ReportExport";

type Props = {
    searchParams: Promise<{ job?: string }>;
};

export default async function ReportResultPage({ searchParams }: Props) {
    const { job } = await searchParams;
    return <ReportExport jobId={job ? Number(job) : null} />;
}