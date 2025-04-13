import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { FaPhoneAlt, FaDownload } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { FiShare2 } from "react-icons/fi";
import config from "../../config";
import Header from "./Header";
import VertNav from "./VertNav";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";

const MessageDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedTemplate = location.state;
  const [isDownloading, setIsDownloading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const phonenumber = localStorage.getItem("mobile_no");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [filter, setFilter] = useState("All");

  const customers = [
    { id: 1, name: "Promoth", phone: "+91-8148148396" },
    { id: 2, name: "Debashish", phone: "+91-8148148396" },
    { id: 3, name: "Sarthak", phone: "+91-8148148396" },
    { id: 4, name: "Karan", phone: "+91-8148148396" },
    { id: 5, name: "Tanay", phone: "+91-8148148396" },
  ];
  const handleCustomerSelection = (id) => {
    setSelectedCustomers((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  // Select/Deselect All Customers
  const toggleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]); // Deselect all
    } else {
      setSelectedCustomers(customers.map((customer) => customer.id)); // Select all
    }
  };


  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  useEffect(() => {
    if (!selectedTemplate) {
      navigate(-1);
    }
  }, [selectedTemplate, navigate]);

  const [salonDetails, setSalonDetails] = useState({
    name: "",
    logo: "",
    address: "",
    phonenumber: "",
  });


  useEffect(() => {
    setSalonDetails({
      name: localStorage.getItem("s-name") || "Salon Name",
      logo: localStorage.getItem("profile_pic") || "logo",
      address: localStorage.getItem("salonAddress") || "Street 123, Lajpat Nagar, Delhi - 10017",
      phonenumber: localStorage.getItem("mobile_no") || "1234567890",
    });
  }, []);

  const [userText, setUserText] = useState("");
  const imageRef = useRef(null);

  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`; // Max 3 lines height
    }
  }, [userText]);
  // const data = {
  //   image: selectedTemplate.image,
  //   salon_name: salonDetails.name,
  //   logo: salonDetails.logo,
  //   address: salonDetails.address,
  //   mobile_no: salonDetails.phonenumber,
  // };


  const handleDownload = async () => {
    setIsDownloading(true);


    try {
      const imageRes = await fetch(`${config.apiUrl}${selectedTemplate.image}`);
      const imageBlob = await imageRes.blob();
      const imageFile = new File([imageBlob], "template.jpg", { type: imageBlob.type });

      // Convert logo URL to File
      const logoRes = await fetch(`${config.apiUrl}${salonDetails.logo}`);
      const logoBlob = await logoRes.blob();
      const logoFile = new File([logoBlob], "logo.jpg", { type: logoBlob.type });


      // 3. Create FormData
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("logo", logoFile);
      formData.append("salon_name", salonDetails.name);
      formData.append("address", salonDetails.address);
      formData.append("mobile_no", salonDetails.phonenumber);
      formData.append("text", userText);
      console.log('formData', formData);

      const response = await axios.post(`${config.apiUrl}/merge-images/`, formData, {
        headers: {
          // 'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'template.jpg';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };


  if (!selectedTemplate) {
    return <div className="text-center text-gray-500 mt-10">No template selected.</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <VertNav />
      <div className="md:ml-[22rem] md:mr-8 ml-0 mr-0 mt-10">
        <h1 className="font-bold text-3xl">Instagram/Facebook Templates</h1>
      </div>

      <div className="flex-1 p-6 md:ml-[22rem] md:mr-8 ml-0 mr-0 mt-8 shadow-lg rounded-xl bg-white">
        <div className="flex gap-6">
          <div className="border p-2 rounded-lg relative inline-block" ref={imageRef}>
            <img src={`${config.apiUrl}${selectedTemplate.image}`} alt={selectedTemplate.title} className="w-full h-auto object-contain" />
            {userText && (
  <p
    className="text-lg font-semibold mt-2 break-words text-center whitespace-pre-wrap max-w-[600px] mx-auto"
    style={{ textAlign: 'justify', textJustify: 'inter-word' }}
  >
    {userText}
  </p>
)}
            <div className="bg-white text-sm p-3 border-t mt-2 flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center space-x-3 mb-2 md:mb-0">
                <img src={`${config.apiUrl}${salonDetails.logo}`} alt="Salon Logo" className="w-12 h-12 border-2 border-gray-400" />
                <div>
                  <p className="font-bold text-base leading-tight">{salonDetails.name}</p>
                  <p className="font-medium text-blue-500 flex items-center">
                    <FaPhoneAlt className="mr-2" />
                    {salonDetails.phonenumber}
                  </p>
                </div>
              </div>
              <div className="flex items-start md:items-center text-gray-600 text-base md:text-right md:ml-auto max-w-52">
                <MdLocationOn className="text-red-500 mr-2 mt-1 w-12 h-8" />
                <p className="font-medium break-words">{salonDetails.address}</p>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-4">{selectedTemplate.image_name} - Instagram Post</h2>
            <p className="text-base text-gray-500 mt-2">
              <span className="font-semibold">Please Note: </span>Your logo will be added when you download or share.
            </p>
            <div className="mt-4">
            <textarea
  ref={textareaRef}
  value={userText}
  onChange={(e) => {
    const input = e.target.value;
    if (input.length <= 150) {
      setUserText(input);
    }
  }}
  maxLength={150}
  rows={1}
  className="w-full rounded-lg border border-gray-300 bg-white px-5 py-3 text-base text-gray-800 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none resize-none overflow-y-auto min-h-[3.2rem] max-h-[7.5rem] transition-all duration-200 leading-[1.6] break-words"
  placeholder="Enter your text (max 150 characters)"
/>




            </div>
            <div className="flex gap-4 mt-4">
              <button
                className="bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-800 disabled:opacity-60"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <>
                    <FaDownload /> Download
                  </>
                )}
              </button>

              <button
                className="border border-blue-500 text-blue-500 px-6 py-2 rounded-lg flex items-center gap-2"
                onClick={() => setIsShareModalOpen(true)}
              >
                <FiShare2 /> Share
              </button>

            </div>
          </div>
        </div>
      </div>
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-xl shadow-xl w-80 relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
              onClick={() => setIsShareModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4 text-center">Share on</h2>
            <div className="flex justify-around">
              <button
                onClick={openModal}
                className="flex flex-col items-center gap-1 hover:scale-110 transition"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt="WhatsApp"
                  className="w-12 h-12"
                />
                <span className="text-sm">WhatsApp</span>
              </button>

              <button
                onClick={() => alert("Instagram sharing logic here")}
                className="flex flex-col items-center gap-1 hover:scale-110 transition"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                  alt="Instagram"
                  className="w-12 h-12"
                />
                <span className="text-sm">Instagram</span>
              </button>

              <button
                onClick={() => alert("Facebook sharing logic here")}
                className="flex flex-col items-center gap-1 hover:scale-110 transition"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                  alt="Facebook"
                  className="w-12 h-12"
                />
                <span className="text-sm">Facebook</span>
              </button>
            </div>

          </div>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-max p-6 relative">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xl font-bold">Customers</h2>
              <button onClick={closeModal}>
                <CloseIcon />
              </button>
            </div>
            {/* Filter Buttons */}
            <div className="flex gap-2 mt-4 overflow-auto">
              {["All", "Today's Birthdays", "Today's Anniversaries", "Inactive - last 2"].map((item) => (
                <button
                  key={item}
                  className={`px-3 py-1 text-sm rounded-md whitespace-nowrap ${filter === item ? "bg-blue-500 text-white" : "bg-gray-200"
                    }`}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Customer List (Scrollable) */}
            <div className="mt-4 max-h-60 overflow-y-auto border rounded-lg p-2">
              <label className="flex items-center gap-3 p-2 border-b">
                <input type="checkbox" onChange={toggleSelectAll} checked={selectedCustomers.length === customers.length} />
                <span className="font-semibold">Select All</span>
              </label>
              {customers.map((customer) => (
                <label key={customer.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md border-b">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => handleCustomerSelection(customer.id)}
                  />
                  <span>{customer.name} ({customer.phone})</span>
                </label>
              ))}
            </div>

            {/* Send Message Button */}
            <button className="mt-4 w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Send Message
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MessageDetails;
