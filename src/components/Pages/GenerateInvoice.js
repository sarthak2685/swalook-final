import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/GenerateInvoice.css";
import { Multiselect } from "multiselect-react-dropdown";
import Header from "./Header";
import VertNav from "./VertNav";
import { FaTimes } from "react-icons/fa";

import { Helmet } from "react-helmet";
import config from "../../config";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import CustomDialog from "./CustomDialog";
import { Link } from "react-router-dom";

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

  const [customer_name, setCustomer_Name] = useState("");
  const [email, setEmail] = useState("");
  const [mobile_no, setMobileNo] = useState(0);
  const [address, setAddress] = useState("");
  const [GBselectedServices, GBsetSelectedServices] = useState([]);
  const [value, selectedValues] = useState([]);
  const [service_by, setServiceBy] = useState([]);
  const [staff, setStaff] = useState([]);

  const [discount, setDiscount] = useState(0);
  const [PaymentMode, setPaymentMode] = useState();
  const [isGST, setIsGST] = useState(false);
  const [gst_number, setGSTNumber] = useState("");
  const [comments, setComments] = useState("");
  const [servicesTableData, setServicesTableData] = useState([]);
  const [inputFieldValue, setInputFieldValue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasFetchedServices, setHasFetchedServices] = useState(false);
  const [hasFetchedServicesCategory, setHasFetchedServicesCategory] =
    useState(false);

  const [selectedList, setSelectedList] = useState([]); // Initialize selectedList as an empty array
  const [selectedCategoryValues, setSelectedCategoryValues] = useState([]); // Initialize selectedList as an empty array
  const [selectedCategoryList, setSelectedCategoryList] = useState([]); // Initialize selectedList as an empty array
  const [selectedServiceValues, setSelectedServiceValues] = useState([]);

  const [isServiceModalOpen, setServiceModalOpen] = useState(false);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(""); // Tracks selected service category

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

  const bid = localStorage.getItem("branch_id");
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      if (apiCalled) return; // Prevent redundant API calls

      const branchName = localStorage.getItem("branch_name");
      const token = localStorage.getItem("token");

      // Validate necessary data
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
        console.error(`API Error: ${response.status} - ${response.statusText}`);
        return;
      }

      const data = await response.json();

      // Transform and set inventory data
      const formattedData =
        data.data?.map((product) => ({
          key: product.id,
          value: product.product_name,
          unit: product.unit,
          quantity: product.stocks_in_hand,
        })) || [];

      setInventoryData(formattedData);
      setApiCalled(true); // Mark API as called
    } catch (error) {
      console.error("Error fetching inventory data:", error);
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
        console.error(`API Error: ${response.status} - ${response.statusText}`);
        return;
      }

      const data = await response.json();
      console.log("hero", data);
      const staffArray = Array.isArray(data.table_data) ? data.table_data : [];
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

  // Fetch service categories from API
  const fetchServiceCategoryData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/api/swalook/test-error/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Fetched categories and services:", data.data);

      const categories = data.data.map((category) => ({
        key: category.category || "Uncategorized",
        value: category.category || "Uncategorized",
        services: category.services || [],
      }));

      setCategoryServices(categories);
      setHasFetchedServicesCategory(true);
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };

  // Handle category click (trigger data fetching if not fetched already)
  const handleServiceCategoryClick = () => {
    if (!hasFetchedServicesCategory) {
      fetchServiceCategoryData();
    }
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

  // Fetch services from the API
  const fetchServiceData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/api/swalook/test-error/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Fetched services data:", data.data);

      const services = data.data
        .flatMap((category) => category.services)
        .map((service) => ({
          key: service.id,
          value: service.service || "Unnamed Service",
          price: service.price || 0,
          duration: service.duration || 0,
          for_men: service.for_men,
          for_women: service.for_women,
        }));

      setServiceOptions(services);
      setHasFetchedServices(true);
    } catch (error) {
      console.error("Error fetching service data:", error);
    }
  };

  useEffect(() => {
    fetchServiceData();
  }, []);

  // Handle filter change (gender-based filtering)
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  // Combine filtered services based on gender and selected categories
  const filteredServices = serviceOptions
    .filter((service) => {
      if (filter === "men" && !service.for_men) return false;
      if (filter === "women" && !service.for_women) return false;
      return true;
    })
    .filter((service) => {
      // Filter services based on selected category values
      return selectedCategoryValues.some((category) =>
        category.services.some((catService) => catService.id === service.key)
      );
    });

  // Handle service click
  const handleServiceClick = () => {
    if (!hasFetchedServices) {
      fetchServiceData();
    }
  };

  // Handle service selection
  const handleServiceSelect = (selected) => {
    // Update selected services
    setSelectedServiceValues(selected);

    // Create a new list based on the selected services, with initialized values
    const updatedServiceList = selected.map((service) => ({
      ...service, // Spread existing service details
      quantity: 1, // Initialize quantity to 1
      gst: "No GST", // Initialize GST to 'No GST'
      staff: [], // Initialize staff as an empty array
    }));

    // Update the state for the selected service list
    setSelectedList(updatedServiceList);

    console.log("Selected services:", updatedServiceList);
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

  console.log(productData);

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

  // Handle input change for quantity
  const handleInputChange = (index, value) => {
    const updatedSelectedList = [...selectedList];
    updatedSelectedList[index].quantity = value;
    setSelectedList(updatedSelectedList);
    updateServicesTableData(updatedSelectedList);
  };

  // Update service table data
  const updateServicesTableData = (updatedValues) => {
    const inputFieldValues = updatedValues.map((service) => service.quantity);
    const newTableData = updatedValues.map((service, index) => ({
      ...service,
      finalPrice:
        service.gst === "Inclusive"
          ? (service.price / 1.18).toFixed(2)
          : service.gst === "Exclusive"
          ? service.price
          : service.price,
      gst: service.gst || "", // Default to empty string if gst is not set
      inputFieldValue: inputFieldValues[index], // Store quantity in inputFieldValue
      staff: service.staff || [], // Include staff data for the service
    }));

    setServicesTableData(newTableData); // Update the services table data with the new data
  };

  console.log("Selected salon:", sname);
  console.log(staffData);

  // Handle served by (staff) selection
  const handleServedSelect = (selected, index) => {
    const updatedSelectedList = [...selectedList];
    updatedSelectedList[index].staff = selected; // Update the staff for the selected service
    setSelectedList(updatedSelectedList); // Update the selected list with the new staff
    updateServicesTableData(updatedSelectedList); // Pass the updated list to the table data update function
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

    try {
      // Fetch the InvoiceId and ensure it's valid
      const generatedInvoiceId = await fetchSpecificSerial();
      if (!generatedInvoiceId) {
        setDialogTitle("Error");
        setDialogMessage("Failed to generate Invoice ID. Please try again.");
        setDialogOpen(true);
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
        return;
      }

      // Validate services table data and product data
      if (
        servicesTableData.every(
          (service) => !service.inputFieldValue || !service.gst
        ) &&
        productData.every((product) => !product.quantity)
      ) {
        setPopupMessage(
          "Please fill the missing field"
        );
        setShowPopup(true);
        return;
      }

      // Validate services table data
      for (const service of servicesTableData) {
        if (!service.staff || service.staff.length === 0) {
          setDialogTitle("Error");
          setDialogMessage("Please select 'Served By' for all selected services!");
          setDialogOpen(true);
          return;
        }
        if (!service.inputFieldValue) {
          setDialogTitle("Error");
          setDialogMessage("Please enter quantity for selected services!");
          setDialogOpen(true);
          return;
        }
        if (!service.gst) {
          setDialogTitle("Error");
          setDialogMessage("Please select GST for all services!");
          setDialogOpen(true);
          return;
        }
      }

      // Validate product data
      for (const product of productData) {
        if (!product.quantity) {
          setDialogTitle("Error");
          setDialogMessage("Please enter quantity for selected products!");
          setDialogOpen(true);
          return;
        }
      }

      // Submit user details if they don't exist
      let submitResult = null;
      if (!userExists) {
        try {
          submitResult = await handleSubmit();
        } catch (error) {
          console.error("Error during user submission:", error);
          setDialogTitle("Error");
          setDialogMessage(
            "An error occurred while adding user details. Please try again."
          );
          setDialogOpen(true);
          return;
        }
      }

      // Navigate to the invoice page with the required data
      await Promise.all([
        submitResult, // Submit user details if needed
        navigate(`/${sname}/${branchName}/${generatedInvoiceId}/invoice`, {
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
            productData,
            deductedPoints,
            selectMembership,
            PaymentMode,
          },
        }),
      ]);
    } catch (error) {
      console.error("Error during invoice generation:", error);
      setDialogTitle("Error");
      setDialogMessage(
        "An error occurred while generating the invoice. Please try again."
      );
      setDialogOpen(true);
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
          membership: selectMembership,
          d_o_b: dateOfBirth || "",
          d_o_a: anniversaryDate || "",
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

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState(null);
  const [anniversaryDate, setAnniversaryDate] = useState(null);

  const [userExists, setUserExists] = useState(null);
  const [membershipOptions, setMembershipOptions] = useState(false);
  const [selectMembership, setSelectMembership] = useState("None");

  const [couponOptions, setCouponOptions] = useState(false);

  const [selectCoupon, setSelectCoupon] = useState("None");

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
          setCustomer_Name(userData.name || ""); // Safely assign values
          setEmail(userData.email || "");
          setCustomerData(userData);
          setUserExists(true);
          setDateOfBirth(userData.d_o_b);
          setAnniversaryDate(userData.d_o_a);
          setMembershipType(userData.membership);
          setUserPoints(userData.loyality_profile.current_customer_points);
          return;
        }
      }

      // New user (if user doesn't exist)
      resetCustomerFields();
    } catch (error) {
      console.error("Error fetching customer data:", error);
      resetCustomerFields(); // Reset fields in case of error
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

  const handleMembershipChange = async (selectMembership) => {
    console.log("swalook Membership:", selectMembership);
    setSelectMembership(selectMembership);
  };

  const handleCouponChange = async (selectCoupon) => {
    console.log("swalook coupon:", selectCoupon);
    setSelectCoupon(selectCoupon);
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
        setMembershipOptions(membershipResponse.data.data);
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

  return (
    <>
      <div className="bg-gray-100">
        <Header />
        <VertNav />
        <div className="bg-gray-100 flex-grow md:ml-72 p-10">
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
                <h2 className="text-2xl font-bold mb-4">Customer Bill Data</h2>
                {customerData ? (
                  <div className="overflow-auto">
                    <table className="table-auto w-full border border-gray-300">
                      <thead className="bg-blue-500 text-white">
                        <tr>
                          <th className="px-4 py-2">Name</th>
                          <th className="px-4 py-2">Mobile No</th>
                          <th className="px-4 py-2">Billing Amount</th>
                          <th className="px-4 py-2">Services</th>
                          <th className="px-4 py-2">Service by</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerData.previous_invoices &&
                        customerData.previous_invoices.length > 0 ? (
                          customerData.previous_invoices.map((item, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0 ? "bg-gray-100" : "bg-white"
                              }
                            >
                              <td className="border px-4 py-2">
                                {customerData.customer_name}
                              </td>
                              <td className="border px-4 py-2">
                                {customerData.customer_mobile_no}
                              </td>
                              <td className="border px-4 py-2">
                                {item.grand_total}
                              </td>

                              <td className="border px-4 py-2">
                                {JSON.parse(item.services).map(
                                  (service, idx) => (
                                    <div key={idx}>{service.Description}</div>
                                  )
                                )}
                              </td>
                              <td className="border px-4 py-2">
                                {JSON.parse(item.services).map(
                                  (service, idx) => (
                                    <div key={idx}>{service.Staff}</div>
                                  )
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center px-4 py-2">
                              No invoices available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-600">Loading data...</p>
                )}
              </div>
            </div>
          )}

          {/* Invoice Form Section */}

          <div className="bg-white shadow-md p-10 rounded-lg mb-10">
            <div className="flex flex-row justify-between mb-10">
              <h2 className="section-titles text-3xl font-bold">New Invoice</h2>
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
                <h3 className="text-xl font-bold flex">Customer Details</h3>
                <div className="gap-4 mb-4">
                  <div className="grid sm:grid-cols-2 md:grid-cols-3  mt-4">
                    <input
                      type="number"
                      className="text-[#CCCCCF] border border-[#CFD3D4] rounded-lg m-2  p-3  col-span-1 font-semibold placeholder-gray-400"
                      placeholder="Phone Number"
                      required
                      onBlur={handlePhoneBlur}
                      onChange={(e) => setMobileNo(e.target.value)}
                    />
                    <input
                      type="text"
                      className="text-[#CCCCCF] border border-[#CFD3D4] rounded-lg m-2  p-3  col-span-1 font-semibold placeholder-gray-400"
                      placeholder="Full Name"
                      value={customer_name}
                      readOnly={userExists} // Read-only for existing user
                      required
                      onChange={(e) =>
                        !userExists && setCustomer_Name(e.target.value)
                      } // Editable only for new user
                    />
                    <input
                      type="email"
                      className="text-[#CCCCCF] border border-[#CFD3D4] rounded-lg m-2  p-3  col-span-1 font-semibold placeholder-gray-400"
                      placeholder="Email Address"
                      value={email}
                      readOnly={userExists} // Read-only for existing user
                      onChange={(e) => !userExists && setEmail(e.target.value)} // Editable only for new user
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
                        className="text-[#CCCCCF] col-span-1 font-semibold placeholder-gray-400"
                        placeholder="Date of Birth"
                        value={dateOfBirth}
                        onChange={(e) =>
                          !userExists && setDateOfBirth(e.target.value)
                        } // Editable only for new user
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold items-start flex mb-4">
                        Date Of Anniversary
                      </span>
                      <input
                        type="date"
                        id="date_input_field"
                        className="text-[#CCCCCF] col-span-1 font-semibold placeholder-gray-400"
                        placeholder="Date of Anniversary"
                        value={anniversaryDate}
                        onChange={(e) =>
                          !userExists && setAnniversaryDate(e.target.value)
                        } // Editable only for new user
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-bold flex mb-4">
                  Select Services/Products:
                </h3>
                <div className="flex space-x-6">
                  <button
                    type="button"
                    className="px-6 py-2 border-2 border-blue-500 text-blue-500 font-semibold rounded-lg hover:bg-blue-500 hover:text-white transition duration-300"
                    onClick={() => setServiceModalOpen(true)}
                    required
                  >
                    Add Services
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 border-2 border-blue-500 text-blue-500 font-semibold rounded-lg hover:bg-blue-500 hover:text-white transition duration-300"
                    onClick={() => setProductModalOpen(true)}
                    required
                  >
                    Add Products
                  </button>
                </div>
                <div className="my-4" id="service-tabel">
                  {selectedList.length > 0 ? ( // Conditionally render the table
                    <table className="w-full p-4  border border-gray-200">
                      <thead>
                        <tr className="bg-gray-100 p-4">
                          <th className="border px-4 py-2">Name</th>
                          <th className="border px-4 py-2">Price</th>
                          <th className="border px-4 py-2">Quantity</th>
                          <th className="border px-4 py-2">GST</th>
                          <th className="border px-4 py-2">Staff</th>
                        </tr>
                      </thead>
                      <tbody className="text-center">
                        {selectedList.map((service, index) => (
                          <tr key={index}>
                            <td className="p-2">{service.value}</td>
                            <td>
                              {service.gst === "Inclusive" ? (
                                <>{(service.price / 1.18).toFixed(2)}</>
                              ) : service.gst === "Exclusive" ? (
                                <>{service.price}</>
                              ) : (
                                <>{service.price}</>
                              )}
                            </td>
                            <td className="p-2">
                              <input
                                type="digit"
                                className="border w-fit"
                                placeholder="Enter Quantity"
                                value={service.quantity || ""}
                                required
                                onChange={(e) =>
                                  handleInputChange(index, e.target.value)
                                }
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={service.gst || ""}
                                required
                                onChange={(e) => handleGST(e, index)}
                              >
                                <option value="">Select GST</option>
                                <option value="No GST">No GST</option>
                                <option value="Inclusive">Inclusive</option>
                                <option value="Exclusive">Exclusive</option>
                              </select>
                            </td>

                            <td className="p-2" onClick={fetchStaffData}>
                              <Multiselect
                                options={staffData} // Array of staff options
                                showSearch={true}
                                onSelect={(selected) =>
                                  handleServedSelect(selected, index)
                                }
                                onRemove={(selected) =>
                                  handleServedSelect(selected, index)
                                }
                                displayValue="label"
                                placeholder="Select Served By"
                                selectedValues={service.staff || []} // Pre-selected staff for this service
                                required
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <span></span>
                  )}
                </div>
                <div className="my-4" id="product-tabel">
                  {product_value.length > 0 ? ( // Conditionally render the products table
                    <table className="w-full border p-4 border-gray-200 mt-4">
                      <thead>
                        <tr className="bg-gray-100 p-4">
                          <th className="border px-4 py-2">Product Name</th>
                          <th className="border px-4 py-2">Quantity</th>
                          <th className="border px-4 py-2">Unit</th>
                          <th className="border px-4 py-2">Available</th>
                        </tr>
                      </thead>
                      <tbody className="text-center">
                        {product_value.map((product, index) => (
                          <tr key={index}>
                            <td>{product.value}</td>
                            <td>
                              <input
                                type="digit"
                                className="gb_service-table-field m-2"
                                placeholder="Enter Quantity"
                                required
                                onChange={(e) =>
                                  handleProductInputChange(
                                    index,
                                    e.target.value
                                  )
                                }
                                style={{
                                  borderColor:
                                    product.quantity === "" ||
                                    product.quantity === "0"
                                      ? "red"
                                      : "black", // Highlight empty or invalid inputs
                                }}
                              />
                            </td>
                            <td>{product.unit}</td>
                            <td>{product.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <span></span>
                  )}
                </div>

                {/* Service Modal */}
                {isServiceModalOpen && (
                  <div className="fixed inset-0 bg-black m-4 md:mr-20 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-6 w-3/4 max-w-lg">
                      <div
                        ref={modalRef}
                        className="bg-white rounded-lg p-6 w-full"
                      >
                        <h3 className="text-lg font-bold mb-4">
                          Select Services
                        </h3>

                        {/* Category Selection */}
                        {/* <div
                        className="mb-4"
                        onClick={handleServiceCategoryClick}
                      >
                        <Multiselect
                          options={categoryServices}
                          showSearch={true}
                          onSelect={handleCategorySelect}
                          onRemove={handleCategorySelect}
                          displayValue="value"
                          placeholder="Select Category"
                          showCheckbox={true}
                          selectedValues={selectedCategoryValues}
                          className="mb-2"
                        />
                      </div> */}

                        {/* Gender Selection */}
                        {/* <div className="flex flex-row items-center font-semibold m-2 gap-4">
                        <label className="flex flex-row gap-4">
                          <input
                            type="checkbox"
                            value="men"
                            onChange={handleFilterChange}
                          />
                          Men
                        </label>
                        <label className="flex flex-row gap-4">
                          <input
                            type="checkbox"
                            value="women"
                            onChange={handleFilterChange}
                          />
                          Women
                        </label> */}
                        {/* </div> */}

                        {/* Service Selection */}
                        <div className="mb-4" onClick={handleServiceClick}>
                          <Multiselect
                            // options={filteredServices}
                            options={serviceOptions}
                            showSearch={true}
                            onSelect={handleServiceSelect}
                            onRemove={handleServiceSelect}
                            displayValue="value"
                            placeholder="Select Service"
                            showCheckbox={true}
                            selectedValues={selectedServiceValues}
                            required
                          />
                        </div>

                        {/* <table className="w-full p-4 border border-gray-200">
                          <thead>
                            <tr className="bg-gray-100 p-4">
                              <th className="border px-4 py-2">Name</th>
                              <th className="border px-4 py-2">Price</th>
                              <th className="border px-4 py-2">Quantity</th>
                              <th className="border px-4 py-2">GST</th>
                              <th className="border px-4 py-2">Staff</th>
                            </tr>
                          </thead>
                          <tbody className="text-center">
                            {selectedList.map((service, index) => (
                              <tr key={index}>
                                <td className="p-2">{service.value}</td>
                                <td>
                                  {service.gst === "Inclusive" ? (
                                    <>{(service.price / 1.18).toFixed(2)}</>
                                  ) : service.gst === "Exclusive" ? (
                                    <>{service.price}</>
                                  ) : (
                                    <>{service.price}</>
                                  )}
                                </td>
                                <td className="p-2">
                                  <input
                                    type="digit"
                                    className="border w-fit"
                                    placeholder="Enter Quantity"
                                    value={service.quantity || ""}
                                    required
                                    onChange={(e) =>
                                      handleInputChange(index, e.target.value)
                                    }
                                  />
                                </td>
                                <td className="p-2">
                                  <select
                                    value={service.gst || ""}
                                    required
                                    onChange={(e) => handleGST(e, index)}
                                  >
                                    <option value="">Select GST</option>
                                    <option value="No GST">No GST</option>
                                    <option value="Inclusive">Inclusive</option>
                                    <option value="Exclusive">Exclusive</option>
                                  </select>
                                </td>

                                <td className="p-2" onClick={fetchStaffData}>
                                  <Multiselect
                                    options={staffData} // Array of staff options
                                    showSearch={true}
                                    onSelect={(selected) =>
                                      handleServedSelect(selected, index)
                                    }
                                    onRemove={(selected) =>
                                      handleServedSelect(selected, index)
                                    }
                                    displayValue="label"
                                    placeholder="Select Served By"
                                    selectedValues={service.staff || []} // Pre-selected staff for this service
                                    required
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table> */}

                        <div className="flex justify-end mt-4">
                          <button
                            type="button"
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                            onClick={handleService_Select}
                          >
                            Add Services
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Product Modal */}
                {isProductModalOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div
                      ref={modalRef}
                      className="bg-white rounded-lg p-6 w-3/4 max-w-lg"
                    >
                      <h3 className="text-lg font-bold mb-4">
                        Select Products
                      </h3>

                      {/* Multiselect for Products */}
                      <div onClick={fetchData}>
                        <Multiselect
                          options={inventoryData}
                          showSearch={true}
                          onSelect={handleProductSelect}
                          onRemove={handleProductSelect}
                          displayValue="value"
                          placeholder="Select Product"
                          showCheckbox={true}
                          selectedValues={product_value}
                          className="sar-product"
                        />
                      </div>

                      {/* Product Table
                      <table className="w-full border border-gray-200 mt-4">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border px-4 py-2">Product Name</th>
                            <th className="border px-4 py-2">Quantity</th>
                            <th className="border px-4 py-2">Unit</th>
                            <th className="border px-4 py-2">Available</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product_value.map((product, index) => (
                            <tr key={index}>
                              <td>{product.value}</td>
                              <td>
                                <input
                                  type="digit"
                                  className="gb_service-table-field m-2"
                                  placeholder="Enter Quantity"
                                  required
                                  onChange={(e) =>
                                    handleProductInputChange(
                                      index,
                                      e.target.value
                                    )
                                  }
                                  style={{
                                    borderColor:
                                      product.quantity === "" ||
                                      product.quantity === "0"
                                        ? "red"
                                        : "black", // Highlight empty or invalid inputs
                                  }}
                                />
                              </td>
                              <td>{product.unit}</td>
                              <td>{product.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table> */}

                      {/* Add Product Button */}
                      <div className="flex justify-end mt-4">
                        <button
                          type="button"
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                          onClick={handleProduct_Select} // Handle adding products logic
                        >
                          Add Products
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* {userExists && membershipType !== "None" ? (
                <div className="gb_services-table">
                  <table
                    className="gb_services-table-content"
                    id="membership_points"
                  >
                    <thead>
                      <tr>
                        <th>Membership Type</th>
                        <th>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{membershipType}</td>
                        <td>{userPoints}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : mobile_no.length === 10 || mobile_no.length === 12 ? (
                <div className="flex flex-wrap gap-8">
                  <div className="flex flex-col items-start">
                    <label className="text-lg  font-bold flex mb-4">
                      Select Membership Plan
                    </label>
                    <select
                      value={selectMembership || "None"}
                      onChange={(e) => handleMembershipChange(e.target.value)}
                      className="p-4 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option
                        value="None"
                        disabled={selectMembership === "None"}
                      >
                        Select a plan
                      </option>
                      {membershipOptions.length > 0 ? (
                        membershipOptions.map((option) => (
                          <option
                            key={option.program_type}
                            value={option.program_type}
                          >
                            {option.program_type}
                          </option>
                        ))
                      ) : (
                        <option value="">
                          No membership options available
                        </option>
                      )}
                    </select>
                  </div>
                  <div className="flex flex-col items-start">
                    <label className="text-lg items-start font-bold flex mb-4">
                      Select Coupons
                    </label>
                    <select
                      value={selectCoupon || "None"}
                      onChange={(e) => handleCouponChange(e.target.value)}
                      className="p-4 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="None" disabled={selectCoupon === "None"}>
                        Select a Coupon
                      </option>
                    </select>
                  </div>
                </div>
              ) : null} */}

              <div>
                {/* Points Input Field */}
                {/* {membershipStatus && (
                  <div className="gbform-group">
                    <label htmlFor="points">Points:</label>
                    <input
                      type="number"
                      id="gb_input-field"
                      placeholder="Enter Points"
                      onChange={(e) => setDeductedPoints(e.target.value)}
                    />
                  </div>
                )} */}
                <div className="form-row">
                  <div className="form-groups ">
                    <label>Mode of Payment</label>
                    <select
                      className="p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => setPaymentMode(e.target.value)}
                      required
                    >
                      <option value="">Select Payment Mode</option>
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                      <option value="net_banking">Net Banking</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {/* <div className='form-groups'>
                    <label>Discount</label>
                    <input type="number" placeholder='Enter Discount' onChange={(e) => setDiscount(e.target.value)} />
                  </div> */}
                  <div className="form-groups">
                    <label>Comments</label>
                    <input
                      type="text"
                      className="text-[#CCCCCF] border border-[#CFD3D4] rounded-lg p-3 font-semibold placeholder-gray-400"
                      placeholder="Enter Comments"
                      onChange={(e) => setComments(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {isGST && (
                <div className="gbform-group">
                  <label htmlFor="gstNumber" style={{ marginRight: "25px" }}>
                    GST No:
                  </label>
                  <input
                    type="text"
                    id="gb_input-field"
                    placeholder="Enter GST Number"
                    required
                    onChange={(e) => setGSTNumber(e.target.value)}
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
                  className="w-auto p-3 bg-[#3a6eff] text-white text-lg font-bold rounded-lg cursor-pointer mt-4"
                >
                  Create Invoice
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
