import { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
} from 'lucide-react';
import { formatPrice } from '@/utils/format';
import styles from './MenuTab.module.css';

export function MenuTab({
  products = [],
  categories = [],
  onToggleStock,
  onEdit,
  onDelete,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('all');

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

  return (
    <div>
      {/* ── Search & Category Filter Pills ── */}
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
              key={cat}
              type="button"
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

      {/* ── Sweets Table ── */}
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
                          loading="lazy"
                          className={styles.productThumb}
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/A_tray_full_of_Indian_sweets_mithai_desserts_c.jpg/1280px-A_tray_full_of_Indian_sweets_mithai_desserts_c.jpg';
                          }}
                        />
                        <div>
                          <div className={styles.productTitle}>{prod.name}</div>
                          {prod.badge && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                color: '#a06e18',
                                fontWeight: 700,
                              }}
                            >
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
                        onClick={() => onToggleStock(prod)}
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
                          onClick={() => onEdit(prod)}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => onDelete(prod)}
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
    </div>
  );
}

export default MenuTab;
