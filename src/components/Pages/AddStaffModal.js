import React, { useState } from 'react';
import '../Styles/AddStaffModal.css';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import config from '../../config';

const AddStaffModal = ({ onClose, onAddStaff }) => {
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [staffSalary, setStaffSalary] = useState('');
  const [base, setBase] = useState('');
  const [houseRentAllowance, setHouseRentAllowance] = useState('');
  const [incentivePay, setIncentivePay] = useState('');
  const [mealAllowance, setMealAllowance] = useState('');
  const [providentFund, setProvidentFund] = useState('');
  const [professionalTax, setProfessionalTax] = useState('');
  const [staffSlab, setStaffSlab] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [staffMobile, setStaffMobile] = useState('');

  const handleAddStaff = async () => {
    // Validate required fields
    if (!staffName || !staffRole || !staffSalary || !base || !staffMobile || !joiningDate) {
      toast.error('Please fill in all mandatory fields.');
      return;
    }

    const newStaff = {
      staff_name: staffName,
      staff_role: staffRole,
      mobile_no: staffMobile,
      staff_salary_monthly: Number(staffSalary),
      base: Number(base),
      house_rent_allownance: Number(houseRentAllowance) || 0,
      incentive_pay: Number(incentivePay) || 0,
      meal_allowance: parseFloat(mealAllowance) || 0,
      staff_provident_fund: parseFloat(providentFund) || 0,
      staff_professional_tax: parseFloat(professionalTax) || 0,
      staff_slab: Number(staffSlab) || 0,
      staff_joining_date: joiningDate,
    };

    try {
      const token = localStorage.getItem('token');
      const bid = localStorage.getItem('branch_id');

      const response = await axios.post(
        `${config.apiUrl}/api/swalook/staff/?branch_name=${bid}`,
        newStaff,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log("Staff added successfully", response.data);
      toast.success("Staff added successfully");
      onAddStaff(newStaff);
      onClose();
    } catch (error) {
      console.error("Error adding staff", error);
      const errorMessage = error.response?.data?.message || 'Failed to add staff';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="add-staff-modal-overlay">
      <Toaster />
      <div className="add-staff-modal-container">
        <h2 className="add-staff-modal-title">Add Staff</h2>
        <form className="add-staff-form">
          <label>
            <div className="label-with-asterisk">
              Name 
              <span className="required-asterisk">*</span>
            </div>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              required
              className="full-width-input"
            />
          </label>
          <label>
            <div className="label-with-asterisk">
              Role 
              <span className="required-asterisk">*</span>
            </div>
            <input
              type="text"
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value)}
              required
              className="full-width-input"
            />
          </label>
          <label>
            <div className="label-with-asterisk">
              Mobile No. 
              <span className="required-asterisk">*</span>
            </div>
            <input
              type="number"
              value={staffMobile}
              onChange={(e) => setStaffMobile(e.target.value)}
              required
              className="full-width-input"
            />
          </label>
          <label>
            <div className="label-with-asterisk">
              Salary 
              <span className="required-asterisk">*</span>
            </div>
            <input
              type="number"
              value={staffSalary}
              onChange={(e) => setStaffSalary(e.target.value)}
              required
              className="full-width-input"
            />
          </label>

          <h3 className="section-title">Earnings</h3>
          <label>
            <div className="label-with-asterisk">
              Basic Salary (%) 
              <span className="required-asterisk">*</span>
            </div>
            <input
              type="number"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              required
              className="full-width-input"
            />
          </label>
          <label>
            <div className="label-with-asterisk">
              House Rent Allowance (HRA) (%) 
            </div>
            <input
              type="number"
              value={houseRentAllowance}
              onChange={(e) => setHouseRentAllowance(e.target.value)}
              className="full-width-input"
            />
          </label>
          <label>
            <div className="label-with-asterisk">
              Incentive Pay (%) 
            </div>
            <input
              type="number"
              value={incentivePay}
              onChange={(e) => setIncentivePay(e.target.value)}
              className="full-width-input"
            />
          </label>
          <label>
            <div className="label-with-asterisk">
              Meal Allowance (Decimal) 
            </div>
            <input
              type="number"
              step="0.01"
              value={mealAllowance}
              onChange={(e) => setMealAllowance(e.target.value)}
              className="full-width-input"
            />
          </label>

          <h3 className="section-title">Deductions</h3>
          <label>
            <div className="label-with-asterisk">
              Provident Fund (Decimal) 
            </div>
            <input
              type="number"
              step="0.01"
              value={providentFund}
              onChange={(e) => setProvidentFund(e.target.value)}
              className="full-width-input"
            />
          </label>
          <label>
            <div className="label-with-asterisk">
              Professional Tax (Decimal) 
            </div>
            <input
              type="number"
              step="0.01"
              value={professionalTax}
              onChange={(e) => setProfessionalTax(e.target.value)}
              className="full-width-input"
            />
          </label>

          <label>
            <div className="label-with-asterisk">
              Joining Date 
              <span className="required-asterisk">*</span>
            </div>
            <input
              type="date"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
              required
              className="full-width-input"
            />
          </label>

          <div className="add-staff-button-group">
            <button
              type="button"
              className="add-staff-submit-button"
              onClick={handleAddStaff}
            >
              Add Staff
            </button>
            <button
              type="button"
              className="add-staff-cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;
