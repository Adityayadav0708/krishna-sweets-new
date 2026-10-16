import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { RefreshCw } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import { formatPrice } from '@/utils/format';
import styles from './ChartsCommon.module.css';

const PAYMENT_COLORS = {
  Collected: '#10b981', // Delivered COD
  'In Delivery Pipeline': '#3b82f6', // Confirmed/Preparing/Out for Delivery
  Cancelled: '#ef4444', // Excluded
};

export function CategoryAndPaymentCharts() {
  const [catData, setCatData] = useState(null);
  const [payData, setPayData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categories, payments] = await Promise.all([
        analyticsService.getCategoryPerformance({}),
        analyticsService.getPaymentStats({}),
      ]);
      setCatData(categories);
      setPayData(payments);
    } catch (err) {
      console.error('Failed to load category and payment stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const categoryChartData = (catData?.categories || []).map((c) => ({
    name: c.category,
    revenue: c.revenue,
    quantity: c.quantity,
  }));

  const cashFlowChartData = [
    {
      name: 'Cash Collected (Delivered)',
      value: payData?.codCollectionStatus?.collected?.amount || 0,
      orders: payData?.codCollectionStatus?.collected?.orders || 0,
      color: PAYMENT_COLORS.Collected,
    },
    {
      name: 'In Transit Pipeline',
      value: payData?.codCollectionStatus?.inPipeline?.amount || 0,
      orders: payData?.codCollectionStatus?.inPipeline?.orders || 0,
      color: PAYMENT_COLORS['In Delivery Pipeline'],
    },
    {
      name: 'Lost to Cancellation',
      value: payData?.codCollectionStatus?.cancelled?.amount || 0,
      orders: payData?.codCollectionStatus?.cancelled?.orders || 0,
      color: PAYMENT_COLORS.Cancelled,
    },
  ].filter((item) => item.value > 0 || item.orders > 0);

  const customPayTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className={styles.customTooltip}>
          <div className={styles.tooltipTitle}>{item.name}</div>
          <div className={styles.tooltipRow}>
            <span>Amount:</span>
            <strong>{formatPrice(item.value)}</strong>
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
      {/* 1. Category Performance */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.chartTitle}>Category Sales Breakdown</h3>
            <p className={styles.chartSub}>Revenue generated across sweet collections</p>
          </div>
          <button
            type="button"
            className={styles.refreshIconBtn}
            onClick={fetchData}
            title="Refresh category performance"
          >
            <RefreshCw size={13} className={loading ? styles.spin : ''} />
          </button>
        </div>

        <div className={styles.chartBody} style={{ height: 260 }}>
          {loading ? (
            <div className={styles.chartLoader}>Loading categories...</div>
          ) : categoryChartData.length === 0 ? (
            <div className={styles.chartLoader}>No category sales in this period</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryChartData}
                margin={{ top: 10, right: 15, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1ece5" />
                <XAxis dataKey="name" stroke="#8c7365" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#8c7365"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'revenue' ? formatPrice(value) : value,
                    name === 'revenue' ? 'Revenue' : 'Units',
                  ]}
                />
                <Bar dataKey="revenue" fill="#a06e18" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. COD Cash Collection Status */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.chartTitle}>Cash Collection & Pipeline</h3>
            <p className={styles.chartSub}>Cash-on-Delivery physical collection status</p>
          </div>
        </div>

        <div className={styles.chartBody} style={{ height: 260 }}>
          {loading ? (
            <div className={styles.chartLoader}>Loading cash flow stats...</div>
          ) : cashFlowChartData.length === 0 ? (
            <div className={styles.chartLoader}>No cash orders in this period</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cashFlowChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {cashFlowChartData.map((entry, index) => (
                    <Cell key={`pay-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={customPayTooltip} />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {payData && (
          <div className={styles.chartFooter}>
            <span>
              Realized Cash (Delivered):{' '}
              <strong style={{ color: '#047857' }}>
                {formatPrice(payData?.codCollectionStatus?.collected?.amount || 0)}
              </strong>
            </span>
            <span>
              In Pipeline:{' '}
              <strong style={{ color: '#2563eb' }}>
                {formatPrice(payData?.codCollectionStatus?.inPipeline?.amount || 0)}
              </strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryAndPaymentCharts;
