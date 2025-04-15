import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaFilter, FaSort, FaSearch } from 'react-icons/fa';

function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const queryParams = new URLSearchParams(location.search);
  
  // State for search parameters
  const [searchQuery, setSearchQuery] = useState(queryParams.get('q') || '');
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Dummy data for testing
  const dummyParts = [
    {
      id: 1,
      title: 'Brake Pad Set',
      description: 'High quality brake pad set suitable for most vehicle makes and models.',
      price: 49.99,
      category_name: 'Brake System',
      image_url: 'https://via.placeholder.com/200',
      manufacturer: 'BrakeMaster',
      in_stock: true
    },
    {
      id: 2,
      title: 'Oil Filter',
      description: 'Premium oil filter that removes contaminants from engine oil.',
      price: 12.99,
      category_name: 'Engine Components',
      image_url: 'https://via.placeholder.com/200',
      manufacturer: 'FilterPro',
      in_stock: true
    },
    {
      id: 3,
      title: 'Spark Plug Set',
      description: 'Set of 4 spark plugs for optimal engine performance.',
      price: 24.95,
      category_name: 'Electrical System',
      image_url: 'https://via.placeholder.com/200',
      manufacturer: 'SparkTech',
      in_stock: false
    }
  ];
  
  useEffect(() => {
    // For demo, load dummy data after a short delay
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Filter by category if categoryId is provided
        let filteredParts = dummyParts;
        if (categoryId) {
          // This is a very simplified approach - in a real app,
          // you would make an API call with the category filter
          filteredParts = dummyParts.filter(part => 
            part.category_name.toLowerCase().includes(categoryId.toLowerCase())
          );
        }
        
        // Filter by search query if provided
        if (searchQuery) {
          filteredParts = filteredParts.filter(part => 
            part.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            part.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            part.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        setParts(filteredParts);
      } catch (err) {
        setError('Failed to load parts. Please try again later.');
        console.error('Error loading parts:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [categoryId, searchQuery]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Update URL with search query
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };
  
  return (
    <div className="search-page">
      <div className="container">
        <div className="search-header">
          <h1>
            {categoryId 
              ? `${categoryId.charAt(0).toUpperCase() + categoryId.slice(1)} Parts` 
              : 'Search Results'}
          </h1>
          
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for car parts..."
                className="search-input"
              />
              <button type="submit" className="search-button">
                <FaSearch />
              </button>
            </div>
          </form>
          
          <div className="mobile-filter-toggle">
            <button onClick={() => setShowFilters(!showFilters)}>
              <FaFilter /> Filters
            </button>
          </div>
        </div>
        
        <div className="search-results-container">
          <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filter-section">
              <h3>Filter Results</h3>
              <p>Filters would go here in a complete implementation.</p>
            </div>
          </aside>
          
          <div className="search-results">
            <div className="search-results-header">
              <div className="results-count">
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <p>{parts.length === 0 ? 'No parts found' : `Showing ${parts.length} results`}</p>
                )}
              </div>
              
              <div className="sort-options">
                <label htmlFor="sort-select">
                  <FaSort /> Sort by:
                </label>
                <select id="sort-select">
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price (Low to High)</option>
                  <option value="price_desc">Price (High to Low)</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
            
            {error && (
              <div className="error-message">{error}</div>
            )}
            
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading parts...</p>
              </div>
            ) : parts.length === 0 ? (
              <div className="no-results">
                <h3>No parts found</h3>
                <p>Try adjusting your search or filters to find what you're looking for.</p>
              </div>
            ) : (
              <div className="parts-grid">
                {parts.map(part => (
                  <div key={part.id} className="part-card">
                    <div className="part-image">
                      <img src={part.image_url} alt={part.title} />
                    </div>
                    <div className="part-details">
                      <h3 className="part-title">
                        <a href={`/part/${part.id}`}>{part.title}</a>
                      </h3>
                      <div className="part-category">{part.category_name}</div>
                      <div className="part-manufacturer">
                        <span>Manufacturer:</span> {part.manufacturer}
                      </div>
                      <p className="part-description">{part.description}</p>
                    </div>
                    <div className="part-purchase">
                      <div className="part-price">${part.price.toFixed(2)}</div>
                      <div className="part-stock">
                        {part.in_stock ? (
                          <span className="in-stock">In Stock</span>
                        ) : (
                          <span className="out-of-stock">Out of Stock</span>
                        )}
                      </div>
                      <a href={`/part/${part.id}`} className="view-details-button">
                        View Details
                      </a>
                      {part.in_stock && (
                        <button className="add-to-cart-button">
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;