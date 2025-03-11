import React, { useState, useEffect, useRef } from "react";
import "../Styles/ExpenseModal.css";
import config from "../../config";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { FaTimes } from "react-icons/fa";


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
    const [isProductModalOpen, setProductModalOpen] = useState(false);
    const [product_value, setProductValue] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [productData, setProductData] = useState([]);
    const [apiCalled, setApiCalled] = useState(false);
    const [productCategory, setProductCategory] = useState([]);
    const [hasFetchedProducts, setHasFetchedProducts] = useState(false);
    const [selectedList, setSelectedList] = useState([]);
    const modalRef = useRef(null);
    const [amountPaid, setAmountPaid] = useState("");
    const [completedDate, setCompletedDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [errors, setErrors] = useState({ completedDate: "", dueDate: "" });
    const [totalAmount, setTotalAmount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");


    // Date validation regex (DD/MM/YYYY)
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  
    // Handle date input change with validation
    const handleDateChange = (e, field) => {
      const value = e.target.value;
      if (dateRegex.test(value) || value === "") {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      } else {
        setErrors((prev) => ({
          ...prev,
          [field]: "Invalid format (DD/MM/YYYY)",
        }));
      }
  
      if (field === "completedDate") setCompletedDate(value);
      if (field === "dueDate") setDueDate(value);
    };
  

    useEffect(() => {
        fetchStaffData();
    }, []);

    useEffect(() => {
        fetchInventoryData();
    }, []);

    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            setProductModalOpen(false);
        }
    };
    const handleProductSelect = (selectedList) => {
        setProductValue(selectedList);
        // Initialize productData with the selected products and reset quantities
        setProductData(
            selectedList.map((product) => ({
                id: product.key,
                quantity: "", // Initialize with empty quantity
                unit: product.unit,
                available: product.available || 0, // Assuming product has available stock
            }))
        );
    };
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
    const finalizeSelection = (selectedList) => {
        setProductValue(selectedList); 
    };
    
    const handleQuantityChange = (index, quantity) => {
        const updatedProducts = [...product_value];
        updatedProducts[index].quantity = quantity;
        updatedProducts[index].total = quantity * (updatedProducts[index].rate || 0);
        setProductValue(updatedProducts);
      };
      
      const handleRateChange = (index, rate) => {
        const updatedProducts = [...product_value];
        updatedProducts[index].rate = rate;
        updatedProducts[index].total = rate * (updatedProducts[index].quantity || 0);
        setProductValue(updatedProducts);
      };
      
    const fetchData = async () => {
        try {
            if (apiCalled) return; // Prevent duplicate API calls

            const branchName = localStorage.getItem("branch_name");
            const token = localStorage.getItem("token");

            if (!branchName || !token) {
                console.error("Branch name or token is missing.");
                return;
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
                throw new Error(
                    `Failed to fetch products: ${response.statusText}`
                );
            }

            const result = await response.json();

            console.log("API Response Data: ", result); // ✅ Debugging Step

            if (!result.status || !Array.isArray(result.data)) {
                throw new Error("Invalid API response format");
            }

            // Transform API response into a structured category-product map
            const categoryMap = new Map();

            result.data.forEach((product) => {
                const categoryName =
                    product.category_details?.product_category ||
                    "Uncategorized";

                if (!categoryMap.has(categoryName)) {
                    categoryMap.set(categoryName, {
                        key: categoryName,
                        value: categoryName,
                        products: [],
                    });
                }
                // console.log("check", categoryMap,product)
                categoryMap.get(categoryName).products.push({
                    id: product.id,
                    name: product.product_name || "Unnamed Product",
                    price: product.product_price || 0,
                    quantity: 1,
                    staff: [],
                    note: "No notes added",
                    category: categoryName,
                });
            });

            const categories = Array.from(categoryMap.values());

            console.log("Structured Categories: ", categories); 

            setProductCategory(categories);
            setHasFetchedProducts(true);
        } catch (error) {
            console.error("Error fetching products:", error.message);
        }
    };
    const filteredproduct = productCategory.filter(
        (category) =>
            category.value?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.product.some((product) =>
                product.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
    );
    const toggleProductSelection = (product) => {
        setSelectedList((prevSelected) => {
            const isAlreadySelected = prevSelected.some(
                (p) => p.id === product.id
            );

            if (isAlreadySelected) {
                return prevSelected.filter((p) => p.id !== product.id);
            } else {
                return [...prevSelected, product];
            }
        });
    };
    const handleProductInputChange = (index, value) => {
        const updatedProductData = [...productData];
        updatedProductData[index].quantity = value;
        setProductData(updatedProductData);
    };
    const formatDate = (dateString) => {
        let parts;
        
        // Check if the date contains "/" (MM/DD/YYYY or DD/MM/YYYY)
        if (dateString.includes("/")) {
            parts = dateString.split("/");
        } else if (dateString.includes("-")) {
            parts = dateString.split("-");
        } else {
            return "Invalid Date"; // Handle unexpected cases
        }
    
        // Ensure we have three parts
        if (parts.length !== 3) return "Invalid Date";
    
        let [day, month, year] = parts;
    
        // Handle MM/DD/YYYY or DD/MM/YYYY formats
        if (parseInt(day) > 12) {
            // If the day is greater than 12, assume it's in DD/MM/YYYY format
            return `${year}-${month}-${day}`;
        } else {
            // Otherwise, assume MM/DD/YYYY and swap month & day
            return `${year}-${day}-${month}`;
        }
    };
    
    // Example usage:
    const completedDateFormatted = formatDate(completedDate);
    const dueDateFormatted = formatDate(dueDate);
    
    const handleSubmit = async () => {
        const payload = {
            date: formData.date,
            category: formData.category,
            expense_type: formData.expenseType,
            expense_account: formData.expenseAccount,
            expense_amount: parseFloat(formData.expenseAmount) || 0, 
            expense_category: [formData.expenseCategory || null],
            invoice_id: formData.invoiceId || "",
            comment: formData.notes,
            inventory_item: product_value.map((product) => ({
                item: product.id || null,               
                name: product.name || "",               
                quantity: parseFloat(product.quantity) || 0,  
                price: parseFloat(product.rate) || 0,        
                total: (parseFloat(product.quantity) || 0) * (parseFloat(product.rate) || 0) 
            })),
            amount_paid:amountPaid,
            completed_date:completedDateFormatted,
            due_date:dueDateFormatted,           
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
                    // window.location.reload();
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

    useEffect(() => {
        const total = product_value.reduce((acc, product) => acc + ((product.quantity || 0) * (product.rate || 0)), 0);
        setTotalAmount(total);
      }, [product_value]); // Runs when product_value changes

      const handleAmountChange = (e) => {
        const value = parseFloat(e.target.value) || 0;
        setAmountPaid(value);
      
        if (value > totalAmount) {
          setErrorMessage("Amount paid cannot exceed total amount!");
        } else {
          setErrorMessage(""); // Clear error if valid
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
    console.log("Current Product Value:", product_value);


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
                <h3 className="font-semibold ">Inventory Details:</h3>
                <button
                                            type="button"
                                            className="px-6 py-2 border-2 border-blue-500 text-blue-500 font-semibold rounded-lg hover:bg-blue-500 hover:text-white transition duration-300"
                                            onClick={async () => {
                                                await fetchData(); // Wait for data to load
                                                setProductModalOpen(true); // Open modal AFTER data is fetched
                                            }}
                                            required
                                        >
                                            Add Products
                                        </button>
                                        <div className="my-4" id="product-table">
                                        {product_value.length > 0 ? (
  <table className="w-full border p-4 border-gray-200 mt-4">
    <thead>
      <tr className="bg-gray-100 p-4">
        <th className="border px-4 py-2">Category</th>
        <th className="border px-4 py-2">Product Name</th>
        <th className="border px-4 py-2">Quantity</th>
        <th className="border px-4 py-2">Amount</th>
        <th className="border px-4 py-2">Total</th>
      </tr>
    </thead>
    <tbody className="text-center">
      {product_value.map((product, index) => (
        <tr key={index}>
          <td className="border px-4 py-2 text-center">{product.category}</td>  
          <td className="border px-4 py-2 text-center">{product.name}</td>  
          <td>
            <input
              type="number"
              className="m-2 text-center border px-4 py-2"
              placeholder="Enter Quantity"
              value={product.quantity || ""}
              onChange={(e) => handleQuantityChange(index, e.target.value)}
            />
          </td>
          <td>
            <input
              type="number"
              className="gb_service-table-field m-2 border px-4 py-2 text-center"
              placeholder="Enter Rate"
              value={product.rate || ""}
              onChange={(e) => handleRateChange(index, e.target.value)}
            />
          </td>
          <td className="border px-4 py-2 text-center">
            {(product.quantity || 0) * (product.rate || 0)}
          </td>
        </tr>
      ))}

      {/* Total Row */}
      <tr>
        <td colSpan="4" className="border px-4 py-2 font-semibold text-left">Total:</td>
        <td className="border px-4 py-2 font-semibold text-center">
          {product_value.reduce((acc, product) => acc + ((product.quantity || 0) * (product.rate || 0)), 0)}
        </td>
      </tr>
    </tbody>
  </table>
) : (
  <span></span>
)}

</div>

                {isProductModalOpen && (
                                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                                            <div className="bg-white rounded-xl p-6 w-4/5 max-w-4xl overflow-y-auto max-h-[90vh]">
                                                {/* Close Button */}
                                                <div className="flex justify-between items-center mb-4">
                                                    <span></span>
                                                    <FaTimes
                                                        size={24}
                                                        className="text-red-500 cursor-pointer hover:text-red-700"
                                                        aria-label="Close Modal"
                                                        onClick={() =>
                                                            setProductModalOpen(
                                                                false
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                                                    <h3 className="text-2xl font-bold">
                                                        Select Products
                                                    </h3>
                                                    <input
                                                        type="text"
                                                        placeholder="Search products or categories..."
                                                        className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/3"
                                                        value={searchQuery}
                                                        onChange={(e) =>
                                                            setSearchQuery(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                                {console.log(
                                                    "Filtered Categories:",
                                                    filteredproduct
                                                )}

                                                {filteredproduct.length ===
                                                0 ? (
                                                    <p className="text-center text-gray-500">
                                                        No products available
                                                    </p>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {filteredproduct.map(
                                                            (category) => (
                                                                <div
                                                                    key={
                                                                        category.key
                                                                    }
                                                                    className="bg-gray-100 p-4 rounded-lg border"
                                                                >
                                                                    <h4 className="text-lg font-semibold mb-4">
                                                                        {
                                                                            category.value
                                                                        }
                                                                    </h4>
                                                                    <ul className="space-y-2">
                                                                        {category.products.map(
                                                                            (
                                                                                product
                                                                            ) => (
                                                                                <li
                                                                                    key={
                                                                                        product.id
                                                                                    }
                                                                                    className="flex items-center justify-between"
                                                                                >
                                                                                    <label className="flex flex-row items-center gap-3 cursor-pointer">
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={selectedList.some(
                                                                                                (
                                                                                                    p
                                                                                                ) =>
                                                                                                    p.id ===
                                                                                                    product.id
                                                                                            )}
                                                                                            onChange={() =>
                                                                                                toggleProductSelection(
                                                                                                    product
                                                                                                )
                                                                                            }
                                                                                            className="h-4 w-4"
                                                                                        />
                                                                                        <p className="font-medium">
                                                                                            {
                                                                                                product.name
                                                                                            }
                                                                                        </p>
                                                                                    </label>
                                                                                    <p className="text-base font-semibold text-gray-700">
                                                                                        ₹
                                                                                        {
                                                                                            product.price
                                                                                        }
                                                                                    </p>
                                                                                </li>
                                                                            )
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )}

                                                {/* Footer */}
                                                <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-t mt-4">
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-lg font-semibold">
                                                            Selected:{" "}
                                                            {selectedList
                                                                .map(
                                                                    (p) =>
                                                                        p.name
                                                                )
                                                                .join(", ") ||
                                                                "None"}
                                                        </p>
                                                        <button
                                                            type="button"
                                                            className="bg-blue-500 text-white px-6 py-2 rounded-lg"
                                                            onClick={() => {
                                                                finalizeSelection(
                                                                    selectedList
                                                                );
                                                                setProductModalOpen(
                                                                    false
                                                                );
                                                            }}
                                                        >
                                                            Add Product
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
<h3 className=" font-semibold mb-2">Payment Details:</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Amount Paid */}
<div>
  <input
    type="number"
    placeholder="Amount Paid"
    value={amountPaid}
    onChange={handleAmountChange}
    className="w-full font-semibold text-gray-500 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
</div>



        {/* Completed Date */}
        <div>
          <input
            type="text"
            placeholder="Completed Date (DD/MM/YYYY)"
            value={completedDate}
            onChange={(e) => handleDateChange(e, "completedDate")}
            className={`w-full font-semibold text-gray-500 p-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.completedDate ? "border-red-500" : "border-blue-500"
            }`}
          />
          {errors.completedDate && (
            <p className="text-red-500 text-sm mt-1">{errors.completedDate}</p>
          )}
        </div>

        {/* Due Date */}
        <div>
          <input
            type="text"
            placeholder="Due Date (DD/MM/YYYY)"
            value={dueDate}
            onChange={(e) => handleDateChange(e, "dueDate")}
            className={`w-full font-semibold p-2 text-gray-500 border rounded-md focus:outline-none focus:ring-2 ${
              errors.dueDate ? "border-red-500" : "border-blue-500"
            }`}
          />
          {errors.dueDate && (
            <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
          )}
        </div>
      </div>
                {/* Notes Section */}
                <div className="forms-sections mt-4">
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
{/* <div className="forms-sections">
<h3>Inventory Details:</h3> */}

{/* {formData.inventory.map((item, index) => {
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
})} */}

{/* Button to Add More Inventory Items */}
{/* <div id="buttons-add">
    <button id="add-inventory-btn" onClick={handleAddInventory}>
        + Inventory Item
    </button>
</div>
</div> */}