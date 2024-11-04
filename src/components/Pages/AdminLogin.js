import React, { useState, useEffect } from 'react';
import '../Styles/AdminLogin.css';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import ForgetPassword from './ForgetPassword';
import Logo1 from '../../assets/S_logo.png';
import axios from 'axios';
import Cookies from 'js-cookie';
import Popup from './Popup';
import { FaLock } from 'react-icons/fa'; // Import lock icon

function AdminLogin() {
  const navigate = useNavigate();
  const { admin_url, salon_name } = useParams();
  
  const decodedAdminUrl = decodeURIComponent(admin_url).trim();
  const decodedSname = decodeURIComponent(salon_name).trim();
  
  const burl = btoa(decodedAdminUrl);
  localStorage.setItem('s-name', decodedSname);

  const [isValid, setIsValid] = useState(false);
  const [mobileno, setMobileno] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://api.crm.swalook.in/api/swalook/verify/${decodedSname}/${decodedAdminUrl}/`);
        setIsValid(response.data.status);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [decodedSname, decodedAdminUrl]);

  useEffect(() => {
    localStorage.setItem('branch_name', burl);
  }, [burl]);

  const handleAdminLogin = (e) => {
    e.preventDefault();

    axios.post('https://api.crm.swalook.in/api/swalook/admin/login/', {
      mobileno,
      password,
    })
    .then((res) => {
      if (res.data.text === 'login successfull !') {
        Cookies.set('loggedIn', 'true', { expires: 10 });
        Cookies.set('type', res.data.type, { expires: 10 });
        Cookies.set('branch_n', res.data.branch_name, { expires: 10 });
        Cookies.set('salon-name', res.data.salon_name, { expires: 10 });
        navigate(`/${decodedSname}/${burl}/dashboard`);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('number', btoa(res.data.user));
        localStorage.setItem('type', res.data.type);
      }
      console.log(res.data);
    })
    .catch((err) => {
      console.log(err);
      setErrorMessage('Invalid login credentials. Please check your credentials and try again.');
      setShowError(true);
    });
  };

  const handleClosePopup = () => {
    setShowError(false);
  };

  const handleResetPasswordClick = () => {
    navigate('/forgetpassword');
  };

  return (
    <div className='Admin_login_container'>
      <Helmet>
        <title>Admin Login</title>
      </Helmet>
      {isValid ? (
        <div className='admin_login_main'>
          <div className='admin_left'>
            <div className='admin_logo'>
              <img className='admin_S_logo' src={Logo1} alt='Logo' />
            </div>
            <div className='admin_form'>
              <h1 className='admin_login_head'>Admin Login</h1>
              <form onSubmit={handleAdminLogin}>
                <div className='AL_input-group'>
                  <label htmlFor='phone-number'>Admin Name:</label>
                  <input
                    type='text'
                    id='phone-number'
                    name='phoneNumber'
                    placeholder='Enter your phone number'
                    onChange={(e) => setMobileno(e.target.value)}
                    required
                  />
                </div>
                <div className='AL_input-group'>
                  <label htmlFor='password'>Password:</label>
                  <div className='password-input-container'>
                    <FaLock className='lock-icon' />
                    <input
                      type='password'
                      id='password'
                      name='password'
                      placeholder='Enter your password'
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className='AL_input-group'>
                  <label htmlFor='confirm-password'>Confirm Password:</label>
                  <div className='password-input-container'>
                    <FaLock className='lock-icon' />
                    <input
                      type='password'
                      id='confirm-password'
                      name='confirmPassword'
                      placeholder='Confirm your password'
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <p className='forgot-password'>
                  Forgot your password?{' '}
                  <a onClick={handleResetPasswordClick}>Reset it</a>
                </p>
                <button type='submit'>Login</button>
              </form>
            </div>
          </div>

          <div className='admin_right'>
            <div className='admin_loginbg'>
              <div className='welcome_text'></div>
            </div>
          </div>
          {showError && <Popup message={errorMessage} onClose={handleClosePopup} />}
        </div>
      ) : (
        <div>
          <h1>Invalid Admin URL</h1>
        </div>
      )}
    </div>
  );
}

export default AdminLogin;
