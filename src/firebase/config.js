import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Simplified Firebase config for demo
const firebaseConfig = {
  databaseURL: "https://gymwe-47c13-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "gymwe-47c13",
  storageBucket: "gymwe-47c13.appspot.com",
  apiKey: "demo-key",
  authDomain: "gymwe-47c13.firebaseapp.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

let app, database, storage, auth;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  storage = getStorage(app);
  auth = getAuth(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  // Create mock objects for offline mode
  database = {
    ref: () => ({ push: () => ({}), set: () => Promise.resolve() }),
    push: () => ({}),
    set: () => Promise.resolve(),
    get: () => Promise.resolve({ exists: () => false, val: () => null })
  };
  storage = {
    ref: () => ({ uploadBytes: () => Promise.resolve(), getDownloadURL: () => Promise.resolve('') })
  };
  auth = {};
}

export { database, storage, auth };
export default app;