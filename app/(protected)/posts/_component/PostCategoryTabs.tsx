import { PostCategory, PostCategoryLabel, PostWritableCategories } from "@/enums/post.enum";

interface PostCategoryTabsProps {
    category?: PostCategory; // undefined = 전체
    onCategoryClick: (category?: PostCategory) => void;
}

// 탭 목록: 전체 + 일반 분류 4개 (공지는 탭 없이 목록 맨 위에 표시)
const tabs: { label: string; value?: PostCategory }[] = [
    { label: "전체", value: undefined },
    ...PostWritableCategories.map((c) => ({ label: PostCategoryLabel[c], value: c })),
];

// 분류 탭 (전체 / 창업 후기 / 상권 정보 / 지원사업 Q&A / 자유)
export default function PostCategoryTabs({category, onCategoryClick}: PostCategoryTabsProps) {
    return (
        <div className="flex flex-wrap items-center gap-2.25">
            {tabs.map((tab) => {
                const isActive = tab.value === category;
                return (
                    <button
                        key={tab.label}
                        type="button"
                        onClick={() => onCategoryClick(tab.value)}
                        className={`rounded-full px-4.5 py-2.5 text-base ${
                            isActive
                                ? "bg-main-dark font-bold text-white"
                                : "border border-line bg-white font-medium text-ink-500"
                        }`}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
