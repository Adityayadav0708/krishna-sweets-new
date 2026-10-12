import { Gift, MessageCircle, Quote, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/layout/Container/Container';
import styles from '../ReviewsPage.module.css';

const trustBadges = [
  { icon: ShieldCheck, label: 'Freshness checked before packing' },
  { icon: Gift, label: 'Premium boxes for gifting' },
  { icon: MessageCircle, label: 'Fast WhatsApp order support' },
];

export function FeaturedTestimonial() {
  return (
    <section className={styles.featuredSection}>
      <Container className={styles.featuredGrid}>
        <article className={styles.featuredCard}>
          <Quote size={34} strokeWidth={1.3} />
          <p>
            &ldquo;For our Diwali family hampers, Krishna Sweets helped us choose a balanced mix
            of kaju katli, motichoor ladoo and Bengali sweets. The boxes felt special, the
            sweets were fresh, and every guest asked where we ordered from.&rdquo;
          </p>
          <footer><strong>Neha Agarwal</strong><span>Festival gifting customer</span></footer>
        </article>
        <div className={styles.trustPanel}>
          <span className={styles.eyebrow}>Why customers trust us</span>
          <h2>Care you can feel before the first bite.</h2>
          <div className={styles.badgeList}>
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label}><Icon size={19} strokeWidth={1.6} /><span>{label}</span></div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
