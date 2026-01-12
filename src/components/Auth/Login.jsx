import { useState } from 'react';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { Eye, EyeOff, Mail, Lock, Dumbbell, ArrowRight } from 'lucide-react';

const Login = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signin, resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signin(email, password);
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'Invalid credentials') {
        setError('Invalid email or password');
      } else if (error.message.includes('email')) {
        setError('Invalid email address');
      } else {
        setError('Failed to sign in. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    try {
      await resetPassword(email);
      alert('Password reset email sent! Check your inbox.');
    } catch (error) {
      setError('Failed to send reset email');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-850 p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="p-5 bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl shadow-2xl shadow-primary-500/25">
              <Dumbbell className="text-white" size={48} />
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-bold gradient-text">GymTracker</h1>
              <p className="text-base text-dark-400 mt-2">Professional Fitness Tracking</p>
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-white">Welcome Back</h2>
            <p className="text-dark-300 text-xl">Sign in to continue your fitness journey</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="card-glass p-10 shadow-2xl border border-dark-600/50">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="error-state p-4 rounded-xl text-center border border-red-500/20">
                <div className="font-medium text-red-400">{error}</div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-3">
              <label className="block text-base font-semibold text-dark-100">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 transform -translate-y-1/2 text-dark-400" size={22} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-5 py-5 bg-dark-700/50 border border-dark-600 rounded-2xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 text-white placeholder-dark-400 text-lg font-medium"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <label className="block text-base font-semibold text-dark-100">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 text-dark-400" size={22} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-14 py-5 bg-dark-700/50 border border-dark-600 rounded-2xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 text-white placeholder-dark-400 text-lg font-medium"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-primary-400 hover:text-primary-300 transition-colors font-semibold text-base"
              >
                Forgot your password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-4 text-xl"
            >
              {loading ? (
                <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={24} />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-10 text-center">
            <p className="text-dark-300 text-xl">
              Don't have an account?{' '}
              <button
                onClick={onToggleMode}
                className="text-primary-400 hover:text-primary-300 font-bold transition-colors"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-dark-500 text-base">
            Secure login powered by advanced encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;