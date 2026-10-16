import { useEffect, useRef, useState } from 'react';
import {
  X,
  UploadCloud,
  Loader2,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';
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
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Signature',
    price: 500,
    unit: '500g',
    stock: 30,
    discount: 0,
    description: '',
    ingredients: 'Pure Desi Ghee, Sugar, Cardamom',
    shelfLife: '15 days',
    storage: 'Store in a cool dry place. Refrigerate after opening.',
  });

  const [images, setImages] = useState([]);
  const [manualUrl, setManualUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || product.title || '',
        category: product.category || 'Signature',
        price: product.price ?? 500,
        unit: product.unit || '500g',
        stock: product.stock ?? 30,
        discount: product.discount ?? 0,
        description: product.description || '',
        ingredients: Array.isArray(product.ingredients)
          ? product.ingredients.join(', ')
          : (product.more_details?.ingredients?.join?.(', ') || 'Pure Desi Ghee, Sugar, Cardamom'),
        shelfLife: product.shelfLife || product.more_details?.shelfLife || '15 days',
        storage: product.storage || product.more_details?.storage || 'Store in a cool dry place.',
      });

      // Extract existing images list
      let existingImages = [];
      if (Array.isArray(product.gallery) && product.gallery.length > 0) {
        existingImages = product.gallery.filter(Boolean);
      } else if (Array.isArray(product.image) && product.image.length > 0) {
        existingImages = product.image.filter(Boolean);
      } else if (typeof product.image === 'string' && product.image) {
        existingImages = [product.image];
      }
      setImages(existingImages);
    } else {
      setFormData({
        name: '',
        category: 'Signature',
        price: 500,
        unit: '500g',
        stock: 30,
        discount: 0,
        description: '',
        ingredients: 'Pure Desi Ghee, Sugar, Cardamom',
        shelfLife: '15 days',
        storage: 'Store in a cool dry place. Refrigerate after opening.',
      });
      setImages([]);
    }
    setManualUrl('');
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

  // Upload one or multiple photos to Cloudinary
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError('');
    try {
      const uploadedUrls = await productService.uploadImages(files);
      if (uploadedUrls && uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to upload image(s) to Cloudinary.'
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add an image URL manually
  const handleAddManualUrl = (e) => {
    e.preventDefault();
    const trimmed = manualUrl.trim();
    if (!trimmed) return;
    setImages((prev) => [...prev, trimmed]);
    setManualUrl('');
  };

  // Remove photo from gallery
  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Make selected photo the primary cover image (index 0)
  const handleSetAsCover = (indexToCover) => {
    setImages((prev) => {
      const selected = prev[indexToCover];
      const rest = prev.filter((_, idx) => idx !== indexToCover);
      return [selected, ...rest];
    });
  };

  // Shift image position in gallery
  const handleMoveImage = (fromIdx, direction) => {
    setImages((prev) => {
      const toIdx = fromIdx + direction;
      if (toIdx < 0 || toIdx >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[fromIdx];
      copy[fromIdx] = copy[toIdx];
      copy[toIdx] = temp;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (!formData.name.trim()) throw new Error('Product name is required');
      if (formData.price <= 0) throw new Error('Price must be greater than 0');

      // If no images were provided, fallback to default tray image
      const finalImages =
        images.length > 0
          ? images
          : [
              'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/A_tray_full_of_Indian_sweets_mithai_desserts_c.jpg/1280px-A_tray_full_of_Indian_sweets_mithai_desserts_c.jpg',
            ];

      const payload = {
        name: formData.name.trim(),
        title: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        unit: formData.unit,
        stock: Number(formData.stock),
        discount: Number(formData.discount),
        image: finalImages, // array of image URLs
        description: formData.description.trim(),
        ingredients: formData.ingredients
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
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
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close dialog"
          >
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

            {/* ── MULTI-IMAGE GALLERY MANAGER ── */}
            <div className={styles.gallerySection}>
              <div className={styles.galleryHeader}>
                <div>
                  <label className={styles.label} style={{ marginBottom: 0 }}>
                    Sweet Photos & Gallery ({images.length})
                  </label>
                  <div className={styles.galleryHelp}>
                    Select multiple files or paste links. The 1st photo is the primary cover photo.
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.uploadTriggerBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={13} className={styles.spinner} /> Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud size={13} /> Upload Photos
                    </>
                  )}
                </button>
              </div>

              {/* Hidden file input with multiple selection */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                multiple
                onChange={handleFileUpload}
              />

              {/* Paste URL row */}
              <div className={styles.urlInputRow}>
                <input
                  type="url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  className={styles.input}
                  placeholder="Or paste an image URL (https://...)"
                />
                <button
                  type="button"
                  className={styles.addUrlBtn}
                  onClick={handleAddManualUrl}
                  disabled={!manualUrl.trim()}
                >
                  <Plus size={14} /> Add Link
                </button>
              </div>

              {/* Gallery Grid */}
              {images.length === 0 ? (
                <div className={styles.emptyGallery}>
                  <ImageIcon size={24} style={{ opacity: 0.5, marginBottom: '0.4rem' }} />
                  <div>No photos added yet. Click &quot;Upload Photos&quot; or paste an image link above.</div>
                </div>
              ) : (
                <div className={styles.galleryGrid}>
                  {images.map((imgUrl, idx) => {
                    const isCover = idx === 0;
                    return (
                      <div
                        key={`${imgUrl}-${idx}`}
                        className={`${styles.galleryCard} ${
                          isCover ? styles.galleryCardCover : ''
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Sweet image ${idx + 1}`}
                          className={styles.galleryCardImg}
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/A_tray_full_of_Indian_sweets_mithai_desserts_c.jpg/1280px-A_tray_full_of_Indian_sweets_mithai_desserts_c.jpg';
                          }}
                        />

                        {isCover && <span className={styles.coverBadge}>Cover</span>}

                        <div className={styles.cardActions}>
                          <div className={styles.cardTopActions}>
                            {!isCover ? (
                              <button
                                type="button"
                                className={styles.makeCoverBtn}
                                onClick={() => handleSetAsCover(idx)}
                                title="Set as primary cover photo"
                              >
                                <Star size={10} style={{ display: 'inline', marginRight: 2 }} /> Cover
                              </button>
                            ) : <span />}

                            <button
                              type="button"
                              className={`${styles.actionIconBtn} ${styles.actionIconBtnDelete}`}
                              onClick={() => handleRemoveImage(idx)}
                              title="Delete photo"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>

                          <div className={styles.cardBottomActions}>
                            <button
                              type="button"
                              className={styles.actionIconBtn}
                              onClick={() => handleMoveImage(idx, -1)}
                              disabled={idx === 0}
                              title="Move left"
                            >
                              <ChevronLeft size={12} />
                            </button>
                            <button
                              type="button"
                              className={styles.actionIconBtn}
                              onClick={() => handleMoveImage(idx, 1)}
                              disabled={idx === images.length - 1}
                              title="Move right"
                            >
                              <ChevronRight size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

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
                <label className={styles.label}>Storage Condition</label>
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
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={submitting || uploading}
            >
              {submitting ? 'Saving Sweet…' : isEditing ? 'Save Changes' : 'Add Sweet to Menu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductEditModal;
