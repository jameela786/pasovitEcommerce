import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import '../styles/Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSize, setSelectedSize] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch filters on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [catRes, sizeRes, priceRes] = await Promise.all([
          productAPI.getCategories(),
          productAPI.getSizes(),
          productAPI.getPriceRange()
        ]);
        setCategories(catRes.data.categories || []);
        setSizes(sizeRes.data.sizes || []);
        setPriceRange({
          min: priceRes.data.minPrice,
          max: priceRes.data.maxPrice
        });
        setMaxPrice(priceRes.data.maxPrice);
      } catch (err) {
        console.error('Error fetching filters:', err);
      }
    };
    fetchFilters();
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, selectedSize, minPrice, maxPrice, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        ...(search && { search }),
        ...(selectedCategory !== 'All' && { category: selectedCategory }),
        ...(selectedSize && { size: selectedSize }),
        ...(minPrice > 0 && { minPrice }),
        ...(maxPrice < priceRange.max && { maxPrice })
      };

      const response = await productAPI.getAll(params);
      setProducts(response.data.products);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedSize('');
    setMinPrice(0);
    setMaxPrice(priceRange.max);
    setCurrentPage(1);
  };

  return (
    <div className="products-container">
      <h1>Our Products</h1>

      <div className="products-layout">
        <div className="filters">
          <h3>Filters</h3>

          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="All">All</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Size</label>
            <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
              <option value="">All Sizes</option>
              {sizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range</label>
            <div>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                min={0}
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                max={priceRange.max}
              />
            </div>
            <p>₹{minPrice} - ₹{maxPrice}</p>
          </div>

          <button onClick={handleResetFilters} className="reset-btn">
            Reset Filters
          </button>
        </div>

        <div className="products-content">
          {loading ? (
            <p>Loading...</p>
          ) : products.length === 0 ? (
            <p>No products found</p>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;
