
import Image from "next/image";
import Link from "next/link";
import logoDark from "@/public/assets/images/header/logo.svg"
import logoWhite from "@/public/assets/images/header/logo-w.svg"
import HeaderAuth from "@/components/auth/HeaderAuth";

export default function Header() {
    return (
        <header className="fixed top-0 flex justify-center items-center w-full h-24 bg-[rgba(5,11,23,0.45)] backdrop-blur-md backdrop-saturate-150 border-b border-white/10 px-[5%] z-10">
            <div className="relative flex justify-between items-center h-24 w-full max-w-[1440px]">
                <Link href="/">
                    <Image src={logoWhite} alt="" />
                </Link>

                <ul className="absolute left-1/2 -translate-x-1/2 flex gap-[30px] text-white font-semibold">
                    <li><Link href="/about" className="transition-colors hover:text-[#5EF0DC]">서비스 소개</Link></li>
                    <li><Link href="/analysis" className="transition-colors hover:text-[#5EF0DC]">상권 분석</Link></li>
                    <li><Link href="/support" className="transition-colors hover:text-[#5EF0DC]">지원사업</Link></li>
                    <li><Link href="/report-job" className="transition-colors hover:text-[#5EF0DC]">기획서 AI 분석</Link></li>
                    <li><Link href="/posts" className="transition-colors hover:text-[#5EF0DC]">게시판</Link></li>
                </ul>

                <HeaderAuth variant="dark" />
            </div>
        </header>
    );
}