import mongoose from "mongoose"
const OrderSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	items: [
		{
			productId: {
				type: mongoose.Schema.Types.Mixed,
				ref: "Product",
				required: true
			},
			name: String,
			size: {
				type: String,
				default: "500g"
			},
			quantity: {
				type: Number,
				required: true
			},
			price: {
				type: Number,
				required: true
			},
		}
	],
	address: {
		fullName: String,
		phone: String,
		addressLine: String,
		city: String,
		state: String,
		pinCode: String,
		country: String,
	},
	delivery_address: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Address"
	},
	product_details: {
		name: String,
		image: Array,
		description: String,
		price: Number,
		unit: String,
		discount: Number,
		stock: Number,
		publish: Boolean,
		more_details: Object,
		review: Array,
	},
	subTotalAmt: {
		type: Number,
		default: 0,
	},
	discountAmt: {
		type: Number,
		default: 0,
	},
	shippingAmt: {
		type: Number,
		default: 0,
	},
	totalAmount: {
		type: Number,
		required: true
	},
	paymentId: {
		type: String,
		default: ""
	},
	paymentStatus: {
		type: String,
		default: "",
	},
	paymentMethod: {
		type: String,
		default: "COD",
		required: true
	},
	invoice_receipt: {
		type: String,
		default: "",
	},

	status: {
		type: String,
		default: "Pending",
	},


}, { timestamps: true });
const Order = mongoose.model("Order", OrderSchema)
export default Order