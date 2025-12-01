import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import '../styles/Cart.css';

function Cart() {
  const { items, updateCart, removeFromCart, getTotalPrice } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart-container">
        <h1>Shopping Cart</h1>
        <p>Your cart is empty</p>
        <Link to="/products" className="continue-shopping">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Shopping Cart ({items.length} items)</h1>
      {console.log("items of cart:",items)}
      <div className="cart-layout">
        <div className="cart-items">
          {items.map(item => (
            
            <div key={`${item.product}-${item.size}`} className="cart-item">
              <div className="item-info">
                <h3>{item.name}</h3>
                <p>Size: {item.size}</p>
                <p className="price">₹{item.price}</p>
              </div>

              <div className="item-quantity">
                <button onClick={() => updateCart(item.product, item.size, item.quantity - 1)}>
                  -
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateCart(item.product, item.size, parseInt(e.target.value))}
                  min="1"
                />
                <button onClick={() => updateCart(item.product, item.size, item.quantity + 1)}>
                  +
                </button>
              </div>

              <div className="item-total">
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>

              <button
                onClick={() => removeFromCart(item.product, item.size)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{getTotalPrice().toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>FREE</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>₹{getTotalPrice().toFixed(2)}</span>
          </div>
          <button onClick={handleCheckout} className="checkout-btn">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;