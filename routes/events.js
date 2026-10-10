const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Event = require('../models/Event');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('./auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/events/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Middleware to check if user is organizer
const checkOrganizer = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer_id.toString() !== req.user.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this event' });
    }

    req.event = event;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/events - Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ status: 'active' }).sort({ event_date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/events/:id - Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/events/user/:userId - Get user's events
router.get('/user/:userId', async (req, res) => {
  try {
    const events = await Event.find({ organizer_id: req.params.userId });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/events - Create new event
router.post('/', auth, upload.fields([
  { name: 'banner', maxCount: 1 },
  { name: 'morePhotos', maxCount: 10 }
]), async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizer_id: req.user,
      banner_url: req.files?.banner ? `/uploads/events/${req.files.banner[0].filename}` : '',
      photo_urls: req.files?.morePhotos ? req.files.morePhotos.map(file => `/uploads/events/${file.filename}`) : []
    };

    const event = new Event(eventData);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/events/:id - Update event
router.put('/:id', auth, checkOrganizer, upload.fields([
  { name: 'banner', maxCount: 1 },
  { name: 'morePhotos', maxCount: 10 }
]), async (req, res) => {
  try {
    let updateData = {
      title: req.body.title,
      description: req.body.description,
      event_date: req.body.event_date,
      event_time: req.body.event_time,
      duration: req.body.duration,
      location_type: req.body.location_type,
      location_address: req.body.location_address,
      organizer_email: req.body.organizer_email,
      organizer_phone: req.body.organizer_phone,
      team_required: req.body.team_required === 'true',
      is_paid: req.body.is_paid === 'true'
    };

    // Handle banner update
    if (req.files?.banner) {
      // Delete old banner if exists
      if (req.event.banner_url) {
        fs.unlinkSync(`.${req.event.banner_url}`);
      }
      updateData.banner_url = `/uploads/events/${req.files.banner[0].filename}`;
    }

    // Handle more photos - append new ones
    if (req.files?.morePhotos) {
      const newPhotos = req.files.morePhotos.map(file => `/uploads/events/${file.filename}`);
      updateData.photo_urls = [...(req.event.photo_urls || []), ...newPhotos];
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ event: updatedEvent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/events/:id/status - Update event status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', checkOrganizer, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    // Delete associated files
    if (event.banner_url) {
      fs.unlinkSync(`.${event.banner_url}`);
    }
    event.photo_urls.forEach(photo => {
      fs.unlinkSync(`.${photo}`);
    });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
