import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Menu, Package, Phone, Search, Shield, ShoppingBag, User, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { BrandMark } from '@/components/brand/BrandMark/BrandMark';
//keep content centered, don't let it go too wide
import { Container } from '@/components/layout/Container/Container';
//we need the user’s info to show their name & profile options
import { useAuth } from '@/context/AuthContext';
//site-wide details like name, phone, address
import { business } from '@/data/site';
import { SearchModal } from '@/components/layout/SearchModal/SearchModal';
import styles from './Header.module.css';


// nav link array
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
  // State to control the Search Modal popup
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { user, isAdmin, openAuthModal, openProfileModal, logout } = useAuth();
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

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!menuOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  return (<header className={styles.header}>






    {/* Announcement bar */}


    <div className={styles.announcement}>
      <Container className={styles.announcementInner}>
        <span>Free  delivery across Chhibramau on orders above INR 1,500</span>
        <a href={`tel:${business.whatsapp}`}>
          <Phone size={13} /> {business.phoneDisplay}
        </a>
      </Container>
    </div>

    <Container className={styles.navbar}>

      {/* Logo Section in Header    when click pint to home page  */}
      <Link to={ROUTES.home}
        className={styles.logoLink}
        aria-label="Krishna Sweets home">



        {/* Brandmarrk render logo of site */}
        <BrandMark />
      </Link>

      {/* Desktop navigation secton of Home, Products, Reviews, About, FAQ, Contact */}
      <nav className={styles.desktopNav}
        aria-label="Main navigation">
        {nav.map((item) =>
          <Link to={item.href}

            // show visible text
            key={item.label}>{item.label}
          </Link>)}
      </nav>

      <div className={styles.actions}>

        {/* Search bar feature open (Search Modal) */}


        {/* Search button: opens the search modal (like Om Sweets store search) */}
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => {
            setSearchModalOpen(true);
            setUserMenuOpen(false);
          }}
          aria-label="Search our sweets"
        >
          <Search size={19} />
        </button>






        {/* Cart or Bag icon open cart modal */}
        <button className={styles.iconButton} type="button"
          // when cart icon clicked open cart modal (onCartOpen  :callbackfunction that open  theside cart drawer) 
          onClick={onCartOpen} aria-label={`Order bag with ${cartCount} items`}>

          <ShoppingBag size={20} />
          {cartCount > 0 && <span>{cartCount}</span>}
        </button>




        {/* Admin Portal quick link */}
        {isAdmin && (
          <Link to="/admin" className={styles.adminLink} title="Manage sweets & catalog">
            <Shield size={13} /> Admin
          </Link>
        )}

        {/* User sign in: 
            then show user name and user dropdown
            Ye section customer aur admin dono ke liye run hota hai.
        */}
        {user ? (
          /* ye pura run hoga (logged in state for customer & admin) */
          <div className={styles.userMenu} ref={dropdownRef}>

            {/* user name button (shows first name or Account) */}
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

            {/* User dropdown And Admin Dropdown */}

            {userMenuOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownName}>{user.name}</div>
                  <div className={styles.dropdownRole}>{user.role || 'Customer'}</div>
                </div>

                {/* Agr admin ne login kr liya then admin dropdown open hoga only ye wala diff rehga manage sweets   */}
                {/* Admin drop down */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={styles.dropdownItem}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Shield size={15} /> Manage Sweets
                  </Link>
                )}

                {/* Common to both profilr and addrsss and my order */}
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={() => {
                    setUserMenuOpen(false);
                    openProfileModal();
                  }}
                >
                  <User size={15} /> My Profile & Address
                </button>


{/* Common my orders button for both user and admin  */}
                <Link
                  to="/my-orders"
                  className={styles.dropdownItem}
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Package size={15} /> My Orders
                </Link>

                {/* Logout button (works for both admin and customer) */}
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
          /* user is not login then show sign in button */
          <button
            type="button"
            className={styles.userBtn}
            onClick={() => openAuthModal('login')}
          >
            <User size={15} /> Sign in
          </button>
        )}



        {/* Order sweets button  */}
        <Link className={styles.orderButton}
         to={ROUTES.products}>Order sweets</Link>




{/* Mobile navigation menu icon */}

        <button className={styles.menuButton} 
        type="button" 
        aria-label={menuOpen ? 'Close menu' : 'Open menu'} 
        aria-expanded={menuOpen} 
        onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X /> : <Menu />}
          {/* 3 horizonta lines /hamburger menu */}
        </button>



{/* jab 3 linespr click the show hone wale rouetss */}
      </div>
    </Container>

    <div
      className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
      aria-hidden={!menuOpen}
    >
      <nav aria-label="Mobile navigation">
{/* main nav link */}
        {nav.map((item) => (<Link to={item.href} key={item.label} onClick={() => setMenuOpen(false)}>{item.label}</Link>))}
      {/* logged in user can see these two button only my profile and my order */}
        {user && (
          <>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                font: 'inherit',
                textAlign: 'left',
                padding: 0,
                cursor: 'pointer',
              }}
              onClick={() => {
                setMenuOpen(false);
                openProfileModal();
              }}
            >
              My Profile
            </button>
            <Link to="/my-orders" onClick={() => setMenuOpen(false)}>
              My Orders
            </Link>
          </>
        )}
        {/* admin can see */}
        {isAdmin && (
          <Link to="/admin" onClick={() => setMenuOpen(false)}>
            Admin Portal
          </Link>
        )}
      </nav>
      <p>{business.hours}</p>
    </div>

    {/* Search Modal (like Om Sweets: live suggestions & products) */}
    <SearchModal
      isOpen={searchModalOpen}
      onClose={() => setSearchModalOpen(false)}
    />
  </header>);
}

