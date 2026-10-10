const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode');
const connectDB = require('./config/db');
const Profile = require('./models/Profile');
const Event = require('./models/Event');
const Registration = require('./models/Registration');
const TeamMember = require('./models/TeamMember');
const Payment = require('./models/Payment');
const Ticket = require('./models/Ticket');

require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Routes (add your routes here)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));

// Upload route
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Basic route
app.get('/', (req, res) => {
  res.send('EventHub Backend API');
});

// Test route
app.get('/test', (req, res) => {
  res.send('Backend is running');
});

// Test DB connectivity route
app.get('/api/test-db', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ message: 'Database connected successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

// Create profile route for testing user insertion
app.post('/api/profiles', async (req, res) => {
  try {
    const profile = new Profile(req.body);
    await profile.save();
    res.status(201).json({ message: 'Profile created successfully', profile });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create registration route
app.post('/api/registrations', async (req, res) => {
  try {
    const registration = new Registration(req.body);
    await registration.save();
    res.status(201).json({ message: 'Registration created successfully', registration });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create team member route
app.post('/api/team-members', async (req, res) => {
  try {
    const teamMember = new TeamMember(req.body);
    await teamMember.save();
    res.status(201).json({ message: 'Team member created successfully', teamMember });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create payment route
app.post('/api/payments', async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json({ message: 'Payment created successfully', payment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Generate ticket route
app.post('/api/tickets', async (req, res) => {
  try {
    const { registration_id, event_title, attendee_name, event_date, event_time, location, ticket_type, team_name, price } = req.body;

    // Generate unique ticket number
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Generate QR code data (JSON string)
    const qrCodeData = JSON.stringify({
      ticketNumber,
      registration_id,
      event_title,
      attendee_name,
      event_date,
      ticket_type
    });

    // Generate QR code as base64 data URL
    const qrCodeImage = await qrcode.toDataURL(qrCodeData);

    const ticket = new Ticket({
      registration_id,
      ticket_number: ticketNumber,
      qr_code_data: qrCodeData,
      qr_code_image: qrCodeImage,
      event_title,
      attendee_name,
      event_date,
      event_time,
      location,
      ticket_type,
      team_name,
      price
    });

    await ticket.save();
    res.status(201).json({ message: 'Ticket generated successfully', ticket });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get tickets by event
app.get('/api/tickets/event/:eventId', async (req, res) => {
  try {
    // Find registrations for this event
    const registrations = await Registration.find({ event_id: req.params.eventId });
    const registrationIds = registrations.map(reg => reg._id);

    // Find tickets for these registrations
    const tickets = await Ticket.find({ registration_id: { $in: registrationIds } });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's tickets/bookings
app.get('/api/tickets/user/:userId', async (req, res) => {
  try {
    // Find registrations for this user
    const registrations = await Registration.find({ user_id: req.params.userId });
    const registrationIds = registrations.map(reg => reg._id);

    // Find tickets for these registrations
    const tickets = await Ticket.find({ registration_id: { $in: registrationIds } })
      .populate('registration_id')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark attendance via QR scan
app.post('/api/attendance/mark', async (req, res) => {
  try {
    const { qrData } = req.body;

    // Parse QR data (assuming it's JSON string)
    let ticketInfo;
    try {
      ticketInfo = JSON.parse(qrData);
    } catch (parseError) {
      return res.status(400).json({ message: 'Invalid QR code data' });
    }

    // Find ticket by ticket number
    const ticket = await Ticket.findOne({ ticket_number: ticketInfo.ticketNumber });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if already checked in
    if (ticket.status === 'used') {
      return res.status(400).json({ message: 'Ticket already used' });
    }

    // Update ticket status
    ticket.status = 'used';
    await ticket.save();

    // Update registration checked_in status
    await Registration.findByIdAndUpdate(ticket.registration_id, {
      checked_in: true,
      checked_in_at: new Date()
    });

    res.json({
      message: 'Attendance marked successfully',
      ticket: {
        ticket_number: ticket.ticket_number,
        attendee_name: ticket.attendee_name,
        event_title: ticket.event_title
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
