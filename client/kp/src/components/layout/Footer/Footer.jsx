import { ArrowUp, Clock3, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { BrandMark } from '@/components/brand/BrandMark/BrandMark';
import { Container } from '@/components/layout/Container/Container';
import { business } from '@/data/site';
import styles from './Footer.module.css';
const navLinks = [
    { label: 'Home', href: ROUTES.home },
    { label: 'Products', href: ROUTES.products },
    { label: 'Reviews', href: ROUTES.reviews },
    { label: 'About', href: ROUTES.about },
    { label: 'FAQ', href: ROUTES.faq },
    { label: 'Contact', href: ROUTES.contact },
];
const orderLinks = [
    { label: 'Browse sweets', href: ROUTES.products },
    { label: 'Customer reviews', href: ROUTES.reviews },
    { label: 'Bulk order help', href: ROUTES.faq },
    { label: 'Visit the shop', href: ROUTES.contact },
];
const socials = ['Instagram', 'Facebook', 'YouTube'];
export function Footer() {
    return (<footer className={styles.footer}>
      <Container className={styles.inner}>
        <div className={styles.brandBlock}>
          <BrandMark light/>
          <p>
            {business.descriptor} from Chhibramau, crafted with the same quiet care
            since {business.founded}. Fresh mithai, thoughtful gifting, and simple
            WhatsApp ordering for families across Kannauj.
          </p>
          <div className={styles.ctaRow}>
            <a className={styles.whatsapp} href={`https://wa.me/${business.whatsapp}`} target="_blank" rel="noreferrer">
              <MessageCircle size={17}/> Order on WhatsApp
            </a>
            <Link className={styles.secondaryCta} to={ROUTES.products}>View sweets</Link>
          </div>
          <div className={styles.socials} aria-label="Social media placeholders">
            {socials.map((social) => (<span aria-label={`${social} placeholder`} title={`${social} placeholder`} key={social}>
                {social.slice(0, 2)}
              </span>))}
          </div>
        </div>

        <nav className={styles.nav} aria-label="Footer navigation">
          <h2>Explore</h2>
          {navLinks.map((link) => (<Link to={link.href} key={link.label}>{link.label}</Link>))}
        </nav>

        <nav className={styles.nav} aria-label="Ordering support">
          <h2>Order support</h2>
          {orderLinks.map((link) => (<Link to={link.href} key={link.label}>{link.label}</Link>))}
        </nav>

        <div className={styles.contact}>
          <h2>Visit or call</h2>
          <a href={`tel:${business.whatsapp}`}><Phone size={16}/> {business.phoneDisplay}</a>
          <a href={`mailto:${business.email}`}><Mail size={16}/> {business.email}</a>
          <span><MapPin size={16}/> {business.address}</span>
          <small><Clock3 size={15}/> {business.hours}</small>
          <span className={styles.assurance}><ShieldCheck size={15}/> Frontend demo: final business details can be replaced before launch.</span>
        </div>
      </Container>

      <Container className={styles.bottom}>
        <div>
          <span>&copy; {new Date().getFullYear()} {business.name}. All rights reserved.</span>
          <span>Demo content for frontend showcase.</span>
        </div>
        <a href="#top" aria-label="Back to top"><ArrowUp size={15}/> Back to top</a>
      </Container>
    </footer>);
}
