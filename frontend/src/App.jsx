import React from 'react';
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import MainLayout from './layouts/MainLayout';
import UserDashboard from './pages/UserDashboard';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<MainLayout />}>
      
      {/* login routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* customer and admin routes*/}
      <Route element={<ProtectedRoute />}>
        <Route index element={<UserDashboard />} />
        <Route path="/tickets/new" element={<CreateTicket />} />
        <Route path="/tickets/:id" element={<TicketDetail />} />
      </Route>

      {/* admin only routes */}
      <Route element={<ProtectedRoute requireAdmin={true} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer position="bottom-right" theme="colored" />
    </AuthProvider>
  );
}

export default App;