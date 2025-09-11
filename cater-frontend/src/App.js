import React, {useEffect} from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminClients from './pages/admin/AdminClients';
import AdminBookings from './pages/admin/AdminBookings';
import AdminPayments from './pages/admin/AdminPayments';
import Menu from './pages/Menu';
import Packages from './pages/Packages';
import AdminVenue from './pages/VenueSetups';
import AdminInventory from './pages/admin/AdminInventory';
import AdminAudit from './pages/admin/AdminAudit';
import Login from './pages/Login';
import PasswordReset from './pages/PasswordReset';
import PasswordChange from "./pages/PasswordChange";
import LandingPage from './pages/LandingPage';
import PublicDetails from './pages/PublicDetails';
import LandingMenu from './pages/LandingMenu';
import LandingPackages from './pages/LandingPackages';
import Unauthorized from './pages/Unauthorized';
import ClientDetails from "./pages/admin/ClientDetails";
import BookingDetails from "./pages/BookingDetails";
import AddBooking from "./pages/admin/AddBooking";
import Edit2DSetup from "./pages/Edit2DSetup";
import View2DSetup from "./pages/View2DSetup";
import StylistDashboard from "./pages/stylist/StylistDashboard";
import CookDashboard from "./pages/cook/CookDashboard";
import Bookings from "./pages/Bookings";
import WaiterDashboard from "./pages/head waiter/WaiterDashboard";
import ClientDashboard from "./pages/client/ClientDashboard";
import axiosClient from "./axiosClient";

export default function App(){
  useEffect(() => {
    axiosClient.get('http://localhost:8000/sanctum/csrf-cookie')
      .catch(err => console.error('CSRF error', err));
  }, []);

  return(
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/password/reset" element={<PasswordReset />} />
        <Route path="/password/change" element={<PasswordChange />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing/menu" element={<LandingMenu />} />
        <Route path="/landing/packages" element={<LandingPackages />} />
        <Route path="/public/booking/:id" element={<PublicDetails />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ADMIN ONLY */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/clients"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminClients />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/clients/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ClientDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/book"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AddBooking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPayments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminInventory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/audit"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAudit />
            </ProtectedRoute>
          }
        />

        {/* ADMIN AND OTHER STAFF */}
        <Route
          path="/bookings/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'stylist', 'cook', 'head waiter', 'client']}>
              <BookingDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/menu"
          element={
            <ProtectedRoute allowedRoles={['admin', 'cook', 'client']}>
              <Menu />
            </ProtectedRoute>
          }
        />

        <Route
          path="/package"
          element={
            <ProtectedRoute allowedRoles={['admin', 'stylist', 'client']}>
              <Packages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/setup"
          element={
            <ProtectedRoute allowedRoles={['admin', 'stylist', 'head waiter']}>
              <AdminVenue />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'stylist']}>
              <Edit2DSetup />
            </ProtectedRoute>
          }
        />

        <Route
          path="/view/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'stylist', 'head waiter', 'client']}>
              <View2DSetup />
            </ProtectedRoute>
          }
        />

        {/* STYLIST ONLY */}
        <Route
          path="/stylist/dashboard"
          element={
            <ProtectedRoute allowedRoles={['stylist']}>
              <StylistDashboard />
            </ProtectedRoute>
          }
        />

        {/* COOK ONLY */}
        <Route
          path="/cook/dashboard"
          element={
            <ProtectedRoute allowedRoles={['cook']}>
              <CookDashboard />
            </ProtectedRoute>
          }
        />

        {/* WAITER ONLY */}
        <Route
          path="/waiter/dashboard"
          element={
            <ProtectedRoute allowedRoles={['head waiter']}>
              <WaiterDashboard />
            </ProtectedRoute>
          }
        />

        {/* CLIENT ONLY */}
        <Route
          path="/client/dashboard"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />

        {/* ALL OTHER ROLES ONLY */}
        <Route
          path="/assigned/bookings"
          element={
            <ProtectedRoute allowedRoles={['stylist','head waiter', 'cook', 'client']}>
              <Bookings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
