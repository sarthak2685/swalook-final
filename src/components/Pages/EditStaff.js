import React, { useEffect, useState } from "react";
import config from "../../config";
import axios from "axios";

const EditStaff = ({ isOpen, onClose, staffData, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        mobile: "",
        salary: "",
        base: "",
        houseRentAllowance: "",
        incentivePay: "",
        mealAllowance: "",
        providentFund: "",
        professionalTax: "",
        staffSlab: "",
    });

    useEffect(() => {
        console.log("EditStaff", staffData);
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
        const token = localStorage.getItem("token");
        const bid = localStorage.getItem("branch_id");

        const payload = {
            staff_name: formData.name,
            staff_role: formData.role,
            mobile_no: formData.mobile || "",
            staff_salary_monthly: formData.salary ? Number(formData.salary) : 0,
            base: formData.base ? Number(formData.base) : 0,
            house_rent_allownance: formData.houseRentAllowance
                ? Number(formData.houseRentAllowance)
                : 0,
            incentive_pay: formData.incentivePay
                ? Number(formData.incentivePay)
                : 0,
            meal_allowance: formData.mealAllowance
                ? parseFloat(formData.mealAllowance)
                : 0,
            staff_provident_fund: formData.providentFund
                ? parseFloat(formData.providentFund)
                : 0,
            staff_professional_tax: formData.professionalTax
                ? parseFloat(formData.professionalTax)
                : 0,
            staff_slab: formData.staffSlab || 0,
            staff_joining_date: staffData.joiningDate,
        };

        try {
            const response = await axios.put(
                `${config.apiUrl}/api/swalook/staff/?id=${staffData.id}&branch_name=${bid}`,
                payload,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log(response);
            onSave(response.data);
            onClose();
            window.location.reload();
        } catch (error) {
            console.error("Error updating staff:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000] animate-fadeIn">
            <div className="bg-white p-5 w-[90%] max-w-[500px] rounded-xl shadow-xl flex flex-col max-h-[80vh] overflow-hidden">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
                    Edit Staff Details
                </h2>

                <div className="overflow-y-auto pr-2 mb-5 max-h-[calc(80vh-120px)]">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Staff Name:
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Role:
                        </label>
                        <input
                            type="text"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Mobile Number:
                        </label>
                        <input
                            type="text"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Salary:
                        </label>
                        <input
                            type="number"
                            name="salary"
                            value={formData.salary}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Base:
                        </label>
                        <input
                            type="number"
                            name="base"
                            value={formData.base}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            House Rent Allowance:
                        </label>
                        <input
                            type="number"
                            name="houseRentAllowance"
                            value={formData.houseRentAllowance}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Incentive Pay:
                        </label>
                        <input
                            type="number"
                            name="incentivePay"
                            value={formData.incentivePay}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Meal Allowance:
                        </label>
                        <input
                            type="number"
                            name="mealAllowance"
                            value={formData.mealAllowance}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Provident Fund:
                        </label>
                        <input
                            type="number"
                            name="providentFund"
                            value={formData.providentFund}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Professional Tax:
                        </label>
                        <input
                            type="number"
                            name="professionalTax"
                            value={formData.professionalTax}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Commission:
                        </label>
                        <input
                            type="number"
                            name="staffSlab"
                            value={formData.staffSlab}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-auto sticky bottom-0 bg-white pt-3">
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-semibold transition-colors flex items-center justify-center"
                    >
                        Save
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-md font-semibold transition-colors flex items-center justify-center"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditStaff;
