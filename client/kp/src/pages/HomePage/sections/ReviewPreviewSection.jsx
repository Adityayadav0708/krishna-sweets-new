import { ArrowRight, Quote, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { Container } from '@/components/layout/Container/Container';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import styles from '../HomePage.module.css';

const review = {
  name: 'Neha Agarwal',
  occasion: 'Festival gifting customer',
  text: 'The boxes felt premium, the sweets were fresh, and every guest asked where we ordered from.',
};

export function ReviewPreviewSection() {
  return (
    <section className={styles.reviewPreviewSection} aria-label="Customer review preview">
      <Container className={styles.reviewPreviewGrid}>
        <div className={styles.reviewPreviewCopy}>
          <SectionHeading
            eyebrow="Customer love"
            title="Trusted for gifting, rituals and everyday mithai."
            body="Families choose Krishna Sweets for careful packing, fresh batches and the familiar taste of celebration."
          />
          <Link className={styles.reviewLink} to={ROUTES.reviews}>
            Read more reviews <ArrowRight size={16} />
          </Link>
        </div>
        <article className={styles.reviewPreviewCard}>
          <Quote size={30} strokeWidth={1.35} />
          <div className={styles.previewStars} aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star size={16} fill="currentColor" key={index} />
            ))}
          </div>
          <p>&ldquo;{review.text}&rdquo;</p>
          <footer><strong>{review.name}</strong><span>{review.occasion}</span></footer>
        </article>
      </Container>
    </section>
  );
}
