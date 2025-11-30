const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addToCart);
router.get('/', protect, getCart);
router.put('/update', protect, updateCartItem);
router.delete('/remove', protect, removeFromCart);
router.delete('/clear', protect, clearCart);

module.exports = router;
