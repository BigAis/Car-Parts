import React from 'react';
import { Link, useParams, useLocation, Navigate } from 'react-router-dom';
import { FaCheckCircle, FaClipboardList, FaArrowRight, FaEnvelope } from 'react-icons/fa';

function OrderConfirmationPage() {
  const { orderId } = useParams();
  const location = useLocation();
  
  // Get success message from location state if available
  const message = location.state?.message || 'Your order has been placed successfully!';
  
  if (!orderId && !location.state?.orderId) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="order-confirmation">
      <div className="container">
        <div className="confirmation-icon">
          <FaCheckCircle />
        </div>
        
        <h1>Thank You for Your Order!</h1>
        
        <div className="order-id">
          Order #: <span>{orderId}</span>
        </div>
        
        <div className="confirmation-message">
          <p>{message}</p>
          <p>A confirmation email has been sent to your email address. Please keep it for your records.</p>
        </div>
        
        <div className="order-actions">
          <Link to="/dashboard" className="btn btn-primary">
            <FaClipboardList /> View Orders
          </Link>
          <Link to="/search" className="btn btn-outline-primary">
            <FaArrowRight /> Continue Shopping
          </Link>
        </div>
        
        <div className="next-steps">
          <h2>What Happens Next?</h2>
          <ul>
            <li>You will receive an order confirmation email shortly. Please check your inbox and spam folder.</li>
            <li>Your order will be processed and prepared for shipping.</li>
            <li>Once your order ships, you will receive a shipping confirmation email with tracking information.</li>
            <li>You can check the status of your order at any time from your account dashboard.</li>
          </ul>
          
          <div className="contact-support">
            <p>Have questions about your order? Contact our customer support:</p>
            <a href="mailto:support@carparts.com" className="support-email">
              <FaEnvelope /> support@carparts.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;