import { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";

import { IBMPlexSansKR, outfit, notoSansKR, jetbrainsMono } from "@/styles/font/font";
import { cn } from "@/lib/utils";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import HeaderSwitch from "@/components/common/HeaderSwitch";
import Footer from "@/components/common/Footer";
import SmoothScroll from "@/components/common/SmoothScroll";
import AuthHydration from "@/components/auth/AuthHydration";


export const metadata: Metadata = {
  title: "Startfit",
  description: "AI 기반 창업 분석 서비스 스타트핏",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
   <html lang="en" className={cn(IBMPlexSansKR.variable, outfit.variable, notoSansKR.variable, jetbrainsMono.variable, "font-sans")}>
      <body>
        <SmoothScroll>
          <ReactQueryProvider>
            <AuthHydration/>
            <Suspense fallback={null}>
              <HeaderSwitch/>
            </Suspense>
            {children}
            <Footer/>
          </ReactQueryProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}