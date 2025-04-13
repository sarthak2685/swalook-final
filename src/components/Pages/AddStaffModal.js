import React, { useState } from 'react';
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

      toast.success("Staff added successfully");
      onAddStaff(newStaff);
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add staff';
      toast.error(errorMessage);
    }
  };

  const Label = ({ children, required }) => (
    <div className="flex items-center mb-1 text-sm font-medium text-gray-700">
      {children} {required && <span className="text-black font-bold ml-1">*</span>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <Toaster />
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6 shadow-lg flex flex-col justify-between">
        <h2 className="text-2xl font-bold text-center mb-6">Add Staff</h2>
        <form className="flex flex-col gap-4 flex-grow">
          <label>
            <Label required>Name</Label>
            <input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:border-blue-500" />
          </label>
          <label>
            <Label required>Role</Label>
            <input type="text" value={staffRole} onChange={(e) => setStaffRole(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:border-blue-500" />
          </label>
          <label>
            <Label required>Mobile No.</Label>
            <input type="number" value={staffMobile} onChange={(e) => setStaffMobile(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:border-blue-500" />
          </label>
          <label>
            <Label required>Salary</Label>
            <input type="number" value={staffSalary} onChange={(e) => setStaffSalary(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:border-blue-500" />
          </label>

          <h3 className="text-lg font-semibold mt-4 text-gray-700">Earnings</h3>
          <label>
            <Label required>Basic Salary (%)</Label>
            <input type="number" value={base} onChange={(e) => setBase(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:border-blue-500" />
          </label>
          <label>
            <Label>House Rent Allowance (HRA) (%)</Label>
            <input type="number" value={houseRentAllowance} onChange={(e) => setHouseRentAllowance(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mt-1" />
          </label>
          <label>
            <Label>Incentive Pay (%)</Label>
            <input type="number" value={incentivePay} onChange={(e) => setIncentivePay(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mt-1" />
          </label>
          <label>
            <Label>Meal Allowance (Decimal)</Label>
            <input type="number" step="0.01" value={mealAllowance} onChange={(e) => setMealAllowance(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mt-1" />
          </label>

          <h3 className="text-lg font-semibold mt-4 text-gray-700">Deductions</h3>
          <label>
            <Label>Provident Fund (Decimal)</Label>
            <input type="number" step="0.01" value={providentFund} onChange={(e) => setProvidentFund(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mt-1" />
          </label>
          <label>
            <Label>Professional Tax (Decimal)</Label>
            <input type="number" step="0.01" value={professionalTax} onChange={(e) => setProfessionalTax(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mt-1" />
          </label>

          <label>
            <Label required>Joining Date</Label>
            <input type="date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:border-blue-500" />
          </label>

          <div className="flex justify-between mt-6">
            <button type="button" onClick={handleAddStaff} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-[48%]">Add Staff</button>
            <button type="button" onClick={onClose} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 w-[48%]">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;