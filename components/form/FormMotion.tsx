"use client";

import { useState } from "react";
import "@/keyframes/form-motion.keyframe.css";

// 폼 검증 모션 모음 (로그인·회원가입): 흔들림, 안내 문구 펼침, 고친 칸 체크, 틀린 항목 요약, 틀린 칸으로 이동.
// 스타일은 모두 Tailwind 클래스이고, 흔들림 @keyframes 만 keyframes/form-motion.keyframe.css 에 있다.

const SPRING = "ease-[cubic-bezier(0.3,1,0.4,1)]";

// 틀린 칸이 흔들린다. 제출할 때마다 shakeKey 가 늘고, a/b 이름을 번갈아 써서 연달아 틀려도 다시 흔들린다.
export function shakeClass(shakeKey: number, active: boolean) {
  if (!active || shakeKey === 0) return "";
  return `motion-reduce:animate-none ${shakeKey % 2 ? "animate-[form-shake-a_0.4s]" : "animate-[form-shake-b_0.4s]"}`;
}

// 칸 아래 안내 문구. 오류가 생기면 펼쳐지고 고치면 접힌다 (접히는 동안에도 마지막 문구를 유지한다)
export function FieldMessage({ message, className = "" }: { message?: string | null; className?: string }) {
  const [shown, setShown] = useState(message ?? "");
  if (message && message !== shown) setShown(message);

  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${SPRING} ${
        message ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="min-h-0 overflow-hidden">
        <p role={message ? "alert" : undefined} className={`pt-1 text-[12px] font-medium text-danger ${className}`}>
          {shown}
        </p>
      </div>
    </div>
  );
}

// 고친 칸에 생기는 초록 체크.
// 기본은 입력칸 오른쪽 끝에 겹쳐 놓고, 오른쪽에 버튼이나 아이콘이 있는 칸·선택형 칸은 inline 으로 줄 안에 두거나 className 으로 위치를 옮긴다.
export function FieldCheck({
  show,
  inline = false,
  className = "",
}: {
  show: boolean;
  inline?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none size-5 shrink-0 [transition:scale_0.35s_cubic-bezier(0.3,1.7,0.5,1)] motion-reduce:[transition:none] ${
        inline ? "inline-block" : "absolute right-3 top-1/2 -mt-2.5"
      } ${className} ${show ? "scale-100" : "scale-0"}`}
    >
      <svg viewBox="0 0 20 20" className="size-5">
        <circle cx="10" cy="10" r="10" className="fill-sub-700" />
        <path d="M5.5 10.5l3 3 6-6.5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

// 부드럽게 그 칸이 보이는 곳까지 올라가서, 그 칸에 커서를 놓는다
export function goToField(fieldId: string) {
  const el = document.getElementById(fieldId);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  window.setTimeout(
    () => (el.querySelector("input, textarea, select") as HTMLElement | null)?.focus({ preventScroll: true }),
    reduce ? 0 : 450,
  );
}

export type SummaryItem = { name: string; label: string; invalid: boolean };

// 폼 위쪽에 내려오는 "N개 항목을 확인해 주세요" 요약. 항목을 누르면 그 칸으로 가고, 고친 항목은 줄이 그어지며 숫자가 줄어든다.
export function ErrorSummary({ items, onGo }: { items: SummaryItem[]; onGo: (name: string) => void }) {
  const remaining = items.filter((i) => i.invalid).length;
  const open = remaining > 0;
  // 접히는 동안 "0개"로 바뀌지 않게 마지막 숫자를 유지한다
  const [shownCount, setShownCount] = useState(remaining);
  if (remaining > 0 && remaining !== shownCount) setShownCount(remaining);

  return (
    <div
      role="alert"
      className={`grid transition-[grid-template-rows,margin] duration-400 motion-reduce:transition-none ${SPRING} ${
        open ? "mb-8 grid-rows-[1fr]" : "mb-0 grid-rows-[0fr]"
      }`}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="rounded-xl bg-danger-bg px-4 py-3.5 ring-1 ring-danger/30">
          <b className="flex items-center gap-2 text-[14px] font-bold text-danger-strong">
            <i className="grid size-4 shrink-0 place-items-center rounded-full bg-danger text-[10px] font-bold not-italic text-white">
              !
            </i>
            {shownCount}개 항목을 확인해 주세요
          </b>
          <ul className="mt-2 space-y-0.5 pl-6 text-[13px] font-bold">
            {items.map((item) => (
              <li
                key={item.name}
                className={`transition-opacity duration-300 motion-reduce:transition-none ${
                  item.invalid ? "" : "line-through opacity-40"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onGo(item.name)}
                  className="cursor-pointer text-danger-strong underline underline-offset-2"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
