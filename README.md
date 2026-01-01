# CourseNexus

CourseNexus is a full-stack course marketplace platform that enables course creators (admins) to create and manage courses, and allows users to browse, purchase, and manage their course library.

## Overview

CourseNexus provides a complete solution for course management with separate interfaces for administrators and students. Administrators can create courses with detailed information including title, description, price, and images. Users can browse available courses, purchase them, and manage their purchased course collection.

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (via Mongoose)
- **JWT** - Authentication (cookie-based)
- **bcrypt** - Password hashing
- **Zod** - Input validation
- **Swagger/OpenAPI** - API documentation

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Recoil** - State management
- **Axios** - HTTP client
- **Zod** - Client-side validation

## Key Features

- **User Authentication**: Separate signup/signin flows for users and admins with JWT-based authentication
- **Course Management**: Admins can create, update, and view their created courses
- **Course Marketplace**: Users can browse all available courses with pagination
- **Purchase System**: Users can purchase courses and manage their purchased course library
- **Refund System**: Users can refund purchased courses
- **Input Validation**: Comprehensive validation on both client and server using Zod
- **API Documentation**: Interactive Swagger UI for API exploration

## API Documentation

The API is fully documented using Swagger/OpenAPI. Interactive documentation is available at:

- **Local**: `http://localhost:3000/api-docs`
- **Production**: https://coursenexus-backend.onrender.com/api-docs/

The API documentation includes all endpoints for:
- User authentication and management
- Admin authentication and course management
- Course browsing and purchasing

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
MONGO_URI=your_mongodb_connection_string
JWT_USER_SECRET=your_user_jwt_secret_key
JWT_ADMIN_SECRET=your_admin_jwt_secret_key
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

The backend server will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```
VITE_BACKEND_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

The frontend application will run on `http://localhost:5173`

### Production Build

To build the frontend for production:
```bash
cd frontend
npm run build
```

The production build will be in the `frontend/dist` directory.

## Project Structure

```
course selling app/
├── backend/
│   ├── database/          # MongoDB models and connection
│   ├── middleware/         # Authentication middleware
│   ├── routes/            # API route handlers
│   ├── validation/        # Input validation schemas
│   ├── swagger.js         # Swagger configuration
│   └── index.js           # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── store/         # Recoil state management
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   └── validation/        # Client-side validation
└── README.md
```

## Authentication

The application uses JWT tokens stored in HTTP-only cookies for authentication. Separate secrets are used for user and admin tokens to maintain security boundaries. Cookies are configured with appropriate security settings based on the environment (development vs production).

## License

ISC
