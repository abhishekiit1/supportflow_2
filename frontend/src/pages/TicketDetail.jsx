import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../lib/api'; 
import { format } from 'date-fns';
import { Send, Trash2, CheckCircle, Clock, Tag, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); 
  
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  
  const messagesEndRef = useRef(null);
  const lastPolledRef = useRef(null);

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const data = await fetchApi(`/tickets/${id}`);
        setTicket(data.ticket);
      } catch (err) {
        toast.error('Failed to load ticket details.');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    loadTicket();
  }, [id, navigate]);

  useEffect(() => {
    let isMounted = true;
    let pollTimer;

    const fetchMessages = async () => {
      try {
        let url = `/tickets/${id}/messages`;
        if (lastPolledRef.current) {
          url += `?since=${lastPolledRef.current}`;
        }
        
        const data = await fetchApi(url);
        
        if (isMounted && data.messages.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newMsgs = data.messages.filter(m => !existingIds.has(m.id));
            return [...prev, ...newMsgs];
          });
          lastPolledRef.current = data.messages[data.messages.length - 1].timestamp;
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    fetchMessages();
    pollTimer = setInterval(fetchMessages, 4000); 

    return () => {
      isMounted = false;
      clearInterval(pollTimer);
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const textToSend = messageText.trim();
    setMessageText(''); 

    try {
      const data = await fetchApi(`/tickets/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text: textToSend })
      });
      setMessages(prev => [...prev, data.message]);
      lastPolledRef.current = data.message.timestamp;
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    }
  };

  const handleUpdateTicket = async (updates) => {
    try {
      const data = await fetchApi(`/tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      setTicket(data.ticket);
      toast.success('Ticket updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update ticket');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      try {
        await fetchApi(`/tickets/${id}`, { method: 'DELETE' });
        toast.info('Ticket deleted');
        navigate('/');
      } catch (err) {
        toast.error(err.message || 'Failed to delete ticket');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-700';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) return <div className="py-20 text-center text-gray-500">Loading ticket...</div>;
  if (!ticket) return null;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <Link to={user.role === 'admin' ? '/admin' : '/'} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
          &larr; Back to Dashboard
        </Link>
        <span className="text-sm text-gray-500 font-mono">Ticket {ticket.ticketNumber}</span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <div className="col-span-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-y-auto">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 leading-tight">{ticket.title}</h1>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500 flex items-center gap-2"><Clock className="w-4 h-4"/> Status</span>
              {user.role === 'admin' ? (
                <select 
                  value={ticket.status} onChange={(e) => handleUpdateTicket({ status: e.target.value })}
                  className="text-sm border border-gray-300 rounded-md p-1 outline-none focus:border-indigo-500"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              ) : (
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>{ticket.status}</span>
              )}
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500 flex items-center gap-2"><Tag className="w-4 h-4"/> Category</span>
              {user.role === 'admin' ? (
                <select 
                  value={ticket.category} onChange={(e) => handleUpdateTicket({ category: e.target.value })}
                  className="text-sm border border-gray-300 rounded-md p-1 outline-none focus:border-indigo-500"
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Billing">Billing</option>
                  <option value="Network">Network</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <span className="text-sm font-medium text-gray-900">{ticket.category}</span>
              )}
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Priority</span>
              <span className="text-sm font-medium text-gray-900">{ticket.priority}</span>
            </div>
            
            <div className="py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500 block mb-1">Created By</span>
              <span className="text-sm font-medium text-gray-900">{ticket.createdBy.name}</span>
            </div>

            <div className="py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500 block mb-1">Created At</span>
              <span className="text-sm font-medium text-gray-900">{format(new Date(ticket.createdAt), 'MMM dd, yyyy h:mm a')}</span>
            </div>
          </div>

          <div>
            <span className="text-sm font-semibold text-gray-900 block mb-2">Original Description</span>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {user.role === 'customer' && (
            <div className="mt-8 space-y-3">
              {ticket.status !== 'Resolved' && (
                <button onClick={() => handleUpdateTicket({ status: 'Resolved' })} className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-emerald-200">
                  <CheckCircle className="w-4 h-4" /> Mark as Resolved
                </button>
              )}
              <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 bg-white text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-200">
                <Trash2 className="w-4 h-4" /> Delete Ticket
              </button>
            </div>
          )}
        </div>

        <div className="col-span-1 lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No messages yet. Start the conversation below.
              </div>
            ) : (
              messages.map((msg) => {
                
                // mongodb alignment: Compare real msg.sender.id to real logged-in user.id
                const isMyMessage = msg.sender.id === user.id;
                
                return (
                  <div key={msg.id} className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500 capitalize">
                        {msg.sender.name} ({msg.sender.role})
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {format(new Date(msg.timestamp), 'h:mm a')}
                      </span>
                    </div>
                    <div 
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                        isMyMessage 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
              <button
                type="submit" disabled={!messageText.trim()}
                className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;