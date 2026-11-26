"use client";

import "@/keyframes/form-motion.keyframe.css";
import { AreaSearchItem, searchAreas } from "@/api/analysis/analysis.api";
import HighlightText from "./HighlightText";
import SearchSelect from "./SearchSelect";

type AreaSearchProps = {
    areaName: string;
    selected: boolean;
    invalid?: boolean;
    onSelect: (area: AreaSearchItem) => void;
    onClear: () => void;
};

export default function AreaSearch({ areaName, selected, invalid, onSelect, onClear }: AreaSearchProps) {
    return (
        <div>
            <SearchSelect<AreaSearchItem>
                placeholder="주소를 검색해 주세요."
                invalid={invalid}
                defaultKeyword={areaName}
                search={searchAreas}
                getKey={(a) => a.code}
                getLabel={(a) => a.name}
                onSelect={onSelect}
                onKeywordChange={() => selected && onClear()}
                renderItem={(a, keyword) => (
                    <div className="flex items-center justify-between text-[17px]">
                        <span className="flex items-center gap-2 text-ink-600">
                            <HighlightText text={a.name} keyword={keyword} />
                            {a.has_sales_data === false && (
                                <span className="shrink-0 rounded bg-surface px-1.5 py-0.5 text-[12px] font-medium text-ink-400">
                                    매출 데이터 없음
                                </span>
                            )}
                        </span>
                        <span className="text-[15px] text-ink-300">
                            {a.gu} · {a.dong}
                        </span>
                    </div>
                )}
                renderEmpty={(keyword) => (
                    <>
                        <p className="text-[17px] font-semibold text-ink-800">&lsquo;{keyword}&rsquo;와 맞는 상권이 없습니다</p>
                        <p className="mt-1 text-[15px] text-ink-400">
                            동 이름이나 역 이름으로 검색해 보세요. 서울시 상권분석서비스에 등록된 상권만 분석할 수 있습니다.
                        </p>
                    </>
                )}
            />
            {/* 상권을 고르면 선택 줄이 펼쳐지며 왼쪽에서 미끄러져 채워진다 (다른 상권을 고르면 다시 미끄러진다) */}
            <div
                className={`grid transition-[grid-template-rows] duration-450 ease-[cubic-bezier(0.3,1,0.4,1)] motion-reduce:transition-none ${
                    selected ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
            >
                <div className="min-h-0 overflow-hidden">
                    <p
                        key={areaName}
                        className="mt-3 flex items-center gap-2 text-[15px] text-sub-700 animate-[form-slide-in_0.45s_cubic-bezier(0.3,1.3,0.5,1)_backwards] motion-reduce:animate-none"
                    >
                        ✓ 선택한 상권으로 분석합니다
                    </p>
                </div>
            </div>
        </div>
    );
}
