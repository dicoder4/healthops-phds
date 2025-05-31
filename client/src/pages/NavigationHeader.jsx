import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/NavigationHeader.css'; // Your CSS file
import '@fortawesome/fontawesome-free/css/all.min.css';

const NavigationHeader = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gmail, setGmail] = useState('');
  const [phNo, setPhNo] = useState('');
  const [gmailError, setGmailError] = useState('');
  const [phNoError, setPhNoError] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  
  useEffect(() => {
    // Fetch current user details from the backend when the component mounts
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/current_user', { withCredentials: true });

  // Adjust the endpoint if needed
        const { gmail, phNo } = response.data;
        setGmail(gmail || '');
        setPhNo(phNo || '');
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Function to toggle the sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Validate email format
  const validateEmail = (email) => {
    const isValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/.test(email);
    setGmailError(isValid ? '' : 'Please enter a valid email address.');
    return isValid;
  };

  // Validate phone number format (10 digits)
  const validatePhone = (phone) => {
    const isValid = /^\d{10}$/.test(phone);
    setPhNoError(isValid ? '' : 'Please enter a valid 10-digit phone number.');
    return isValid;
  };

  // Handle form submit to update user profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateEmail(gmail) && validatePhone(phNo)) {
      try {
        const response = await axios.put(
  '/api/users/update',  // full backend URL
  { gmail, phNo },
  {
    withCredentials: true // this is crucial for session support
  }
);

        setAlertMessage(response.data.message);  // Display success message
      } catch (err) {
  console.error('Update error:', err.response?.data || err.message);
  setAlertMessage(err.response?.data?.message || 'Failed to update profile');
}
    }
  };

  // Handle Gmail input change
  const handleGmailChange = (e) => setGmail(e.target.value);

  // Handle Phone number input change
  const handlePhNoChange = (e) => setPhNo(e.target.value);

  // Handle logout
  const onLogout = async () => {
    try {
      //await axios.post('/api/users/logout', {}, { withCredentials: true });

      // Redirect to login or home page
      window.location.href = '/';  // You can change this to the appropriate route
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header id="masthead" className="site-header header-at-top">
      <div className="container site-header__container">
        <a href="/" className="site-branding">
          {/* Add your logo here */}
        </a>

        <div className="site-header__menu">
          <nav id="site-navigation" className="main-navigation">
            <div className="menu-primary-navigation-container">
              <ul id="primary-menu" className="menu">
                <li className="menu-item"><a href="/homePage">Home</a></li>
                <li className="menu-item"><a href="/index">Find My Condition</a></li>
                <li className="menu-item"><a href="/health-metrics">Health Metrics</a></li>
                <li className="menu-item"><a href="/fitnessLogs">Fitness Logs</a></li>
                <li className="menu-item"><a href="/reminders">Reminders</a></li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="profile-icon" onClick={toggleSidebar}>
          <i className="fas fa-user-circle"></i>
        </div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className={`profile-sidebar ${sidebarOpen ? 'active' : ''}`} id="profile-sidebar">
          <form id="profile-form" onSubmit={handleSubmit}>
            <div className="content">
              <h1>Personal Details</h1>
              <p>Welcome to your profile page! Here you can view and edit your personal information.</p>
            </div>

            <label htmlFor="gmail">Gmail:</label>
            <input
              type="text"
              id="gmail"
              name="gmail"
              placeholder="JohnWick@gmail.com"
              value={gmail}
              onChange={handleGmailChange}
              required
            />
            {gmailError && <span style={{ color: 'red' }}>{gmailError}</span>}

            <label htmlFor="phNo">Phone Number:</label>
            <input
              type="text"
              id="phNo"
              name="phNo"
              placeholder="Enter 10-digit phone number"
              value={phNo}
              onChange={handlePhNoChange}
              required
            />
            {phNoError && <span style={{ color: 'red' }}>{phNoError}</span>}

            <button type="submit">Save Changes</button><br /><br />
          </form>

          {alertMessage && <div className="alert-message">{alertMessage}</div>}

          <button className="logout-button" onClick={onLogout}>Logout</button><br /><br />
          <button id="close-sidebar" onClick={toggleSidebar}>Close</button>
        </div>
      )}
    </header>
  );
};

export default NavigationHeader;

