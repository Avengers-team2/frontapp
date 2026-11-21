interface LikeButtonProps {
    likeCount?: number;
    isLiked?: boolean;
    disabled?: boolean;
    onLike: () => void;
}

// 공감(좋아요) 버튼 (공감하면 ♡ → ♥)
export default function LikeButton({likeCount, isLiked, disabled, onLike}: LikeButtonProps) {
    return (
        <button
            type="button"
            onClick={onLike}
            disabled={disabled}
            className="whitespace-pre rounded-full border border-line bg-white px-5 py-3 text-[15px] font-semibold text-ink-700 shadow-[0px_4px_14px_0px_rgba(11,27,51,0.05)]"
        >
            {`${isLiked ? "♥" : "♡"}  공감 ${likeCount ?? 0}`}
        </button>
    );
}
