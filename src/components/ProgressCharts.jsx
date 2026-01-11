import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase/config';
import { useAuth } from '../contexts/SimpleAuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { format } from 'date-fns';
import { calculateMuscleGroupVolumes } from '../utils/calculations';
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  PieChart, 
  Calendar,
  Filter,
  Download
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ProgressCharts = () => {
  const { currentUser } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [timeRange, setTimeRange] = useState('30');
  const [chartType, setChartType] = useState('strength');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      // Load workouts from localStorage
      const savedWorkouts = localStorage.getItem(`gymtracker_workouts_${currentUser.uid}`);
      if (savedWorkouts) {
        const workoutsData = JSON.parse(savedWorkouts);
        const workoutsList = Object.keys(workoutsData).map(key => ({
          id: key,
          ...workoutsData[key]
        })).sort((a, b) => new Date(a.date) - new Date(a.date));
        setWorkouts(workoutsList);
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
    }
    setLoading(false);
  }, [currentUser]);

  const uniqueExercises = [...new Set(
    workouts.flatMap(workout => 
      workout.exercises?.map(ex => ex.name) || []
    )
  )].sort();

  const filteredWorkouts = workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));
    return workoutDate >= cutoffDate;
  });

  const getStrengthData = () => {
    if (!selectedExercise) return { labels: [], datasets: [] };

    const exerciseData = [];
    filteredWorkouts.forEach(workout => {
      const exercise = workout.exercises?.find(ex => ex.name === selectedExercise);
      if (exercise) {
        exerciseData.push({
          date: workout.date,
          weight: exercise.weight,
          oneRepMax: exercise.oneRepMax,
          volume: exercise.volume
        });
      }
    });

    return {
      labels: exerciseData.map(data => format(new Date(data.date), 'MMM dd')),
      datasets: [
        {
          label: 'Weight (lbs)',
          data: exerciseData.map(data => data.weight),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
        },
        {
          label: 'Est. 1RM (lbs)',
          data: exerciseData.map(data => data.oneRepMax),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: false,
          pointBackgroundColor: 'rgb(34, 197, 94)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
        }
      ]
    };
  };

  const getVolumeData = () => {
    const volumeData = filteredWorkouts.map(workout => ({
      date: workout.date,
      volume: workout.totalVolume || 0
    }));

    return {
      labels: volumeData.map(data => format(new Date(data.date), 'MMM dd')),
      datasets: [
        {
          label: 'Total Volume',
          data: volumeData.map(data => data.volume),
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          borderColor: 'rgb(245, 158, 11)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }
      ]
    };
  };

  const getMuscleGroupData = () => {
    const muscleGroupTotals = {};
    
    filteredWorkouts.forEach(workout => {
      if (workout.exercises) {
        const volumes = calculateMuscleGroupVolumes(workout.exercises);
        Object.keys(volumes).forEach(group => {
          muscleGroupTotals[group] = (muscleGroupTotals[group] || 0) + volumes[group];
        });
      }
    });

    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
      '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
    ];

    const labels = Object.keys(muscleGroupTotals);
    const data = Object.values(muscleGroupTotals);

    // Return empty data structure if no data
    if (labels.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            borderWidth: 0,
            hoverOffset: 10,
          }
        ]
      };
    }

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0,
          hoverOffset: 10,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#f8fafc',
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      }
    },
    scales: {
      x: {
        ticks: { 
          color: '#94a3b8',
          font: { size: 11 }
        },
        grid: { 
          color: 'rgba(71, 85, 105, 0.3)',
          drawBorder: false
        }
      },
      y: {
        ticks: { 
          color: '#94a3b8',
          font: { size: 11 }
        },
        grid: { 
          color: 'rgba(71, 85, 105, 0.3)',
          drawBorder: false
        }
      }
    },
    elements: {
      point: {
        hoverRadius: 8,
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#f8fafc',
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
        cornerRadius: 8,
      }
    },
    cutout: '60%',
  };

  const barOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: false
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Progress Analytics</h1>
        <p className="text-dark-400 text-lg">Visualize your fitness journey</p>
      </div>
      
      {/* Filters */}
      <div className="card-glass p-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="text-primary-500" size={24} />
          <h3 className="text-xl font-semibold">Filters & Options</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-300">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="select-field"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-300">Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="select-field"
            >
              <option value="strength">Strength Progress</option>
              <option value="volume">Volume Analysis</option>
              <option value="distribution">Muscle Distribution</option>
            </select>
          </div>
          
          {chartType === 'strength' && (
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-300">Exercise</label>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="select-field"
              >
                <option value="">Select exercise</option>
                {uniqueExercises.map(exercise => (
                  <option key={exercise} value={exercise}>{exercise}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex items-end">
            <button className="btn-accent text-sm flex items-center gap-2">
              <Download size={16} />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="card-glass p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {chartType === 'strength' && <TrendingUp className="text-primary-500" size={24} />}
            {chartType === 'volume' && <BarChart3 className="text-accent-500" size={24} />}
            {chartType === 'distribution' && <PieChart className="text-secondary-500" size={24} />}
            <h3 className="text-xl font-semibold">
              {chartType === 'strength' && 'Strength Progression'}
              {chartType === 'volume' && 'Volume Analysis'}
              {chartType === 'distribution' && 'Muscle Group Distribution'}
            </h3>
          </div>
          <span className="text-sm text-dark-400">
            {filteredWorkouts.length} workouts
          </span>
        </div>
        
        <div className="chart-container">
          {chartType === 'strength' && selectedExercise ? (
            <Line data={getStrengthData()} options={chartOptions} />
          ) : chartType === 'volume' ? (
            <Bar data={getVolumeData()} options={barOptions} />
          ) : chartType === 'distribution' ? (
            <Pie data={getMuscleGroupData()} options={pieOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-dark-400">
              {chartType === 'strength' 
                ? 'Select an exercise to view strength progression'
                : 'Select a chart type to view analytics'
              }
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="text-primary-500" size={20} />
            <span className="text-2xl font-bold text-primary-400">{filteredWorkouts.length}</span>
          </div>
          <p className="text-dark-400 text-xs">Total Workouts</p>
        </div>

        <div className="stat-card hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="text-secondary-500" size={20} />
            <span className="text-2xl font-bold text-secondary-400">
              {filteredWorkouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0)}
            </span>
          </div>
          <p className="text-dark-400 text-xs">Total Exercises</p>
        </div>

        <div className="stat-card hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="text-accent-500" size={20} />
            <span className="text-2xl font-bold text-accent-400">
              {Math.round(filteredWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0) / 1000)}K
            </span>
          </div>
          <p className="text-dark-400 text-xs">Total Volume</p>
        </div>

        <div className="stat-card hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-purple-500" size={20} />
            <span className="text-2xl font-bold text-purple-400">
              {filteredWorkouts.length > 0 ? Math.round(
                filteredWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0) / filteredWorkouts.length
              ) : 0}
            </span>
          </div>
          <p className="text-dark-400 text-xs">Avg Volume/Workout</p>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-glass p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-primary-500" size={20} />
            Recent Trends
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-dark-800/50 rounded-lg">
              <span className="text-dark-300">Weekly Average</span>
              <span className="text-primary-400 font-semibold">
                {Math.round(filteredWorkouts.length / (parseInt(timeRange) / 7))} workouts
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-dark-800/50 rounded-lg">
              <span className="text-dark-300">Most Trained</span>
              <span className="text-secondary-400 font-semibold">
                {(() => {
                  const muscleData = getMuscleGroupData();
                  if (!muscleData.datasets[0] || !muscleData.labels || muscleData.labels.length === 0) {
                    return 'N/A';
                  }
                  try {
                    return muscleData.labels.reduce((a, b, i, arr) => 
                      muscleData.datasets[0].data[i] > muscleData.datasets[0].data[arr.indexOf(a)] ? b : a
                    );
                  } catch (error) {
                    return 'N/A';
                  }
                })()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-dark-800/50 rounded-lg">
              <span className="text-dark-300">Peak Volume Day</span>
              <span className="text-accent-400 font-semibold">
                {filteredWorkouts.length > 0 ? 
                  format(new Date(filteredWorkouts.reduce((max, w) => 
                    (w.totalVolume || 0) > (max.totalVolume || 0) ? w : max
                  ).date), 'MMM dd') : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="card-glass p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="text-secondary-500" size={20} />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-dark-800/50 rounded-lg">
              <span className="text-dark-300">Consistency Score</span>
              <span className="text-secondary-400 font-semibold">
                {Math.round((filteredWorkouts.length / parseInt(timeRange)) * 100)}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-dark-800/50 rounded-lg">
              <span className="text-dark-300">Volume Growth</span>
              <span className="text-accent-400 font-semibold">
                {filteredWorkouts.length >= 2 ? 
                  Math.round(((filteredWorkouts[filteredWorkouts.length - 1]?.totalVolume || 0) - 
                  (filteredWorkouts[0]?.totalVolume || 0)) / Math.max(filteredWorkouts[0]?.totalVolume || 1, 1) * 100) : 0
                }%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-dark-800/50 rounded-lg">
              <span className="text-dark-300">Exercise Variety</span>
              <span className="text-purple-400 font-semibold">
                {uniqueExercises.length} exercises
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressCharts;