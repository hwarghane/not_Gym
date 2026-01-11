import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/SimpleAuthContext';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import WorkoutLogger from './components/WorkoutLogger';
import ProgressCharts from './components/ProgressCharts';
import BodyMetrics from './components/BodyMetrics';
import PersonalRecords from './components/PersonalRecords';
import WorkoutCalendar from './components/WorkoutCalendar';
import Settings from './components/Settings';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import './index.css';

const AuthenticatedApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser } = useAuth();

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'logger':
        return <WorkoutLogger />;
      case 'charts':
        return <ProgressCharts />;
      case 'metrics':
        return <BodyMetrics />;
      case 'records':
        return <PersonalRecords />;
      case 'calendar':
        return <WorkoutCalendar />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-850">
      <div className="flex">
        {/* Navigation Sidebar */}
        <Navigation 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Main Content */}
        <main className="flex-1 md:ml-0 min-h-screen">
          {/* Header */}
          <header className="glass border-b border-dark-700/50 p-4 md:p-6 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="md:hidden"></div> {/* Spacer for mobile menu button */}
                <div className="hidden md:flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg">
                    <span className="text-white text-xl">💪</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold gradient-text">GymTracker Pro</h1>
                    <p className="text-xs text-dark-400">Professional Fitness Tracking</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-dark-800/50 rounded-full">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-dark-300">
                      Welcome, {currentUser?.displayName || 'User'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="relative">
            {renderActiveComponent()}
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay Background */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30" />
      )}
    </div>
  );
};

const AuthWrapper = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-850 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-dark-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return isLogin ? (
      <Login onToggleMode={() => setIsLogin(false)} />
    ) : (
      <Signup onToggleMode={() => setIsLogin(true)} />
    );
  }

  return <AuthenticatedApp />;
};

function App() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
}

export default App;