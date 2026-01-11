import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Sign up function
  const signup = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, { displayName });
    
    // Create user profile in database
    const userProfileData = {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      createdAt: Date.now(),
      settings: {
        units: 'lbs', // lbs or kg
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
    
    await set(ref(database, `users/${user.uid}`), userProfileData);
    setUserProfile(userProfileData);
    
    return userCredential;
  };

  // Sign in function
  const signin = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  };

  // Sign out function
  const logout = async () => {
    setUserProfile(null);
    return await signOut(auth);
  };

  // Reset password
  const resetPassword = async (email) => {
    return await sendPasswordResetEmail(auth, email);
  };

  // Load user profile
  const loadUserProfile = async (uid) => {
    try {
      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setUserProfile(snapshot.val());
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (!currentUser) return;
    
    const userRef = ref(database, `users/${currentUser.uid}`);
    await set(userRef, { ...userProfile, ...updates });
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  // Get user data path for database operations
  const getUserDataPath = (path) => {
    if (!currentUser) return null;
    return `users/${currentUser.uid}/${path}`;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

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
      {!loading && children}
    </AuthContext.Provider>
  );
};