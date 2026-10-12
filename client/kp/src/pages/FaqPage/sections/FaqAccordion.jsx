import { useState } from 'react';
import { ChevronDown, Gift, HelpCircle, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/layout/Container/Container';
import { business } from '@/data/site';
import styles from '../FaqPage.module.css';

const faqs = [
  { question: 'How do I place an order?', answer: 'Choose products from the catalogue, add them to your cart, and use WhatsApp checkout. We confirm availability, packing and delivery details directly on WhatsApp.' },
  { question: 'Do you have online payment?', answer: 'There is no payment gateway on the website right now. Orders are confirmed on WhatsApp, and payment details can be shared there.' },
  { question: 'How long do the sweets stay fresh?', answer: 'Shelf life depends on the sweet. Product detail pages show shelf life and storage instructions for each item before you add it to the cart.' },
  { question: 'How should I store mithai at home?', answer: 'Dry sweets should usually be kept in an airtight box away from heat and moisture. Syrup or chenna sweets should be refrigerated and consumed sooner.' },
  { question: 'Can I order for gifting or bulk functions?', answer: 'Yes. Share the quantity, occasion date and packing preference on WhatsApp so we can confirm timing and packaging options.' },
  { question: 'Can sweets or gift boxes be customized?', answer: 'Customization is available for selected sweets, box sizes and festive packing. Share your preferred quantity, occasion and budget on WhatsApp and we will suggest suitable options.' },
  { question: 'Do you deliver outside Chhibramau?', answer: 'Local delivery can be confirmed on WhatsApp. For nearby areas in Kannauj district, delivery depends on distance, product type and order size.' },
];

const quickNotes = [
  { icon: ShieldCheck, title: 'Freshness first', copy: 'Shelf-life guidance is shared before packing.' },
  { icon: Gift, title: 'Gifting support', copy: 'Bulk and festive boxes can be planned on WhatsApp.' },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className={styles.faqSection}>
      <Container className={styles.faqGrid}>
        <aside className={styles.helpCard}>
          <HelpCircle size={28} strokeWidth={1.5} />
          <h2>Need a quick answer?</h2>
          <p>Call or message us for order timing, packing and delivery confirmation.</p>
          <a href={`tel:${business.whatsapp}`}>{business.phoneDisplay}</a>
          <div className={styles.quickNotes}>
            {quickNotes.map(({ icon: Icon, title, copy }) => (
              <div key={title}>
                <Icon size={18} strokeWidth={1.6} />
                <span><strong>{title}</strong><small>{copy}</small></span>
              </div>
            ))}
          </div>
        </aside>

        <div className={styles.accordion}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <article className={styles.item} key={faq.question}>
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={isOpen ? styles.rotate : ''} size={19} />
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`${styles.answer} ${isOpen ? styles.answerOpen : ''}`}
                >
                  <p>{faq.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
