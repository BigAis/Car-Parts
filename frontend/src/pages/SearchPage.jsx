import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaFilter, FaSort, FaSearch } from 'react-icons/fa';
import PartCard from '../components/PartCard';

function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  // State for search parameters
  const [searchQuery, setSearchQuery] = useState(queryParams.get('q') || '');
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(queryParams.get('category') || '');
  const [selectedMake, setSelectedMake] = useState(queryParams.get('make') || '');
  const [selectedModel, setSelectedModel] = useState(queryParams.get('model') || '');
  const [priceRange, setPriceRange] = useState({
    min: queryParams.get('minPrice') || '',
    max: queryParams.get('maxPrice') || ''
  });
  const [sortBy, setSortBy] = useState(queryParams.get('sort') || 'relevance');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(parseInt(queryParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [resultsPerPage] = useState(20);
  
  // Filter visibility on mobile
  const [showFilters, setShowFilters] = useState(false);
  
  // Load categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    const fetchMakes = async () => {
      try {
        const response = await axios.get('/api/cars/makes');
        setMakes(response.data.data);
      } catch (err) {
        console.error('Error fetching car makes:', err);
      }
    };
    
    fetchCategories();
    fetchMakes();
  }, []);
  
  // Load models when make is selected
  useEffect(() => {
    if (selectedMake) {
      const fetchModels = async () => {
        try {
          const response = await axios.get(`/api/cars/models/${selectedMake}`);
          setModels(response.data.data);
        } catch (err) {
          console.error('Error fetching car models:', err);
        }
      };
      
      fetchModels();
    } else {
      setModels([]);
    }
  }, [selectedMake]);
  
  // Search for parts when parameters change
  useEffect(() => {
    const fetchParts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = {
          search: searchQuery,
          page: currentPage,
          limit: resultsPerPage,
          sort: sortBy
        };
        
        if (selectedCategory) params.category_id = selectedCategory;
        if (priceRange.min) params.min_price = priceRange.min;
        if (priceRange.max) params.max_price = priceRange.max;
        
        // Add make/model compatibility filter
        if (selectedModel) {
          params.model_id = selectedModel;
        }
        
        const response = await axios.get('/api/parts', { params });
        
        setParts(response.data.data.parts);
        setTotalPages(response.data.data.pagination.pages);
      } catch (err) {
        console.error('Error fetching parts:', err);
        setError('Failed to load parts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchParts();
  }, [searchQuery, currentPage, selectedCategory, selectedModel, priceRange.min, priceRange.max, sortBy]);
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedMake) params.set('make', selectedMake);
    if (selectedModel) params.set('model', selectedModel);
    if (priceRange.min) params.set('minPrice', priceRange.min);
    if (priceRange.max) params.set('maxPrice', priceRange.max);
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    navigate({ search: params.toString() }, { replace: true });
  }, [navigate, searchQuery, selectedCategory, selectedMake, selectedModel, priceRange, sortBy, currentPage]);
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };
  
  // Handle filter changes
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };
  
  const handleMakeChange = (e) => {
    setSelectedMake(e.target.value);
    setSelectedModel(''); // Reset model when make changes
    setCurrentPage(1);
  };
  
  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
    setCurrentPage(1);
  };
  
  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const applyPriceFilter = () => {
    setCurrentPage(1);
  };
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  
  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  return (
    <div className="search-page">
      <div className="container">
        <div className="search-header">
          <h1>Search Results</h1>
          
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
              <h3>Categories</h3>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-section">
              <h3>Car Make</h3>
              <select
                value={selectedMake}
                onChange={handleMakeChange}
                className="filter-select"
              >
                <option value="">All Makes</option>
                {makes.map(make => (
                  <option key={make.id} value={make.id}>
                    {make.name}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedMake && (
              <div className="filter-section">
                <h3>Car Model</h3>
                <select
                  value={selectedModel}
                  onChange={handleModelChange}
                  className="filter-select"
                >
                  <option value="">All Models</option>
                  {models.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="filter-section">
              <h3>Price Range</h3>
              <div className="price-inputs">
                <input
                  type="number"
                  name="min"
                  value={priceRange.min}
                  onChange={handlePriceRangeChange}
                  placeholder="Min"
                  min="0"
                />
                <span>to</span>
                <input
                  type="number"
                  name="max"
                  value={priceRange.max}
                  onChange={handlePriceRangeChange}
                  placeholder="Max"
                  min="0"
                />
              </div>
              <button onClick={applyPriceFilter} className="apply-filter-btn">
                Apply
              </button>
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
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={handleSortChange}
                >
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
              <div className="loading-spinner">Loading...</div>
            ) : parts.length === 0 ? (
              <div className="no-results">
                <h3>No parts found</h3>
                <p>Try adjusting your search or filters to find what you're looking for.</p>
              </div>
            ) : (
              <div className="parts-grid">
                {parts.map(part => (
                  <PartCard key={part.id} part={part} />
                ))}
              </div>
            )}
            
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="page-button"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ))
                  .map((page, index, array) => {
                    // Add ellipsis
                    if (index > 0 && page - array[index - 1] > 1) {
                      return (
                        <React.Fragment key={`ellipsis-${page}`}>
                          <span className="pagination-ellipsis">...</span>
                          <button
                            onClick={() => goToPage(page)}
                            className={`page-button ${currentPage === page ? 'active' : ''}`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`page-button ${currentPage === page ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="page-button"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;