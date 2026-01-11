import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Demo users for testing
const DEMO_USERS = {
  'demo@gymtracker.com': {
    uid: 'demo-user-123',
    email: 'demo@gymtracker.com',
    displayName: 'Demo User',
    password: 'demo123456'
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Check for existing session on load
  useEffect(() => {
    const savedUser = localStorage.getItem('gymtracker_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        loadUserProfile(user.uid);
      } catch (error) {
        console.error('Error loading saved user:', error);
        localStorage.removeItem('gymtracker_user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Sign up function
  const signup = async (email, password, displayName) => {
    try {
      // Check if user already exists
      const allUsers = JSON.parse(localStorage.getItem('gymtracker_all_users') || '{}');
      if (allUsers[email] || DEMO_USERS[email]) {
        throw new Error('User already exists');
      }

      // Create new user
      const newUser = {
        uid: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: email,
        displayName: displayName,
        password: password,
        createdAt: Date.now()
      };

      // Create user profile
      const userProfileData = {
        uid: newUser.uid,
        email: newUser.email,
        displayName: displayName,
        bio: '',
        goals: '',
        experience: 'beginner',
        createdAt: Date.now(),
        settings: {
          units: 'lbs',
          theme: 'dark',
          notifications: true,
          weeklyGoal: 4,
          privacy: 'private',
          autoBackup: true,
          soundEffects: true,
          emailNotifications: false
        },
        stats: {
          totalWorkouts: 0,
          totalVolume: 0,
          joinDate: Date.now()
        }
      };

      // Save user credentials
      allUsers[email] = newUser;
      localStorage.setItem('gymtracker_all_users', JSON.stringify(allUsers));
      
      // Save user profile
      localStorage.setItem(`gymtracker_profile_${newUser.uid}`, JSON.stringify(userProfileData));
      
      // Save current session
      localStorage.setItem('gymtracker_user', JSON.stringify(newUser));
      
      setCurrentUser(newUser);
      setUserProfile(userProfileData);
      
      console.log('User created successfully:', newUser.email);
      return { user: newUser };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Sign in function
  const signin = async (email, password) => {
    try {
      // Check demo users first
      if (DEMO_USERS[email] && DEMO_USERS[email].password === password) {
        const user = DEMO_USERS[email];
        localStorage.setItem('gymtracker_user', JSON.stringify(user));
        setCurrentUser(user);
        
        // Create demo data if needed
        createDemoData(user.uid);
        await loadUserProfile(user.uid);
        return { user };
      }

      // Check registered users
      const allUsers = JSON.parse(localStorage.getItem('gymtracker_all_users') || '{}');
      if (allUsers[email] && allUsers[email].password === password) {
        const user = allUsers[email];
        localStorage.setItem('gymtracker_user', JSON.stringify(user));
        setCurrentUser(user);
        await loadUserProfile(user.uid);
        return { user };
      }

      throw new Error('Invalid credentials');
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  };

  // Sign out function
  const logout = async () => {
    localStorage.removeItem('gymtracker_user');
    setCurrentUser(null);
    setUserProfile(null);
  };

  // Reset password (demo version)
  const resetPassword = async (email) => {
    return Promise.resolve();
  };

  // Load user profile
  const loadUserProfile = async (uid) => {
    try {
      const savedProfile = localStorage.getItem(`gymtracker_profile_${uid}`);
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      } else {
        // Create default profile
        const defaultProfile = {
          uid: uid,
          email: currentUser?.email || '',
          displayName: currentUser?.displayName || 'User',
          bio: '',
          goals: '',
          experience: 'beginner',
          createdAt: Date.now(),
          settings: {
            units: 'lbs',
            theme: 'dark',
            notifications: true,
            weeklyGoal: 4,
            privacy: 'private',
            autoBackup: true,
            soundEffects: true,
            emailNotifications: false
          },
          stats: {
            totalWorkouts: 0,
            totalVolume: 0,
            joinDate: Date.now()
          }
        };
        localStorage.setItem(`gymtracker_profile_${uid}`, JSON.stringify(defaultProfile));
        setUserProfile(defaultProfile);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (!currentUser) return;
    
    try {
      const updatedProfile = { ...userProfile, ...updates };
      localStorage.setItem(`gymtracker_profile_${currentUser.uid}`, JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Get user data path for database operations
  const getUserDataPath = (path) => {
    if (!currentUser) return null;
    return `users/${currentUser.uid}/${path}`;
  };

  // Create demo data for demo user
  const createDemoData = (uid) => {
    if (uid !== 'demo-user-123') return;

    // Demo workouts
    const demoWorkouts = {
      'workout1': {
        name: 'Push Day',
        date: '2024-01-15',
        exercises: [
          {
            name: 'Bench Press',
            muscleGroup: 'Chest',
            sets: 3,
            reps: 8,
            weight: 185,
            volume: 4440,
            oneRepMax: 231
          },
          {
            name: 'Overhead Press',
            muscleGroup: 'Shoulders',
            sets: 3,
            reps: 10,
            weight: 135,
            volume: 4050,
            oneRepMax: 180
          }
        ],
        totalVolume: 8490,
        timestamp: Date.now() - (5 * 24 * 60 * 60 * 1000)
      },
      'workout2': {
        name: 'Pull Day',
        date: '2024-01-17',
        exercises: [
          {
            name: 'Deadlift',
            muscleGroup: 'Back',
            sets: 3,
            reps: 5,
            weight: 225,
            volume: 3375,
            oneRepMax: 253
          },
          {
            name: 'Pull-ups',
            muscleGroup: 'Back',
            sets: 3,
            reps: 12,
            weight: 0,
            volume: 0,
            oneRepMax: 0
          }
        ],
        totalVolume: 3375,
        timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000)
      }
    };

    // Demo body metrics
    const demoMetrics = {
      'metric1': {
        date: '2024-01-10',
        weight: 180,
        bodyFat: 15.5,
        notes: 'Starting measurements',
        timestamp: Date.now() - (10 * 24 * 60 * 60 * 1000)
      },
      'metric2': {
        date: '2024-01-20',
        weight: 182,
        bodyFat: 15.2,
        notes: 'Good progress',
        timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000)
      }
    };

    // Save demo data to localStorage
    localStorage.setItem(`gymtracker_workouts_${uid}`, JSON.stringify(demoWorkouts));
    localStorage.setItem(`gymtracker_metrics_${uid}`, JSON.stringify(demoMetrics));
  };

  const value = {
    currentUser,
    userProfile,
    signup,
    signin,
    logout,
    resetPassword,
    updateUserProfile,
    getUserDataPath,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};