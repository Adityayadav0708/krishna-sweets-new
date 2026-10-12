import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import Address from '../models/Address.js'



// place order createOrder
const placeOrder = async (req, res) => {
	const userId = req.userId || req.user?.id || req.user?._id;
	const { addressId } = req.body;

	if (!userId) {
		return res.status(401).json({ message: "Unauthorized", success: false, error: true });
	}

	if (!addressId) {
		return res.status(400).json({ message: "Address ID is required", success: false, error: true });
	}

	try {

		// Get cart
		const cart = await Cart.findOne({ userId }).populate("items.productId");
		if (!cart || cart.items.length === 0) {
			return res.status(404).json({ message: "Cart not found" })
		}
		//prepare order items 
		const orderItems = cart.items.map((item) => {
			return {
				productId: item.productId._id,
				name: item.productId.title,
				quantity: item.quantity,
				price: item.productId.price,


			}
		})


		//calculate total
		const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

		//Dedudct stock
		for (let item of cart.items) {
			await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } })
		}

		//fetch address
		const addressDoc = await Address.findById(addressId);
		if (!addressDoc) {
			return res.status(404).json({ message: "Address not found" })
		}

		//create order
		const order = await Order.create({
			userId: userId,
			items: orderItems,
			totalAmount: totalAmount,
			address: {
				fullName: addressDoc.fullname,
				phone: addressDoc.mobile,
				addressLine: addressDoc.address,
				city: addressDoc.city,
				state: addressDoc.state,
				pinCode: addressDoc.pincode,
				country: addressDoc.country,
			},
			paymentMethod: req.body.paymentMethod || "COD",

		})

		//clear cart
		await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } })

		res.json({ message: "Order placed successfully", orderId: order._id })




	} catch (error) {
		res.status(500).json({ message: "Internal server error" })

	}


}
export  { placeOrder }