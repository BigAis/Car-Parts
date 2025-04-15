import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';

function PartCard({ part }) {
  // Find the lowest price from all suppliers
  const lowestPrice = part.inventory && part.inventory.length > 0
    ? Math.min(...part.inventory.map(item => parseFloat(item.price)))
    : null;
  
  // Count how many suppliers offer this part
  const supplierCount = part.inventory ? part.inventory.length : 0;
  
  // Format price with 2 decimal places
  const formatPrice = (price) => {
    return price !== null ? price.toFixed(2) : 'N/A';
  };
  
  // Determine if the part is in stock
  const isInStock = part.inventory && part.inventory.some(item => item.quantity > 0);
  
  return (
    <div className="part-card">
      <div className="part-image">
        {part.image_url ? (
          <img src={part.image_url} alt={part.title} />
        ) : (
          <div className="placeholder-image">No Image</div>
        )}
        <button className="wishlist-button" title="Add to wishlist">
          <FaHeart />
        </button>
      </div>
      
      <div className="part-details">
        <Link to={`/part/${part.id}`} className="part-title">
          {part.title}
        </Link>
        
        <div className="part-category">
          {part.category_name}
        </div>
        
        {part.manufacturer && (
          <div className="part-manufacturer">
            <span>Manufacturer:</span> {part.manufacturer}
          </div>
        )}
        
        {part.sku && (
          <div className="part-sku">
            <span>SKU:</span> {part.sku}
          </div>
        )}
        
        <div className="part-compatibility">
          {part.compatibility && part.compatibility.length > 0 ? (
            <div className="compatibility-list">
              <span>Compatible with:</span>
              <ul>
                {part.compatibility.slice(0, 2).map((comp, index) => (
                  <li key={index}>
                    {comp.make_name} {comp.model_name} 
                    {comp.year_from && comp.year_to 
                      ? ` (${comp.year_from}-${comp.year_to})` 
                      : comp.year_from 
                        ? ` (${comp.year_from}+)` 
                        : ''}
                  </li>
                ))}
                {part.compatibility.length > 2 && (
                  <li>+{part.compatibility.length - 2} more</li>
                )}
              </ul>
            </div>
          ) : (
            <div className="no-compatibility">
              Check product details for compatibility
            </div>
          )}
        </div>
      </div>
      
      <div className="part-purchase">
        <div className="part-price">
          {lowestPrice !== null ? (
            <>
              <span className="price-from">From</span>
              <span className="price-value">${formatPrice(lowestPrice)}</span>
            </>
          ) : (
            <span className="no-price">Price unavailable</span>
          )}
        </div>
        
        <div className="part-stock">
          {isInStock ? (
            <span className="in-stock">In Stock</span>
          ) : (
            <span className="out-of-stock">Out of Stock</span>
          )}
        </div>
        
        <div className="part-suppliers">
          {supplierCount > 0 ? (
            <span>{supplierCount} supplier{supplierCount > 1 ? 's' : ''}</span>
          ) : (
            <span>No suppliers</span>
          )}
        </div>
        
        <Link to={`/part/${part.id}`} className="view-details-button">
          View Details
        </Link>
        
        {isInStock && (
          <button className="add-to-cart-button">
            <FaShoppingCart /> Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}

export default PartCard;