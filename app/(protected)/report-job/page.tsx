import ReportJob from "./_components/ReportJob";

type Props = {
    searchParams: Promise<{ resume?: string }>;
};

export default async function ReportJobPage({ searchParams }: Props) {
    const { resume } = await searchParams;
    return <ReportJob resumeJobId={resume ? Number(resume) : null} />;
}