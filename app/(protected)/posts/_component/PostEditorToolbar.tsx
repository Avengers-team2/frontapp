import { ImageIcon, Link2 } from "lucide-react";

interface PostEditorToolbarProps {
    onBold: () => void;
    onItalic: () => void;
    onUnderline: () => void;
    onList: () => void;
    onLink: () => void;
    onImage: () => void;
}

const buttonClass = "flex items-center text-base font-bold text-ink-400";

// 내용 입력칸 위 서식 버튼 (B · I · U · 목록 / 링크 · 사진)
export default function PostEditorToolbar({onBold, onItalic, onUnderline, onList, onLink, onImage}: PostEditorToolbarProps) {
    return (
        <div className="flex h-12.75 shrink-0 items-center px-4.5">
            <div className="flex items-center gap-5">
                <button type="button" onClick={onBold} title="굵게" className={buttonClass}>B</button>
                <button type="button" onClick={onItalic} title="기울임" className={buttonClass}>I</button>
                <button type="button" onClick={onUnderline} title="밑줄" className={buttonClass}>U</button>
                <button type="button" onClick={onList} title="목록" className={`${buttonClass} whitespace-pre`}>{"•  목록"}</button>
            </div>
            <div className="ml-24 flex items-center gap-2">
                <button type="button" onClick={onLink} title="링크" className={`${buttonClass} gap-1.5`}>
                    <Link2 className="size-4.5" /> 링크
                </button>
                <button type="button" onClick={onImage} title="사진" className={`${buttonClass} gap-3`}>
                    <ImageIcon className="size-4.5" /> 사진
                </button>
            </div>
        </div>
    );
}
