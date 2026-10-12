import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: Array,
      default:[],
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    categoryId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategoryId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    unit:{
      type: String,
      required: true,
    },
    discount:{
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
    publish:{
      type: Boolean,
      default: true,
    },
    more_details:{
      type: Object,
      default:{}
    },
    review:{
      type: Array,
      default:[]
    }
  },
  {
    timestamps: true,
  }
);

// create a text index
productSchema.index({name: "text", description: "text"},{name:10,
  description:5
 
})



const Product = mongoose.model("Product", productSchema);
export default Product;