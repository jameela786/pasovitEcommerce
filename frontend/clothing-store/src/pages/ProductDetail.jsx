import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { CartContext } from '../context/CartContext';
import '../styles/ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productAPI.getById(id);
        setProduct(response.data.product);
        setSelectedSize(response.data.product.sizes[0]);
      } catch (err) {
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id, selectedSize, quantity);
      setMessage('✅ Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('❌ Failed to add to cart');
    }
  };

  if (loading) return <div className="product-detail">Loading...</div>;
  if (error) return <div className="product-detail error">{error}</div>;
  if (!product) return <div className="product-detail">Product not found</div>;

  return (
    <div className="product-detail">
      <div className="product-detail-layout">
        <div className="product-image-section">
          <img src={product.image} alt={product.name} className="product-image-large" />
        </div>

        <div className="product-info-section">
          <h1>{product.name}</h1>
          
          <div className="product-rating">
            ⭐ {product.rating} (124 reviews)
          </div>

          <div className="product-price-section">
            <h2 className="price">₹{product.price}</h2>
            <p className="stock">
              {product.stock > 0 ? (
                <span style={{ color: 'green' }}>✓ In Stock ({product.stock} available)</span>
              ) : (
                <span style={{ color: 'red' }}>Out of Stock</span>
              )}
            </p>
          </div>

          <p className="description">{product.description}</p>

          <div className="product-options">
            <div className="option-group">
              <label>Size</label>
              <div className="size-options">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="option-group">
              <label>Quantity</label>
              <div className="quantity-control">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" max={product.stock} />
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button onClick={handleAddToCart} className="add-to-cart-btn" disabled={product.stock === 0}>
              Add to Cart
            </button>
            <button onClick={() => navigate('/cart')} className="view-cart-btn">
              View Cart
            </button>
          </div>

          {message && <p className="message">{message}</p>}

          <div className="product-details-table">
            <h3>Product Details</h3>
            <table>
              <tbody>
                <tr>
                  <td><strong>Category</strong></td>
                  <td>{product.category}</td>
                </tr>
                <tr>
                  <td><strong>Available Sizes</strong></td>
                  <td>{product.sizes.join(', ')}</td>
                </tr>
                <tr>
                  <td><strong>Stock</strong></td>
                  <td>{product.stock} units</td>
                </tr>
                <tr>
                  <td><strong>Rating</strong></td>
                  <td>{product.rating} / 5</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;