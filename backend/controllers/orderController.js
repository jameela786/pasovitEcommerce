const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendOrderEmail } = require('../utils/sendEmail');

// Create order
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress } = req.body;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Validate stock for all items
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }
    }

    // Calculate total price
    const totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order
    const orderData = {
      user: userId,
      items: cart.items.map(item => ({
        product: item.product,
        name: item.name,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      })),
      totalPrice: Math.round(totalPrice * 100) / 100,
      status: 'confirmed',
      shippingAddress: shippingAddress || {}
    };

    const order = await Order.create(orderData);

    // Update product stock (optional bonus)
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Send confirmation email
    try {
      await sendOrderEmail(order, user);
    } catch (emailErr) {
      console.error('Email sending failed but order was created:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating order', error: err.message });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId })
      .populate('items.product')
      .sort({ orderDate: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching orders', error: err.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching order', error: err.message });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ orderDate: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching orders', error: err.message });
  }
};