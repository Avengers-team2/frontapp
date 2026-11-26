import { useEffect, useRef, useState } from "react";
import type { ScoreTone } from "@/types/analysis-result";

// 막대 길이(0~100%)별 너비 클래스. Tailwind는 클래스를 문자열 그대로 찾기 때문에 미리 적어 둔다.
export const BAR_WIDTH = [
  "w-0", "w-[1%]", "w-[2%]", "w-[3%]", "w-[4%]", "w-[5%]", "w-[6%]", "w-[7%]", "w-[8%]", "w-[9%]",
  "w-[10%]", "w-[11%]", "w-[12%]", "w-[13%]", "w-[14%]", "w-[15%]", "w-[16%]", "w-[17%]",
  "w-[18%]", "w-[19%]", "w-[20%]", "w-[21%]", "w-[22%]", "w-[23%]", "w-[24%]", "w-[25%]",
  "w-[26%]", "w-[27%]", "w-[28%]", "w-[29%]", "w-[30%]", "w-[31%]", "w-[32%]", "w-[33%]",
  "w-[34%]", "w-[35%]", "w-[36%]", "w-[37%]", "w-[38%]", "w-[39%]", "w-[40%]", "w-[41%]",
  "w-[42%]", "w-[43%]", "w-[44%]", "w-[45%]", "w-[46%]", "w-[47%]", "w-[48%]", "w-[49%]",
  "w-[50%]", "w-[51%]", "w-[52%]", "w-[53%]", "w-[54%]", "w-[55%]", "w-[56%]", "w-[57%]",
  "w-[58%]", "w-[59%]", "w-[60%]", "w-[61%]", "w-[62%]", "w-[63%]", "w-[64%]", "w-[65%]",
  "w-[66%]", "w-[67%]", "w-[68%]", "w-[69%]", "w-[70%]", "w-[71%]", "w-[72%]", "w-[73%]",
  "w-[74%]", "w-[75%]", "w-[76%]", "w-[77%]", "w-[78%]", "w-[79%]", "w-[80%]", "w-[81%]",
  "w-[82%]", "w-[83%]", "w-[84%]", "w-[85%]", "w-[86%]", "w-[87%]", "w-[88%]", "w-[89%]",
  "w-[90%]", "w-[91%]", "w-[92%]", "w-[93%]", "w-[94%]", "w-[95%]", "w-[96%]", "w-[97%]",
  "w-[98%]", "w-[99%]", "w-full",
];

// 막대가 위에서부터 차례로 차오르도록 줄마다 지연을 다르게 준다 (250ms + 줄 번호 × 90ms)
export const BAR_DELAY = [
  "delay-[250ms]",
  "delay-[340ms]",
  "delay-[430ms]",
  "delay-[520ms]",
  "delay-[610ms]",
  "delay-[700ms]",
  "delay-[790ms]",
  "delay-[880ms]",
];

interface ScoreBarProps {
  label: string;
  score: number; // 0 ~ 100
  tone?: ScoreTone;
  excluded?: boolean; // 입력하지 않아 계산에서 빠진 항목
  detail?: string; // 점수 근거 한 줄 (서버가 준 문장)
  inView?: boolean; // 화면에 들어왔는지 (들어오면 막대가 차오른다)
  index?: number; // 목록에서의 순서 (차오르는 지연에 쓴다)
  dimmed?: boolean; // 다른 줄이 선택돼 흐려진 상태
  active?: boolean; // 이 줄이 선택된 상태
  onActivate?: () => void;
  onDeactivate?: () => void;
}

const FILL_MS = 900;

// 0%에서 시작해 go 가 되면 score% 까지 차오르는 막대. key 가 바뀌면 처음부터 다시 채운다.
function BarFill({ score, go, colorClass, delayClass }: { score: number; go: boolean; colorClass: string; delayClass: string }) {
  const [grown, setGrown] = useState(false);

  // 0% 모습이 먼저 그려진 뒤에 늘려야 전환이 걸려서, 프레임을 두 번 기다린다
  useEffect(() => {
    if (!go) return;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setGrown(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [go]);

  return (
    <div
      className={`h-full rounded-full transition-[width] duration-900 ease-[cubic-bezier(0.34,1.45,0.64,1)] motion-reduce:transition-none ${colorClass} ${
        BAR_WIDTH[grown ? score : 0]
      } ${delayClass}`}
    />
  );
}

// 화면에 들어오면 막대가 차오르고, 줄에 올리거나 포커스하면 그 줄만 밝아지며 막대가 다시 채워진다.
export default function ScoreBar({
  label,
  score,
  tone = "default",
  excluded = false,
  detail,
  inView = true,
  index = 0,
  dimmed = false,
  active = false,
  onActivate,
  onDeactivate,
}: ScoreBarProps) {
  // 줄에 올릴 때마다 막대를 비웠다가 다시 채운다 (채워지는 중에는 무시)
  const [replay, setReplay] = useState(0);
  const lastRoll = useRef(0);
  const handleActivate = () => {
    onActivate?.();
    if (!inView || Date.now() - lastRoll.current < FILL_MS) return;
    lastRoll.current = Date.now();
    setReplay((n) => n + 1);
  };

  if (excluded) {
    return (
      // 점수가 없는 항목: 점수 자리에 "?"를 두고, 아래에 사유를 보여준다
      <div className="px-2 py-1">
        <div className="flex items-center gap-3">
          <span className="w-40 shrink-0 text-sm text-ink-300">{label}</span>
          <div className="h-2 flex-1 rounded-full bg-line" />
          <span className="w-10 text-right text-sm font-bold text-ink-300">?</span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-300">{detail || "입력하지 않아 제외"}</p>
      </div>
    );
  }

  const clamped = Math.min(100, Math.max(0, score));
  const rounded = Math.round(clamped);
  const barColor = tone === "warn" ? "bg-warning" : "bg-sub-700";

  return (
    <div
      tabIndex={0}
      onPointerEnter={handleActivate}
      onPointerLeave={onDeactivate}
      onFocus={handleActivate}
      onBlur={onDeactivate}
      className={`rounded-lg px-2 py-1 outline-none transition-[opacity,background-color] duration-200 focus-visible:ring-2 focus-visible:ring-sub-700 ${
        active ? "bg-sub-50 opacity-100" : dimmed ? "opacity-40" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="w-40 shrink-0 text-sm text-ink-700">{label}</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
          <BarFill
            key={replay}
            score={rounded}
            go={inView}
            colorClass={barColor}
            delayClass={replay === 0 ? BAR_DELAY[Math.min(index, BAR_DELAY.length - 1)] : "delay-0"}
          />
        </div>
        <span className="w-10 text-right text-sm font-bold tabular-nums text-ink-900">{rounded}점</span>
      </div>
      {detail && <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{detail}</p>}
    </div>
  );
}
