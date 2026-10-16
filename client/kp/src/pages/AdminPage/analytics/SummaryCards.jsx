import {
  TrendingUp,
  IndianRupee,
  AlertTriangle,
  Info,
  Calendar,
  Wallet,
} from 'lucide-react';
import { formatPrice } from '@/utils/format';
import styles from './SummaryCards.module.css';


export function SummaryCards({ data, loading }) {
  const kpis = data?.kpis || {};
  const lowStockProducts = data?.lowStockProducts || [];

  if (loading) {
    return (
      <div className={styles.loadingGrid}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Profit disclaimer banner */}
      <div className={styles.profitBanner}>
        <div className={styles.profitBannerIcon}>
          <Info size={18} color="#a06e18" />
        </div>
        <div className={styles.profitBannerText}>
          <strong>Financial Profitability Notice:</strong> Profit data is currently unavailable.
          Krishna Sweets product inventory does not store procurement/cost price (COGS) or packaging overheads.
          All figures shown represent verified top-line customer sales revenue and COD cash collections.
        </div>
      </div>

      {/* Low stock alert banner if any */}
      {kpis.lowStockCount > 0 && (
        <div className={styles.lowStockBanner}>
          <AlertTriangle size={18} color="#b91c1c" />
          <span>
            <strong>Inventory Alert:</strong> {kpis.lowStockCount} sweet(s) have low stock (≤ 5 units remaining):{' '}
            {lowStockProducts.map((p) => `${p.title} (${p.stock} left)`).join(', ')}.
          </span>
        </div>
      )}

      {/* Row 1: Period Top Revenue Milestones */}
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Financial Revenue Milestones</span>
      </div>

      <div className={styles.cardsGrid}>
        {/* Card 1: Today's Revenue */}
        <div className={styles.card}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel}>Today's Revenue</span>
            <div className={`${styles.iconWrap} ${styles.iconGold}`}>
              <IndianRupee size={16} />
            </div>
          </div>
          <div className={styles.cardValue}>{formatPrice(kpis.todaySalesRevenue || 0)}</div>
          <div className={styles.cardSub}>
            <span className={styles.subHighlight}>
              Collected: {formatPrice(kpis.todayCollectedRevenue || 0)}
            </span>
            <span className={styles.periodMuted}>IST Today</span>
          </div>
        </div>

        {/* Card 2: This Month's Revenue */}
        <div className={styles.card}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel}>This Month's Revenue</span>
            <div className={`${styles.iconWrap} ${styles.iconMaroon}`}>
              <Calendar size={16} />
            </div>
          </div>
          <div className={styles.cardValue}>{formatPrice(kpis.thisMonthRevenue || 0)}</div>
          <div className={styles.cardSub}>
            <span className={styles.subHighlight}>
              Collected: {formatPrice(kpis.thisMonthCollected || 0)}
            </span>
            <span className={styles.periodMuted}>Current Calendar Month</span>
          </div>
        </div>

        {/* Card 3: Calendar Year Revenue */}
        <div className={styles.card}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel}>Calendar Year {kpis.calendarYearLabel || ''}</span>
            <div className={`${styles.iconWrap} ${styles.iconGold}`}>
              <Wallet size={16} />
            </div>
          </div>
          <div className={styles.cardValue}>{formatPrice(kpis.calendarYearRevenue || 0)}</div>
          <div className={styles.cardSub}>
            <span className={styles.periodMuted}>Jan 1 – Dec 31, {kpis.calendarYearLabel}</span>
          </div>
        </div>

        {/* Card 4: Financial Year Revenue */}
        <div className={styles.card}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel}>{kpis.financialYearLabel || 'Financial Year'}</span>
            <div className={`${styles.iconWrap} ${styles.iconMaroon}`}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className={styles.cardValue}>{formatPrice(kpis.financialYearRevenue || 0)}</div>
          <div className={styles.cardSub}>
            <span className={styles.periodMuted}>Apr 1 – Mar 31 (Indian Fiscal Year)</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default SummaryCards;
