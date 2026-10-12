import api from '@/api/client';

export const orderService = {
  /**
   * Place a new order with delivery address, items snapshot, and COD payment.
   */
  async placeOrder({ address, items, paymentMethod = 'COD', notes = '' }) {
    const response = await api.post('/orders/place', {
      address,
      items,
      paymentMethod,
      notes,
    });
    return response.data;
  },

  /**
   * Fetch customer's personal order history.
   */
  async getMyOrders() {
    const response = await api.get('/orders/my-orders');
    return response.data?.orders || [];
  },

  /**
   * Admin: Get all orders across the sweets shop.
   */
  async getAllOrders() {
    const response = await api.get('/orders/all-orders');
    return response.data?.orders || [];
  },

  /**
   * Admin: Update the status of an order.
   */
  async updateOrderStatus(orderId, status) {
    const response = await api.put(`/orders/update-status/${orderId}`, {
      status,
    });
    return response.data?.order;
  },
};

export default orderService;
