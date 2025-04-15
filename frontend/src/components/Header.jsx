import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Link to="/">CarParts Marketplace</Link>
        </div>
        
        {/* Mobile menu toggle */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="sr-only">Menu</span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
        </button>
        
        <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/search">Search Parts</Link></li>
            <li className="dropdown">
              <span>Categories</span>
              <div className="dropdown-content">
                <Link to="/category/engine">Engine Parts</Link>
                <Link to="/category/brakes">Brake System</Link>
                <Link to="/category/electrical">Electrical Parts</Link>
                <Link to="/category/suspension">Suspension & Steering</Link>
                <Link to="/category/body">Body Parts</Link>
                <Link to="/category/transmission">Transmission Parts</Link>
              </div>
            </li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register" className="button-primary">Register</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;