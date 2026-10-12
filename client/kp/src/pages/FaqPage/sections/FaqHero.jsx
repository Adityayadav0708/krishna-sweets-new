import { MessageCircle } from 'lucide-react';
import { Container } from '@/components/layout/Container/Container';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { business } from '@/data/site';
import styles from '../FaqPage.module.css';

export function FaqHero() {
  return (
    <section className={styles.hero}>
      <Container className={styles.heroInner}>
        <SectionHeading
          eyebrow="Questions"
          title="Helpful answers before you order."
          body="A quick guide to WhatsApp ordering, storage, freshness and delivery for Krishna Sweets."
        />
        <a className={styles.whatsapp} href={`https://wa.me/${business.whatsapp}`} target="_blank" rel="noreferrer">
          <MessageCircle size={18} /> Ask on WhatsApp
        </a>
      </Container>
    </section>
  );
}
