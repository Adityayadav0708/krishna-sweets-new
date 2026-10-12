import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { Container } from '@/components/layout/Container/Container';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { categories } from '@/data/products';
import styles from '../HomePage.module.css';

export function CategoriesSection() {
  return (
    <section className={styles.categoriesSection} id="categories">
      <Container>
        <div className={styles.sectionTop}>
          <SectionHeading
            eyebrow="Find your favourite"
            title="A sweet for every kind of joy."
            body="From time-honoured classics to celebration-ready boxes, each collection is made with its own rhythm and ritual."
          />
          <Link to={ROUTES.products}>View every collection <ArrowRight size={16} /></Link>
        </div>
        <div className={styles.categoryGrid}>
          {categories.map((category, index) => (
            <Link className={styles.categoryCard} to={ROUTES.products} key={category.name}>
              <img src={category.image} alt="" loading="lazy" />
              <div className={styles.categoryShade} />
              <span className={styles.categoryIndex}>0{index + 1}</span>
              <div>
                <small>{category.count} varieties</small>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <i><ArrowRight size={17} /></i>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
