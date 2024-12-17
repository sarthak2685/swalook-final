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
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(
        `https://4qskkbuiu6n3coyj7jfvol22zm0snpll.lambda-url.us-east-1.on.aws/`,
        { mobileno, password }
      );
    
      if (response.status === 200) {
        const cleanText = response.data.text.replace(/^\"|\"$/g, '');
        const cleanType = response.data.type.replace(/^\"|\"$/g, '');
        const cleanSalonName = response.data.salon_name.replace(/^\"|\"$/g, '');
        const cleanBranchName = response.data.branch_id.replace(/^\"|\"$/g, '');
        const cleanToken = response.data.token.replace(/^\"|\"$/g, '');
    
        if (cleanText === 'login done!') {
          Cookies.set('loggedIn', 'true', { expires: 10 });
          Cookies.set('type', cleanType, { expires: 10 });
          Cookies.set('salonName', cleanSalonName, { expires: 10 });
          Cookies.set('branch_n', cleanBranchName, { expires: 10 });
    
          localStorage.setItem('branch_name', btoa(cleanBranchName));
          localStorage.setItem('s-name', cleanSalonName);
          localStorage.setItem('type', cleanType);
          localStorage.setItem('token', cleanToken);
    
          // const number = btoa(response.data.user.replace(/^\"|\"$/g, ''));
          // localStorage.setItem('number', number);
    
          // Navigate based on user type
          if (cleanType === 'owner') {
            navigate(`/${cleanSalonName}`);
          } else {
            navigate(`/${cleanSalonName}/${btoa(cleanBranchName)}/dashboard`);
          }
        } else {
          setErrorMessage('Invalid login credentials. Please try again.');
          setShowError(true);
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Invalid login credentials. Please check your details and try again.');
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
            <button id='btn' type="submit">
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
