import { ChevronRight, LogOut, Menu, Plus, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/utils/format';
import styles from '../AdminPage.module.css';

const PAGE_TITLES = {
  analytics: 'Sales Analytics',
  orders: 'Customer Orders',
  sweets: 'Menu Manager',
};

const PAGE_SUBTITLES = {
  analytics:
    'Revenue trends, order velocity & sweets popularity — powered by live MongoDB data.',
  orders:
    'Track & fulfil customer orders in real-time. Update stages and WhatsApp customers directly.',
  sweets:
    'Add new creations, adjust prices, edit descriptions and update stock in real-time.',
};

export function AdminHeader({
  adminTab,
  onOpenSidebar,
  onAddNew,
  user,
  stats = { total: 0, inStock: 0 },
  revenueStats = { totalRevenue: 0, activeOrders: 0 },
  onLogout,
}) {
  return (
    <>
      {/* ── Top Bar ── */}
      <header className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button
            type="button"
            className={styles.menuToggle}
            onClick={onOpenSidebar}
            aria-label="Open navigation sidebar"
          >
            <Menu size={20} />
          </button>
          <div className={styles.topBarBreadcrumb}>
            <span className={styles.breadcrumbRoot}>Admin</span>
            <ChevronRight size={14} className={styles.breadcrumbSep} />
            <span className={styles.breadcrumbCurrent}>
              {PAGE_TITLES[adminTab]}
            </span>
          </div>
        </div>

        <div className={styles.topBarRight}>
          {adminTab === 'sweets' && (
            <button
              type="button"
              className={styles.addBtn}
              onClick={onAddNew}
              title="Add a new sweet to catalogue"
            >
              <Plus size={16} /> <span className={styles.btnText}>Add Sweet</span>
            </button>
          )}

          {/* Direct "Back to Store" button on header */}
          <Link to="/" className={styles.headerStoreBtn} title="Back to Krishna Sweets Storefront">
            <Store size={16} />
            <span className={styles.btnText}>Store</span>
          </Link>

          {/* Direct "Logout" button on header */}
          <button
            type="button"
            className={styles.headerLogoutBtn}
            onClick={onLogout}
            title="Sign out of Admin Portal"
          >
            <LogOut size={16} />
            <span className={styles.btnText}>Logout</span>
          </button>

          <div className={styles.topBarUser} title={user?.name || 'Admin User'}>
            <div className={styles.topBarAvatar}>
              {(user?.name || 'A')[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* ── Page Title & Mini KPI Strip ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{PAGE_TITLES[adminTab]}</h1>
          <p className={styles.pageSubtitle}>{PAGE_SUBTITLES[adminTab]}</p>
        </div>

        {/* Mini KPI strip for orders & sweets */}
        {(adminTab === 'sweets' || adminTab === 'orders') && (
          <div className={styles.kpiStrip}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>Menu Items</div>
              <div className={styles.kpiValue}>{stats.total}</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>In Stock</div>
              <div className={`${styles.kpiValue} ${styles.kpiGreen}`}>
                {stats.inStock}
              </div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>In Kitchen</div>
              <div className={`${styles.kpiValue} ${styles.kpiGold}`}>
                {revenueStats.activeOrders}
              </div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>Total Revenue</div>
              <div className={`${styles.kpiValue} ${styles.kpiMaroon}`}>
                {formatPrice(revenueStats.totalRevenue)}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminHeader;
