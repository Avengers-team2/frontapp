
import { Metadata } from "next";
import "./globals.css";
import "@/styles/tailwind/tailwind.theme.css";

import { IBMPlexSansKR, outfit } from "@/styles/font/font";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

export const metadata: Metadata = {
  title: "StartFit",
  description: "데이터 기반 창업 분석 및 지원사업 매칭 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${IBMPlexSansKR.variable} ${outfit.variable}`}
    >
      <body className="font-ibm">
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
