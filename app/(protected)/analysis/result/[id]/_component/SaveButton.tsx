"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, Check } from "lucide-react";
import MyPageToast from "@/app/(protected)/my-page/_component/MyPageToast";
import { getMyAnalysesApi } from "@/app/(protected)/my-page/_lib/myAnalysis.api";

// 분석 결과 저장하기.
// 분석을 실행하면 마이페이지 "내 분석"(GET /analyses/me)에 이미 올라가므로, 따로 저장 요청은 없다.
// 목록에 실제로 있는지 확인한 뒤에만 저장되었다고 알린다.
const TOAST_MS = 2500;

export default function SaveButton({ inputId }: { inputId: string }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef(0);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      setMessage(null);
    },
    [],
  );

  const notify = (text: string) => {
    window.clearTimeout(timer.current);
    setMessage(text);
    timer.current = window.setTimeout(() => setMessage(null), TOAST_MS);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await getMyAnalysesApi();
      if (data?.some((item) => String(item.input_id) === inputId)) {
        setSaved(true);
        notify("마이페이지에 저장되었습니다");
      } else {
        notify("마이페이지 목록에서 이 분석을 찾지 못했습니다");
      }
    } catch {
      notify("저장하지 못했습니다. 잠시 후 다시 시도해 주세요");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="flex cursor-pointer items-center gap-2 rounded-xl border border-point-blue bg-white px-4 py-2.5 text-sm font-bold text-point-blue transition-colors hover:bg-point-blue-50 disabled:cursor-default disabled:opacity-50"
      >
        {saved ? <Check aria-hidden className="size-4" /> : <Bookmark aria-hidden className="size-4" />}
        분석결과 저장하기
      </button>
      <div role="status">
        {/* ✓ 표시가 있는 마이페이지 알림창을 그대로 쓴다 */}
        <MyPageToast message={message} compact />
      </div>
    </>
  );
}
