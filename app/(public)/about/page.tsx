import AboutHero from "./_components/hero/AboutHero";
import AboutTarget from "./_components/target/AboutTarget";
import AboutAnalysis from "./_components/AboutAnalysis";
import AboutAnalysisInput from "./_components/input/AboutAnalysisInput";
import AboutSituation from "./_components/situation/AboutSituation";
import AboutReport from "./_components/AboutReport";
import AboutSupport from "./_components/support/AboutSupport";
import AboutCTA from "./_components/AboutCTA";

// 화면 너비별 축소 비율 (디자인 기준 1920px)
const FIT =
    "min-[1680px]:max-[1919px]:[zoom:0.875] " +   // 1680~1919
    "min-[1536px]:max-[1679px]:[zoom:0.8] " +     // 1536~1679
    "min-[1440px]:max-[1535px]:[zoom:0.75] " +    // 1440~1535 (일반 노트북)
    "min-[1280px]:max-[1439px]:[zoom:0.667] " +   // 1280~1439
    "max-[1279px]:[zoom:0.6]";                    // 그보다 작은 화면

export default function AboutPage() {
    return (
        // Header 높이만큼 띄우기 (축소 영향을 받지 않게 바깥에)
        <div className="pt-[72px] overflow-x-hidden">
            <div className={FIT}>
                <AboutHero />
                <AboutTarget />
                <AboutAnalysis />
                <AboutAnalysisInput />
                <AboutSituation />
                <AboutReport />
                <AboutSupport />
                <AboutCTA />
            </div>
        </div>
    );
}