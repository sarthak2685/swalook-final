import React, { useState } from 'react';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import Logo1 from '../../assets/header_crm_logo.webp';
import { Helmet } from 'react-helmet';
import '../Styles/OwnerLogin.css';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Popup from './Popup';
import CircularProgress from '@mui/material/CircularProgress';
import config from '../../config';

function OwnerLogin() {
  const navigate = useNavigate();
  const [mobileno, setMobileno] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const response = await axios.post(`${config.apiUrl}/api/swalook/centralized/login/`, {
        mobileno,
        password,
      });

      if (response.data.error.message === 'login successful!') {
        Cookies.set('loggedIn', 'true', { expires: 10 });
        Cookies.set('type', response.data.data.type, { expires: 10 });
        const salonName = response.data.data.salon_name;
        Cookies.set('salonName', salonName, { expires: 10 });
        Cookies.set('branch_n', response.data.data.branch_name, { expires: 10 });
        localStorage.setItem('branch_name', btoa(response.data.data.branch_name));
        localStorage.setItem('s-name', salonName);
        localStorage.setItem('type', response.data.data.type);
        
        if (response.data.data.type === 'owner') {
          navigate(`/${salonName}`);
        } else {
          navigate(`/${salonName}/${btoa(response.data.data.branch_name)}/dashboard`);
        }
        
        const token = response.data.data.token;
        const number = btoa(response.data.data.user);
        localStorage.setItem('token', token);
        localStorage.setItem('number', number);
        localStorage.setItem('branch_id', response.data.data.branch_id);
      } 
    } catch (error) {
      console.log(error);
      setErrorMessage('Invalid login credentials. Please check your credentials and try again.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClosePopup = () => {
    setShowError(false);
  };

  return (
    <div className='owner_login_container'>
      <div className='owner_login_main'>
        <div className='owner_logo'>
          <img className='owner_S_logo' src={Logo1} alt="Logo" />
        </div>
        <div className='owner_form'>
          <h1 className='owner_login_head'>Login</h1>
          <form onSubmit={handleAdminLogin}>
            <div className="OL_input-group">
              <label htmlFor="phone-number">Phone Number:</label>
              <input
                type="text"
                id="phone-number"
                placeholder="Enter your phone number"
                onChange={(e) => setMobileno(e.target.value)}
                required
              />
            </div>
            <div className="OL_input-group">
              <label htmlFor="password">Password:</label>
              <div className="password-input-container">
                <LockOpenIcon className="lock-icon" />
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <p className="forgot-password">Forgot your password? <a href="#">Reset it</a></p>
            <button type="submit">
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Login'}
            </button>
          </form>
        </div>
      </div>
      {showError && <Popup message={errorMessage} onClose={handleClosePopup} />}
    </div>
  );
}

export default OwnerLogin;
