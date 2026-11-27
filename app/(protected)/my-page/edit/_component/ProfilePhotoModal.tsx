"use client"

interface ProfilePhotoModalProps {
    onUpload: () => void; // 사진 업로드 → 파일 선택창 열기
    onDelete: () => void; // 현재 사진 삭제 → 기본 이미지로
    onClose: () => void;  // 취소 / 바깥 클릭
}

// 프로필 사진 변경 팝업 (사진 업로드 / 현재 사진 삭제 / 취소)
export default function ProfilePhotoModal({onUpload, onDelete, onClose}: ProfilePhotoModalProps) {
    const itemClass = "w-full border-t border-line-gray py-5 text-center text-lg";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50" onClick={onClose}>
            <div className="w-104 overflow-hidden rounded-[28px] bg-white" onClick={(e) => e.stopPropagation()}>
                <h2 className="py-7 text-center text-[26px] font-bold leading-[1.4] text-ink-900">프로필 사진 변경</h2>
                <button type="button" onClick={onUpload} className={`${itemClass} font-semibold text-[#13284A]`}>
                    사진 업로드
                </button>
                <button type="button" onClick={onDelete} className={`${itemClass} font-semibold text-[#E5484D]`}>
                    현재 사진 삭제
                </button>
                <button type="button" onClick={onClose} className={`${itemClass} text-ink-500`}>
                    취소
                </button>
            </div>
        </div>
    );
}
