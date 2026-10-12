import { Award, MapPin } from 'lucide-react';
import { Container } from '@/components/layout/Container/Container';
import { heroImage } from '@/data/products';
import { business } from '@/data/site';
import styles from '../AboutPage.module.css';

export function AboutHero() {
  return (
    <section className={styles.hero}>
      <Container className={styles.heroGrid}>
        <div className={styles.heroImage}>
          <img src={heroImage} alt="Assorted traditional Indian sweets prepared for sharing" />
          <span><MapPin size={18} /> {business.address}</span>
        </div>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><Award size={15} /> Since {business.founded}</span>
          <h1>Rooted in Chhibramau, remembered by taste.</h1>
          <p>
            Krishna Sweets is a heritage mithai house from Kannauj district, built on the
            simple promise that every celebration deserves sweets made with care, patience
            and honest ingredients.
          </p>
          <div className={styles.statRow}>
            <span><strong>80</strong> years</span>
            <span><strong>3</strong> generations</span>
            <span><strong>100%</strong> vegetarian</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
