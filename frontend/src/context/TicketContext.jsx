import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; 

const TicketContext = createContext();

const SEED_TICKETS = [
  {
    id: "TCK-8492",
    title: "Payment Gateway Timeout Errors on Checkout",
    category: "Software",
    priority: "High",
    description: "Customers are reporting that when attempting to complete their purchase using credit cards, the system hangs for 30 seconds before throwing a 500 error.",
    status: "In Progress",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    messages: [
      { id: "m1", sender: "user", text: "Hi support team, multiple users from our European office are getting 500 errors...", timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: "m2", sender: "admin", text: "Hello, thank you for reporting this. I've escalated this to our DevOps team...", timestamp: new Date(Date.now() - 80000000 * 2).toISOString() }
    ]
  },
  {
    id: "TCK-1042",
    title: "Cannot access billing dashboard",
    category: "Billing",
    priority: "Medium",
    description: "When I click on the billing tab, the page is blank.",
    status: "Open",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    messages: []
  },
  {
    id: "TCK-1021",
    title: "Requesting invoice for last month",
    category: "Billing",
    priority: "Low",
    description: "Need the invoice for accounting purposes.",
    status: "Resolved",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    messages: []
  },
  {
    id: "TCK-0998",
    title: "Update user profile information",
    category: "Other",
    priority: "Low",
    description: "I need to change my registered email address.",
    status: "Resolved",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    messages: []
  },
  {
    id: "TCK-4092",
    title: "Critical system failure on checkout page",
    category: "Hardware",
    priority: "High",
    description: "Servers in us-east-1 are unresponsive.",
    status: "Open",
    createdAt: new Date().toISOString(),
    messages: []
  }
];

export const TicketProvider = ({ children }) => {
  const [role, setRole] = useState('user'); 

  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('support_tickets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : SEED_TICKETS;
      } catch (e) {
        return SEED_TICKETS;
      }
    }
    return SEED_TICKETS;
  });

  useEffect(() => {
    localStorage.setItem('support_tickets', JSON.stringify(tickets));
  }, [tickets]);

  const addTicket = (newTicket) => setTickets((prev) => [newTicket, ...prev]);
  
  const updateTicketStatus = (id, newStatus) => 
    setTickets((prev) => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    
  const updateTicketCategory = (id, newCategory) => 
    setTickets((prev) => prev.map(t => t.id === id ? { ...t, category: newCategory } : t));
    
  const addMessage = (id, message) => 
    setTickets((prev) => prev.map(t => t.id === id ? { ...t, messages: [...t.messages, message] } : t));
    
  const deleteTicket = (id) => setTickets((prev) => prev.filter(t => t.id !== id));
  
  const toggleRole = () => setRole(prev => prev === 'user' ? 'admin' : 'user');

  return (
    <TicketContext.Provider value={{ 
      tickets, role, addTicket, updateTicketStatus, updateTicketCategory, addMessage, deleteTicket, toggleRole 
    }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => useContext(TicketContext);