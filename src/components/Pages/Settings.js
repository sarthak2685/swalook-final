import React, { useState } from 'react';
import '../Styles/Settings.css';
import { Link } from 'react-router-dom';
import Header from './Header';
import PI from '../../assets/PI.png';
import HD from '../../assets/HD.png';
import SY from '../../assets/SY.png'; // Make sure to import the team image if it's not already
import CLP from '../../assets/CLP.png';
import axios from 'axios';
import config from '../../config';
import VertNav from './VertNav';

function Settings() {
  const [newRows, setNewRows] = useState([]);
  
  const branchName = localStorage.getItem('branch_name');
  const sname = localStorage.getItem('s-name');
  const bid = localStorage.getItem('branch_id');

  const handleSave = async () => {
    const branchName = localStorage.getItem('branch_name');
    const apiEndpoint = `${config.apiUrl}/api/swalook/loyality_program/?branch_name=${bid}`;
    const newRows = [
      {
        type: 'None',
        points: '0',
        expiry: '0',
        charges: '0',
      }
    ];

    try {
      if (newRows.length > 0) {
        const response = await axios.post(apiEndpoint, {
          json_data: newRows,
          branch_name: atob(branchName),
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`,
          },
        });

        console.log('Success:', response.data);
        console.log('Error:', newRows);
        setNewRows([]);
      } else {
        console.log('No new rows to save.');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      // Any cleanup if necessary
    }
  };

  return (
    <div className='settings_container'>
      <Header />
      <VertNav />
      <div className="content_container">
        <Link to={`/${sname}/${branchName}/settings/personalInformation`} className="settings_box">
          <img src={PI} alt="Personal Information" />
          <h2>Personal Information</h2>
          <p>Manage your account details</p>
        </Link>
        <Link to={`/${sname}/${branchName}/settings/clpsetting`} onClick={handleSave} className="settings_box">
          <img src={CLP} alt="Customer Loyalty" />
          <h2>Customer Loyalty</h2>
          <p>Edit your customer loyalty settings here</p>
        </Link>
        <Link to={`/${sname}/${branchName}/help`} className="settings_box">
          <img src={HD} alt="Help Desk" />
          <h2>Help Desk</h2>
          <p>Resolve your Query</p>
        </Link>
        <Link to={`/${sname}/${branchName}/staffSettings`} className="settings_box">
          <img src={SY} alt="Staff Working Days" /> {/* Make sure the path is correct for the team image */}
          <h2>Staff Working Days</h2>
          <p>Edit Commission</p>
        </Link>
      </div>
    </div>
  );
}

export default Settings;
