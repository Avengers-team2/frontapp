import { ReactNode } from "react";

interface PostContentProps {
    content: string;
}

// 글쓰기 서식 기호를 화면용으로 바꿔 보여주기
//   **굵게**  *기울임*  __밑줄__  [텍스트](https://주소)  줄 앞 "- " = 목록
// HTML을 그대로 넣지 않고 React 요소로 만들기 때문에 스크립트가 실행되지 않음

const INLINE_PATTERN = /(\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|\[[^\]\n]+\]\(https?:\/\/[^)\s]+\))/g;

// 한 줄 안의 굵게·기울임·밑줄·링크 처리
const renderInline = (text: string): ReactNode[] =>
    text.split(INLINE_PATTERN).map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
            return <strong key={i} className="font-bold text-ink-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("__") && part.endsWith("__") && part.length > 4) {
            return <u key={i}>{part.slice(2, -2)}</u>;
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
            return <em key={i}>{part.slice(1, -1)}</em>;
        }
        const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
        if (link) {
            return (
                <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-sub-700 underline">
                    {link[1]}
                </a>
            );
        }
        return part;
    });

// 본문 렌더링 (연속된 "- " 줄은 목록으로 묶음)
export default function PostContent({content}: PostContentProps) {
    const lines = content.split("\n");
    const blocks: ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = () => {
        if (listItems.length === 0) return;
        blocks.push(
            <ul key={`ul-${blocks.length}`} className="list-disc pl-5">
                {listItems.map((item, i) => <li key={i}>{renderInline(item)}</li>)}
            </ul>
        );
        listItems = [];
    }

    lines.forEach((line) => {
        if (line.startsWith("- ")) {
            listItems.push(line.slice(2));
            return;
        }
        flushList();
        blocks.push(
            <p key={`p-${blocks.length}`} className="min-h-7 whitespace-pre-wrap">{renderInline(line)}</p>
        );
    });
    flushList();

    return <>{blocks}</>;
}
