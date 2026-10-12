import { useCart } from '@/cart/useCart';
import { Header } from '@/components/layout/Header/Header';
import { FaqAccordion } from './sections/FaqAccordion';
import { FaqHero } from './sections/FaqHero';

export function FaqPage() {
  const { openCart, totalCount } = useCart();

  return (
    <div id="top">
      <Header cartCount={totalCount} onCartOpen={openCart} />
      <main>
        <FaqHero />
        <FaqAccordion />
      </main>
    </div>
  );
}
