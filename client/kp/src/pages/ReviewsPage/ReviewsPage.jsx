import { useCart } from '@/cart/useCart';
import { Header } from '@/components/layout/Header/Header';
import { FeaturedTestimonial } from './sections/FeaturedTestimonial';
import { ReviewsGrid } from './sections/ReviewsGrid';
import { ReviewsHero } from './sections/ReviewsHero';
import { TrustStats } from './sections/TrustStats';

export function ReviewsPage() {
  const { openCart, totalCount } = useCart();

  return (
    <div id="top">
      <Header cartCount={totalCount} onCartOpen={openCart} />
      <main>
        <ReviewsHero />
        <TrustStats />
        <FeaturedTestimonial />
        <ReviewsGrid />
      </main>
    </div>
  );
}
