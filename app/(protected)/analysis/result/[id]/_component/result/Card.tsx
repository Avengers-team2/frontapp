// 결과 화면의 공통 구획. 박스 없이 위쪽 구분선으로만 항목을 나눈다.
export const DIVIDED = "border-t border-line pt-6 pb-2 print:break-inside-avoid";

export default function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className={`space-y-4 ${DIVIDED}`}>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-lg font-bold tracking-tight text-main-dark">{title}</h3>
        {sub && <span className="text-xs text-ink-300">{sub}</span>}
      </div>
      {children}
    </section>
  );
}
