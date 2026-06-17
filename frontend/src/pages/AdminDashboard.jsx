import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Eye, AlertCircle, CheckCircle2, Clock, Inbox, Filter } from 'lucide-react';
import { fetchApi } from '../lib/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsData, ticketsData] = await Promise.all([
          fetchApi('/admin/stats'),
          fetchApi('/tickets?limit=100')
        ]);
        setStats(statsData);
        setTickets(ticketsData.tickets);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-700';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (statusFilter === 'All') return true;
    return t.status === statusFilter;
  });

  if (isLoading || !stats) {
    return <div className="py-20 text-center text-gray-500">Loading dashboard...</div>;
  }

  const categoryData = Object.entries(stats.ticketsByCategory)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  const timeData = stats.ticketsOverTime.map(item => ({
    dateStr: format(new Date(item.date), 'MMM dd'),
    Tickets: item.count
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Command Center</h1>
        <p className="text-gray-500 mt-1">Real-time support metrics and active ticket queue management.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between border-l-4 border-l-gray-400">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Tickets</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTickets}</h3>
          </div>
          <div className="p-3 bg-gray-50 text-gray-400 rounded-lg"><Inbox className="w-6 h-6"/></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between border-l-4 border-l-red-500">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Open</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.openTickets}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-500 rounded-lg"><AlertCircle className="w-6 h-6"/></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between border-l-4 border-l-yellow-500">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">In Progress</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.inProgressTickets}</h3>
          </div>
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><Clock className="w-6 h-6"/></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Resolved Today</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.resolvedToday}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 className="w-6 h-6"/></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Tickets Over Time (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="dateStr" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="Tickets" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Tickets by Category</h3>
          <div className="h-64 flex-1 relative">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">No category breakdown data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            Global Ticket Queue
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full font-normal">
              {filteredTickets.length}
            </span>
          </h3>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-1.5 font-medium text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                <th className="p-4 font-medium">Ticket ID</th>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Priority</th>
                <th className="p-4 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-mono text-gray-500">{ticket.ticketNumber}</td>
                  <td className="p-4 text-sm font-medium text-gray-900">{ticket.title}</td>
                  <td className="p-4 text-sm text-gray-500">{ticket.category}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${
                      ticket.priority === 'High' ? 'text-red-600' : ticket.priority === 'Medium' ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <Link to={`/tickets/${ticket.id}`} className="text-gray-400 hover:text-indigo-600 transition-colors inline-block p-2 rounded-lg hover:bg-indigo-50">
                      <Eye className="w-5 h-5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;