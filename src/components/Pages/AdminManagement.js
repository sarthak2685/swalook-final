import React, { useEffect, useState } from 'react';
import AttendancePopup from './Attendence';
import SalarySlipPopup from './SalarySlipPopup';
import AddStaffModal from './AddStaffModal';
import '../Styles/AdminManagement.css';
import EditStaff from './EditStaff';
import config from '../../config';
import toast, { Toaster } from 'react-hot-toast';
import { IconButton } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import VertNav from './VertNav';
import Header from './Header';

const AdminManagement = () => {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAttendancePopup, setShowAttendancePopup] = useState(false);
  const [showSalarySlipPopup, setShowSalarySlipPopup] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [staffId, setStaffId] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [showEditStaff, setShowEditStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const getDaysInMonth = (month, year) => {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    return isLeapYear && month === 1 ? 29 : daysInMonth[month];
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const bid = localStorage.getItem('branch_id');

      try {
        const response = await fetch(`${config.apiUrl}/api/swalook/staff/?branch_name=${bid}`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch staff data');

        const data = await response.json();
        const attendanceResponse = await fetch(`${config.apiUrl}/api/swalook/staff/attendance/?branch_name=${bid}`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!attendanceResponse.ok) throw new Error('Failed to fetch attendance data');
        const attendanceData = await attendanceResponse.json();

        const staffArray = Array.isArray(data.table_data) ? data.table_data : [];
        const totalDays = attendanceData.current_month_days;
        const attendanceTable = attendanceData.table_data || {};

        const formattedData = staffArray.map(staff => {
          const attendanceRecord = attendanceTable[staff.mobile_no] || { number_of_days_present: 0 };
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

        setStaffData(formattedData);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load staff data.');
        setStaffData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditStaff = (staff) => {
    setSelectedStaff(staff);
    setShowEditStaff(true);
  };

  const handleSaveEditedStaff = async (updatedStaff) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${config.apiUrl}/api/swalook/staff/${selectedStaff.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedStaff),
      });

      if (!response.ok) throw new Error('Failed to update staff data');

      setStaffData((prevData) =>
        prevData.map((staff) =>
          staff.id === selectedStaff.id ? { ...staff, ...updatedStaff } : staff));
      
      toast.success("Staff detail updated successfully");
    } catch (error) {
      console.error('Error updating staff:', error);
      toast.error('Failed to update staff data');
    } finally {
      setShowEditStaff(false);
    }
  };

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

  const openDeleteConfirm = (staffId) => {
    setStaffId(staffId);
    setDeleteConfirmation(true);
  };

  const handleDeleteStaff = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${config.apiUrl}/api/swalook/staff/?id=${staffId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Network response was not ok');
      setStaffData((prevData) => prevData.filter(staff => staff.id !== staffId));
      setDeleteConfirmation(false);
      toast.success("Staff deleted successfully");
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('Failed to delete staff');
    }
  };

  const openAttendancePopup = (staffId) => {
    setSelectedStaffId(staffId);
    setShowAttendancePopup(true);
  };

  const openSalarySlipPopup = (staffId) => {
    setSelectedStaffId(staffId);
    setShowSalarySlipPopup(true);
  };

  const handleAddStaff = (newStaff) => {
    // Handle adding staff
    console.log('Staff added:', newStaff);
  };

  return (
    <>
      <Header />
      <div className="update">
        <VertNav />
        <div className="staff-mgmt-container">
          <Toaster />
          <div className="header-container">
            <h1 className="staff-mgmt-title">Staff Management</h1>
            <div className='add-staff'>
              <button className="staff-mgmt-add-button" onClick={() => setShowAddStaffModal(true)}>
                Add Staff
              </button>
            </div>
          </div>
          <div className='table-responsive'>
            {loading ? (
              <p>Loading...</p>
            ) : (
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
                    <th style={{ paddingLeft: '30px' }}>Salary Slip</th>
                    <th style={{ paddingLeft: '110px' }}>Edit</th>
                    <th style={{ paddingLeft: '110px' }}>Delete</th>
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
                        <button
                          className="staff-mgmt-attendance-button"
                          onClick={() => openAttendancePopup(staff.id)}
                        >
                          Mark 
                        </button>
                      </td>
                      <td>
                        <button
                          className="staff-mgmt-salary-button"
                          onClick={() => openSalarySlipPopup(staff.id)}
                        >
                          Slip
                        </button>
                      </td>
                      <td>
                        <div className="icon-container">
                          <IconButton onClick={() => handleEditStaff(staff)} aria-label="edit" className="staff-mgmt-edit-button">
                            <Edit />
                          </IconButton>
                        </div>
                      </td>
                      <td>
                        <div className="icon-container">
                          <IconButton
                            className="staff-mgmt-delete-button"
                            onClick={() => openDeleteConfirm(staff.id)}
                            color="error"
                            aria-label="delete"
                          >
                            <Delete />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {showAttendancePopup && (
            <AttendancePopup
              onClose={() => setShowAttendancePopup(false)}
              onAttendanceMarked={handleAttendanceMarked}
              staffId={selectedStaffId}
              initialDays={getDaysInMonth(currentMonth, currentYear)}
            />
          )}
          {showSalarySlipPopup && (
            <SalarySlipPopup
              onClose={() => setShowSalarySlipPopup(false)}
              staffId={selectedStaffId}
            />
          )}
          {showAddStaffModal && (
            <AddStaffModal
              onClose={() => setShowAddStaffModal(false)}
              onAddStaff={handleAddStaff}
            />
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
    <div className="confirmation-overlay">
        <div className="confirmation-popup">
            <p>Are you sure you want to delete this staff member?</p>
            <div className="button-group">
                <button onClick={handleDeleteStaff}>Yes</button>
                <button onClick={() => setDeleteConfirmation(false)}>No</button>
            </div>
        </div>
    </div>
)}
        </div>
      </div>
    </>
  );
};

export default AdminManagement;
