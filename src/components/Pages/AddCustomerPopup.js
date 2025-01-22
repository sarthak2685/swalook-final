import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/AddCustomerPopup.css';
import Popup from './Popup';
import CircularProgress from '@mui/material/CircularProgress';
import config from '../../config';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';

function AddCustomerPopup({ onClose }) {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [email, setEmail] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const branchName = localStorage.getItem('branch_name');
  const sname = localStorage.getItem('s-name');
  const bid = localStorage.getItem('branch_id');
  const [dob, setDob] = useState('');  
  const [doa, setDoa] = useState('');

  const handleSubmit = async (e) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    e.preventDefault();
    try {
      const response = await fetch(`${config.apiUrl}/api/swalook/loyality_program/customer/?branch_name=${bid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          name: customerName,
          mobile_no: customerNumber,
          email: email,
          membership: 'None',
          d_o_b: dob, 
          d_o_a: doa,
        }),
      });

      if (response.ok) {
        setPopupMessage('Customer added successfully!');
        setShowPopup(true);
        onClose();
      } else {
        setPopupMessage('Failed to add customer.');
        setShowPopup(true);
      }
    } catch (error) {
      setPopupMessage('An error occurred.');
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ac_popup_overlay">
      <div className="ac_popup_container">
        <div className="ac_popup_header">
          <h3 className="ac_popup_title font-bold ">Add Customer</h3>
          <button className="ac_close_button" onClick={onClose}>
            <HighlightOffOutlinedIcon style={{ fontSize: '24px', color: 'red' }} />
          </button>
        </div>
        <hr className="ac_divider"/>
        <form onSubmit={handleSubmit}>
          <div className="ac_field">
            <label htmlFor="customer_name" >Name:</label>
            <input 
              type="text" 
              id="customer_name" 
              name="customer_name" 
              placeholder='Customer Name' 
              required 
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="ac_field">
            <label htmlFor="customer_number">Number:</label>
            <input 
              type="text" 
              id="customer_number" 
              name="customer_number" 
              placeholder="Customer Number" 
              required 
              onChange={(e) => setCustomerNumber(e.target.value)}
            />
          </div>
          <div className="ac_field">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email Address"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="ac_field">
            <label htmlFor="dob">DOB:</label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          <div className="ac_field">
            <label htmlFor="doa">DOA:</label>
            <input
              type="date"
              id="doa"
              name="doa"
              value={doa}
              onChange={(e) => setDoa(e.target.value)}
            />
          </div>
          <div className="ac_button_container">
            <button className="ac_save_button">
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
      {showPopup && <Popup message={popupMessage} onClose={() => { setShowPopup(false); navigate(`/${sname}/${branchName}/clp`); }} />}
    </div>
  );
}

export default AddCustomerPopup;
