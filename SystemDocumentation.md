# Student Exeat Permission System Documentation

## System Overview

The Student Exeat Permission System for Veritas University is a comprehensive web application designed to digitize and streamline the process of requesting, approving, and managing student exeat permissions. The system replaces traditional paper-based workflows with a modern digital solution that enhances efficiency, transparency, and record-keeping.

## Technical Architecture

### Stack Components

The application is built on the MERN stack:

- **MongoDB**: NoSQL database for storing user data, exeat requests, and system information
- **Express.js**: Backend framework for handling API requests and server-side logic
- **React**: Frontend library for building the user interface
- **Node.js**: JavaScript runtime environment for the server

### Deployment

The system is configured for deployment on AWS Elastic Beanstalk, as evidenced by the `.ebextensions` configuration files.

## Backend Architecture

### Server Configuration

- **Main Entry Point**: `server.js`
- **Port**: 5000 (development), 8081 (production)
- **Middleware**: CORS, JSON parsing, URL encoding
- **Database**: MongoDB (connected via Mongoose)
- **Environment Variables**: Managed via dotenv

### API Routes

- `/api/auth`: User authentication (login, registration)
- `/api/exeat`: Exeat request management
- `/api/admin`: Administrative functions
- `/api/notifications`: Email notification services
- `/api/verify`: QR code generation and verification
- `/api/test`: Test endpoints for server and database verification

### Data Models

1. **User Model** (`models/User.js`):
   - Stores user information including authentication credentials
   - User types include students, hall administrators, security personnel, deans, parents, and system administrators
   - Students have additional fields like matriculation number, department, and parent email

2. **ExeatRequest Model** (`models/ExeatRequest.js`):
   - Stores information about exeat requests
   - Fields include student information, reason, destination, departure/return dates, status, emergency contacts
   - Includes multi-stage approval (parent and dean)
   - Tracks check-in and check-out status
   - Stores QR code data and file attachments
   - Implements indexes for efficient querying

### Email Notification System

The system includes a comprehensive email notification system using Nodemailer:

1. **Parent Notifications**: When a student submits an exeat request, an email is sent to the parent with an approval link
2. **Dean Notifications**: When a parent approves a request, the dean is notified
3. **Student Notifications**: Students are notified of approval or rejection
4. **Return Reminders**: Automated reminders for approaching return deadlines

### File Upload System

- Uses Multer and Cloudinary for file storage
- Supports multiple file types (images, PDFs, videos)
- Security validations for file size and type
- Files are stored as URLs in the database

## Core Workflows

### Student Exeat Request Flow

1. **Request Submission**:
   - Student logs in and fills the exeat request form
   - Provides reason, destination, dates, and emergency contact
   - Can upload supporting documents or videos
   - Form is submitted and stored with 'pending_parent' status

2. **Parent Approval**:
   - System generates a unique token for parent approval
   - Email notification is sent to parent with approval link
   - Parent can approve or reject with comments
   - If rejected, workflow ends
   - If approved, status changes to 'pending_dean'

3. **Dean Approval**:
   - Dean receives notification of parent-approved request
   - Reviews request details and parent approval
   - Can approve or reject with comments
   - If rejected, workflow ends
   - If approved, QR code is generated and status changes to 'approved'

4. **QR Code Generation**:
   - Upon dean approval, system automatically generates a QR code
   - QR code links to a verification URL
   - Student can access and download their exeat pass with QR code

5. **Security Verification**:
   - Security personnel scan QR code or enter exeat ID
   - System displays student details and exeat status
   - Security can mark student as checked out when leaving campus
   - Upon return, security marks student as checked in

## Security Features

- **Authentication**: JWT-based authentication
- **Password Security**: Bcrypt for password hashing
- **Input Validation**: Express-validator for server-side validation
- **Token Security**: Unique tokens for parent approval
- **QR Code Verification**: Secure QR codes for exeat passes
- **Environment Separation**: Different configurations for development and production environments

## Deployment Configuration

The application is configured for AWS Elastic Beanstalk deployment:

- **Node Command**: `npm start`
- **Proxy Server**: NGINX
- **Environment**: Production
- **Port**: 8081

## Development Tools

- **Concurrently**: For running backend and frontend simultaneously
- **Nodemon**: For automatic server restart during development
- **React Scripts**: For React development workflow

## Future Enhancements

Potential areas for system expansion in future phases:

1. Advanced analytics and reporting on exeat patterns
2. Mobile application development
3. Integration with academic calendar for automated validation
4. Biometric verification for added security
5. Push notifications for real-time updates 