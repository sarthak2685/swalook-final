import React, { useState } from "react";
import "../Styles/Settings.css";
import { Link } from "react-router-dom";
import Header from "./Header";
import PI from "../../assets/PI.png";
import HD from "../../assets/HD.png";
import SY from "../../assets/SY.png"; // Make sure to import the team image if it's not already
import CLP from "../../assets/CLP.png";
import ES from "../../assets/ES.png";
import axios from "axios";
import config from "../../config";
import VertNav from "./VertNav";
import Inventory from "../../assets/inventory.jpg";
import Target from "../../assets/target.jpg";

function Settings() {
    const [newRows, setNewRows] = useState([]);

    const branchName = localStorage.getItem("branch_name");
    const sname = localStorage.getItem("s-name");
    const bid = localStorage.getItem("branch_id");

    const handleSave = async () => {
        const branchName = localStorage.getItem("branch_name");
        const apiEndpoint = `${config.apiUrl}/api/swalook/loyality_program/?branch_name=${bid}`;
        const newRows = [
            {
                type: "None",
                points: "0",
                expiry: "0",
                charges: "0",
            },
        ];

        try {
            if (newRows.length > 0) {
                const response = await axios.post(
                    apiEndpoint,
                    {
                        json_data: newRows,
                        branch_name: atob(branchName),
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Token ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                );

                console.log("Success:", response.data);
                console.log("Error:", newRows);
                setNewRows([]);
            } else {
                console.log("No new rows to save.");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            // Any cleanup if necessary
        }
    };

    return (
        <>
            <Header />
            <VertNav />
            <div className="settings_container">
                <div className="content_container">
                    <Link
                        to={`/${sname}/${branchName}/settings/personalInformation`}
                        className="settings_box"
                    >
                        <img src={PI} alt="Personal Information" />
                        <h2>Personal Information</h2>
                        <p>Manage your account details</p>
                    </Link>
                    <Link
                        to={`/${sname}/${branchName}/settings/clpsetting`}
                        onClick={handleSave}
                        className="settings_box"
                    >
                        <img src={CLP} alt="Customer Loyalty" />
                        <h2>Customer Loyalty</h2>
                        <p>Edit your customer loyalty settings here</p>
                    </Link>
                    <Link
                        to={`/${sname}/${branchName}/help`}
                        className="settings_box"
                    >
                        <img src={HD} alt="Help Desk" />
                        <h2>Help Desk</h2>
                        <p>Resolve your Query</p>
                    </Link>
                    <Link
                        to={`/${sname}/${branchName}/staffSettings`}
                        className="settings_box"
                    >
                        <img src={SY} alt="Staff Working Days" />{" "}
                        {/* Make sure the path is correct for the team image */}
                        <h2>Staff Working Days</h2>
                        <p>Edit Commission</p>
                    </Link>
                    <Link
                        to={`/${sname}/${branchName}/expenseSetting`}
                        className="settings_box"
                    >
                        <img src={ES} alt="expense Setting" />{" "}
                        {/* Make sure the path is correct for the team image */}
                        <h2>Expense category Setting</h2>
                        <p>Edit Expense Category</p>
                    </Link>
                    <Link
                        to={`/${sname}/${branchName}/invetorysetting`}
                        className="settings_box"
                    >
                        <img src={Inventory} alt="inventory Setting" />{" "}
                        {/* Make sure the path is correct for the team image */}
                        <h2>Inventory Setting</h2>
                        <p>Edit Your Inventory</p>
                    </Link>
                    <Link
                        to={`/${sname}/${branchName}/targetsetting`}
                        className="settings_box"
                    >
                        <img src={Target} alt="target Setting" />{" "}
                        {/* Make sure the path is correct for the team image */}
                        <h2>Company Target</h2>
                        <p>Edit Your Target</p>
                    </Link>
                </div>
            </div>
        </>
    );
}

export default Settings;
