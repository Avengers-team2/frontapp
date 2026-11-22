import AboutHero from "./_components/hero/AboutHero";
import AboutAnalysis from "./_components/AboutAnalysis";
import AboutTarget from "./_components/target/AboutTarget";
import AboutAnalysisInput from "./_components/input/AboutAnalysisInput";
import AboutSituation from "./_components/situation/AboutSituation";
import AboutReport from "./_components/AboutReport";
import AboutSupport from "./_components/support/AboutSupport";
import AboutCTA from "./_components/AboutCTA";

export default function AboutPage() {
    return (
        <>
            <AboutHero />
            <AboutTarget />
            <AboutAnalysis />
            <AboutAnalysisInput />
            <AboutSituation />
            <AboutReport />
            <AboutSupport />
            <AboutCTA />
        </>
    );
}