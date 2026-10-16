import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { products as localProducts } from '@/data/products';
import { productService } from '@/services/productService';
import styles from './SearchModal.module.css';

// Dynamic typing animation keywords for the search input placeholder (typewriter effect)
const TYPING_SWEETS = [
  'Kaju Katli',
  'Gulab Jamun',
  'Motichoor Ladoo',
  'Rasgulla',
  'Besan Ladoo',
  'Kaju Burfi',
  'Mewa Bite',
  'Rasmalai',
  'Sohan Papdi',
  'Doda Barfi',
];

// Popular search keywords for sweets to suggest as the user types
const BASE_KEYWORDS = [
  'kaju katli',
  'kaju burfi',
  'kaju',
  'kaju masala',
  'kaju roasted',
  'kaju roll',
  'kaju bites',
  'kaju mixture',
  'gulab jamun',
  'motichoor ladoo',
  'besan ladoo',
  'dry fruit laddu',
  'rasgulla',
  'rasmalai',
  'doda barfi',
  'sohan papdi',
  'coconut barfi',
  'jalebi',
  'mewa bite',
  'dhokla',
  'rabdi',
  'rajbhog',
  'khajoor laddu',
  'anjeer roll',
];

/**
 * Highlights the part of text that matches what the user typed.
 * For example: if user typed "kaj", "kaj" will be highlighted in yellow.
 */
function highlightMatch(text, query) {
  if (!query || !query.trim()) return text;

  const trimmed = query.trim();
  // Safe regex to find query letters (case-insensitive)
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === trimmed.toLowerCase() ? (
      <mark key={index} className={styles.highlight}>
        {part}
      </mark>
    ) : (
      part
    )
  );
}

/**
 * SearchModal Component:
 * Full-featured search popup that matches the "Search our store" design.
 * Shows live suggestions and product previews as the user types.
 */
export function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [allProducts, setAllProducts] = useState(localProducts);
  // Typing animation state for the input placeholder (cycles through sweets)
  const [placeholderText, setPlaceholderText] = useState('Search sweets…');
  const inputRef = useRef(null);
  const navigate = useNavigate();



  // Typewriter animation effect when modal opens
  useEffect(() => {
    if (!isOpen) return undefined;

    let wordIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeoutId = null;

    const animatePlaceholder = () => {
      const currentWord = TYPING_SWEETS[wordIdx];

      if (!isDeleting) {
        charIdx += 1;
        setPlaceholderText(`Search "${currentWord.slice(0, charIdx)}"…`);

        if (charIdx === currentWord.length) {
          // Pause when word is completely typed out so user can read it
          isDeleting = true;
          timeoutId = setTimeout(animatePlaceholder, 1800);
          return;
        }
        timeoutId = setTimeout(animatePlaceholder, 85);
      } else {
        charIdx -= 1;
        setPlaceholderText(
          charIdx > 0
            ? `Search "${currentWord.slice(0, charIdx)}"…`
            : 'Search sweets…'
        );

        if (charIdx === 0) {
          // Pause briefly before typing next sweet
          isDeleting = false;
          wordIdx = (wordIdx + 1) % TYPING_SWEETS.length;
          timeoutId = setTimeout(animatePlaceholder, 350);
          return;
        }
        timeoutId = setTimeout(animatePlaceholder, 45);
      }
    };

    // Small initial delay so modal animation finishes before typing starts
    timeoutId = setTimeout(animatePlaceholder, 300);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOpen]);

  // Load backend products if available, fallback to local products
  useEffect(() => {
    let active = true;
    productService.getProducts().then((data) => {
      if (active && Array.isArray(data) && data.length > 0) {
        setAllProducts(data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // When modal opens: auto-focus input and prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Small timeout ensures element is mounted before focusing
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
  }, [isOpen]);

  // Close modal when pressing the Escape key
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Combine keywords with actual product names for suggestions
  const suggestionsList = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default popular suggestions before typing
      return ['kaju katli', 'gulab jamun', 'motichoor ladoo', 'rasgulla', 'kaju roll'];
    }

    // Collect all matching terms from base keywords and product names
    const set = new Set();

    BASE_KEYWORDS.forEach((kw) => {
      if (kw.toLowerCase().includes(q)) {
        set.add(kw);
      }
    });

    allProducts.forEach((p) => {
      if (p.name && p.name.toLowerCase().includes(q)) {
        set.add(p.name.toLowerCase());
      }
    });

    // Return first 5 matching suggestions
    return Array.from(set).slice(0, 5);
  }, [query, allProducts]);

  // Filter matching products
  const matchingProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // If nothing typed yet, show top 4 featured sweets
      return allProducts.slice(0, 4);
    }

    return allProducts
      .filter((p) => {
        const name = (p.name || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        return name.includes(q) || cat.includes(q) || desc.includes(q);
      })
      .slice(0, 6);
  }, [query, allProducts]);

  // Form submit (hitting Enter or clicking magnifying glass)
  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = query.trim();
    onClose();
    if (trimmed) {
      navigate(`${ROUTES.products}?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate(ROUTES.products);
    }
  };

  // Clicking a suggestion
  const handleSelectSuggestion = (suggestionText) => {
    onClose();
    navigate(`${ROUTES.products}?q=${encodeURIComponent(suggestionText)}`);
  };

  // Clicking a product
  const handleSelectProduct = (product) => {
    onClose();
    if (product.slug) {
      navigate(`/products/${product.slug}`);
    } else if (product.id) {
      navigate(`/products/${product.id}`);
    } else {
      navigate(`${ROUTES.products}?q=${encodeURIComponent(product.name)}`);
    }
  };

  // If modal is not open, do not render anything
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      {/* Modal Dialog Content (stops clicks from closing when clicking inside) */}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Top Header Bar: "Search our store" and Close (X) button */}
        <div className={styles.topBar}>
          <h2 className={styles.title}>Search our store</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close search dialog"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Input Box (Pill Shape) */}
        <form className={styles.searchForm} onSubmit={handleSubmit} role="search">
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}

            // this placeholder working after typing animation for sweets
            placeholder={placeholderText}
            aria-label="Search our store"
            autoComplete="off"
            spellCheck="false"
          />

          {/* Clear button (X) when there is text */}
          {query && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear input"
            >
              <X size={18} />
            </button>
          )}

          {/* Magnifying glass search button */}
          <button
            type="submit"
            className={styles.searchSubmitBtn}
            aria-label="Submit search"
          >
            <Search size={22} />
          </button>
        </form>

        {/* Scrollable Results Area */}
        <div className={styles.resultsArea}>

          {/* 1. Suggestions Section */}
          {suggestionsList.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionHeading}>Suggestions</h3>
              <ul className={styles.suggestionList}>
                {suggestionsList.map((item, idx) => (
                  <li key={idx} className={styles.suggestionItem}>
                    <button
                      type="button"
                      className={styles.suggestionButton}
                      onClick={() => handleSelectSuggestion(item)}
                    >
                      {highlightMatch(item, query)}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 2. Products Section */}
          <section className={styles.section}>
            <h3 className={styles.sectionHeading}>Products</h3>

            {matchingProducts.length > 0 ? (
              <div className={styles.productList}>
                {matchingProducts.map((p) => {
                  const displayPrice = p.price != null
                    ? `₹ ${Number(p.price).toFixed(2).replace(/\.00$/, '')}`
                    : '';

                  return (
                    <div
                      key={p.id || p._id || p.slug || p.name}
                      className={styles.productRow}
                      onClick={() => handleSelectProduct(p)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSelectProduct(p);
                      }}
                    >
                      {/* Product Thumbnail */}
                      <img
                        src={p.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Kaju_katli%2C_photographed_in_West_Bengal%2C_India%2C_February_10%2C_2024.jpg/1280px-Kaju_katli%2C_photographed_in_West_Bengal%2C_India%2C_February_10%2C_2024.jpg'}
                        alt={p.name}
                        className={styles.productImage}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Kaju_katli%2C_photographed_in_West_Bengal%2C_India%2C_February_10%2C_2024.jpg/1280px-Kaju_katli%2C_photographed_in_West_Bengal%2C_India%2C_February_10%2C_2024.jpg';
                        }}
                      />

                      {/* Product Name & Price */}
                      <div className={styles.productDetails}>
                        <div className={styles.productName}>{p.name}</div>
                        {displayPrice && (
                          <div className={styles.productPrice}>{displayPrice}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className={styles.noResultsText}>
                No products found matching "{query}".
              </p>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}

export default SearchModal;
