"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { ApiError, getAreaPolygon } from "@/api/analysis/analysis.api";
import { FORM_RESTORE_KEY } from "../../../_component/analysis.data";
import KakaoMap from "./KakaoMap";
import type { StoresState } from "./useAreaStores";
import { formatDataMonth } from "./result/StoreCompetitionCard";
import AreaLocator, { type LocatorState } from "./AreaLocator";

// 지도 영역. 카카오맵 위에 검색 조건 카드를 띄운다. stores 가 오면 선택 업종 점포를 마커로 보여준다.
export default function MapContainer({ stores }: { stores?: StoresState }) {
  const [locator, setLocator] = useState<LocatorState>({ point: null, result: null, selectedCode: null });

  const router = useRouter();
  const searchParams = useSearchParams();
  const areaCode = searchParams.get("area");
  const industry = searchParams.get("industry");
  const [areaName, setAreaName] = useState<string | null>(null);
  const [areaError, setAreaError] = useState<string | null>(null); // URL 상권 조회 실패 → 검색창에 표시

  // 지도에 그릴 점포 (같은 데이터면 같은 객체를 줘서 마커가 불필요하게 다시 그려지지 않게 한다)
  const storeData = stores?.data;
  const storeMarkers = useMemo(
    () => (storeData ? { same: storeData.same_industry_stores, franchise: storeData.franchise_stores } : null),
    [storeData],
  );

  // URL 의 ?area=상권코드 가 있으면 열릴 때 그 상권 폴리곤을 불러온다
  useEffect(() => {
    if (!areaCode) return;
    let alive = true;
    getAreaPolygon(areaCode)
      .then((item) => {
        if (!alive) return;
        setAreaError(null);
        setAreaName(item.name);
        setLocator({ point: null, result: { matched: "inside", items: [item] }, selectedCode: item.code });
      })
      .catch((err) => {
        if (!alive) return;
        // 없는 상권(404)은 검색 결과 없음과 같은 문구로 보여준다
        setAreaError(err instanceof ApiError && err.status === 404 ? "검색 결과가 없어요" : "상권 정보를 불러오지 못했어요");
      });
    return () => {
      alive = false;
    };
  }, [areaCode]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-line">
      <div className="absolute left-4 top-25 z-10 flex flex-col items-start gap-2">
        {/* 검색한 주소 저장해서 이쪽에 띄워야함 */}
        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-2 text-sm font-bold text-ink-900 shadow">
          {/* 서치아이콘??? 수정?? */}
          <Search className="size-4" />
          <div>
            <span>{areaName ?? "지역 미선택"}</span> · <span>{industry ?? "업종 미선택"}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              // 입력 화면이 직전 입력값을 채워 열리도록 표시해 둔다
              try {
                sessionStorage.setItem(FORM_RESTORE_KEY, "1");
              } catch {
                // 저장소를 못 써도 이동은 한다 (빈 입력창으로 열림)
              }
              router.push("/analysis");
            }}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink-900 hover:bg-surface"
          >
            조건 수정
          </button>
        </div>
        {/* 주소 검색 → 상권 폴리곤 */}
        <AreaLocator
          value={locator}
          error={areaError}
          onEdit={() => setAreaError(null)}
          onChange={(next) => {
            setAreaError(null);
            setLocator(next);
          }}
        />
      </div>

      {/* 맵 영역 */}
      <div className="absolute inset-0 flex items-center justify-center text-sm text-ink-500">
        <KakaoMap
          point={locator.point}
          showAround={!!locator.point && locator.result?.matched !== "inside"}
          areas={locator.result?.items ?? []}
          selectedCode={locator.selectedCode}
          onSelect={(code) => setLocator((prev) => ({ ...prev, selectedCode: code }))}
          stores={storeMarkers}
        />
      </div>

      {/* 점포 마커 안내: 범례, 불러오는 중, 불러오지 못했을 때 (분석 결과 화면은 막지 않는다) */}
      {stores && (stores.isLoading || stores.errorMessage || storeData) && (
        <div className="absolute bottom-6 left-4 z-10 max-w-72 rounded-xl bg-white px-4 py-3 text-xs text-ink-700 shadow">
          {stores.isLoading ? (
            <p role="status" className="flex items-center gap-2">
              <span className="size-3 shrink-0 animate-spin rounded-full border-2 border-line border-t-sub" />
              점포 정보를 불러오는 중이에요
              <span className="text-ink-400">(처음엔 몇 초 걸려요)</span>
            </p>
          ) : stores.errorMessage ? (
            <p role="status" className="text-ink-500">
              {stores.errorMessage}
            </p>
          ) : storeData ? (
            <div className="space-y-1.5">
              <p className="font-bold text-ink-900">
                {storeData.industry_name} 점포 {storeData.summary.same_industry_count}곳
              </p>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <i className="size-2.5 shrink-0 rounded-full bg-[#1F3A5F] not-italic ring-2 ring-white" />
                  일반 점포 {storeData.summary.independent_count}곳
                </li>
                <li className="flex items-center gap-2">
                  <i className="size-2.5 shrink-0 rotate-45 bg-warning not-italic" />
                  프랜차이즈로 보이는 점포 {storeData.summary.franchise_count}곳
                </li>
                {storeData.franchise_stores.some((s) => s.is_my_brand) && (
                  <li className="flex items-center gap-2">
                    <i className="size-3.5 shrink-0 rotate-45 border-2 border-navy-850 bg-warning not-italic" />내 브랜드 점포
                  </li>
                )}
              </ul>
              <p className="text-ink-400">{formatDataMonth(storeData.data_month)} 기준</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
