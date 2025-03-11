import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/GenerateInvoice.css";
import { Multiselect } from "multiselect-react-dropdown";
import Header from "./Header";
import VertNav from "./VertNav";
import { FaTimes } from "react-icons/fa";
import Select from "react-select";

import { Helmet } from "react-helmet";
import config from "../../config";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import CustomDialog from "./CustomDialog";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";


function getCurrentDate() {
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
}

function GenerateInvoice() {
    const navigate = useNavigate();
    const [serviceOptions, setServiceOptions] = useState([]);
    const [categoryServices, setCategoryServices] = useState([]);
    const [productCategory, setProductCategory] = useState([]);
    const [customer_name, setCustomer_Name] = useState("");
    const [email, setEmail] = useState("");
    const [mobile_no, setMobileNo] = useState("");
    const [address, setAddress] = useState("");
    const [GBselectedServices, GBsetSelectedServices] = useState([]);
    const [value, selectedValues] = useState([]);
    const [service_by, setServiceBy] = useState([]);
    const [service, setService] = useState([]);

    const [staff, setStaff] = useState([]);

    const [discount, setDiscount] = useState(0);

    const [isGST, setIsGST] = useState(false);
    const [gst_number, setGSTNumber] = useState("");
    const [comments, setComments] = useState("");
    const [servicesTableData, setServicesTableData] = useState([]);
    const [inputFieldValue, setInputFieldValue] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasFetchedServices, setHasFetchedServices] = useState(false);
    const [hasFetchedServicesCategory, setHasFetchedServicesCategory] =
        useState(false);
    const [hasFetchedProducts, setHasFetchedProducts] = useState(false);
    const [selectedList, setSelectedList] = useState([]); // Initialize selectedList as an empty array
    const [selectedCategoryValues, setSelectedCategoryValues] = useState([]); // Initialize selectedList as an empty array
    const [selectedCategoryList, setSelectedCategoryList] = useState([]); // Initialize selectedList as an empty array
    const [selectedServiceValues, setSelectedServiceValues] = useState([]);
    const [productList, setProductList] = useState([]);

    const [isServiceModalOpen, setServiceModalOpen] = useState(false);
    const [isProductModalOpen, setProductModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(""); // Tracks selected service category
    const [searchQuery, setSearchQuery] = useState("");

    const [selectedServices, setSelectedServices] = useState([]);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [deleteInvoiceId, setDeleteInvoiceId] = useState(null);
    const [anniversaryDate, setAnniversaryDate] = useState(null);

    const [userExists, setUserExists] = useState(null);
    const [membershipOptions, setMembershipOptions] = useState(false);
    const [selectMembership, setSelectMembership] = useState("");
    const [couponOptions, setCouponOptions] = useState([]);
    const [selectedCoupons, setSelectedCoupons] = useState([]);
    const [selectCoupon, setSelectCoupon] = useState("");
    const [userId, setUserId] = useState(null);
    const modalRef = useRef(null);
    // Close modal on outside click
    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            setServiceModalOpen(false);
            setProductModalOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleProduct_Select = () => {
        // Action after selecting products
        setProductModalOpen(false);
    };

    const [dialogOpen, setDialogOpen] = useState(false); // State for dialog visibility
    const [dialogTitle, setDialogTitle] = useState(""); // State for dialog title
    const [dialogMessage, setDialogMessage] = useState(""); // State for dialog message

    const branchName = localStorage.getItem("branch_name");
    const sname = localStorage.getItem("s-name");
    console.log(sname);
    const [InvoiceId, setInvoiceId] = useState("");
    const [inventoryData, setInventoryData] = useState([]);
    const [pq, setPQ] = useState("");
    const [product_value, setProductValue] = useState([]);
    const [productData, setProductData] = useState([]);

    const [customerName, setCustomerName] = useState("");
    const [customerNumber, setCustomerNumber] = useState("");
    //  const [email, setEmail] = useState('');
    const [loyaltyProgram, setLoyaltyProgram] = useState("");
    const [points, setPoints] = useState(0);
    const [expiryDays, setExpiryDays] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [staffData, setStaffData] = useState([]);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [customerData, setCustomerData] = useState(null);
    const [apiCalled, setApiCalled] = useState(false);
    const [staffApiCalled, setStaffApiCalled] = useState(false);
    const [dateOfBirth, setDateOfBirth] = useState(null);
    const [filter, setFilter] = useState("all"); // "all", "men", "women"
    const [genderFilter, setGenderFilter] = useState([]); // Default is no filter
    const [paymentModes, setPaymentModes] = useState({});

    const bid = localStorage.getItem("branch_id");
    const token = localStorage.getItem("token");

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

            console.log("Structured Categories: ", categories); // ✅ Debugging Step

            setProductCategory(categories);
            setHasFetchedProducts(true);
        } catch (error) {
            console.error("Error fetching products:", error.message);
        }
    };

    const fetchStaffData = async () => {
        try {
            if (staffApiCalled) return; // Prevent redundant API calls

            const token = localStorage.getItem("token");
            if (!token) {
                console.error("Token is missing.");
                return;
            }

            const response = await fetch(
                `${config.apiUrl}/api/swalook/staff/?branch_name=${bid}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                console.error(
                    `API Error: ${response.status} - ${response.statusText}`
                );
                return;
            }

            const data = await response.json();
            console.log("hero", data);
            const staffArray = Array.isArray(data.table_data)
                ? data.table_data
                : [];
            console.log("h", staffArray);

            // Format staff data
            const formattedOptions = staffArray.map((staff) => ({
                label: `${staff.staff_name})`,
            }));
            console.log("ok", formattedOptions);

            setStaffData(formattedOptions);
            setStaffApiCalled(true); // Mark API as called
        } catch (error) {
            console.error("Error fetching staff data:", error);
            setStaffData([]); // Reset staff data on error
        }
    };

    const fetchServiceCategoryData = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${config.apiUrl}/api/swalook/table/services/?branch_name=${bid}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch categories: ${response.statusText}`
                );
            }

            const result = await response.json();

            if (!result.status || !Array.isArray(result.data)) {
                throw new Error("Invalid API response format");
            }

            // Transform API response into a structured category-service map
            const categoryMap = new Map();

            result.data.forEach((service) => {
                // Safely check if service category exists, otherwise default to "Uncategorized"
                const categoryName =
                    service.category_details?.service_category ||
                    "Uncategorized";

                // If the category doesn't exist yet, create an entry for it
                if (!categoryMap.has(categoryName)) {
                    categoryMap.set(categoryName, {
                        key: categoryName,
                        value: categoryName,
                        services: [],
                    });
                }

                // Push the service into the appropriate category
                categoryMap.get(categoryName).services.push({
                    id: service.id,
                    name: service.service || "Unnamed Service",
                    price: service.service_price || 0,
                    duration: service.service_duration || 0,
                    for_men: service.for_men,
                    for_women: service.for_women,
                    quantity: 1,
                    staff: [],
                    note: "No notes added",
                    category: categoryName, // Ensure the category is added to the service
                });

                // Log category name and service details for debugging
                console.log("Service Category Name:", categoryName);
                console.log("Service Details:", service);
            });

            // Convert the categoryMap to an array
            const categories = Array.from(categoryMap.values());

            // Log the structured categories before setting the state
            console.log("Structured Categories: ", categories);

            setCategoryServices(categories);
            setHasFetchedServicesCategory(true);
        } catch (error) {
            console.error("Error fetching categories:", error.message);
        }
    };

    const handleServiceToggle = (isChecked, service) => {
        setSelectedServices((prev) =>
            isChecked
                ? [...prev, service]
                : prev.filter((s) => s.id !== service.id)
        );
    };

    const finalizeSelection = () => {
        console.log("Selected Services:", selectedServices);
    };

    // // Fetch service categories from API
    // const fetchServiceCategoryData = async () => {
    //   try {
    //     const token = localStorage.getItem("token");
    //     const response = await fetch(`${config.apiUrl}/api/swalook/test-error/`, {
    //       headers: {
    //         Authorization: `Token ${token}`,
    //         "Content-Type": "application/json",
    //       },
    //     });

    //     if (!response.ok) {
    //       throw new Error("Network response was not ok");
    //     }

    //     const data = await response.json();
    //     console.log("Fetched categories and services:", data.data);

    //     const categories = data.data.map((category) => ({
    //       key: category.category || "Uncategorized",
    //       value: category.category || "Uncategorized",
    //       services: category.services || [],
    //     }));

    //     setCategoryServices(categories);
    //     setHasFetchedServicesCategory(true);
    //   } catch (error) {
    //     console.error("Error fetching category data:", error);
    //   }
    // };

    // Handle category click (Fetch if not already fetched)
    const handleServiceCategoryClick = () => {
        if (!hasFetchedServicesCategory) fetchServiceCategoryData();
    };

    // Handle category selection
    const handleCategorySelect = (selectedCategories) => {
        setSelectedCategoryValues(selectedCategories);

        const updatedCategoryList = selectedCategories.map((category) => ({
            ...category,
            services: category.services || [],
            isActive: true,
            note: "No note added",
        }));

        console.log("Selected categories:", updatedCategoryList);
    };

    // Handle gender filter toggle
    const handleGenderFilterToggle = (gender, isChecked) => {
        setGenderFilter((prevFilter) => {
            if (isChecked) {
                return [...prevFilter, gender];
            } else {
                return prevFilter.filter((g) => g !== gender);
            }
        });
    };

    // // Fetch services from the API
    // const fetchServiceData = async () => {
    //   try {
    //     const token = localStorage.getItem("token");
    //     const response = await fetch(`${config.apiUrl}/api/swalook/test-error/`, {
    //       headers: {
    //         Authorization: `Token ${token}`,
    //         "Content-Type": "application/json",
    //       },
    //     });

    //     if (!response.ok) {
    //       throw new Error("Network response was not ok");
    //     }

    //     const data = await response.json();
    //     console.log("Fetched services data:", data.data);

    //     const services = data.data
    //       .flatMap((category) => category.services)
    //       .map((service) => ({
    //         key: service.id,
    //         value: service.service || "Unnamed Service",
    //         price: service.price || 0,
    //         duration: service.duration || 0,
    //         for_men: service.for_men,
    //         for_women: service.for_women,
    //       }));

    //     setServiceOptions(services);
    //     setHasFetchedServices(true);
    //   } catch (error) {
    //     console.error("Error fetching service data:", error);
    //   }
    // };

    // useEffect(() => {
    //   fetchServiceData();
    // }, []);

    // // Handle service click
    // const handleServiceClick = () => {
    //   if (!hasFetchedServices) {
    //     fetchServiceData();
    //   }
    // };

    const filteredCategories = categoryServices.filter(
        (category) =>
            category.value?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.services.some((service) =>
                service.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
    );
    const filteredproduct = productCategory.filter(
        (category) =>
            category.value?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.product.some((product) =>
                product.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
    );
    // toggleProductSelection
    const toggleServiceSelection = (service) => {
        if (selectedList.some((s) => s.id === service.id)) {
            handleServiceSelect(
                selectedList.filter((s) => s.id !== service.id)
            ); // Remove service
        } else {
            // Check if category is correctly passed here
            console.log("Selected service category:", service.category);
            handleServiceSelect([...selectedList, service]); // Add service
        }
    };
    const toggleProductSelection = (product) => {
        setProductList((prevSelected) => {
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

    const handleServiceSelect = (selected) => {
        // Check if selected is properly passed and log the details
        console.log("Incoming selected service(s):", selected);
        // Update selected services
        setSelectedServiceValues(selected);

        // Check and log each service for category-related issues
        const updatedServiceList = selected.map((service) => {
            console.log("Service before category assignment:", service);

            return {
                ...service,
                quantity: service.quantity || 1,
                gst: service.gst || "No GST",
                staff: service.staff || [],
                note: service.note || "No notes added",
                category: service.category, // Ensure the category is correctly assigned
            };
        });

        // After transformation, log the updated list
        setSelectedList(updatedServiceList);
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

    const handleProductInputChange = (index, value) => {
        const updatedProductData = [...productData];
        updatedProductData[index].quantity = value;
        setProductData(updatedProductData);
    };

    console.log("product hu mai",productList);

    // const groupedOptions = serviceOptions.reduce((groups, option) => {
    //   if (!groups[option.category]) {
    //     groups[option.category] = [];
    //   }
    //   groups[option.category].push(option);
    //   return groups;
    // }, {});

    // Handle GST change
    const handleGST = (e, index) => {
        const updatedSelectedList = [...selectedList];
        updatedSelectedList[index].gst = e.target.value;
        setSelectedList(updatedSelectedList);
        updateServicesTableData(updatedSelectedList);
    };

    // Handle input change for quantity and price
    const handleInputChange = (index, field, value) => {
        if (value === "") {
            // Allow empty value while typing
            if (index < selectedList.length) {
                const updatedSelectedList = [...selectedList];
                updatedSelectedList[index][field] = "";
                setSelectedList(updatedSelectedList);
            } else {
                const productIndex = index - selectedList.length;
                if (productIndex < productList.length) {
                    const updatedProductList = [...productList];
                    updatedProductList[productIndex][field] = "";
                    setProductList(updatedProductList);
                }
            }
            return;
        }
    
        const newValue = parseInt(value, 10) || 1;
    
        if (index < selectedList.length) {
            const updatedSelectedList = [...selectedList];
            updatedSelectedList[index][field] = newValue;
            setSelectedList(updatedSelectedList);
            updateServicesTableData(updatedSelectedList);
        } else {
            const productIndex = index - selectedList.length;
            if (productIndex < productList.length) {
                const updatedProductList = [...productList];
                updatedProductList[productIndex][field] = newValue;
                setProductList(updatedProductList);
            }
        }
    };
    
    


    // Update service table data
    const updateServicesTableData = (updatedValues) => {
        const inputFieldValues = updatedValues.map((service) => ({
            quantity: service.quantity || 1, // Default quantity to 1 if missing
            price: service.price || 0, // Default price to 0 if missing
        }));

        // Do something with inputFieldValues if needed
        console.log(inputFieldValues);

        const newTableData = updatedValues.map((service, index) => ({
            ...service,
            finalPrice:
                service.gst === "Inclusive"
                    ? (service.price / 1.18).toFixed(2) // Adjust price for inclusive GST
                    : service.gst === "Exclusive"
                    ? service.price
                    : service.price || 0, // Ensure price defaults to 0 if missing

            gst: service.gst || "No GST", // Default to empty string if gst is not set
            inputFieldValue: inputFieldValues[index], // Store quantity in inputFieldValue
            staff: service.staff || [], // Include staff data for the service
            category: service.category, // Ensure category info is included
        }));

        setServicesTableData(newTableData); // Update the services table data
    };
    const handleMembershipChange = async (selectedType) => {
        console.log("Swalook Membership Selected:", selectedType);

        // Find the full membership object based on the selected type
        const selectedMembership = membershipOptions.find(
            (option) => option.program_type === selectedType
        );

        // Set the full membership object instead of just the type
        setSelectMembership(selectedMembership || null);
    };
    console.log("Selected salon:", sname);
    console.log(staffData);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (index) => {
        setIsModalOpen(index); // Set the index of the row whose modal should be open
    };

    const closeModal = () => {
        setIsModalOpen(null); // Close modal
    };
    // Handle served by (staff) selection
    const handleServedSelect = (selected, index) => {
        const updatedSelectedList = [...selectedList];
        updatedSelectedList[index].staff = selected; 
        setSelectedList(updatedSelectedList); 
        updateServicesTableData(updatedSelectedList);
        setIsModalOpen(false);
    };

    const handleService_Select = () => {
        // Logic to handle service select
        setServiceModalOpen(false);
    };
    console.log("xxxxxx", selectedList);

    const handleGSTChange = (event) => {
        setIsGST(true);
    };

    const [deductedPoints, setDeductedPoints] = useState("");
    const [valueDeductedPoints, setValueDeductedPoints] = useState("");

    const fetchSpecificSerial = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("Token is missing.");
                return null; // Return null to handle error
            }

            const response = await axios.get(
                `${config.apiUrl}/api/swalook/get_specific_slno/`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response?.data?.slno) {
                setInvoiceId(response.data.slno); // Update state for UI if needed
                return response.data.slno; // Return the slno for immediate use
            } else {
                console.error("Invalid response format:", response.data);
                return null; // Return null if the response is invalid
            }
        } catch (error) {
            console.error("Error fetching invoice ID:", error);
            return null; // Return null on error
        }
    };

    console.log(servicesTableData, "servicesTableData");
    const handleGenerateInvoice = async (e) => {
        e.preventDefault(); // Prevent form's default submit behavior
        setLoading(true); // Start loading

        try {
            // Fetch the InvoiceId and ensure it's valid
            const generatedInvoiceId = await fetchSpecificSerial();
            if (!generatedInvoiceId) {
                setDialogTitle("Error");
                setDialogMessage(
                    "Failed to generate Invoice ID. Please try again."
                );
                setDialogOpen(true);
                setLoading(false);

                return;
            }

            // Update state with the generated InvoiceId
            setInvoiceId(generatedInvoiceId);

            // Validate mobile number
            const mobileNoPattern = /^[0-9]{10}$/;
            if (!mobileNoPattern.test(mobile_no)) {
                setDialogTitle("Error");
                setDialogMessage("Please enter a valid mobile number!");
                setDialogOpen(true);
                setLoading(false);
                return;
            }
            // Validate services table data and product data
            if (
                (!Array.isArray(servicesTableData) || servicesTableData.length === 0 || 
                 servicesTableData.every(service => !service.inputFieldValue || !service.gst)) &&
                (!Array.isArray(productList) || productList.length === 0 || 
                 productList.every(productList => !productList.quantity))
            ) {
                setPopupMessage("Please fill the missing field");
                setShowPopup(true);
                setLoading(false);
                return;
            }
            
            
            

            // Validate services table data
            for (const service of servicesTableData) {
                if (!service.staff || service.staff.length === 0) {
                    setDialogTitle("Error");
                    setDialogMessage(
                        "Please select 'Served By' for all selected services!"
                    );
                    setDialogOpen(true);
                    setLoading(false);
                    return;
                }
                if (!service.inputFieldValue) {
                    setDialogTitle("Error");
                    setDialogMessage(
                        "Please enter quantity for selected services!"
                    );
                    setDialogOpen(true);
                    setLoading(false);
                    return;
                }
                if (!service.gst) {
                    setDialogTitle("Error");
                    setDialogMessage("Please select GST for all services!");
                    setDialogOpen(true);
                    setLoading(false);
                    return;
                }
            }

            // Validate product data
            for (const product of productData) {
                if (!product.quantity) {
                    setDialogTitle("Error");
                    setDialogMessage(
                        "Please enter quantity for selected products!"
                    );
                    setDialogOpen(true);
                    setLoading(false);
                    return;
                }
            }

            // Submit user details if they don't exist
            console.log("Submit user details", dateOfBirth, anniversaryDate);
            let submitResult = null;
            const shouldUpdateCustomer =
                userExists &&
                (selectMembership ||
                    selectedCoupons.length > 0 ||
                    dateOfBirth ||
                    anniversaryDate);
            if (shouldUpdateCustomer) {
                try {
                    submitResult = await handleUpdateCustomer(e, customerId);
                } catch (error) {
                    console.error("Error during user update:", error);
                    setDialogTitle("Error");
                    setDialogMessage(
                        "An error occurred while updating user details. Please try again."
                    );
                    setDialogOpen(true);
                    setLoading(false);
                    return;
                }
            } else if (!userExists) {
                try {
                    submitResult = await handleSubmit(e);
                } catch (error) {
                    console.error("Error during user submission:", error);
                    setDialogTitle("Error");
                    setDialogMessage(
                        "An error occurred while adding user details. Please try again."
                    );
                    setDialogOpen(true);
                    setLoading(false);
                    return;
                }
            }

            await Promise.all([
                submitResult, // Submit user details if needed
                navigate(
                    `/${sname}/${branchName}/${generatedInvoiceId}/invoice`,
                    {
                        state: {
                            customer_name,
                            email,
                            mobile_no,
                            address,
                            GBselectedServices: servicesTableData,
                            service_by,
                            discount,
                            isGST,
                            gst_number,
                            comments,
                            InvoiceId: generatedInvoiceId,
                            productData: productList,
                            deductedPoints,
                            selectMembership,
                            paymentModes,
                            selectedCoupons,
                            valueDeductedPoints,
                        },
                    }
                ),
            ]);
        } catch (error) {
            console.error("Error during invoice generation:", error);
            setDialogTitle("Error");
            setDialogMessage(
                "An error occurred while generating the invoice. Please try again."
            );
            setDialogOpen(true);
        } finally {
            setLoading(false); // Stop loading after navigation
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        const branchId = localStorage.getItem("branch_id");

        try {
            const response = await axios.post(
                `${config.apiUrl}/api/swalook/loyality_program/customer/?branch_name=${branchId}`,
                {
                    name: customer_name,
                    mobile_no,
                    email,
                    membership: selectMembership?.program_type || "",
                    d_o_b: dateOfBirth || "",
                    d_o_a: anniversaryDate || "",
                    coupon:
                        selectedCoupons.map((coupon) => ({
                            coupon_name: coupon.id,
                        })) || [],
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );

            const { status, data } = response;
            console.log("API Response:", data);

            if (status >= 200 && status < 300 && data.success) {
                setPopupMessage("Customer added successfully!");
                setShowPopup(true);
                return true; // Indicate success
            } else {
                throw new Error(data.message || "Failed to add customer.");
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "An error occurred.";
            setPopupMessage(errorMessage);
            setShowPopup(true);
            console.error("Error:", error.response?.data || error.message);
            return false; // Indicate failure
        } finally {
            setLoading(false);
        }
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

                if (response.data.status) {
                    // Filter only active coupons
                    const activeCoupons = response.data.data.filter(
                        (coupon) => coupon.active
                    );
                    setCouponOptions(activeCoupons);
                }
            } catch (error) {
                console.error("Error fetching coupon data:", error);
            }
        };

        fetchCouponData();
    }, [bid]); // Runs when `bid` changes

    const handleCouponChange = (couponId) => {
        if (couponId === "None") return; // Prevent adding 'None'

        const selectedCoupon = couponOptions.find(
            (coupon) => coupon.id === couponId
        );

        if (
            selectedCoupon &&
            !selectedCoupons.some((coupon) => coupon.id === selectedCoupon.id)
        ) {
            setSelectedCoupons([...selectedCoupons, selectedCoupon]); // Add to selected coupons list
        }

        setSelectCoupon(selectedCoupon); // ✅ Store full object, not just ID
    };

    const handleCouponGSTChange = (index, gstValue) => {
        setSelectedCoupons((prevCoupons) =>
            prevCoupons.map((coupon, i) =>
                i === index ? { ...coupon, gst: gstValue } : coupon
            )
        );
    };

    console.log("abcd", selectedCoupons);
    const [get_persent_day_bill, setGet_persent_day_bill] = useState([]);

    // useEffect(() => {
    //   const fetchData = async () => {
    //     try {
    //       const token = localStorage.getItem('token');
    //       const response = await axios.get(`${config.apiUrl}/api/swalook/billing/?branch_name=${bid}`, {
    //         headers: {
    //           'Authorization': `Token ${token}`,
    //           'Content-Type': 'application/json'
    //         }
    //       });
    //       setGet_persent_day_bill(response.data.table_data);
    //       // //console.log(response.data.current_user_data);
    //     } catch (error) {
    //       console.error('Error fetching data:', error);
    //     } finally {
    //       setLoading(false);
    //     }
    //   };

    //   fetchData();
    // }, []);

    const handleShowInvoice = (id) => {
        navigate(`/${sname}/${branchName}/viewinvoice/${id}`);
    };

    const handleViewAllInvoices = (id) => {
        navigate(`/${sname}/${branchName}/view-all-invoices`);
    };

    const handleDeleteInvoice = async (id) => {
        const token = localStorage.getItem("token");

        try {
            const response = await axios.get(
                `${config.apiUrl}/api/swalook/delete/invoice/${id}/`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status >= 200 && response.status < 300) {
                console.log("Invoice deleted successfully");
                window.location.reload(); // Reload only on success
            } else {
                throw new Error("Failed to delete invoice.");
            }
        } catch (error) {
            console.error(
                "Error deleting invoice:",
                error.response?.data || error.message
            );
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteInvoiceId(id);
        setShowDeletePopup(true);
    };

    const handleDeleteConfirm = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await axios.delete(
                `${config.apiUrl}/api/swalook/delete/invoice/?id=${deleteInvoiceId}&branch_name=${bid}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            //console.log(res.data);
            window.location.reload();
        } catch (err) {
            //console.log(err);
        } finally {
            setShowDeletePopup(false);
        }
    };

    const [membershipStatus, setMembershipStatus] = useState(false);
    const [membershipType, setMembershipType] = useState("");
    const [userPoints, setUserPoints] = useState("");
    const [couponType, setCouponType] = useState("");
    const [couponValue, setCouponValue] = useState("");

    const handlePhoneBlur = async () => {
        if (!mobile_no || mobile_no.length !== 10) {
            // Invalid mobile number
            resetCustomerFields();
            return;
        }

        try {
            const branchName = localStorage.getItem("branch_id");
            const token = localStorage.getItem("token");

            if (!branchName || !token) {
                console.error("Branch ID or token is missing.");
                resetCustomerFields();
                return;
            }

            // Check if user exists
            const checkUserResponse = await axios.get(
                `${config.apiUrl}/api/swalook/loyality_program/customer/?branch_name=${branchName}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (checkUserResponse.data.status) {
                // Fetch user details
                const userDetailsResponse = await axios.get(
                    `${config.apiUrl}/api/swalook/loyality_program/customer/get_details/?branch_name=${branchName}&mobile_no=${mobile_no}`,
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                const userDataArray = userDetailsResponse.data.data;
                if (Array.isArray(userDataArray) && userDataArray.length > 0) {
                    const userData = userDataArray[0];
                    setCustomer_Name(
                        userData.name || appointment.customerName || ""
                    ); // Safely assign values
                    setEmail(userData?.email || appointment?.email || "");
                    setCustomerData(userData);
                    setUserId(userData?.id ?? ""); // Use nullish coalescing to prevent undefined values
                    setUserExists(true);
                    setDateOfBirth(userData?.d_o_b || appointment?.d_o_b || "");
                    setAnniversaryDate(
                        userData?.d_o_a || appointment?.d_o_a || ""
                    );
                    setMembershipType(userData?.membership);
                    setUserPoints(
                        userData?.loyality_profile?.current_customer_points || 0
                    );
                    if (
                        Array.isArray(userData?.coupon) &&
                        userData.coupon.length > 0
                    ) {
                        const userCoupons = userData.coupon.map((coupon) => ({
                            id: coupon.id,
                            couponName: coupon.coupon_name.coupon_name,
                            couponPrice: coupon.coupon_name.coupon_price,
                            couponPointsHold:
                                coupon.coupon_name.coupon_points_hold,
                            issueDate: coupon.issue_date,
                            expiryDate: coupon.expiry_date,
                            isActive: coupon.is_active,
                        }));
                        console.log("hiii", userCoupons);
                        setCouponType(userCoupons);
                    } else {
                        setCouponType([]);
                    }
                    return;
                }
            }

            // New user (if user doesn't exist)
        } catch (error) {
            console.error("Error fetching customer data:", error);
        }
    };

    // Helper to reset customer fields
    const resetCustomerFields = () => {
        setUserExists(false);
        setCustomer_Name("");
        setEmail("");
        setCustomerData(null);
        setAnniversaryDate("");
        setDateOfBirth("");
    };

    // const fetchCustomerData = async () => {
    //   try {
    //     const token = localStorage.getItem('token');

    //     const response = await axios.get(`${config.apiUrl}/api/swalook/get-customer-bill-app-data/?mobile_no=${mobile_no}`, {
    //       headers: {
    //         'Authorization': `Token ${token}`,
    //         'Content-Type': 'application/json',
    //       },
    //     });

    //     setCustomerData(response.data);
    //   } catch (error) {
    //     console.error('Error fetching customer data:', error);
    //   }
    // };

    // useEffect(() => {
    //   fetchCustomerData();
    // }, [mobile_no]);
    const hasMembership = !!membershipType && membershipType !== "None";
    const hasCoupon = Array.isArray(couponType) && couponType.length > 0;
    console.log("hasCoupon", hasCoupon, hasMembership);

    const [customerId, setCustomerId] = useState("");

    const fetchCustomerData = async () => {
        if (!mobile_no || mobile_no.length !== 10) {
            console.error("Invalid mobile number.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("Token is missing.");
                return;
            }

            const response = await axios.get(
                `${config.apiUrl}/api/swalook/get-customer-bill-app-data/?mobile_no=${mobile_no}&branch_name=${bid}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            setCustomerId(response.data);
            
            console.log("Fetched data:", response.data);
        } catch (error) {
            console.error("Error fetching customer data:", error);
        }
    };

    const combinedList = [...selectedList, ...productList];


    // Debounced effect
    useEffect(() => {
        if (mobile_no.length === 10) {
            const timeoutId = setTimeout(() => {
                fetchCustomerData();
            }, 500);

            return () => clearTimeout(timeoutId);
        }
    }, [mobile_no]);

    const handleViewDetailsClick = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("Token is missing");
            return;
        }

        if (!mobile_no || mobile_no.length !== 10) {
            console.error("Invalid mobile number");
            return;
        }

        try {
            const response = await axios.get(
                `${config.apiUrl}/api/swalook/get-customer-bill-app-data/?mobile_no=${mobile_no}&branch_name=${bid}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            // Store the retrieved data
            setCustomerData(response.data);
            console.log("User data:", response.data);

            // Show the popup
            setIsPopupVisible(true);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleClosePopup = () => {
        setIsPopupVisible(false);
    };

    const handleUpdateCustomer = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        console.log("Using Customer ID:", userId);

        try {
            const response = await fetch(
                `${config.apiUrl}/api/swalook/loyality_program/customer/?branch_name=${bid}&id=${userId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify({
                        name: customer_name,
                        mobile_no,
                        email,
                        membership: selectMembership || "",
                        d_o_b: dateOfBirth || "",
                        d_o_a: anniversaryDate || "",
                        coupon: selectedCoupons || "",
                    }),
                }
            );

            if (response.ok) {
                setPopupMessage("Customer updated successfully!");
                setShowPopup(true);
            } else {
                setPopupMessage("Failed to update customer.");
                setShowPopup(true);
            }
        } catch (error) {
            setPopupMessage("An error occurred.");
            setShowPopup(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchMembershipOptions = async () => {
        const token = localStorage.getItem("token");
        const branchId = localStorage.getItem("branch_id"); // Assuming 'branch_id' is stored in localStorage

        if (!token || !branchId) {
            console.error("Missing token or branch ID");
            return;
        }

        try {
            const membershipResponse = await axios.get(
                `${config.apiUrl}/api/swalook/loyality_program/view/?branch_name=${branchId}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            // Check if the response contains data and status is true
            if (
                membershipResponse.data.status &&
                Array.isArray(membershipResponse.data.data)
            ) {
                const activeMemberships = membershipResponse.data.data.filter(
                    (membership) =>
                        membership.active === true &&
                        membership.program_type != "None"
                );
                // console.log("memkjhjuytresdfxcvbjk", activeMemberships)
                setMembershipOptions(activeMemberships);
            } else {
                console.error(
                    "Unexpected response format or no data:",
                    membershipResponse.data
                );
                setMembershipOptions([]); // Clear options if the format is not as expected
            }
        } catch (error) {
            console.error("Error fetching membership options:", error);
            setMembershipOptions([]); // Ensure options are cleared if an error occurs
        }
    };

    useEffect(() => {
        if (mobile_no.length === 10) {
            fetchMembershipOptions();
        } else {
            setMembershipOptions([]); // Clear options if mobile number is invalid
        }
    }, [mobile_no]);
    console.log("tabel", servicesTableData);

    const [selectedPayments, setSelectedPayments] = useState([]);
    const [amounts, setAmounts] = useState({});
    console.log("dekh", selectMembership);
    const options = [
        { value: "cash", label: "Cash" },
        { value: "upi", label: "UPI" },
        { value: "card", label: "Card" },
        { value: "net_banking", label: "Net Banking" },
        { value: "other", label: "Other" },
    ];

    const handleSelectChange = (selectedOptions) => {
        const updatedPayments = {};
        selectedOptions.forEach((option) => {
            updatedPayments[option.value] = paymentModes[option.value] || ""; // Preserve existing amount
        });
        setPaymentModes(updatedPayments);
    };

    const handleAmountChange = (mode, value) => {
        setPaymentModes((prev) => ({
            ...prev,
            [mode]: value, // Update the amount for the selected mode
        }));
    };

    const totalPayment = Object.values(paymentModes).reduce(
        (sum, amount) => sum + (parseFloat(amount) || 0),
        0
    );

    const membershipPrice = selectMembership?.price || 0;

    const couponDiscount = selectCoupon?.coupon_price || 0;
    const grandTotal =
        selectedList.reduce(
            (sum, service) =>
                sum + (service.price || 0) * (service.quantity || 1),
            0
        ) + productList.reduce(
            (sum, product) =>
                sum + (product.price || 0) * (product.quantity || 1),
            0
        ) +
        membershipPrice +
        couponDiscount -
        deductedPoints -
        valueDeductedPoints; 

    const formattedGrandTotal = isNaN(grandTotal) ? 0 : grandTotal;

    const grandTotalFormatted = formattedGrandTotal.toFixed(2);
    const handleInvoiceSubmit = (e) => {
        if (totalPayment === grandTotal) {
         console.log("Form submitted");
        } else {
            e.preventDefault(); 
            alert("Total payment does not match the grand total.");
        }
    };
    useEffect(() => {
        if (mobile_no.length === 10) {
            handlePhoneBlur();
        }
    }, [mobile_no]);

    const handleMembershipGST = (gstValue) => {
        setSelectMembership((prev) => ({
            ...prev,
            gst: gstValue, // Update GST in the membership object
        }));
    };

    // Use useLocation to access the passed state
    const location = useLocation();
    const { appointment } = location.state || {};
    // Set initial values from appointment data
    console.log("Appointment", appointment);
    useEffect(() => {
        if (appointment) {
            setCustomer_Name(appointment.customerName || "");
            setMobileNo(appointment.phoneNumber || "");
            setEmail(appointment.email || "");
            setAnniversaryDate(appointment.d_o_a || "");
            setDateOfBirth(appointment.d_o_b || "");
            setService(appointment.services || []);

            setSelectedList(appointment.services || []);
            console.log("scheduler", appointment.service);
            setStaff(appointment.service_by || "");
        }
    }, [appointment]);

    return (
        <>
            <div className="bg-gray-100">
                <Header />
                <VertNav />
                <div className="bg-gray-100 min-h-[150vh] md:ml-72 p-10">
                    {userExists ? (
                        <div className="bg-white shadow-md px-4 py-8 mb-10 rounded-lg  grid grid-cols-1 md:grid-cols-4 gap-4">
                            {customerId && (
                                <>
                                    {/* Business Section */}
                                    <div className="text-center">
                                        <div className="font-semibold text-gray-900 text-xl">
                                            Business
                                        </div>
                                        <div className="text-2xl font-bold text-blue-500">
                                            Rs {customerId.total_billing_amount}
                                        </div>
                                    </div>

                                    {/* Number of Appointments Section */}
                                    <div className="text-center">
                                        <div className="font-semibold text-gray-900 text-xl">
                                            Number of Appointments
                                        </div>
                                        <div className="text-2xl font-bold text-blue-500">
                                            {customerId.total_appointment}
                                        </div>
                                    </div>

                                    {/* Number of Invoices Section */}
                                    <div className="text-center">
                                        <div className="font-semibold text-gray-900 text-xl">
                                            Number of Invoices
                                        </div>
                                        <div className="text-2xl font-bold text-blue-500">
                                            {customerId.total_invoices}
                                        </div>
                                    </div>

                                    {/* View Details Button */}
                                    <div className="text-center p-4   flex items-center justify-center">
                                        <button
                                            onClick={handleViewDetailsClick}
                                            className="text-blue-500 hover:cursor-pointer hover:underline"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : null}

                    {isPopupVisible && (
                        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-4/5 md:w-1/2">
                                <button
                                    onClick={handleClosePopup}
                                    className="absolute top-2 right-2 bg-red-500 text-white border-0 py-1 px-3 rounded-full cursor-pointer"
                                >
                                    <FaTimes />
                                </button>
                                <h2 className="text-2xl font-bold mb-4">
                                    Customer Bill Data
                                </h2>
                                {customerData ? (
                                    <div className="overflow-auto">
                                        <table className="table-auto w-full border border-gray-300">
                                            <thead className="bg-blue-500 text-white">
                                                <tr>
                                                    <th className="px-4 py-2">
                                                        Name
                                                    </th>
                                                    <th className="px-4 py-2">
                                                        Mobile No
                                                    </th>
                                                    <th className="px-4 py-2">
                                                        Billing Amount
                                                    </th>
                                                    <th className="px-4 py-2">
                                                        Services
                                                    </th>
                                                    <th className="px-4 py-2">
                                                        Service by
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customerData.previous_invoices &&
                                                customerData.previous_invoices
                                                    .length > 0 ? (
                                                    customerData.previous_invoices.map(
                                                        (item, index) => (
                                                            <tr
                                                                key={index}
                                                                className={
                                                                    index %
                                                                        2 ===
                                                                    0
                                                                        ? "bg-gray-100"
                                                                        : "bg-white"
                                                                }
                                                            >
                                                                <td className="border px-4 py-2">
                                                                    {
                                                                        customerData.customer_name
                                                                    }
                                                                </td>
                                                                <td className="border px-4 py-2">
                                                                    {
                                                                        customerData.customer_mobile_no
                                                                    }
                                                                </td>
                                                                <td className="border px-4 py-2">
                                                                    {
                                                                        item.grand_total
                                                                    }
                                                                </td>

                                                                <td className="border px-4 py-2">
                                                                    {JSON.parse(
                                                                        item.services
                                                                    ).map(
                                                                        (
                                                                            service,
                                                                            idx
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    idx
                                                                                }
                                                                            >
                                                                                {
                                                                                    service.Description
                                                                                }
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </td>
                                                                <td className="border px-4 py-2">
                                                                    {JSON.parse(
                                                                        item.services
                                                                    ).map(
                                                                        (
                                                                            service,
                                                                            idx
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    idx
                                                                                }
                                                                            >
                                                                                {
                                                                                    service.Staff
                                                                                }
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan="5"
                                                            className="text-center px-4 py-2"
                                                        >
                                                            No invoices
                                                            available
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-600">
                                        Loading data...
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Invoice Form Section */}

                    <div className="bg-white shadow-md p-10 rounded-lg mb-10">
                        <div className="flex flex-row justify-between mb-10">
                            <h2 className="section-titles text-3xl font-bold">
                                New Invoice
                            </h2>
                            <button
                                onClick={handleViewAllInvoices}
                                className="text-blue-500 hover:cursor-pointer hover:underline"
                            >
                                View all invoices
                            </button>
                        </div>

                        {/* Customer Details */}
                        <form onSubmit={handleGenerateInvoice}>
                            <div>
                                <h3 className="text-xl font-bold flex">
                                    Customer Details
                                </h3>
                                <div className="gap-4 mb-4">
                                    <div className="grid sm:grid-cols-2 md:grid-cols-3  mt-4">
                                        <input
                                            type="number"
                                            className="border border-[#CFD3D4] rounded-lg m-2 p-3 col-span-1 font-semibold placeholder-gray-400"
                                            placeholder="Phone Number"
                                            value={mobile_no}
                                            required
                                            onChange={(e) => {
                                                const value = e.target.value;

                                                // Allow only 10 digits
                                                if (value.length <= 10) {
                                                    setMobileNo(value);
                                                }
                                            }}
                                        />

                                        <input
                                            type="text"
                                            className="border border-[#CFD3D4] rounded-lg m-2  p-3  col-span-1 font-semibold placeholder-gray-400"
                                            placeholder="Full Name"
                                            value={customer_name}
                                            required
                                            onChange={(e) =>
                                                setCustomer_Name(e.target.value)
                                            } // Editable only for new user
                                        />
                                        <input
                                            type="email"
                                            className="border border-[#CFD3D4] rounded-lg m-2  p-3  col-span-1 font-semibold placeholder-gray-400"
                                            placeholder="Email Address"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            } // Editable only for new user
                                        />
                                    </div>
                                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 mt-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold items-start flex mb-4">
                                                Date Of Birth
                                            </span>
                                            <input
                                                type="date"
                                                id="date_input_field"
                                                className="text-black col-span-1 font-semibold placeholder-gray-400"
                                                max={
                                                    new Date()
                                                        .toISOString()
                                                        .split("T")[0]
                                                }
                                                placeholder="Date of Birth"
                                                value={dateOfBirth || ""}
                                                onChange={(e) =>
                                                    setDateOfBirth(
                                                        e.target.value
                                                    )
                                                } // Allow editing for all users
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold items-start flex mb-4">
                                                Date Of Anniversary
                                            </span>
                                            <input
                                                type="date"
                                                id="date_input_field"
                                                className="text-black col-span-1 font-semibold placeholder-gray-400"
                                                max={
                                                    new Date()
                                                        .toISOString()
                                                        .split("T")[0]
                                                }
                                                placeholder="Date of Anniversary"
                                                value={anniversaryDate || ""}
                                                onChange={(e) =>
                                                    setAnniversaryDate(
                                                        e.target.value
                                                    )
                                                } // Allow editing for all users
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4 lg:gap-12 ">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold flex mb-4">
                                        Select Services/Products:
                                    </h3>
                                    <div className="flex space-x-6">
                                        <button
                                            type="button"
                                            className="px-6 py-2 border-2 border-blue-500 text-blue-500 font-semibold rounded-lg hover:bg-blue-500 hover:text-white transition duration-300"
                                            onClick={() => {
                                                setServiceModalOpen(true); // Open the modal
                                                fetchServiceCategoryData(); // Fetch category data
                                            }}
                                            required
                                        >
                                            Add Services
                                        </button>

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
                                    </div>
                                    <div className="my-4" id="service-table">
                                        {combinedList.length > 0 ? (
                                            <table className="w-full border border-gray-200">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="border px-4 py-2">
                                                            Category
                                                        </th>
                                                        <th className="border px-4 py-2">
                                                            Name
                                                        </th>
                                                        <th className="border px-4 py-2">
                                                            Price
                                                        </th>
                                                        <th className="border px-4 py-2">
                                                            Quantity
                                                        </th>
                                                        <th className="border px-4 py-2">
                                                            GST
                                                        </th>
                                                        <th className="border px-4 py-2">
                                                            Staff
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-center">
                                                    {combinedList.map(
                                                        (combine, index) => (
                                                            <tr
                                                                key={index}
                                                                className="border"
                                                            >
                                                                <td className="p-2 border">
                                                                    {combine.category ||
                                                                        "Uncategorized"}
                                                                </td>
                                                                <td className="p-2 border">
                                                                    {combine.name ||
                                                                        combine.Description}
                                                                </td>
                                                                <td className="p-2 border">
                                                                    <input
                                                                        type="number"
                                                                        className="border w-20 px-2 py-1 text-center"
                                                                        placeholder="Price"
                                                                        min="0"
                                                                        value={
                                                                            combine.gst ===
                                                                            "Inclusive"
                                                                                ? (
                                                                                    combine.price /
                                                                                      1.18
                                                                                  ).toFixed(
                                                                                      2
                                                                                  ) 
                                                                                : combine.price ||
                                                                                  ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleInputChange(
                                                                                index,
                                                                                "price",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    />
                                                                </td>

                                                                <td className="p-2 border">
                                                                <input
    type="number"
    className="border w-20 px-2 py-1 text-center"
    placeholder="Qty"
    min="1"
    value={combine.quantity !== undefined ? combine.quantity : 1}
    onChange={(e) =>
        handleInputChange(index, "quantity", e.target.value)
    }
/>

                                                                </td>

                                                                <td className="p-2 border">
                                                                    <select
                                                                        className="border px-2 py-1"
                                                                        value={
                                                                            combine.gst ||
                                                                            "No GST"
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleGST(
                                                                                e,
                                                                                index
                                                                            )
                                                                        }
                                                                        required
                                                                    >
                                                                        <option value="No GST">
                                                                            No
                                                                            GST
                                                                        </option>
                                                                        <option value="Inclusive">
                                                                            Inclusive
                                                                        </option>
                                                                        <option value="Exclusive">
                                                                            Exclusive
                                                                        </option>
                                                                    </select>
                                                                </td>
                                                                <td
                                                                    className="p-2 border"
                                                                    onClick={
                                                                        fetchStaffData
                                                                    }
                                                                >
                                                                    <div
        className="border px-2 py-1 bg-white text-black rounded cursor-pointer"
        onClick={() => openModal(index)}
    >
        {combine.staff && combine.staff.length > 0 ? (
            <span>{combine.staff.map((staff) => staff.label).join(", ")}</span>
        ) : selectedList.includes(combine) ? ( // Check if service exists in serviceList
            <span className="text-red-500">Select Staff *</span> // Required for services
        ) : (
            <span>Select Staff (Optional)</span> // Optional for products
        )}
    </div>
                                                                    {isModalOpen ===
                                                                        index && (
                                                                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                                                                            <div className="bg-white w-96 p-4 rounded shadow-lg">
                                                                                <h3 className="text-lg font-bold mb-4">
                                                                                    Select
                                                                                    Staff
                                                                                </h3>
                                                                                <Multiselect
                                                                                    options={
                                                                                        staffData
                                                                                    }
                                                                                    showSearch={
                                                                                        true
                                                                                    }
                                                                                    onSelect={(
                                                                                        selected
                                                                                    ) =>
                                                                                        handleServedSelect(
                                                                                            selected,
                                                                                            index
                                                                                        )
                                                                                    }
                                                                                    onRemove={(
                                                                                        selected
                                                                                    ) =>
                                                                                        handleServedSelect(
                                                                                            selected,
                                                                                            index
                                                                                        )
                                                                                    }
                                                                                    displayValue="label"
                                                                                    placeholder="Select Served By"
                                                                                    selectedValues={
                                                                                        combine.staff ||
                                                                                        []
                                                                                    }
                                                                                    required={selectedList.includes(combine)} 

                                                                                />
                                                                                <div className="flex justify-end mt-4">
                                                                                    <button
                                                                                        type="button"
                                                                                        className="px-4 py-2 bg-gray-300 text-black rounded mr-2"
                                                                                        onClick={
                                                                                            closeModal
                                                                                        }
                                                                                    >
                                                                                        Cancel
                                                                                    </button>
                                                                                    <button
                                                                                        type="button"
                                                                                        className="px-4 py-2 bg-blue-500 text-white rounded"
                                                                                        onClick={
                                                                                            closeModal
                                                                                        }
                                                                                    >
                                                                                        Done
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                                {/* Table Footer for Grand Total */}
                                                <tfoot>
                                                    <tr className="bg-gray-100 font-semibold">
                                                        <td
                                                            className="p-2 border text-left"
                                                            colSpan="2"
                                                        >
                                                            Grand Total
                                                        </td>
                                                        <td className="p-2 border text-center">
                                                            {/* Total Price Calculation */}
                                                            {combinedList
                                                                .reduce(
                                                                    (
                                                                        sum,
                                                                        service
                                                                    ) =>
                                                                        sum +
                                                                        (service.price ||
                                                                            0) *
                                                                            (service.quantity ||
                                                                                1),
                                                                    0
                                                                )
                                                                .toFixed(2)}
                                                        </td>
                                                        <td className="p-2 border text-center">
                                                            {/* Total Quantity Calculation */}
                                                            {combinedList.reduce(
                                                                (
                                                                    sum,
                                                                    service
                                                                ) =>
                                                                    sum +
                                                                    (Number(
                                                                        service.quantity
                                                                    ) || 1), // Convert to number
                                                                0
                                                            )}
                                                        </td>
                                                        <td className="p-2 border text-center">
                                                            {/* Total GST Calculation */}
                                                            {combinedList
                                                                .reduce(
                                                                    (
                                                                        sum,
                                                                        service
                                                                    ) =>
                                                                        sum +
                                                                        (service.gst ===
                                                                        "Inclusive"
                                                                            ? service.price *
                                                                              0.18
                                                                            : 0),
                                                                    0
                                                                )
                                                                .toFixed(2)}
                                                        </td>
                                                        <td className="p-2 border"></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        ) : (
                                            <p className="text-center text-gray-500"></p>
                                        )}
                                    </div>

                                    <div className="my-4" id="product-tabel">
                                        {product_value.length > 0 ? ( 
                                            <table className="w-full border p-4 border-gray-200 mt-4">
                                                <thead>
                                                    <tr className="bg-gray-100 p-4">
                                                    <th className="border px-4 py-2">
                                                            category
                                                        </th>
                                                        <th className="border px-4 py-2">
                                                            Product Name
                                                        </th>
                                                        <th className="border px-4 py-2">
                                                            Quantity
                                                        </th>
                                                        <th className="border px-4 py-2">
                                                            Unit
                                                        </th>
                                                        <th className="border px-4 py-2">
                                                            Available
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-center">
                                                    {productList.map(
                                                        (product, index) => (
                                                            <tr key={index}>
                                                                <td>
                                                                    {
                                                                        product.category
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {
                                                                        product.name
                                                                    }
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="digit"
                                                                        className="gb_service-table-field m-2"
                                                                        placeholder="Enter Quantity"
                                                                        required
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleProductInputChange(
                                                                                index,
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        style={{
                                                                            borderColor:
                                                                                product.quantity ===
                                                                                    "" ||
                                                                                product.quantity ===
                                                                                    "0"
                                                                                    ? "red"
                                                                                    : "black", // Highlight empty or invalid inputs
                                                                        }}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    {
                                                                        product.unit
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {
                                                                        product.quantity
                                                                    }
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <span></span>
                                        )}
                                    </div>

                                    {isServiceModalOpen && (
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
                                                            setServiceModalOpen(
                                                                false
                                                            )
                                                        }
                                                    />
                                                </div>

                                                {/* Header Section */}
                                                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                                                    <h3 className="text-2xl font-bold">
                                                        Select Services
                                                    </h3>
                                                    <input
                                                        type="text"
                                                        placeholder="Search services or categories..."
                                                        className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/3"
                                                        value={searchQuery}
                                                        onChange={(e) =>
                                                            setSearchQuery(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>

                                                {/* Gender Filter */}
                                                <div className="flex mb-4 items-center gap-4">
                                                    {["Male", "Female"].map(
                                                        (gender) => (
                                                            <label
                                                                key={gender}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={genderFilter.includes(
                                                                        gender
                                                                    )}
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleGenderFilterToggle(
                                                                            gender,
                                                                            e
                                                                                .target
                                                                                .checked
                                                                        )
                                                                    }
                                                                    className="h-4 w-4"
                                                                />
                                                                <span>
                                                                    {gender}
                                                                </span>
                                                            </label>
                                                        )
                                                    )}
                                                </div>

                                                {/* Service Categories Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {filteredCategories.map(
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
                                                                    {category.services
                                                                        .filter(
                                                                            (
                                                                                service
                                                                            ) => {
                                                                                // Show all if no filter is applied
                                                                                if (
                                                                                    genderFilter.length ===
                                                                                    0
                                                                                )
                                                                                    return true;

                                                                                // Show services based on gender selection
                                                                                if (
                                                                                    genderFilter.includes(
                                                                                        "Male"
                                                                                    ) &&
                                                                                    genderFilter.includes(
                                                                                        "Female"
                                                                                    )
                                                                                ) {
                                                                                    return true; // Show all if both are selected
                                                                                } else if (
                                                                                    genderFilter.includes(
                                                                                        "Male"
                                                                                    )
                                                                                ) {
                                                                                    return service.for_men;
                                                                                } else if (
                                                                                    genderFilter.includes(
                                                                                        "Female"
                                                                                    )
                                                                                ) {
                                                                                    return service.for_women;
                                                                                }

                                                                                return false;
                                                                            }
                                                                        )
                                                                        .map(
                                                                            (
                                                                                service
                                                                            ) => (
                                                                                <li
                                                                                    key={
                                                                                        service.id
                                                                                    }
                                                                                    className="flex items-center justify-between"
                                                                                >
                                                                                    <label className="flex items-center gap-3 cursor-pointer">
                                                                                        <div className="flex gap-4">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={selectedList.some(
                                                                                                    (
                                                                                                        s
                                                                                                    ) =>
                                                                                                        s.id ===
                                                                                                        service.id
                                                                                                )}
                                                                                                onChange={() =>
                                                                                                    toggleServiceSelection(
                                                                                                        service
                                                                                                    )
                                                                                                }
                                                                                                className="h-4 w-4"
                                                                                            />
                                                                                            <p className="font-medium">
                                                                                                {
                                                                                                    service.name
                                                                                                }
                                                                                            </p>
                                                                                        </div>
                                                                                    </label>
                                                                                    <p className="text-base font-semibold text-gray-700">
                                                                                        ₹
                                                                                        {
                                                                                            service.price
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

                                                {/* Footer */}
                                                <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-t mt-4">
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-lg font-semibold">
                                                            Selected:{" "}
                                                            {selectedList
                                                                .map(
                                                                    (s) =>
                                                                        s.name
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
                                                                setServiceModalOpen(
                                                                    false
                                                                );
                                                            }}
                                                        >
                                                            Add Service
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Product Modal */}
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
                                                                                            checked={productList.some(
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
                                </div>

                                {userExists && (hasMembership || hasCoupon) ? (
                                    <>
                                        <div className="flex justify-center mt-0 lg:mt-24 mb-8">
                                            <table className="w-3/5 border border-gray-200 shadow-md rounded-lg overflow-hidden">
                                                <thead>
                                                    <tr className="bg-gray-100 text-black">
                                                        <th className="py-3 px-6 text-left">
                                                            Membership/Coupon
                                                        </th>
                                                        <th className="py-3 px-6 text-left">
                                                            Balance
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {hasMembership && (
                                                        <tr className="hover:bg-gray-100">
                                                            <td className="px-6">
                                                                {membershipType}
                                                            </td>
                                                            <td className="px-6">
                                                                {userPoints} P
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {hasCoupon &&
                                                        couponType.map(
                                                            (coupon) => (
                                                                <tr
                                                                    key={
                                                                        coupon.id
                                                                    }
                                                                    className="hover:bg-gray-100"
                                                                >
                                                                    <td className="px-6">
                                                                        {
                                                                            coupon.couponName
                                                                        }
                                                                    </td>
                                                                    <td className="px-6">
                                                                        ₹{" "}
                                                                        {
                                                                            coupon.couponPointsHold
                                                                        }
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {!hasCoupon && (
                                            <div className="flex flex-col items-start mt-4">
                                                <label className="text-lg font-bold flex mb-2">
                                                    Select Coupons
                                                </label>
                                                <select
                                                    value={
                                                        selectCoupon?.id ||
                                                        "None"
                                                    }
                                                    onChange={(e) =>
                                                        handleCouponChange(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="p-2 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="None">
                                                        Select a Coupon
                                                    </option>
                                                    {couponOptions.map(
                                                        (coupon) => (
                                                            <option
                                                                key={coupon.id}
                                                                value={
                                                                    coupon.id
                                                                }
                                                            >
                                                                {
                                                                    coupon.coupon_name
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                        )}

                                        {/* Show Membership Dropdown if Coupon Exists but No Membership */}
                                        {!hasMembership && (
                                            <div className="flex flex-col items-start mt-4">
                                                <label className="text-lg font-bold flex mb-2">
                                                    Select Membership Plan
                                                </label>
                                                <select
                                                    value={
                                                        selectMembership?.id ||
                                                        "None"
                                                    }
                                                    onChange={(e) =>
                                                        handleMembershipChange(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="p-2 w-full border font-bold text-blue-500  border-blue-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option
                                                        value="None"
                                                        className="text-black"
                                                        disabled={
                                                            selectMembership?.id ===
                                                            "None"
                                                        }
                                                    >
                                                        Select a plan
                                                    </option>
                                                    {membershipOptions.length >
                                                    0 ? (
                                                        membershipOptions.map(
                                                            (option) => (
                                                                <option
                                                                    key={
                                                                        option.program_type
                                                                    }
                                                                    value={
                                                                        option.program_type
                                                                    }
                                                                >
                                                                    {
                                                                        option.program_type
                                                                    }
                                                                </option>
                                                            )
                                                        )
                                                    ) : (
                                                        <option value="">
                                                            No membership
                                                            options available
                                                        </option>
                                                    )}
                                                </select>
                                            </div>
                                        )}
                                    </>
                                ) : mobile_no.length === 10 ||
                                  mobile_no.length === 12 ? (
                                    <div className="flex flex-wrap gap-8 md:mt-0">
                                        {/* Membership Dropdown - Only if Membership is Not Selected */}
                                        {!hasMembership && (
                                            <div className="flex flex-col items-start">
                                                <label className="text-lg font-bold flex mb-4">
                                                    Select Membership Plan
                                                </label>
                                                <select
                                                    value={
                                                        selectMembership?.id ||
                                                        "None"
                                                    }
                                                    onChange={(e) =>
                                                        handleMembershipChange(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="p-2 w-full border border-blue-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option
                                                        value="None"
                                                        className="text-blue-500"
                                                        disabled={
                                                            selectMembership?.id ===
                                                            "None"
                                                        }
                                                    >
                                                        Select a plan
                                                    </option>
                                                    {membershipOptions.length >
                                                    0 ? (
                                                        membershipOptions.map(
                                                            (option) => (
                                                                <option
                                                                    key={
                                                                        option.program_type
                                                                    }
                                                                    value={
                                                                        option.program_type
                                                                    }
                                                                >
                                                                    {
                                                                        option.program_type
                                                                    }
                                                                </option>
                                                            )
                                                        )
                                                    ) : (
                                                        <option value="">
                                                            No membership
                                                            options available
                                                        </option>
                                                    )}
                                                </select>
                                            </div>
                                        )}

                                        {/* Coupon Dropdown - Only if Coupon is Not Selected */}
                                        {!hasCoupon && (
                                            <div className="flex flex-col items-start">
                                                <label className="text-lg font-bold flex mb-4">
                                                    Select Coupons
                                                </label>
                                                <select
                                                    value={
                                                        selectCoupon?.id ||
                                                        "None"
                                                    }
                                                    onChange={(e) =>
                                                        handleCouponChange(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="p-2 w-full border border-blue-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option
                                                        value="None"
                                                        className="text-blue-500"
                                                    >
                                                        Select a Coupon
                                                    </option>
                                                    {couponOptions.map(
                                                        (coupon) => (
                                                            <option
                                                                key={coupon.id}
                                                                value={
                                                                    coupon.id
                                                                }
                                                            >
                                                                {
                                                                    coupon.coupon_name
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>

                            {/* Table for selected membership and coupons */}
                            {(selectMembership ||
                                selectedCoupons.length > 0) && (
                                <table className="lg:w-[42%] md:w-[70%] w-[76%] border border-gray-200 mt-4">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border px-4 py-2 text-center">
                                                Name
                                            </th>
                                            <th className="border px-4 py-2 text-center">
                                                Price
                                            </th>
                                            <th className="border px-4 py-2 text-center">
                                                GST
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Show Membership if selected */}
                                        {selectMembership && (
                                            <tr className="border">
                                                <td className="p-2 border text-center">
                                                    {
                                                        selectMembership.program_type
                                                    }
                                                </td>
                                                <td className="p-2 border text-center">
                                                    {selectMembership.gst ===
                                                    "Inclusive"
                                                        ? (
                                                              selectMembership.price /
                                                              1.18
                                                          ).toFixed(2)
                                                        : selectMembership.price ||
                                                          0}
                                                </td>
                                                <td className="p-2 border text-center">
                                                    <select
                                                        className="border px-2 py-1"
                                                        value={
                                                            selectMembership.gst ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleMembershipGST(
                                                                e.target.value
                                                            )
                                                        }
                                                        required
                                                    >
                                                        <option value="No GST">
                                                            No GST
                                                        </option>
                                                        <option value="Inclusive">
                                                            Inclusive
                                                        </option>
                                                        <option value="Exclusive">
                                                            Exclusive
                                                        </option>
                                                    </select>
                                                </td>
                                            </tr>
                                        )}

                                        {/* Show Coupons if selected */}
                                        {selectedCoupons.length > 0 &&
                                            selectedCoupons.map(
                                                (coupon, index) => (
                                                    <tr
                                                        key={index}
                                                        className="border"
                                                    >
                                                        <td className="p-2 border text-center">
                                                            {coupon.coupon_name}
                                                        </td>
                                                        <td className="p-2 border text-center">
                                                            {
                                                                coupon.coupon_price
                                                            }
                                                        </td>
                                                        <td className="p-2 border text-center">
                                                            <select
                                                                className="border px-2 py-1"
                                                                value={
                                                                    coupon.gst ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleCouponGSTChange(
                                                                        index,
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                required
                                                            >
                                                                <option value="No GST">
                                                                    No GST
                                                                </option>
                                                                <option value="Inclusive">
                                                                    Inclusive
                                                                </option>
                                                                <option value="Exclusive">
                                                                    Exclusive
                                                                </option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                    </tbody>
                                </table>
                            )}

                            <div className="mt-4 md:mt-0">
                                {/* Points Input Field */}
                                {userExists &&
                                    (membershipType !== "None" ||
                                        hasCoupon) && (
                                        <div className="flex items-center space-x-6">
                                            {/* Membership Points Input */}
                                            {membershipType !== "None" && membershipType !== "" && (
                                                <div className="flex flex-col">
                                                    <label
                                                        htmlFor="membershipPoints"
                                                        className="font-semibold text-lg text-black"
                                                    >
                                                        Membership Points:
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id="membershipPoints"
                                                        placeholder="Enter Points"
                                                        onChange={(e) =>
                                                            setDeductedPoints(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            )}

                                            {/* Coupon Points Input */}
                                            {hasCoupon && (
                                                <div className="flex flex-col">
                                                    <label
                                                        htmlFor="couponPoints"
                                                        className="font-semibold text-lg text-black"
                                                    >
                                                        Coupon Amount:
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id="couponPoints"
                                                        placeholder="Enter Points"
                                                        onChange={(e) =>
                                                            setValueDeductedPoints(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 mt-4">
                                    <div className="flex flex-col">
                                        <span className="font-semibold items-start flex mb-4">
                                            Mode of Payment
                                        </span>
                                        <Select
                                            isMulti
                                            options={options}
                                            className=" col-span-1 p-1 rounded-lg font-semibold placeholder-gray-400 z-0"
                                            onChange={handleSelectChange}
                                            placeholder="Select Payment Mode"
                                            required
                                        />
                                    </div>

                                    {/* <div className='form-groups'>
                    <label>Discount</label>
                    <input type="number" placeholder='Enter Discount' onChange={(e) => setDiscount(e.target.value)} />
                  </div> */}
                                    {/* Comments Section */}
                                    <div className="flex flex-col">
                                        <span className="font-semibold items-start flex mb-4">
                                            Comments
                                        </span>
                                        <input
                                            type="text"
                                            className="text-black p-2 rounded-lg  border border-gray-300 col-span-1 font-semibold placeholder-gray-400"
                                            placeholder="Enter Comments"
                                        />
                                    </div>
                                </div>
                                {/* Payment Amount Table */}
                                {Object.keys(paymentModes).length > 0 && (
                                    <div className="mt-4">
                                        <table className="sm:w-full md:w-1/3 border-collapse border border-gray-300">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border border-gray-300 p-2">
                                                        Payment Mode
                                                    </th>
                                                    <th className="border border-gray-300 p-2">
                                                        Amount
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.keys(paymentModes).map(
                                                    (mode) => (
                                                        <tr key={mode}>
                                                            <td className="border border-gray-300 p-2">
                                                                {mode}
                                                            </td>
                                                            <td className="border border-gray-300 p-2">
                                                                <input
                                                                    type="digit"
                                                                    placeholder="Enter Amount"
                                                                    value={
                                                                        paymentModes[
                                                                            mode
                                                                        ]
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleAmountChange(
                                                                            mode,
                                                                            parseFloat(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            ) ||
                                                                                0
                                                                        )
                                                                    }
                                                                    className="w-full border border-gray-300 rounded-lg p-2"
                                                                />
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-gray-100 font-semibold">
                                                    <td className="p-2 border text-left">
                                                        Total Payment
                                                    </td>
                                                    <td className="p-2 border">
                                                        {grandTotalFormatted}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>

                                        {/* Error Message if amounts don't match */}
                                        {totalPayment !== grandTotal && (
                                            <p className="text-red-500 mt-2">
                                                Error: Payment total (
                                                {totalPayment.toFixed(2)}) does
                                                not match the Grand Total (
                                                {grandTotal.toFixed(2)})!
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {isGST && (
                                <div className="gbform-group">
                                    <label
                                        htmlFor="gstNumber"
                                        style={{ marginRight: "25px" }}
                                    >
                                        GST No:
                                    </label>
                                    <input
                                        type="text"
                                        id="gb_input-field"
                                        placeholder="Enter GST Number"
                                        required
                                        onChange={(e) =>
                                            setGSTNumber(e.target.value)
                                        }
                                    />
                                </div>
                            )}
                            {showPopup && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                    <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
                                        <p className="text-gray-800 text-lg font-medium mb-4">
                                            {popupMessage}
                                        </p>
                                        <button
                                            onClick={() => setShowPopup(false)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Generate Invoice Button */}
                            <div className="button-row">
                                <button
                                    type="submit"
                                    disabled={totalPayment !== grandTotal} // Disable if totals don't match
                                    className={`mt-4 p-2 bg-blue-500 text-white rounded ${
                                        totalPayment !== grandTotal
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                    onClick={handleInvoiceSubmit}
                                >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Create Invoice"}
            </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default GenerateInvoice;
