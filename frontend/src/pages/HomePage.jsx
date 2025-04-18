import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaCar, FaCogs, FaTruck } from 'react-icons/fa';

function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <h1>Find the Right Car Parts at the Best Prices</h1>
          <p>Search thousands of spare parts from trusted suppliers</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            const searchInput = e.target.elements.searchInput.value;
            if (searchInput.trim()) {
              window.location.href = `/search?q=${encodeURIComponent(searchInput)}`;
            }
          }} className="search-box">
            <input 
              type="text"
              name="searchInput"
              placeholder="Search by part name, car model, or part number..." 
            />
            <button type="submit" className="search-btn">Search</button>
          </form>
        </div>
      </section>
      
      <section className="featured-categories">
        <div className="container">
          <h2>Browse Parts by Category</h2>
          <div className="category-grid">
            <Link to="/category/engine" className="category-card">
              <div className="icon">🔧</div>
              <h3>Engine Parts</h3>
            </Link>
            <Link to="/category/brakes" className="category-card">
              <div className="icon">🛑</div>
              <h3>Brake System</h3>
            </Link>
            <Link to="/category/electrical" className="category-card">
              <div className="icon">⚡</div>
              <h3>Electrical Parts</h3>
            </Link>
            <Link to="/category/suspension" className="category-card">
              <div className="icon">🔩</div>
              <h3>Suspension & Steering</h3>
            </Link>
            <Link to="/category/body" className="category-card">
              <div className="icon">🚗</div>
              <h3>Body Parts</h3>
            </Link>
            <Link to="/category/transmission" className="category-card">
              <div className="icon">⚙️</div>
              <h3>Transmission Parts</h3>
            </Link>
          </div>
        </div>
      </section>
      
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-icon">1</div>
              <h3>Search</h3>
              <p>Find the parts you need by make, model, or part number</p>
            </div>
            <div className="step">
              <div className="step-icon">2</div>
              <h3>Compare</h3>
              <p>Compare prices and options from multiple suppliers</p>
            </div>
            <div className="step">
              <div className="step-icon">3</div>
              <h3>Order</h3>
              <p>Purchase directly from the supplier with secure checkout</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="featured-suppliers">
        <div className="container">
          <h2>Trusted Suppliers</h2>
          <div className="suppliers-grid">
            <div className="supplier-card">AutoParts Inc.</div>
            <div className="supplier-card">PartsMaster</div>
            <div className="supplier-card">Elite Components</div>
            <div className="supplier-card">MotorWorks Supply</div>
          </div>
          <div className="cta-container">
            <Link to="/register?type=business" className="cta-button">Become a Supplier</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;