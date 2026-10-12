import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Menu, Package, Phone, Search, Shield, ShoppingBag, User, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { BrandMark } from '@/components/brand/BrandMark/BrandMark';
import { Container } from '@/components/layout/Container/Container';
import { useAuth } from '@/context/AuthContext';
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
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { user, isAdmin, openAuthModal, logout } = useAuth();
    const dropdownRef = useRef(null);

    // Close user dropdown when clicking outside
    useEffect(() => {
        if (!userMenuOpen) return undefined;
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [userMenuOpen]);

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

          {/* Admin Portal quick link */}
          {isAdmin && (
            <Link to="/admin" className={styles.adminLink} title="Manage sweets & catalog">
              <Shield size={13} /> Admin
            </Link>
          )}

          {/* User Account Button & Dropdown */}
          {user ? (
            <div className={styles.userMenu} ref={dropdownRef}>
              <button
                type="button"
                className={styles.userBtn}
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-expanded={userMenuOpen}
              >
                <User size={15} />
                <span>{user.name?.split(' ')[0] || 'Account'}</span>
                <ChevronDown size={13} />
              </button>

              {userMenuOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownName}>{user.name}</div>
                    <div className={styles.dropdownRole}>{user.role || 'Customer'}</div>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={styles.dropdownItem}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Shield size={15} /> Manage Sweets
                    </Link>
                  )}

                  <Link
                    to="/my-orders"
                    className={styles.dropdownItem}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Package size={15} /> My Orders
                  </Link>

                  <button
                    type="button"
                    className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className={styles.userBtn}
              onClick={() => openAuthModal('login')}
            >
              <User size={15} /> Sign in
            </button>
          )}

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
          {user && (
            <Link to="/my-orders" onClick={() => setMenuOpen(false)}>
              My Orders
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" onClick={() => setMenuOpen(false)}>
              Admin Portal
            </Link>
          )}
        </nav>
        <p>{business.hours}</p>
      </div>
    </header>);
}

