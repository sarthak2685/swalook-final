import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import Cookies from 'js-cookie';
import VertNav from './VertNav'; // Assuming VertNav is in the same directory
import Logo from '../../assets/header_crm_logo.webp';

function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar state
  const dropdownRef = useRef();
  const navigate = useNavigate();

  const userType = localStorage.getItem('type');
  const sname = localStorage.getItem('s-name');
  const branchName = localStorage.getItem('branch_name');

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove('loggedIn');
    Cookies.remove('type');
    Cookies.remove('salonName');
    Cookies.remove('branch_n');
    Cookies.remove('salon-name');
    navigate("/"); // Redirect to home or login page
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(prevState => !prevState); // Correctly toggles the sidebar state
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className={`relative top-0 left-0 z-10 lg:z-0 w-auto h-[95px] bg-white shadow-md flex justify-between items-center px-5 transition-all duration-300 ${sidebarOpen ? 'ml-[296px]' : ''}`}>
        <div className="flex items-start">
          {/* Hamburger Icon for Mobile */}
          <button onClick={toggleSidebar} className="lg:hidden p-2 md:hidden block bg-white -ml-12">
            <MenuIcon className="text-gray-600  hidden sm:block" style={{ fontSize: 30 }} />
          </button>
          {/* <img
            src={Logo}
            alt="Swalook Logo"
            className="swalook-logo w-16 h-16 sm:w-20 sm:h-20 mx-5 block md:hidden lg:hidden"
          /> */}
        </div>

        {/* Profile Icon Always Visible */}
        <div className="flex items-center gap-4 mr-4">
          <div className="relative cursor-pointer" onClick={toggleDropdown}>
            
            {profileImage ? (
              <img src={URL.createObjectURL(profileImage)} alt="Profile" className="w-16 h-16 sm:w-16 sm:h-16 rounded-full object-cover" />
            ) : (
              <AccountCircleIcon 
                className="text-gray-500" 
                fontSize="large" // or "small", "medium", "inherit"
                style={{ width: '55px', height: '55px' }} // Inline styles to ensure exact size
              />            )}
            <div className="absolute right-0 z-40 bottom-0 w-2.5 h-2.5 border-t-2 border-l-2 border-transparent border-t-black"></div>
            {showDropdown && (
              <div className="absolute top-full right-0 w-48 bg-whitesmoke rounded-lg shadow-lg flex flex-col p-2 z-20" ref={dropdownRef}>
                {userType === 'staff' || userType === 'vendor' ? (
                  <button className="text-gray-500 font-semibold px-4 py-2 cursor-not-allowed opacity-50">
                    <span>Service</span>
                  </button>
                ) : (
                  <Link to={`/${sname}/${branchName}/service`} className="text-gray-500 px-4 py-2 hover:bg-gray-300 font-semibold">
                    <span>Service</span>
                  </Link>
                )}
                <div className="text-gray-500 px-4 py-2 cursor-pointer hover:bg-gray-300 font-semibold" onClick={handleLogout}>
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar Component */}
      <VertNav sidebarOpen={sidebarOpen} />
    </>
  );
}

export default Header;
