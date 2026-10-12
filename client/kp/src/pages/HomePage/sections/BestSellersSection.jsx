import { Gift } from 'lucide-react';
import { Container } from '@/components/layout/Container/Container';
import { ProductCard } from '@/components/product/ProductCard/ProductCard';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { products } from '@/data/products';
import styles from '../HomePage.module.css';

export function BestSellersSection({ items, totalCount, onAdd }) {
  return (
    <section className={styles.bestSection} id="best-sellers">
      <Container>
        <SectionHeading
          eyebrow="Most loved"
          title="The ones families return for."
          body="Four signatures, perfected over decades and made fresh for today."
          align="center"
        />
        <div className={styles.productGrid}>
          {products.map((product) => (
            <ProductCard
              product={product}
              added={items.some((item) => item.productId === product.id)}
              onAdd={onAdd}
              key={product.id}
            />
          ))}
        </div>
        <div className={styles.bagNote} aria-live="polite">
          {totalCount > 0 && (
            <>
              <Gift size={17} /> {totalCount} {totalCount === 1 ? 'sweet' : 'sweets'} saved
              to your order bag. Checkout on WhatsApp when you are ready.
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
