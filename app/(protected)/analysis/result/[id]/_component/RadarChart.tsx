import { useInView } from "@/app/(protected)/report-job/_components/Reveal";
import type { ScoreItem } from "@/types/analysis-result";

// 항목별 점수를 한눈에 보여주는 육각형 그래프. 화면에 들어오면 가운데에서부터 펼쳐진다.
// 아래 점수 줄에 올리면 같은 항목의 꼭짓점이 커진다.

const CX = 160;
const CY = 125;
const RADIUS = 80;
const RINGS = [0.25, 0.5, 0.75, 1];

// 꼭짓점 라벨은 좁아서 짧은 이름을 쓴다
const SHORT: Record<string, string> = {
  sales: "매출 잠재력",
  competition: "경쟁 환경",
  customer: "고객층",
  time: "시간대",
  closure: "폐업 위험",
  stability: "상권 안정성",
};

function point(index: number, count: number, radius: number) {
  const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
  return { x: CX + radius * Math.cos(angle), y: CY + radius * Math.sin(angle), cos: Math.cos(angle), sin: Math.sin(angle) };
}

const toPoints = (list: { x: number; y: number }[]) => list.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

export default function RadarChart({ items, activeId }: { items: ScoreItem[]; activeId: ScoreItem["id"] | null }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const count = items.length;
  if (count < 3) return null;

  const vertices = items.map((item, i) =>
    point(i, count, (RADIUS * (item.excluded ? 0 : Math.min(100, Math.max(0, item.score)))) / 100),
  );

  return (
    <div ref={ref}>
      <svg viewBox="0 0 320 250" className="mx-auto w-full max-w-90" role="img" aria-label="항목별 점수 육각형 그래프">
        {RINGS.map((ring) => (
          <polygon
            key={ring}
            points={toPoints(items.map((_, i) => point(i, count, RADIUS * ring)))}
            className={`stroke-line ${ring === 1 ? "fill-point-blue-50/50" : "fill-none"}`}
          />
        ))}
        {items.map((item, i) => {
          const end = point(i, count, RADIUS);
          return <line key={item.id} x1={CX} y1={CY} x2={end.x} y2={end.y} className="stroke-line" />;
        })}

        <g
          className={`origin-[160px_125px] transition-[scale,opacity] delay-200 duration-900 ease-[cubic-bezier(0.34,1.45,0.64,1)] motion-reduce:transition-none ${
            inView ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        >
          <polygon points={toPoints(vertices)} strokeLinejoin="round" className="fill-point-mint/30 stroke-point-blue stroke-[2.5]" />
          {vertices.map((v, i) => (
            <circle
              key={items[i].id}
              cx={v.x}
              cy={v.y}
              r={activeId === items[i].id ? 6 : 3}
              className="fill-point-blue stroke-white stroke-[1.5] transition-[r] duration-200"
            />
          ))}
        </g>

        {items.map((item, i) => {
          const at = point(i, count, RADIUS + 18);
          const anchor = at.cos > 0.3 ? "start" : at.cos < -0.3 ? "end" : "middle";
          const y = at.y + (at.sin < -0.9 ? -10 : at.sin > 0.9 ? 6 : -3);
          const color = item.excluded
            ? "fill-ink-300"
            : item.tone === "warn"
              ? "fill-warning-text"
              : item.score >= 70
                ? "fill-point-blue"
                : "fill-sub-700";
          return (
            <text key={item.id} x={at.x} y={y} textAnchor={anchor} className="text-[10px]">
              <tspan className="fill-ink-500">{SHORT[item.id] ?? item.label}</tspan>
              <tspan x={at.x} dy="13" className={`text-[12px] font-bold ${color}`}>
                {item.excluded ? "?" : Math.round(item.score)}
              </tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
}
