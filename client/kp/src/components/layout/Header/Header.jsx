import { useEffect, useState } from 'react';
import { Menu, Phone, Search, ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { BrandMark } from '@/components/brand/BrandMark/BrandMark';
import { Container } from '@/components/layout/Container/Container';
import { business } from '@/data/site';
import styles from './Header.module.css';
const nav = [
    { label: 'Home', href: ROUTES.home },
    { label: 'Products', href: ROUTES.products },
    { label: 'Reviews', href: ROUTES.reviews },
    { label: 'About', href: ROUTES.about },
    { label: 'FAQ', href: ROUTES.faq },
    { label: 'Contact', href: ROUTES.contact },
];
export function Header({ cartCount, onCartOpen }) {
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (!menuOpen) return undefined;

        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setMenuOpen(false);
        };

        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [menuOpen]);

    return (<header className={styles.header}>
      <div className={styles.announcement}>
        <Container className={styles.announcementInner}>
          <span>Complimentary delivery across Chhibramau on orders above INR 1,500</span>
          <a href={`tel:${business.whatsapp}`}><Phone size={13}/> {business.phoneDisplay}</a>
        </Container>
      </div>

      <Container className={styles.navbar}>
        <Link to={ROUTES.home} className={styles.logoLink} aria-label="Krishna Sweets home">
          <BrandMark />
        </Link>

        <nav className={styles.desktopNav} aria-label="Main navigation">
          {nav.map((item) => <Link to={item.href} key={item.label}>{item.label}</Link>)}
        </nav>

        <div className={styles.actions}>
          <Link className={styles.iconButton} to={`${ROUTES.products}?q=`} aria-label="Search our sweets">
            <Search size={19}/>
          </Link>
          <button className={styles.iconButton} type="button" onClick={onCartOpen} aria-label={`Order bag with ${cartCount} items`}>
            <ShoppingBag size={20}/>
            {cartCount > 0 && <span>{cartCount}</span>}
          </button>
          <Link className={styles.orderButton} to={ROUTES.products}>Order sweets</Link>
          <button className={styles.menuButton} type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </Container>

      <div
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!menuOpen}
      >
        <nav aria-label="Mobile navigation">
          {nav.map((item) => (<Link to={item.href} key={item.label} onClick={() => setMenuOpen(false)}>{item.label}</Link>))}
        </nav>
        <p>{business.hours}</p>
      </div>
    </header>);
}
