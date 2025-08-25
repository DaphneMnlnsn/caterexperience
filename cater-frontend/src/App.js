import React from "react";
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
import Unauthorized from './pages/Unauthorized';
import ClientDetails from "./pages/admin/ClientDetails";
import BookingDetails from "./pages/BookingDetails";
import AddBooking from "./pages/admin/AddBooking";
import Edit2DSetup from "./pages/Edit2DSetup";
import View2DSetup from "./pages/View2DSetup";
import StylistDashboard from "./pages/stylist/StylistDashboard";
import CookDashboard from "./pages/cook/CookDashboard";
import Bookings from "./pages/Bookings";

export default function App(){
  return(
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
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
            <ProtectedRoute allowedRoles={['admin', 'stylist', 'cook']}>
              <BookingDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/menu"
          element={
            <ProtectedRoute allowedRoles={['admin', 'cook']}>
              <Menu />
            </ProtectedRoute>
          }
        />

        <Route
          path="/package"
          element={
            <ProtectedRoute allowedRoles={['admin', 'stylist']}>
              <Packages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/setup"
          element={
            <ProtectedRoute allowedRoles={['admin', 'stylist']}>
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
            <ProtectedRoute allowedRoles={['admin', 'stylist']}>
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
