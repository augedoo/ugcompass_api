const path = require('path');
const fs = require('fs');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const compression = require('compression');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Route files
const facilitiesRoutes = require('./routes/facilities');
const roomsRoutes = require('./routes/rooms');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const reviewsRoutes = require('./routes/reviews');

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

// Body parser
app.use(express.json());
// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined', { stream: accessLogStream }));
}
// Cookie parser
app.use(cookieParser());
// File uploading
app.use(fileUpload());
// Sanitizing user inputs:
app.use(mongoSanitize());
// Set security headers
app.use(helmet());
// Prevent XSS attacks
app.use(xss());
// Prevent hpp
app.use(hpp());
// Rate Limiting
app.use(compression());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // > 15 minutes
  max: 100, // > limit each IP to 100 requests per windowMs
});
app.use(limiter);
// Enable CORS
app.use(cors());
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/api/v1/facilities', facilitiesRoutes);
app.use('/api/v1/rooms', roomsRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/reviews', reviewsRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server and exist process
  server.close(() => process.exit(1));
});
