import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase/config';
import { useAuth } from '../contexts/SimpleAuthContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Activity,
  Target,
  Clock
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday
} from 'date-fns';

const WorkoutCalendar = () => {
  const { currentUser } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
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
        }));
        setWorkouts(workoutsList);
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
    }
    setLoading(false);
  }, [currentUser]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get workouts for a specific date
  const getWorkoutsForDate = (date) => {
    return workouts.filter(workout => 
      isSameDay(new Date(workout.date), date)
    );
  };

  // Get selected date workouts
  const selectedDateWorkouts = getWorkoutsForDate(selectedDate);

  // Calculate monthly stats
  const getMonthlyStats = () => {
    const monthWorkouts = workouts.filter(workout => 
      isSameMonth(new Date(workout.date), currentDate)
    );

    const totalVolume = monthWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
    const totalExercises = monthWorkouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0);
    const avgVolume = monthWorkouts.length > 0 ? Math.round(totalVolume / monthWorkouts.length) : 0;

    return {
      workouts: monthWorkouts.length,
      totalVolume,
      totalExercises,
      avgVolume,
      activeDays: new Set(monthWorkouts.map(w => format(new Date(w.date), 'yyyy-MM-dd'))).size
    };
  };

  const monthlyStats = getMonthlyStats();

  // Get intensity color for a day
  const getDayIntensity = (date) => {
    const dayWorkouts = getWorkoutsForDate(date);
    if (dayWorkouts.length === 0) return '';
    
    const totalVolume = dayWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
    
    if (totalVolume > 5000) return 'bg-green-500';
    if (totalVolume > 3000) return 'bg-green-400';
    if (totalVolume > 1000) return 'bg-green-300';
    return 'bg-green-200';
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
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Workout Calendar</h1>
        <p className="text-dark-400 text-base md:text-lg">Track your training consistency</p>
      </div>

      {/* Monthly Stats - Mobile Optimized */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="stat-card p-3 md:p-4">
          <div className="flex items-center justify-between mb-1">
            <CalendarIcon className="text-primary-500" size={18} />
            <span className="text-lg md:text-xl font-bold text-primary-400">{monthlyStats.workouts}</span>
          </div>
          <p className="text-dark-400 text-xs">Workouts</p>
        </div>

        <div className="stat-card p-3 md:p-4">
          <div className="flex items-center justify-between mb-1">
            <Activity className="text-secondary-500" size={18} />
            <span className="text-lg md:text-xl font-bold text-secondary-400">{monthlyStats.activeDays}</span>
          </div>
          <p className="text-dark-400 text-xs">Active Days</p>
        </div>

        <div className="stat-card p-3 md:p-4">
          <div className="flex items-center justify-between mb-1">
            <Target className="text-accent-500" size={18} />
            <span className="text-lg md:text-xl font-bold text-accent-400">{Math.round(monthlyStats.totalVolume / 1000)}K</span>
          </div>
          <p className="text-dark-400 text-xs">Volume</p>
        </div>

        <div className="stat-card p-3 md:p-4">
          <div className="flex items-center justify-between mb-1">
            <Clock className="text-purple-500" size={18} />
            <span className="text-lg md:text-xl font-bold text-purple-400">{monthlyStats.avgVolume}</span>
          </div>
          <p className="text-dark-400 text-xs">Avg Volume</p>
        </div>

        <div className="stat-card p-3 md:p-4 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-1">
            <Activity className="text-pink-500" size={18} />
            <span className="text-lg md:text-xl font-bold text-pink-400">{monthlyStats.totalExercises}</span>
          </div>
          <p className="text-dark-400 text-xs">Exercises</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Calendar - Mobile Optimized */}
        <div className="lg:col-span-2 card-glass p-4 md:p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-3 md:p-2 hover:bg-dark-700 rounded-xl md:rounded-lg transition-colors"
            >
              <ChevronLeft size={24} className="md:w-5 md:h-5" />
            </button>
            
            <h2 className="text-xl md:text-2xl font-bold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-3 md:p-2 hover:bg-dark-700 rounded-xl md:rounded-lg transition-colors"
            >
              <ChevronRight size={24} className="md:w-5 md:h-5" />
            </button>
          </div>

          {/* Calendar Grid - Mobile Optimized */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-3 md:mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm md:text-base font-medium text-dark-400 py-2 md:py-2">
                <span className="hidden md:inline">{day}</span>
                <span className="md:hidden">{day.slice(0, 1)}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {calendarDays.map(day => {
              const dayWorkouts = getWorkoutsForDate(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentDay = isToday(day);
              const intensityClass = getDayIntensity(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative aspect-square p-1 md:p-2 rounded-lg text-sm md:text-base font-medium
                    transition-all duration-200 hover:scale-105 min-h-[44px] md:min-h-[48px]
                    ${isSelected 
                      ? 'bg-primary-600 text-white shadow-lg' 
                      : isCurrentDay
                        ? 'bg-dark-700 text-white border-2 border-primary-500'
                        : 'bg-dark-800 hover:bg-dark-700 text-dark-300'
                    }
                  `}
                >
                  <span className="relative z-10 text-base md:text-sm">{format(day, 'd')}</span>
                  
                  {/* Workout indicator */}
                  {dayWorkouts.length > 0 && !isSelected && (
                    <div className={`absolute inset-1 rounded-md opacity-30 ${intensityClass}`} />
                  )}
                  
                  {/* Workout count - Mobile Optimized */}
                  {dayWorkouts.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-secondary-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {dayWorkouts.length}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend - Mobile Optimized */}
          <div className="mt-4 md:mt-6 flex items-center justify-center gap-3 md:gap-4 text-xs md:text-sm">
            <div className="flex items-center gap-1 md:gap-2">
              <div className="w-3 h-3 bg-green-200 rounded"></div>
              <span className="text-dark-400">Light</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <div className="w-3 h-3 bg-green-300 rounded"></div>
              <span className="text-dark-400">Moderate</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span className="text-dark-400">Heavy</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-dark-400">Intense</span>
            </div>
          </div>
        </div>

        {/* Selected Date Details - Mobile Optimized */}
        <div className="card-glass p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
            <CalendarIcon className="text-primary-500" size={20} />
            <span className="text-base md:text-lg">{format(selectedDate, 'MMM dd, yyyy')}</span>
          </h3>

          {selectedDateWorkouts.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {selectedDateWorkouts.map((workout, index) => (
                <div key={workout.id} className="bg-dark-800/50 rounded-lg p-3 md:p-4 hover:bg-dark-700/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-dark-100 text-base md:text-lg">{workout.name}</h4>
                    <span className="text-sm text-primary-400 font-medium">
                      {workout.totalVolume || 0} vol
                    </span>
                  </div>
                  
                  <div className="text-sm text-dark-400 mb-3">
                    {workout.exercises?.length || 0} exercises
                  </div>

                  {/* Exercise list - Mobile Optimized */}
                  <div className="space-y-1">
                    {workout.exercises?.slice(0, 3).map((exercise, idx) => (
                      <div key={idx} className="text-xs md:text-sm text-dark-400 flex justify-between">
                        <span className="truncate mr-2">{exercise.name}</span>
                        <span className="flex-shrink-0">{exercise.sets}×{exercise.reps} @ {exercise.weight}lbs</span>
                      </div>
                    ))}
                    {workout.exercises?.length > 3 && (
                      <div className="text-xs text-dark-500">
                        +{workout.exercises.length - 3} more exercises
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 md:py-8">
              <Activity size={40} className="mx-auto mb-4 text-dark-600" />
              <p className="text-dark-400 mb-2 text-sm md:text-base">No workouts on this day</p>
              {isSameDay(selectedDate, new Date()) && (
                <button className="btn-primary text-sm px-4 py-2">
                  Log Today's Workout
                </button>
              )}
            </div>
          )}

          {/* Quick Stats for Selected Date - Mobile Optimized */}
          {selectedDateWorkouts.length > 0 && (
            <div className="mt-4 md:mt-6 pt-4 border-t border-dark-700">
              <h4 className="text-sm font-medium text-dark-300 mb-3">Day Summary</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-lg md:text-xl font-bold text-primary-400">
                    {selectedDateWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0)}
                  </div>
                  <div className="text-xs text-dark-400">Total Volume</div>
                </div>
                <div className="text-center">
                  <div className="text-lg md:text-xl font-bold text-secondary-400">
                    {selectedDateWorkouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0)}
                  </div>
                  <div className="text-xs text-dark-400">Exercises</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutCalendar;