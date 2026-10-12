import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { productService } from '@/services/productService';
import styles from './ProductEditModal.module.css';

const CATEGORIES = [
  'Signature',
  'Bengali',
  'Ladoo',
  'Festive',
  'Dry Fruit',
  'Halwa',
  'Savoury',
  'Gift Boxes',
];

const UNITS = ['500g', '250g', '1kg', '1 Piece', 'Pack of 6', 'Gift Box'];

export function ProductEditModal({ product, isOpen, onClose, onSaved }) {
  const isEditing = Boolean(product && (product.id || product._id));

  const [formData, setFormData] = useState({
    name: '',
    category: 'Signature',
    price: 500,
    unit: '500g',
    stock: 30,
    discount: 0,
    image: '',
    description: '',
    ingredients: 'Pure Desi Ghee, Sugar, Cardamom',
    shelfLife: '15 days',
    storage: 'Store in a cool dry place. Refrigerate after opening.',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || product.title || '',
        category: product.category || 'Signature',
        price: product.price ?? 500,
        unit: product.unit || '500g',
        stock: product.stock ?? 30,
        discount: product.discount ?? 0,
        image: Array.isArray(product.image) ? product.image[0] : (product.image || ''),
        description: product.description || '',
        ingredients: Array.isArray(product.ingredients)
          ? product.ingredients.join(', ')
          : (product.more_details?.ingredients?.join?.(', ') || 'Pure Desi Ghee, Sugar, Cardamom'),
        shelfLife: product.shelfLife || product.more_details?.shelfLife || '15 days',
        storage: product.storage || product.more_details?.storage || 'Store in a cool dry place.',
      });
    } else {
      setFormData({
        name: '',
        category: 'Signature',
        price: 500,
        unit: '500g',
        stock: 30,
        discount: 0,
        image: '',
        description: '',
        ingredients: 'Pure Desi Ghee, Sugar, Cardamom',
        shelfLife: '15 days',
        storage: 'Store in a cool dry place. Refrigerate after opening.',
      });
    }
    setError('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (!formData.name.trim()) throw new Error('Product name is required');
      if (formData.price <= 0) throw new Error('Price must be greater than 0');

      const payload = {
        name: formData.name.trim(),
        title: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        unit: formData.unit,
        stock: Number(formData.stock),
        discount: Number(formData.discount),
        image: formData.image.trim() || 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/A_tray_full_of_Indian_sweets_mithai_desserts_c.jpg/1280px-A_tray_full_of_Indian_sweets_mithai_desserts_c.jpg',
        description: formData.description.trim(),
        ingredients: formData.ingredients.split(',').map((s) => s.trim()).filter(Boolean),
        shelfLife: formData.shelfLife.trim(),
        storage: formData.storage.trim(),
      };

      if (isEditing) {
        const id = product._id || product.id;
        await productService.updateProduct(id, payload);
      } else {
        await productService.addProduct(payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h2>{isEditing ? `Edit: ${formData.name || 'Sweet'}` : 'Add New Sweet to Menu'}</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div className={styles.body}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.field}>
              <label className={styles.label}>Sweet Name / Title *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                placeholder="e.g. Kesar Peda, Motichoor Ladoo, Kaju Katli"
              />
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={styles.select}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Unit / Serving</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className={styles.select}
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.grid3}>
              <div className={styles.field}>
                <label className={styles.label}>Price (INR) *</label>
                <input
                  type="number"
                  name="price"
                  required
                  min={1}
                  value={formData.price}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="500"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  min={0}
                  value={formData.stock}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="30"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Discount (% Off)</label>
                <input
                  type="number"
                  name="discount"
                  min={0}
                  max={100}
                  value={formData.discount}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="0"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Photo URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className={styles.input}
                placeholder="https://... or /assets/images/..."
              />
            </div>

            {formData.image && (
              <div className={styles.imagePreview}>
                <img
                  src={formData.image}
                  alt="Sweet preview"
                  className={styles.previewThumb}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className={styles.previewInfo}>Live image preview from URL</span>
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label}>Description & Heritage Story</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Describe the sweet's flavour profile, traditional method, and special qualities..."
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Key Ingredients (comma separated)</label>
              <input
                type="text"
                name="ingredients"
                value={formData.ingredients}
                onChange={handleChange}
                className={styles.input}
                placeholder="Pure Desi Ghee, Cashews, Saffron, Sugar"
              />
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>Shelf Life</label>
                <input
                  type="text"
                  name="shelfLife"
                  value={formData.shelfLife}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="15 days"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Storage Instruction</label>
                <input
                  type="text"
                  name="storage"
                  value={formData.storage}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Store in a cool dry place."
                />
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={submitting}>
              {submitting ? 'Saving...' : isEditing ? 'Save All Changes' : 'Add Sweet to Menu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductEditModal;
