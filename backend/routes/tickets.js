import express from 'express';
import Ticket from '../models/Ticket.js';
import Message from '../models/Message.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/', protect, async (req, res) => {
  try {
    const { status, priority, category, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (req.user.role === 'customer') {
      query.createdBy = req.user.userId;
    }

    if (status && status !== 'All') query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tickets = await Ticket.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Ticket.countDocuments(query);

    res.status(200).json({
      tickets: tickets.map(ticket => ({
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        title: ticket.title,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        description: ticket.description,
        createdBy: { id: ticket.createdBy._id, name: ticket.createdBy.name },
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      })),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching tickets.' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, category, priority, description } = req.body;

    if (!title || title.length < 5) return res.status(400).json({ error: 'Title must be at least 5 characters.' });
    if (!description || description.length < 20) return res.status(400).json({ error: 'Description must be at least 20 characters.' });
    if (!category || !priority) return res.status(400).json({ error: 'Category and priority are required.' });

    const ticket = await Ticket.create({
      title,
      category,
      priority,
      description,
      createdBy: req.user.userId
    });

    const populatedTicket = await Ticket.findById(ticket._id).populate('createdBy', 'name');

    res.status(201).json({
      ticket: {
        id: populatedTicket._id,
        ticketNumber: populatedTicket.ticketNumber,
        title: populatedTicket.title,
        category: populatedTicket.category,
        priority: populatedTicket.priority,
        description: populatedTicket.description,
        status: populatedTicket.status,
        createdBy: { id: populatedTicket.createdBy._id, name: populatedTicket.createdBy.name },
        createdAt: populatedTicket.createdAt,
        resolvedAt: populatedTicket.resolvedAt,
        updatedAt: populatedTicket.updatedAt
      }
    });
  } catch (error) {
    console.error("TICKET POST ERROR:", error); 
    res.status(500).json({ error: 'Server error creating ticket.' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('createdBy', 'name');

    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

    if (req.user.role === 'customer' && ticket.createdBy._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this ticket.' });
    }

    res.status(200).json({
      ticket: {
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        title: ticket.title,
        category: ticket.category,
        priority: ticket.priority,
        description: ticket.description,
        status: ticket.status,
        createdBy: { id: ticket.createdBy._id, name: ticket.createdBy.name },
        createdAt: ticket.createdAt,
        resolvedAt: ticket.resolvedAt,
        updatedAt: ticket.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching ticket.' });
  }
});

router.patch('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

    const { status, category, priority } = req.body;

    if (req.user.role === 'customer') {
      if (ticket.createdBy.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this ticket.' });
      }
      if (category || priority) {
        return res.status(403).json({ error: 'Forbidden: Customers cannot change category or priority.' });
      }
      if (status && status !== 'Resolved') {
        return res.status(403).json({ error: 'Forbidden: Customers can only mark tickets as Resolved.' });
      }
    }

    if (status) ticket.status = status;
    if (category) ticket.category = category;
    if (priority) ticket.priority = priority;

    if (status === 'Resolved') {
      ticket.resolvedAt = new Date();
    } else if (status) {
      ticket.resolvedAt = null; 
    }

    const updatedTicket = await ticket.save();
    res.status(200).json({ ticket: updatedTicket });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating ticket.' });
  }
});


router.delete('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

    if (req.user.role === 'customer' && ticket.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this ticket.' });
    }

    await Message.deleteMany({ ticketId: ticket._id });
    
    await ticket.deleteOne();

    res.status(200).json({ message: `Ticket ${ticket.ticketNumber} and all associated messages deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting ticket.' });
  }
});

router.get('/:id/messages', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

    if (req.user.role === 'customer' && ticket.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this ticket.' });
    }

    const query = { ticketId: ticket._id };
    
    if (req.query.since) {
      query.timestamp = { $gt: new Date(req.query.since) };
    }

    const messages = await Message.find(query)
      .populate('senderId', 'name role')
      .sort({ timestamp: 1 });

    res.status(200).json({
      messages: messages.map(msg => ({
        id: msg._id,
        ticketId: msg.ticketId,
        sender: { 
          id: msg.senderId._id, 
          name: msg.senderId.name, 
          role: msg.senderRole 
        },
        text: msg.text,
        timestamp: msg.timestamp
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching messages.' });
  }
});

router.post('/:id/messages', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

    if (req.user.role === 'customer' && ticket.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this ticket.' });
    }

    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const newMessage = await Message.create({
      ticketId: ticket._id,
      senderId: req.user.userId,
      senderRole: req.user.role,
      text: text.trim()
    });

    const populatedMessage = await Message.findById(newMessage._id).populate('senderId', 'name role');

    res.status(201).json({
      message: {
        id: populatedMessage._id,
        ticketId: populatedMessage.ticketId,
        sender: {
          id: populatedMessage.senderId._id,
          name: populatedMessage.senderId.name,
          role: populatedMessage.senderRole
        },
        text: populatedMessage.text,
        timestamp: populatedMessage.timestamp
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error sending message.' });
  }
});

export default router;