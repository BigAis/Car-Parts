import React, { useState, useEffect } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import axios from 'axios';

function SearchFilter({ 
  onFilterChange, 
  initialFilters = {},
  showMobile,
  onCloseMobile
}) {
  // Filter states
  const [categories, setCategories] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [filters, setFilters] = useState({
    category: initialFilters.category || '',
    make: initialFilters.make || '',
    model: initialFilters.model || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    condition: initialFilters.condition || '',
    inStock: initialFilters.inStock || false
  });

  // Fetch categories on component mount
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
  
  // Fetch models when make changes
  useEffect(() => {
    if (filters.make) {
      const fetchModels = async () => {
        try {
          const response = await axios.get(`/api/cars/models/${filters.make}`);
          setModels(response.data.data);
        } catch (err) {
          console.error('Error fetching car models:', err);
        }
      };
      
      fetchModels();
    } else {
      setModels([]);
      // Reset model if make is cleared
      if (filters.model) {
        handleFilterChange('model', '');
      }
    }
  }, [filters.make]);
  
  // Handle filter changes
  const handleFilterChange = (name, value) => {
    const newFilters = {
      ...filters,
      [name]: value
    };
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (name) => {
    const newValue = !filters[name];
    handleFilterChange(name, newValue);
  };
  
  // Reset all filters
  const resetFilters = () => {
    const resetValues = {
      category: '',
      make: '',
      model: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      inStock: false
    };
    
    setFilters(resetValues);
    onFilterChange(resetValues);
  };

  return (
    <div className={`search-filters ${showMobile ? 'mobile-visible' : ''}`}>
      <div className="filters-header">
        <h3>Filter Results</h3>
        {showMobile && (
          <button className="close-filters" onClick={onCloseMobile}>
            <FaTimes />
          </button>
        )}
      </div>
      
      <div className="filter-section">
        <h4>Categories</h4>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
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
        <h4>Vehicle</h4>
        <select
          value={filters.make}
          onChange={(e) => handleFilterChange('make', e.target.value)}
          className="filter-select"
        >
          <option value="">All Makes</option>
          {makes.map(make => (
            <option key={make.id} value={make.id}>
              {make.name}
            </option>
          ))}
        </select>
        
        {filters.make && (
          <select
            value={filters.model}
            onChange={(e) => handleFilterChange('model', e.target.value)}
            className="filter-select"
          >
            <option value="">All Models</option>
            {models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        )}
      </div>
      
      <div className="filter-section">
        <h4>Price Range</h4>
        <div className="price-range">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="price-input"
            min="0"
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="price-input"
            min="0"
          />
        </div>
      </div>
      
      <div className="filter-section">
        <h4>Condition</h4>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="condition"
              value=""
              checked={filters.condition === ''}
              onChange={() => handleFilterChange('condition', '')}
            />
            <span>Any</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="condition"
              value="new"
              checked={filters.condition === 'new'}
              onChange={() => handleFilterChange('condition', 'new')}
            />
            <span>New</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="condition"
              value="used"
              checked={filters.condition === 'used'}
              onChange={() => handleFilterChange('condition', 'used')}
            />
            <span>Used</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="condition"
              value="refurbished"
              checked={filters.condition === 'refurbished'}
              onChange={() => handleFilterChange('condition', 'refurbished')}
            />
            <span>Refurbished</span>
          </label>
        </div>
      </div>
      
      <div className="filter-section">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={() => handleCheckboxChange('inStock')}
          />
          <span>In Stock Only</span>
        </label>
      </div>
      
      <div className="filter-actions">
        <button onClick={resetFilters} className="reset-filters-btn">
          Reset Filters
        </button>
      </div>
    </div>
  );
}

export default SearchFilter;