// 지도 영역 placeholder. 지도 라이브러리와 상권 폴리곤 데이터는 아직 없으므로 자리만 잡아둔다.
export default function MapPlaceholder() {
  return (
    <div className="relative h-full min-h-[480px] overflow-hidden rounded-2xl bg-line">
      <div className="absolute left-4 top-4 rounded-xl bg-white px-4 py-2 text-sm font-bold text-ink-900 shadow">
        강남구 신사동 · 커피 전문점
      </div>
      <div className="absolute inset-0 flex items-center justify-center text-sm text-ink-500">
        지도 영역 (추후 연동)
      </div>
    </div>
  );
}
