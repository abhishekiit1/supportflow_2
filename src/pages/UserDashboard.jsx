import React from 'react';
import { Link } from 'react-router-dom';
import { useTickets } from '../context/TicketContext';
import { format } from 'date-fns';
import { Eye, Inbox } from 'lucide-react';

const UserDashboard = () => {
  const { tickets } = useTickets();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-700';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Tickets</h1>
        <p className="text-gray-500 mt-1">Manage and track your support requests.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {tickets.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <Inbox className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
            <p className="text-gray-500 mt-1 mb-6">You haven't submitted any support requests yet.</p>
            <Link to="/tickets/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              Create your first ticket
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                  <th className="p-4 font-medium">Ticket ID</th>
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 text-sm font-mono text-gray-500">{ticket.id}</td>
                    <td className="p-4 text-sm font-medium text-gray-900">{ticket.title}</td>
                    <td className="p-4 text-sm text-gray-500">{ticket.category}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="p-4 text-center">
                      <Link 
                        to={`/tickets/${ticket.id}`}
                        className="text-gray-400 hover:text-indigo-600 transition-colors inline-block p-2 rounded-lg hover:bg-indigo-50"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;