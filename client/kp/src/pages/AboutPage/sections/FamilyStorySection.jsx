import { HeartHandshake, Sparkles } from 'lucide-react';
import { Container } from '@/components/layout/Container/Container';
import styles from '../AboutPage.module.css';

const craftNotes = [
  'Copper kadai-style slow cooking for depth of flavour',
  'Fresh batches planned around daily demand and gifting orders',
  'Taste, texture and packing checked before every order leaves',
];

export function FamilyStorySection() {
  return (
    <section className={styles.familySection}>
      <Container className={styles.familyGrid}>
        <div className={styles.familyCopy}>
          <span className={styles.eyebrow}><HeartHandshake size={15} /> Founder & family</span>
          <h2>Built like a family promise, not a factory routine.</h2>
          <p>
            This demo profile reserves space for the real founder name and family photograph
            at launch. The story is written to reflect a heritage mithai shop: recipes passed
            from senior karigars to the next generation, ingredients checked by hand, and
            every box finished with the care expected for a guest at home.
          </p>
          <div className={styles.craftList} aria-label="Craft standards">
            {craftNotes.map((note) => (
              <span key={note}><Sparkles size={15} /> {note}</span>
            ))}
          </div>
        </div>
        <aside className={styles.founderCard} aria-label="Founder story placeholder">
          <div className={styles.founderSeal}>KS</div>
          <span>Founder story placeholder</span>
          <h3>Replace with the real family photograph and founder name before launch.</h3>
          <p>
            Add a short authentic note from the current owner here: what Krishna Sweets means
            to Chhibramau families, which recipes are most treasured, and how the shop keeps
            its 1946 promise alive today.
          </p>
        </aside>
      </Container>
    </section>
  );
}
