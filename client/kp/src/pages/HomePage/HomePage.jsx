import { useCart } from '@/cart/useCart';
import { Header } from '@/components/layout/Header/Header';
import { BestSellersSection } from './sections/BestSellersSection';
import { CategoriesSection } from './sections/CategoriesSection';
import { HeritageSection } from './sections/HeritageSection';
import { HomeHero } from './sections/HomeHero';
import { PromiseBar } from './sections/PromiseBar';
import { ReviewPreviewSection } from './sections/ReviewPreviewSection';

export function HomePage() {
  const { addItem, items, openCart, totalCount } = useCart();

  return (
    <div id="top">
      <Header cartCount={totalCount} onCartOpen={openCart} />
      <main>
        <HomeHero />
        <PromiseBar />
        <CategoriesSection />
        <BestSellersSection items={items} totalCount={totalCount} onAdd={addItem} />
        <ReviewPreviewSection />
        <HeritageSection />
      </main>
    </div>
  );
}
