import { PostCategory, PostCategoryLabel } from "@/enums/post.enum";

// 분류별 배지 색 (Figma 값)
const badgeStyle: Record<PostCategory, string> = {
    [PostCategory.NOTICE]: "bg-[rgba(159,168,255,0.16)] text-[#4B55C8]",
    [PostCategory.REVIEW]: "bg-[#DDF9F4] text-sub-700",
    [PostCategory.MARKET_INFO]: "bg-[rgba(125,180,255,0.16)] text-[#2F6BD8]",
    [PostCategory.SUPPORT_QNA]: "bg-[rgba(255,181,71,0.16)] text-[#B86B00]",
    [PostCategory.FREE]: "bg-surface text-ink-500",
};

interface PostCategoryBadgeProps {
    category: PostCategory;
    size?: "sm" | "md"; // sm: 목록(14px) / md: 상세(15px)
}

// 분류 배지 (목록 · 상세 공용)
export default function PostCategoryBadge({category, size = "sm"}: PostCategoryBadgeProps) {
    return (
        <span className={`inline-block whitespace-nowrap rounded-full px-2.75 py-1 font-bold ${size === "sm" ? "text-sm" : "text-[15px]"} ${badgeStyle[category]}`}>
            {PostCategoryLabel[category]}
        </span>
    );
}
