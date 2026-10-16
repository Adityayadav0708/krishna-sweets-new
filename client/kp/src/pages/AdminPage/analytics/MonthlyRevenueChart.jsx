import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, RefreshCw } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import { formatPrice } from '@/utils/format';
import styles from './ChartsCommon.module.css';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function MonthlyRevenueChart() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async (force = false) => {
    try {
      setLoading(true);
      const res = await analyticsService.getMonthlyRevenue(year, force);
      setData(res);
    } catch (err) {
      console.error('Failed to load monthly revenue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year]);

  const chartData = (data?.monthlyData || []).map((m) => ({
    name: MONTH_NAMES[m.month - 1] || `M${m.month}`,
    [String(year)]: m.revenue,
    [String(year - 1)]: m.priorYearRevenue || 0,
    orders: m.ordersCount,
  }));

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const cur = payload.find((p) => p.dataKey === String(year));
      const prior = payload.find((p) => p.dataKey === String(year - 1));
      return (
        <div className={styles.customTooltip}>
          <div className={styles.tooltipTitle}>{label} Revenue</div>
          {cur && (
            <div className={styles.tooltipRow} style={{ color: '#541212' }}>
              <span>{year}:</span>
              <strong>{formatPrice(cur.value)}</strong>
            </div>
          )}
          {prior && (
            <div className={styles.tooltipRow} style={{ color: '#a06e18' }}>
              <span>{year - 1} (Prior):</span>
              <strong>{formatPrice(prior.value)}</strong>
            </div>
          )}
          {cur?.payload?.orders !== undefined && (
            <div className={styles.tooltipMeta}>
              Orders placed: {cur.payload.orders}
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
          <h3 className={styles.chartTitle}>Monthly Revenue Trend & YoY Comparison</h3>
          <p className={styles.chartSub}>
            Annual income distribution across all 12 calendar months
          </p>
        </div>
        <div className={styles.chartActions}>
          <div className={styles.selectWrap}>
            <Calendar size={14} color="#a06e18" />
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={styles.yearSelect}
            >
              {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className={styles.refreshIconBtn}
            onClick={() => fetchData(true)}
            title="Force refresh from server"
          >
            <RefreshCw size={13} className={loading ? styles.spin : ''} />
          </button>
        </div>
      </div>

      <div className={styles.chartBody} style={{ height: 320 }}>
        {loading ? (
          <div className={styles.chartLoader}>Loading monthly records...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1ece5" />
              <XAxis dataKey="name" stroke="#8c7365" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#8c7365"
                fontSize={12}
                tickLine={false}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip content={customTooltip} />
              <Legend
                wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
                iconType="circle"
              />
              <Bar
                dataKey={String(year)}
                name={`Current Year (${year})`}
                fill="#541212"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey={String(year - 1)}
                name={`Prior Year (${year - 1})`}
                fill="#c99738"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {data && (
        <div className={styles.chartFooter}>
          <span>
            Annual Total ({year}):{' '}
            <strong>{formatPrice(data.totalYearRevenue || 0)}</strong>
          </span>
          {data.priorYearTotalRevenue > 0 && (
            <span>
              Prior Year Total ({year - 1}):{' '}
              <strong>{formatPrice(data.priorYearTotalRevenue || 0)}</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default MonthlyRevenueChart;
