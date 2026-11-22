import { ReactNode } from "react";

interface PostsLayoutProps {
    children: ReactNode;
}

export default function PostsLayout({children}: PostsLayoutProps) {
    return (
        <div className="min-h-screen bg-white">
            {children}
        </div>
    );
}
