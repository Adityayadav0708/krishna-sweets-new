import { Clock3, Leaf, ShieldCheck, Truck } from 'lucide-react';
import { Container } from '@/components/layout/Container/Container';
import styles from '../HomePage.module.css';

const promises = [
  { icon: Leaf, title: 'Pure ingredients', copy: 'No shortcuts, ever' },
  { icon: Clock3, title: 'Made fresh daily', copy: 'Small morning batches' },
  { icon: ShieldCheck, title: 'Trusted since 1946', copy: 'Three generations of craft' },
  { icon: Truck, title: 'Thoughtful delivery', copy: 'Packed to arrive beautifully' },
];

export function PromiseBar() {
  return (
    <section className={styles.promiseBar} aria-label="Our promises">
      <Container className={styles.promiseGrid}>
        {promises.map(({ icon: Icon, title, copy }) => (
          <div className={styles.promise} key={title}>
            <Icon size={21} strokeWidth={1.6} />
            <span><strong>{title}</strong><small>{copy}</small></span>
          </div>
        ))}
      </Container>
    </section>
  );
}
