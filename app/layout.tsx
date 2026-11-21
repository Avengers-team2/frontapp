import { Metadata } from "next";
import "./globals.css";
import "@/styles/tailwind/tailwind.theme.css"

import { IBMPlexSansKR, outfit, notoSansKR } from "@/styles/font/font";
import { cn } from "@/lib/utils";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import HeaderSwitch from "@/components/common/HeaderSwitch";
import Footer from "@/components/common/Footer";
import SmoothScroll from "@/components/common/SmoothScroll";
import AuthHydration from "@/components/auth/AuthHydration";


export const metadata: Metadata = {
  title: "Next Project",
  description: "재밌게 공부하는 Next 16!",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn(IBMPlexSansKR.variable, outfit.variable, notoSansKR.variable, "font-sans")}>
      <body>
        <SmoothScroll>
          <ReactQueryProvider>
            <AuthHydration/>
            <HeaderSwitch/>
            {children}
            <Footer/>
          </ReactQueryProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}