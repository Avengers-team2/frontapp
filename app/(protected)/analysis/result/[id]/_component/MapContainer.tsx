import { ArrowLeftRight, Search } from "lucide-react";
import KakaoMap from "./KakaoMap";

// 지도 영역. 카카오맵 위에 검색 조건 카드를 띄운다.
export default function MapContainer() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-line">
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
        {/* 검색한 주소 저장해서 이쪽에 띄워야함 */}
        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-2 text-sm font-bold text-ink-900 shadow">
          <Search className="size-4" />
          <span>강남구 신사동 · 커피 전문점</span>
          <button
            type="button"
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink-900 hover:bg-surface"
          >
            조건 수정
          </button>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-ink-900 shadow hover:bg-surface"
        >
          <ArrowLeftRight className="size-4" />
          조건 바꿔 비교하기
        </button>
      </div>
      <div className="absolute inset-0 flex items-center justify-center text-sm text-ink-500">
        <KakaoMap/>
      </div>
    </div>
  );

  
}
