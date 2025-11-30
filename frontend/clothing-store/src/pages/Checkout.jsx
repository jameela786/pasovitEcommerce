import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { orderAPI } from '../services/api';
import '../styles/Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await orderAPI.create({
        shippingAddress: formData
      });

      await clearCart();
      navigate(`/order/${response.data.order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-container">
        <p>No items in cart</p>
        <a href="/products">Continue Shopping</a>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="checkout-layout">
        <div className="checkout-form">
          <h2>Shipping Address</h2>
          <form onSubmit={handlePlaceOrder}>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>

        <div className="checkout-summary">
          <h2>Order Summary</h2>
          <div className="order-items">
            {items.map(item => (
              <div key={`${item.product}-${item.size}`} className="summary-item">
                <span>{item.name} ({item.size}) x{item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="summary-total">
            <strong>Total: ₹{getTotalPrice().toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;