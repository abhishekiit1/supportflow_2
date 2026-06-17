import express from 'express';
import Ticket from '../models/Ticket.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: 'Open' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'In Progress' });

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const resolvedToday = await Ticket.countDocuments({
      status: 'Resolved',
      resolvedAt: { $gte: startOfDay }
    });

    const categoryAgg = await Ticket.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const ticketsByCategory = { Hardware: 0, Software: 0, Billing: 0, Network: 0, Other: 0 };
    categoryAgg.forEach(cat => { ticketsByCategory[cat._id] = cat.count; });

    const statusAgg = await Ticket.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const ticketsByStatus = { "Open": 0, "In Progress": 0, "Resolved": 0 };
    statusAgg.forEach(stat => { ticketsByStatus[stat._id] = stat.count; });

    const ticketsOverTime = [];
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      const dateStr = targetDate.toISOString().split('T')[0];

      const start = new Date(targetDate);
      start.setUTCHours(0, 0, 0, 0);
      
      const end = new Date(targetDate);
      end.setDate(end.getDate() + 1);
      end.setUTCHours(0, 0, 0, 0);

      const count = await Ticket.countDocuments({
        createdAt: { $gte: start, $lt: end }
      });

      ticketsOverTime.push({ date: dateStr, count });
    }

    res.status(200).json({
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedToday,
      ticketsByCategory,
      ticketsByStatus,
      ticketsOverTime
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching admin stats.' });
  }
});

export default router;