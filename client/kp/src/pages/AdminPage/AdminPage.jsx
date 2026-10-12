import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  Package,
  Plus,
  Search,
  Shield,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Container } from '@/components/layout/Container/Container';
import { Header } from '@/components/layout/Header/Header';
import { useAuth } from '@/context/AuthContext';
import { productService } from '@/services/productService';
import { formatPrice } from '@/utils/format';
import { ProductEditModal } from './ProductEditModal';
import styles from './AdminPage.module.css';

export function AdminPage() {
  const { user, isAdmin, loading: authLoading, openAuthModal } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'inStock' | 'outOfStock'

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

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

  useEffect(() => {
    loadProducts();
  }, []);

  const handleEdit = (prod) => {
    setEditingProduct(prod);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleDelete = async (prod) => {
    const id = prod._id || prod.id;
    if (window.confirm(`Are you sure you want to remove "${prod.name}" from the menu?`)) {
      try {
        await productService.deleteProduct(id);
        loadProducts();
      } catch (err) {
        alert(err.message || 'Failed to delete product.');
      }
    }
  };

  const handleToggleStock = async (prod) => {
    const id = prod._id || prod.id;
    try {
      await productService.toggleStock(id, prod.stock);
      loadProducts();
    } catch (err) {
      alert(err.message || 'Failed to update stock status.');
    }
  };

  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(unique)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'All' || p.category === selectedCategory;

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'inStock' && (p.stock ?? 0) > 0) ||
        (stockFilter === 'outOfStock' && (p.stock ?? 0) <= 0);

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const stats = useMemo(() => {
    const inStock = products.filter((p) => (p.stock ?? 0) > 0).length;
    const outOfStock = products.length - inStock;
    return {
      total: products.length,
      inStock,
      outOfStock,
    };
  }, [products]);

  // If user is not admin, show guard view
  if (!authLoading && !isAdmin) {
    return (
      <div className={styles.adminWrapper}>
        <Header cartCount={0} onCartOpen={() => {}} />
        <Container>
          <div className={styles.unauthorizedCard}>
            <Shield size={44} color="#a06e18" />
            <h2>Admin Portal Access</h2>
            <p>
              This section is reserved for the store owner and administrators to manage sweets, pricing, and menu details.
            </p>
            <button
              type="button"
              className={styles.addBtn}
              onClick={() => openAuthModal('login')}
            >
              Sign in with Admin Account
            </button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.adminWrapper}>
      <Header cartCount={0} onCartOpen={() => {}} />

      <section className={styles.hero}>
        <Container>
          <div className={styles.heroTop}>
            <div>
              <span className={styles.eyebrow}>
                <Shield size={14} /> Store Management Portal
              </span>
              <h1 className={styles.title}>Menu & Sweets Manager</h1>
              <p className={styles.subtitle}>
                Add new creations, adjust prices, edit descriptions, and update daily fresh stock in real-time.
              </p>
            </div>

            <button type="button" className={styles.addBtn} onClick={handleAddNew}>
              <Plus size={18} /> Add New Sweet
            </button>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Sweets on Menu</div>
              <div className={styles.statValue}>{stats.total}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Fresh & In Stock</div>
              <div className={styles.statValue} style={{ color: '#065f46' }}>
                {stats.inStock}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Sold Out / Drafts</div>
              <div className={styles.statValue} style={{ color: '#991b1b' }}>
                {stats.outOfStock}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container>
        <div className={styles.controlsBar}>
          <div className={styles.searchBox}>
            <Search size={17} color="#a06e18" />
            <input
              type="text"
              placeholder="Search sweets by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterPills}>
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                className={`${styles.pill} ${
                  selectedCategory === cat ? styles.pillActive : ''
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sweet / Item</th>
                <th>Category</th>
                <th>Price / Unit</th>
                <th>Stock Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                    No sweets found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isInStock = (prod.stock ?? 0) > 0;
                  return (
                    <tr key={prod.id || prod._id}>
                      <td>
                        <div className={styles.productCell}>
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className={styles.productThumb}
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/A_tray_full_of_Indian_sweets_mithai_desserts_c.jpg/1280px-A_tray_full_of_Indian_sweets_mithai_desserts_c.jpg';
                            }}
                          />
                          <div>
                            <div className={styles.productTitle}>{prod.name}</div>
                            {prod.badge && (
                              <span style={{ fontSize: '0.7rem', color: '#a06e18', fontWeight: 700 }}>
                                {prod.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={styles.productCategory}>
                          {prod.category}
                        </span>
                      </td>

                      <td>
                        <strong>{formatPrice(prod.price)}</strong>{' '}
                        <span style={{ color: '#777', fontSize: '0.8rem' }}>
                          / {prod.unit}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={`${styles.stockToggle} ${
                            isInStock ? styles.inStock : styles.outOfStock
                          }`}
                          onClick={() => handleToggleStock(prod)}
                          title="Click to toggle in-stock / sold-out"
                        >
                          {isInStock ? (
                            <>
                              <CheckCircle2 size={13} /> In Stock ({prod.stock})
                            </>
                          ) : (
                            <>
                              <XCircle size={13} /> Sold Out
                            </>
                          )}
                        </button>
                      </td>

                      <td>
                        <div className={styles.actionsCell}>
                          <button
                            type="button"
                            className={styles.editBtn}
                            onClick={() => handleEdit(prod)}
                          >
                            <Edit3 size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(prod)}
                            title="Remove from menu"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Container>

      <ProductEditModal
        product={editingProduct}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={loadProducts}
      />
    </div>
  );
}

export default AdminPage;
