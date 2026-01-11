import { ref, set } from 'firebase/database';
import { database } from '../firebase/config';

// Demo user data for testing
export const createDemoUser = async () => {
  const demoUserId = 'demo-user-123';
  
  const demoUserData = {
    uid: demoUserId,
    email: 'demo@gymtracker.com',
    displayName: 'Demo User',
    createdAt: Date.now(),
    settings: {
      units: 'lbs',
      theme: 'dark',
      notifications: true,
      weeklyGoal: 4,
      privacy: 'private'
    },
    stats: {
      totalWorkouts: 15,
      totalVolume: 45000,
      joinDate: Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 days ago
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

  try {
    // Create user profile
    await set(ref(database, `users/${demoUserId}`), demoUserData);
    
    // Create demo workouts
    await set(ref(database, `users/${demoUserId}/workouts`), demoWorkouts);
    
    // Create demo metrics
    await set(ref(database, `users/${demoUserId}/bodyMetrics`), demoMetrics);
    
    console.log('Demo data created successfully!');
  } catch (error) {
    console.error('Error creating demo data:', error);
  }
};

export const DEMO_CREDENTIALS = {
  email: 'demo@gymtracker.com',
  password: 'demo123456'
};