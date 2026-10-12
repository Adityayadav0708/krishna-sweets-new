import { Clock3 } from 'lucide-react';
import { Container } from '@/components/layout/Container/Container';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import styles from '../AboutPage.module.css';

export function BrandStorySection() {
  return (
    <section className={styles.storySection}>
      <Container className={styles.storyGrid}>
        <SectionHeading
          eyebrow="Our story"
          title="Some recipes are taught by hand."
          body="From the first batch to today's festive orders, the work has stayed personal: slow cooking, careful finishing and sweets packed for families to share."
        />
        <div className={styles.storyCard}>
          <Clock3 size={22} />
          <h2>Heritage craft, modern convenience.</h2>
          <p>
            We keep the ordering simple and the making thoughtful. Choose your sweets online,
            confirm on WhatsApp, and receive the same familiar care families have expected
            from Krishna Sweets for decades.
          </p>
        </div>
      </Container>
    </section>
  );
}
