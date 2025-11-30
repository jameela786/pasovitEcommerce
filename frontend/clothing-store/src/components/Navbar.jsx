import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import '../styles/Navbar.css';

function Navbar() {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          👕 Fashion Store
        </Link>
        
        <div className="navbar-center">
          <Link to="/products">Products</Link>
        </div>

        <div className="navbar-right">
          <Link to="/cart" className="cart-link">
            🛒 Cart ({getCartCount()})
          </Link>

          {isAuthenticated ? (
            <>
              <span className="user-name">Hi, {user?.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;