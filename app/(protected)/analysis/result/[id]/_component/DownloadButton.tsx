"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { REVEAL_ALL_EVENT } from "@/app/(protected)/report-job/_components/Reveal";

// 결과 패널 내용을 브라우저 인쇄 창으로 보낸다 (대상에서 "PDF로 저장"을 고르면 파일이 된다).
// 아직 스크롤하지 않은 그래프도 채워지도록 먼저 모두 보이게 하고, 애니메이션이 끝난 뒤에 인쇄한다.
const SETTLE_MS = 2300;

export default function DownloadButton({ fileName, disabled }: { fileName: string; disabled: boolean }) {
  const [preparing, setPreparing] = useState(false);
  const timer = useRef(0);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      setPreparing(false);
    },
    [],
  );

  const print = () => {
    const html = document.documentElement;
    const overflow = html.style.overflow;
    const title = document.title;
    // 사이트 헤더·푸터는 인쇄에서 뺀다 (결과 안의 제목 header 는 남긴다)
    const chrome = [...document.querySelectorAll("header, footer")].filter((el) => !el.closest("[data-print-area]"));

    chrome.forEach((el) => el.classList.add("print:hidden"));
    html.style.overflow = "visible"; // 화면 스크롤 잠금을 풀어야 여러 쪽으로 인쇄된다
    document.title = fileName; // 저장할 때 기본 파일 이름
    try {
      window.print();
    } finally {
      chrome.forEach((el) => el.classList.remove("print:hidden"));
      html.style.overflow = overflow;
      document.title = title;
      setPreparing(false);
    }
  };

  const handleClick = () => {
    setPreparing(true);
    window.dispatchEvent(new Event(REVEAL_ALL_EVENT));
    timer.current = window.setTimeout(print, SETTLE_MS);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || preparing}
      className="flex cursor-pointer items-center gap-2 rounded-xl bg-point-blue px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-main disabled:cursor-default disabled:opacity-50"
    >
      <Download aria-hidden className="size-4" />
      {preparing ? "PDF 준비 중입니다" : "분석결과 다운로드"}
    </button>
  );
}
