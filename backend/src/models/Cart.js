import mongoose from "mongoose";
const cartSchema = new mongoose.Schema({

// how mongo db store cart db
// {
//   "userId": "64abc...",
//   "items": [
//     {
//       "productId": "65xyz...",
//       "quantity": 2
//     }
//   ]
// }



    userId:{
        type:mongoose.Schema.Types.ObjectId,
        // id belong to User model
        ref:"User",
        required:true
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.Mixed,
          ref: "Product",
          required: true,
        },
        size: {
          type: String,
          default: "500g",
        },
        quantity: {
          type: Number,
          default: 1,
          required: true,
        },
      },
    ],
})
const Cart = mongoose.model("Cart",cartSchema)
export default Cart