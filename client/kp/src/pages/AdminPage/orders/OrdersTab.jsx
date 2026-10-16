import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  MessageCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatPrice } from '@/utils/format';
import styles from './OrdersTab.module.css';

const ORDERS_PER_PAGE = 15;

export function OrdersTab({
  orders = [],
  onUpdateStatus,
  onRefresh,
  ordersLoading = false,
}) {
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderPage, setOrderPage] = useState(1);

  // Filter orders by search & status
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const statusMatch =
        orderStatusFilter === 'all' ||
        (orderStatusFilter === 'active' &&
          (ord.status === 'Confirmed' || ord.status === 'Preparing')) ||
        (orderStatusFilter === 'out' && ord.status === 'Out for Delivery') ||
        (orderStatusFilter === 'delivered' && ord.status === 'Delivered') ||
        (orderStatusFilter === 'cancelled' && ord.status === 'Cancelled');

      const q = orderSearchQuery.trim().toLowerCase();
      if (!q) return statusMatch;
      const customerName = (ord.address?.fullName || ord.userId?.name || '').toLowerCase();
      const customerPhone = (ord.address?.phone || ord.userId?.mobile || '').toLowerCase();
      const shortId = String(ord._id).slice(-6).toLowerCase();
      return (
        statusMatch &&
        (customerName.includes(q) || customerPhone.includes(q) || shortId.includes(q))
      );
    });
  }, [orders, orderStatusFilter, orderSearchQuery]);

  // Reset pagination when filter or search changes
  useEffect(() => {
    setOrderPage(1);
  }, [orderStatusFilter, orderSearchQuery]);

  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const start = (orderPage - 1) * ORDERS_PER_PAGE;
    return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [filteredOrders, orderPage]);

  return (
    <div>
      {/* ── Top Refresh & Polling Bar ── */}
      <div className={styles.orderHeaderRow}>
        <div className={styles.orderLiveStatus}>
          <button
            type="button"
            className={styles.refreshOrdersBtn}
            onClick={onRefresh}
            title="Fetch latest orders from database"
            disabled={ordersLoading}
          >
            <RefreshCw size={13} className={ordersLoading ? styles.spin : ''} />
            <span>{ordersLoading ? 'Refreshing...' : 'Refresh Orders'}</span>
          </button>
          <span className={styles.lastUpdatedText}>Auto-syncs every 60s</span>
        </div>
      </div>

      {/* ── Search and Status Filter Pills ── */}
      <div className={styles.orderFiltersBar}>
        <div className={styles.searchBox}>
          <Search size={17} color="#a06e18" />
          <input
            type="text"
            placeholder="Search customer, phone, or #ID..."
            value={orderSearchQuery}
            onChange={(e) => setOrderSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.filterPills}>
          {[
            { key: 'all', label: `All (${orders.length})` },
            {
              key: 'active',
              label: `In Kitchen (${
                orders.filter(
                  (o) => o.status === 'Confirmed' || o.status === 'Preparing'
                ).length
              })`,
            },
            {
              key: 'out',
              label: `Delivery (${
                orders.filter((o) => o.status === 'Out for Delivery').length
              })`,
            },
            {
              key: 'delivered',
              label: `Delivered (${
                orders.filter((o) => o.status === 'Delivered').length
              })`,
            },
            {
              key: 'cancelled',
              label: `Cancelled (${
                orders.filter((o) => o.status === 'Cancelled').length
              })`,
            },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`${styles.pill} ${
                orderStatusFilter === key ? styles.pillActive : ''
              }`}
              onClick={() => setOrderStatusFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Orders Table ── */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID / Time</th>
              <th>Customer & Mobile</th>
              <th>Delivery Address</th>
              <th>Sweets Ordered</th>
              <th>Total & Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: 'center', padding: '3.5rem', color: '#777' }}
                >
                  No orders match your filter criteria.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((ord) => {
                const customerName =
                  ord.address?.fullName || ord.userId?.name || 'Customer';
                const rawPhone =
                  ord.address?.phone || ord.userId?.mobile || '';
                const phoneClean = rawPhone.replace(/[^0-9]/g, '');
                const shortId = String(ord._id).slice(-6).toUpperCase();
                const whatsAppText = `Hello ${customerName}, updating you regarding your order #${shortId} from Krishna Sweets. Order status: ${
                  ord.status || 'Confirmed'
                }. Total bill: ₹${ord.totalAmount} (Cash on Delivery). Thank you!`;
                const whatsappUrl = phoneClean
                  ? `https://wa.me/91${
                      phoneClean.length === 10 ? phoneClean : phoneClean.slice(-10)
                    }?text=${encodeURIComponent(whatsAppText)}`
                  : null;

                return (
                  <tr key={ord._id}>
                    <td>
                      <strong>#{shortId}</strong>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: '#777',
                          marginTop: '0.2rem',
                        }}
                      >
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#410c0c' }}>
                        {customerName}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#666' }}>
                        {rawPhone || 'No phone'}
                      </div>
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.orderChatBtn}
                          title="Send status update on WhatsApp"
                        >
                          <MessageCircle size={12} /> WhatsApp
                        </a>
                      )}
                    </td>
                    <td>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: '#333',
                          maxWidth: '14rem',
                        }}
                      >
                        {ord.address?.addressLine}, {ord.address?.city} (
                        {ord.address?.pinCode})
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem', color: '#444' }}>
                        {ord.items?.map((it, idx) => (
                          <div key={idx}>
                            • {it.name} ({it.size || '500g'}) × {it.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          fontWeight: 800,
                          color: '#410c0c',
                          marginBottom: '0.4rem',
                        }}
                      >
                        {formatPrice(ord.totalAmount)} (COD)
                      </div>
                      <select
                        value={ord.status || 'Confirmed'}
                        onChange={(e) => onUpdateStatus(ord._id, e.target.value)}
                        className={styles.statusSelect}
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Preparing">Preparing Fresh</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* ── Pagination Controls ── */}
        {filteredOrders.length > ORDERS_PER_PAGE && (
          <div className={styles.paginationBar}>
            <div className={styles.paginationInfo}>
              Showing {(orderPage - 1) * ORDERS_PER_PAGE + 1} –{' '}
              {Math.min(orderPage * ORDERS_PER_PAGE, filteredOrders.length)} of{' '}
              {filteredOrders.length} orders
            </div>
            <div className={styles.paginationControls}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={orderPage === 1}
                onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className={styles.pageIndicator}>
                Page {orderPage} of {totalOrderPages}
              </span>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={orderPage >= totalOrderPages}
                onClick={() => setOrderPage((p) => Math.min(totalOrderPages, p + 1))}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersTab;
