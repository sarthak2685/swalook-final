import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Multiselect from "multiselect-react-dropdown";
import Header from "./Header";
import VertNav from "./VertNav";
import { FaTimes } from "react-icons/fa";
import AdminPanelSettingsIcon from "@mui/icons-material/PeopleOutlined";
import Popup from "./Popup";
import { Helmet } from "react-helmet";
import config from "../../config";
import CircularProgress from "@mui/material/CircularProgress";
import CustomDialog from "./CustomDialog";

function getCurrentDate() {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear().toString().slice(-2);
  return `${day}/${month}/${year}`;
}

function Appointment() {
  const [services, setServices] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState(""); // Time format: HH:MM AM/PM
  const [selectedHour, setSelectedHour] = useState(""); // New state for selected hour
  const [selectedMinute, setSelectedMinute] = useState("00"); // New state for selected minute
  const [selectedAMPM, setSelectedAMPM] = useState("");
  const [presetAppointments, setPresetAppointments] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookAppointment, setBookAppointment] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState(null);
  const sname = localStorage.getItem("sname");
  const branchName = localStorage.getItem("branch_name");
  const [staffData, setStaffData] = useState("");
  const [service_by, setServiceBy] = useState([]);
  const [userExists, setUserExists] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [api, setAPI] = useState(null);
  const [hasFetchedServices, setHasFetchedServices] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [anniversaryDate, setAnniversaryDate] = useState(null);
  const [isServiceModalOpen, setServiceModalOpen] = useState(false);
  const [servicesTableData, setServicesTableData] = useState([]);
  const [appointment, setAppointment] = useState([]);
  const [categoryServices, setCategoryServices] = useState([]);
  const [hasFetchedServicesCategory, setHasFetchedServicesCategory] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState([]);
  const [selectedList, setSelectedList] = useState([]);
  const [selectedServiceValues, setSelectedServiceValues] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [apiCalled, setApiCalled] = useState(false);

  const currentDate = getCurrentDate();
  const bid = localStorage.getItem("branch_id");
  const navigate = useNavigate();

  // Update appointment state when services change
  useEffect(() => {
    const newAppointment = [
      ...services.map((service) => ({
        name: service.name,
        category: service.category,
        price: service.price,
        staff: service.service_by,
      })),
    ];
    setAppointment(newAppointment);
  }, [services]);

  console.log("appointment", appointment);
  // Fetch staff data
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
        ? staffData.table_data.map((staff) => staff.staff_name)
        : [];

      console.log("staffArray", staffArray);

      // Convert the array to a comma-separated string
      const staffString = staffArray.join(", ");
      setStaffData(staffString);
    } catch (error) {
      console.error("Error fetching staff data:", error);
      setStaffData(""); // maintain as string
    }
  };

  // Handle time change
  const handleTimeChange = (event) => {
    const { id, value } = event.target;

    switch (id) {
      case "hours":
        setSelectedHour(value);
        setBookingTime(`${value || ""}:${selectedMinute} ${selectedAMPM}`);
        break;
      case "minutes":
        setSelectedMinute(value);
        setBookingTime(`${selectedHour}:${value || "00"} ${selectedAMPM}`);
        break;
      case "am_pm":
        setSelectedAMPM(value || "");
        setBookingTime(`${selectedHour}:${selectedMinute} ${value || ""}`);
        break;
      default:
        break;
    }
  };

  // Handle adding an appointment
  const handleAddAppointment = async (e) => {
    e.preventDefault();
    setBookAppointment(true);

    let errorMessage = "Please fix the following issues:\n";
    if (services.length === 0)
      errorMessage += " - Select at least one service.\n";

    if (!bookingTime) errorMessage += " - Select a time.\n";
    if (!bookingDate) errorMessage += " - Select a date.\n";
    if (!/^(\+91)?[0-9]{10}$/.test(mobileNo))
      errorMessage += " - Enter a valid mobile number.\n";

    if (errorMessage !== "Please fix the following issues:\n") {
      setDialogTitle("Error");
      setDialogMessage(errorMessage);
      setDialogOpen(true);
      setBookAppointment(false);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/swalook/appointment/?branch_name=${bid}`,
        {
          customer_name: customerName,
          mobile_no: mobileNo,
          email: email,
          d_o_b: dateOfBirth || "",
          d_o_a: anniversaryDate || "",
          service_by: service_by,
          services: JSON.stringify(appointment),
          booking_time: bookingTime,
          booking_date: bookingDate,
          comment: comments,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setPopupMessage("Appointment added successfully!");
        setShowPopup(true);
        const phoneNumber = `+91${mobileNo}`;
        const serviceNames = services.map((service) => service.name).join(", ");
        const message = `Hi ${customerName}!\nYour appointment is booked for: ${bookingTime} | ${bookingDate}\nServices: ${serviceNames}\nSee you soon!`;
        const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
          message
        )}`;
        window.open(whatsappLink, "_blank");
      }
    } catch (error) {
      const errorMessage = error.response
        ? error.response.data.message
        : error.message;
      setPopupMessage(`Failed to add appointment: ${errorMessage}`);
      setShowPopup(true);
      console.error("Failed to add appointment:", error);
    } finally {
      setBookAppointment(false);
    }
  };

  // Handle phone number blur to fetch customer data
  const handlePhoneBlur = async () => {
    try {
      const branchName = localStorage.getItem("branch_id");

      const response = await axios.get(
        `${config.apiUrl}/api/swalook/loyality_program/customer/?branch_name=${branchName}`,
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status) {
        const userDetailsResponse = await axios.get(
          `${config.apiUrl}/api/swalook/loyality_program/customer/get_details/?branch_name=${branchName}&mobile_no=${mobileNo}`,
          {
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        const userDataArray = userDetailsResponse.data.data;
        if (Array.isArray(userDataArray) && userDataArray.length > 0) {
          const userData = userDataArray[0];
          setUserExists(true);
          setCustomerName(userData.name || "");
          setEmail(userData.email || "");
          setCustomerData(userData);
          setDateOfBirth(userData.d_o_b);
          setAnniversaryDate(userData.d_o_a);
        }
      } else {
        setUserExists(false);
      }
    } catch (error) {
      console.error("Error checking membership status:", error);
    }
  };

  // Fetch customer data when mobile number changes
  useEffect(() => {
    if (mobileNo.length === 10) {
      const timeoutId = setTimeout(() => {
        fetchCustomerData();
      }, 500); // Debounce time

      return () => clearTimeout(timeoutId);
    }
  }, [mobileNo]);
  useEffect(() => {
    if (mobileNo.length === 10) {
      handlePhoneBlur();
    }
  }, [mobileNo]);

  const fetchCustomerData = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${config.apiUrl}/api/swalook/get-customer-bill-app-data/?mobile_no=${mobileNo}&branch_name=${bid}`,
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

  // Handle service selection
  const handleServiceSelect = (selected) => {
    setSelectedServiceValues(selected);
    const updatedServiceList = selected.map((service) => ({
      ...service,
      staff: service.staff || [],
      note: service.note || "No notes added",
      category: service.category,
    }));
    setSelectedList(updatedServiceList);
  };

  // Finalize service selection
  const finalizeSelection = () => {
    setServices(selectedList); // Correcting the variable
    console.log("Selected Services:", selectedList);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `${config.apiUrl}/api/swalook/delete/appointment/?id=${deleteInvoiceId}&branch_name=${bid}`,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      window.location.reload();
    } catch (error) {
      console.error("Error deleting appointment:", error);
    } finally {
      setShowDeletePopup(false);
    }
  };

  // Handle view details click
  const handleViewDetailsClick = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${config.apiUrl}/api/swalook/get-customer-bill-app-data/?mobile_no=${mobileNo}&branch_name=${bid}`,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setCustomerData(response.data);
      console.log("User data:", response.data);

      setIsPopupVisible(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Handle close popup
  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };

  // Fetch service category data
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
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.status || !Array.isArray(result.data)) {
        throw new Error("Invalid API response format");
      }

      // Transform API response into a structured category-service map
      const categoryMap = new Map();

      result.data.forEach((service) => {
        const categoryName =
          service.category_details?.service_category || "Uncategorized";

        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, {
            key: categoryName,
            value: categoryName,
            services: [],
          });
        }

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
          category: categoryName,
        });
      });

      const categories = Array.from(categoryMap.values());
      setCategoryServices(categories);
      setHasFetchedServicesCategory(true);
    } catch (error) {
      console.error("Error fetching categories:", error.message);
    }
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

  // Filtered categories based on search and gender filter
  const filteredCategories = categoryServices.filter(
    (category) =>
      category.value?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.services.some((service) =>
        service.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Toggle service selection
  const toggleServiceSelection = (service) => {
    if (selectedList.some((s) => s.id === service.id)) {
      handleServiceSelect(selectedList.filter((s) => s.id !== service.id));
    } else {
      handleServiceSelect([...selectedList, service]);
    }
  };

  // Handle dropdown click
  const handleDropdownClick = () => {
    if (!apiCalled) {
      fetchStaffData();
      setApiCalled(true);
    }
  };
  const handleAllAppointment = (id) => {
    navigate(`/${sname}/${branchName}/view-all-Appointments`);
  };

  return (
    <>
      <div className="bg-gray-100">
        <Header />
        <VertNav />
        <div className=" bg-gray-100 flex-grow md:ml-72 p-10">
          {userExists ? (
            <div className="bg-white shadow-md px-4 py-8 mb-10 rounded-lg  grid grid-cols-1 md:grid-cols-4 gap-4">
              {customerId && (
                <>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 text-xl">
                      Business
                    </div>
                    <div className="text-2xl font-bold text-blue-500">
                      Rs. {customerId.total_billing_amount}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 text-xl">
                      Number of Appointments
                    </div>
                    <div className="text-2xl font-bold text-blue-500">
                      {customerId.total_appointment}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 text-xl">
                      Number of Invoices
                    </div>
                    <div className="text-2xl font-bold text-blue-500">
                      {customerId.total_invoices}
                    </div>
                  </div>
                  <div className="text-center p-4   flex items-center justify-center">
                    <button
                      className="text-blue-500 hover:cursor-pointer hover:underline"
                      onClick={handleViewDetailsClick}
                    >
                      View Details
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : null}

          {isPopupVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-4/5 md:w-1/2">
                <div className="flex flex-row justify-between mb-4">
                  <h2 className="text-2xl font-bold">
                    Customer Appointment Data
                  </h2>
                  <button
                    onClick={handleClosePopup}
                    className="bg-red-500 text-white border-0 py-1 px-5 rounded-full cursor-pointer"
                  >
                    <FaTimes className="text-2xl" />
                  </button>
                </div>
                {customerData ? (
                  <div className="overflow-auto">
                    <table className="table-auto w-full border border-gray-300">
                      <thead className="bg-blue-500 text-white">
                        <tr>
                          <th className="px-4 py-2">Name</th>
                          <th className="px-4 py-2">Mobile No</th>
                          <th className="px-4 py-2">Time</th>
                          <th className="px-4 py-2">Date</th>
                          <th className="px-4 py-2">Services</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerData.previous_appointments &&
                        customerData.previous_appointments.length > 0 ? (
                          customerData.previous_appointments.map(
                            (item, index) => (
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
                                  {item.time}
                                </td>
                                <td className="border px-4 py-2">
                                  {item.Date}
                                </td>
                                <td className="border px-4 py-2">
                                  {(() => {
                                    try {
                                      const services = JSON.parse(
                                        item.services
                                      );
                                      return services.map((service, idx) => (
                                        <div key={idx}>
                                          {service.Description}
                                        </div>
                                      ));
                                    } catch (error) {
                                      return <div>{item.services}</div>;
                                    }
                                  })()}
                                </td>
                              </tr>
                            )
                          )
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center px-4 py-2">
                              No appointments available
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

          {/* Appointment Form Section */}

          <div className=" bg-white rounded-lg shadow-md p-10 mb-10">
            <div className="flex flex-row justify-between">
              <h2 className="appnt-heading font-bold text-2xl">Appointment</h2>
              <button
                onClick={handleAllAppointment}
                className="text-blue-500 hover:cursor-pointer hover:underline"
              >
                View all Appointments
              </button>
            </div>
            <form
              onSubmit={handleAddAppointment}
              className="flex flex-col gap-6"
            >
              <div className="mt-8">
                <label className="text-xl font-bold text-start">
                  Customer Details:
                </label>
                <div className="gap-4 mb-4">
                  <div className="grid sm:grid-cols-2 md:grid-cols-3  mt-4">
                    <input
                      type="number"
                      className="text-black border border-[#CFD3D4] rounded-lg m-2  p-3  col-span-1 font-semibold placeholder-gray-400"
                      placeholder="Phone Number"
                      required
                      // onBlur={handlePhoneBlur}
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
                      className="text-black border border-[#CFD3D4] rounded-lg m-2  p-3  col-span-1 font-semibold placeholder-gray-400"
                      placeholder="Full Name"
                      value={customerName}
                      required
                      onChange={(e) =>
                        setCustomerName(e.target.value)
                      } // Editable only for new user
                    />
                    <input
                      type="email"
                      className="text-black border border-[#CFD3D4] rounded-lg m-2  p-3  col-span-1 font-semibold placeholder-gray-400"
                      placeholder="Email Address"
                      value={email}
                      readOnly={userExists} // Read-only for existing user
                      onChange={(e) => setEmail(e.target.value)} // Editable only for new user
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
                        max={new Date().toISOString().split('T')[0]}
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
                        className="text-black col-span-1 font-semibold placeholder-gray-400"
                        max={new Date().toISOString().split('T')[0]}
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
                  Select Services:
                </h3>
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
                        onClick={() => setServiceModalOpen(false)}
                      />
                    </div>

                    {/* Header Section */}
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                      <h3 className="text-2xl font-bold">Select Services</h3>
                      <input
                        type="text"
                        placeholder="Search services or categories..."
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/3"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Gender Filter */}
                    <div className="flex mb-4 items-center gap-4">
                      {["Male", "Female"].map((gender) => (
                        <label key={gender} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={genderFilter.includes(gender)}
                            onChange={(e) =>
                              handleGenderFilterToggle(gender, e.target.checked)
                            }
                            className="h-4 w-4"
                          />
                          <span>{gender}</span>
                        </label>
                      ))}
                    </div>

                    {/* Service Categories Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredCategories.map((category) => (
                        <div
                          key={category.key}
                          className="bg-gray-100 p-4 rounded-lg border"
                        >
                          <h4 className="text-lg font-semibold mb-4">
                            {category.value}
                          </h4>
                          <ul className="space-y-2">
                            {category.services
                              .filter((service) => {
                                // Show all if no filter is applied
                                if (genderFilter.length === 0) return true;

                                // Show services based on gender selection
                                if (
                                  genderFilter.includes("Male") &&
                                  genderFilter.includes("Female")
                                ) {
                                  return true; // Show all if both are selected
                                } else if (genderFilter.includes("Male")) {
                                  return service.for_men;
                                } else if (genderFilter.includes("Female")) {
                                  return service.for_women;
                                }

                                return false;
                              })
                              .map((service) => (
                                <li
                                  key={service.id}
                                  className="flex items-center justify-between"
                                >
                                  <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="flex gap-4">
                                      <input
                                        type="checkbox"
                                        checked={selectedList.some(
                                          (s) => s.id === service.id
                                        )}
                                        onChange={() =>
                                          toggleServiceSelection(service)
                                        }
                                        className="h-4 w-4"
                                      />
                                      <p className="font-medium">
                                        {service.name}
                                      </p>
                                    </div>
                                  </label>
                                  <p className="text-base font-semibold text-gray-700">
                                    ₹{service.price}
                                  </p>
                                </li>
                              ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-t mt-4">
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-semibold">
                          Selected:{" "}
                          {selectedList.map((s) => s.name).join(", ") || "None"}
                        </p>
                        <button
                          type="button"
                          className="bg-blue-500 text-white px-6 py-2 rounded-lg"
                          onClick={() => {
                            finalizeSelection(selectedList);
                            setServiceModalOpen(false);
                          }}
                        >
                          Add Service
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-lg text-start font-bold text-gray-800 mb-4 block">
                  To be Served by:
                </label>
                <select
                  onClick={handleDropdownClick}
                  onChange={(e) => setServiceBy(e.target.value)}
                  className="sm:w-full md:w-1/4 p-2 border border-gray-300 rounded-lg"
                >
                  <option value="" disabled selected>
                    Select Served By
                  </option>
                  {staffData.split(", ").map((staff, index) => (
                    <option key={index} value={staff}>
                      {staff}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-lg text-start font-bold text-gray-800 mb-4 block">
                  Schedule:
                </label>
                <div className="flex flex-wrap gap-4">
                  <input
                    type="date"
                    id="date"
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <select
                    id="hours"
                    onChange={handleTimeChange}
                    value={selectedHour}
                    className="p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="" disabled>
                      Select Hour
                    </option>
                    {[...Array(12).keys()].map((hour) => (
                      <option key={hour + 1} value={hour + 1}>
                        {hour + 1}
                      </option>
                    ))}
                  </select>
                  <select
                    id="minutes"
                    onChange={handleTimeChange}
                    value={selectedMinute}
                    className="p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="" disabled>
                      Select Minutes
                    </option>
                    {["00", "15", "30", "45"].map((minute) => (
                      <option key={minute} value={minute}>
                        {minute}
                      </option>
                    ))}
                  </select>
                  <select
                    id="am_pm"
                    onChange={handleTimeChange}
                    value={selectedAMPM}
                    className="p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="" disabled>
                      Select AM/PM
                    </option>
                    {["AM", "PM"].map((ampm) => (
                      <option key={ampm} value={ampm}>
                        {ampm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-lg text-start font-bold text-gray-800 mb-4 block">
                  Comments:
                </label>
                <input
                  type="text"
                  placeholder="Comments"
                  onChange={(e) => setComments(e.target.value)}
                  className="sm:w-full md:w-1/4 h-10 p-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
                  disabled={bookAppointment}
                >
                  {bookAppointment ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Create Appointment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Appointment;
