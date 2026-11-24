import { formatSize, getExt } from "../_lib/reportJob";

type Props = {
    file: File;
    error: boolean;
    onRemove: () => void;
};

export default function FileItem({ file, error, onRemove }: Props) {
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
                {getExt(file.name).toUpperCase()}
            </span>

            {/* 파일 정보 */}
            <div className="ml-[16px] min-w-0">
                <p className="text-[18px] font-semibold leading-[1.4] text-[#111] truncate">{file.name}</p>
                <p className={`mt-[4px] text-[15px] leading-[1.4] ${error ? "text-[#e5484d]" : "text-[#6b6b6b]"}`}>
                    {error ? "업로드 실패 · AI 검토 시작 전" : `${formatSize(file.size)} · 업로드 완료`}
                </p>
            </div>

            {/* 상태 · 삭제 */}
            <div className="ml-auto flex items-center gap-[16px]">
                {!error && (
                    <span className="h-[32px] px-[12px] flex items-center rounded-full bg-[#ddf9f4] text-[14px] font-semibold text-[#0b7468]">
                        확인 완료
                    </span>
                )}
                <button
                    type="button"
                    onClick={onRemove}
                    className="text-[15px] text-[#6b6b6b] cursor-pointer transition-colors hover:text-[#111]"
                >
                    삭제
                </button>
            </div>
        </div>
    );
}