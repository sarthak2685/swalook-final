import React, { useState, useEffect } from "react";
import "../Styles/ExpenseModal.css";
import config from "../../config";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const ExpenseModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
        date: "",
        expenseType: "",
        expenseAccount: "",
        expenseAmount: "",
        expenseCategory: "",
        invoiceId: "",
        notes: "",
        inventory: [{ item: "", quantity: "", price: "" }]
    });
    const bid = localStorage.getItem('branch_id');
    const [staffData, setStaffData] = useState([]);
    const [inventoryData, setInventoryData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [category, setCategory] = useState();


    useEffect(() => {
        fetchStaffData();
    }, []);

    useEffect(() => {
        fetchInventoryData();
    }, []);

    const handleChange = (e, index = null, field = null) => {
        const { name, value } = e.target;
    
        if (field === "inventory") {
            setFormData((prevFormData) => {
                const updatedInventory = prevFormData.inventory ? [...prevFormData.inventory] : [];
    
                if (!updatedInventory[index]) {
                    updatedInventory[index] = { item: "", quantity: "", price: "", itemId: null };
                }
    
                const selectedIndex = e.target.selectedIndex;
    
                if (selectedIndex >= 0 && e.target.options.length > 0) {
                    const selectedOption = e.target.options[selectedIndex];
                    const selectedId = selectedOption?.getAttribute("data-id") || null;
    
                    updatedInventory[index] = {
                        ...updatedInventory[index],
                        [name]: value,
                        itemId: selectedId,
                    };
                } else {
                    updatedInventory[index] = {
                        ...updatedInventory[index],
                        [name]: value,
                    };
                }
    
                return { ...prevFormData, inventory: updatedInventory };
            });
        } else {
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: value,
            }));
        }
    };
    
    
    
    
    const handleSubmit = async () => {
        const payload = {
            date: formData.date,
            category: formData.category,
            expense_type: formData.expenseType,
            expense_account: formData.expenseAccount,
            expense_amount: parseFloat(formData.expenseAmount) || 0, // Ensure it is parsed as a number
            expense_category: [formData.expenseCategory || null],
            invoice_id: formData.invoiceId || "",
            comment: formData.notes,
            inventory_item: formData.inventory.map((inv) => ({
                item: inv.itemId || null ,
                quantity: parseFloat(inv.quantity),
                price: parseFloat(inv.price),
            }))
        };

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${config.apiUrl}/api/swalook/expense_management/?branch_name=${bid}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success("Expense added successfully");

                setTimeout(() => {
                    window.location.reload();
                    onClose();
                }, 2000); // Delay in milliseconds (2 seconds)
            }
            else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            alert("An error occurred. Please try again.");
        }
    };

    const fetchStaffData = async () => {
        const token = localStorage.getItem("token");
        try {
            const staffResponse = await fetch(
                `${config.apiUrl}/api/swalook/staff/?branch_name=${bid}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!staffResponse.ok) {
                throw new Error("Network response was not ok");
            }

            const staffData = await staffResponse.json();
            const staffArray = Array.isArray(staffData.table_data)
                ? staffData.table_data
                : [];

            // Map staff data to a usable format
            const formattedOptions = staffArray.map((staff) => ({
                label: `${staff.staff_name} (${staff.staff_role})`,
                value: staff.staff_name,
            }));

            setStaffData(formattedOptions);
        } catch (error) {
            console.error("Error fetching staff data:", error);
            setStaffData([]);
        }
    };

    const fetchInventoryData = async () => {
        try {
            const branchName = localStorage.getItem("branch_name");
            const token = localStorage.getItem("token");

            if (!branchName || !token) {
                throw new Error("Branch name or token is missing.");
            }

            const response = await fetch(
                `${config.apiUrl}/api/swalook/inventory/product/?branch_name=${bid}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch inventory data.");
            }

            const data = await response.json();
            setInventoryData(
                data.data.map((product) => ({
                    key: product.id,
                    value: product.product_name,
                    unit: product.unit,
                    quantity: product.stocks_in_hand,
                    category: product.category_details ? product.category_details.id : null, 

                }))
            );
        } catch (error) {
            console.error("Error fetching inventory data:", error);
        }
    };

    const fetchExpenseCategory = async () => {
        try {
            const branchName = localStorage.getItem("branch_name");
            const token = localStorage.getItem("token");

            if (!branchName || !token) {
                throw new Error("Branch name or token is missing.");
            }

            const response = await fetch(`${config.apiUrl}/api/swalook/expense_category/?branch_name=${branchName}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("data", data);
            const transformedData = data.data.map(item => ({
                id: item.id,
                categories: JSON.parse(item.vendor_expense_type.replace(/'/g, '"')), // Safely parse the JSON-like string
            }));

            setCategoryData(transformedData);
        } catch (err) {
            console.error("Error fetching expense category data:", err);
        }
    };
    useEffect(() => {
        fetchExpenseCategory();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");

        axios
            .get(
                `${config.apiUrl}/api/swalook/product_category/?branch_name=${bid}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            )
            .then((response) => {
                console.log("cat", response.data.data)
                if (response.data.status) {
                    setCategories(response.data.data); // Populate categories from API response
                } else {
                    setPopupMessage("Failed to fetch categories.");
                    setShowPopup(true);
                }
            })
            .catch((err) => {
                console.error("Error fetching categories:", err);
                setPopupMessage("Failed to fetch categories.");
                setShowPopup(true);
            });
    }, [bid]);
    const handleCategoryChange = (e, index) => {
        const newCategory = e.target.value;
        const updatedInventory = [...formData.inventory];

        updatedInventory[index].category = newCategory;
        updatedInventory[index].item = ""; // Reset selected item when category changes

        setFormData({ ...formData, inventory: updatedInventory });
    };


    const handleAddInventory = () => {
        setFormData({
            ...formData,
            inventory: [...formData.inventory, { category: "", item: "", quantity: "", price: "" }],
        });
    };


    return (
        <div className="modal-overlay">
            <Toaster />

            <div className="modal-content">
                <div className="modal-header">
                    <h2 id="modal-title">New Expense</h2>
                    <buttons id="close-btn" onClick={onClose}>
                        &times;
                    </buttons>
                </div>

                {/* Expense Details Section */}
                <div className="forms-sections">
                    <h3>Expense Details:</h3>
                    <div className="forms-rows">
                        <input id="expense-field"
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            placeholder="Date (DD/MM/YYYY)*"
                            required />
                        <select id="expense-field" name="expenseType"
                            value={formData.expenseType}
                            onChange={handleChange}
                            required>
                            <option value="">Expense Type*</option>
                            <option value="Invoice">Purchase Invoice </option>
                            <option value="Miscellaneous Expenses">Miscellaneous Expenses</option>
                        </select>
                        <select id="expense-field" name="expenseAccount"
                            value={formData.expenseAccount}
                            onChange={handleChange}>
                            <option value="">Expense Account*</option>
                            <option value="Company Expense">Company Expense</option>
                            {/* Dynamic options populated from API */}
                            {staffData.map((staff, index) => (
                                <option key={index} value={staff.value}>
                                    {staff.label}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            id="expense-field"
                            name="expenseAmount" // Ensure this matches the formData key
                            placeholder="Expense Amount*"
                            value={formData.expenseAmount}
                            onChange={handleChange}

                            required
                            style={{ color: "#9C9D9E" }}
                        />
                        <select
                            id="expense-field"
                            name="expenseCategory"
                            value={formData.expenseCategory}
                            onChange={handleChange}
                            disabled={formData.expenseType === "Invoice"}
                            required
                        >
                            <option value="">Expense Category*</option>
                            {categoryData.flatMap(category =>
                                category.categories.map((type, index) => (
                                    <option key={`${category.id}-${index}`} value={category.id}>
                                        {type}
                                    </option>
                                ))
                            )}
                        </select>

                        <input type="text" id="expense-field" name="invoiceId"
                            value={formData.invoiceId}
                            onChange={handleChange}
                            placeholder="Invoice ID (if any)" style={{ color: '#9C9D9E' }} />
                    </div>
                </div>

                {/* Inventory Details Section */}
                <div className="forms-sections">
                    <h3>Inventory Details:</h3>

                    {formData.inventory.map((item, index) => {
                        console.log("Selected Category for index", index, ":", item.category);
                        return (
                            <div key={index} className="forms-rows">
                                <select
                                    id={`category-${index}`}
                                    name="category"
                                    value={item.category || ""}
                                    onChange={(e) => handleCategoryChange(e, index)} // Function to update category in formData
                                    required
                                    className="w-52 px-4 py-2 border font-extrabold rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 b border-[#ccc] bg-[#F9F9F9] text-[#C5C5C6]"
                                >
                                    <option value="" disabled>
                                        Select a Category
                                    </option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.product_category}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    id={`inventory-field-${index}`}
                                    name="item"
                                    value={item.item || ""}
                                    onChange={(e) => handleChange(e, index, "inventory")}
                                    disabled={formData.expenseType !== "Invoice"}
                                    required
                                    className="w-52 px-4 py-2 border font-extrabold rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 border-[#ccc] bg-[#F9F9F9] text-[#C5C5C6]"
                                >
                                    <option value="">Inventory Item*</option>
                                    {console.log("Full Inventory Data:", inventoryData)}
  {console.log("Filtering by Category:", item.category)}
  {inventoryData
  .filter((inv) => inv.category === item.category) // Compare with 'category' instead of 'key'
  .map((inv) => (
    <option key={inv.key} value={inv.value} data-id={inv.key}>
      {inv.value} (Stock: {inv.quantity})
    </option>
  ))}




                                </select>

                                <input
                                    type="number"
                                    id={`inventory-quantity-${index}`}
                                    name="quantity"
                                    value={item.quantity || ""}
                                    onChange={(e) => handleChange(e, index, "inventory")}
                                    placeholder="Inventory Quantity*"
                                    disabled={formData.expenseType !== "Invoice"}
                                    required
                                    className="w-52 px-4 py-2 border font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 b border-[#ccc] bg-[#F9F9F9]"                                />
                                <input
                                    type="number"
                                    id={`inventory-price-${index}`}
                                    name="price"
                                    value={item.price || ""}
                                    onChange={(e) => handleChange(e, index, "inventory")}
                                    disabled={formData.expenseType !== "Invoice"}
                                    placeholder="Purchase Price*"
                                    required
                                    className="w-52 px-4 py-2 border font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 b border-[#ccc] bg-[#F9F9F9]"                                />
                            </div>
                        );
                    })}

                    {/* Button to Add More Inventory Items */}
                    <div id="buttons-add">
                        <button id="add-inventory-btn" onClick={handleAddInventory}>
                            + Inventory Item
                        </button>
                    </div>
                </div>


                {/* Notes Section */}
                <div className="forms-sections">
                    <h3>Notes:</h3>
                    <textarea placeholder="Additional Notes" name="notes"
                        value={formData.notes}
                        onChange={handleChange}></textarea>
                </div>

                <div id="buttons-add">
                    <button id="create-expense-btn" onClick={handleSubmit}>Create Expense</button>
                </div>
            </div>
        </div>
    );
};

export default ExpenseModal;
