import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase/config';
import { useAuth } from '../contexts/SimpleAuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target, 
  Award, 
  Activity,
  Clock,
  Zap,
  BarChart3,
  Users
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import { format, subDays, isAfter } from 'date-fns';

const Dashboard = ({ setActiveTab }) => {
  const { getUserDataPath, currentUser } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const workoutsPath = getUserDataPath('workouts');
    const metricsPath = getUserDataPath('bodyMetrics');
    
    if (!workoutsPath || !metricsPath) {
      setLoading(false);
      return;
    }

    // For localStorage-based data
    if (currentUser) {
      try {
        // Load workouts from localStorage
        const savedWorkouts = localStorage.getItem(`gymtracker_workouts_${currentUser.uid}`);
        if (savedWorkouts) {
          const workoutsData = JSON.parse(savedWorkouts);
          const workoutsList = Object.keys(workoutsData).map(key => ({
            id: key,
            ...workoutsData[key]
          })).sort((a, b) => new Date(b.date) - new Date(a.date));
          setWorkouts(workoutsList);
        }

        // Load metrics from localStorage
        const savedMetrics = localStorage.getItem(`gymtracker_metrics_${currentUser.uid}`);
        if (savedMetrics) {
          const metricsData = JSON.parse(savedMetrics);
          const metricsList = Object.keys(metricsData).map(key => ({
            id: key,
            ...metricsData[key]
          })).sort((a, b) => new Date(b.date) - new Date(a.date));
          setMetrics(metricsList);
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
      setLoading(false);
    }
  }, [getUserDataPath, currentUser]);

  // Calculate stats
  const getStats = () => {
    const last7Days = subDays(new Date(), 7);
    const last30Days = subDays(new Date(), 30);
    
    const recentWorkouts = workouts.filter(w => isAfter(new Date(w.date), last7Days));
    const monthlyWorkouts = workouts.filter(w => isAfter(new Date(w.date), last30Days));
    
    const totalVolume = workouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
    const avgVolume = workouts.length > 0 ? Math.round(totalVolume / workouts.length) : 0;
    
    const currentWeight = metrics.find(m => m.weight)?.weight || 0;
    const previousWeight = metrics.length > 1 ? metrics[1]?.weight || currentWeight : currentWeight;
    const weightChange = currentWeight - previousWeight;
    
    return {
      totalWorkouts: workouts.length,
      weeklyWorkouts: recentWorkouts.length,
      monthlyWorkouts: monthlyWorkouts.length,
      totalVolume,
      avgVolume,
      currentWeight,
      weightChange,
      streak: calculateStreak()
    };
  };

  const calculateStreak = () => {
    if (workouts.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < workouts.length; i++) {
      const workoutDate = new Date(workouts[i].date);
      const daysDiff = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= streak + 1) {
        streak++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Get recent activity data for chart
  const getActivityData = () => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i);
      const workoutsOnDate = workouts.filter(w => 
        format(new Date(w.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      return {
        date: format(date, 'MMM dd'),
        workouts: workoutsOnDate.length,
        volume: workoutsOnDate.reduce((sum, w) => sum + (w.totalVolume || 0), 0)
      };
    });

    return {
      labels: last14Days.map(d => d.date),
      datasets: [
        {
          label: 'Volume',
          data: last14Days.map(d => d.volume),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        }
      ]
    };
  };

  // Get muscle group distribution
  const getMuscleGroupData = () => {
    const muscleGroups = {};
    
    workouts.forEach(workout => {
      if (workout.exercises) {
        workout.exercises.forEach(exercise => {
          const group = exercise.muscleGroup || 'Other';
          muscleGroups[group] = (muscleGroups[group] || 0) + 1;
        });
      }
    });

    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
      '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
    ];

    return {
      labels: Object.keys(muscleGroups),
      datasets: [
        {
          data: Object.values(muscleGroups),
          backgroundColor: colors.slice(0, Object.keys(muscleGroups).length),
          borderWidth: 0,
        }
      ]
    };
  };

  const stats = getStats();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      }
    },
    elements: {
      point: {
        radius: 0,
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          padding: 20,
          usePointStyle: true,
        }
      },
    },
    cutout: '70%',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8 animate-fade-in">
      {/* Mobile-Optimized Header */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Welcome Back!</h1>
        <p className="text-dark-400 text-base md:text-lg">Here's your fitness journey overview</p>
      </div>

      {/* Quick Stats Grid - Mobile First */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="stat-card p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="text-primary-500" size={20} />
            <span className="text-xl md:text-2xl font-bold text-primary-400">{stats.weeklyWorkouts}</span>
          </div>
          <p className="text-dark-400 text-xs md:text-sm">This Week</p>
        </div>

        <div className="stat-card p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <Zap className="text-secondary-500" size={20} />
            <span className="text-xl md:text-2xl font-bold text-secondary-400">{stats.streak}</span>
          </div>
          <p className="text-dark-400 text-xs md:text-sm">Day Streak</p>
        </div>

        <div className="stat-card p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <Target className="text-accent-500" size={20} />
            <span className="text-xl md:text-2xl font-bold text-accent-400">{stats.avgVolume}</span>
          </div>
          <p className="text-dark-400 text-xs md:text-sm">Avg Volume</p>
        </div>

        <div className="stat-card p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <Award className="text-purple-500" size={20} />
            <div className="flex items-center gap-1">
              <span className="text-xl md:text-2xl font-bold text-purple-400">{stats.currentWeight}</span>
              {stats.weightChange !== 0 && (
                stats.weightChange > 0 ? 
                  <TrendingUp className="text-red-400" size={16} /> : 
                  <TrendingDown className="text-green-400" size={16} />
              )}
            </div>
          </div>
          <p className="text-dark-400 text-xs md:text-sm">Weight (lbs)</p>
        </div>
      </div>

      {/* Quick Actions - Mobile Priority */}
      <div className="card-glass p-4 md:p-6 mb-6">
        <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="text-primary-500" size={20} />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button 
            onClick={() => setActiveTab('logger')}
            className="quick-action-btn bg-gradient-to-r from-primary-600/20 to-primary-700/20 border-primary-500/30"
          >
            <Calendar size={24} className="mr-3" />
            <div className="text-left">
              <div className="font-semibold">Log Workout</div>
              <div className="text-sm text-dark-400">Start training session</div>
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('metrics')}
            className="quick-action-btn bg-gradient-to-r from-secondary-600/20 to-secondary-700/20 border-secondary-500/30"
          >
            <Users size={24} className="mr-3" />
            <div className="text-left">
              <div className="font-semibold">Body Metrics</div>
              <div className="text-sm text-dark-400">Track measurements</div>
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('charts')}
            className="quick-action-btn bg-gradient-to-r from-accent-600/20 to-accent-700/20 border-accent-500/30"
          >
            <BarChart3 size={24} className="mr-3" />
            <div className="text-left">
              <div className="font-semibold">Analytics</div>
              <div className="text-sm text-dark-400">View progress</div>
            </div>
          </button>
        </div>

        {/* Weekly Goal Progress - Prominent on Mobile */}
        <div className="mt-6 p-4 bg-dark-800/50 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-base">Weekly Goal Progress</span>
            <span className="text-sm text-dark-400 font-semibold">{stats.weeklyWorkouts}/4 workouts</span>
          </div>
          <div className="w-full bg-dark-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((stats.weeklyWorkouts / 4) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-dark-400 mt-2">
            {stats.weeklyWorkouts >= 4 ? '🎉 Goal achieved this week!' : `${4 - stats.weeklyWorkouts} more workouts to reach your goal!`}
          </p>
        </div>
      </div>

      {/* Main Content Grid - Mobile Stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 card-glass p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <Activity className="text-primary-500" size={20} />
              Recent Activity
            </h3>
            <span className="text-xs md:text-sm text-dark-400">Last 14 days</span>
          </div>
          <div className="chart-container">
            <Line data={getActivityData()} options={chartOptions} />
          </div>
        </div>

        {/* Muscle Group Distribution */}
        <div className="card-glass p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 flex items-center gap-2">
            <BarChart3 className="text-secondary-500" size={20} />
            Focus Areas
          </h3>
          <div className="chart-container">
            <Doughnut data={getMuscleGroupData()} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Recent Workouts - Mobile Optimized */}
      <div className="card-glass p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 flex items-center gap-2">
          <Clock className="text-accent-500" size={20} />
          Recent Workouts
        </h3>
        <div className="space-y-3 md:space-y-4">
          {workouts.length > 0 ? (
            workouts.slice(0, 5).map((workout, index) => (
              <div key={workout.id} className="exercise-card">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-dark-100 text-base md:text-lg">{workout.name}</h4>
                    <p className="text-sm text-dark-400">
                      {format(new Date(workout.date), 'MMM dd, yyyy')} • {workout.exercises?.length || 0} exercises
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg md:text-xl font-semibold text-primary-400">{workout.totalVolume || 0}</div>
                    <div className="text-xs text-dark-400">volume</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 md:py-12 text-dark-400">
              <Activity size={48} className="mx-auto mb-4 opacity-50" />
              <h4 className="text-lg md:text-xl font-medium text-dark-200 mb-2">Welcome to GymTracker!</h4>
              <p className="mb-6 text-base">Ready to start your fitness journey?</p>
              <button 
                onClick={() => setActiveTab('logger')}
                className="btn-primary text-base md:text-lg py-3 px-8"
              >
                Log Your First Workout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Summary - Simplified for Mobile */}
      <div className="card-glass p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 flex items-center gap-2">
          <BarChart3 className="text-primary-500" size={20} />
          This Month
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary-400 mb-1">{stats.monthlyWorkouts}</div>
            <div className="text-xs md:text-sm text-dark-400">Workouts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-secondary-400 mb-1">{Math.round(stats.totalVolume / 1000)}K</div>
            <div className="text-xs md:text-sm text-dark-400">Volume</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-accent-400 mb-1">
              {workouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0)}
            </div>
            <div className="text-xs md:text-sm text-dark-400">Exercises</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-1">
              {Math.round(stats.monthlyWorkouts > 0 ? stats.totalVolume / stats.monthlyWorkouts : 0)}
            </div>
            <div className="text-xs md:text-sm text-dark-400">Avg/Workout</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;