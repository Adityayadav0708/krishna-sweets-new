import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { RefreshCw } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import { formatPrice } from '@/utils/format';
import styles from './ChartsCommon.module.css';

const STATUS_COLORS = {
  Confirmed: '#d97706',
  Preparing: '#f59e0b',
  'Out for Delivery': '#3b82f6',
  Delivered: '#10b981',
  Cancelled: '#ef4444',
};

export function OrderStatusPieChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getOrderStatus({});
      setData(res);
    } catch (err) {
      console.error('Failed to load order status distribution:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breakdownList = data?.statusBreakdown || data?.distribution || [];
  const chartData = breakdownList.map((s) => ({
    name: s.status,
    value: s.count,
    amount: s.totalAmount || 0,
    color: STATUS_COLORS[s.status] || '#8c7365',
  }));

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className={styles.customTooltip}>
          <div className={styles.tooltipTitle}>{item.name} Orders</div>
          <div className={styles.tooltipRow}>
            <span>Volume:</span>
            <strong>{item.value} orders</strong>
          </div>
          <div className={styles.tooltipRow}>
            <span>Associated Value:</span>
            <strong>{formatPrice(item.amount)}</strong>
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
          <h3 className={styles.chartTitle}>Order Status Distribution</h3>
          <p className={styles.chartSub}>
            Kitchen workflow states and completion rates
          </p>
        </div>
        <div className={styles.chartActions}>
          <button
            type="button"
            className={styles.refreshIconBtn}
            onClick={fetchData}
            title="Refresh order status stats"
          >
            <RefreshCw size={13} className={loading ? styles.spin : ''} />
          </button>
        </div>
      </div>

      <div className={styles.chartBody} style={{ height: 280 }}>
        {loading ? (
          <div className={styles.chartLoader}>Loading order status distribution...</div>
        ) : chartData.length === 0 ? (
          <div className={styles.chartLoader}>No orders in this period</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={customTooltip} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {data && (
        <div className={styles.chartFooter}>
          <span>
            Total Orders Analyzed: <strong>{data.totalOrders || 0}</strong>
          </span>
          <span>
            Fulfillment Rate:{' '}
            <strong style={{ color: '#047857' }}>
              {data.totalOrders
                ? Math.round(
                    ((breakdownList.find((s) => s.status === 'Delivered')?.count || 0) /
                      data.totalOrders) *
                      100
                  )
                : 0}
              %
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}

export default OrderStatusPieChart;
