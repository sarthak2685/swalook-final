import React, { useState } from 'react';
import axios from 'axios';
import '../Styles/EditBranchPopup.css';

function EditBranchPopup({ isOpen, onClose, branchId, branchName }) {
  const salon_name = localStorage.getItem('s-name');
  const [staffUsername, setStaffUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSave = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const postData = {
      staff_name: staffUsername,
      branch_name: branchName,
      password: newPassword,
      admin_password: adminPassword,
      staff_url: branchName,
      admin_url: branchName,
      salon_name: salon_name
    };

    try {
      const response = await axios.post(`https://api.crm.swalook.in/api/swalook/edit/salonbranch/${branchId}/`, postData, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      console.log(response.data); 
      onClose();
    } catch (error) {
      console.error(error);
      
    }
  };

  return (
    <div className="edit-branch-popup_overlay">
      <div className="edit-branch-popup_container">
        <div className="edit-branch-popup_header">
          <div className='edit-branch-pph3'>
            <h3>Edit Branch</h3>
          </div>
          <button className="close_button" onClick={onClose}>X</button>
        </div>
        <hr />
        <form onSubmit={handleSave}>
          <div className="edit-branch-sn1">
            <label htmlFor="saloon_name">Saloon Name:</label>
            <input type="text" id="saloon_name" name="saloon_name" value={salon_name} disabled required />
          </div>
          <div className="edit-branch-sn2">
            <label htmlFor="st-username">Staff Username:</label>
            <input type="text" id="st-username" name="st-username" placeholder="Staff Username" required value={staffUsername} onChange={(e) => setStaffUsername(e.target.value)} />
          </div>
          <div className="edit-branch-sn4">
            <label htmlFor="branch_name">Branch Name:</label>
            <input type="text" id="branch_name" name="branch_name" value={branchName} disabled placeholder='Branch Name' required />
          </div>
          <div className="edit-branch-sn3">
            <label htmlFor="ad-password">Admin Password:</label>
            <input type="password" id="ad-password" name="ad-password" placeholder="Enter Admin Password" required value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
          </div>
          <div className="edit-branch-sn3">
            <label htmlFor="password">New Password:</label>
            <input type="password" id="password" name="password" placeholder="Enter New Password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="edit-branch-sn_button_container">
            <button className="sn_save_button" type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBranchPopup;
