import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/VertNav.css';
import {
  Storefront as StorefrontIcon,
  ShowChart as ShowChartIcon,
  Description as DescriptionIcon,
  BookOnline as BookOnlineIcon,
  CardMembership as CardMembershipIcon,
  GridViewRounded as GridViewRoundedIcon,
  SettingsSharp as SettingsSharpIcon,
  Headphones as HeadphonesIcon,
  People as PeopleIcon, // Import PeopleIcon
  EventAvailable as EventAvailableIcon // Import EventAvailableIcon
} from '@mui/icons-material';
import Logo from '../../assets/header_crm_logo.webp';

const NavItem = ({ to, icon: Icon, label, disabled, isActive, onClick }) => {
  const disabledStyle = disabled ? { pointerEvents: 'none', opacity: 0.5 } : {};

  return (
    <div className="icon-container" style={disabledStyle} title={disabled ? 'Not permitted' : ''}>
      <Link 
        to={to} 
        className={`nav-link ${isActive ? 'active' : ''}`} 
        onClick={onClick}
      >
        <Icon 
          style={{ 
            fontSize: 27, 
            margin: '5px' 
          }} 
        />
        <span className="icon-text">{label}</span>
      </Link>
    </div>
  );
};

const SupportButton = ({ sname, branchName }) => {
  return (
    <Link to={`/${sname}/${branchName}/help`} style={{ textDecoration: 'none' }}>
      <button className="nav-button" style={{ background: '#5E63661A', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '46px', borderRadius: '16px', marginRight: '10px', paddingBottom: '10px' }}>
        <HeadphonesIcon style={{ marginRight: '10px' }} />
        <span style={{ color: 'black', fontFamily: 'Inter', fontSize: '14px' }}>Help</span>
      </button>
    </Link>
  );
};

const SettingsButton = ({ userType, sname, branchName }) => {
  return (
    <>
      {(userType === 'staff' || userType === 'vendor') ? (
        <button className="nav-button" style={{ pointerEvents: 'none', opacity: 0.5, border: 'none', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '46px', borderRadius: '16px', marginRight: '10px', padding: '0 10px' }}>
          <span style={{ color: 'black', fontFamily: 'Inter', fontSize: '14px' }}>Settings</span>
        </button>
      ) : (
        <Link to={`/${sname}/${branchName}/settings`} style={{ textDecoration: 'none' }}>
          <button className="nav-button" style={{ backgroundColor: '#FFCC9133', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '46px', borderRadius: '16px', marginRight: '10px', padding: '0 10px' }}>
            <SettingsSharpIcon style={{ marginRight: '10px' }} />
            <span style={{ color: 'black', fontFamily: 'Inter', fontSize: '14px' }}>Settings</span>
          </button>
        </Link>
      )}
    </>
  );
};

const VertNav = () => {
  const [activeLink, setActiveLink] = useState('');
  const navigate = useNavigate();
  const branchName = localStorage.getItem('branch_name');
  const sname = localStorage.getItem('s-name');
  const userType = localStorage.getItem('type');

  const handleLinkClick = (link, to) => {
    setActiveLink(link);
    navigate(to);
  };

  return (
    <div className='vert_nav_main_c'>
      <img
        src={Logo}
        alt="Swalook Logo"
        className="swalook-logo"
        style={{
          width: '101px',
          height: '90px',
          marginBottom: '20px',
        }}
      />
      <div className="nav-items">
        <NavItem 
          to={`/${sname}/${branchName}/dashboard`} 
          icon={GridViewRoundedIcon} 
          label="Dashboard" 
          isActive={activeLink === 'dashboard'}
          onClick={() => handleLinkClick('dashboard', `/${sname}/${branchName}/dashboard`)}
        />
        <NavItem 
          to={`/${sname}/${branchName}/appointment`} 
          icon={BookOnlineIcon} 
          label="Appointments" 
          isActive={activeLink === 'appointments'}
          onClick={() => handleLinkClick('appointments', `/${sname}/${branchName}/appointment`)}
        />
        <NavItem 
          to={`/${sname}/${branchName}/generatebill`} 
          icon={DescriptionIcon} 
          label="Invoices" 
          isActive={activeLink === 'invoices'}
          onClick={() => handleLinkClick('invoices', `/${sname}/${branchName}/generatebill`)}
        />
        <NavItem 
          to={`/${sname}/${branchName}/analysis`} 
          icon={ShowChartIcon} 
          label="Analysis" 
          disabled={userType === 'staff'}
          isActive={activeLink === 'analysis'}
          onClick={() => handleLinkClick('analysis', `/${sname}/${branchName}/analysis`)}
        />
        <NavItem 
          to={`/${sname}/${branchName}/inventory`} 
          icon={StorefrontIcon} 
          label="Inventory" 
          disabled={userType === 'staff'}
          isActive={activeLink === 'inventory'}
          onClick={() => handleLinkClick('inventory', `/${sname}/${branchName}/inventory`)}
        />
        <NavItem 
          to={`/${sname}/${branchName}/clp`} 
          icon={CardMembershipIcon} 
          label="Customers" 
          disabled={userType === 'staff'}
          isActive={activeLink === 'customers'}
          onClick={() => handleLinkClick('customers', `/${sname}/${branchName}/clp`)}
        />
        
        {userType !== 'staff' && (
          <NavItem 
            to={`/${sname}/${branchName}/staff`} 
            icon={PeopleIcon} 
            label="Staff" 
            isActive={activeLink === 'staff'}
            onClick={() => handleLinkClick('staff', `/${sname}/${branchName}/staff`)}
          />
        )}
        <NavItem 
          to={`/${sname}/${branchName}/attendance`} 
          icon={EventAvailableIcon} 
          label="Attendance" 
          isActive={activeLink === 'attendance'}
          onClick={() => handleLinkClick('attendance', `/${sname}/${branchName}/attendance`)}
        />
      </div>
      <SupportButton sname={sname} branchName={branchName} />
      <SettingsButton userType={userType} sname={sname} branchName={branchName} />
    </div>
  );
};

export default VertNav;
