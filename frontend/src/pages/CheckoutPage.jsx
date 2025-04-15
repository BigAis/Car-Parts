import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaLock, FaArrowLeft, FaCreditCard, FaPaypal } from 'react-icons/fa';
import cartService from '../utils/cartService';
import { isAuthenticated, getCurrentUser } from '../utils/helpers';

function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: ''
  });
  const [billingAddress, setBillingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: ''
  });
  const [sameBillingAddress, setSameBillingAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });
  
  // Check if user is logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/checkout', message: 'Please log in to continue with checkout' } });
      return;
    }
    
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Prefill user info if available
    if (currentUser) {
      setShippingAddress(prevState => ({
        ...prevState,
        fullName: `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim(),
        phone: currentUser.phone || ''
      }));
    }
    
    // Load cart
    const cartItems = cartService.getCart();
    
    if (cartItems.length === 0) {
      navigate('/cart', { state: { message: 'Your cart is empty' } });
      return;
    }
    
    setCart(cartItems);
    setLoading(false);
  }, [navigate]);
  
  // Copy shipping address to billing address when same address checkbox is checked
  useEffect(() => {
    if (sameBillingAddress) {
      setBillingAddress(shippingAddress);
    }
  }, [sameBillingAddress, shippingAddress]);
  
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    // Validate shipping address
    for (const [key, value] of Object.entries(shippingAddress)) {
      if (!value && key !== 'state') {
        setError(`Please enter your shipping ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    // Validate billing address if different
    if (!sameBillingAddress) {
      for (const [key, value] of Object.entries(billingAddress)) {
        if (!value && key !== 'state') {
          setError(`Please enter your billing ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          return false;
        }
      }
    }
    
    // Validate payment details for credit card
    if (paymentMethod === 'credit_card') {
      if (!cardDetails.cardNumber || cardDetails.cardNumber.length < 15) {
        setError('Please enter a valid card number');
        return false;
      }
      
      if (!cardDetails.cardName) {
        setError('Please enter the name on your card');
        return false;
      }
      
      if (!cardDetails.expiry || !cardDetails.expiry.match(/^\d{2}\/\d{2}$/)) {
        setError('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      
      if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
        setError('Please enter a valid CVV');
        return false;
      }
    }
    
    return true;
  };
  
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };
  
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setProcessing(true);
    setError('');
    
    try {
      // In a real application, you would send the order to your API
      // For now, let's simulate a successful order
      setTimeout(() => {
        // Clear cart
        cartService.clearCart();
        
        // Redirect to order confirmation
        navigate('/order-confirmation/123', { 
          state: { 
            orderId: '123',
            message: 'Your order has been placed successfully!' 
          } 
        });
      }, 1500);
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Sorry, we could not process your order. Please try again later.');
      setProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading checkout information...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="checkout-page">
      <div className="container">
        <div className="page-header">
          <h1>Checkout</h1>
          <p className="breadcrumbs">
            <Link to="/">Home</Link> &gt; <Link to="/cart">Shopping Cart</Link> &gt; <span>Checkout</span>
          </p>
        </div>
        
        <div className="checkout-container">
          <form className="checkout-form" onSubmit={handleSubmitOrder}>
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}
            
            <div className="form-section">
              <h2>Shipping Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="shipping-fullName">Full Name</label>
                  <input
                    type="text"
                    id="shipping-fullName"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="shipping-phone">Phone Number</label>
                  <input
                    type="tel"
                    id="shipping-phone"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="shipping-address">Address</label>
                  <input
                    type="text"
                    id="shipping-address"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="shipping-city">City</label>
                  <input
                    type="text"
                    id="shipping-city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="shipping-state">State/Province</label>
                  <input
                    type="text"
                    id="shipping-state"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleShippingChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="shipping-postalCode">Postal Code</label>
                  <input
                    type="text"
                    id="shipping-postalCode"
                    name="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="shipping-country">Country</label>
                  <input
                    type="text"
                    id="shipping-country"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <div className="billing-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={sameBillingAddress}
                    onChange={() => setSameBillingAddress(!sameBillingAddress)}
                  />
                  <span>Billing address is the same as shipping address</span>
                </label>
              </div>
              
              {!sameBillingAddress && (
                <>
                  <h2>Billing Information</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="billing-fullName">Full Name</label>
                      <input
                        type="text"
                        id="billing-fullName"
                        name="fullName"
                        value={billingAddress.fullName}
                        onChange={handleBillingChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="billing-phone">Phone Number</label>
                      <input
                        type="tel"
                        id="billing-phone"
                        name="phone"
                        value={billingAddress.phone}
                        onChange={handleBillingChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label htmlFor="billing-address">Address</label>
                      <input
                        type="text"
                        id="billing-address"
                        name="address"
                        value={billingAddress.address}
                        onChange={handleBillingChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="billing-city">City</label>
                      <input
                        type="text"
                        id="billing-city"
                        name="city"
                        value={billingAddress.city}
                        onChange={handleBillingChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="billing-state">State/Province</label>
                      <input
                        type="text"
                        id="billing-state"
                        name="state"
                        value={billingAddress.state}
                        onChange={handleBillingChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="billing-postalCode">Postal Code</label>
                      <input
                        type="text"
                        id="billing-postalCode"
                        name="postalCode"
                        value={billingAddress.postalCode}
                        onChange={handleBillingChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="billing-country">Country</label>
                      <input
                        type="text"
                        id="billing-country"
                        name="country"
                        value={billingAddress.country}
                        onChange={handleBillingChange}
                        required
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="form-section">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                <div className="payment-method">
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={() => setPaymentMethod('credit_card')}
                    />
                    <span className="payment-icon"><FaCreditCard /></span>
                    <span>Credit Card</span>
                  </label>
                </div>
                
                <div className="payment-method">
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                    />
                    <span className="payment-icon"><FaPaypal /></span>
                    <span>PayPal</span>
                  </label>
                </div>
              </div>
              
              {paymentMethod === 'credit_card' && (
                <div className="card-details">
                  <div className="form-group">
                    <label htmlFor="cardNumber">Card Number</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={cardDetails.cardNumber}
                      onChange={handleCardDetailsChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="cardName">Name on Card</label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      value={cardDetails.cardName}
                      onChange={handleCardDetailsChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  
                  <div className="card-row">
                    <div className="form-group">
                      <label htmlFor="expiry">Expiry Date</label>
                      <input
                        type="text"
                        id="expiry"
                        name="expiry"
                        value={cardDetails.expiry}
                        onChange={handleCardDetailsChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="cvv">CVV</label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardDetailsChange}
                        placeholder="123"
                        maxLength="4"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'paypal' && (
                <div className="paypal-message">
                  <p>You will be redirected to PayPal to complete your payment after reviewing your order.</p>
                </div>
              )}
            </div>
            
            <div className="checkout-actions">
              <Link to="/cart" className="back-to-cart-btn">
                <FaArrowLeft /> Back to Cart
              </Link>
              
              <button 
                type="submit" 
                className="place-order-btn"
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Place Order'}
                {!processing && <FaLock />}
              </button>
            </div>
          </form>
          
          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.inventory_id}>
                  <div className="item-image">
                    <img 
                      src={item.image_url || '/images/placeholder.jpg'} 
                      alt={item.title}
                    />
                  </div>
                  <div className="item-details">
                    <h3 className="item-title">{item.title}</h3>
                    <div className="item-meta">
                      <span className="condition">Condition: {item.condition}</span>
                      <span className="quantity">Qty: {item.quantity}</span>
                    </div>
                    <div className="item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="price-summary">
              <div className="price-row">
                <span>Subtotal</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="price-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="price-row">
                <span>Tax</span>
                <span>${(calculateTotal() * 0.07).toFixed(2)}</span>
              </div>
              <div className="price-row total">
                <span>Total</span>
                <span>${(calculateTotal() * 1.07).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="order-notes">
              <p className="secure-checkout">
                <FaLock /> Secure Checkout
              </p>
              <p className="satisfaction-guarantee">
                All purchases are backed by our satisfaction guarantee.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;