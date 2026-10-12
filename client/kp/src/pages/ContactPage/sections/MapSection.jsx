import { MapPin, Navigation, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/layout/Container/Container';
import { business } from '@/data/site';
import styles from '../ContactPage.module.css';

const serviceNotes = [
  'Daily sweets and fresh batch availability',
  'Festival gifting and bulk order planning',
  'Local delivery confirmation across Chhibramau',
];

export function MapSection() {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.mapLabel)}`;

  return (
    <section className={styles.mapSection}>
      <Container className={styles.mapGrid}>
        <div className={styles.mapPlaceholder}>
          <div className={styles.mapPin}><MapPin size={28} /></div>
          <span>Map preview</span>
          <h2>{business.mapLabel}</h2>
          <p>
            Replace this placeholder with an embedded Google Map iframe after the final shop
            pin is verified.
          </p>
          <a href={mapUrl} target="_blank" rel="noreferrer">
            <Navigation size={17} /> Open in Google Maps
          </a>
        </div>
        <aside className={styles.visitPanel}>
          <span><ShieldCheck size={16} /> Before you visit</span>
          <h2>Message ahead for fresh batch timing.</h2>
          <ul>{serviceNotes.map((note) => <li key={note}>{note}</li>)}</ul>
        </aside>
      </Container>
    </section>
  );
}
