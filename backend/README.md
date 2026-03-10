# Educonnect Backend

This is the backend server for the Educonnect mobile application.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory with:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/educonnect
PORT=5000
```

### 3. Firebase Admin SDK
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file and save it as `config/serviceAccountKey.json`
4. Replace the placeholder content in the existing file

### 4. Run the Server
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### User Routes (All protected)
- `GET /api/user/me` - Get current user profile
- `PUT /api/user/me` - Update user profile
- `PUT /api/user/stats` - Update user statistics

### Health Check
- `GET /api/health` - Server health check

## Authentication
The backend uses Firebase Admin SDK to verify JWT tokens from the mobile app. Users are automatically created in MongoDB when they first authenticate.

## Database Schema
- **Users**: Stores user profile data, statistics, and preferences
- **Authentication**: Handled by Firebase Auth
- **Database**: MongoDB
