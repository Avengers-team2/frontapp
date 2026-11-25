import { formatSize, getExt } from "../_lib/reportJob";

type Props = {
    fileName: string;
    fileSize: number;
    pageCount: number | null;
    state: "uploading" | "done" | "error";
    onRemove: () => void;
};

export default function FileItem({ fileName, fileSize, pageCount, state, onRemove }: Props) {
    const error = state === "error";

    const meta =
        state === "uploading"
            ? `${formatSize(fileSize)} · 업로드 중...`
            : error
                ? "업로드 실패 · AI 검토 시작 전"
                : `${formatSize(fileSize)} · ${pageCount ? `${pageCount}쪽 · ` : ""}업로드 완료`;

    return (
        <div
            className={`flex items-center h-[88px] px-[20px] rounded-[14px] border-[1.2px] bg-white animate-in fade-in slide-in-from-top-2 duration-300 ${
                error ? "border-[#e5484d]" : "border-[#ddd]"
            }`}
        >
            {/* 확장자 아이콘 */}
            <span
                className={`shrink-0 flex items-center justify-center w-[48px] h-[48px] rounded-[12px] text-[14px] font-bold ${
                    error ? "bg-[#fbe3e4] text-[#e5484d]" : "bg-[#eaf8f6] text-[#0b7468]"
                }`}
            >
                {getExt(fileName).toUpperCase()}
            </span>

            {/* 파일 정보 */}
            <div className="ml-[16px] min-w-0">
                <p className="text-[18px] font-semibold leading-[1.4] text-[#111] truncate">{fileName}</p>
                <p className={`mt-[4px] text-[15px] leading-[1.4] ${error ? "text-[#e5484d]" : "text-[#6b6b6b]"}`}>{meta}</p>
            </div>

            {/* 상태 · 삭제 */}
            <div className="ml-auto flex items-center gap-[16px]">
                {state === "uploading" && (
                    <span className="w-[22px] h-[22px] rounded-full border-[3px] border-[#2bb3a3]/20 border-t-[#2bb3a3] animate-spin" />
                )}
                {state === "done" && (
                    <span className="h-[32px] px-[12px] flex items-center rounded-full bg-[#ddf9f4] text-[14px] font-semibold text-[#0b7468]">
                        확인 완료
                    </span>
                )}
                {state !== "uploading" && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-[15px] text-[#6b6b6b] cursor-pointer transition-colors hover:text-[#111]"
                    >
                        삭제
                    </button>
                )}
            </div>
        </div>
    );
}