"use client";

import { AreaSearchItem, searchAreas } from "@/api/analysis/analysis.api";
import HighlightText from "./HighlightText";
import SearchSelect from "./SearchSelect";

type AreaSearchProps = {
    areaName: string;
    selected: boolean;
    onSelect: (area: AreaSearchItem) => void;
    onClear: () => void;
};

export default function AreaSearch({ areaName, selected, onSelect, onClear }: AreaSearchProps) {
    return (
        <div>
            <SearchSelect<AreaSearchItem>
                placeholder="주소를 검색해 주세요."
                defaultKeyword={areaName}
                search={searchAreas}
                getKey={(a) => a.code}
                getLabel={(a) => a.name}
                onSelect={onSelect}
                onKeywordChange={() => selected && onClear()}
                renderItem={(a, keyword) => (
                    <div className="flex items-center justify-between text-[17px]">
                        <span className="text-ink-600">
                            <HighlightText text={a.name} keyword={keyword} />
                        </span>
                        <span className="text-[15px] text-ink-300">
                            {a.gu} · {a.dong}
                        </span>
                    </div>
                )}
                renderEmpty={(keyword) => (
                    <>
                        <p className="text-[17px] font-semibold text-ink-800">&lsquo;{keyword}&rsquo;와 맞는 상권이 없어요</p>
                        <p className="mt-1 text-[15px] text-ink-400">
                            동 이름이나 역 이름으로 검색해 보세요. 서울시 상권분석서비스에 등록된 상권만 분석할 수 있어요.
                        </p>
                    </>
                )}
            />
            {selected && <p className="mt-3 text-[15px] text-sub-700">✓ 선택한 상권으로 분석해요</p>}
        </div>
    );
}
