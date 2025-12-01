// ============================================
// FILE: backend/controllers/cartController.js
// ============================================
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    console.log("cart controller add to cart------")
    const { productId, size, quantity } = req.body;
    const userId = req.user.id;

    // Validation
    if (!productId || !size || !quantity) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Validate size
    if (!product.sizes.includes(size)) {
      return res.status(400).json({ success: false, message: 'Invalid size' });
    }

    // Validate stock
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if item already exists in cart
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.size === size
    );

    if (itemIndex > -1) {
      // Update quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        name: product.name,
        price: product.price,
        image: product.image,
        size,
        quantity
      });
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding to cart', error: err.message });
  }
};

// Get user cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save();
    }

    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.status(200).json({
      success: true,
      cart,
      total: Math.round(total * 100) / 100
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching cart', error: err.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;
    const userId = req.user.id;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.size === size
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.updatedAt = new Date();
    await cart.save();

    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart,
      total: Math.round(total * 100) / 100
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating cart', error: err.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId, size } = req.body;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => !(item.product.toString() === productId && item.size === size)
    );

    cart.updatedAt = new Date();
    await cart.save();

    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart,
      total: Math.round(total * 100) / 100
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error removing from cart', error: err.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [], updatedAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error clearing cart', error: err.message });
  }
};