import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { productService } from '@/services/productService';
import { orderService } from '@/services/orderService';
import { analyticsService } from '@/services/analyticsService';

// Layout & UI Components
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { AdminToast } from './components/AdminToast';

// Domain Tabs
import { OrdersTab } from './orders/OrdersTab';
import { MenuTab } from './menu/MenuTab';
import { ProductEditModal } from './menu/ProductEditModal';

import styles from './AdminPage.module.css';

// Lazy-load Analytics dashboard to code-split Recharts (~416KB bundle)
const AnalyticsDashboard = lazy(() => import('./analytics/AnalyticsDashboard'));

export function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, logout } = useAuth();

  const [adminTab, setAdminTab] = useState('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (_) {}
    navigate('/');
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async (silent = false) => {
    try {
      if (!silent) setOrdersLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders for admin:', err);
      if (!silent) {
        showToast(err.message || 'Failed to refresh orders', 'error');
      }
    } finally {
      if (!silent) setOrdersLoading(false);
    }
  };

  // Initial fetch and 60s silent polling for orders
  useEffect(() => {
    if (!authLoading && isAdmin) {
      loadProducts();
      loadOrders();

      const pollInterval = setInterval(() => {
        loadOrders(true);
      }, 60000);

      return () => clearInterval(pollInterval);
    }
  }, [authLoading, isAdmin]);

  // Optimistic order status update
  const handleUpdateStatus = async (orderId, newStatus) => {
    const prevOrder = orders.find((o) => o._id === orderId);
    if (!prevOrder || prevOrder.status === newStatus) return;

    if (newStatus === 'Cancelled') {
      const confirmed = window.confirm(
        `Are you sure you want to mark order #${String(orderId).slice(-6).toUpperCase()} as Cancelled?`
      );
      if (!confirmed) return;
    }

    const previousOrders = orders;
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      analyticsService.invalidateAll();
      showToast(`Order status updated to "${newStatus}"`, 'success');
    } catch (err) {
      setOrders(previousOrders);
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  // Optimistic product delete
  const handleDelete = async (prod) => {
    const id = prod._id || prod.id;
    if (window.confirm(`Are you sure you want to remove "${prod.name}" from the menu?`)) {
      const previousProducts = products;
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));

      try {
        await productService.deleteProduct(id);
        analyticsService.invalidateAll();
        showToast(`"${prod.name}" removed from menu`, 'success');
      } catch (err) {
        setProducts(previousProducts);
        showToast(err.message || 'Failed to delete product.', 'error');
      }
    }
  };

  // Optimistic stock toggle
  const handleToggleStock = async (prod) => {
    const id = prod._id || prod.id;
    const isCurrentlyInStock = (prod.stock ?? 0) > 0;
    const newStock = isCurrentlyInStock ? 0 : 25;
    const previousProducts = products;

    setProducts((prev) =>
      prev.map((p) =>
        p._id === id || p.id === id ? { ...p, stock: newStock } : p
      )
    );

    try {
      await productService.toggleStock(id, prod.stock);
      analyticsService.invalidateAll();
      showToast(
        `"${prod.name}" marked as ${newStock > 0 ? 'In Stock (25)' : 'Sold Out'}`,
        'success'
      );
    } catch (err) {
      setProducts(previousProducts);
      showToast(err.message || 'Failed to update stock status.', 'error');
    }
  };

  const handleEdit = (prod) => {
    setEditingProduct(prod);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  // Stats computations
  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(unique)];
  }, [products]);

  const stats = useMemo(() => {
    const inStock = products.filter((p) => (p.stock ?? 0) > 0).length;
    return { total: products.length, inStock, outOfStock: products.length - inStock };
  }, [products]);

  const revenueStats = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'Cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const activeOrders = orders.filter(
      (o) => o.status === 'Confirmed' || o.status === 'Preparing' || o.status === 'Out for Delivery'
    ).length;
    return { totalRevenue, activeOrders };
  }, [orders]);

  // Auth fallback guard
  if (!authLoading && !isAdmin) {
    return null;
  }

  return (
    <div className={styles.dashboardRoot}>
      {/* ── Sidebar ── */}
      <AdminSidebar
        adminTab={adminTab}
        onSelectTab={setAdminTab}
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
        ordersCount={orders.length}
        productsCount={products.length}
        revenueStats={revenueStats}
        user={user}
        onLogout={handleLogout}
      />

      {/* ── Main Workspace ── */}
      <div className={styles.mainArea}>
        {/* Header & KPI Summary */}
        <AdminHeader
          adminTab={adminTab}
          onOpenSidebar={() => setSidebarOpen(true)}
          onAddNew={handleAddNew}
          user={user}
          stats={stats}
          revenueStats={revenueStats}
          onLogout={handleLogout}
        />

        {/* Dynamic Tab Body */}
        <main className={styles.pageContent}>
          {adminTab === 'analytics' && (
            <Suspense
              fallback={
                <div className={styles.analyticsFallback}>
                  <div className={styles.spinner} />
                  <p>Loading analytics graphs...</p>
                </div>
              }
            >
              <AnalyticsDashboard />
            </Suspense>
          )}

          {adminTab === 'orders' && (
            <OrdersTab
              orders={orders}
              onUpdateStatus={handleUpdateStatus}
              onRefresh={() => loadOrders(false)}
              ordersLoading={ordersLoading}
            />
          )}

          {adminTab === 'sweets' && (
            <MenuTab
              products={products}
              categories={categories}
              onToggleStock={handleToggleStock}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </main>
      </div>

      {/* ── Modals & Notifications ── */}
      <ProductEditModal
        product={editingProduct}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={loadProducts}
      />

      <AdminToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default AdminPage;
