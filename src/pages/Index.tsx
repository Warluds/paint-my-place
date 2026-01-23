import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { CategoriesSection } from "@/components/CategoriesSection";
import { VisualizerSection } from "@/components/VisualizerSection";
import { BrandsSection } from "@/components/BrandsSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <CategoriesSection />
      <VisualizerSection />
      <BrandsSection />
      <Footer />
    </div>
  );
};

export default Index;
