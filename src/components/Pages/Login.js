import React, { useState, useEffect } from 'react';
import '../Styles/Login.css';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import ForgetPassword from './ForgetPassword';
import Logo1 from '../../assets/S_logo.png';
import axios from 'axios';
import Cookies from 'js-cookie';
import LoginImage from '../../assets/login_bg.png';
import Popup from './Popup';

function Login() {
  const navigate = useNavigate();
  const { admin_url, salon_name } = useParams();

  const decodedAdminUrl = decodeURIComponent(admin_url).trim();
  const decodedSname = decodeURIComponent(salon_name).trim();

  const burl = btoa(decodedAdminUrl);
  localStorage.setItem('s-name', decodedSname);
  const [isValid, setIsValid] = useState(false);
  const [mobileno, setMobileno] = useState('');
  const [password, setPassword] = useState('');

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // useEffect(() => {
  //   const loggedIn = Cookies.get('loggedIn');
  //   const userType = Cookies.get('type');
  //   const salonName = Cookies.get('salonName');
  //   const branch_n = Cookies.get('branch_n');
  //   const salon = Cookies.get('salon-name');
    
  //   if (loggedIn === 'true') {
  //     // if (userType === 'vendor') {
  //     //   navigate(`/${salonName}`);
  //     // }
  //     if (userType === 'admin') {
  //       navigate(`/${salon}/${branch_n}/dashboard`);
  //     } else if (userType === 'staff') {
  //       navigate(`/${salon}/${btoa(branch_n)}/dashboard`);
  //     }
  //   }
  // }, [navigate]);

  // useEffect(() => {
  //   const fetchbody = async () => {
  //     try {
  //       const response = await axios.get(`https://api.crm.swalook.in/api/swalook/verify/${decodedSname}/${decodedAdminUrl}/`);
  //       if (response.body.status === true) {
  //         setIsValid(true);
  //       } else {
  //         setIsValid(false);
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   fetchbody();
  // }, [decodedSname, decodedAdminUrl]);

  const handleAdminLogin = (e) => {
    e.preventDefault();

   

    axios.post('https://4qskkbuiu6n3coyj7jfvol22zm0snpll.lambda-url.us-east-1.on.aws/', {
      mobileno: mobileno,
      password: password,
    })
    .then((res) => {
      try {
        const cleanText = res.body.text.replace(/^\"|\"$/g, ''); 
        const cleanType = res.body.type.replace(/^\"|\"$/g, '');
        const cleanBranchName = res.body.branch_name.replace(/^\"|\"$/g, '');
        const cleanSalonName = res.body.salon_name.replace(/^\"|\"$/g, '');
        const cleanToken = res.body.token.replace(/^\"|\"$/g, '');
    
        if (cleanText === 'login done!') {
          Cookies.set('loggedIn', 'true', { expires: 10 });
          Cookies.set('type', cleanType, { expires: 10 });
          Cookies.set('branch_n', cleanBranchName, { expires: 10 });
          Cookies.set('salon-name', cleanSalonName, { expires: 10 });
    
          navigate(`/${decodedSname}/${burl}/dashboard`);
    
          localStorage.setItem('token', cleanToken);
          const number = btoa(res.body.user); 
          localStorage.setItem('number', number);
          localStorage.setItem('type', cleanType);
        }
    
        console.log(res.body);
      } catch (error) {
        console.error('Error processing response:', error);
      }
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

  return (
    <div className='staff_login_container'>
      <Helmet>
        <title>Staff Login</title>
      </Helmet>
      {isValid ? (
        <div className='staff_login_main'>
          <div className='staff_left'>
            <div className='staff_logo'>
              <img className='staff_S_logo' src={Logo1} alt='Logo' />
            </div>
            <div className='staff_form'>
              <h1 className='staff_login_head'>Staff Login</h1>
              <form onSubmit={handleAdminLogin}>
                <div className='AL_input-group'>
                  <label htmlFor='phone-number'>Staff Name:</label>
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
                  <input
                    type='password'
                    id='password'
                    name='password'
                    placeholder='Enter your password'
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button id='btn' type='submit'>Login</button>
              </form>
            </div>
          </div>
          <div className='staff_right'>
            <div className='staff_loginbg'>
              {/* Render logout button if logged in */}
             
            </div>
          </div>
          {showError && <Popup message={errorMessage} onClose={handleClosePopup} />}
        </div>
      ) : (
        <div>
          <h1>Invalid Staff URL</h1>
        </div>
      )}
    </div>
  );
}

export default Login;
