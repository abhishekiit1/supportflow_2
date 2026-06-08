import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTickets } from '../context/TicketContext';
import { toast } from 'react-toastify';

const CreateTicket = () => {
  const navigate = useNavigate();
  const { addTicket } = useTickets();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Hardware',
    priority: 'Low',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.title.trim().length < 5) {
      toast.error('Title must be at least 5 characters long.');
      return;
    }
    if (formData.description.trim().length < 20) {
      toast.error('Description must be at least 20 characters long.');
      return;
    }

    const newTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`, 
      title: formData.title.trim(),
      category: formData.category,
      priority: formData.priority,
      description: formData.description.trim(),
      status: 'Open',
      createdAt: new Date().toISOString(),
      messages: []
    };

    addTicket(newTicket);
    toast.success('Ticket created successfully!');
    navigate('/'); 
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      
      <div className="mb-8">
        <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mb-4">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create New Ticket</h1>
        <p className="text-gray-500 mt-2">Please provide the details of your issue below, and our support team will assist you shortly.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Ticket Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief summary of the issue"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
              >
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Billing">Billing</option>
                <option value="Network">Network</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              placeholder="Please provide as much detail as possible to help us resolve your issue quickly. Steps to reproduce are highly appreciated."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-y"
              required
            ></textarea>
            <p className="mt-2 text-xs text-gray-500">Minimum 20 characters required.</p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
            >
              Submit Ticket
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateTicket;