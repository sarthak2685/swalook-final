import React from 'react'
import '../Styles/ForgetPassword.css'
import Logo1 from '../../assets/S_logo.png';
import config from '../../config';
import { Helmet } from 'react-helmet';

function ForgetPassword() {
  return (
    <div className='fg_container'>
        <Helmet>
        <title>ForgetPassword</title>
      </Helmet>
        <div className='fg_main'> 
            <div className='fg_logo'> 
                <img src={Logo1} alt="Logo" className='fg_logo_img' /> 
            </div>
            <h1 className='fg_header'>Forgot Password</h1>
        </div>
        <div className='fg_bottom'>
            <div className='fg_content'>
                <div className="fg_input-container">
                    <label htmlFor="mobileNo">Mobile No:</label>
                    <input type="text" id="mobileNo" placeholder='Enter Mobile Number' />
                </div>

                <div className="fg_button-container">
                    <button type="submit" className="fg_submit-button">Submit</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ForgetPassword