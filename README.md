## JanDrishti - Public Grievance Management System 🗳️

##Project Overview
JanDrishti is a comprehensive Public Grievance Management System designed to facilitate communication between citizens and authorities. The platform enables users to report issues, track their status, and receive updates on resolution progress.
## Features
-User Registration and Authentication
-Issue Reporting with Media Upload
-Real-time Status Updates
-Admin Dashboard
-Issue Tracking System
-Profile Management

## Tech Stack
Frontend: React.js
Backend: Node.js, Express.js
Database: MySQL
Real-time Updates: Socket.IO

## Setup Instructions
Prerequisites
Node.js (v14 or higher)
MySQL Server
npm or yarn

## Backend Setup
1. Navigate to the backend directory:
cd jan-drishti/backend

2.  Install dependencies:
    ```bash
    npm install

3. Create a .env file with the following variables:

PORT=5000
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret


4.  Start the server:
    ```bash
npm start

## User Frontend Setup
1. Navigate to the user frontend directory:
cd frontend-user

2.  Install dependencies:
    ```bash
npm install
Create a .env file:

REACT_APP_API_BASE_URL=http://localhost:5000/api


4.  Start the development server:
    ```bash
npm start
Admin Frontend Setup
Navigate to the admin frontend directory:

cd frontend-admin


2.  Install dependencies:
    ```bash
npm install
Create a .env file:

REACT_APP_API_BASE_URL=http://localhost:5000/api


4.  Start the development server:
    ```bash
npm start
Project Structure
├── frontend-admin/      # Admin dashboard interface
├── frontend-user/       # User interface for citizens
└── jan-drishti/         # Backend server
    └── backend/
Default Admin Credentials
Username: admin

Password: admin123

License
This project is licensed under the MIT License.



