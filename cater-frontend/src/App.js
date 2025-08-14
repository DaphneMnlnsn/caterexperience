import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminClients from './pages/admin/AdminClients';
import AdminBookings from './pages/admin/AdminBookings';
import AdminPayments from './pages/admin/AdminPayments';
import Menu from './pages/admin/Menu';
import Packages from './pages/admin/Packages';
import AdminVenue from './pages/admin/VenueSetups';
import AdminInventory from './pages/admin/AdminInventory';
import AdminAudit from './pages/admin/AdminAudit';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import ClientDetails from "./pages/admin/ClientDetails";
import BookingDetails from "./pages/admin/BookingDetails";
import AddBooking from "./pages/admin/AddBooking";
import Edit2DSetup from "./pages/Edit2DSetup";
import View2DSetup from "./pages/View2DSetup";

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
          path="/admin/bookings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bookings/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <BookingDetails />
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
          path="/admin/menu"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Menu />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/package"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Packages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/setup"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminVenue />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Edit2DSetup />
            </ProtectedRoute>
          }
        />

        <Route
          path="/view/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <View2DSetup />
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
      </Routes>
    </Router>
  );
}
