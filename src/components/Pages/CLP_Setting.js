import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import config from "../../config";
import Header from "./Header";
import VertNav from "./VertNav";
import { MdEdit } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CLP_Setting() {
    const [fetchedRows, setFetchedRows] = useState([]);
    const [couponRows, setCouponRows] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const bid = localStorage.getItem("branch_id");
    const [selectedCoupon, setSelectedCoupon] = useState(null); // To store the coupon being edited

    const [isModalOpen, setModalOpen] = useState(false);
    const [couponToEdit, setCouponToEdit] = useState(null); // Define the couponToEdit state
    const [showEditCouponModal, setShowEditCouponModal] = useState(false); // For controlling modal visibility

    const [formData, setFormData] = useState({
        membershipName: "",
        charges: "",
        expiry: "",
        benefit: "",
        isActive: false,
    });

    const [couponFormData, setCouponFormData] = useState({
        couponName: "",
        charges: "",
        balance: "",
        isActive: false,
    });

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSave = () => {
        console.log("Form Data:", formData);
        setModalOpen(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            const apiEndpoint = `${config.apiUrl}/api/swalook/loyality_program/view/?branch_name=${bid}`;
            try {
                const response = await axios.get(apiEndpoint, {
                    headers: {
                        Authorization: `Token ${localStorage.getItem("token")}`,
                    },
                });
                if (response.data.status && Array.isArray(response.data.data)) {
                    setFetchedRows(response.data.data);
                    console.log("API Response:", response.data);
                } else {
                    setFetchedRows([]); // Ensure fetchedRows is always an array
                }
                
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [bid]);

    const [showCouponModal, setShowCouponModal] = useState(false);

    const handleOpenCouponModal = () => {
        setShowCouponModal(true);
    };

    const handleCloseCouponModal = () => {
        setShowCouponModal(false);
    };

    useEffect(() => {
        const fetchCouponData = async () => {
            const apiEndpoint = `${config.apiUrl}/api/swalook/coupon/?branch_name=${bid}`;
            try {
                const response = await axios.get(apiEndpoint, {
                    headers: {
                        Authorization: `Token ${localStorage.getItem("token")}`,
                    },
                });
                if (response.data.status && Array.isArray(response.data.data)) {
                    setCouponRows(response.data.data);
                } else {
                    setCouponRows([]); // Ensure it's always an array
                }
                
            } catch (error) {
                console.error("Error fetching coupon data:", error);
            }
        };

        fetchCouponData();
    }, [bid]);

    const handleSaveMembership = async () => {
        const apiEndpoint = `${config.apiUrl}/api/swalook/loyality_program/?branch_name=${bid}`;

        // Initialize the base payload

        // Add conditional fields based on the benefit type
        let payload = {
            json_data: [],
        };

        if (formData.benefit === "Points Balance") {
            payload.json_data = [
                {
                    type: formData.membershipName,
                    charges: formData.charges,
                    expiry: formData.expiry,
                    points: formData.pointsBalance || 0,
                    active: formData.isActive,
                },
            ];
        } else if (formData.benefit === "Discount") {
            payload.json_data = [
                {
                    type: formData.membershipName,
                    charges: formData.charges,
                    expiry: formData.expiry,
                    discount: formData.discountPercentage || 0,
                    limit: formData.limit || 0,
                    active: formData.isActive,
                },
            ];
        }

        try {
            const response = await axios.post(apiEndpoint, payload, {
                headers: {
                    Authorization: `Token ${localStorage.getItem("token")}`,
                },
            });

            if (response.data.status) {
                // Update the state with the new data and reset form
                setFetchedRows((prev) => [...prev, response.data.data]);
                setModalOpen(false);
                setFormData({
                    membershipName: "",
                    charges: "",
                    expiry: "",
                    benefit: "",
                    isActive: false,
                    pointsBalance: "",
                    discountPercentage: "",
                    limit: "",
                });
                toast.success("Membership added Successfully")
            }

        } catch (error) {
            console.error("Error saving membership:", error);
        }
    };

    const handleEditModalOpen = (row) => {
        console.log("row", row);
        setSelectedRow({
            id: row.id || "",
            program_type: row.program_type || "", // Ensure it matches the input field name
            price: row.price || "",
            expiry_duration: row.expiry_duration || "",
            benefit: row.benefit || "",
            points_hold: row.points_hold || "",
            discount: row.discount || "",
            limit: row.limit || "",
            active: row.active ?? false, // Ensure checkbox gets a boolean
        });
        setIsEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setSelectedRow(null);
        setIsEditModalOpen(false);
    };
    const handleEditChange = (name, value) => {
        setSelectedRow((prev) => {
            if (!prev) return prev; // Prevent errors if prev is null

            const updatedRow = {
                ...prev,
                [name]: value, // Update the specific field
            };

            // Reset fields if `benefit` is changed
            if (name === "benefit") {
                if (value === "Points Balance") {
                    updatedRow.discount = null;
                    updatedRow.limit = null;
                } else if (value === "Discount") {
                    updatedRow.points_hold = null;
                }
            }

            return updatedRow;
        });
    };

    const handleSaveEdit = async () => {
        try {
            const apiEndpoint = `${config.apiUrl}/api/swalook/loyality_program/?id=${selectedRow.id}`;

            // Create the correct payload structure
            let payload = {
                json_data: [
                    {
                        type: selectedRow.program_type, // Ensure naming consistency
                        charges: selectedRow.price,
                        expiry: selectedRow.expiry_duration,
                        active: selectedRow.active,
                    },
                ],
            };

            // Add conditional fields based on the benefit type
            if (selectedRow.benefit === "") {
                payload.json_data[0].points = selectedRow.points_hold || 0;
                payload.json_data[0].discount = selectedRow.discount || 0;
                payload.json_data[0].limit = selectedRow.limit || 0;
            } else if (selectedRow.benefit === "Points Balance") {
                payload.json_data[0].points = selectedRow.points_hold || 0;
            } else if (selectedRow.benefit === "Discount") {
                payload.json_data[0].discount = selectedRow.discount || 0;
                payload.json_data[0].limit = selectedRow.limit || 0;
            }

            // Send API request with updated structure
            const response = await fetch(apiEndpoint, {
                method: "PUT", // or "PATCH" if updating only some fields
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to update membership details");
            }
            toast.success("Membership updated Successfully")
            setIsEditModalOpen(false); // Close modal after successful update
        } catch (error) {
            console.error("Error updating membership details:", error);
        }
    };

    const handleSaveCoupon = async (event) => {
        event.preventDefault();
        const apiEndpoint = `${config.apiUrl}/api/swalook/coupon/?branch_name=${bid}`;
        const payload = {
            coupon_name: couponFormData.couponName,
            coupon_price: couponFormData.charges,
            coupon_points_hold: couponFormData.balance,
            active: couponFormData.isActive,
        };

        try {
            const response = await axios.post(apiEndpoint, payload, {
                headers: {
                    Authorization: `Token ${localStorage.getItem("token")}`,
                },
            });
            if (response.data.status) {
                setCouponRows((prev) => [...prev, response.data.data]);
                setShowCouponModal(false);
                setCouponFormData({
                    couponName: "",
                    charges: "",
                    balance: "",
                    isActive: false,
                });
            }
            toast.success("Coupon added Successfully")

        } catch (error) {
            toast.error("failed to add coupon")
            console.error("Error saving coupon:", error);
        }
    };

    const handleEditCouponModalOpen = (coupon) => {
        setCouponToEdit(coupon); // Set the coupon to edit
        setShowEditCouponModal(true); // Open the modal
    };
    const handleCloseEditCouponModal = () => {
        setShowEditCouponModal(false); // Close the modal
        setCouponToEdit(null); // Clear the coupon being edited
    };

    const handleSaveEditedCoupon = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(
                `${config.apiUrl}/api/swalook/coupon/?id=${couponToEdit.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        coupon_name: couponToEdit.coupon_name,
                        coupon_price: couponToEdit.coupon_price,
                        coupon_points_hold: couponToEdit.coupon_points_hold,
                        active: couponToEdit.active,
                    }),
                }
            );

            const result = await response.json();
            if (response.ok) {
                toast.success("Coupon updated Successfully")
                handleCloseEditCouponModal(); // Close the edit modal
            } else {
                toast.error("failed to update coupon")
                console.error("Error updating coupon:", result.message);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <>
        <ToastContainer />
            <div className="bg-gray-100">
                <Header />
                <VertNav />

                <div className="flex min-h-[150vh]">
                    <div className="flex-1  p-6 md:ml-72 ml-0">
                        <Helmet>
                            <title>CLP Settings</title>
                        </Helmet>

                        <div className="mx-auto bg-white rounded-lg shadow-md p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2 sm:mb-0">
                                    Memberships
                                </h1>
                                <button
                                    onClick={handleOpenModal}
                                    className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                >
                                    + New Membership
                                </button>
                            </div>
                            {isModalOpen && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                    <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl font-bold">
                                                Membership
                                            </h2>
                                            <button
                                                onClick={handleCloseModal}
                                                className="text-5xl hover:text-black text-red-700"
                                            >
                                                &times;
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                name="membershipName"
                                                value={formData.membershipName}
                                                onChange={handleInputChange}
                                                placeholder="Membership Name"
                                                className="w-full border rounded-lg px-3 py-2"
                                            />
                                            <input
                                                type="number"
                                                name="charges"
                                                value={formData.charges}
                                                onChange={handleInputChange}
                                                placeholder="Charges"
                                                className="w-full border rounded-lg px-3 py-2"
                                            />
                                            <input
                                                type="number"
                                                name="expiry"
                                                value={formData.expiry}
                                                onChange={handleInputChange}
                                                placeholder="Expiry (in Months)"
                                                className="w-full border rounded-lg px-3 py-2"
                                            />
                                            <select
                                                name="benefit"
                                                value={formData.benefit}
                                                onChange={handleInputChange}
                                                className="w-full border rounded-lg px-3 py-2"
                                            >
                                                <option value="">
                                                    Select Benefit
                                                </option>
                                                <option value="Points Balance">
                                                    Points Balance per Rs. 100
                                                </option>
                                                <option value="Discount">
                                                    Discount & Limit
                                                </option>
                                            </select>
                                            {formData.benefit ===
                                                "Points Balance" && (
                                                <input
                                                    type="number"
                                                    name="pointsBalance"
                                                    value={
                                                        formData.pointsBalance ||
                                                        ""
                                                    }
                                                    onChange={handleInputChange}
                                                    placeholder="Points per Rs. 100 spent"
                                                    className="w-full border rounded-lg px-3 py-2"
                                                />
                                            )}
                                            {formData.benefit ===
                                                "Discount" && (
                                                <>
                                                    <input
                                                        type="number"
                                                        name="discountPercentage"
                                                        value={
                                                            formData.discountPercentage ||
                                                            ""
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        placeholder="Discount %"
                                                        className="w-full border rounded-lg px-3 py-2"
                                                    />
                                                    <input
                                                        type="number"
                                                        name="limit"
                                                        value={
                                                            formData.limit || ""
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        placeholder="Limit"
                                                        className="w-full border rounded-lg px-3 py-2"
                                                    />
                                                </>
                                            )}
                                            <label className="flex flex-row text-xl space-x-2">
                                                <input
                                                    type="checkbox"
                                                    name="isActive"
                                                    checked={formData.isActive}
                                                    onChange={handleInputChange}
                                                    className="form-checkbox text-blue-600"
                                                />
                                                <span>Active</span>
                                            </label>
                                        </div>

                                        <button
                                            onClick={handleSaveMembership}
                                            className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border rounded-lg">
                                    <thead>
                                        <tr className="bg-gray-200 text-left text-gray-600">
                                            <th className="py-3 px-4 font-semibold text-xs sm:text-xl">
                                                Membership Name
                                            </th>
                                            <th className="py-3 px-4 font-semibold text-xs sm:text-xl">
                                                Expiry (in Months)
                                            </th>
                                            <th className="py-3 px-4 font-semibold text-xs sm:text-xl">
                                                Charges
                                            </th>
                                            {/* <th className="py-3 px-4 font-semibold text-xs sm:text-xl">
                      GST %
                    </th> */}
                                            <th className="py-3 px-4 font-semibold text-xs sm:text-xl">
                                                Benefits
                                            </th>
                                            <th className="py-3 px-4 font-semibold text-xs sm:text-xl">
                                                Active
                                            </th>
                                            <th className="py-3 px-4 font-semibold text-xs sm:text-xl">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {Array.isArray(fetchedRows) && fetchedRows.length > 0 ? (
  fetchedRows.filter(row => row).map((row, index) => (
    <tr key={row.id} className="border-b">
      <td className="py-3 px-4 text-xs sm:text-xl font-semibold text-gray-700">
        {row?.program_type || "N/A"}
      </td>
      <td className="py-3 px-4 text-xs sm:text-xl text-gray-700">
        {row?.expiry_duration || "N/A"}
      </td>
      <td className="py-3 px-4 text-xs sm:text-xl text-gray-700">
        Rs. {row?.price || "0"}
      </td>
      <td className="py-3 px-4 text-xs sm:text-xl text-gray-700">
        {row?.points_hold ? `${row.points_hold} P` : `${row?.discount || 0}%`}
      </td>
      <td className="py-3 px-4 text-xs sm:text-xl">
        <span
          className={`inline-block w-20 px-3 py-1 border rounded-lg text-xs font-medium text-white text-center ${
            row?.active ? "bg-green-500 border-green-500" : "bg-red-500 border-red-500"
          }`}
        >
          {row?.active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="py-3 px-4 text-xs sm:text-xl">
        <button
          onClick={() => handleEditModalOpen(row)}
          className="text-blue-500 hover:text-blue-700"
        >
          <MdEdit className="w-5 h-5" />
        </button>
      </td>
    </tr>
  ))
) : (
  <tr>
    <td colSpan="6" className="text-center py-4 text-gray-500">
      No data available
    </td>
  </tr>
)}

                                    </tbody>
                                </table>
                            </div>
                            {isEditModalOpen && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                    <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl font-bold">
                                                Edit Membership
                                            </h2>
                                            <button
                                                onClick={handleEditModalClose}
                                                className="text-5xl hover:text-black text-red-700"
                                            >
                                                &times;
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                name="program_type"
                                                value={
                                                    selectedRow?.program_type ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    handleEditChange(
                                                        "program_type",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Membership Name"
                                                className="w-full border rounded-lg px-3 py-2"
                                            />
                                            <input
                                                type="number"
                                                name="price"
                                                value={selectedRow?.price || ""}
                                                onChange={(e) =>
                                                    handleEditChange(
                                                        "price",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Charges"
                                                className="w-full border rounded-lg px-3 py-2"
                                            />
                                            <input
                                                type="number"
                                                name="expiry_duration"
                                                value={
                                                    selectedRow?.expiry_duration ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    handleEditChange(
                                                        "expiry_duration",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Expiry (in Months)"
                                                className="w-full border rounded-lg px-3 py-2"
                                            />
                                            <select
                                                name="benefit"
                                                value={
                                                    selectedRow?.benefit || ""
                                                }
                                                onChange={(e) =>
                                                    handleEditChange(
                                                        "benefit",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full border rounded-lg px-3 py-2"
                                                required
                                            >
                                                <option value="">
                                                    Select Benefit
                                                </option>
                                                <option value="Points Balance">
                                                    Points Balance per Rs. 100
                                                </option>
                                                <option value="Discount">
                                                    Discount & Limit
                                                </option>
                                            </select>
                                            {selectedRow?.benefit ===
                                                "Points Balance" && (
                                                <input
                                                    type="number"
                                                    name="points_hold"
                                                    value={
                                                        selectedRow?.points_hold ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        handleEditChange(
                                                            "points_hold",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Points per Rs. 100 spent"
                                                    className="w-full border rounded-lg px-3 py-2"
                                                />
                                            )}
                                            {selectedRow?.benefit ===
                                                "Discount" && (
                                                <>
                                                    <input
                                                        type="number"
                                                        name="discount"
                                                        value={
                                                            selectedRow?.discount ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleEditChange(
                                                                "discount",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Discount %"
                                                        className="w-full border rounded-lg px-3 py-2"
                                                    />
                                                    <input
                                                        type="number"
                                                        name="limit"
                                                        value={
                                                            selectedRow?.limit ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleEditChange(
                                                                "limit",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Limit"
                                                        className="w-full border rounded-lg px-3 py-2"
                                                    />
                                                </>
                                            )}
                                            <label className="flex flex-row text-xl space-x-2">
                                                <input
                                                    type="checkbox"
                                                    name="active"
                                                    checked={
                                                        selectedRow?.active ||
                                                        false
                                                    }
                                                    onChange={(e) =>
                                                        handleEditChange(
                                                            "active",
                                                            e.target.checked
                                                        )
                                                    }
                                                    className="form-checkbox text-blue-600"
                                                />
                                                <span>Active</span>
                                            </label>
                                        </div>

                                        <button
                                            onClick={handleSaveEdit}
                                            className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mx-auto bg-white rounded-lg shadow-md p-6 mt-8">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2 sm:mb-0">
                                    Coupons
                                </h1>
                                <button
                                    onClick={handleOpenCouponModal}
                                    className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                >
                                    + New Coupons
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border rounded-lg">
                                    <thead>
                                        <tr className="bg-gray-200 text-left text-gray-600">
                                            <th className="py-3 px-4 font-semibold text-xs sm:text-xl">
                                                Coupon Name
                                            </th>
                                            {/* <th className="py-3 px-4 font-semibold text-xs sm:text-xl">Expiry (in Months)</th> */}
                                            <th className="py-3 px-4 font-semibold text-xs sm:text-xl">
                                                Charges
                                            </th>
                                            <th className="py-3 px-4 font-semibold text-xs sm:text-xl">
                                                Balance
                                            </th>
                                            {/* <th className="py-3 px-4 font-semibold text-xs sm:text-xl">GST %</th> */}
                                            <th className="py-3 px-4 font-semibold text-xs sm:text-xl">
                                                Active
                                            </th>
                                            <th className="py-3 px-4 font-semibold text-xs sm:text-xl">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {Array.isArray(couponRows) && couponRows.length > 0 ? (
  couponRows.filter(coupon => coupon).map((coupon, index) => (
    <tr key={coupon?.id || index} className="border-b">
      <td className="py-3 px-4 text-xs sm:text-xl font-semibold text-gray-700">
        {coupon?.coupon_name || "N/A"}
      </td>
      <td className="py-3 px-4 text-xs sm:text-xl text-gray-700">
        Rs. {coupon?.coupon_price || "0"}
      </td>
      <td className="py-3 px-4 text-xs sm:text-xl text-gray-700">
        Rs. {coupon?.coupon_points_hold || "0"}
      </td>
      <td className="py-3 px-4 text-xs sm:text-xl">
        <span
          className={`inline-block w-20 px-3 py-1 border rounded-lg text-xs font-medium text-white text-center ${
            coupon?.active ? "bg-green-500 border-green-500" : "bg-red-500 border-red-500"
          }`}
        >
          {coupon?.active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="py-3 px-4 text-xs sm:text-xl">
        <button
          onClick={() => handleEditCouponModalOpen(coupon)}
          className="text-blue-500 hover:text-blue-700"
        >
          <MdEdit className="w-5 h-5" />
        </button>
      </td>
    </tr>
  ))
) : (
  <tr>
    <td colSpan="5" className="text-center py-4 text-gray-500">
      No data available
    </td>
  </tr>
)}

                                    </tbody>
                                </table>
                                {showCouponModal && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                        <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
                                            <button
                                                className="absolute top-4 right-4 text-5xl hover:text-black text-red-700"
                                                onClick={handleCloseCouponModal}
                                            >
                                                &times;
                                            </button>
                                            <h3 className="text-xl font-semibold mb-4 text-left">
                                                Coupon
                                            </h3>
                                            <form onSubmit={handleSaveCoupon}>
                                                <div className="mb-4">
                                                    <input
                                                        type="text"
                                                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-blue-500"
                                                        placeholder="Enter coupon name"
                                                        value={
                                                            couponFormData.couponName
                                                        }
                                                        onChange={(e) =>
                                                            setCouponFormData({
                                                                ...couponFormData,
                                                                couponName:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <input
                                                        type="text"
                                                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-blue-500"
                                                        placeholder="Enter charges"
                                                        value={
                                                            couponFormData.charges
                                                        }
                                                        onChange={(e) =>
                                                            setCouponFormData({
                                                                ...couponFormData,
                                                                charges:
                                                                    e.target.value.replace(
                                                                        /[^0-9]/g,
                                                                        ""
                                                                    ),
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <input
                                                        type="text"
                                                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-blue-500"
                                                        placeholder="Enter balance"
                                                        value={
                                                            couponFormData.balance
                                                        }
                                                        onChange={(e) =>
                                                            setCouponFormData({
                                                                ...couponFormData,
                                                                balance:
                                                                    e.target.value.replace(
                                                                        /[^0-9]/g,
                                                                        ""
                                                                    ),
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="mb-6 flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="h-5 w-5 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
                                                        id="activeCheckbox"
                                                        checked={
                                                            couponFormData.isActive
                                                        }
                                                        onChange={(e) =>
                                                            setCouponFormData({
                                                                ...couponFormData,
                                                                isActive:
                                                                    e.target
                                                                        .checked,
                                                            })
                                                        }
                                                    />
                                                    <label
                                                        htmlFor="activeCheckbox"
                                                        className="ml-2 text-gray-700 font-medium text-xl"
                                                    >
                                                        Active
                                                    </label>
                                                </div>
                                                <button
                                                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
                                                    type="submit"
                                                >
                                                    Save
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}
                                {showEditCouponModal && couponToEdit && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                        <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
                                            <button
                                                className="absolute top-4 right-4 text-5xl hover:text-black text-red-700"
                                                onClick={
                                                    handleCloseEditCouponModal
                                                }
                                            >
                                                &times;
                                            </button>
                                            <h3 className="text-xl font-semibold mb-4 text-left">
                                                Edit Coupon
                                            </h3>
                                            <form
                                                onSubmit={
                                                    handleSaveEditedCoupon
                                                }
                                            >
                                                <div className="mb-4">
                                                    <input
                                                        type="text"
                                                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-blue-500"
                                                        placeholder="Enter coupon name"
                                                        value={
                                                            couponToEdit.coupon_name
                                                        }
                                                        onChange={(e) =>
                                                            setCouponToEdit({
                                                                ...couponToEdit,
                                                                coupon_name:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <input
                                                        type="text"
                                                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-blue-500"
                                                        placeholder="Enter charges"
                                                        value={
                                                            couponToEdit.coupon_price
                                                        }
                                                        onChange={(e) =>
                                                            setCouponToEdit({
                                                                ...couponToEdit,
                                                                coupon_price:
                                                                    e.target.value.replace(
                                                                        /[^0-9]/g,
                                                                        ""
                                                                    ),
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <input
                                                        type="text"
                                                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-blue-500"
                                                        placeholder="Enter balance"
                                                        value={
                                                            couponToEdit.coupon_points_hold
                                                        }
                                                        onChange={(e) =>
                                                            setCouponToEdit({
                                                                ...couponToEdit,
                                                                coupon_points_hold:
                                                                    e.target.value.replace(
                                                                        /[^0-9]/g,
                                                                        ""
                                                                    ),
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="mb-6 flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="h-5 w-5 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
                                                        id="editActiveCheckbox"
                                                        checked={
                                                            couponToEdit.active
                                                        }
                                                        onChange={(e) =>
                                                            setCouponToEdit({
                                                                ...couponToEdit,
                                                                active: e.target
                                                                    .checked,
                                                            })
                                                        }
                                                    />
                                                    <label
                                                        htmlFor="editActiveCheckbox"
                                                        className="ml-2 text-gray-700 font-medium text-xl"
                                                    >
                                                        Active
                                                    </label>
                                                </div>
                                                <button
                                                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
                                                    type="submit"
                                                >
                                                    Save Changes
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CLP_Setting;
