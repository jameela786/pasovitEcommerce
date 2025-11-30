const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/', protect, getUserOrders);
router.get('/:orderId', protect, getOrderById);
router.get('/admin/all', protect, getAllOrders);

module.exports = router;