import { useEffect, useMemo, useState } from 'react';
import { MessageCircle, ShoppingBag, Trash2, Truck, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/cart/useCart';
import { QuantityStepper } from '@/components/cart/QuantityStepper/QuantityStepper';
import { CheckoutModal } from '@/components/cart/CheckoutModal/CheckoutModal';
import { business } from '@/data/site';
import { formatPrice } from '@/utils/format';
import styles from './CartDrawer.module.css';

export function CartDrawer() {
    const { user, openAuthModal } = useAuth();
    const { closeCart, enrichedItems, isCartOpen, removeItem, total, totalCount, updateQuantity } = useCart();
    const [notes, setNotes] = useState('');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // Lock body scroll so swiping inside the drawer on iPhone 16 never slides the background page
    useEffect(() => {
        if (!isCartOpen) return;
        const originalOverflow = document.body.style.overflow;
        const originalOverscroll = document.body.style.overscrollBehavior;
        document.body.style.overflow = 'hidden';
        document.body.style.overscrollBehavior = 'none';

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeCart();
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.overscrollBehavior = originalOverscroll;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isCartOpen, closeCart]);

    const checkoutUrl = useMemo(() => {
        const lines = enrichedItems.map((item, index) => (`${index + 1}. ${item.product.name} (${item.size}) x ${item.quantity} - ${formatPrice(item.lineTotal)}`));
        const message = [
            `Hello ${business.name}, I would like to place an order:`,
            '',
            ...lines,
            '',
            `Grand total: ${formatPrice(total)}`,
            notes.trim() ? `Customer notes: ${notes.trim()}` : 'Customer notes: None',
        ].join('\n');
        return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`;
    }, [enrichedItems, notes, total]);

    const handleCodCheckout = () => {
        if (!user) {
            openAuthModal('login', 'Please sign in to continue placing your order.');
        } else {
            setIsCheckoutOpen(true);
        }
    };

    return (<>
      <div className={`${styles.backdrop} ${isCartOpen ? styles.visible : ''}`} onClick={closeCart} aria-hidden="true"/>
      <aside className={`${styles.drawer} ${isCartOpen ? styles.open : ''}`} aria-label="Order cart" aria-hidden={!isCartOpen}>
        <header className={styles.header}>
          <div>
            <span>Order bag</span>
            <h2>{totalCount} {totalCount === 1 ? 'item' : 'items'}</h2>
          </div>
          <div className={styles.headerRight}>
            {totalCount > 0 && (
              <span className={styles.headerTotalPill}>{formatPrice(total)}</span>
            )}
            <button type="button" onClick={closeCart} aria-label="Close cart">
              <X size={20}/>
            </button>
          </div>
        </header>

        {enrichedItems.length === 0 ? (
          <div className={styles.empty}>
            <ShoppingBag size={34} strokeWidth={1.5} />
            <h3>Your bag is waiting.</h3>
            <p>Add sweets from the catalogue and your WhatsApp order summary will appear here.</p>
          </div>
        ) : (
          <div className={styles.drawerBody}>
            <div className={styles.items}>
              {enrichedItems.map((item) => (
                <article className={styles.item} key={`${item.productId}-${item.size}`}>
                  <img src={item.product.image} alt="" loading="lazy" />
                  <div>
                    <span>{item.product.category} / {item.size}</span>
                    <h3>{item.product.name}</h3>
                    <p>{formatPrice(item.unitPrice)} each</p>
                    <div className={styles.itemActions}>
                      <QuantityStepper
                        value={item.quantity}
                        label={`Quantity for ${item.product.name}`}
                        onChange={(quantity) => updateQuantity(item.productId, item.size, quantity)}
                      />
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeItem(item.productId, item.size)}
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <strong>{formatPrice(item.lineTotal)}</strong>
                </article>
              ))}
            </div>

            <label className={styles.notes}>
              <span>Customer notes (optional)</span>
              <input
                type="text"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Packaging requests, delivery timing, festival note"
                className={styles.notesInput}
              />
            </label>

            {/* In-flow Checkout Action Card: The ONLY checkout options */}
            <div className={styles.inlineCheckoutCard}>
              <div className={styles.inlineSummary}>
                <div className={styles.inlineTotalRow}>
                  <span>Grand Total:</span>
                  <strong>{formatPrice(total)}</strong>
                </div>
                <span className={styles.freeBadge}>FREE DELIVERY</span>
              </div>
              <div className={styles.inlineActions}>
                <button
                  type="button"
                  className={styles.checkoutPrimary}
                  onClick={handleCodCheckout}
                >
                  <Truck size={17} />
                  <span>Order Cash on Delivery</span>
                </button>
                <a
                  className={styles.checkoutSecondary}
                  href={checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle size={17} />
                  <span>Order directly on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </aside>

      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </>);
}
