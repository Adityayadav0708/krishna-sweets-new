import { Container } from '@/components/layout/Container/Container';
import styles from '../ReviewsPage.module.css';

const stats = [
  { value: '4.9/5', label: 'average customer rating' },
  { value: '80', label: 'years of trusted craft' },
  { value: '100%', label: 'vegetarian sweets' },
];

export function TrustStats() {
  return (
    <section className={styles.statsSection}>
      <Container className={styles.statsGrid}>
        {stats.map((stat) => (
          <div className={styles.stat} key={stat.label}>
            <strong>{stat.value}</strong><span>{stat.label}</span>
          </div>
        ))}
      </Container>
    </section>
  );
}
