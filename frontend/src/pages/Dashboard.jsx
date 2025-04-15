import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
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
import { isAuthenticated, getCurrentUser } from '../utils/helpers';

function Dashboard({ activeTab = 'overview' }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(activeTab);
  
  useEffect(() => {
    // Check for user in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);
  
  useEffect(() => {
    // Update current tab when activeTab prop changes
    setCurrentTab(activeTab);
  }, [activeTab]);
  
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
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  const renderContent = () => {
    switch (currentTab) {
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
                    className={currentTab === 'overview' ? 'active' : ''} 
                    onClick={() => setCurrentTab('overview')}
                  >
                    <FaChartLine /> Dashboard
                  </a>
                </li>
                <li>
                  <a 
                    className={currentTab === 'profile' ? 'active' : ''} 
                    onClick={() => setCurrentTab('profile')}
                  >
                    <FaUser /> My Profile
                  </a>
                </li>
                <li>
                  <a 
                    className={currentTab === 'orders' ? 'active' : ''} 
                    onClick={() => setCurrentTab('orders')}
                  >
                    <FaClipboardList /> Orders
                  </a>
                </li>
                
                {user.user_type === 'business' && (
                  <li>
                    <a 
                      className={currentTab === 'inventory' ? 'active' : ''} 
                      onClick={() => setCurrentTab('inventory')}
                    >
                      <FaBoxOpen /> Inventory
                    </a>
                  </li>
                )}
                
                {user.user_type === 'customer' && (
                  <li>
                    <a 
                      className={currentTab === 'wishlist' ? 'active' : ''} 
                      onClick={() => setCurrentTab('wishlist')}
                    >
                      <FaHeart /> Wishlist
                    </a>
                  </li>
                )}
                
                <li>
                  <a 
                    className={currentTab === 'settings' ? 'active' : ''} 
                    onClick={() => setCurrentTab('settings')}
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
        </div>
        <button className="btn btn-primary">Edit Profile</button>
      </div>
    </div>
  );
}

// Orders History Component
function OrdersHistory() {
  return (
    <div className="orders-history">
      <h1>My Orders</h1>
      
      <div className="empty-state">
        <p>You haven't placed any orders yet.</p>
        <Link to="/search" className="btn btn-primary">Shop Now</Link>
      </div>
    </div>
  );
}

// Inventory Management Component for Business Users
function InventoryManagement() {
  return (
    <div className="inventory-management">
      <h1>Inventory Management</h1>
      
      <div className="inventory-actions">
        <button className="btn btn-primary">Add New Part</button>
        <button className="btn btn-secondary">Import Inventory</button>
      </div>
      
      <div className="empty-state">
        <p>You don't have any parts in your inventory yet.</p>
        <p>Add parts to start selling on our marketplace.</p>
      </div>
    </div>
  );
}

// Wishlist Component for Customer Users
function Wishlist() {
  return (
    <div className="wishlist">
      <h1>My Wishlist</h1>
      
      <div className="empty-state">
        <p>Your wishlist is empty.</p>
        <Link to="/search" className="btn btn-primary">Shop Now</Link>
      </div>
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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.confirm_password) {
      alert('New passwords do not match');
      return;
    }
    
    // In a real app, we would call the API to change the password
    alert('Password changed successfully (this is a demo)');
    setFormData({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
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
          
          <button type="submit" className="btn btn-primary">Change Password</button>
        </form>
      </div>
    </div>
  );
}

export default Dashboard;