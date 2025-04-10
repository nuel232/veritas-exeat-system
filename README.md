# Veritas Exeat System

A web-based exeat management system for Veritas University that streamlines the process of requesting, approving, and managing student exeat permissions.

## Features

- **User Authentication**
  - Student and Admin login
  - Secure password handling
  - Role-based access control

- **Student Features**
  - Submit new exeat requests
  - View request status
  - Download and print approved exeat slips
  - Track request history

- **Admin Features**
  - Review pending exeat requests
  - Approve or reject requests
  - View all exeat records
  - Manage student permissions

- **General Features**
  - PDF generation for approved exeat slips
  - Printable exeat documents
  - Real-time status updates
  - Responsive design for all devices

## Technology Stack

- **Frontend**
  - React.js
  - React Router for navigation
  - Axios for API requests
  - CSS for styling
  - React-to-print for printing functionality
  - jsPDF for PDF generation

- **Backend**
  - Node.js
  - Express.js
  - MongoDB for database
  - JWT for authentication
  - bcrypt for password hashing

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone [repository-url]
   cd veritas-exeat-system
   ```

2. **Install Dependencies**
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd client
   npm install
   ```

3. **Environment Setup**
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     PORT=5000
     ```

4. **Run the Application**
   ```bash
   # Run backend (from root directory)
   npm run dev

   # Run frontend (from client directory)
   cd client
   npm start
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Usage

### Student Account
1. Register/Login with student credentials
2. Navigate to "New Request" to submit an exeat request
3. Fill in required details (reason, destination, dates, emergency contacts)
4. Track request status on dashboard
5. Download/Print approved exeat slips

### Admin Account
1. Login with admin credentials
2. View pending requests on dashboard
3. Review student requests
4. Approve/Reject requests with comments
5. Access complete exeat records

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