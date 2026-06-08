// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTickets } from '../context/TicketContext';
import { Ticket, Plus, ShieldAlert, User } from 'lucide-react';

const Navbar = () => {
  const { role, toggleRole } = useTickets();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleSwitch = () => {
    toggleRole();
    if (role === 'user') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <Link to={role === 'admin' ? '/admin' : '/'} className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">SupportFlow</span>
          </Link>

          <div className="hidden sm:flex items-center bg-gray-100 p-1 rounded-full border border-gray-200">
            <button
              onClick={handleRoleSwitch}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                role === 'user' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-4 h-4" /> User
            </button>
            <button
              onClick={handleRoleSwitch}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                role === 'admin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShieldAlert className="w-4 h-4" /> Admin
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleRoleSwitch}
              className="sm:hidden text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md"
            >
              {role === 'user' ? 'Switch to Admin' : 'Switch to User'}
            </button>

            {location.pathname !== '/tickets/new' && (
              <Link
                to="/tickets/new"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create New Ticket</span>
                <span className="sm:hidden">New</span>
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;