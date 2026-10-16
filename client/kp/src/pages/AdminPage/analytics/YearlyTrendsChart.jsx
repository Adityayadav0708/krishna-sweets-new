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

export function YearlyTrendsChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getYearlyRevenue();
      setData(res);
    } catch (err) {
      console.error('Failed to load yearly revenue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartData = (data?.yearlyData || []).map((y) => ({
    year: String(y.year),
    revenue: y.revenue,
    orders: y.ordersCount,
    deliveredRevenue: y.deliveredRevenue,
  }));

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className={styles.customTooltip}>
          <div className={styles.tooltipTitle}>Year {item.year}</div>
          <div className={styles.tooltipRow} style={{ color: '#541212' }}>
            <span>Total Sales:</span>
            <strong>{formatPrice(item.revenue)}</strong>
          </div>
          <div className={styles.tooltipRow} style={{ color: '#047857' }}>
            <span>Delivered & Collected:</span>
            <strong>{formatPrice(item.deliveredRevenue)}</strong>
          </div>
          <div className={styles.tooltipMeta}>
            Orders: {item.orders}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div>
          <h3 className={styles.chartTitle}>Multi-Year Revenue Comparison</h3>
          <p className={styles.chartSub}>
            Historical growth and annual revenue turnover across all operational years
          </p>
        </div>
        <div className={styles.chartActions}>
          <button
            type="button"
            className={styles.refreshIconBtn}
            onClick={fetchData}
            title="Refresh yearly trends"
          >
            <RefreshCw size={13} className={loading ? styles.spin : ''} />
          </button>
        </div>
      </div>

      <div className={styles.chartBody} style={{ height: 260 }}>
        {loading ? (
          <div className={styles.chartLoader}>Loading yearly records...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1ece5" />
              <XAxis dataKey="year" stroke="#8c7365" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#8c7365"
                fontSize={12}
                tickLine={false}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip content={customTooltip} />
              <Bar
                dataKey="revenue"
                fill="#c99738"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default YearlyTrendsChart;
