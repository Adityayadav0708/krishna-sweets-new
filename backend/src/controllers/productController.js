import mongoose from "mongoose";
import Product from "../models/Product.js";
import uploadImageClodinary from "../../utils/uploadImagecloudinary.js";

const uploadProductImage = async (req, res) => {
  try {
    const rawFiles = req.files || (req.file ? [req.file] : []);
    const files = Array.isArray(rawFiles) ? rawFiles : Object.values(rawFiles).flat();

    if (!files || files.length === 0) {
      return res.status(400).json({
        message: "No image file provided",
        success: false,
        error: true,
      });
    }

    const uploadPromises = files.map((file) => uploadImageClodinary(file));
    const results = await Promise.all(uploadPromises);
    const urls = results.map((r) => r.secure_url || r.url);

    return res.status(200).json({
      message: urls.length > 1 ? "Images uploaded successfully" : "Image uploaded successfully",
      success: true,
      error: false,
      url: urls[0],
      urls: urls,
    });
  } catch (err) {
    console.error("Error uploading sweet image(s):", err.message);
    return res.status(500).json({
      message: err.message || "Failed to upload image(s)",
      success: false,
      error: true,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json({
      message: "Product created successfully",
      success: true,
      error: false,
      product: newProduct,
    });
  } catch (err) {
    console.error("Error creating product:", err.message);
    res.status(500).json({ message: err.message || "Server Error", success: false, error: true });
  }
};

// get product by id
const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    let foundProduct = null;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      foundProduct = await Product.findById(productId);
    }
    if (!foundProduct) {
      return res.status(404).json({ message: "Product not found", success: false, error: true });
    }
    res
      .status(200)
      .json({ message: "Product retrieved successfully", success: true, error: false, product: foundProduct });
  } catch (err) {
    console.error("Error retrieving product:", err.message);
    res.status(500).json({ message: "Server Error", success: false, error: true });
  }
};

// get all products
const getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    let filter = {};

    if (search) {
      filter.title = { $regex: search, $options: "i" }; // case insensitive
    }
    if (category) {
      filter.category = { $regex: `^${category}$`, $options: "i" }; // case insensitive exact match
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res
      .status(200)
      .json({ message: "Products retrieved successfully", success: true, error: false, products });
  } catch (err) {
    console.error("Error retrieving products:", err.message);
    res.status(500).json({ message: "Server Error", success: false, error: true });
  }
};

// update product
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    let updatedProduct = null;

    if (mongoose.Types.ObjectId.isValid(productId)) {
      updatedProduct = await Product.findByIdAndUpdate(
        productId,
        req.body,
        { new: true }
      );
    } else {
      // Handles mock catalog IDs (e.g. "ks-015") by upserting into MongoDB
      const title = req.body.title || req.body.name;
      if (title) {
        updatedProduct = await Product.findOneAndUpdate(
          { title: { $regex: `^${title.trim()}$`, $options: "i" } },
          req.body,
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
      } else {
        updatedProduct = await Product.create(req.body);
      }
    }

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found", success: false, error: true });
    }
    res
      .status(200)
      .json({ message: "Product updated successfully", success: true, error: false, updatedProduct, product: updatedProduct });
  } catch (err) {
    console.error("Error updating product:", err.message);
    res.status(500).json({ message: err.message || "Server Error", success: false, error: true });
  }
};

// delete product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    let deletedProduct = null;

    if (mongoose.Types.ObjectId.isValid(productId)) {
      deletedProduct = await Product.findByIdAndDelete(productId);
      if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found", success: false, error: true });
      }
    } else {
      // Mock catalog product id — simply acknowledge deletion
      return res
        .status(200)
        .json({ message: "Product removed successfully", success: true, error: false });
    }

    res
      .status(200)
      .json({ message: "Product deleted successfully", success: true, error: false, deletedProduct });
  } catch (err) {
    console.error("Error deleting product:", err.message);
    res.status(500).json({ message: "Server Error", success: false, error: true });
  }
};

export {
  createProduct,
  getProductById,
  getAllProducts,
  updateProduct,
  deleteProduct,
  uploadProductImage,
};