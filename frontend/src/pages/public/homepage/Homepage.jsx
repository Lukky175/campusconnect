import PublicLayout from "../../../components/layout/PublicLayout";
import Hero from "./Hero";
import PlatformIntro from "./PlatformIntro";
import HowItWorks from "./HowItWorks";
import Audience from "./Audience";
import HomeCTA from "./HomeCTA";

export default function HomePage() {
  return (
    <PublicLayout>
      <Hero />
      <PlatformIntro />
      <HowItWorks />
      <Audience />
      <HomeCTA />
    </PublicLayout>
  );
}