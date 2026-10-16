import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { parsePeriodDates, calculatePercentageChange, getNowIST, toUtcDateFromIST } from '../utils/dateRangeHelper.js';

/**
 * Helper to compute order metrics for a given date window [startDate, endDate].
 * Excludes cancelled orders from recognized sales revenue.
 * For COD, collected amount is recognized when status is 'Delivered'.
 */
async function computeMetricsForRange(startDate, endDate) {
  const matchFilter = {
    createdAt: { $gte: startDate, $lte: endDate },
  };

  const orders = await Order.find(matchFilter).lean();

  const totalOrders = orders.length;
  let grossSales = 0;
  let collectedAmount = 0;
  let pendingCollection = 0;
  let cancelledOrders = 0;
  let deliveredOrders = 0;
  let pendingOrders = 0; // Confirmed, Preparing, Out for Delivery

  for (const ord of orders) {
    const status = (ord.status || 'Confirmed').toLowerCase();
    const amount = Number(ord.totalAmount) || 0;

    if (status === 'cancelled') {
      cancelledOrders += 1;
      continue; // Exclude cancelled from recognized revenue
    }

    grossSales += amount;

    if (status === 'delivered') {
      deliveredOrders += 1;
      collectedAmount += amount;
    } else {
      pendingOrders += 1;
      pendingCollection += amount;
    }
  }

  const eligibleOrdersCount = totalOrders - cancelledOrders;
  const aov = eligibleOrdersCount > 0 ? Math.round(grossSales / eligibleOrdersCount) : 0;

  return {
    totalOrders,
    eligibleOrdersCount,
    grossSales,
    collectedAmount,
    pendingCollection,
    deliveredOrders,
    pendingOrders,
    cancelledOrders,
    aov,
  };
}

/**
 * 1. GET /api/admin/analytics/summary
 * Primary dashboard KPIs with date filter and previous period comparison.
 */
export async function getDashboardSummary(req, res) {
  try {
    const { period = 'this_month', startDate: qStart, endDate: qEnd } = req.query;
    const { start, end, prevStart, prevEnd, periodLabel } = parsePeriodDates(period, qStart, qEnd);

    // Compute metrics for active period and comparison period
    const [currentMetrics, prevMetrics] = await Promise.all([
      computeMetricsForRange(start, end),
      computeMetricsForRange(prevStart, prevEnd),
    ]);

    // Registered customer counts
    const totalCustomers = await User.countDocuments({ role: { $ne: 'admin' } });
    const prevCustomers = await User.countDocuments({
      role: { $ne: 'admin' },
      createdAt: { $lte: prevEnd },
    });

    // Low stock products count
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
      .select('title category price stock unit')
      .lean();

    // Additional fixed periods for quick top cards: Today, This Month, Calendar Year, Financial Year
    const istNow = getNowIST();
    const curYear = istNow.getUTCFullYear();
    const curMonth = istNow.getUTCMonth();
    const curDay = istNow.getUTCDate();

    const todayStart = toUtcDateFromIST(curYear, curMonth, curDay, 0, 0, 0, 0);
    const todayEnd = toUtcDateFromIST(curYear, curMonth, curDay, 23, 59, 59, 999);
    const monthStart = toUtcDateFromIST(curYear, curMonth, 1, 0, 0, 0, 0);
    const monthEnd = toUtcDateFromIST(curYear, curMonth + 1, 0, 23, 59, 59, 999);
    const yearStart = toUtcDateFromIST(curYear, 0, 1, 0, 0, 0, 0);
    const yearEnd = toUtcDateFromIST(curYear, 11, 31, 23, 59, 59, 999);

    const fyStartYear = curMonth >= 3 ? curYear : curYear - 1;
    const fyStart = toUtcDateFromIST(fyStartYear, 3, 1, 0, 0, 0, 0);
    const fyEnd = toUtcDateFromIST(fyStartYear + 1, 2, 31, 23, 59, 59, 999);

    const [todayMetrics, thisMonthMetrics, calendarYearMetrics, fyMetrics] = await Promise.all([
      computeMetricsForRange(todayStart, todayEnd),
      computeMetricsForRange(monthStart, monthEnd),
      computeMetricsForRange(yearStart, yearEnd),
      computeMetricsForRange(fyStart, fyEnd),
    ]);

    // Financial calculations and comparisons
    const comparisons = {
      grossSales: calculatePercentageChange(currentMetrics.grossSales, prevMetrics.grossSales),
      collectedAmount: calculatePercentageChange(currentMetrics.collectedAmount, prevMetrics.collectedAmount),
      totalOrders: calculatePercentageChange(currentMetrics.totalOrders, prevMetrics.totalOrders),
      deliveredOrders: calculatePercentageChange(currentMetrics.deliveredOrders, prevMetrics.deliveredOrders),
      pendingOrders: calculatePercentageChange(currentMetrics.pendingOrders, prevMetrics.pendingOrders),
      cancelledOrders: calculatePercentageChange(currentMetrics.cancelledOrders, prevMetrics.cancelledOrders),
      aov: calculatePercentageChange(currentMetrics.aov, prevMetrics.aov),
      customers: calculatePercentageChange(totalCustomers, prevCustomers),
    };

    res.json({
      success: true,
      data: {
        filter: {
          period,
          periodLabel,
          startDate: start,
          endDate: end,
          prevStartDate: prevStart,
          prevEndDate: prevEnd,
        },
        kpis: {
          // Top summary cards required by prompt:
          todaySalesRevenue: todayMetrics.grossSales,
          todayCollectedRevenue: todayMetrics.collectedAmount,
          thisMonthRevenue: thisMonthMetrics.grossSales,
          thisMonthCollected: thisMonthMetrics.collectedAmount,
          calendarYearRevenue: calendarYearMetrics.grossSales,
          calendarYearLabel: `${curYear}`,
          financialYearRevenue: fyMetrics.grossSales,
          financialYearLabel: `FY ${fyStartYear}-${String(fyStartYear + 1).slice(-2)}`,

          // Selected period metrics:
          grossSales: currentMetrics.grossSales,
          collectedRevenue: currentMetrics.collectedAmount,
          pendingCollection: currentMetrics.pendingCollection,
          totalOrders: currentMetrics.totalOrders,
          completedOrders: currentMetrics.deliveredOrders,
          pendingOrders: currentMetrics.pendingOrders,
          cancelledOrders: currentMetrics.cancelledOrders,
          averageOrderValue: currentMetrics.aov,
          totalCustomers,
          lowStockCount: lowStockProducts.length,
          profitData: {
            available: false,
            message: 'Profit data unavailable (Requires product cost price & expense tracking)',
          },
        },
        comparisons,
        lowStockProducts,
      },
    });
  } catch (err) {
    console.error('getDashboardSummary error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch analytics summary' });
  }
}

/**
 * 2. GET /api/admin/analytics/monthly-revenue
 * All 12 months for selected calendar year + prior year comparison.
 */
export async function getMonthlyRevenue(req, res) {
  try {
    const istNow = getNowIST();
    const targetYear = Number(req.query.year) || istNow.getUTCFullYear();
    const compareYear = targetYear - 1;

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const currentYearData = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i,
      month: months[i],
      revenue: 0,
      collected: 0,
      ordersCount: 0,
    }));

    const prevYearData = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i,
      month: months[i],
      revenue: 0,
      collected: 0,
      ordersCount: 0,
    }));

    // Query non-cancelled orders for target and prior year
    const startRange = toUtcDateFromIST(compareYear, 0, 1, 0, 0, 0, 0);
    const endRange = toUtcDateFromIST(targetYear, 11, 31, 23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: startRange, $lte: endRange },
      status: { $ne: 'Cancelled' },
    }).lean();

    for (const ord of orders) {
      const dt = new Date(new Date(ord.createdAt).getTime() + 5.5 * 60 * 60 * 1000);
      const yr = dt.getUTCFullYear();
      const m = dt.getUTCMonth();
      const amt = Number(ord.totalAmount) || 0;
      const isDelivered = (ord.status || '').toLowerCase() === 'delivered';

      if (yr === targetYear && m >= 0 && m < 12) {
        currentYearData[m].revenue += amt;
        currentYearData[m].ordersCount += 1;
        if (isDelivered) currentYearData[m].collected += amt;
      } else if (yr === compareYear && m >= 0 && m < 12) {
        prevYearData[m].revenue += amt;
        prevYearData[m].ordersCount += 1;
        if (isDelivered) prevYearData[m].collected += amt;
      }
    }

    const merged = months.map((month, i) => ({
      month,
      currentYearRevenue: currentYearData[i].revenue,
      currentYearCollected: currentYearData[i].collected,
      currentYearOrders: currentYearData[i].ordersCount,
      prevYearRevenue: prevYearData[i].revenue,
      prevYearCollected: prevYearData[i].collected,
      prevYearOrders: prevYearData[i].ordersCount,
    }));

    const monthlyData = merged.map((m, idx) => ({
      month: idx + 1,
      monthName: m.month,
      revenue: m.currentYearRevenue,
      priorYearRevenue: m.prevYearRevenue,
      collected: m.currentYearCollected,
      ordersCount: m.currentYearOrders,
    }));

    const totalCur = currentYearData.reduce((s, m) => s + m.revenue, 0);
    const totalPrev = prevYearData.reduce((s, m) => s + m.revenue, 0);

    res.json({
      success: true,
      data: {
        year: targetYear,
        compareYear,
        months: merged,
        monthlyData,
        totalCurrentYearRevenue: totalCur,
        totalYearRevenue: totalCur,
        totalPrevYearRevenue: totalPrev,
        priorYearTotalRevenue: totalPrev,
      },
    });
  } catch (err) {
    console.error('getMonthlyRevenue error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch monthly revenue' });
  }
}

/**
 * 3. GET /api/admin/analytics/daily-sales
 * Daily sales for every day of a selected month & year (including zero-sales days).
 */
export async function getDailySales(req, res) {
  try {
    const istNow = getNowIST();
    const year = Number(req.query.year) || istNow.getUTCFullYear();
    let monthIndex = istNow.getUTCMonth();
    if (req.query.month !== undefined) {
      const parsed = Number(req.query.month);
      monthIndex = parsed >= 1 && parsed <= 12 ? parsed - 1 : parsed;
    }

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const start = toUtcDateFromIST(year, monthIndex, 1, 0, 0, 0, 0);
    const end = toUtcDateFromIST(year, monthIndex, daysInMonth, 23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: { $ne: 'Cancelled' },
    }).lean();

    const dailyMap = {};
    for (let day = 1; day <= daysInMonth; day++) {
      dailyMap[day] = {
        day: `${day}`,
        date: `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        revenue: 0,
        collected: 0,
        ordersCount: 0,
      };
    }

    for (const ord of orders) {
      const dt = new Date(new Date(ord.createdAt).getTime() + 5.5 * 60 * 60 * 1000);
      const d = dt.getUTCDate();
      const amt = Number(ord.totalAmount) || 0;
      const isDelivered = (ord.status || '').toLowerCase() === 'delivered';

      if (dailyMap[d]) {
        dailyMap[d].revenue += amt;
        dailyMap[d].ordersCount += 1;
        if (isDelivered) dailyMap[d].collected += amt;
      }
    }

    const days = Object.values(dailyMap);
    const totalMonthRevenue = days.reduce((s, d) => s + d.revenue, 0);
    const totalMonthOrders = days.reduce((s, d) => s + d.ordersCount, 0);

    res.json({
      success: true,
      data: {
        year,
        month: monthIndex + 1,
        daysInMonth,
        days,
        dailySales: days,
        totalMonthRevenue,
        totalMonthOrders,
        totalOrdersCount: totalMonthOrders,
      },
    });
  } catch (err) {
    console.error('getDailySales error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch daily sales' });
  }
}

/**
 * 4. GET /api/admin/analytics/yearly-revenue
 * Revenue trends across all calendar years in database.
 */
export async function getYearlyRevenue(req, res) {
  try {
    const orders = await Order.find({ status: { $ne: 'Cancelled' } }).lean();

    const yearMap = {};

    for (const ord of orders) {
      const dt = new Date(new Date(ord.createdAt).getTime() + 5.5 * 60 * 60 * 1000);
      const yr = dt.getUTCFullYear();
      const amt = Number(ord.totalAmount) || 0;
      const isDelivered = (ord.status || '').toLowerCase() === 'delivered';

      if (!yearMap[yr]) {
        yearMap[yr] = { year: `${yr}`, revenue: 0, collected: 0, ordersCount: 0 };
      }
      yearMap[yr].revenue += amt;
      yearMap[yr].ordersCount += 1;
      if (isDelivered) yearMap[yr].collected += amt;
    }

    const years = Object.values(yearMap).sort((a, b) => Number(a.year) - Number(b.year));

    res.json({
      success: true,
      data: {
        years,
        yearlyData: years.map((y) => ({
          year: y.year,
          revenue: y.revenue,
          ordersCount: y.ordersCount,
          deliveredRevenue: y.collected,
        })),
      },
    });
  } catch (err) {
    console.error('getYearlyRevenue error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch yearly revenue' });
  }
}

/**
 * 5. GET /api/admin/analytics/order-status-stats
 * Real distribution across supported statuses: Confirmed, Preparing, Out for Delivery, Delivered, Cancelled.
 */
export async function getOrderStatusStats(req, res) {
  try {
    const { period = 'this_month', startDate: qStart, endDate: qEnd } = req.query;
    const { start, end, periodLabel } = parsePeriodDates(period, qStart, qEnd);

    const orders = await Order.find({ createdAt: { $gte: start, $lte: end } }).lean();

    const counts = {
      Confirmed: 0,
      Preparing: 0,
      'Out for Delivery': 0,
      Delivered: 0,
      Cancelled: 0,
    };

    for (const ord of orders) {
      let st = ord.status || 'Confirmed';
      if (st.toLowerCase() === 'pending') st = 'Confirmed';
      if (counts[st] !== undefined) {
        counts[st] += 1;
      } else {
        counts.Confirmed += 1;
      }
    }

    const distribution = Object.entries(counts).map(([status, count]) => ({
      status,
      count,
      percentage: orders.length > 0 ? Math.round((count / orders.length) * 1000) / 10 : 0,
    }));

    res.json({
      success: true,
      data: {
        totalOrders: orders.length,
        periodLabel,
        distribution,
        statusBreakdown: distribution,
      },
    });
  } catch (err) {
    console.error('getOrderStatusStats error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch order status stats' });
  }
}

/**
 * 6. GET /api/admin/analytics/product-performance
 * Top 10 best-selling sweets by quantity and revenue with portion weight breakdown.
 */
export async function getProductPerformance(req, res) {
  try {
    const { period = 'this_month', startDate: qStart, endDate: qEnd, limit = 10 } = req.query;
    const { start, end, periodLabel } = parsePeriodDates(period, qStart, qEnd);

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: { $ne: 'Cancelled' },
    }).lean();

    const productMap = {};

    for (const ord of orders) {
      if (!Array.isArray(ord.items)) continue;
      for (const item of ord.items) {
        const name = item.name || 'Artisanal Sweet';
        const key = name;
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        const itemRevenue = price * qty;
        const size = item.size || '500g';

        if (!productMap[key]) {
          productMap[key] = {
            name,
            totalQuantity: 0,
            totalRevenue: 0,
            sizes: {},
            variants: {},
          };
        }

        productMap[key].totalQuantity += qty;
        productMap[key].totalRevenue += itemRevenue;
        productMap[key].sizes[size] = (productMap[key].sizes[size] || 0) + qty;
        productMap[key].variants[size] = (productMap[key].variants[size] || 0) + qty;
      }
    }

    const maxItems = Number(limit) || 10;
    const topByRevenue = Object.values(productMap)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, maxItems)
      .map((p) => ({
        ...p,
        sizeBreakdown: Object.entries(p.sizes).map(([size, quantity]) => `${size}: ${quantity}`).join(', '),
      }));

    const topByQuantity = Object.values(productMap)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, maxItems)
      .map((p) => ({
        ...p,
        sizeBreakdown: Object.entries(p.sizes).map(([size, quantity]) => `${size}: ${quantity}`).join(', '),
      }));

    res.json({
      success: true,
      data: {
        periodLabel,
        topProducts: topByRevenue,
        topByRevenue,
        topByQuantity,
      },
    });
  } catch (err) {
    console.error('getProductPerformance error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch product performance' });
  }
}

/**
 * 7. GET /api/admin/analytics/category-performance
 * Sales volume and revenue by sweet collection.
 */
export async function getCategoryPerformance(req, res) {
  try {
    const { period = 'this_month', startDate: qStart, endDate: qEnd } = req.query;
    const { start, end, periodLabel } = parsePeriodDates(period, qStart, qEnd);

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: { $ne: 'Cancelled' },
    }).lean();

    const dbProducts = await Product.find({}).lean();
    const prodCategoryMap = new Map();
    for (const p of dbProducts) {
      prodCategoryMap.set(p._id.toString(), p.category?.name || p.category || 'Signature');
      prodCategoryMap.set(p.title?.toLowerCase(), p.category?.name || p.category || 'Signature');
    }

    const categoryMap = {};

    for (const ord of orders) {
      if (!Array.isArray(ord.items)) continue;
      for (const item of ord.items) {
        const pidStr = item.productId?.toString();
        const cat =
          prodCategoryMap.get(pidStr) ||
          prodCategoryMap.get(item.name?.toLowerCase()) ||
          'Signature';

        const qty = Number(item.quantity) || 1;
        const rev = (Number(item.price) || 0) * qty;

        if (!categoryMap[cat]) {
          categoryMap[cat] = { category: cat, revenue: 0, itemsSold: 0 };
        }
        categoryMap[cat].revenue += rev;
        categoryMap[cat].itemsSold += qty;
      }
    }

    const categories = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);

    res.json({
      success: true,
      data: {
        periodLabel,
        categories,
      },
    });
  } catch (err) {
    console.error('getCategoryPerformance error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch category performance' });
  }
}

/**
 * 8. GET /api/admin/analytics/payment-methods
 * Breakdown of orders by payment mode and actual collection state.
 */
export async function getPaymentMethodStats(req, res) {
  try {
    const { period = 'this_month', startDate: qStart, endDate: qEnd } = req.query;
    const { start, end, periodLabel } = parsePeriodDates(period, qStart, qEnd);

    const orders = await Order.find({ createdAt: { $gte: start, $lte: end } }).lean();

    let codDelivered = 0;
    let codDeliveredCount = 0;
    let codPending = 0;
    let codPendingCount = 0;
    let codCancelled = 0;
    let codCancelledCount = 0;

    for (const ord of orders) {
      const st = (ord.status || '').toLowerCase();
      const amt = Number(ord.totalAmount) || 0;

      if (st === 'cancelled') {
        codCancelled += amt;
        codCancelledCount += 1;
      } else if (st === 'delivered') {
        codDelivered += amt;
        codDeliveredCount += 1;
      } else {
        codPending += amt;
        codPendingCount += 1;
      }
    }

    res.json({
      success: true,
      data: {
        periodLabel,
        totalOrders: orders.length,
        paymentMethods: [
          {
            method: 'Cash on Delivery (COD)',
            collectedRevenue: codDelivered,
            collectedOrders: codDeliveredCount,
            pendingRevenue: codPending,
            pendingOrders: codPendingCount,
            cancelledRevenue: codCancelled,
            cancelledOrders: codCancelledCount,
          },
        ],
      },
    });
  } catch (err) {
    console.error('getPaymentMethodStats error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch payment method stats' });
  }
}
