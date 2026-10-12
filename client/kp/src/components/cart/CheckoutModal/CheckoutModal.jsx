import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, DollarSign, MessageCircle, Truck, X } from 'lucide-react';
import { useCart } from '@/cart/useCart';
import { useAuth } from '@/context/AuthContext';
import { business } from '@/data/site';
import { orderService } from '@/services/orderService';
import { formatPrice } from '@/utils/format';
import styles from './CheckoutModal.module.css';

export function CheckoutModal({ isOpen, onClose }) {
  const { user, openAuthModal } = useAuth();
  const { enrichedItems, total, totalCount, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: 'Chhibramau',
    pinCode: '209721',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.mobile || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setConfirmedOrder(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!formData.fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Please provide your phone number for delivery coordination.');
      return;
    }

    if (!formData.addressLine.trim()) {
      setError('Please enter your delivery street / address in Chhibramau.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await orderService.placeOrder({
        address: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine: formData.addressLine.trim(),
          city: formData.city.trim() || 'Chhibramau',
          pinCode: formData.pinCode.trim() || '209721',
        },
        items: enrichedItems,
        paymentMethod: 'COD',
        notes: formData.notes.trim(),
      });

      setConfirmedOrder(result.order || { _id: result.orderId });
      clearCart();
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappConfirmationUrl = useMemo(() => {
    if (!confirmedOrder) return '';
    const orderId = confirmedOrder._id ? String(confirmedOrder._id).slice(-6).toUpperCase() : 'NEW';
    const text = `Hello Krishna Sweets, I just placed order #${orderId} on the website for ${formatPrice(total)}.\nName: ${formData.fullName}\nPhone: ${formData.phone}\nAddress: ${formData.addressLine}, ${formData.city}.\nPlease confirm preparation and fresh delivery!`;
    return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(text)}`;
  }, [confirmedOrder, formData, total]);

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>
            {confirmedOrder ? 'Order Confirmed' : 'Delivery & Checkout'}
          </h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {confirmedOrder ? (
          <div className={styles.successView}>
            <CheckCircle2 size={54} color="#065f46" />
            <h3 className={styles.successTitle}>Thank You! Order Confirmed.</h3>
            <span className={styles.orderIdBadge}>
              Order ID: #{String(confirmedOrder._id).slice(-8).toUpperCase()}
            </span>
            <p className={styles.successDesc}>
              Your order has been recorded in our kitchen. We prepare each batch fresh with pure desi ghee. Delivery within 45–60 minutes in Chhibramau.
            </p>

            <a
              href={whatsappConfirmationUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.waBtn}
              style={{ marginTop: '0.8rem', padding: '0.9rem' }}
            >
              <MessageCircle size={18} /> Send Order Update on WhatsApp
            </a>

            <button
              type="button"
              className={styles.placeBtn}
              style={{ marginTop: '0.5rem' }}
              onClick={onClose}
            >
              Continue Browsing
            </button>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} style={{ display: 'contents' }}>
            <div className={styles.body}>
              <div className={styles.orderBrief}>
                <span>Order Summary ({totalCount} {totalCount === 1 ? 'sweet' : 'sweets'})</span>
                <strong>{formatPrice(total)}</strong>
              </div>

              {!user && (
                <div style={{ padding: '0.75rem 0.9rem', borderRadius: '0.6rem', background: '#fef3c7', border: '1px solid #fde68a', fontSize: '0.8rem', color: '#92400e' }}>
                  <strong>Account required:</strong> Please sign in to confirm delivery. Click the button below to sign in or register.
                </div>
              )}

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Recipient name"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Mobile Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="10-digit phone number"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Street / House / Mohalla Address *</label>
                <input
                  type="text"
                  name="addressLine"
                  required
                  value={formData.addressLine}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="e.g. Near G.T. Road, Chhibramau"
                />
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.label}>City / Town</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Pincode</label>
                  <input
                    type="text"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.paymentBox}>
                <Truck size={24} color="#a06e18" />
                <div>
                  <div className={styles.paymentBoxTitle}>Cash on Delivery (COD)</div>
                  <div className={styles.paymentBoxDesc}>
                    Pay cash in hand when our delivery agent brings your sweets fresh to your doorstep.
                  </div>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Special Instructions / Gift Message</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  className={styles.textarea}
                  placeholder="Festival message, packaging request, or timing note..."
                />
              </div>
            </div>

            <div className={styles.footer}>
              {user ? (
                <button
                  type="submit"
                  disabled={submitting || enrichedItems.length === 0}
                  className={styles.placeBtn}
                >
                  {submitting ? 'Placing Order...' : `Confirm Order — ${formatPrice(total)}`}
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.placeBtn}
                  onClick={() => openAuthModal('login')}
                >
                  Sign In to Place Order
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CheckoutModal;
