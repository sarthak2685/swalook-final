import React, { useState } from "react";
import '../Styles/AttendancePopup.css';
import config from "../../config";
import toast from "react-hot-toast";

const AttendancePopup = ({ onClose, onAttendanceMarked, staffId, staffData }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleMarkAttendance = () => {
    // Only show confirmation if attendance hasn't been marked today
    const staff = staffData.find(staff => staff.id === staffId);
    if (staff && staff.attendanceMarkedToday) {
      toast.custom(<div className='toaster_icon'>Attendance already marked for today!</div>);
      return; // Prevent further action
    }
    
    setShowConfirmation(true);
  };
  

  const handleConfirm = async () => {
    setLoading(true); 
    const token = localStorage.getItem('token');
    const bid = localStorage.getItem('branch_id');
    
    const today = new Date().toISOString().split('T')[0];
    const dateObject = new Date(today);
  
    const attendancedata = [{
      of_month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      attend: true,
      leave: false,
      date: dateObject,
    }];
    
    try {
      const response = await fetch(`${config.apiUrl}/api/swalook/staff/attendance/?branch_name=${bid}&staff_id=${staffId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          json_data: attendancedata,
        })
      });
      
      const result = await response.json();
      console.log(result); // Check the result from the server
      
      // Check if attendance already exists
      if (response.ok && result.message === 'staff attendance already exists') {
        toast.error("Attendance already marked for today."); // Show error toast if attendance already exists
      } else if (response.ok && result.message !== 'staff attendance already exists') {
        toast.success("Attendance marked successfully!"); // Show success toast for new attendance
        onAttendanceMarked(staffId); // Perform any additional actions
        onClose(); // Close the popup
      } else {
        // If the response is not OK, handle the error based on the server response
        const errorMessage = result?.errors?.date || 'Failed to mark attendance';
        throw new Error(errorMessage); // Throw error with appropriate message
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      
      // Show different toast messages based on the error message
      if (error.message.includes('already marked')) {
        toast.error("Attendance already marked for today.");
      } else {
        toast.error(`Error marking attendance: ${error.message}`);
      }
    } finally {
      setLoading(false); 
    }
  };
  
  
  

  const handleCancel = () => {
    setShowConfirmation(false);
    onClose()
  };

  return (
    <div className="popup-overlay1">
      <div className="popup-container1">
        <h2 className="popup-title1">Mark Attendance</h2>
        <div className="confirmation-message">
          <p>Are you sure you want to mark attendance for today?</p>
          <div className="button-group1">
            <button className="confirm-button" onClick={handleConfirm} disabled={loading}>
              {loading ? 'Marking...' : 'Yes'}
            </button>
            <button className="cancel-button" onClick={handleCancel} disabled={loading}>
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePopup;