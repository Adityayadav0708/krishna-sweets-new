import { ArrowRight, Leaf, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { Container } from '@/components/layout/Container/Container';
import { heroImage } from '@/data/products';
import styles from '../HomePage.module.css';

export function HomeHero() {
  return (
    <section className={styles.hero}>
      <Container className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>
            <Sparkles size={15} /> Chhibramau&apos;s heritage mithai house
          </span>
          <h1>Tradition you can <em>taste.</em></h1>
          <p>
            Handcrafted sweets, slow-made with pure ingredients and the generous spirit of
            Indian celebration—just as they have been since 1946.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryCta} to={ROUTES.products}>
              Shop sweets <ArrowRight size={17} />
            </Link>
            <a className={styles.textCta} href="#heritage">Discover our story</a>
          </div>
          <div className={styles.trustRow}>
            <span className={styles.avatars} aria-hidden="true">
              <i>KS</i><i>80</i><i>★</i>
            </span>
            <p><strong>4.9 out of 5</strong><br />Loved by generations of families</p>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.heroImageWrap}>
            <img src={heroImage} alt="An abundant tray of colourful traditional Indian mithai" />
          </div>
          <div className={styles.freshCard}>
            <Leaf size={18} />
            <span><strong>Made this morning</strong>Small batches, every day</span>
          </div>
          <div className={styles.heritageSeal}>
            <small>ESTD.</small><strong>1946</strong><span>KANNAUJ</span>
          </div>
          <div className={styles.heroCaption}>
            <span>Featured collection</span><strong>House Classics</strong>
          </div>
        </div>
      </Container>
    </section>
  );
}
