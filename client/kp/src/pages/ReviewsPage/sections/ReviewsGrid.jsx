import { useEffect, useState } from 'react';
import { PenLine, Quote, Star, X, Check, MessageCircle } from 'lucide-react';
import { Container } from '@/components/layout/Container/Container';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { useAuth } from '@/context/AuthContext';
import { business } from '@/data/site';
import styles from '../ReviewsPage.module.css';

const defaultReviews = [
  {
    name: 'Anjali Mishra',
    occasion: 'Diwali gifting',
    rating: 5,
    text: 'The kaju katli reached fresh, neat and beautifully packed. It tasted like the sweets my family remembers from childhood.',
  },
  {
    name: 'Rohit Gupta',
    occasion: 'Family function',
    rating: 5,
    text: 'The motichoor ladoo had the right ghee aroma and soft texture. Ordering on WhatsApp was simple and quick.',
  },
  {
    name: 'Pooja Tiwari',
    occasion: 'Weekend order',
    rating: 5,
    text: 'Fresh rasgulla, polite service and clear storage guidance. This is now our regular mithai shop in Chhibramau.',
  },
  {
    name: 'Sandeep Verma',
    occasion: 'Wedding trays',
    rating: 5,
    text: 'The gift boxes looked premium and every piece tasted fresh. The team helped us select sweets that travelled well.',
  },
];

const OCCASIONS = [
  'Diwali Gifting',
  'Family Function',
  'Weekly Sweets',
  'Wedding Trays',
  'Holi Celebration',
  'Birthday / Anniversary',
  'Puja & Prasad',
];

export function ReviewsGrid() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(defaultReviews);
  const [modalOpen, setModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ks_customer_reviews');
      if (raw) {
        const custom = JSON.parse(raw);
        if (Array.isArray(custom) && custom.length > 0) {
          setReviews([...custom, ...defaultReviews]);
        }
      }
    } catch (e) {}
  }, []);

  const handleOpenModal = () => {
    if (user?.name) setName(user.name);
    setRating(5);
    setText('');
    setSubmitted(false);
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    const newReview = {
      name: name.trim(),
      occasion,
      rating,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const raw = localStorage.getItem('ks_customer_reviews');
      const existing = raw ? JSON.parse(raw) : [];
      const updated = [newReview, ...existing];
      localStorage.setItem('ks_customer_reviews', JSON.stringify(updated));
      setReviews([newReview, ...reviews]);
    } catch (e) {
      setReviews([newReview, ...reviews]);
    }

    setSubmitted(true);
    setTimeout(() => {
      setModalOpen(false);
      setSubmitted(false);
    }, 1200);
  };

  const getWhatsAppShareUrl = () => {
    const msg = `Hello Krishna Sweets, I'd like to share my customer review:\n⭐ Rating: ${rating}/5 Stars\nOccasion: ${occasion}\nReview: "${text}"\n- ${name}`;
    return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <section className={styles.reviewsSection}>
      <Container>
        <div className={styles.reviewActionHeader}>
          <SectionHeading
            eyebrow="What customers say"
            title="Freshness, packing and familiar taste."
            body="Genuine feedback from families across Kannauj and Chhibramau who order our sweets for celebrations and weekly cravings."
            align="center"
          />

          <button
            type="button"
            className={styles.writeReviewTriggerBtn}
            onClick={handleOpenModal}
          >
            <PenLine size={16} /> Share Your Experience
          </button>
        </div>

        <div className={styles.reviewGrid}>
          {reviews.map((review, idx) => (
            <article className={styles.reviewCard} key={`${review.name}-${idx}`}>
              <Quote size={28} strokeWidth={1.4} />
              <div
                className={styles.stars}
                aria-label={`${review.rating} out of 5 stars`}
              >
                {Array.from({ length: review.rating }).map((_, index) => (
                  <Star size={16} fill="currentColor" key={index} />
                ))}
              </div>
              <p>{review.text}</p>
              <footer>
                <strong>{review.name}</strong>
                <span>{review.occasion}</span>
              </footer>
            </article>
          ))}
        </div>
      </Container>

      {/* Write Review Modal */}
      {modalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className={styles.modalCard} role="dialog" aria-modal="true">
            <header className={styles.modalHeader}>
              <h3>Share Your Sweet Feedback</h3>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => setModalOpen(false)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </header>

            {submitted ? (
              <div
                style={{
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  color: '#065f46',
                }}
              >
                <Check
                  size={44}
                  style={{ margin: '0 auto 1rem', display: 'block' }}
                />
                <h4 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                  Thank you for your review!
                </h4>
                <p style={{ color: '#555', fontSize: '0.9rem' }}>
                  Your feedback has been published to our sweets review wall.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className={styles.modalBody}>
                  <div className={styles.fieldGroup}>
                    <label>Overall Experience</label>
                    <div className={styles.starPicker}>
                      {[1, 2, 3, 4, 5].map((starValue) => {
                        const active =
                          (hoverRating || rating) >= starValue;
                        return (
                          <button
                            type="button"
                            key={starValue}
                            className={`${styles.starBtn} ${
                              active ? styles.starActive : ''
                            }`}
                            onMouseEnter={() => setHoverRating(starValue)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(starValue)}
                            aria-label={`${starValue} stars`}
                          >
                            <Star
                              size={24}
                              fill={active ? 'currentColor' : 'none'}
                            />
                          </button>
                        );
                      })}
                      <span
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#a06e18',
                          marginLeft: '0.5rem',
                        }}
                      >
                        {rating} out of 5 Stars
                      </span>
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Suman Sharma"
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Occasion / Sweet Order</label>
                    <select
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                    >
                      {OCCASIONS.map((occ) => (
                        <option value={occ} key={occ}>
                          {occ}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Your Review & Taste Feedback</label>
                    <textarea
                      required
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="How was the freshness, ghee aroma, packing and delivery?"
                    />
                  </div>
                </div>

                <footer className={styles.modalFooter}>
                  {text.trim() && (
                    <a
                      href={getWhatsAppShareUrl()}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.55rem',
                        background: '#25d366',
                        color: '#ffffff',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        marginRight: 'auto',
                      }}
                    >
                      <MessageCircle size={14} /> Send on WhatsApp
                    </a>
                  )}
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    Publish Review
                  </button>
                </footer>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default ReviewsGrid;
