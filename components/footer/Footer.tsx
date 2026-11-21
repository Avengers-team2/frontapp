import Link from "next/link";

const COLUMNS = [
    {
        title: "서비스",
        items: [
            { label: "분석도구", href: "/analysis" },
            { label: "지원사업", href: "/support" },
            { label: "기획서 AI 분석", href: "/report-job" },
            { label: "게시판", href: "/posts" },
        ],
    },
    {
        title: "데이터 출처",
        items: [{ label: "소상공인시장진흥공단" }, { label: "서울시 상권분석서비스" }, { label: "한국부동산원" }],
    },
    {
        title: "안내",
        items: [{ label: "데이터 기준일 2026.10" }],
    },
];

export default function Footer() {
    return (
        <footer className="bg-linear-to-b from-navy-800 to-navy-950">
            <div className="mx-auto max-w-[1440px] px-6 pt-20 pb-10">
                <div className="flex justify-between border-b border-white/10 pb-12">
                    <div>
                        <p className="font-outfit text-[28px] font-bold text-white">StartFit</p>
                        <p className="mt-3 text-[16px] text-mist-300">창업, 데이터로 먼저 확인하세요.</p>
                    </div>

                    <div className="flex gap-24">
                        {COLUMNS.map((col) => (
                            <div key={col.title} className="min-w-[140px]">
                                <p className="text-[14px] font-bold text-mint">{col.title}</p>
                                <ul className="mt-5 flex flex-col gap-3">
                                    {col.items.map((item) => (
                                        <li key={item.label} className="text-[16px] text-mist-300">
                                            {"href" in item && item.href ? (
                                                <Link href={item.href} className="hover:text-white">
                                                    {item.label}
                                                </Link>
                                            ) : (
                                                item.label
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <p
                    aria-hidden
                    className="select-none border-b border-white/10 py-10 font-outfit text-[180px] font-extrabold leading-none"
                >
                    <span className="text-ink-700">Start </span>
                    <span className="text-[#174650]">Fit</span>
                </p>

                <p className="pt-6 text-[14px] text-mist-500">© 2026 StartFit</p>
            </div>
        </footer>
    );
}
