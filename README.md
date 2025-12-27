# 🚨 Rapid Response Hub

A comprehensive emergency response and incident management platform that enables communities to report, track, and respond to emergencies in real-time.

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)

## ✨ Features

### 🔴 Incident Reporting & Management
- **Real-time Incident Feed**: Browse all reported incidents with live updates
- **Detailed Incident Reports**: Report emergencies with location, severity, type, and media attachments
- **Incident Categories**: Fire, Medical Emergency, Accident, Crime, Natural Disaster, and more
- **Severity Levels**: Low, Medium, High, and Critical classifications
- **Status Tracking**: Track incidents from "Reported" → "In Progress" → "Resolved"

### 👍 Verification & De-duplication System
- **Community Verification**: Users can upvote incidents to verify their authenticity
- **Duplicate Prevention**: Track who verified each incident to prevent duplicate votes
- **Auto-Verification**: Incidents with 3+ verifications are automatically marked as verified
- **Visual Indicators**: Verified badge and upvote count displayed on incident cards
- **Toggle Functionality**: Click to verify, click again to remove verification

### 🗺️ Interactive Map View
- **Location-based Visualization**: View all incidents on an interactive map
- **MapLibre GL**: Modern, performant mapping with custom markers
- **Cluster Support**: Group nearby incidents for better visualization
- **Click-to-Details**: Navigate directly to incident details from map markers

### 🆘 SOS Emergency Alerts
- **Quick Emergency Button**: Instantly send SOS alerts in critical situations
- **Multi-Channel Notifications**: 
  - SMS alerts via Twilio
  - Email notifications
  - In-app notifications
- **Emergency Contact Management**: Add and manage personal emergency contacts
- **Location Sharing**: Automatically share location with emergency contacts

### 👤 User Authentication & Profiles
- **Secure Authentication**: JWT-based login and signup system
- **User Roles**: Regular users and admin roles with different permissions
- **Profile Management**: Update personal information, location, and contact details
- **Activity History**: Track your reported incidents and verifications

### 🛡️ Admin Dashboard
- **Incident Management**: Review, update status, and resolve incidents
- **User Management**: View and manage user accounts
- **Statistics & Analytics**: Monitor platform activity and trends
- **Bulk Actions**: Efficiently manage multiple incidents

### 🔔 Real-time Notifications
- **In-app Notifications**: Receive updates about incidents in your area
- **Email Alerts**: Get notified via email for critical incidents
- **SMS Notifications**: Twilio-powered SMS for urgent emergencies
- **Notification Preferences**: Customize what notifications you receive

### 🔒 Security & Privacy
- **Data Validation**: Zod schema validation on all inputs
- **Authentication Middleware**: Protected routes and API endpoints
- **Environment Variables**: Secure credential management
- **Password Hashing**: bcrypt encryption for user passwords

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **TanStack Router** - Type-safe routing
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **MapLibre GL** - Interactive mapping library
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **TypeScript** - Type-safe backend development
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Zod** - Schema validation
- **bcrypt** - Password hashing

### Notifications & Communication
- **Twilio** - SMS notifications
- **Nodemailer** - Email notifications
- **SMTP** - Email transport protocol

### DevOps & Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **Git** - Version control
- **GitHub** - Code repository

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Twilio account (for SMS notifications)
- Gmail account (for email notifications)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sharath2004-tech/rapid-response-.git
cd rapid-response-hub-main
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

3. **Environment Setup**

Create `.env` in the root directory:
```env
VITE_MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
FRONTEND_URL=http://localhost:5173

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

4. **Start the development servers**

```bash
# Terminal 1: Start frontend (from root)
npm run dev

# Terminal 2: Start backend (from root)
cd server
npm run dev
```

The frontend will run on `http://localhost:5173` and the backend on `http://localhost:5000`.

### Seed Admin Account

To create an admin account:
```bash
cd server
npx tsx seed-admin.ts
```

Default admin credentials:
- Email: `admin@rapidresponse.com`
- Password: `Admin@123`

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables:
   - `VITE_API_URL`: Your backend URL

### Backend Deployment (Render)

1. Push your code to GitHub
2. Go to [Render](https://render.com) and create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && node --loader tsx index.ts`
   - Add all environment variables from `.env`

Or use the included `render.yaml` for one-click deployment.

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Incident Endpoints
- `GET /api/incidents` - Get all incidents
- `GET /api/incidents/:id` - Get incident details
- `POST /api/incidents` - Create new incident
- `PUT /api/incidents/:id` - Update incident
- `DELETE /api/incidents/:id` - Delete incident
- `POST /api/incidents/:id/verify` - Toggle verification
- `GET /api/incidents/:id/verify/status` - Get verification status

### SOS Endpoints
- `POST /api/sos` - Create SOS alert
- `GET /api/sos/:userId` - Get user's SOS alerts

### Emergency Contacts
- `GET /api/emergency-contacts` - Get user's contacts
- `POST /api/emergency-contacts` - Add contact
- `PUT /api/emergency-contacts/:id` - Update contact
- `DELETE /api/emergency-contacts/:id` - Delete contact

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

If you encounter any issues, please [create an issue](https://github.com/sharath2004-tech/rapid-response-/issues) on GitHub.

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Maps powered by [MapLibre GL](https://maplibre.org/)

---

**Made with ❤️ for safer communities**
