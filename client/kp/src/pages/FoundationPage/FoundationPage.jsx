import { ArrowUpRight, BadgeCheck, Gift, Leaf, Sparkles } from 'lucide-react';
import { BrandMark } from '@/components/brand/BrandMark/BrandMark';
import { Container } from '@/components/layout/Container/Container';
import { Button } from '@/components/ui/Button/Button';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { business } from '@/data/site';
import styles from './FoundationPage.module.css';
const palette = [
    { name: 'Heritage Maroon', hex: '#641322', className: styles.maroon },
    { name: 'Antique Gold', hex: '#BD8D32', className: styles.gold },
    { name: 'Warm Ivory', hex: '#FAF4E7', className: styles.ivory },
    { name: 'Pistachio', hex: '#829260', className: styles.pistachio },
];
const values = [
    { icon: BadgeCheck, title: 'Heritage', copy: 'A visual language with the quiet confidence of a house established in 1946.' },
    { icon: Leaf, title: 'Freshness', copy: 'Natural, generous tones that let every future sweet feel vivid and freshly made.' },
    { icon: Gift, title: 'Celebration', copy: 'Gold accents and refined details shaped for gifting, festivals and family rituals.' },
];
export function FoundationPage() {
    return (<main className={styles.page}>
      <section className={styles.hero}>
        <Container className={styles.heroInner}>
          <div className={styles.heroTop}>
            <BrandMark light/>
            <span className={styles.checkpoint}>Brand foundation · 01</span>
          </div>

          <div className={styles.heroCopy}>
            <span className={styles.kicker}><Sparkles size={15}/> The Krishna standard</span>
            <h1>Sweetness, made<br /><em>timeless.</em></h1>
            <p>
              A warm, unmistakably Indian design system for a mithai house built on craft,
              hospitality and seven decades of trust.
            </p>
            <div className={styles.heroActions}>
              <Button onClick={() => document.getElementById('foundation')?.scrollIntoView({ behavior: 'smooth' })}>
                Explore the visual language <ArrowUpRight size={17}/>
              </Button>
              <span>Premium by restraint.<br />Memorable by detail.</span>
            </div>
          </div>

          <div className={styles.yearStamp} aria-label={`Established ${business.founded}`}>
            <span>ESTD.</span>
            <strong>{business.founded}</strong>
            <small>Kannauj</small>
          </div>
        </Container>
      </section>

      <section className={styles.foundation} id="foundation">
        <Container>
          <SectionHeading eyebrow="The foundation" title="A palette with warmth in its bones." body="Creamy ivory carries the hospitality. Maroon holds the heritage. Antique gold brings ceremony, while pistachio keeps the system fresh and distinctly culinary."/>

          <div className={styles.paletteGrid}>
            {palette.map((color, index) => (<article className={styles.colorCard} key={color.name}>
                <div className={`${styles.swatch} ${color.className}`}>
                  <span>0{index + 1}</span>
                </div>
                <div>
                  <h3>{color.name}</h3>
                  <p>{color.hex}</p>
                </div>
              </article>))}
          </div>
        </Container>
      </section>

      <section className={styles.typeSection}>
        <Container className={styles.typeGrid}>
          <div>
            <SectionHeading eyebrow="Typography" title="Old-world grace. Modern clarity." body="Cormorant Garamond gives the brand its expressive, editorial voice. Manrope keeps product details, filters and ordering beautifully clear."/>
            <div className={styles.alphabet}>Aa Bb Cc <em>1946</em></div>
          </div>
          <blockquote>
            “Every celebration<br />begins with something <em>sweet.</em>”
            <footer>— A Krishna family tradition</footer>
          </blockquote>
        </Container>
      </section>

      <section className={styles.valuesSection}>
        <Container>
          <SectionHeading eyebrow="Design principles" title="Made to feel as considered as the mithai." align="center"/>
          <div className={styles.valuesGrid}>
            {values.map(({ icon: Icon, title, copy }) => (<article className={styles.valueCard} key={title}>
                <span><Icon size={22} strokeWidth={1.6}/></span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>))}
          </div>
        </Container>
      </section>

      <footer className={styles.footer}>
        <Container>
          <BrandMark />
          <p>Foundation complete. Built to scale from a single ladoo to every festive collection.</p>
        </Container>
      </footer>
    </main>);
}
