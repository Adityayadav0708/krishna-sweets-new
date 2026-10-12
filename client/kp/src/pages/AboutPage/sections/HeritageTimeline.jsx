import { Container } from '@/components/layout/Container/Container';
import styles from '../AboutPage.module.css';

const timeline = [
  { year: '1946', title: 'A sweet house begins', copy: 'Krishna Sweets starts serving handmade mithai in Chhibramau with recipes built around purity, patience and festive generosity.' },
  { year: '1970s', title: 'Family recipes grow', copy: 'Classic barfis, ladoos and syrup sweets become favourites for local celebrations across Kannauj district.' },
  { year: 'Today', title: 'Still family-first', copy: 'The same spirit guides daily batches, gifting orders and simple WhatsApp checkout for modern customers.' },
];

export function HeritageTimeline() {
  return (
    <section className={styles.timelineSection}>
      <Container className={styles.timelineGrid}>
        {timeline.map((item) => (
          <article className={styles.timelineItem} key={item.year}>
            <strong>{item.year}</strong>
            <div><h2>{item.title}</h2><p>{item.copy}</p></div>
          </article>
        ))}
      </Container>
    </section>
  );
}
