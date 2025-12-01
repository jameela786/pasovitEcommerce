import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import axios from 'axios';
import '../styles/ProductCard.css';

function ProductCard({ product }) {
  const [selectedSize, setSelectedSize] = useState('M');
  const { addToCart } = useContext(CartContext);
  const [message, setMessage] = useState('');

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      await addToCart(product._id, selectedSize, 1);
      setMessage('✅ Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('❌ Failed to add to cart');
    }
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`}>
        <img src={product.image} alt={product.name} className="product-image" />
      </Link>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-price">₹{product.price}</p>
      <p className="product-rating">⭐ {product.rating}</p>
      
      <select 
        value={selectedSize} 
        onChange={(e) => setSelectedSize(e.target.value)}
        className="size-select"
      >
        {product.sizes.map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>

      <button onClick={handleAddToCart} className="add-to-cart-btn">
        Add to Cart
      </button>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default ProductCard;
