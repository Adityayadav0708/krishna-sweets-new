import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ChevronRight,
  LogOut,
  Package,
  Shield,
  ShoppingBag,
  Store,
  X,
} from 'lucide-react';
import { formatPrice } from '@/utils/format';
import styles from '../AdminPage.module.css';

const NAV_ITEMS = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
  { id: 'orders',    label: 'Orders',    icon: ShoppingBag, badge: 'orders' },
  { id: 'sweets',    label: 'Menu',      icon: Package, badge: 'products' },
];

export function AdminSidebar({
  adminTab,
  onSelectTab,
  sidebarOpen,
  onCloseSidebar,
  ordersCount = 0,
  productsCount = 0,
  revenueStats = { totalRevenue: 0, activeOrders: 0 },
  user,
  onLogout,
}) {
  const navigate = useNavigate();

  return (
    <>
      {/* ── Mobile Overlay ── */}
      {sidebarOpen && (
        <div className={styles.mobileOverlay} onClick={onCloseSidebar} />
      )}

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        {/* Brand */}
        <div className={styles.sidebarBrand}>
          <div className={styles.brandIcon}>
            <Shield size={18} />
          </div>
          <div>
            <div className={styles.brandName}>Krishna Sweets</div>
            <div className={styles.brandRole}>Admin Portal</div>
          </div>
          <button
            type="button"
            className={styles.sidebarClose}
            onClick={onCloseSidebar}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick Stats */}
        <div className={styles.sidebarStats}>
          <div className={styles.sidebarStatItem}>
            <span className={styles.sidebarStatLabel}>Revenue</span>
            <span className={styles.sidebarStatValue}>
              {formatPrice(revenueStats.totalRevenue)}
            </span>
          </div>
          <div className={styles.sidebarStatDivider} />
          <div className={styles.sidebarStatItem}>
            <span className={styles.sidebarStatLabel}>Active</span>
            <span className={`${styles.sidebarStatValue} ${styles.sidebarStatActive}`}>
              {revenueStats.activeOrders}
            </span>
          </div>
        </div>

        {/* Nav items */}
        <nav className={styles.sidebarNav}>
          <div className={styles.navLabel}>Navigation</div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const count =
              item.badge === 'orders'
                ? ordersCount
                : item.badge === 'products'
                ? productsCount
                : null;
            const isActive = adminTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseSidebar();
                }}
              >
                <Icon size={18} />
                <span className={styles.navItemLabel}>{item.label}</span>
                {count !== null && (
                  <span
                    className={`${styles.navBadge} ${
                      isActive ? styles.navBadgeActive : ''
                    }`}
                  >
                    {count}
                  </span>
                )}
                {isActive && <ChevronRight size={14} className={styles.navChevron} />}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className={styles.sidebarFooter}>
          {/* User info */}
          <div className={styles.sidebarUser}>
            <div className={styles.userAvatar}>
              {(user?.name || 'A')[0].toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.name || 'Admin'}</div>
              <div className={styles.userEmail}>{user?.email || ''}</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className={styles.sidebarActions}>
            <button
              type="button"
              className={styles.backToStoreBtn}
              onClick={() => navigate('/')}
            >
              <Store size={15} /> Back to Store
            </button>
            <button
              type="button"
              className={styles.logoutBtn}
              onClick={onLogout}
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
