import React, { useEffect, useState } from 'react';
import AttendancePopup from './Attendence.js';
import SalarySlipPopup from './SalarySlipPopup.jsx';
import AddStaffModal from './AddStaffModal.js';
import '../Styles/AdminManagement.css';
import EditStaff from './EditStaff.js';
import config from '../../config.js';
import toast, { Toaster } from 'react-hot-toast';
import { IconButton } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import VertNav from './VertNav.js';
import Header from './Header.js';

const AdminManagement = () => {
  const [staffData, setStaffData] = useState([]);
  const [showAttendancePopup, setShowAttendancePopup] = useState(false);
  const [showSalarySlipPopup, setShowSalarySlipPopup] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [staffId, setStaffId] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [showEditStaff, setShowEditStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const userType = user.type;

  const getDaysInMonth = (month, year) => {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  
    if (isLeapYear && month === 1) {
      return 29;
    }
  
    return daysInMonth[month];
  };
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const bid = localStorage.getItem('branch_id');
        try {
          const response = await fetch(`${config.apiUrl}/api/swalook/staff/?branch_name=${bid}`, {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            }
          });
      
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
      
          const data = await response.json();
          console.log("API Response:", data); 

          const attendanceResponse = await fetch(`${config.apiUrl}/api/swalook/staff/attendance/?branch_name=${bid}`,{
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if(!attendanceResponse.ok) throw new Error('Failed to fetch attendance');
          const attendanceData = await attendanceResponse.json();
          console.log("Attendance Response:", attendanceData);
      
          const staffArray = Array.isArray(data.table_data) ? data.table_data : [];
          const totalDays = attendanceData.current_month_days;
          console.log("Total Days:", totalDays);
          const attendanceTable = attendanceData.table_data || {};
          console.log("dsbhj", attendanceTable);
      
          if (staffArray.length === 0) {
            console.warn("No staff data found in table_date.");
          }
          const formattedData = staffArray.map(staff => {
            const attendanceRecord = attendanceTable[staff.mobile_no] || { number_of_days_present: 0 };
            console.log("records", attendanceRecord)
          return {
            id: staff.id || staff.staff_id || null,
            name: staff.staff_name || 'N/A',
            role: staff.staff_role || 'N/A',
            mobile: staff.mobile_no || 'N/A', 
            salary: parseFloat(staff.staff_salary_monthly) || 0,
            commission: parseFloat(staff.staff_slab) || 0, 
            attendance: {
              present: attendanceRecord.number_of_days_present,
              total: totalDays 
            },
            business: parseFloat(staff.business_of_the_current_month) || 0 
          };
});

      
          console.log("Formatted Staff Data:", formattedData); 
          setStaffData(formattedData);
        } catch (error) {
          console.error('Error:', error);
          setStaffData([]);
        }
      };
      
    fetchData();
  }, []); 

  //for bulk attendenceonAttendanceMarked
  

  const handleEditStaff = (staff) => {
    setSelectedStaff(staff);
    setShowEditStaff(true);
  }
  const handleSaveEditedStaff = (updatedStaff) => {
    setStaffData((prevData)=>
    prevData.map((staff) =>
    staffData.id === selectedStaff.id ? {...staff, ...updatedStaff}:staff ))
    toast.success("staff detail updated successfully");
  }

  const handleAttendanceMarked = (staffId, attendanceData) => {
    setStaffData((prevData) => prevData.map(staff => {
        if (staff.id === staffId) {
          const updatedAttendance = {
            ...staff.attendance,
            present: attendanceData.filter(date => date.attend).length
          };
          return { ...staff, attendance: updatedAttendance };
        }
        return staff;
      }));
  };
  const openDeleteConfirm = (staffId) =>{
    setStaffId(staffId);
    setDeleteConfirmation(true);
  }

  const handleDeleteStaff = async() =>{
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${config.apiUrl}/api/swalook/staff/?id=${staffId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      setStaffData((prevData) => prevData.filter(staff=> staff.id !== staffId));
      setDeleteConfirmation(false);
      toast.success("Staff deleted successfully");
    } catch (error){
        console.error('Error deleting staff:', error);
        toast.error('Failed to delete staff');
    }
  }
  const openAttendancePopup = (staffId) => {
    setSelectedStaffId(staffId);
    setShowAttendancePopup(true);
  };

  const openSalarySlipPopup = (staffId) => {
    setSelectedStaffId(staffId); // Set the selected staff ID
    setShowSalarySlipPopup(true); // Show the popup
};

  const handleAddStaff = (newStaff) => {
    console.log('Staff added:', newStaff);
  };

  return (
    <>
    <Header />
    <VertNav />
    <div className="staff-mgmt-container">
        
        <Toaster />
        
      <div className='add-staff'>
      <h1 className="staff-mgmt-title text-3xl">Staff Management</h1>

        <button className="staff-mgmt-add-button" onClick={() => setShowAddStaffModal(true)}>
          Add Staff
        </button>
      </div>
      
      <div className='table-responsive'>
      <table className="staff-mgmt-table">
        <thead>
          <tr>
            <th>SNo.</th>
            <th>Staff Name</th>
            <th>Staff Role</th>
            <th>Staff Mobile</th>
            <th>Staff Salary</th>
            <th>Staff Commission</th>
            <th>Attendance MTD</th>
            <th>Business MTD</th>
            <th>Mark Attendance</th>
            <th>Salary Slip</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {staffData.map((staff, index) => (
            <tr key={staff.id}>
              <td>{index + 1}</td>
              <td>{staff.name}</td>
              <td>{staff.role}</td>
              <td>{staff.mobile}</td>
              <td>{staff.salary}</td>
              <td>{staff.commission}</td>
              <td>{`${staff.attendance.present}/${staff.attendance.total}`}</td>
              <td>{staff.business}</td>
              <td>
                <buttons
                  id="staff-mgmt-attendance-button"
                  onClick={() => openAttendancePopup(staff.id)}
                >
                  Mark 
                </buttons>
              </td>
              <td>
                <buttons
                  id="staff-mgmt-salary-button"
                  onClick={() => openSalarySlipPopup(staff.id)}                >
                  Slip
                </buttons>
              </td>
              <td>
              <IconButton
  id="staff-mngmt-edit-button"
  onClick={() => userType !== "staff" && handleEditStaff(staff)}
  disabled={userType === "staff"}
  sx={{
    opacity: userType === "staff" ? 0.5 : 1,
    cursor: userType === "staff" ? "not-allowed" : "pointer",
  }}
>
  <Edit />
</IconButton>

                </td>
              <td>
              <IconButton
  id="staff-mgmt-delete-button"
  onClick={() => userType !== "staff" && openDeleteConfirm(staff.id)}
  color="error"
  aria-label="delete"
  disabled={userType === "staff"}
  sx={{
    opacity: userType === "staff" ? 0.5 : 1,
    cursor: userType === "staff" ? "not-allowed" : "pointer",
  }}
>
  <Delete />
</IconButton>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {showAttendancePopup && (
        <AttendancePopup
          onClose={() => setShowAttendancePopup(false)}
          onAttendanceMarked={handleAttendanceMarked} 
          staffId={selectedStaffId}
          initialAttendance={staffData.find(staff => staff.id === selectedStaffId)?.attendance}
          
        />
      )}

{showSalarySlipPopup && (
    <SalarySlipPopup onClose={() => setShowSalarySlipPopup(false)} staffId={selectedStaffId} />
)}

      {showAddStaffModal && (
        <AddStaffModal onClose={() => setShowAddStaffModal(false)} onAddStaff={handleAddStaff} />
      )}
        {showEditStaff && (
            <EditStaff
              isOpen={showEditStaff}
              onClose={() => setShowEditStaff(false)}
              staffData={selectedStaff}
              onSave={handleSaveEditedStaff}
            />
  
        )}

       {deleteConfirmation && (
        <div className="modal-overlay6">
          <div className="modal-content6">
            <h2>Are you sure you want to delete this staff member?</h2>
            {/* <p>Mobile No: {staffId}</p> */}
            <div className='button_responsive'>
            <button className='delete_icon' onClick={handleDeleteStaff}>Yes</button>
            <button className='delete_item' onClick={() => setDeleteConfirmation(false)}>Cancel</button>
          </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default AdminManagement;