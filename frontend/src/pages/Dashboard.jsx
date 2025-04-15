import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUser, 
  FaStore, 
  FaBoxOpen, 
  FaShoppingCart, 
  FaHeart, 
  FaClipboardList, 
  FaChartLine,
  FaCog, 
  FaSignOutAlt 
} from 'react-icons/fa';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    // Check for user in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
    
    // Fetch latest user data
    const fetchUserData = async () => {
      try {
        const userId = JSON.parse(storedUser).id;
        const response = await axios.get(`/api/users/${userId}`);
        setUser(response.data.data);
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(response.data.data));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    if (storedUser) {
      fetchUserData();
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  
  // Redirect if not logged in
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview user={user} />;
      case 'profile':
        return <UserProfile user={user} />;
      case 'orders':
        return <OrdersHistory />;
      case 'inventory':
        return <InventoryManagement />;
      case 'wishlist':
        return <Wishlist />;
      case 'settings':
        return <AccountSettings />;
      default:
        return <DashboardOverview user={user} />;
    }
  };
  
  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-grid">
          <aside className="dashboard-sidebar">
            <div className="user-info">
              <div className="avatar">
                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
              </div>
              <div className="user-details">
                <h3>{user.first_name} {user.last_name}</h3>
                <p>{user.user_type === 'business' ? 'Business Account' : 'Customer Account'}</p>
              </div>
            </div>
            
            <nav className="dashboard-nav">
              <ul>
                <li>
                  <a 
                    className={activeTab === 'overview' ? 'active' : ''} 
                    onClick={() => setActiveTab('overview')}
                  >
                    <FaChartLine /> Dashboard
                  </a>
                </li>
                <li>
                  <a 
                    className={activeTab === 'profile' ? 'active' : ''} 
                    onClick={() => setActiveTab('profile')}
                  >
                    <FaUser /> My Profile
                  </a>
                </li>
                <li>
                  <a 
                    className={activeTab === 'orders' ? 'active' : ''} 
                    onClick={() => setActiveTab('orders')}
                  >
                    <FaClipboardList /> Orders
                  </a>
                </li>
                
                {user.user_type === 'business' && (
                  <li>
                    <a 
                      className={activeTab === 'inventory' ? 'active' : ''} 
                      onClick={() => setActiveTab('inventory')}
                    >
                      <FaBoxOpen /> Inventory
                    </a>
                  </li>
                )}
                
                {user.user_type === 'customer' && (
                  <li>
                    <a 
                      className={activeTab === 'wishlist' ? 'active' : ''} 
                      onClick={() => setActiveTab('wishlist')}
                    >
                      <FaHeart /> Wishlist
                    </a>
                  </li>
                )}
                
                <li>
                  <a 
                    className={activeTab === 'settings' ? 'active' : ''} 
                    onClick={() => setActiveTab('settings')}
                  >
                    <FaCog /> Account Settings
                  </a>
                </li>
                
                <li>
                  <a onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </a>
                </li>
              </ul>
            </nav>
          </aside>
          
          <main className="dashboard-content">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

// Dashboard Overview Component
function DashboardOverview({ user }) {
  return (
    <div className="dashboard-overview">
      <h1>Dashboard</h1>
      <p>Welcome back, {user.first_name}!</p>
      
      <div className="stats-grid">
        {user.user_type === 'business' ? (
          <>
            <div className="stat-card">
              <div className="stat-icon"><FaBoxOpen /></div>
              <div className="stat-content">
                <h3>0</h3>
                <p>Active Listings</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaShoppingCart /></div>
              <div className="stat-content">
                <h3>0</h3>
                <p>Orders Received</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaChartLine /></div>
              <div className="stat-content">
                <h3>$0.00</h3>
                <p>Total Sales</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-icon"><FaShoppingCart /></div>
              <div className="stat-content">
                <h3>0</h3>
                <p>Orders Placed</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaHeart /></div>
              <div className="stat-content">
                <h3>0</h3>
                <p>Wishlist Items</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaStore /></div>
              <div className="stat-content">
                <h3>Search</h3>
                <p><Link to="/search">Find Parts</Link></p>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="empty-state">
          <p>No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
}

// User Profile Component
function UserProfile({ user }) {
  return (
    <div className="user-profile">
      <h1>My Profile</h1>
      
      <div className="profile-section">
        <h2>Personal Information</h2>
        <div className="profile-info">
          <div className="info-group">
            <label>First Name</label>
            <p>{user.first_name || 'Not provided'}</p>
          </div>
          <div className="info-group">
            <label>Last Name</label>
            <p>{user.last_name || 'Not provided'}</p>
          </div>
          <div className="info-group">
            <label>Email</label>
            <p>{user.email}</p>
          </div>
          <div className="info-group">
            <label>Phone</label>
            <p>{user.phone || 'Not provided'}</p>
          </div>
          <div className="info-group">
            <label>Account Type</label>
            <p>{user.user_type === 'business' ? 'Business' : 'Customer'}</p>
          </div>
          <div className="info-group">
            <label>Member Since</label>
            <p>{new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <button className="edit-button">Edit Profile</button>
      </div>
      
      {user.user_type === 'business' && user.profile && (
        <div className="profile-section">
          <h2>Business Information</h2>
          <div className="profile-info">
            <div className="info-group">
              <label>Business Name</label>
              <p>{user.profile.business_name}</p>
            </div>
            <div className="info-group">
              <label>Address</label>
              <p>{user.profile.address}</p>
            </div>
            <div className="info-group">
              <label>City</label>
              <p>{user.profile.city}</p>
            </div>
            <div className="info-group">
              <label>Postal Code</label>
              <p>{user.profile.postal_code}</p>
            </div>
            <div className="info-group">
              <label>Country</label>
              <p>{user.profile.country}</p>
            </div>
            {user.profile.tax_id && (
              <div className="info-group">
                <label>Tax ID</label>
                <p>{user.profile.tax_id}</p>
              </div>
            )}
            {user.profile.website && (
              <div className="info-group">
                <label>Website</label>
                <p><a href={user.profile.website} target="_blank" rel="noopener noreferrer">{user.profile.website}</a></p>
              </div>
            )}
          </div>
          <button className="edit-button">Edit Business Information</button>
        </div>
      )}
      
      {user.user_type === 'customer' && user.profile && (
        <div className="profile-section">
          <h2>Shipping Information</h2>
          <div className="profile-info">
            {user.profile.address ? (
              <>
                <div className="info-group">
                  <label>Address</label>
                  <p>{user.profile.address}</p>
                </div>
                <div className="info-group">
                  <label>City</label>
                  <p>{user.profile.city}</p>
                </div>
                <div className="info-group">
                  <label>State/Province</label>
                  <p>{user.profile.state || 'Not provided'}</p>
                </div>
                <div className="info-group">
                  <label>Postal Code</label>
                  <p>{user.profile.postal_code}</p>
                </div>
                <div className="info-group">
                  <label>Country</label>
                  <p>{user.profile.country}</p>
                </div>
              </>
            ) : (
              <p>No shipping information provided.</p>
            )}
          </div>
          <button className="edit-button">Edit Shipping Information</button>
        </div>
      )}
    </div>
  );
}

// Orders History Component
function OrdersHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders');
        setOrders(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }
  
  return (
    <div className="orders-history">
      <h1>My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="empty-state">
          <p>You haven't placed any orders yet.</p>
          <Link to="/search" className="button-primary">Shop Now</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id">Order #{order.id}</div>
                <div className="order-date">{new Date(order.created_at).toLocaleDateString()}</div>
                <div className={`order-status status-${order.status}`}>{order.status}</div>
              </div>
              <div className="order-items">
                {order.items.map(item => (
                  <div key={item.id} className="order-item">
                    <div className="item-image">
                      <img src={item.image_url || '/images/placeholder.jpg'} alt={item.title} />
                    </div>
                    <div className="item-details">
                      <div className="item-title">{item.title}</div>
                      <div className="item-price">${parseFloat(item.price).toFixed(2)}</div>
                      <div className="item-quantity">Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-footer">
                <div className="order-total">Total: ${parseFloat(order.total_amount).toFixed(2)}</div>
                <Link to={`/order/${order.id}`} className="view-order-button">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Inventory Management Component for Business Users
function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        // Get user ID from local storage
        const userId = JSON.parse(localStorage.getItem('user')).id;
        const response = await axios.get(`/api/inventory/business/${userId}`);
        setInventory(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setLoading(false);
      }
    };
    
    fetchInventory();
  }, []);
  
  if (loading) {
    return <div className="loading">Loading inventory...</div>;
  }
  
  return (
    <div className="inventory-management">
      <h1>Inventory Management</h1>
      
      <div className="inventory-actions">
        <button className="button-primary">Add New Part</button>
        <button className="button-secondary">Import Inventory</button>
      </div>
      
      {inventory.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any parts in your inventory yet.</p>
          <p>Add parts to start selling on our marketplace.</p>
        </div>
      ) : (
        <div className="inventory-table">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Part Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id}>
                  <td>
                    <img 
                      src={item.part.image_url || '/images/placeholder.jpg'} 
                      alt={item.part.title}
                      className="part-thumbnail"
                    />
                  </td>
                  <td>{item.part.title}</td>
                  <td>{item.part.sku}</td>
                  <td>${parseFloat(item.price).toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>{item.condition}</td>
                  <td>
                    <span className={`status ${item.quantity > 0 ? 'active' : 'inactive'}`}>
                      {item.quantity > 0 ? 'Active' : 'Out of Stock'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-button">Edit</button>
                      <button className="delete-button">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Wishlist Component for Customer Users
function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await axios.get('/api/wishlist');
        setWishlist(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setLoading(false);
      }
    };
    
    fetchWishlist();
  }, []);
  
  const removeFromWishlist = async (id) => {
    try {
      await axios.delete(`/api/wishlist/${id}`);
      setWishlist(wishlist.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading wishlist...</div>;
  }
  
  return (
    <div className="wishlist">
      <h1>My Wishlist</h1>
      
      {wishlist.length === 0 ? (
        <div className="empty-state">
          <p>Your wishlist is empty.</p>
          <Link to="/search" className="button-primary">Shop Now</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map(item => (
            <div key={item.id} className="wishlist-card">
              <button 
                className="remove-button" 
                onClick={() => removeFromWishlist(item.id)}
                title="Remove from wishlist"
              >
                &times;
              </button>
              <div className="wishlist-image">
                <img src={item.part.image_url || '/images/placeholder.jpg'} alt={item.part.title} />
              </div>
              <div className="wishlist-details">
                <h3 className="wishlist-title">
                  <Link to={`/part/${item.part.id}`}>{item.part.title}</Link>
                </h3>
                <div className="wishlist-price">${parseFloat(item.price).toFixed(2)}</div>
                <div className="wishlist-status">
                  {item.in_stock ? (
                    <span className="in-stock">In Stock</span>
                  ) : (
                    <span className="out-of-stock">Out of Stock</span>
                  )}
                </div>
              </div>
              <div className="wishlist-actions">
                {item.in_stock && (
                  <button className="add-to-cart-button">Add to Cart</button>
                )}
                <Link to={`/part/${item.part.id}`} className="view-details-button">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Account Settings Component
function AccountSettings() {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.confirm_password) {
      alert('New passwords do not match');
      return;
    }
    
    try {
      await axios.post('/api/users/change-password', {
        current_password: formData.current_password,
        new_password: formData.new_password
      });
      
      alert('Password changed successfully');
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      alert('Error changing password. Please try again.');
      console.error('Error changing password:', error);
    }
  };
  
  return (
    <div className="account-settings">
      <h1>Account Settings</h1>
      
      <div className="settings-section">
        <h2>Change Password</h2>
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label htmlFor="current_password">Current Password</label>
            <input
              type="password"
              id="current_password"
              name="current_password"
              value={formData.current_password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="new_password">New Password</label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm_password">Confirm New Password</label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          
          <button type="submit" className="button-primary">Change Password</button>
        </form>
      </div>
      
      <div className="settings-section">
        <h2>Notification Preferences</h2>
        <div className="settings-form">
          <div className="form-group checkbox">
            <label>
              <input type="checkbox" defaultChecked /> 
              Email notifications for orders
            </label>
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input type="checkbox" defaultChecked /> 
              Email notifications for price drops on wishlist items
            </label>
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input type="checkbox" defaultChecked /> 
              Marketing emails and promotions
            </label>
          </div>
          
          <button className="button-primary">Save Preferences</button>
        </div>
      </div>
      
      <div className="settings-section">
        <h2>Delete Account</h2>
        <p className="warning">Warning: This action cannot be undone. All your data will be permanently deleted.</p>
        <button className="button-danger">Delete Account</button>
      </div>
    </div>
  );
}

export default Dashboard;