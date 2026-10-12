import api from '@/api/client';

export const cartService = {
  /**
   * Fetch authenticated user's cart from MongoDB.
   */
  async getMyCart() {
    try {
      const response = await api.get('/cart/my-cart');
      return response.data?.cart?.items || [];
    } catch (err) {
      return null;
    }
  },

  /**
   * Add sweet portion to cart in MongoDB.
   */
  async addToCart({ productId, size = '500g', quantity = 1 }) {
    const response = await api.post('/cart/add', {
      productId,
      size,
      quantity,
    });
    return response.data?.cart?.items || [];
  },

  /**
   * Remove item from cart in MongoDB.
   */
  async removeItem({ productId, size }) {
    const response = await api.post('/cart/remove', {
      productId,
      size,
    });
    return response.data?.cart?.items || [];
  },

  /**
   * Update item quantity in MongoDB.
   */
  async updateQuantity({ productId, size, quantity }) {
    const response = await api.post('/cart/update', {
      productId,
      size,
      quantity,
    });
    return response.data?.cart?.items || [];
  },

  /**
   * Clear user's cart in MongoDB.
   */
  async clearCart() {
    await api.post('/cart/clear');
  },
};

export default cartService;
