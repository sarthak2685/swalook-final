import React, { useState } from "react";
import Header from "./Header.js";
import VertNav from "./VertNav.js";
import "../Styles/ExpenseCategorySettings.css";
import ES from "../../assets/ES.png";
import config from "../../config.js";

const ExpenseSetting = () => {
    const predefinedCategories = [
        "Purchase Invoice",
        "Licenses & Permissions",
        "Marketing",
        "Utilities",
        "Insurance",
        "Miscellaneous Expenses",
        "Payroll",
        "Rent",
        "Wages",
        "Leasing",
        "New Equipment",
        "Salon Space",
        "Training",
        "Website",
        "Software",
        "Card Processing Fees",
    ];

    const [categories, setCategories] = useState([
        { id: 1, value: "", isCustom: false },
    ]);
    const bid = localStorage.getItem("branch_id");

    const handleAddCategory = () => {
        setCategories([
            ...categories,
            { id: categories.length + 1, value: "", isCustom: false },
        ]);
    };

    const handleCategoryChange = (id, value) => {
        setCategories(
            categories.map((category) =>
                category.id === id
                    ? {
                          ...category,
                          value,
                          isCustom: !predefinedCategories.includes(value),
                      }
                    : category
            )
        );
    };

    const handleSaveCategories = async () => {
        const payload = {
            vendor_expense_type: categories
                .filter((category) => category.value.trim() !== "")
                .map((category) => category.value),
        };

        try {
            const token = localStorage.getItem("token");
            console.log(token);
            const response = await fetch(
                `${config.apiUrl}/api/swalook/expense_category/?branch_name=${bid}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (response.ok) {
                alert("Categories saved successfully!");
            } else {
                alert("Failed to save categories.");
            }
        } catch (error) {
            console.error("Error saving categories:", error);
        }
    };

    return (
        <div className="bg-gray-500">
            <Header />
            <VertNav />

            <div className="dashboard-container ">
                <div className="dashboard-layout">
                    <div className="dashboard-content">
                        <header className="page-header">
                            <h1 className="font-bold text-2xl ml-4 md:ml-80">
                                Expense Category Settings
                            </h1>
                        </header>
                        <div className="content-section">
                            <div className="left-image">
                                <img
                                    src={ES}
                                    alt="Expense Category Illustration"
                                />
                                <p>Expense Category Settings</p>
                            </div>
                            <div className="right-content">
                                <h2>Expense Category Settings</h2>
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="category-item"
                                    >
                                        <input
                                            type="text"
                                            list={`category-options-${category.id}`}
                                            placeholder="Select or Add Category"
                                            value={category.value}
                                            onChange={(e) =>
                                                handleCategoryChange(
                                                    category.id,
                                                    e.target.value
                                                )
                                            }
                                            className="category-input"
                                        />
                                        <datalist
                                            id={`category-options-${category.id}`}
                                        >
                                            {predefinedCategories.map(
                                                (predefinedCategory, idx) => (
                                                    <option
                                                        key={idx}
                                                        value={
                                                            predefinedCategory
                                                        }
                                                    >
                                                        {predefinedCategory}
                                                    </option>
                                                )
                                            )}
                                        </datalist>
                                    </div>
                                ))}
                                <div id="categories">
                                    <div className="new-category">
                                        <button onClick={handleAddCategory}>
                                            + New Category
                                        </button>
                                    </div>
                                    <div className="new-category">
                                        <button onClick={handleSaveCategories}>
                                            Save Categories
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseSetting;
