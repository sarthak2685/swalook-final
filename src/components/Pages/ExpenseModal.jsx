import React, { useState } from "react";
import "../Styles/ExpenseModal.css";
import config from "../../config";

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

    const handleChange = (e, index = null, field = null) => {
        const { name, value } = e.target;
        if (field === "inventory") {
            const updatedInventory = [...formData.inventory];
            updatedInventory[index][name] = value;
            setFormData({ ...formData, inventory: updatedInventory });
        } else {
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
            expenseType: formData.expenseType,
            expenseAccount: formData.expenseAccount,
            expenseAmount: formData.expenseAmount,
            expenseCategory: formData.expenseCategory,
            invoiceId: formData.invoiceId || null,
            notes: formData.notes,
            inventory: formData.inventory.map((inv) => ({
                item: inv.item,
                quantity: parseFloat(inv.quantity),
                price: parseFloat(inv.price)
            }))
        };

        try {
            const response = await fetch(`${config.apiUrl}api/swalook/vendor-expense`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Expense created successfully!");
                onClose();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div className="modal-overlay">s
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
                        <input type="date" id="expense-field" placeholder="Date (DD/MM/YYYY)*" required />
                        <select id="expense-field" required>
                            <option value="">Expense Type*</option>
                            <option value="Utility">Utility</option>
                        </select>
                        <select id="expense-field" required>
                            <option value="">Expense Account*</option>
                            <option value="Account1">Account1</option>
                        </select>
                        <input type="number" id="expense-field" placeholder="Expense Amount*" required  style={{ color: '#9C9D9E' }} />
                        <select id="expense-field" required>
                            <option value="">Expense Category*</option>
                            <option value="Account1">Account1</option>
                        </select>
                        <input type="text" id="expense-field" placeholder="Invoice ID (if any)"  style={{color: '#9C9D9E' }} />
                    </div>
                </div>

                {/* Inventory Details Section */}
                <div className="forms-sections">
                    <h3>Inventory Details:</h3>
                    {formData.inventory.map((item, index) => (
                        <div key={item.id} className="forms-rows">
                            <select id="inventory-field" required>
                                <option value="">Inventory Item*</option>
                            </select>
                            <input type="number" id="inventory-field" placeholder="Inventory Quantity*" required />
                            <input type="number" id="inventory-field" placeholder="Purchase Price*" required />
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
                    <textarea placeholder="Additional Notes"></textarea>
                </div>

                <div id="buttons-add">
                    <button id="create-expense-btn" onClick={handleSubmit}>Create Expense</button>
                </div>
            </div>
        </div>
    );
};

export default ExpenseModal;