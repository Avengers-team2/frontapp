import Link from "next/link";
import Image from "next/image";
import logoDark from "@/public/assets/images/header/logo.svg"
import logoWhite from "@/public/assets/images/header/logo-w.svg"

export default function Footer() {
    return (
        <footer className="flex justify-center bg-linear-to-b from-[#0E1A2E] to-[#07101F] h-95 px-[5%]">
            <div className="relative flex justify-between pt-10 pb-[60px] max-w-[1440px] w-full">
                <Link href="/">
                    <Image src={logoWhite} alt="StartFit 홈" />
                    <p className="text-[#ACBBD0] pt-5">창업, 데이터로 먼저 확인하세요.</p>
                </Link>

                <ul className="flex gap-25 text-white">
                    <li>
                        <p className="text-[17px] font-semibold text-[#5EF0DC] mb-5">서비스</p>
                        <ul className="flex flex-col gap-2 text-[#ACBBD0]">
                            <li><Link href="/about">서비스 소개</Link></li>
                            <li><Link href="/analysis">상권 분석</Link></li>
                            <li><Link href="/support">지원사업 매칭</Link></li>
                            <li><Link href="/report-job">기획서 AI 분석</Link></li>
                            <li><Link href="/posts">커뮤니티</Link></li>
                        </ul>
                    </li>
                    <li>
                        <p className="text-[17px] font-semibold text-[#5EF0DC] mb-5">데이터 출처</p>
                        <ul className="flex flex-col gap-2 text-[#ACBBD0]">
                            <li><a href="https://www.semas.or.kr" target="_blank" rel="noopener noreferrer">소상공인시장진흥공단</a></li>
                            <li><a href="https://golmok.seoul.go.kr" target="_blank" rel="noopener noreferrer">서울시 상권분석서비스</a></li>
                            <li><a href="https://www.reb.or.kr" target="_blank" rel="noopener noreferrer">한국부동산원</a></li>
                        </ul>
                    </li>
                    <li>
                        <p className="text-[17px] font-semibold text-[#5EF0DC] mb-5">안내</p>
                        <p className="flex flex-col gap-2 text-[#ACBBD0]">데이터 기준일 2026.10</p>
                    </li>
                </ul>

                <span className="pointer-events-none absolute left-0 bottom-[30px] block select-none text-[220px] leading-none text-white opacity-20 font-outfit font-bold [mask-image:linear-gradient(to_right,#000_35%,rgba(0,0,0,.4))]">
                    Start 
                    <span className="text-[#5EF0DC]">Fit</span>
                </span>
            </div>
        </footer>
    );
}