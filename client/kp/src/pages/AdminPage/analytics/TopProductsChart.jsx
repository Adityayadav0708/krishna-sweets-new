import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RefreshCw } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import { formatPrice } from '@/utils/format';
import styles from './ChartsCommon.module.css';
import topStyles from './TopProducts.module.css';

export function TopProductsChart() {
  const [metric, setMetric] = useState('revenue');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getProductPerformance({ limit: 10 });
      setData(res);
    } catch (err) {
      console.error('Failed to load product performance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const rawList = metric === 'revenue'
    ? (data?.topByRevenue || [])
    : (data?.topByQuantity || []);

  const chartData = rawList.map((p) => ({
    name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name,
    fullName: p.name,
    value: metric === 'revenue' ? p.totalRevenue : p.totalQuantity,
    revenue: p.totalRevenue,
    quantity: p.totalQuantity,
    variants: p.variants || {},
    category: p.category,
  }));

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className={styles.customTooltip}>
          <div className={styles.tooltipTitle}>{item.fullName}</div>
          <div className={styles.tooltipRow} style={{ color: '#541212' }}>
            <span>Revenue Generated:</span>
            <strong>{formatPrice(item.revenue)}</strong>
          </div>
          <div className={styles.tooltipRow} style={{ color: '#047857' }}>
            <span>Units Sold:</span>
            <strong>{item.quantity} packs</strong>
          </div>
          {item.variants && Object.keys(item.variants).length > 0 && (
            <div className={topStyles.variantList}>
              <div className={topStyles.variantHeading}>Portion Breakdown:</div>
              {Object.entries(item.variants).map(([size, count]) => (
                <div key={size} className={topStyles.variantRow}>
                  <span>{size}:</span>
                  <strong>{count} sold</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div>
          <h3 className={styles.chartTitle}>Top 10 Best-Selling Sweets</h3>
          <p className={styles.chartSub}>
            Ranked by customer demand and portion weight variations
          </p>
        </div>
        <div className={styles.chartActions}>
          <div className={styles.toggleBtnGroup}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${metric === 'revenue' ? styles.toggleBtnActive : ''}`}
              onClick={() => setMetric('revenue')}
            >
              By Revenue (₹)
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${metric === 'quantity' ? styles.toggleBtnActive : ''}`}
              onClick={() => setMetric('quantity')}
            >
              By Units Sold
            </button>
          </div>
          <button
            type="button"
            className={styles.refreshIconBtn}
            onClick={fetchData}
            title="Refresh top products"
          >
            <RefreshCw size={13} className={loading ? styles.spin : ''} />
          </button>
        </div>
      </div>

      <div className={styles.chartBody} style={{ height: 320 }}>
        {loading ? (
          <div className={styles.chartLoader}>Loading product rankings...</div>
        ) : chartData.length === 0 ? (
          <div className={styles.chartLoader}>No sweets sales in this period</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 25, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1ece5" />
              <XAxis
                type="number"
                stroke="#8c7365"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => (metric === 'revenue' ? `₹${val}` : val)}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#8c7365"
                fontSize={11}
                tickLine={false}
                width={100}
              />
              <Tooltip content={customTooltip} />
              <Bar
                dataKey="value"
                fill="#541212"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {rawList.length > 0 && (
        <div className={topStyles.variantPillsContainer}>
          <span className={topStyles.pillsLabel}>Top variants snapshot:</span>
          {rawList.slice(0, 4).map((item) => (
            <span key={item.name} className={topStyles.sweetPill}>
              {item.name}: {Object.entries(item.variants || {}).map(([s, c]) => `${s} (${c})`).join(', ') || `${item.totalQuantity} sold`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default TopProductsChart;
