import { useState } from 'react';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { Eye, EyeOff, Mail, Lock, User, Dumbbell, ArrowRight } from 'lucide-react';

const Signup = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    if (!formData.displayName.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.email) {
      setError('Please enter your email');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      await signup(formData.email, formData.password, formData.displayName);
    } catch (error) {
      console.error('Signup error:', error);
      if (error.message === 'User already exists') {
        setError('An account with this email already exists');
      } else if (error.message.includes('email')) {
        setError('Invalid email address');
      } else if (error.message.includes('password')) {
        setError('Password is too weak');
      } else {
        setError('Failed to create account. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-850 p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-2xl shadow-primary-500/25">
              <Dumbbell className="text-white" size={40} />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold gradient-text">GymTracker</h1>
              <p className="text-base text-dark-400 mt-1">Professional Fitness Tracking</p>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Create Account</h2>
            <p className="text-dark-300 text-lg">Start your fitness journey today</p>
          </div>
        </div>

        {/* Signup Form */}
        <div className="card-glass p-8 border border-dark-600/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="error-state p-4 rounded-xl text-center border border-red-500/20">
                <div className="font-medium text-red-400">{error}</div>
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-base font-semibold text-dark-100">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" size={20} />
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-dark-700/50 border border-dark-600 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 text-white placeholder-dark-400 text-base font-medium"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-base font-semibold text-dark-100">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-dark-700/50 border border-dark-600 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 text-white placeholder-dark-400 text-base font-medium"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-base font-semibold text-dark-100">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-4 bg-dark-700/50 border border-dark-600 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 text-white placeholder-dark-400 text-base font-medium"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-sm text-dark-400 mt-1">Must be at least 6 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-base font-semibold text-dark-100">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-4 bg-dark-700/50 border border-dark-600 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 text-white placeholder-dark-400 text-base font-medium"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-dark-300 text-lg">
              Already have an account?{' '}
              <button
                onClick={onToggleMode}
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-8 text-center">
          <p className="text-sm text-dark-500">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-primary-400 hover:text-primary-300">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary-400 hover:text-primary-300">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;