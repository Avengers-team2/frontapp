import SelectedBrandCard from "@/components/analysis/SelectedBrandCard";
import { BrandSearchItem } from "@/api/analysis/analysis.api";
import BrandSearch from "./BrandSearch";
import ChipGroup from "./ChipGroup";
import { FRANCHISE_OPTIONS } from "./analysis.data";

type FranchiseFieldProps = {
    isFranchise: string;
    brand: string;
    brandCategory: string;
    onChangeIsFranchise: (v: string) => void;
    onChangeBrand: (brand: { name: string; category: string }) => void;
};

const FTC_URL = "https://franchise.ftc.go.kr";

export default function FranchiseField({
    isFranchise, brand, brandCategory, onChangeIsFranchise, onChangeBrand,
}: FranchiseFieldProps) {
    const enabled = isFranchise === "예";

    const handleSelect = (b: BrandSearchItem) => {
        onChangeBrand({ name: b.aliasOf ?? b.name, category: b.category });
    };

    return (
        <div>
            <ChipGroup
                options={FRANCHISE_OPTIONS}
                value={isFranchise}
                onChange={(v) => {
                    onChangeIsFranchise(v);
                    if (v !== "예") onChangeBrand({ name: "", category: "" });
                }}
            />

            <div className="mt-8">
                <p className="mb-3 text-[17px] font-semibold text-ink-800">
                    브랜드
                    {!enabled && (
                        <span className="ml-2 text-[15px] font-normal text-ink-300">
                            프랜차이즈 여부를 &lsquo;예&rsquo;로 선택하면 입력할 수 있어요
                        </span>
                    )}
                </p>

                {enabled && brand ? (
                    <SelectedBrandCard
                        brandName={brand}
                        category={`${brandCategory} · 정보공개서 등록 브랜드`}
                        disclosureUrl={FTC_URL}
                        onChange={() => onChangeBrand({ name: "", category: "" })}
                    />
                ) : (
                    <BrandSearch disabled={!enabled} onSelect={handleSelect} />
                )}

                <p className="mt-3 text-[15px] text-ink-300">
                    브랜드 목록: 공정거래위원회 가맹사업거래 정보공개서 (franchise.ftc.go.kr)
                </p>
            </div>
        </div>
    );
}
