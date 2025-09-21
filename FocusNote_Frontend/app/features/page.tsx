import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeaturesHero } from "@/components/features/FeaturesHero";
import { DetailedFeatures } from "../../components/features/DetailedFeatures";
import { WhyChoose } from "../../components/features/WhyChoose";
import { ComparisonSection } from "../../components/features/ComparisonSection";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <FeaturesHero />
        <DetailedFeatures />
        <WhyChoose />
        <ComparisonSection />
      </main>
      <Footer />
    </div>
  );
}