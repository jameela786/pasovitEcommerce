import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import '../styles/Home.css';

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productAPI.getAll({ limit: 8, page: 1 });
        setFeaturedProducts(response.data.products);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Fashion Store</h1>
          <p>Discover the latest trends in clothing and fashion</p>
          <Link to="/products" className="hero-btn">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured">
        <h2>Featured Products</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="products-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="categories">
        <h2>Shop by Category</h2>
        <div className="category-grid">
          <Link to="/products?category=Men" className="category-card">
            <div className="category-icon">👨</div>
            <h3>Men</h3>
          </Link>
          <Link to="/products?category=Women" className="category-card">
            <div className="category-icon">👩</div>
            <h3>Women</h3>
          </Link>
          <Link to="/products?category=Unisex" className="category-card">
            <div className="category-icon">👥</div>
            <h3>Unisex</h3>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature">
          <div className="feature-icon">🚚</div>
          <h3>Fast Shipping</h3>
          <p>Free shipping on orders over ₹500</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🔒</div>
          <h3>Secure Payment</h3>
          <p>100% secure transactions</p>
        </div>
        <div className="feature">
          <div className="feature-icon">↩️</div>
          <h3>Easy Returns</h3>
          <p>30-day return policy</p>
        </div>
      </section>
    </div>
  );
}

export default Home;
