import api from '@/api/client';
import { products as localProducts } from '@/data/products';

/**
 * Generate a URL-friendly slug from title or fallback to id.
 */
function generateSlug(text, id) {
  if (!text) return id || 'sweet';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Maps a MongoDB backend product document into the format expected by the KP storefront UI.
 */
export function adaptProduct(backendItem) {
  if (!backendItem) return null;

  const id = backendItem._id || backendItem.id;
  const name = backendItem.title || backendItem.name || 'Artisanal Sweet';
  const slug = backendItem.slug || generateSlug(name, id);
  const rawImage =
    Array.isArray(backendItem.image) && backendItem.image.length > 0
      ? backendItem.image[0]
      : typeof backendItem.image === 'string' && backendItem.image
      ? backendItem.image
      : 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/A_tray_full_of_Indian_sweets_mithai_desserts_c.jpg/1280px-A_tray_full_of_Indian_sweets_mithai_desserts_c.jpg';

  const price = Number(backendItem.price) || 500;
  const unit = backendItem.unit || '500 g';

  const categoryName =
    typeof backendItem.category === 'object' && backendItem.category?.name
      ? backendItem.category.name
      : typeof backendItem.category === 'string' && backendItem.category.length < 24
      ? backendItem.category
      : 'Signature';

  return {
    id,
    _id: id,
    slug,
    name,
    category: categoryName,
    shortDescription: backendItem.description
      ? backendItem.description.slice(0, 110) +
        (backendItem.description.length > 110 ? '...' : '')
      : 'Handcrafted fresh daily using pure desi ghee and premium ingredients.',
    description:
      backendItem.description ||
      'Slow-crafted daily following our time-honoured family recipe.',
    price,
    unit,
    image: rawImage,
    imageAlt: `${name} - handcrafted sweets`,
    gallery:
      Array.isArray(backendItem.image) && backendItem.image.length > 0
        ? backendItem.image
        : [rawImage],
    badge:
      backendItem.discount > 0
        ? `${backendItem.discount}% Off`
        : backendItem.stock > 0
        ? 'Fresh'
        : 'Out of Stock',
    dietary: ['Vegetarian'],
    ingredients: ['Pure Desi Ghee', 'Cardamom', 'Sugar', 'Dry Fruits'],
    shelfLife: '15 days',
    storage: 'Store in a cool, dry place. Refrigerate after opening.',
    sizes: [
      { label: '250g', price: Math.round(price * 0.28) },
      { label: '500g', price: Math.round(price * 0.53) },
      { label: '1kg', price },
    ],
    rating: 4.9,
    reviewsCount: 38,
    popular: true,
    stock: backendItem.stock ?? 25,
    festivalTags: ['Diwali', 'Festive', 'Celebration'],
    _isBackend: true,
  };
}

export const productService = {
  /**
   * Fetches all products from MongoDB (/api/products).
   * Falls back gracefully to local products if backend is offline or empty.
   */
  async getProducts() {
    try {
      const response = await api.get('/products');
      const data =
        response.data?.data || response.data?.products || response.data;
      if (Array.isArray(data) && data.length > 0) {
        return data.map(adaptProduct);
      }
      return localProducts;
    } catch (err) {
      console.warn(
        'Backend products unavailable, falling back to local catalog:',
        err.message
      );
      return localProducts;
    }
  },

  /**
   * Fetches a single product by slug or id.
   */
  async getProductBySlugOrId(idOrSlug) {
    const all = await this.getProducts();
    return (
      all.find(
        (p) =>
          p.slug === idOrSlug ||
          p.id === idOrSlug ||
          p._id === idOrSlug
      ) || null
    );
  },

  /**
   * Admin: Add a new sweet to MongoDB.
   */
  async addProduct(productData) {
    const payload = {
      title: productData.name || productData.title,
      price: Number(productData.price),
      unit: productData.unit || '500g',
      category: productData.category || 'Signature',
      description: productData.description || '',
      image: Array.isArray(productData.image)
        ? productData.image
        : [productData.image],
      stock: Number(productData.stock ?? 25),
      discount: Number(productData.discount ?? 0),
      publish: productData.publish ?? true,
      more_details: {
        ingredients: productData.ingredients || [],
        shelfLife: productData.shelfLife || '15 days',
        storage: productData.storage || 'Store in a cool dry place.',
      },
    };
    const response = await api.post('/products/add', payload);
    return adaptProduct(response.data?.product || response.data);
  },

  /**
   * Admin: Update any details of an existing sweet.
   */
  async updateProduct(id, productData) {
    const payload = {
      title: productData.name || productData.title,
      price: Number(productData.price),
      unit: productData.unit || '500g',
      category: productData.category || 'Signature',
      description: productData.description || '',
      image: Array.isArray(productData.image)
        ? productData.image
        : [productData.image],
      stock: Number(productData.stock ?? 25),
      discount: Number(productData.discount ?? 0),
      publish: productData.publish ?? true,
      more_details: {
        ingredients: productData.ingredients || [],
        shelfLife: productData.shelfLife || '15 days',
        storage: productData.storage || 'Store in a cool dry place.',
      },
    };
    const response = await api.put(`/products/update/${id}`, payload);
    return adaptProduct(
      response.data?.updatedProduct || response.data?.product || response.data
    );
  },

  /**
   * Admin: Delete a sweet from MongoDB.
   */
  async deleteProduct(id) {
    const response = await api.delete(`/products/delete/${id}`);
    return response.data;
  },

  /**
   * Admin: Quick toggle in-stock / out-of-stock.
   */
  async toggleStock(id, currentStock) {
    const newStock = currentStock > 0 ? 0 : 25;
    const response = await api.put(`/products/update/${id}`, { stock: newStock });
    return adaptProduct(
      response.data?.updatedProduct || response.data?.product || response.data
    );
  },

  /**
   * Admin: Upload a sweet photo to Cloudinary via backend.
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.url;
  },
};

export default productService;

