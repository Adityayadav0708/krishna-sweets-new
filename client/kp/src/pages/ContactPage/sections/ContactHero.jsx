import { Clock3, MapPin } from 'lucide-react';
import { Container } from '@/components/layout/Container/Container';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { business } from '@/data/site';
import styles from '../ContactPage.module.css';

export function ContactHero() {
  return (
    <section className={styles.hero}>
      <Container className={styles.heroInner}>
        <SectionHeading
          eyebrow="Contact"
          title="Visit, call, or order on WhatsApp."
          body="For daily sweets, gifting, bulk orders and delivery questions, reach Krishna Sweets directly."
        />
        <div className={styles.locationCard}>
          <MapPin size={22} />
          <h2>{business.address}</h2>
          <p><Clock3 size={16} /> {business.hours}</p>
        </div>
      </Container>
    </section>
  );
}
