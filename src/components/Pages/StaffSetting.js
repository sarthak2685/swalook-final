import React, { useState, useEffect } from "react";
import '../Styles/StaffSetting.css'; 
import { Helmet } from "react-helmet";
import Header from "./Header";
import VertNav from "./VertNav"; 
import config from "../../config";

const StaffSetting = () => {
  const [commissionSlabs, setCommissionSlabs] = useState([
    { id: 1, staff_slab: "0.00", staff_target_business: 0, staff_commision_cap: 0 },
    { id: 2, staff_slab: "0.00", staff_target_business: 0, staff_commision_cap: 0 },
    { id: 3, staff_slab: "0.00", staff_target_business: 0, staff_commision_cap: 0 }
  ]);

  const token = localStorage.getItem('token');
  const bid = localStorage.getItem('branch_id');

  const [monthDays, setMonthDays] = useState({
    "Jan ": 28,
    "Feb ": 28,
    "Mar ": 28,
    "Apr ": 28,
    "May ": 28,
    "Jun ": 28,
    "Jul ": 28,
    "Aug ": 28,
    "Sep ": 28,
    "Oct ": 28,
    "Nov ": 28,
    "Dec ": 28,
  });

  const handleCommissionChange = (index, field, newValue) => {
    const updatedSlabs = [...commissionSlabs];
    updatedSlabs[index][field] = parseFloat(newValue) || 0;
    setCommissionSlabs(updatedSlabs);
  };

  const handleMonthDaysChange = (month, newValue) => {
    setMonthDays((prev) => ({
      ...prev,
      [month]: parseInt(newValue) || 0,
    }));
  };

  const handleSaveSettings = async () => {
    const slabData = commissionSlabs.map(slab => ({
      staff_slab: slab.staff_slab,
      staff_commision_cap: slab.staff_commision_cap,
      staff_target_business: slab.staff_target_business,
    }));

    const jsonData = {
      "1": monthDays["Jan "],
      "2": monthDays["Feb "],
      "3": monthDays["Mar "],
      "4": monthDays["Apr "],
      "5": monthDays["May "],
      "6": monthDays["Jun "],
      "7": monthDays["Jul "],
      "8": monthDays["Aug "],
      "9": monthDays["Sep "],
      "10": monthDays["Oct "],
      "11": monthDays["Nov "],
      "12": monthDays["Dec "],
    };

    try {
      const response = await fetch(`${config.apiUrl}/api/swalook/staff/setting/?branch_name=${bid}`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slab_data: slabData,
          json_data: jsonData,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Settings updated successfully", result);

        if (result.status) {
          const updatedSlabs = result.data.slab_data.map((slab, index) => ({
            id: index + 1,
            staff_slab: slab.staff_slab,
            staff_commision_cap: slab.staff_commision_cap,
            staff_target_business: slab.staff_target_business,
          }));
          setCommissionSlabs(updatedSlabs);
          localStorage.setItem('commissionSlabs', JSON.stringify(updatedSlabs));

          const updatedMonthDays = {
            "Jan ": result.data.json_data["1"],
            "Feb ": result.data.json_data["2"],
            "Mar ": result.data.json_data["3"],
            "Apr ": result.data.json_data["4"],
            "May ": result.data.json_data["5"],
            "Jun ": result.data.json_data["6"],
            "Jul ": result.data.json_data["7"],
            "Aug ": result.data.json_data["8"],
            "Sep ": result.data.json_data["9"],
            "Oct ": result.data.json_data["10"],
            "Nov ": result.data.json_data["11"],
            "Dec ": result.data.json_data["12"],
          };
          setMonthDays(updatedMonthDays);
          localStorage.setItem('monthDays', JSON.stringify(updatedMonthDays));
        }
      } else {
        const errorData = await response.json();
        console.error("Failed to update settings:", errorData.error);
      }
    } catch (error) {
      console.error("Error while saving settings:", error);
    }
  };

  useEffect(() => {
    const savedSlabs = localStorage.getItem('commissionSlabs');
    const savedMonthDays = localStorage.getItem('monthDays');

    if (savedSlabs) {
      setCommissionSlabs(JSON.parse(savedSlabs));
    }

    if (savedMonthDays) {
      setMonthDays(JSON.parse(savedMonthDays));
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Staff Settings</title>
      </Helmet>
      <Header />
      <VertNav />
      <div className="staff-setting-container">
        <h2 className="heading-settings">Staff Settings</h2>
        <div className="table-section">
          <h3>Number of Days in Each Month</h3>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Days</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(monthDays).map((month) => (
                <tr key={month}>
                  <td>{month}</td>
                  <td>
                    <input
                      type="number"
                      className="input-field"
                      value={monthDays[month]}
                      onChange={(e) => handleMonthDaysChange(month, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-section">
          <h3>Commission Slabs</h3>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Slab</th>
                <th>Target Business</th>
                <th>Commission Cap</th>
              </tr>
            </thead>
            <tbody>
              {commissionSlabs.map((slab, index) => (
                <tr key={slab.id}>
                  <td>
                    <input
                      type="text"
                      className="input-field"
                      value={slab.staff_slab}
                      onChange={(e) => handleCommissionChange(index, "staff_slab", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="input-field"
                      value={slab.staff_target_business === null || slab.staff_target_business === 0 ? '' : slab.staff_target_business}
                      onChange={(e) => handleCommissionChange(index, "staff_target_business", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="input-field"
                      value={slab.staff_commision_cap === null || slab.staff_commision_cap === 0 ? '' : slab.staff_commision_cap}
                      onChange={(e) => handleCommissionChange(index, "staff_commision_cap", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="button-container">
          <button onClick={handleSaveSettings} className="save-button">
            Save Settings
          </button>
        </div>
      </div>
    </>
  );
};

export default StaffSetting;
