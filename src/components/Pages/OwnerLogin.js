import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import CircularProgress from '@mui/material/CircularProgress';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import Popup from './Popup';
import config from '../../config';
import Logo1 from '../../assets/header_crm_logo.webp';

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
      const response = await axios.post(`${config.apiUrl}/api/swalook/centralized/login/`, { mobileno, password });
      if (response.data.error.message === 'login successful!') {
        Cookies.set('loggedIn', 'true', { expires: 10 });
        Cookies.set('type', response.data.data.type, { expires: 10 });
        const salonName = response.data.data.salon_name;
        Cookies.set('salonName', salonName, { expires: 10 });
        Cookies.set('branch_n', response.data.data.branch_name, { expires: 10 });
        localStorage.setItem('branch_name', btoa(response.data.data.branch_name));
        localStorage.setItem('s-name', salonName);
        localStorage.setItem('type', response.data.data.type);
        localStorage.setItem("user", JSON.stringify(response.data.data));

        if (response.data.data.type === 'owner') {
          navigate(`/${salonName}`);
        } else {
          navigate(`/${salonName}/${btoa(response.data.data.branch_name)}/dashboard`);
        }

        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('number', btoa(response.data.data.user));
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

  const handleClosePopup = () => setShowError(false);

  return (
    <div className="flex items-center justify-center  bg-gray-100 px-4  overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-white "></div>
      <div className="relative w-full max-w-xl p-8 bg-white rounded-lg shadow-xl z-10 mt-40">
        <div className="flex justify-center mb-4">
          <img src={Logo1} alt="Logo" className="h-44" />
        </div>
        <h1 className="text-2xl font-semibold text-center text-gray-700 mb-6">
  Welcome Back! 
</h1>
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label htmlFor="phone-number" className="block text-gray-600 text-lg mb-1">Phone Number:</label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-4 bg-gray-50">
              <PhoneAndroidIcon className="text-gray-500" />
              <input
                type="text"
                id="phone-number"
                className="ml-2 w-full outline-none bg-transparent"
                placeholder="Enter your phone number"
                onChange={(e) => setMobileno(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-600 text-lg mb-1">Password:</label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-4 bg-gray-50">
              <LockOpenIcon className="text-gray-500" />
              <input
                type="password"
                id="password"
                className="ml-2 w-full outline-none bg-transparent"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <p className="text-lg text-gray-500 text-center">
            Forgot your password? <a href="#" className="text-blue-500 hover:underline">Reset it</a>
          </p>
          <button
            type="submit"
            className="w-full flex items-center justify-center px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Login'}
          </button>
        </form>
      </div>
      {showError && <Popup message={errorMessage} onClose={handleClosePopup} />}
    </div>
  );
}

export default OwnerLogin;
