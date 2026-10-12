import { useCart } from '@/cart/useCart';
import { Header } from '@/components/layout/Header/Header';
import { AboutHero } from './sections/AboutHero';
import { BrandStorySection } from './sections/BrandStorySection';
import { FamilyStorySection } from './sections/FamilyStorySection';
import { HeritageTimeline } from './sections/HeritageTimeline';
import { PurityPromiseSection } from './sections/PurityPromiseSection';

export function AboutPage() {
  const { openCart, totalCount } = useCart();

  return (
    <div id="top">
      <Header cartCount={totalCount} onCartOpen={openCart} />
      <main>
        <AboutHero />
        <BrandStorySection />
        <FamilyStorySection />
        <PurityPromiseSection />
        <HeritageTimeline />
      </main>
    </div>
  );
}
