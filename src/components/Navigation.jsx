import React from 'react';
import { 
  PlusCircle, 
  BarChart3, 
  User, 
  Trophy, 
  Menu,
  X,
  Dumbbell,
  Target,
  Calendar,
  Settings
} from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'from-blue-500 to-blue-600' },
    { id: 'logger', label: 'Log Workout', icon: PlusCircle, color: 'from-green-500 to-green-600' },
    { id: 'charts', label: 'Analytics', icon: Target, color: 'from-purple-500 to-purple-600' },
    { id: 'metrics', label: 'Body Metrics', icon: User, color: 'from-orange-500 to-orange-600' },
    { id: 'records', label: 'Records', icon: Trophy, color: 'from-yellow-500 to-yellow-600' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'from-pink-500 to-pink-600' },
  ];

  return (
    <>
      {/* Mobile Menu Button - Larger for gym use */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="glass p-4 rounded-2xl text-white hover:bg-dark-700/50 transition-all duration-200 shadow-lg"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <nav className={`
        fixed md:static top-0 left-0 h-full md:h-auto w-72 md:w-64
        glass md:bg-transparent border-r border-dark-700/50 md:border-r-0
        transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:transform-none
        transition-all duration-300 ease-in-out z-40 md:z-auto
        md:flex md:flex-col md:border-r md:border-dark-700
      `}>
        <div className="p-6 md:p-4">
          {/* Logo/Title */}
          <div className="mb-8 md:mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg">
                <Dumbbell className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">GymTracker</h1>
                <p className="text-xs text-dark-400">Pro Fitness</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-4 px-6 py-4 rounded-2xl
                    transition-all duration-200 group relative overflow-hidden
                    text-lg font-medium min-h-[64px]
                    ${isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : 'text-dark-300 hover:bg-dark-700/50 hover:text-white'
                    }
                  `}
                >
                  <Icon size={24} className={`${isActive ? 'text-white' : 'text-dark-400 group-hover:text-white'} transition-colors`} />
                  <span className="font-semibold">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-3 w-3 h-3 bg-white rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Settings */}
          <div className="mt-8 pt-6 border-t border-dark-700">
            <div className="text-xs text-dark-500 mb-3 px-4">Account</div>
            <button 
              onClick={() => {
                setActiveTab('settings');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-dark-300 hover:bg-dark-700/50 hover:text-white transition-all duration-200 text-lg font-medium min-h-[64px] ${
                activeTab === 'settings' ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white' : ''
              }`}
            >
              <Settings size={24} />
              <span className="font-semibold">Settings</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;