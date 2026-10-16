import api from '@/api/client';

/* ─── Simple in-memory TTL cache ────────────────────────────────────
   Stores { data, expiresAt } keyed by a string.
   TTL = 5 minutes — fine for a small admin panel.
   Pass force=true (refresh button) to bypass and re-fetch fresh data.
─────────────────────────────────────────────────────────────────── */
const _cache = new Map();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

function cached(key, fetcher, force = false) {
  const hit = _cache.get(key);
  if (!force && hit && hit.expiresAt > Date.now()) {
    return Promise.resolve(hit.data);
  }
  return fetcher().then((data) => {
    _cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
    return data;
  });
}

export const analyticsService = {
  /** Clear the entire cache (call after any data-mutating action) */
  invalidateAll() { _cache.clear(); },

  /**
   * 1. Top Summary Cards & Period Comparisons
   * @param {Object} params - { period, startDate, endDate }
   * @param {boolean} force - bypass cache
   */
  getSummary(params = {}, force = false) {
    return cached(`summary:${JSON.stringify(params)}`, async () => {
      const res = await api.get('/admin/analytics/summary', { params });
      return res.data?.data;
    }, force);
  },

  /**
   * 2. Monthly Revenue (12 months + Prior Year comparison)
   * @param {number} year
   * @param {boolean} force - bypass cache
   */
  getMonthlyRevenue(year, force = false) {
    return cached(`monthly:${year}`, async () => {
      const res = await api.get('/admin/analytics/monthly-revenue', {
        params: year ? { year } : {},
      });
      return res.data?.data;
    }, force);
  },

  /**
   * 3. Daily Sales for selected Month
   * @param {number} year
   * @param {number} month - 1-indexed
   * @param {boolean} force - bypass cache
   */
  getDailySales(year, month, force = false) {
    return cached(`daily:${year}-${month}`, async () => {
      const res = await api.get('/admin/analytics/daily-sales', {
        params: { year, month },
      });
      return res.data?.data;
    }, force);
  },

  /**
   * 4. Multi-Year Sales Comparison
   * @param {boolean} force - bypass cache
   */
  getYearlyRevenue(force = false) {
    return cached('yearly', async () => {
      const res = await api.get('/admin/analytics/yearly-revenue');
      return res.data?.data;
    }, force);
  },

  /**
   * 5. Order Status Breakdown
   * @param {Object} params
   * @param {boolean} force - bypass cache
   */
  getOrderStatus(params = {}, force = false) {
    return cached(`order-status:${JSON.stringify(params)}`, async () => {
      const res = await api.get('/admin/analytics/order-status', { params });
      return res.data?.data;
    }, force);
  },

  /**
   * 6. Best-Selling Sweets & Size Variant Breakdown
   * @param {Object} params
   * @param {boolean} force - bypass cache
   */
  getProductPerformance(params = {}, force = false) {
    return cached(`product-perf:${JSON.stringify(params)}`, async () => {
      const res = await api.get('/admin/analytics/product-performance', { params });
      return res.data?.data;
    }, force);
  },

  /**
   * 7. Category Performance
   * @param {Object} params
   * @param {boolean} force - bypass cache
   */
  getCategoryPerformance(params = {}, force = false) {
    return cached(`cat-perf:${JSON.stringify(params)}`, async () => {
      const res = await api.get('/admin/analytics/category-performance', { params });
      return res.data?.data;
    }, force);
  },

  /**
   * 8. Payment Method & Cash Collection Breakdown
   * @param {Object} params
   * @param {boolean} force - bypass cache
   */
  getPaymentStats(params = {}, force = false) {
    return cached(`payment:${JSON.stringify(params)}`, async () => {
      const res = await api.get('/admin/analytics/payment-stats', { params });
      return res.data?.data;
    }, force);
  },
};

export default analyticsService;
