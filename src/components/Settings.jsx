import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SimpleAuthContext';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Palette, 
  Target,
  Scale,
  LogOut,
  Save,
  Camera,
  Mail,
  Calendar,
  Award,
  Trash2,
  Download,
  Upload
} from 'lucide-react';

const Settings = () => {
  const { currentUser, userProfile, updateUserProfile, logout } = useAuth();
  const [settings, setSettings] = useState({
    units: 'lbs',
    theme: 'dark',
    notifications: true,
    weeklyGoal: 4,
    privacy: 'private',
    autoBackup: true,
    soundEffects: true,
    emailNotifications: false
  });
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    bio: '',
    goals: '',
    experience: 'beginner'
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (userProfile) {
      setSettings(prev => ({ ...prev, ...userProfile.settings }));
      setProfile({
        displayName: userProfile.displayName || '',
        email: userProfile.email || '',
        bio: userProfile.bio || '',
        goals: userProfile.goals || '',
        experience: userProfile.experience || 'beginner'
      });
    }
  }, [userProfile]);

  const handleSettingsChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleProfileChange = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await updateUserProfile({
        ...userProfile,
        settings,
        ...profile,
        updatedAt: Date.now()
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await logout();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  };

  const exportData = () => {
    // This would export user data as JSON
    alert('Data export feature coming soon!');
  };

  const deleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion feature coming soon!');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data', icon: Download }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Settings</h1>
        <p className="text-dark-400 text-lg">Customize your GymTracker experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card-glass p-4 sticky top-6">
            <div className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'text-dark-300 hover:bg-dark-700/50 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User Info */}
            <div className="mt-6 pt-6 border-t border-dark-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                  <User className="text-white" size={24} />
                </div>
                <div>
                  <div className="font-medium text-dark-100">{profile.displayName}</div>
                  <div className="text-sm text-dark-400">{profile.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="card-glass p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <User className="text-primary-500" size={24} />
                  <h2 className="text-2xl font-semibold">Profile Information</h2>
                </div>

                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                    <User className="text-white" size={32} />
                  </div>
                  <div>
                    <button className="btn-secondary text-sm flex items-center gap-2">
                      <Camera size={16} />
                      Change Photo
                    </button>
                    <p className="text-xs text-dark-400 mt-2">JPG, PNG up to 5MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={(e) => handleProfileChange('displayName', e.target.value)}
                      className="input-field"
                      placeholder="Your display name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      className="input-field"
                      placeholder="Your email address"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    className="input-field"
                    rows="3"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Fitness Goals</label>
                    <textarea
                      value={profile.goals}
                      onChange={(e) => handleProfileChange('goals', e.target.value)}
                      className="input-field"
                      rows="2"
                      placeholder="What are your fitness goals?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Experience Level</label>
                    <select
                      value={profile.experience}
                      onChange={(e) => handleProfileChange('experience', e.target.value)}
                      className="select-field"
                    >
                      <option value="beginner">Beginner (0-1 years)</option>
                      <option value="intermediate">Intermediate (1-3 years)</option>
                      <option value="advanced">Advanced (3-5 years)</option>
                      <option value="expert">Expert (5+ years)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <SettingsIcon className="text-primary-500" size={24} />
                  <h2 className="text-2xl font-semibold">Preferences</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Weight Units</label>
                    <select
                      value={settings.units}
                      onChange={(e) => handleSettingsChange('units', e.target.value)}
                      className="select-field"
                    >
                      <option value="lbs">Pounds (lbs)</option>
                      <option value="kg">Kilograms (kg)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Theme</label>
                    <select
                      value={settings.theme}
                      onChange={(e) => handleSettingsChange('theme', e.target.value)}
                      className="select-field"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Weekly Workout Goal</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={settings.weeklyGoal}
                      onChange={(e) => handleSettingsChange('weeklyGoal', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-primary-400 font-semibold w-16">
                      {settings.weeklyGoal} workout{settings.weeklyGoal !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-dark-100">Sound Effects</div>
                      <div className="text-sm text-dark-400">Play sounds for actions and achievements</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.soundEffects}
                        onChange={(e) => handleSettingsChange('soundEffects', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-dark-100">Auto Backup</div>
                      <div className="text-sm text-dark-400">Automatically backup your data</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoBackup}
                        onChange={(e) => handleSettingsChange('autoBackup', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Bell className="text-primary-500" size={24} />
                  <h2 className="text-2xl font-semibold">Notifications</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-dark-100">Push Notifications</div>
                      <div className="text-sm text-dark-400">Receive notifications in the app</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={(e) => handleSettingsChange('notifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-dark-100">Email Notifications</div>
                      <div className="text-sm text-dark-400">Receive weekly progress reports via email</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingsChange('emailNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab - Removed as requested */}

            {/* Data Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Download className="text-primary-500" size={24} />
                  <h2 className="text-2xl font-semibold">Data Management</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-dark-800/30 rounded-lg p-6 border border-dark-700">
                    <div className="flex items-center gap-3 mb-4">
                      <Download className="text-secondary-500" size={24} />
                      <h3 className="font-semibold">Export Data</h3>
                    </div>
                    <p className="text-sm text-dark-400 mb-4">
                      Download all your workout data, progress photos, and metrics as a JSON file.
                    </p>
                    <button onClick={exportData} className="btn-secondary text-sm">
                      Export My Data
                    </button>
                  </div>

                  <div className="bg-dark-800/30 rounded-lg p-6 border border-dark-700">
                    <div className="flex items-center gap-3 mb-4">
                      <Upload className="text-accent-500" size={24} />
                      <h3 className="font-semibold">Import Data</h3>
                    </div>
                    <p className="text-sm text-dark-400 mb-4">
                      Import workout data from other fitness apps or previous backups.
                    </p>
                    <button className="btn-accent text-sm">
                      Import Data
                    </button>
                  </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Trash2 className="text-red-400" size={24} />
                    <h3 className="font-semibold text-red-400">Danger Zone</h3>
                  </div>
                  <p className="text-sm text-dark-400 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button 
                    onClick={deleteAccount}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-dark-700">
              <button
                onClick={saveSettings}
                disabled={loading}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <Save size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;