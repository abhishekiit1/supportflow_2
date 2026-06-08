import React from 'react';
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TicketProvider } from './context/TicketContext';
import MainLayout from './layouts/MainLayout';
import UserDashboard from './pages/UserDashboard';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      {/* Swap the placeholder with the real component */}
      <Route index element={<UserDashboard />} /> 
      <Route path="/tickets/new" element={<CreateTicket />} />
      <Route path="/tickets/:id" element={<TicketDetail />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

function App() {
  return (
    <TicketProvider>
      <RouterProvider router={router} />
      <ToastContainer position="bottom-right" theme="colored" />
    </TicketProvider>
  );
}

export default App;