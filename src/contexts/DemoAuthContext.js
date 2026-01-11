import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, set, get } from 'firebase/database';
import { database } from '../firebase/config';

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

// Initialize demo data
const initializeDemoData = async () => {
  const demoUserId = 'demo-user-123';
  
  try {
    // Check if demo data already exists
    const userRef = ref(database, `users/${demoUserId}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      // Create demo user profile
      const demoUserData = {
        uid: demoUserId,
        email: 'demo@gymtracker.com',
        displayName: 'Demo User',
        bio: 'Fitness enthusiast and demo user',
        goals: 'Build muscle and track progress',
        experience: 'intermediate',
        createdAt: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
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
          totalWorkouts: 15,
          totalVolume: 45000,
          joinDate: Date.now() - (30 * 24 * 60 * 60 * 1000)
        }
      };

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
            },
            {
              name: 'Tricep Dips',
              muscleGroup: 'Arms',
              sets: 3,
              reps: 12,
              weight: 0,
              volume: 0,
              oneRepMax: 0
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
            },
            {
              name: 'Bicep Curls',
              muscleGroup: 'Arms',
              sets: 3,
              reps: 10,
              weight: 45,
              volume: 1350,
              oneRepMax: 60
            }
          ],
          totalVolume: 4725,
          timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000)
        },
        'workout3': {
          name: 'Leg Day',
          date: '2024-01-19',
          exercises: [
            {
              name: 'Squat',
              muscleGroup: 'Legs',
              sets: 4,
              reps: 8,
              weight: 205,
              volume: 6560,
              oneRepMax: 256
            },
            {
              name: 'Romanian Deadlift',
              muscleGroup: 'Legs',
              sets: 3,
              reps: 10,
              weight: 155,
              volume: 4650,
              oneRepMax: 207
            },
            {
              name: 'Calf Raises',
              muscleGroup: 'Legs',
              sets: 4,
              reps: 15,
              weight: 135,
              volume: 8100,
              oneRepMax: 225
            }
          ],
          totalVolume: 19310,
          timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000)
        }
      };

      // Demo body metrics
      const demoMetrics = {
        'metric1': {
          date: '2024-01-01',
          weight: 178,
          bodyFat: 16.2,
          notes: 'Starting measurements for the year',
          timestamp: Date.now() - (20 * 24 * 60 * 60 * 1000)
        },
        'metric2': {
          date: '2024-01-10',
          weight: 180,
          bodyFat: 15.8,
          notes: 'Good progress with strength training',
          timestamp: Date.now() - (10 * 24 * 60 * 60 * 1000)
        },
        'metric3': {
          date: '2024-01-20',
          weight: 182,
          bodyFat: 15.2,
          notes: 'Muscle gain is showing!',
          timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000)
        }
      };

      // Save all demo data
      await set(ref(database, `users/${demoUserId}`), demoUserData);
      await set(ref(database, `users/${demoUserId}/workouts`), demoWorkouts);
      await set(ref(database, `users/${demoUserId}/bodyMetrics`), demoMetrics);
      
      console.log('Demo data initialized successfully!');
    }
  } catch (error) {
    console.error('Error initializing demo data:', error);
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
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      loadUserProfile(user.uid);
    } else {
      setLoading(false);
    }
  }, []);

  // Sign up function (demo version)
  const signup = async (email, password, displayName) => {
    try {
      // Check if user already exists in demo users
      if (DEMO_USERS[email]) {
        throw new Error('User already exists');
      }

      // Check if user already exists in local storage
      const allUsers = JSON.parse(localStorage.getItem('gymtracker_all_users') || '{}');
      if (allUsers[email]) {
        throw new Error('User already exists');
      }

      // Create new user
      const newUser = {
        uid: `user-${Date.now()}`,
        email: email,
        displayName: displayName,
        password: password, // Store for login
        createdAt: Date.now()
      };

      // Create user profile in database
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

      try {
        // Save to database
        await set(ref(database, `users/${newUser.uid}`), userProfileData);
        console.log('User profile saved to database');
      } catch (dbError) {
        console.warn('Database save failed, continuing with local storage:', dbError);
        // Continue even if database fails - for demo purposes
      }
      
      // Save user credentials for future login
      allUsers[email] = newUser;
      localStorage.setItem('gymtracker_all_users', JSON.stringify(allUsers));
      
      // Save current user session
      localStorage.setItem('gymtracker_user', JSON.stringify(newUser));
      
      setCurrentUser(newUser);
      setUserProfile(userProfileData);
      
      return { user: newUser };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Sign in function (demo version)
  const signin = async (email, password) => {
    try {
      // Check demo users first
      if (DEMO_USERS[email] && DEMO_USERS[email].password === password) {
        const user = DEMO_USERS[email];
        localStorage.setItem('gymtracker_user', JSON.stringify(user));
        setCurrentUser(user);
        
        // Initialize demo data if it's the demo user
        if (email === 'demo@gymtracker.com') {
          try {
            await initializeDemoData();
          } catch (demoError) {
            console.warn('Demo data initialization failed:', demoError);
          }
        }
        
        await loadUserProfile(user.uid);
        return { user };
      }

      // Check if user exists in local storage (for users created via signup)
      const allUsers = JSON.parse(localStorage.getItem('gymtracker_all_users') || '{}');
      if (allUsers[email] && allUsers[email].password === password) {
        const user = allUsers[email];
        localStorage.setItem('gymtracker_user', JSON.stringify(user));
        setCurrentUser(user);
        await loadUserProfile(user.uid);
        return { user };
      }

      // Invalid credentials
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
    // In demo mode, just show success message
    return Promise.resolve();
  };

  // Load user profile
  const loadUserProfile = async (uid) => {
    try {
      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setUserProfile(snapshot.val());
      } else {
        // Create default profile if it doesn't exist
        const defaultProfile = {
          uid: uid,
          email: currentUser?.email || '',
          displayName: currentUser?.displayName || 'User',
          createdAt: Date.now(),
          settings: {
            units: 'lbs',
            theme: 'dark',
            notifications: true,
            weeklyGoal: 4,
            privacy: 'private'
          },
          stats: {
            totalWorkouts: 0,
            totalVolume: 0,
            joinDate: Date.now()
          }
        };
        await set(userRef, defaultProfile);
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
      const userRef = ref(database, `users/${currentUser.uid}`);
      const updatedProfile = { ...userProfile, ...updates };
      await set(userRef, updatedProfile);
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