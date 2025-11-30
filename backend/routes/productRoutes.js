const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getCategories,
  getSizes,
  getPriceRange
} = require('../controllers/productController');

router.get('/', getAllProducts);
router.get('/filters/categories', getCategories);
router.get('/filters/sizes', getSizes);
router.get('/filters/price-range', getPriceRange);
router.get('/:id', getProductById);

module.exports = router;