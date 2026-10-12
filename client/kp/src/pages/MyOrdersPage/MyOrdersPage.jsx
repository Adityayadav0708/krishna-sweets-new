import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  PackageOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ChefHat,
  MessageCircle,
  ArrowRight,
  Loader2,
  LogIn,
} from 'lucide-react';
import { Container } from '@/components/layout/Container/Container';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/orderService';
import { formatPrice } from '@/utils/format';
import { business } from '@/data/site';
import { ROUTES } from '@/app/routes';
import styles from './MyOrdersPage.module.css';

const STEPS = [
  { key: 'Confirmed', label: 'Order Placed', icon: Clock },
  { key: 'Preparing', label: 'Preparing Fresh', icon: ChefHat },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
];

function getStepIndex(status) {
  switch (status) {
    case 'Confirmed':
      return 0;
    case 'Preparing':
      return 1;
    case 'Out for Delivery':
      return 2;
    case 'Delivered':
      return 3;
    case 'Cancelled':
      return -1;
    default:
      return 0;
  }
}

export function MyOrdersPage() {
  const { user, openAuthModal } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await orderService.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Could not load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const getWhatsAppInquiryUrl = (order) => {
    const orderId = String(order._id).slice(-6).toUpperCase();
    const text = `Hello Krishna Sweets, I would like to check on my Order #${orderId} (Total: ${formatPrice(
      order.totalAmount
    )}). Could you please share the current delivery status?`;
    return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className={styles.ordersPage}>
      <Container>
        <div className={styles.hero}>
          <div className={styles.eyebrow}>
            <Package size={14} /> Krishna Sweets • Order Tracking
          </div>
          <h1 className={styles.title}>Your Sweet Orders</h1>
          <p className={styles.subtitle}>
            Track the kitchen preparation and doorstep delivery of your freshly
            crafted traditional sweets.
          </p>
        </div>

        {!user ? (
          <div className={styles.authPromptCard}>
            <h3>Sign in to View Your Orders</h3>
            <p>
              Please log in to your Krishna Sweets account to track past and
              active sweet deliveries.
            </p>
            <button
              type="button"
              className={styles.signInBtn}
              onClick={() => openAuthModal('login')}
            >
              <LogIn size={16} /> Sign In to Your Account
            </button>
          </div>
        ) : loading ? (
          <div className={styles.loaderWrapper}>
            <Loader2 size={36} className={styles.spinner} />
            <p>Fetching your orders from the kitchen...</p>
          </div>
        ) : error ? (
          <div className={styles.emptyState}>
            <AlertCircle size={44} className={styles.emptyIcon} />
            <h3>Unable to Load Orders</h3>
            <p>{error}</p>
            <button
              type="button"
              className={styles.signInBtn}
              onClick={loadOrders}
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <PackageOpen size={48} className={styles.emptyIcon} />
            <h3>No Orders Placed Yet</h3>
            <p>
              Your sweet journey begins here! Choose from our heritage kaju
              katli, golden ladoos, and fresh paneer sweets.
            </p>
            <Link to={ROUTES.products} className={styles.exploreBtn}>
              Explore Sweets Menu <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map((ord) => {
              const currentStep = getStepIndex(ord.status);
              const isCancelled = ord.status === 'Cancelled';
              const shortId = String(ord._id).slice(-6).toUpperCase();

              return (
                <article key={ord._id} className={styles.orderCard}>
                  <header className={styles.cardHeader}>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderId}>Order #{shortId}</span>
                      <span className={styles.orderDate}>
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div>
                      <span
                        className={`${styles.orderStatusBadge} ${
                          ord.status === 'Preparing'
                            ? styles.statusPreparing
                            : ord.status === 'Out for Delivery'
                            ? styles.statusOut
                            : ord.status === 'Delivered'
                            ? styles.statusDelivered
                            : ord.status === 'Cancelled'
                            ? styles.statusCancelled
                            : styles.statusConfirmed
                        }`}
                      >
                        {ord.status || 'Confirmed'}
                      </span>
                    </div>
                  </header>

                  {/* Stepper Progress Bar */}
                  {!isCancelled && (
                    <div className={styles.trackerWrapper}>
                      <div className={styles.stepper}>
                        {STEPS.map((step, idx) => {
                          const isCompleted = currentStep > idx;
                          const isActive = currentStep === idx;
                          const StepIcon = step.icon;

                          return (
                            <div
                              key={step.key}
                              className={`${styles.stepItem} ${
                                isCompleted
                                  ? styles.stepCompleted
                                  : isActive
                                  ? styles.stepActive
                                  : ''
                              }`}
                            >
                              <div className={styles.stepDot}>
                                {isCompleted ? (
                                  <CheckCircle2 size={13} />
                                ) : (
                                  <StepIcon size={12} />
                                )}
                              </div>
                              <span className={styles.stepLabel}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className={styles.cardBody}>
                    <div className={styles.itemsSection}>
                      <h4>Items Ordered ({ord.items?.length || 0})</h4>
                      <div className={styles.itemsList}>
                        {ord.items?.map((item, idx) => (
                          <div key={idx} className={styles.itemRow}>
                            <div className={styles.itemInfo}>
                              <span className={styles.itemName}>
                                {item.name || 'Artisanal Sweet'}
                              </span>
                              <span className={styles.itemPortion}>
                                Portion: {item.size || '500g'} × {item.quantity}
                              </span>
                            </div>
                            <span className={styles.itemPrice}>
                              {formatPrice(
                                (Number(item.price) || 0) * (item.quantity || 1)
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.deliverySection}>
                      <h4>Delivery Details</h4>
                      <div className={styles.deliveryCard}>
                        <div className={styles.deliveryName}>
                          {ord.address?.fullName || user.name || 'Valued Customer'}
                        </div>
                        <div className={styles.deliveryPhone}>
                          Phone: {ord.address?.phone || user.mobile || 'Provided on delivery'}
                        </div>
                        <div>
                          {ord.address?.addressLine && (
                            <>
                              {ord.address.addressLine}, {ord.address.city || 'Chhibramau'}
                              {ord.address.pinCode ? ` (${ord.address.pinCode})` : ''}
                            </>
                          )}
                        </div>
                        <div style={{ marginTop: '0.5rem', fontWeight: 600, color: '#065f46', fontSize: '0.78rem' }}>
                          ✓ Cash on Delivery at Doorstep
                        </div>
                      </div>
                    </div>
                  </div>

                  <footer className={styles.cardFooter}>
                    <div className={styles.totalAmount}>
                      <span className={styles.totalLabel}>Total Bill:</span>
                      <span className={styles.totalValue}>
                        {formatPrice(ord.totalAmount)}
                      </span>
                    </div>

                    <div className={styles.footerActions}>
                      <a
                        href={getWhatsAppInquiryUrl(ord)}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.whatsappHelpBtn}
                      >
                        <MessageCircle size={15} /> WhatsApp Support
                      </a>
                    </div>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}

export default MyOrdersPage;
