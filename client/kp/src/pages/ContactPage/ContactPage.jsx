import { useCart } from '@/cart/useCart';
import { Header } from '@/components/layout/Header/Header';
import { ContactDetailsSection } from './sections/ContactDetailsSection';
import { ContactHero } from './sections/ContactHero';
import { MapSection } from './sections/MapSection';

export function ContactPage() {
  const { openCart, totalCount } = useCart();

  return (
    <div id="top">
      <Header cartCount={totalCount} onCartOpen={openCart} />
      <main>
        <ContactHero />
        <ContactDetailsSection />
        <MapSection />
      </main>
    </div>
  );
}
