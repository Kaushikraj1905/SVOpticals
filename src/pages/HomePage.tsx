import HeroSection from '../components/home/HeroSection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import BrandShowcase from '../components/home/BrandShowcase';
import ServicesSection from '../components/home/ServicesSection';
import WhyChooseUs from '../components/home/WhyChooseUs';
import VirtualTryOnCTA from '../components/home/VirtualTryOnCTA';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <VirtualTryOnCTA />
      <ServicesSection />
      <BrandShowcase />
      <WhyChooseUs />
    </>
  );
}
