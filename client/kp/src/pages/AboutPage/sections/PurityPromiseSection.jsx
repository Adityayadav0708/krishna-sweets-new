import { Flame, Leaf, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/layout/Container/Container';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import styles from '../AboutPage.module.css';

const promises = [
  { icon: Leaf, title: 'Pure ingredients', copy: 'Vegetarian mithai made with careful sourcing and no needless shortcuts.' },
  { icon: Flame, title: 'Small-batch craft', copy: 'Recipes are prepared in measured batches so texture and aroma stay consistent.' },
  { icon: ShieldCheck, title: 'Trusted packing', copy: 'Orders are packed with shelf life, storage and travel in mind.' },
];

export function PurityPromiseSection() {
  return (
    <section className={styles.promiseSection}>
      <Container>
        <SectionHeading eyebrow="What guides us" title="Quiet standards, every day." align="center" />
        <div className={styles.promiseGrid}>
          {promises.map(({ icon: Icon, title, copy }) => (
            <article className={styles.promiseCard} key={title}>
              <span><Icon size={22} strokeWidth={1.6} /></span>
              <h2>{title}</h2>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
