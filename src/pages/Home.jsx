import { HeroSection } from "../components/home/HeroSection";
import { StatsRow } from "../components/home/StatsRow";
import { FeaturesGrid } from "../components/home/FeaturesGrid";
import { BottomCTA } from "../components/home/BottomCTA";
import { AnimatedPage } from "../components/shared/AnimatedPage";

export default function Home() {
  return (
    <AnimatedPage>
      <HeroSection />
      <StatsRow />
      <FeaturesGrid />
      <BottomCTA />
    </AnimatedPage>
  );
}
