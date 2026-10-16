import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, RefreshCw } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import { formatPrice } from '@/utils/format';
import styles from './ChartsCommon.module.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function DailySalesChart() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-indexed
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getDailySales(year, month);
      setData(res);
    } catch (err) {
      console.error('Failed to load daily sales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year, month]);

  const chartData = (data?.dailySales || []).map((d) => ({
    day: d.day,
    date: d.date,
    revenue: d.revenue,
    orders: d.ordersCount,
    collected: d.collectedRevenue,
  }));

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className={styles.customTooltip}>
          <div className={styles.tooltipTitle}>{item.date}</div>
          <div className={styles.tooltipRow} style={{ color: '#541212' }}>
            <span>Day Revenue:</span>
            <strong>{formatPrice(item.revenue)}</strong>
          </div>
          <div className={styles.tooltipRow} style={{ color: '#047857' }}>
            <span>Cash Collected:</span>
            <strong>{formatPrice(item.collected)}</strong>
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
          <h3 className={styles.chartTitle}>Daily Sales Breakdown</h3>
          <p className={styles.chartSub}>
            Day-by-day revenue velocity for {MONTH_NAMES[month - 1]} {year}
          </p>
        </div>
        <div className={styles.chartActions}>
          <div className={styles.selectWrap}>
            <Calendar size={14} color="#a06e18" />
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className={styles.monthSelect}
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={styles.yearSelect}
            >
              {[now.getFullYear(), now.getFullYear() - 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className={styles.refreshIconBtn}
            onClick={fetchData}
            title="Refresh daily sales"
          >
            <RefreshCw size={13} className={loading ? styles.spin : ''} />
          </button>
        </div>
      </div>

      <div className={styles.chartBody} style={{ height: 320 }}>
        {loading ? (
          <div className={styles.chartLoader}>Loading daily sales records...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="dailySalesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#541212" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#541212" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1ece5" />
              <XAxis
                dataKey="day"
                stroke="#8c7365"
                fontSize={11}
                tickLine={false}
                label={{ value: 'Day of Month', position: 'insideBottom', offset: -4, fontSize: 11, fill: '#8c7365' }}
              />
              <YAxis
                stroke="#8c7365"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip content={customTooltip} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#541212"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#dailySalesGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {data && (
        <div className={styles.chartFooter}>
          <span>
            Total Month Sales:{' '}
            <strong>{formatPrice(data.totalMonthRevenue || 0)}</strong>
          </span>
          <span>
            Month Orders Placed: <strong>{data.totalOrdersCount || 0}</strong>
          </span>
        </div>
      )}
    </div>
  );
}

export default DailySalesChart;
