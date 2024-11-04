import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import OwnerLogin from './components/Pages/OwnerLogin';
import Login from './components/Pages/Login';
import AdminLogin from './components/Pages/AdminLogin';
import ServiceDetails from './components/Pages/ServiceDetails';
import AdminDashboard from './components/Pages/AdminDashboard';
import Settings from './components/Pages/Settings';
import PersonalInformation from './components/Pages/PersonalInformation';
import Appointment from './components/Pages/Appointment';
import GenerateInvoice from './components/Pages/GenerateInvoice';
import Invoice from './components/Pages/Invoice';
import ForgetPassword from './components/Pages/ForgetPassword';
import ViewInvoice from './components/Pages/ViewInvoice';
import Branch from './components/Pages/Branch';
import PrivateRoute from './utils/PrivateRoute';
import OwnerDashboard from './components/Pages/OwnerDashboard';
import ErrorPage from './components/Pages/ErrorPage';
import GlobalErrorPage from './components/Pages/GlobalErrorPage';
import BusinessAnalysis from './components/Pages/BusinessAnalysis';
import Help from './components/Pages/Help';
import AppointAsInv from './components/Pages/AppointAsInv';
import Inventory from './components/Pages/Inventory';
import CLP_Setting from './components/Pages/CLP_Setting';
import CustomerL from './components/Pages/CustomerL';
import StaffManagement from './components/Pages/StaffManagement';
import AdminManagement from './components/Pages/AdminManagement';
import StaffSetting from './components/Pages/StaffSetting';
import "./index.css"; // Assuming you have global styles

function App() {
  const isLoggedIn = Cookies.get('loggedIn') === 'true';
  const salonName = Cookies.get('salonName');

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<OwnerLogin />} />
          <Route path="/forgetpassword" element={<ForgetPassword />} />
          
          <Route element={<PrivateRoute />}>
            <Route path="/:salon_name" element={<Branch />} />
            <Route path="/:salon_name/owner" element={<OwnerDashboard />} />
            <Route path="/:salon_name/:branchName/dashboard" element={<AdminDashboard />} />
            <Route path="/:salon_name/:branchName/service" element={<ServiceDetails />} />
            <Route path="/:salon_name/:branchName/settings" element={<Settings />} />
            <Route path="/:salon_name/:branchName/appointment" element={<Appointment />} />
            <Route path="/:salon_name/:branchName/settings/personalInformation" element={<PersonalInformation />} />
            <Route path="/:salon_name/:branchName/generatebill" element={<GenerateInvoice />} />
            <Route path="/:salon_name/:branchName/:slno/invoice" element={<Invoice />} />
            <Route path="/:salon_name/:branchName/viewinvoice/:id" element={<ViewInvoice />} />
            <Route path="/:salon_name/:branchName/analysis" element={<BusinessAnalysis />} />
            <Route path="/:salon_name/:branchName/help" element={<Help />} />
            <Route path="/:salon_name/:branchName/generatebil" element={<AppointAsInv />} />
            <Route path="/:salon_name/:branchName/inventory" element={<Inventory />} />
            <Route path="/:salon_name/:branchName/settings/clpsetting" element={<CLP_Setting />} />
            <Route path="/:salon_name/:branchName/clp" element={<CustomerL />} />
            <Route path="/:salon_name/:branchName/attendance" element={<StaffManagement />} />
            <Route path="/:salon_name/:branchName/staff" element={<AdminManagement />} />
            <Route path="/:salon_name/:branchName/staffSettings" element={<StaffSetting />} />
          </Route>
          
          <Route path="*" element={<ErrorPage />} />
          <Route path="/error" element={<GlobalErrorPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
