import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>CarParts Marketplace</h3>
            <p>Find the right car parts at the best prices from trusted suppliers.</p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <FaYoutube />
              </a>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/search">Search Parts</Link></li>
              <li><Link to="/category/engine">Engine Parts</Link></li>
              <li><Link to="/category/brake">Brake System</Link></li>
              <li><Link to="/category/electrical">Electrical Parts</Link></li>
              <li><Link to="/category/suspension">Suspension & Steering</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Customer Service</h3>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/shipping">Shipping Information</Link></li>
              <li><Link to="/returns">Returns & Refunds</Link></li>
              <li><Link to="/warranty">Warranty</Link></li>
              <li><Link to="/help">Help Center</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Sell With Us</h3>
            <ul>
              <li><Link to="/sell">Become a Seller</Link></li>
              <li><Link to="/seller-guidelines">Seller Guidelines</Link></li>
              <li><Link to="/seller-faq">Seller FAQ</Link></li>
              <li><Link to="/seller-dashboard">Seller Dashboard</Link></li>
              <li><Link to="/seller-terms">Terms for Sellers</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="payment-methods">
            <img src="/images/payment-visa.svg" alt="Visa" />
            <img src="/images/payment-mastercard.svg" alt="Mastercard" />
            <img src="/images/payment-amex.svg" alt="American Express" />
            <img src="/images/payment-paypal.svg" alt="PayPal" />
          </div>
          
          <div className="copyright">
            &copy; {currentYear} CarParts Marketplace. All rights reserved.
          </div>
          
          <div className="legal-links">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;