import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import cartService from '../utils/cartService';

function CartPage() {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  
  // Load cart on component mount
  useEffect(() => {
    try {
      const cartItems = cartService.getCart();
      setCart(cartItems);
    } catch (error) {
      setErrorMsg('Failed to load cart. Please try refreshing the page.');
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Handle quantity change
  const handleQuantityChange = (inventoryId, newQuantity) => {
    // Ensure quantity is at least 1
    if (newQuantity < 1) newQuantity = 1;
    
    try {
      cartService.updateCartItemQuantity(inventoryId, newQuantity);
      setCart(cartService.getCart());
    } catch (error) {
      setErrorMsg('Failed to update quantity. Please try again.');
      console.error('Error updating quantity:', error);
    }
  };
  
  // Handle item removal
  const handleRemoveItem = (inventoryId) => {
    try {
      cartService.removeFromCart(inventoryId);
      setCart(cartService.getCart());
    } catch (error) {
      setErrorMsg('Failed to remove item. Please try again.');
      console.error('Error removing item:', error);
    }
  };
  
  // Clear entire cart
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        cartService.clearCart();
        setCart([]);
      } catch (error) {
        setErrorMsg('Failed to clear cart. Please try again.');
        console.error('Error clearing cart:', error);
      }
    }
  };
  
  // Proceed to checkout
  const handleCheckout = () => {
    const isLoggedIn = localStorage.getItem('token');
    
    if (!isLoggedIn) {
      // Redirect to login if not logged in
      navigate('/login', { state: { from: '/cart', message: 'Please log in to checkout' } });
    } else {
      // Proceed to checkout
      navigate('/checkout');
    }
  };
  
  // Calculate subtotal
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">Loading cart...</div>
      </div>
    );
  }
  
  return (
    <div className="cart-page">
      <div className="container">
        <h1>Your Shopping Cart</h1>
        
        {errorMsg && (
          <div className="error-message">
            {errorMsg}
          </div>
        )}
        
        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <FaShoppingCart />
            </div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any parts to your cart yet.</p>
            <Link to="/search" className="button-primary">
              Browse Parts
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              <div className="cart-header">
                <div className="cart-header-item">Product</div>
                <div className="cart-header-item">Price</div>
                <div className="cart-header-item">Quantity</div>
                <div className="cart-header-item">Total</div>
                <div className="cart-header-item"></div>
              </div>
              
              {cart.map((item) => (
                <div className="cart-item" key={item.inventory_id}>
                  <div className="cart-item-product">
                    <div className="cart-item-image">
                      <img 
                        src={item.image_url || '/images/placeholder.jpg'} 
                        alt={item.title} 
                      />
                    </div>
                    <div className="cart-item-details">
                      <h3>
                        <Link to={`/part/${item.part_id}`}>{item.title}</Link>
                      </h3>
                      <div className="cart-item-meta">
                        <span className="cart-item-condition">
                          Condition: {item.condition}
                        </span>
                        <span className="cart-item-seller">
                          Seller: {item.business_name}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="cart-item-price">
                    ${parseFloat(item.price).toFixed(2)}
                  </div>
                  
                  <div className="cart-item-quantity">
                    <div className="quantity-input-group">
                      <button 
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.inventory_id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.inventory_id, parseInt(e.target.value) || 1)}
                      />
                      <button 
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.inventory_id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="cart-item-total">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </div>
                  
                  <div className="cart-item-remove">
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.inventory_id)}
                      title="Remove item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-actions">
              <div className="cart-action-buttons">
                <Link to="/search" className="continue-shopping">
                  <FaArrowLeft /> Continue Shopping
                </Link>
                <button className="clear-cart" onClick={handleClearCart}>
                  Clear Cart
                </button>
              </div>
              
              <div className="cart-summary">
                <div className="cart-summary-row">
                  <span>Subtotal:</span>
                  <span className="cart-summary-value">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Shipping:</span>
                  <span className="cart-summary-value">Calculated at checkout</span>
                </div>
                <div className="cart-summary-row cart-summary-total">
                  <span>Estimated Total:</span>
                  <span className="cart-summary-value">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <button 
                  className="checkout-button"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </button>
                <div className="cart-summary-note">
                  Taxes and shipping calculated at checkout
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartPage;