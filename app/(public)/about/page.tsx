import AboutHero from "./_components/hero/AboutHero";
import AboutTarget from "./_components/target/AboutTarget";
import AboutAnalysis from "./_components/AboutAnalysis";
import AboutAnalysisInput from "./_components/input/AboutAnalysisInput";
import AboutSituation from "./_components/situation/AboutSituation";
import AboutReport from "./_components/AboutReport";
import AboutSupport from "./_components/support/AboutSupport";
import AboutCTA from "./_components/AboutCTA";

export default function AboutPage() {
    return (
        // 첫 화면 배경이 헤더 뒤까지 올라가므로 위 여백을 두지 않는다
        <div className="overflow-x-hidden">
            <AboutHero />
            <AboutTarget />
            <AboutAnalysis />
            <AboutAnalysisInput />
            <AboutSituation />
            <AboutReport />
            <AboutSupport />
            <AboutCTA />
        </div>
    );
}