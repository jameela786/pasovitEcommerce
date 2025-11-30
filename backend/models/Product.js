const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide description']
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
      min: 0
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/300x300?text=Product'
    },
    category: {
      type: String,
      required: [true, 'Please specify category'],
      enum: ['Men', 'Women', 'Unisex']
    },
    sizes: {
      type: [String],
      default: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      default: 50,
      min: 0
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  
  module.exports = mongoose.model('Product', productSchema);
  