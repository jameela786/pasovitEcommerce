import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import '../styles/OrderSuccess.css';

function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderAPI.getById(orderId);
        setOrder(response.data.order);
      } catch (err) {
        setError('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="order-success">Loading...</div>;
  if (error) return <div className="order-success error">{error}</div>;
  if (!order) return <div className="order-success">Order not found</div>;

  return (
    <div className="order-success">
      <div className="success-content">
        <div className="success-icon">✓</div>
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for your order. A confirmation email has been sent to your email address.</p>

        <div className="order-details">
          <h2>Order #{order._id}</h2>
          <p>Date: {new Date(order.orderDate).toLocaleDateString()}</p>
          <p>Status: <span className="status">{order.status.toUpperCase()}</span></p>

          <h3>Items:</h3>
          <div className="items-list">
            {order.items.map((item, idx) => (
              <div key={idx} className="item">
                <span>{item.name} ({item.size})</span>
                <span>x{item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="total">
            <strong>Total: ₹{order.totalPrice.toFixed(2)}</strong>
          </div>
        </div>

        <Link to="/products" className="continue-btn">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default OrderSuccess;