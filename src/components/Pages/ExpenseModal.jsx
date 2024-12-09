import React, { useState, useEffect } from "react";
import "../Styles/ExpenseModal.css";
import config from "../../config";
import toast, { Toaster } from "react-hot-toast";

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

    useEffect(() => {
        fetchStaffData();
    }, []);

    useEffect(() => {
        fetchInventoryData();
    }, []);

    const handleChange = (e, index = null, field = null) => {
        const { name, value } = e.target;

        if (field === "inventory") {
            const updatedInventory = [...formData.inventory];
            updatedInventory[index][name] = value;
            console.log("Inventory Updated:", updatedInventory);
            setFormData({ ...formData, inventory: updatedInventory });
        } else {
            console.log(`Field ${name} Updated:`, value);
            setFormData({ ...formData, [name]: value });
        }
    };


    const handleAddInventory = () => {
        const newInventory = { item: "", quantity: "", price: "" };
        setFormData({ ...formData, inventory: [...formData.inventory, newInventory] });
    };

    const handleSubmit = async () => {
        const payload = {
            date: formData.date,
            expense_type: formData.expenseType,
            expense_account: formData.expenseAccount,
            expense_amount: parseFloat(formData.expenseAmount) || 0, // Ensure it is parsed as a number
            expense_category: [formData.expenseCategory || null],
            invoice_id: formData.invoiceId || "",
            comment: formData.notes,
            inventory_item: formData.inventory.map((inv) => ({
                item: inv.item,
                quantity: parseFloat(inv.quantity),
                price: parseFloat(inv.price)
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
                    {formData.inventory.map((item, index) => (
                        <div key={index} className="forms-rows">
                            <select
                                id="inventory-field"
                                name="item" // Matches the key in `formData.inventory`
                                value={item.item} // This must match a value in `inventoryData`
                                onChange={(e) => handleChange(e, index, "inventory")}
                                disabled={formData.expenseType !== "Invoice"}
                                required
                            >
                                <option value="">Inventory Item*</option>
                                {inventoryData.map((inv) => (
                                    <option key={inv.key} value={inv.value}>
                                        {inv.value} (Stock: {inv.quantity})
                                    </option>
                                ))}
                            </select>


                            <input type="number" id="inventory-field" name="quantity"
                                value={item.quantity}
                                onChange={(e) => handleChange(e, index, "inventory")}
                                placeholder="Inventory Quantity*" disabled={formData.expenseType !== "Invoice"}
                                required />
                            <input type="number" id="inventory-field" name="price"
                                value={item.price}
                                onChange={(e) => handleChange(e, index, "inventory")}
                                disabled={formData.expenseType !== "Invoice"}
                                placeholder="Purchase Price*" required />
                        </div>
                    ))}
                    <div id="buttons-add">
                        <buttons id="add-inventory-btn" onClick={handleAddInventory}>
                            + Inventory Item
                        </buttons>
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
