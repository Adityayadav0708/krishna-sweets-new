import Product from "../models/Product.js";

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
    const foundProduct = await Product.findById(productId);
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
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      req.body,
      { new: true }
    );
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
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found", success: false, error: true });
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
};