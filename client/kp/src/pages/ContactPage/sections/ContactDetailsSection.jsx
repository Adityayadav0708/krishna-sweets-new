import { useMemo, useState } from 'react';
import { Clock3, Mail, MessageCircle, Phone } from 'lucide-react';
import { Container } from '@/components/layout/Container/Container';
import { business } from '@/data/site';
import styles from '../ContactPage.module.css';

const contactCards = [
  { icon: Phone, title: 'Call us', value: business.phoneDisplay, href: `tel:${business.whatsapp}` },
  { icon: MessageCircle, title: 'WhatsApp', value: 'Message for orders', href: `https://wa.me/${business.whatsapp}` },
  { icon: Mail, title: 'Email', value: business.email, href: `mailto:${business.email}` },
];

export function ContactDetailsSection() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const whatsappUrl = useMemo(() => {
    const lines = [
      `Hello ${business.name}, I have an inquiry.`,
      name.trim() ? `Name: ${name.trim()}` : '',
      message.trim() ? `Message: ${message.trim()}` : '',
    ].filter(Boolean);

    return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
  }, [message, name]);

  return (
    <section className={styles.contactSection}>
      <Container className={styles.contactGrid}>
        <div className={styles.cards}>
          {contactCards.map(({ icon: Icon, title, value, href }) => (
            <a
              className={styles.contactCard}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noreferrer' : undefined}
              key={title}
            >
              <span><Icon size={21} strokeWidth={1.6} /></span>
              <div><strong>{title}</strong><p>{value}</p></div>
            </a>
          ))}
          <div className={styles.hoursCard}>
            <Clock3 size={21} strokeWidth={1.6} />
            <strong>Shop hours</strong>
            <p>{business.hours}</p>
          </div>
        </div>

        <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
          <span>Quick inquiry</span>
          <h2>Send details on WhatsApp</h2>
          <label>
            Your name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
          </label>
          <label>
            Message
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={5} placeholder="Tell us what you need" />
          </label>
          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <MessageCircle size={18} /> Open WhatsApp
          </a>
          <small>No backend is connected. This form simply prepares your WhatsApp inquiry.</small>
        </form>
      </Container>
    </section>
  );
}
