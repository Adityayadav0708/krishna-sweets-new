import { Award } from 'lucide-react';
import { Container } from '@/components/layout/Container/Container';
import { heroImage } from '@/data/products';
import styles from '../HomePage.module.css';

export function HeritageSection() {
  return (
    <section className={styles.heritageSection} id="heritage">
      <Container className={styles.heritageGrid}>
        <div className={styles.heritageImage}>
          <img src={heroImage} alt="An assortment of traditional Indian sweets ready to share" loading="lazy" />
          <span><Award size={20} /><strong>80 years</strong> of trusted craft</span>
        </div>
        <div className={styles.heritageCopy}>
          <span className={styles.eyebrow}>Our story, since 1946</span>
          <h2>Some recipes are written.<br /><em>Ours are remembered.</em></h2>
          <p>
            Krishna Sweets began with one karigar, a copper kadai and a promise to never
            compromise on purity. Today, that promise still guides every batch—from the first
            turn of the ladle to the final ribbon on the box.
          </p>
          <div className={styles.heritageStats}>
            <span><strong>3</strong> generations</span>
            <span><strong>40+</strong> daily creations</span>
            <span><strong>100%</strong> vegetarian</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
