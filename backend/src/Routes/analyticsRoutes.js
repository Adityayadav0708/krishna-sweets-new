import express from 'express';
import {
  getDashboardSummary,
  getMonthlyRevenue,
  getDailySales,
  getYearlyRevenue,
  getOrderStatusStats,
  getProductPerformance,
  getCategoryPerformance,
  getPaymentMethodStats,
} from '../controllers/analyticsController.js';

const router = express.Router();

// 1. Dashboard summary cards & comparisons
router.get('/summary', getDashboardSummary);

// 2. Monthly income & comparative trend
router.get('/monthly-revenue', getMonthlyRevenue);

// 3. Daily sales breakdown for selected month
router.get('/daily-sales', getDailySales);

// 4. Multi-year sales revenue overview
router.get('/yearly-revenue', getYearlyRevenue);

// 5. Order status breakdown
router.get('/order-status', getOrderStatusStats);

// 6. Top 10 best-selling sweets and size variants
router.get('/product-performance', getProductPerformance);

// 7. Category sales and revenue contribution
router.get('/category-performance', getCategoryPerformance);

// 8. Payment method and cash collection status
router.get('/payment-stats', getPaymentMethodStats);

export default router;
