import { Award, HeartHandshake } from 'lucide-react';
import { Container } from '@/components/layout/Container/Container';
import { heroImage } from '@/data/products';
import styles from '../ReviewsPage.module.css';

export function ReviewsHero() {
  return (
    <section className={styles.hero}>
      <Container className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><HeartHandshake size={15} /> Customer stories</span>
          <h1>Sweet words from families we serve.</h1>
          <p>
            Reviews from customers who trust Krishna Sweets for gifting, family rituals and
            everyday mithai from Chhibramau.
          </p>
        </div>
        <div className={styles.heroImage}>
          <img src={heroImage} alt="Traditional Indian sweets arranged for sharing" />
          <span><Award size={18} /> Loved across generations</span>
        </div>
      </Container>
    </section>
  );
}
