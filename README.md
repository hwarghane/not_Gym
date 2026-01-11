# 💪 GymTracker Pro - Professional Fitness Tracking

A comprehensive web application for tracking gym workouts, monitoring strength progression, and visualizing fitness data with multi-user authentication.

## 🚀 New Features

### 🔐 **User Authentication**
- **Secure Login/Signup** with Firebase Auth
- **User-specific data** - Each user has their own workout data
- **Profile management** with customizable settings
- **Demo account** available for testing

### ⚙️ **Comprehensive Settings**
- **Profile customization** - Name, bio, fitness goals
- **Preferences** - Units (lbs/kg), theme, weekly goals
- **Notifications** - Push and email notification controls
- **Privacy settings** - Control data visibility
- **Data management** - Export/import functionality

### 🎯 **Functional Quick Actions**
- **Log Today's Workout** - Direct navigation to workout logger
- **Update Body Metrics** - Quick access to body tracking
- **View Full Analytics** - Jump to detailed progress charts

## 🏗️ **Multi-User Database Structure**

```
users/
  {userId}/
    profile: { name, email, settings, stats }
    workouts/
      {workoutId}: { name, date, exercises, totalVolume }
    bodyMetrics/
      {metricId}: { date, weight, bodyFat, photos }
```

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure login/signup with Firebase Auth
- **Workout Logger**: Log exercises with sets, reps, and weights
- **Progress Analytics**: Visual charts showing strength and volume trends
- **Body Metrics**: Track weight, body fat, and progress photos
- **Personal Records**: Automatic PR tracking and celebration
- **1RM Calculator**: Real-time one-rep max estimation using Brzycki formula
- **Volume Tracking**: Automatic calculation of total workout volume
- **Calendar View**: Monthly workout tracking with intensity heatmap

### Technical Features
- **Multi-user Support**: Each user has isolated data
- **Mobile-First Design**: Responsive UI optimized for phone entry
- **Real-Time Data**: Firebase Realtime Database integration
- **Photo Storage**: Progress photo gallery with Firebase Storage
- **Interactive Charts**: Dynamic visualizations with Chart.js
- **Data Filtering**: Filter by date ranges and specific exercises
- **Muscle Group Analysis**: Pie charts for training distribution

## 🛠️ Tech Stack

- **Frontend**: React 18 with modern hooks
- **Authentication**: Firebase Auth
- **Database**: Firebase Realtime Database (user-specific paths)
- **Storage**: Firebase Storage for images
- **Styling**: Tailwind CSS for responsive design
- **Charts**: Chart.js with React-ChartJS-2
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast

## 📱 Mobile-First Design

The app is designed with mobile users in mind:
- Touch-friendly interface
- Optimized input forms
- Responsive navigation
- Quick workout entry
- Swipe-friendly charts

## 🔧 Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication, Realtime Database, and Storage

2. **Configure Authentication**
   - Enable Email/Password authentication
   - Optionally enable Google, Facebook, etc.

3. **Set up Realtime Database**
   - Create database in test mode
   - Update security rules for user-specific data:

```javascript
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

4. **Update Firebase Config**
   - Copy your Firebase config from Project Settings
   - Update `src/firebase/config.js` with your credentials:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.region.firebasedatabase.app/",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gym-progress-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Update `src/firebase/config.js` with your Firebase configuration
   - Ensure your Firebase project has Authentication, Realtime Database, and Storage enabled

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 👤 Demo Account

For testing purposes, you can use the demo account:
- **Email**: demo@gymtracker.com
- **Password**: demo123456

## 📊 User Data Structure

### User Profile
```javascript
{
  uid: "user-id",
  email: "user@example.com",
  displayName: "User Name",
  bio: "Fitness enthusiast",
  goals: "Build muscle and strength",
  experience: "intermediate",
  settings: {
    units: "lbs",
    theme: "dark",
    notifications: true,
    weeklyGoal: 4,
    privacy: "private"
  },
  stats: {
    totalWorkouts: 50,
    totalVolume: 150000,
    joinDate: 1640995200000
  }
}
```

### Workout Data
```javascript
{
  name: "Push Day",
  date: "2024-01-15",
  exercises: [
    {
      name: "Bench Press",
      muscleGroup: "Chest",
      sets: 3,
      reps: 8,
      weight: 185,
      volume: 4440,
      oneRepMax: 231
    }
  ],
  totalVolume: 4440,
  timestamp: 1705123456789
}
```

### Body Metrics
```javascript
{
  date: "2024-01-15",
  weight: 180.5,
  bodyFat: 15.2,
  photoUrl: "https://...",
  notes: "Feeling strong today",
  timestamp: 1705123456789
}
```

## 🎯 Usage Tips

1. **Account Creation**: Sign up with email/password or use the demo account
2. **Consistent Logging**: Log workouts immediately after training for best results
3. **Photo Progress**: Take progress photos in consistent lighting and poses
4. **Exercise Names**: Use consistent exercise names for accurate tracking
5. **Weight Units**: Choose your preferred units in settings (lbs/kg)
6. **Privacy**: Control who can see your data in privacy settings

## 🔧 Customization

### Adding New Exercises
Edit `src/components/WorkoutLogger.jsx` and update the `COMMON_EXERCISES` object:

```javascript
const COMMON_EXERCISES = {
  'Chest': ['Bench Press', 'Incline Press', 'Your New Exercise'],
  // ... other muscle groups
};
```

### Modifying Muscle Groups
Update the `MUSCLE_GROUPS` array in the same file:

```javascript
const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio', 'Your New Group'
];
```

## 📈 Future Enhancements

- Social features and friend connections
- Workout templates and routines
- Advanced analytics and insights
- Nutrition tracking integration
- Wearable device synchronization
- Offline mode support
- Mobile app (React Native)
- AI-powered workout recommendations

## 🔒 Security Features

- **User Authentication**: Secure Firebase Auth
- **Data Isolation**: Each user's data is completely separate
- **Privacy Controls**: Users control data visibility
- **Secure Storage**: All data encrypted in transit and at rest
- **Password Reset**: Built-in password recovery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Firebase for backend services
- Chart.js for beautiful visualizations
- Tailwind CSS for rapid styling
- Lucide for clean icons
- The fitness community for inspiration

---

**Start tracking your progress today and achieve your fitness goals! 💪**

*Now with multi-user support, comprehensive settings, and professional authentication!*