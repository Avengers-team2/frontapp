"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiError, getAreaStores, type AreaStores } from "@/api/analysis/analysis.api";

export type StoresState = {
  data?: AreaStores;
  isLoading: boolean;
  errorMessage: string | null; // 있으면 점포 정보를 못 불러온 것. 분석 결과 화면은 막지 않고 안내만 보여준다
};

// 상태코드별 안내 문구 (401 은 결과 화면 자체가 로그인이 필요해서 따로 처리하지 않는다)
function toMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "점포 정보는 로그인 후에 볼 수 있어요.";
    if (error.status === 404) return "점포 정보를 찾을 수 없는 상권이에요.";
    if (error.status === 422) return "이 업종은 점포 정보를 확인할 수 없어요.";
    if (error.status === 503) return "점포 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";
  }
  return "점포 정보를 불러오지 못했어요.";
}

// 선택한 상권·업종(·브랜드)의 점포를 불러온다. 같은 상권은 서버가 캐시해서 두 번째부터 빠르다.
// 업종이나 브랜드가 바뀌면 다시 부른다(queryKey). 업종 코드를 아직 모르면 부르지 않는다.
export function useAreaStores(areaCode: string | null, industryCode: string | undefined, brand: string | null): StoresState {
  const { data, isLoading, error } = useQuery({
    queryKey: ["areaStores", areaCode, industryCode, brand],
    queryFn: () => getAreaStores(areaCode!, { industryCode: industryCode!, brand }),
    enabled: !!areaCode && !!industryCode,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return { data, isLoading, errorMessage: error ? toMessage(error) : null };
}
