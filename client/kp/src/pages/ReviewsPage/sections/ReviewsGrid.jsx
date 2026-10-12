import { Quote, Star } from 'lucide-react';
import { Container } from '@/components/layout/Container/Container';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import styles from '../ReviewsPage.module.css';

const reviews = [
  { name: 'Anjali Mishra', occasion: 'Diwali gifting', rating: 5, text: 'The kaju katli reached fresh, neat and beautifully packed. It tasted like the sweets my family remembers from childhood.' },
  { name: 'Rohit Gupta', occasion: 'Family function', rating: 5, text: 'The motichoor ladoo had the right ghee aroma and soft texture. Ordering on WhatsApp was simple and quick.' },
  { name: 'Pooja Tiwari', occasion: 'Weekend order', rating: 5, text: 'Fresh rasgulla, polite service and clear storage guidance. This is now our regular mithai shop in Chhibramau.' },
  { name: 'Sandeep Verma', occasion: 'Wedding trays', rating: 5, text: 'The gift boxes looked premium and every piece tasted fresh. The team helped us select sweets that travelled well.' },
];

export function ReviewsGrid() {
  return (
    <section className={styles.reviewsSection}>
      <Container>
        <SectionHeading
          eyebrow="What customers say"
          title="Freshness, packing and familiar taste."
          body="Simple feedback from families who order our sweets for celebrations and weekly cravings."
          align="center"
        />
        <div className={styles.reviewGrid}>
          {reviews.map((review) => (
            <article className={styles.reviewCard} key={review.name}>
              <Quote size={28} strokeWidth={1.4} />
              <div className={styles.stars} aria-label={`${review.rating} out of 5 stars`}>
                {Array.from({ length: review.rating }).map((_, index) => (
                  <Star size={16} fill="currentColor" key={index} />
                ))}
              </div>
              <p>{review.text}</p>
              <footer><strong>{review.name}</strong><span>{review.occasion}</span></footer>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
