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

    items:[{
        // stores the ID of the product
        productId:{
        type:mongoose.Schema.Types.ObjectId,



        //ref: "Product" This tells Mongoose: "This productId belongs to the Product model.
        //So when you do .populate("items.productId"),
        //Mongoose knows exactly which collection to look into to fetch the product details.
        ref:"Product",
        required:true
    },
    quantity:{
        type:Number,
        default:1,
        required:true
    }
}]
})
const Cart = mongoose.model("Cart",cartSchema)
export default Cart