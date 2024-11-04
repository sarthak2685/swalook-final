import React, { useEffect, useState } from 'react';
import '../Styles/EditStaff.css'; 
import config from '../../config';
import axios from 'axios';

const EditStaff = ({ isOpen, onClose, staffData, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    mobile: '',
    salary: '',
    base: '',
    houseRentAllowance: '',
    incentivePay: '',
    mealAllowance: '',
    providentFund: '',
    professionalTax: '',
    staffSlab: '',
    staffJoiningDate: '', // Added joining date field
  });

  useEffect(() => {
    if (staffData) {
      setFormData({
        name: staffData.name,
        role: staffData.role,
        mobile: staffData.mobile,
        salary: staffData.salary,
        base: staffData.base,
        houseRentAllowance: staffData.houseRentAllowance,
        incentivePay: staffData.incentivePay,
        mealAllowance: staffData.mealAllowance,
        providentFund: staffData.providentFund,
        professionalTax: staffData.professionalTax,
        staffSlab: staffData.staffSlab,
        staffJoiningDate: staffData.staff_joining_date || '', // Capture existing joining date
      });
    }
  }, [staffData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const bid = localStorage.getItem('branch_id');

    const payload = {
      staff_name: formData.name,
      staff_role: formData.role,
      mobile_no: formData.mobile || '',
      staff_salary_monthly: formData.salary ? Number(formData.salary) : 0,
      base: formData.base ? Number(formData.base) : 0,
      house_rent_allownance: formData.houseRentAllowance ? Number(formData.houseRentAllowance) : 0,
      incentive_pay: formData.incentivePay ? Number(formData.incentivePay) : 0,
      meal_allowance: formData.mealAllowance ? parseFloat(formData.mealAllowance) : 0,
      staff_provident_fund: formData.providentFund ? parseFloat(formData.providentFund) : 0,
      staff_professional_tax: formData.professionalTax ? parseFloat(formData.professionalTax) : 0,
      staff_slab: formData.staffSlab || '',
      staff_joining_date: formData.joiningDate, // Ensure this is in 'YYYY-MM-DD' format
    };

    try {
      const response = await axios.put(
        `${config.apiUrl}/api/swalook/staff/?id=${staffData.id}&branch_name=${bid}`,
        payload,
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(response);
      onSave(response.data);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  return (
    isOpen && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Edit Staff Details</h2>
          <div className="scrollable-form">
            <div className="form-group">
              <label>Staff Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Role:</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Mobile Number:</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Salary:</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Base:</label>
              <input
                type="number"
                name="base"
                value={formData.base}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>House Rent Allowance:</label>
              <input
                type="number"
                name="houseRentAllowance"
                value={formData.houseRentAllowance}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Incentive Pay:</label>
              <input
                type="number"
                name="incentivePay"
                value={formData.incentivePay}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Meal Allowance:</label>
              <input
                type="number"
                name="mealAllowance"
                value={formData.mealAllowance}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Provident Fund:</label>
              <input
                type="number"
                name="providentFund"
                value={formData.providentFund}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Professional Tax:</label>
              <input
                type="number"
                name="professionalTax"
                value={formData.professionalTax}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Commission:</label>
              <input
                type="number"
                name="staffSlab"
                value={formData.staffSlab}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Joining Date:</label>
              <input
                type="date"
                name="staffJoiningDate"
                value={formData.staffJoiningDate}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="button-group">
            <button onClick={handleSave}>Save</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    )
  );
};

export default EditStaff;
