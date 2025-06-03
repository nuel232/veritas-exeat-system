const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const app = require('./app');

// Load environment variables
dotenv.config();

// Create Express app
const appExpress = express();

// Middleware
appExpress.use(cors());
appExpress.use(express.json());
appExpress.use(express.urlencoded({ extended: true }));

// Database connection with detailed logging
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

// Set default port
const PORT = process.env.PORT || 5000;

// Connect to database
const connectDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/exeat_system';
    console.log(`Connecting to MongoDB at: ${dbUri}`);
    
    await mongoose.connect(dbUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Connect to database and start server
connectDB().then(() => {
  appExpress.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
  });
});

// Routes
appExpress.use('/api/auth', require('./routes/auth'));
appExpress.use('/api/exeat', require('./routes/exeat'));
appExpress.use('/api/admin', require('./routes/admin'));
appExpress.use('/api/notifications', require('./routes/notifications'));
appExpress.use('/api/verify', require('./routes/verify'));

// Test route to verify server is running
appExpress.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running correctly' });
});

// Test route to verify database connection
appExpress.get('/api/test/db', async (req, res) => {
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
appExpress.get('/verify/:exeatId', async (req, res) => {
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
  appExpress.use(express.static('client/build'));
  appExpress.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Error handling middleware
appExpress.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Monitor MongoDB connection
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
}); 