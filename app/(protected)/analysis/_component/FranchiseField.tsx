import "@/keyframes/form-motion.keyframe.css";
import SelectedBrandCard from "@/components/analysis/SelectedBrandCard";
import { BrandSearchItem } from "@/api/analysis/analysis.api";
import { FieldMessage } from "@/components/form/FormMotion";
import BrandSearch from "./BrandSearch";
import ChipGroup from "./ChipGroup";
import { FRANCHISE_OPTIONS } from "./analysis.data";

type FranchiseFieldProps = {
    isFranchise: string;
    brand: string;
    brandCategory: string;
    onChangeIsFranchise: (v: string) => void;
    onChangeBrand: (brand: { name: string; category: string }) => void;
    // 빈 칸 표시 (흔들림·빨간 테두리·안내 문구)
    fieldId: (name: string) => string;
    shake: (name: "franchise" | "brand") => string;
    errorOf: (name: "franchise" | "brand") => boolean;
    messageOf: (name: "franchise" | "brand") => string | null | undefined;
};

const FTC_URL = "https://franchise.ftc.go.kr";

export default function FranchiseField({
    isFranchise, brand, brandCategory, onChangeIsFranchise, onChangeBrand, fieldId, shake, errorOf, messageOf,
}: FranchiseFieldProps) {
    const enabled = isFranchise === "예";

    const handleSelect = (b: BrandSearchItem) => {
        onChangeBrand({ name: b.aliasOf ?? b.name, category: b.category });
    };

    return (
        <div>
            <div id={fieldId("franchise")} className={shake("franchise")}>
                <ChipGroup
                    options={FRANCHISE_OPTIONS}
                    value={isFranchise}
                    invalid={errorOf("franchise")}
                    onChange={(v) => {
                        onChangeIsFranchise(v);
                        if (v !== "예") onChangeBrand({ name: "", category: "" });
                    }}
                />
            </div>
            <FieldMessage message={messageOf("franchise")} />

            <div id={fieldId("brand")} className="mt-8">
                <p className="mb-3 text-[17px] font-semibold text-ink-800">
                    브랜드
                    {!enabled && (
                        <span className="ml-2 text-[15px] font-normal text-ink-300">
                            프랜차이즈 여부를 &lsquo;예&rsquo;로 선택하면 입력할 수 있습니다
                        </span>
                    )}
                </p>

                {enabled && brand ? (
                    // 브랜드를 고르면 선택 카드가 왼쪽에서 미끄러져 채워진다
                    <div
                        key={brand}
                        className="animate-[form-slide-in_0.45s_cubic-bezier(0.3,1.3,0.5,1)_backwards] motion-reduce:animate-none"
                    >
                        <SelectedBrandCard
                            brandName={brand}
                            category={`${brandCategory} · 정보공개서 등록 브랜드`}
                            disclosureUrl={FTC_URL}
                            onChange={() => onChangeBrand({ name: "", category: "" })}
                        />
                    </div>
                ) : (
                    <div className={shake("brand")}>
                        <BrandSearch disabled={!enabled} invalid={errorOf("brand")} onSelect={handleSelect} />
                    </div>
                )}

                <FieldMessage message={messageOf("brand")} />

                <p className="mt-3 text-[15px] text-ink-300">
                    브랜드 목록: 공정거래위원회 가맹사업거래 정보공개서 (franchise.ftc.go.kr)
                </p>
            </div>
        </div>
    );
}
