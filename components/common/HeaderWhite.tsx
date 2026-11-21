
import Image from "next/image";
import Link from "next/link";
import logoDark from "@/public/assets/images/header/logo.svg"
import HeaderAuth from "@/components/auth/HeaderAuth";

export default function HeaderWhite() {
    return (
        <header className="fixed top-0 flex justify-center items-center w-full h-24 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] px-[5%] z-10 font-[var(--font-noto-sans-kr)]">
            <div className="relative flex justify-between items-center h-24 w-full max-w-[1440px]">
                <Link href="/">
                    <Image src={logoDark} alt="" />
                </Link>

                <ul className="absolute left-1/2 -translate-x-1/2 flex gap-[30px] text-[#3D4A5C] font-semibold">
                    <li><Link href="/about" className="transition-colors hover:text-[#5EF0DC]">서비스 소개</Link></li>
                    <li><Link href="/analysis" className="transition-colors hover:text-[#5EF0DC]">상권 분석</Link></li>
                    <li><Link href="/support" className="transition-colors hover:text-[#5EF0DC]">지원사업</Link></li>
                    <li><Link href="/report-job" className="transition-colors hover:text-[#5EF0DC]">기획서 AI 분석</Link></li>
                    <li><Link href="/posts" className="transition-colors hover:text-[#5EF0DC]">게시판</Link></li>
                </ul>

                <HeaderAuth variant="white" />
            </div>
        </header>
    );
}
