const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/exeat', require('./routes/exeat'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/verify', require('./routes/verify'));

// Test route to verify server is running
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running correctly' });
});

// Test route to verify database connection
app.get('/api/test/db', async (req, res) => {
  try {
    // Check if we can perform a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ 
      status: 'success',
      message: 'Database connection is working',
      dbName: mongoose.connection.name,
      collections: collections.map(c => c.name)
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'error',
      message: 'Database connection error',
      error: err.message
    });
  }
});

// Public route for QR code verification (no auth required)
app.get('/verify/:exeatId', async (req, res) => {
  try {
    const exeatId = req.params.exeatId;
    const exeat = await mongoose.model('ExeatRequest').findById(exeatId)
      .populate('student', 'firstName lastName matricNumber department')
      .select('status departureDate returnDate checkIn checkOut');
    
    if (!exeat) {
      return res.status(404).json({ message: 'Exeat not found' });
    }
    
    res.json({
      status: exeat.status,
      studentName: `${exeat.student.firstName} ${exeat.student.lastName}`,
      matricNumber: exeat.student.matricNumber,
      department: exeat.student.department,
      departureDate: exeat.departureDate,
      returnDate: exeat.returnDate,
      checkedOut: exeat.checkOut.status,
      checkedIn: exeat.checkIn.status
    });
  } catch (err) {
    res.status(500).json({ message: 'Error verifying exeat', error: err.message });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

module.exports = app; 