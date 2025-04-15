import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaShoppingCart, FaHeart, FaCheck, FaTimes, FaArrowLeft, FaStar } from 'react-icons/fa';

function PartDetailsPage() {
  const { id } = useParams();
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  useEffect(() => {
    const fetchPart = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`/api/parts/${id}`);
        setPart(response.data.data);
        
        // Select the first inventory item by default if available
        if (response.data.data.inventory && response.data.data.inventory.length > 0) {
          setSelectedInventory(response.data.data.inventory[0]);
        }
      } catch (err) {
        console.error('Error fetching part details:', err);
        setError('Failed to load part details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPart();
  }, [id]);
  
  const handleInventorySelect = (inventory) => {
    setSelectedInventory(inventory);
    // Reset quantity when selecting a different inventory
    setQuantity(1);
  };
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    // Ensure quantity is between 1 and available stock
    if (value >= 1 && (!selectedInventory || value <= selectedInventory.quantity)) {
      setQuantity(value);
    }
  };
  
  const handleAddToCart = () => {
    // TODO: Implement cart functionality
    alert(`Added ${quantity} item(s) to cart`);
  };
  
  const handleAddToWishlist = () => {
    // TODO: Implement wishlist functionality
    alert('Added to wishlist');
  };
  
  if (loading) {
    return (
      <div className="part-details-page">
        <div className="container">
          <div className="loading-spinner">Loading part details...</div>
        </div>
      </div>
    );
  }
  
  if (error || !part) {
    return (
      <div className="part-details-page">
        <div className="container">
          <div className="error-message">
            {error || 'Part not found'}
            <Link to="/search" className="back-link">
              <FaArrowLeft /> Back to Search
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Prepare images array (main image and any additional images)
  const images = [
    part.image_url || '/images/placeholder.jpg',
    // Add additional images if available
    ...(part.images || []).map(img => img.url),
  ];
  
  return (
    <div className="part-details-page">
      <div className="container">
        <div className="breadcrumbs">
          <Link to="/">Home</Link> &gt; 
          <Link to={`/category/${part.category_id}`}>{part.category_name}</Link> &gt; 
          <span>{part.title}</span>
        </div>
        
        <div className="part-details-container">
          <div className="part-images">
            <div className="main-image">
              <img src={images[activeImageIndex]} alt={part.title} />
            </div>
            
            {images.length > 1 && (
              <div className="image-thumbnails">
                {images.map((image, index) => (
                  <div 
                    key={index}
                    className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img src={image} alt={`${part.title} - Image ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="part-info">
            <h1 className="part-title">{part.title}</h1>
            
            <div className="part-meta">
              <div className="part-sku">SKU: {part.sku}</div>
              {part.manufacturer && (
                <div className="part-manufacturer">Manufacturer: {part.manufacturer}</div>
              )}
            </div>
            
            <div className="part-description">
              <h3>Description</h3>
              <p>{part.description || 'No description available.'}</p>
            </div>
            
            {part.compatibility && part.compatibility.length > 0 && (
              <div className="part-compatibility">
                <h3>Compatibility</h3>
                <div className="compatibility-list">
                  <ul>
                    {part.compatibility.map((comp, index) => (
                      <li key={index}>
                        {comp.make_name} {comp.model_name} 
                        {comp.year_from && comp.year_to 
                          ? ` (${comp.year_from}-${comp.year_to})` 
                          : comp.year_from 
                            ? ` (${comp.year_from}+)` 
                            : ''}
                        {comp.notes && <span className="notes"> - {comp.notes}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {part.weight || part.dimensions ? (
              <div className="part-specs">
                <h3>Specifications</h3>
                <ul>
                  {part.weight && <li><strong>Weight:</strong> {part.weight} kg</li>}
                  {part.dimensions && <li><strong>Dimensions:</strong> {part.dimensions}</li>}
                </ul>
              </div>
            ) : null}
          </div>
          
          <div className="part-purchase">
            <h3>Available From</h3>
            
            {part.inventory && part.inventory.length > 0 ? (
              <div className="inventory-options">
                {part.inventory.map((item, index) => (
                  <div 
                    key={index}
                    className={`inventory-option ${selectedInventory && selectedInventory.id === item.id ? 'selected' : ''}`}
                    onClick={() => handleInventorySelect(item)}
                  >
                    <div className="supplier-name">{item.business_name}</div>
                    <div className="condition">Condition: {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}</div>
                    <div className="price">${parseFloat(item.price).toFixed(2)}</div>
                    <div className="stock-status">
                      {item.quantity > 0 ? (
                        <span className="in-stock"><FaCheck /> In Stock ({item.quantity} available)</span>
                      ) : (
                        <span className="out-of-stock"><FaTimes /> Out of Stock</span>
                      )}
                    </div>
                    
                    {item.shipping_cost && (
                      <div className="shipping">
                        Shipping: ${parseFloat(item.shipping_cost).toFixed(2)}
                      </div>
                    )}
                    
                    {item.minimum_days && item.maximum_days && (
                      <div className="delivery-time">
                        Delivery: {item.minimum_days}-{item.maximum_days} days
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-inventory">
                This part is currently not available from any supplier.
              </div>
            )}
            
            {selectedInventory && selectedInventory.quantity > 0 && (
              <div className="purchase-actions">
                <div className="quantity-selector">
                  <label htmlFor="quantity">Quantity:</label>
                  <div className="quantity-input-group">
                    <button 
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <input 
                      type="number"
                      id="quantity"
                      min="1"
                      max={selectedInventory.quantity}
                      value={quantity}
                      onChange={handleQuantityChange}
                    />
                    <button 
                      onClick={() => quantity < selectedInventory.quantity && setQuantity(quantity + 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="total-price">
                  Total: ${(parseFloat(selectedInventory.price) * quantity).toFixed(2)}
                </div>
                
                <button onClick={handleAddToCart} className="add-to-cart-btn">
                  <FaShoppingCart /> Add to Cart
                </button>
                
                <button onClick={handleAddToWishlist} className="add-to-wishlist-btn">
                  <FaHeart /> Add to Wishlist
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="part-reviews">
          <h2>Customer Reviews</h2>
          
          {/* Placeholder for future reviews implementation */}
          <div className="reviews-coming-soon">
            <p>Reviews will be available soon!</p>
          </div>
        </div>
        
        <div className="related-parts">
          <h2>Related Parts</h2>
          
          {/* Placeholder for related parts implementation */}
          <div className="related-parts-coming-soon">
            <p>Check back later for related parts suggestions!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PartDetailsPage;