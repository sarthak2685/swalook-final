import React, { useState, useEffect, useMemo } from "react";
import Header from "../Header";
import VertNav from "../VertNav";
import config from "../../../config";
import "react-calendar/dist/Calendar.css";
import Scheduler from "./Scheduler";
import Status from "./Status";
import SalesByStaff from "./SalesByStaff";
import ModeOfPayment from "./ModeOfPayment";
import TotalSales from "./TotalSales";
import TargetProgressCard from "./Target";
import StaffTargets from "./TargetByStaff";

const AdminDashboard = () => {
    return (
        <>
            <div className="bg-gray-100">
                <Header />
                <VertNav />
                <div className="bg-gray-100 flex-grow  md:ml-72 p-10">
                    <Status />
                    <Scheduler />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Total Sales Bar Chart */}

                        <TotalSales />
                        {/* Mode of Payment Donut Chart */}

                        <ModeOfPayment />
                    </div>

                    {/* Row 3: Sales by Staff, Top 5 Customers, Top 5 Services */}
                    <div className="grid grid-cols-1  lg:grid-cols-2 gap-6 mt-6">
                        <TargetProgressCard />
                        <StaffTargets />
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
