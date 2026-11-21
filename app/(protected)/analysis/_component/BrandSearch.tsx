"use client";

import { BrandSearchItem, searchBrands } from "@/api/analysis/analysis.api";
import HighlightText from "./HighlightText";
import SearchSelect from "./SearchSelect";

type BrandSearchProps = {
    disabled: boolean;
    onSelect: (brand: BrandSearchItem) => void;
};

export default function BrandSearch({ disabled, onSelect }: BrandSearchProps) {
    return (
        <SearchSelect<BrandSearchItem>
            key={disabled ? "disabled" : "enabled"}
            disabled={disabled}
            placeholder="브랜드명으로 검색"
            search={searchBrands}
            getKey={(b) => b.id}
            onSelect={onSelect}
            renderItem={(b, keyword) => (
                <div className="flex items-center justify-between text-[17px]">
                    <span className="text-ink-600">
                        <HighlightText text={b.name} keyword={keyword} />
                        {b.aliasOf && <span className="ml-1 text-ink-400">(동일 브랜드 다른 표기)</span>}
                    </span>
                    {b.aliasOf ? (
                        <span className="text-[15px] font-semibold text-warning">확인 필요</span>
                    ) : (
                        <span className="text-[15px] text-ink-300">{b.category}</span>
                    )}
                </div>
            )}
            renderEmpty={(keyword) => (
                <>
                    <p className="text-[17px] font-semibold text-ink-800">&lsquo;{keyword}&rsquo;와 맞는 브랜드가 없어요</p>
                    <p className="mt-1 text-[15px] text-ink-400">
                        철자를 확인하거나 브랜드명 일부만 입력해 보세요. 정보공개서에 등록되지 않은 브랜드는 목록에 나오지 않아요.
                    </p>
                </>
            )}
        />
    );
}
