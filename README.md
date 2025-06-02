# Student Exeat Permission System

A comprehensive web application for Veritas University to manage student exeat permissions, built on the MERN stack.

## Features

- Multi-stage approval workflow (Student → Parent → Dean)
- Email notifications at each stage
- QR code generation for approved exeat passes
- Check-in/check-out tracking by security personnel
- File attachment support for exeat requests
- Responsive UI for all user types
- Comprehensive test suite for backend and frontend

## Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn
- Email account for sending notifications
- Cloudinary account for file storage

## Installation

### Clone the repository

```bash
git clone https://github.com/nuel232/student-exeat-system.git
cd student-exeat-system
```

### Install backend dependencies

```bash
npm install
```

### Install frontend dependencies

```bash
cd client
npm install
cd ..
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:3000

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/exeat-system

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Test Configuration (for testing only)
MONGODB_URI_TEST=mongodb://localhost:27017/exeat-system-test
```

Replace placeholder values with your actual configuration details.

## Running the Application

### Development Mode

Run the backend and frontend concurrently:

```bash
npm run dev:full
```

Or run them separately:

```bash
# Backend only
npm run dev

# Frontend only
npm run client
```

### Production Mode

Build the frontend:

```bash
cd client
npm run build
cd ..
```

Start the production server:

```bash
npm start
```

## Testing

The application includes comprehensive test suites for both backend and frontend components.

### Test Requirements

- MongoDB should be running locally
- Test environment variables must be properly set

### Running Tests

```bash
# Run all backend tests
npm run test:backend

# Run backend tests excluding notification tests
npm run test:backend:no-notifications

# Run frontend tests
npm run test:frontend

# Run end-to-end tests with Cypress
npm run test:e2e

# Run all tests (backend and frontend)
npm run test:all
```

See `TEST_FIXES.md` for detailed information about test configurations and troubleshooting.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get current user

### Exeat Requests

- `POST /api/exeat` - Create a new exeat request
- `GET /api/exeat/my-requests` - Get user's exeat requests
- `GET /api/exeat/:id` - Get a specific exeat request
- `POST /api/exeat/parent-approval/:id/:token` - Parent approval
- `PATCH /api/exeat/:id/dean-approval` - Dean approval

### Notifications

- `POST /api/notifications/notify-parent` - Send notification to parent
- `POST /api/notifications/notify-dean` - Send notification to dean
- `POST /api/notifications/notify-student` - Send notification to student
- `POST /api/notifications/return-reminder` - Send return deadline reminder

### Verification

- `POST /api/verify/generate-qr/:id` - Generate QR code
- `GET /api/verify/:id` - Verify exeat by ID
- `POST /api/verify/check-out/:id` - Mark student check-out
- `POST /api/verify/check-in/:id` - Mark student check-in
- `POST /api/verify/search` - Search exeat by matriculation number

## Documentation

- **README.md** - Installation and usage instructions
- **SystemDocumentation.md** - Detailed technical architecture and system workflows
- **TEST_FIXES.md** - Test setup and troubleshooting

## User Roles

- **Student**: Can create exeat requests and view their status
- **Parent**: Can approve or reject their child's exeat requests
- **Dean**: Can approve or reject parent-approved requests
- **Security**: Can verify exeat passes and mark check-in/check-out
- **Admin**: Has full access to the system

## Technologies Used

- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT
- **Frontend**: React, React Router, Axios, Tailwind CSS
- **Testing**: Jest, Supertest, React Testing Library, Cypress
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **QR Code**: qrcode
- **Deployment**: AWS Elastic Beanstalk

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Veritas University Administration
- Student Affairs Department
- All contributors and testers 