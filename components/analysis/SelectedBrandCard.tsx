type SelectedBrandCardProps = {
    brandName: string;
    category: string;
    disclosureUrl?: string;
    onChange?: () => void;
};

export default function SelectedBrandCard({
    brandName,
    category,
    disclosureUrl,
    onChange,
}: SelectedBrandCardProps) {
    return (
        <section className="w-full rounded-2xl bg-sub-50 px-[30px] py-[30px] font-ibm">
        <p className="text-[18px] font-semibold text-sub-700">
            선택한 브랜드
        </p>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-[26px] font-bold text-ink-900">
                {brandName}
            </h2>
        <div className="flex flex-wrap items-center gap-6">
            {disclosureUrl && (
            <a
                href={disclosureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[19px] font-semibold text-sub-700 hover:underline"
            >
                정보공개서 보기 ↗
            </a>
            )}

            {onChange && (
            <button
                type="button"
                onClick={onChange}
                className="text-[19px] font-semibold text-ink-800 underline"
            >
                변경
            </button>
            )}
            </div>
        </div>

        <p className="mt-1 text-[18px] text-ink-400">
            {category}
        </p>
    </section>
    );
}
