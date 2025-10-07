# SentiCare Monitoring Backend

A comprehensive hospital monitoring system backend API built with Node.js, Express, MongoDB, and Socket.io for real-time patient monitoring and alert management.

## 🏗️ Project Structure

```
monitoring-backend/
│
├── src/
│   ├── config/
│   │   └── db.js              ← MongoDB connection
│   │
│   ├── models/
│   │   ├── Patient.js         ← Patient data schema
│   │   ├── Alert.js           ← Alerts schema
│   │   └── User.js            ← Staff (nurse/doctor/admin)
│   │
│   ├── routes/
│   │   ├── patientRoutes.js   ← CRUD routes for patients
│   │   ├── alertRoutes.js     ← Routes for alert handling
│   │   └── authRoutes.js      ← Login/signup/role-based routes
│   │
│   ├── controllers/
│   │   ├── patientController.js
│   │   ├── alertController.js
│   │   └── authController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js  ← JWT authentication
│   │   └── roleMiddleware.js  ← Access control for roles
│   │
│   ├── utils/
│   │   └── alertSocket.js     ← Socket.io setup for real-time alerts
│   │
│   ├── server.js              ← Main entry (Express + Socket.io)
│   └── .env                   ← Environment variables
│
└── package.json
```

## 🚀 Features

### Core Functionality
- **Patient Management**: Complete CRUD operations for patient records
- **Real-time Monitoring**: Socket.io integration for live vital signs updates
- **Alert System**: Comprehensive alert management with escalation
- **User Authentication**: JWT-based authentication with role-based access
- **Vital Signs Tracking**: Monitor and track patient vital signs
- **Staff Management**: Role-based user management system

### Security Features
- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on authentication endpoints
- CORS protection
- Helmet.js security headers
- Role-based access control

### Real-time Features
- Live vital signs updates
- Instant alert notifications
- Emergency alert broadcasting
- Staff assignment notifications
- Patient status changes

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd monitoring-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration:
   - MongoDB connection string
   - JWT secrets
   - Email configuration
   - Other environment variables

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📋 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/senticare-monitoring

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

```

## 🔧 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run seed` - Seed the database with sample data
- `npm run clean` - Clean logs and uploads directories

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Patients
- `GET /api/patients` - Get all patients (with pagination)
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `POST /api/patients/:id/vital-signs` - Add vital signs
- `GET /api/patients/:id/vital-signs` - Get vital signs history
- `POST /api/patients/:id/notes` - Add patient note
- `GET /api/patients/:id/notes` - Get patient notes

### Alerts
- `GET /api/alerts` - Get all alerts (with pagination)
- `GET /api/alerts/active` - Get active alerts
- `GET /api/alerts/:id` - Get alert by ID
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert
- `PATCH /api/alerts/:id/acknowledge` - Acknowledge alert
- `PATCH /api/alerts/:id/resolve` - Resolve alert
- `PATCH /api/alerts/:id/escalate` - Escalate alert

## 🔐 User Roles

- **Admin**: Full system access
- **Doctor**: Patient management, alert handling, medical records
- **Nurse**: Patient monitoring, vital signs, basic alert management
- **Technician**: Equipment monitoring, technical alerts
- **Receptionist**: Patient registration, basic information

## 🔌 Socket.io Events

### Client to Server
- `joinPatientRoom` - Join patient-specific room
- `leavePatientRoom` - Leave patient-specific room
- `joinAlertRoom` - Join alert-specific room
- `leaveAlertRoom` - Leave alert-specific room
- `vitalSignsUpdate` - Send vital signs update
- `acknowledgeAlert` - Acknowledge an alert
- `resolveAlert` - Resolve an alert
- `emergencyAlert` - Send emergency alert

### Server to Client
- `newAlert` - New alert created
- `alertUpdated` - Alert updated
- `alertAcknowledged` - Alert acknowledged
- `alertResolved` - Alert resolved
- `vitalSignsUpdated` - Vital signs updated
- `patientUpdated` - Patient information updated
- `emergencyAlert` - Emergency alert broadcast

## 🏥 Database Models

### Patient Model
- Personal information (name, DOB, contact)
- Medical information (allergies, medications, history)
- Room and admission details
- Vital signs history
- Assigned staff
- Notes and alerts

### Alert Model
- Alert type and priority
- Patient association
- Status tracking (Active, Acknowledged, Resolved)
- Escalation levels
- Assignment to staff
- Comments and resolution notes

### User Model
- Staff information and credentials
- Role and department
- Professional details
- Permissions and preferences
- Assigned patients

## 🛡️ Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- CORS protection
- Helmet.js security headers
- Input validation and sanitization
- Role-based access control
- Account lockout after failed attempts

## 📊 Monitoring and Health Checks

- Health check endpoint: `GET /health`
- API status endpoint: `GET /api/status`
- Real-time user count tracking
- Error logging and monitoring
- Graceful shutdown handling

## 🚀 Deployment

1. **Environment Setup**
   - Set production environment variables
   - Configure MongoDB Atlas or production database
   - Set up email and SMS services

2. **Build and Deploy**
   ```bash
   npm install --production
   npm start
   ```

3. **Docker Deployment** (Optional)
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --production
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**SentiCare Monitoring System** - Advanced Hospital Patient Monitoring Solution
