import { useMemo, useState } from 'react';
import { MessageCircle, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '@/cart/useCart';
import { QuantityStepper } from '@/components/cart/QuantityStepper/QuantityStepper';
import { business } from '@/data/site';
import { formatPrice } from '@/utils/format';
import styles from './CartDrawer.module.css';
export function CartDrawer() {
    const { closeCart, enrichedItems, isCartOpen, removeItem, total, totalCount, updateQuantity, } = useCart();
    const [notes, setNotes] = useState('');
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
    return (<>
      <div className={`${styles.backdrop} ${isCartOpen ? styles.visible : ''}`} onClick={closeCart} aria-hidden="true"/>
      <aside className={`${styles.drawer} ${isCartOpen ? styles.open : ''}`} aria-label="Order cart" aria-hidden={!isCartOpen}>
        <header className={styles.header}>
          <div>
            <span>Order bag</span>
            <h2>{totalCount} {totalCount === 1 ? 'item' : 'items'}</h2>
          </div>
          <button type="button" onClick={closeCart} aria-label="Close cart">
            <X size={21}/>
          </button>
        </header>

        {enrichedItems.length === 0 ? (<div className={styles.empty}>
            <ShoppingBag size={34} strokeWidth={1.5}/>
            <h3>Your bag is waiting.</h3>
            <p>Add sweets from the catalogue and your WhatsApp order summary will appear here.</p>
          </div>) : (<>
            <div className={styles.items}>
              {enrichedItems.map((item) => (<article className={styles.item} key={`${item.productId}-${item.size}`}>
                  <img src={item.product.image} alt="" loading="lazy"/>
                  <div>
                    <span>{item.product.category} / {item.size}</span>
                    <h3>{item.product.name}</h3>
                    <p>{formatPrice(item.unitPrice)} each</p>
                    <div className={styles.itemActions}>
                      <QuantityStepper value={item.quantity} label={`Quantity for ${item.product.name}`} onChange={(quantity) => updateQuantity(item.productId, item.size, quantity)}/>
                      <button type="button" className={styles.removeButton} onClick={() => removeItem(item.productId, item.size)} aria-label={`Remove ${item.product.name}`}>
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </div>
                  <strong>{formatPrice(item.lineTotal)}</strong>
                </article>))}
            </div>

            <label className={styles.notes}>
              <span>Customer notes</span>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Packaging requests, delivery timing, or festival message"/>
            </label>

            <div className={styles.summary}>
              <div>
                <span>Subtotal</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <div>
                <span>Delivery</span>
                <strong>Confirmed on WhatsApp</strong>
              </div>
              <div className={styles.grandTotal}>
                <span>Grand total</span>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>

            <a className={styles.checkout} href={checkoutUrl} target="_blank" rel="noreferrer">
              <MessageCircle size={18}/> Checkout on WhatsApp
            </a>
          </>)}
      </aside>
    </>);
}
