// ============================================
// FILE: backend/controllers/productController.js
// ============================================
const Product = require('../models/Product');

// Get all products with filters, search, and pagination
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, size, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

    // Build query object
    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Size filter
    if (size) {
      query.sizes = size;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      products
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching products', error: err.message });
  }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching product', error: err.message });
  }
};

// Get categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.status(200).json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching categories' });
  }
};

// Get available sizes
exports.getSizes = async (req, res) => {
  try {
    const products = await Product.find().select('sizes');
    const sizesSet = new Set();
    products.forEach(p => {
      p.sizes.forEach(size => sizesSet.add(size));
    });
    const sizes = Array.from(sizesSet).sort();
    res.status(200).json({ success: true, sizes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching sizes' });
  }
};

// Get price range
exports.getPriceRange = async (req, res) => {
  try {
    const result = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    const { minPrice, maxPrice } = result[0] || { minPrice: 0, maxPrice: 1000 };
    res.status(200).json({ success: true, minPrice, maxPrice });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching price range' });
  }
};