import { HeroSection } from '@/components/home/HeroSection';
import { RoomTypesPreview } from '@/components/home/RoomTypesPreview';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { CTASection } from '@/components/home/CTASection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <RoomTypesPreview />
      <FeaturesSection />
      <CTASection />
    </>
  );
}
