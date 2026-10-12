import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import Address from '../models/Address.js'



import mongoose from 'mongoose';

// place order createOrder
const placeOrder = async (req, res) => {
	let userId = req.userId || req.user?.id || req.user?._id;
	const { addressId, address: inlineAddress, items: directItems, notes } = req.body;

	try {
		// Resolve delivery address
		let deliveryAddress = null;

		if (inlineAddress && inlineAddress.fullName && inlineAddress.phone && inlineAddress.addressLine) {
			deliveryAddress = {
				fullName: inlineAddress.fullName.trim(),
				phone: inlineAddress.phone.trim(),
				addressLine: inlineAddress.addressLine.trim(),
				city: inlineAddress.city?.trim() || "Chhibramau",
				state: inlineAddress.state?.trim() || "Uttar Pradesh",
				pinCode: inlineAddress.pinCode?.trim() || "209721",
				country: inlineAddress.country?.trim() || "India",
			};
		} else if (addressId) {
			const addressDoc = await Address.findById(addressId);
			if (addressDoc) {
				deliveryAddress = {
					fullName: addressDoc.fullname,
					phone: addressDoc.mobile,
					addressLine: addressDoc.address,
					city: addressDoc.city,
					state: addressDoc.state,
					pinCode: addressDoc.pincode,
					country: addressDoc.country,
				};
			}
		}

		if (!deliveryAddress) {
			return res.status(400).json({
				message: "Valid delivery address (name, phone, address in Chhibramau) is required",
				success: false,
				error: true,
			});
		}

		// If customer is not logged in, find or auto-create a guest customer account
		if (!userId) {
			const cleanPhone = deliveryAddress.phone.replace(/\D/g, '') || String(Date.now());
			const guestEmail = `guest_${cleanPhone}@krishnasweets.local`;

			let guestUser = await User.findOne({
				$or: [{ email: guestEmail }, { mobile: deliveryAddress.phone }]
			});

			if (!guestUser) {
				guestUser = await User.create({
					name: deliveryAddress.fullName,
					email: guestEmail,
					password: "GuestCheckoutPassword123!",
					mobile: deliveryAddress.phone,
					role: "user",
					verify_email: true,
					status: "active"
				});
			}
			userId = guestUser._id;
		}

		let orderItems = [];

		// If items are passed directly in body, use them; otherwise pull from MongoDB cart
		if (Array.isArray(directItems) && directItems.length > 0) {
			orderItems = directItems.map((item) => ({
				productId: item.productId?._id || item.productId?.id || item.productId,
				name: item.product?.name || item.name || "Artisanal Sweet",
				size: item.size || "500g",
				quantity: Math.max(1, Number(item.quantity || 1)),
				price: Number(item.unitPrice || item.price || 500),
			}));
		} else {
			const cart = await Cart.findOne({ userId });
			if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
				return res.status(400).json({ message: "Your order bag is empty", success: false, error: true });
			}

			// Safely lookup product details
			const validPids = cart.items
				.map((i) => i.productId)
				.filter((id) => id && mongoose.Types.ObjectId.isValid(String(id)));
			const dbProds = validPids.length > 0 ? await Product.find({ _id: { $in: validPids } }).lean() : [];
			const prodMap = new Map(dbProds.map((p) => [p._id.toString(), p]));

			orderItems = cart.items.map((item) => {
				const idStr = item.productId?.toString();
				const prod = prodMap.get(idStr);
				return {
					productId: item.productId,
					name: prod ? (prod.title || prod.name) : "Artisanal Sweet",
					size: item.size || "500g",
					quantity: Math.max(1, Number(item.quantity || 1)),
					price: prod ? Number(prod.price || 500) : 500,
				};
			});
		}

		if (orderItems.length === 0) {
			return res.status(400).json({ message: "No items to order", success: false, error: true });
		}

		// Calculate total
		const totalAmount = orderItems.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		);

		// Deduct stock safely if product exists in MongoDB
		for (let item of orderItems) {
			try {
				if (item.productId && mongoose.Types.ObjectId.isValid(String(item.productId))) {
					await Product.findByIdAndUpdate(item.productId, {
						$inc: { stock: -item.quantity },
					});
				}
			} catch (_) {}
		}

		// Create order document
		const order = await Order.create({
			userId,
			items: orderItems,
			totalAmount,
			address: deliveryAddress,
			paymentMethod: req.body.paymentMethod || "COD",
			status: "Confirmed",
			invoice_receipt: notes ? `Notes: ${notes}` : "",
		});

		// Clear customer cart in MongoDB if present
		try {
			await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });
		} catch (_) {}

		res.status(201).json({
			message: "Order placed successfully! We will prepare your fresh sweets.",
			success: true,
			error: false,
			orderId: order._id,
			order,
		});
	} catch (error) {
		console.error("Place order error:", error);
		res.status(500).json({
			message: error.message || "Failed to place order",
			success: false,
			error: true,
		});
	}
};

// Customer: get current user's past orders
const getMyOrders = async (req, res) => {
	try {
		const userId = req.userId || req.user?.id || req.user?._id;
		if (!userId) {
			return res.status(401).json({ message: "Unauthorized", success: false, error: true });
		}
		const orders = await Order.find({ userId }).sort({ createdAt: -1 });
		res.json({ message: "Orders retrieved", success: true, error: false, orders });
	} catch (err) {
		res.status(500).json({ message: "Server error", success: false, error: true });
	}
};

// Admin: get all orders in store
const getAllOrders = async (req, res) => {
	try {
		const orders = await Order.find().populate("userId", "name email mobile").sort({ createdAt: -1 });
		res.json({ message: "All orders retrieved", success: true, error: false, orders });
	} catch (err) {
		res.status(500).json({ message: "Server error", success: false, error: true });
	}
};

// Admin: update order status
const updateOrderStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body;
		const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
		if (!order) {
			return res.status(404).json({ message: "Order not found", success: false, error: true });
		}
		res.json({ message: "Order status updated", success: true, error: false, order });
	} catch (err) {
		res.status(500).json({ message: "Server error", success: false, error: true });
	}
};

export { placeOrder, getMyOrders, getAllOrders, updateOrderStatus };