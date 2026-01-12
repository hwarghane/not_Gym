import { useState } from 'react';
import { ref, push, set } from 'firebase/database';
import { database } from '../firebase/config';
import { useAuth } from '../contexts/SimpleAuthContext';
import { Plus, Save, X, Zap, Target, Timer, Dumbbell } from 'lucide-react';
import { calculateVolume, calculateOneRepMax } from '../utils/calculations';

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio'
];

const COMMON_EXERCISES = {
  'Chest': ['Bench Press', 'Incline Press', 'Dumbbell Press', 'Push-ups', 'Chest Fly', 'Dips'],
  'Back': ['Deadlift', 'Pull-ups', 'Rows', 'Lat Pulldown', 'T-Bar Row', 'Face Pulls'],
  'Shoulders': ['Overhead Press', 'Lateral Raises', 'Rear Delt Fly', 'Arnold Press', 'Upright Row'],
  'Arms': ['Bicep Curls', 'Tricep Dips', 'Close Grip Press', 'Hammer Curls', 'Tricep Extension'],
  'Legs': ['Squat', 'Leg Press', 'Lunges', 'Calf Raises', 'Romanian Deadlift', 'Leg Curls'],
  'Core': ['Plank', 'Crunches', 'Russian Twists', 'Dead Bug', 'Mountain Climbers'],
  'Cardio': ['Treadmill', 'Cycling', 'Rowing', 'Elliptical', 'Stair Climber']
};

const WORKOUT_TEMPLATES = [
  { name: 'Push Day', exercises: ['Bench Press', 'Overhead Press', 'Lateral Raises', 'Tricep Dips'] },
  { name: 'Pull Day', exercises: ['Deadlift', 'Pull-ups', 'Rows', 'Bicep Curls'] },
  { name: 'Leg Day', exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raises'] },
  { name: 'Upper Body', exercises: ['Bench Press', 'Rows', 'Overhead Press', 'Pull-ups'] },
  { name: 'Full Body', exercises: ['Squat', 'Bench Press', 'Rows', 'Overhead Press'] }
];

const WorkoutLogger = () => {
  const { getUserDataPath, currentUser } = useAuth();
  const [workout, setWorkout] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    exercises: []
  });
  
  const [currentExercise, setCurrentExercise] = useState({
    name: '',
    muscleGroup: '',
    sets: 3,
    reps: 8,
    weight: 0
  });

  const [showTemplates, setShowTemplates] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quickMode, setQuickMode] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);

  const startRestTimer = (seconds = 90) => {
    setRestTimer(seconds);
    setIsResting(true);
    
    const timer = setInterval(() => {
      setRestTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsResting(false);
          // Optional: Play notification sound or vibrate
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRestTimer = () => {
    setRestTimer(0);
    setIsResting(false);
  };

  const quickAddExercise = (exerciseName, muscleGroup) => {
    const exercise = {
      name: exerciseName,
      muscleGroup,
      sets: 3,
      reps: 8,
      weight: 0,
      volume: 0,
      oneRepMax: 0
    };
    
    setWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, exercise]
    }));
    
    // Auto-start rest timer after adding exercise
    if (exercise.weight > 0) {
      startRestTimer();
    }
  };

  const updateExerciseInWorkout = (index, field, value) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => {
        if (i === index) {
          const updated = { ...ex, [field]: value };
          updated.volume = calculateVolume(updated.sets, updated.reps, updated.weight);
          updated.oneRepMax = calculateOneRepMax(updated.weight, updated.reps);
          return updated;
        }
        return ex;
      })
    }));
  };

  const addExercise = () => {
    if (!currentExercise.name || !currentExercise.muscleGroup) {
      alert('Please select exercise and muscle group');
      return;
    }
    
    const exercise = {
      ...currentExercise,
      volume: calculateVolume(currentExercise.sets, currentExercise.reps, currentExercise.weight),
      oneRepMax: calculateOneRepMax(currentExercise.weight, currentExercise.reps)
    };
    
    setWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, exercise]
    }));
    
    setCurrentExercise({
      name: '',
      muscleGroup: '',
      sets: 3,
      reps: 8,
      weight: 0
    });
    
    // Auto-start rest timer after adding exercise
    if (exercise.weight > 0) {
      startRestTimer();
    }
  };

  const removeExercise = (index) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const loadTemplate = (template) => {
    const templateExercises = template.exercises.map(exerciseName => {
      // Find muscle group for this exercise
      const muscleGroup = Object.keys(COMMON_EXERCISES).find(group => 
        COMMON_EXERCISES[group].includes(exerciseName)
      ) || 'Other';

      return {
        name: exerciseName,
        muscleGroup,
        sets: 3,
        reps: 8,
        weight: 0,
        volume: 0,
        oneRepMax: 0
      };
    });

    setWorkout(prev => ({
      ...prev,
      name: template.name,
      exercises: templateExercises
    }));

    setShowTemplates(false);
    alert(`${template.name} template loaded!`);
  };

  const saveWorkout = async () => {
    if (!workout.name || workout.exercises.length === 0) {
      alert('Please add workout name and exercises');
      return;
    }
    
    if (!currentUser) {
      alert('Please log in to save workouts');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const workoutData = {
        ...workout,
        timestamp: Date.now(),
        totalVolume: workout.exercises.reduce((sum, ex) => sum + ex.volume, 0)
      };

      // Save to localStorage
      const workoutId = `workout-${Date.now()}`;
      const existingWorkouts = JSON.parse(localStorage.getItem(`gymtracker_workouts_${currentUser.uid}`) || '{}');
      existingWorkouts[workoutId] = workoutData;
      localStorage.setItem(`gymtracker_workouts_${currentUser.uid}`, JSON.stringify(existingWorkouts));

      // Also try to save to Firebase if available
      try {
        const workoutPath = getUserDataPath('workouts');
        if (workoutPath) {
          const workoutRef = ref(database, workoutPath);
          const newWorkoutRef = push(workoutRef);
          await set(newWorkoutRef, workoutData);
        }
      } catch (firebaseError) {
        console.warn('Firebase save failed, data saved locally:', firebaseError);
      }
      
      // Reset form
      setWorkout({
        name: '',
        date: new Date().toISOString().split('T')[0],
        exercises: []
      });
      
      alert('🎉 Workout saved successfully!');
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Error saving workout');
    } finally {
      setIsLoading(false);
    }
  };

  const totalVolume = workout.exercises.reduce((sum, ex) => sum + ex.volume, 0);
  const totalExercises = workout.exercises.length;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Rest Timer - Floating for gym use */}
      {isResting && (
        <div className="fixed top-20 right-4 z-40 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white p-4 rounded-2xl shadow-2xl animate-pulse">
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}</div>
            <div className="text-sm opacity-90">Rest Time</div>
            <button
              onClick={stopRestTimer}
              className="mt-2 px-3 py-1 bg-white/20 rounded-lg text-xs font-medium"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Mobile-First Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Log Workout</h1>
        <p className="text-dark-400 text-base md:text-lg">Track your training session</p>
      </div>

      {/* Quick Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-dark-800/50 rounded-2xl p-1 flex">
          <button
            onClick={() => setQuickMode(false)}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              !quickMode 
                ? 'bg-primary-600 text-white shadow-lg' 
                : 'text-dark-300 hover:text-white'
            }`}
          >
            Detailed
          </button>
          <button
            onClick={() => setQuickMode(true)}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              quickMode 
                ? 'bg-primary-600 text-white shadow-lg' 
                : 'text-dark-300 hover:text-white'
            }`}
          >
            Quick Add
          </button>
        </div>
      </div>

      {/* Quick Stats - Mobile Optimized */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="stat-card p-4">
          <div className="flex items-center justify-between mb-1">
            <Dumbbell className="text-primary-500" size={20} />
            <span className="text-xl font-bold text-primary-400">{totalExercises}</span>
          </div>
          <p className="text-dark-400 text-xs">Exercises</p>
        </div>

        <div className="stat-card p-4">
          <div className="flex items-center justify-between mb-1">
            <Target className="text-secondary-500" size={20} />
            <span className="text-xl font-bold text-secondary-400">{totalVolume}</span>
          </div>
          <p className="text-dark-400 text-xs">Volume</p>
        </div>

        <div className="stat-card p-4">
          <div className="flex items-center justify-between mb-1">
            <Zap className="text-accent-500" size={20} />
            <span className="text-xl font-bold text-accent-400">
              {totalExercises > 0 ? Math.round(totalVolume / totalExercises) : 0}
            </span>
          </div>
          <p className="text-dark-400 text-xs">Avg/Ex</p>
        </div>

        <div className="stat-card p-4">
          <div className="flex items-center justify-between mb-1">
            <Timer className="text-purple-500" size={20} />
            <span className="text-xl font-bold text-purple-400">
              {Math.round(totalExercises * 3.5)}
            </span>
          </div>
          <p className="text-dark-400 text-xs">Est. Min</p>
        </div>
      </div>

      {/* Workout Name - Simplified for Mobile */}
      <div className="card-glass p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-dark-300">Workout Name</label>
            <input
              type="text"
              value={workout.name}
              onChange={(e) => setWorkout(prev => ({ ...prev, name: e.target.value }))}
              className="input-field text-lg"
              placeholder="e.g., Push Day, Upper Body"
            />
          </div>
          <div className="md:w-40">
            <label className="block text-sm font-medium mb-2 text-dark-300">Date</label>
            <input
              type="date"
              value={workout.date}
              onChange={(e) => setWorkout(prev => ({ ...prev, date: e.target.value }))}
              className="input-field"
            />
          </div>
        </div>

        {/* Quick Templates - Mobile Optimized */}
        <div className="mt-4">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="btn-secondary text-sm w-full md:w-auto"
          >
            {showTemplates ? 'Hide Templates' : '⚡ Quick Templates'}
          </button>
          
          {showTemplates && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {WORKOUT_TEMPLATES.map((template) => (
                <button
                  key={template.name}
                  onClick={() => loadTemplate(template)}
                  className="p-4 bg-dark-800/50 hover:bg-dark-700/50 rounded-xl text-left transition-all duration-200 border border-dark-700 hover:border-primary-500"
                >
                  <div className="font-medium text-dark-100 text-lg">{template.name}</div>
                  <div className="text-sm text-dark-400 mt-1">
                    {template.exercises.length} exercises
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {quickMode ? (
        /* Quick Add Mode - Perfect for Gym Use */
        <div className="space-y-4">
          <div className="card-glass p-4">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="text-secondary-500" size={24} />
              Quick Add Exercises
            </h3>
            
            {MUSCLE_GROUPS.map(group => (
              <div key={group} className="mb-6">
                <h4 className="text-lg font-medium text-dark-200 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                  {group}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {COMMON_EXERCISES[group]?.map(exercise => (
                    <button
                      key={exercise}
                      onClick={() => quickAddExercise(exercise, group)}
                      className="p-4 bg-dark-800/50 hover:bg-primary-600/20 rounded-xl text-left transition-all duration-200 border border-dark-700 hover:border-primary-500 text-lg font-medium"
                    >
                      + {exercise}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Detailed Add Mode */
        <div className="card-glass p-4 md:p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Plus className="text-secondary-500" size={24} />
            Add Exercise
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-300">Muscle Group</label>
              <select
                value={currentExercise.muscleGroup}
                onChange={(e) => setCurrentExercise(prev => ({ ...prev, muscleGroup: e.target.value, name: '' }))}
                className="select-field text-lg"
              >
                <option value="">Select muscle group</option>
                {MUSCLE_GROUPS.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-300">Exercise</label>
              <select
                value={currentExercise.name}
                onChange={(e) => setCurrentExercise(prev => ({ ...prev, name: e.target.value }))}
                className="select-field text-lg"
                disabled={!currentExercise.muscleGroup}
              >
                <option value="">Select exercise</option>
                {currentExercise.muscleGroup && COMMON_EXERCISES[currentExercise.muscleGroup]?.map(exercise => (
                  <option key={exercise} value={exercise}>{exercise}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Large Touch-Friendly Number Inputs - Mobile Optimized */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-base md:text-sm font-medium mb-2 text-dark-300">Sets</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentExercise(prev => ({ ...prev, sets: Math.max(1, prev.sets - 1) }))}
                  className="w-14 h-14 md:w-12 md:h-12 bg-dark-700 hover:bg-dark-600 rounded-xl flex items-center justify-center text-2xl md:text-xl font-bold transition-colors border border-dark-600"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={currentExercise.sets}
                  onChange={(e) => setCurrentExercise(prev => ({ ...prev, sets: parseInt(e.target.value) || 1 }))}
                  className="input-field text-center text-2xl md:text-xl font-bold flex-1 min-h-[56px] md:min-h-[48px]"
                />
                <button
                  type="button"
                  onClick={() => setCurrentExercise(prev => ({ ...prev, sets: Math.min(10, prev.sets + 1) }))}
                  className="w-14 h-14 md:w-12 md:h-12 bg-dark-700 hover:bg-dark-600 rounded-xl flex items-center justify-center text-2xl md:text-xl font-bold transition-colors border border-dark-600"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="block text-base md:text-sm font-medium mb-2 text-dark-300">Reps</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentExercise(prev => ({ ...prev, reps: Math.max(1, prev.reps - 1) }))}
                  className="w-14 h-14 md:w-12 md:h-12 bg-dark-700 hover:bg-dark-600 rounded-xl flex items-center justify-center text-2xl md:text-xl font-bold transition-colors border border-dark-600"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={currentExercise.reps}
                  onChange={(e) => setCurrentExercise(prev => ({ ...prev, reps: parseInt(e.target.value) || 1 }))}
                  className="input-field text-center text-2xl md:text-xl font-bold flex-1 min-h-[56px] md:min-h-[48px]"
                />
                <button
                  type="button"
                  onClick={() => setCurrentExercise(prev => ({ ...prev, reps: Math.min(50, prev.reps + 1) }))}
                  className="w-14 h-14 md:w-12 md:h-12 bg-dark-700 hover:bg-dark-600 rounded-xl flex items-center justify-center text-2xl md:text-xl font-bold transition-colors border border-dark-600"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="block text-base md:text-sm font-medium mb-2 text-dark-300">Weight (lbs)</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentExercise(prev => ({ ...prev, weight: Math.max(0, prev.weight - 5) }))}
                  className="w-14 h-14 md:w-12 md:h-12 bg-dark-700 hover:bg-dark-600 rounded-xl flex items-center justify-center text-2xl md:text-xl font-bold transition-colors border border-dark-600"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={currentExercise.weight}
                  onChange={(e) => setCurrentExercise(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  className="input-field text-center text-2xl md:text-xl font-bold flex-1 min-h-[56px] md:min-h-[48px]"
                />
                <button
                  type="button"
                  onClick={() => setCurrentExercise(prev => ({ ...prev, weight: prev.weight + 5 }))}
                  className="w-14 h-14 md:w-12 md:h-12 bg-dark-700 hover:bg-dark-600 rounded-xl flex items-center justify-center text-2xl md:text-xl font-bold transition-colors border border-dark-600"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Exercise Preview */}
          {currentExercise.name && (
            <div className="bg-dark-800/30 rounded-xl p-4 mb-6 border border-dark-700">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-dark-100 text-lg">{currentExercise.name}</div>
                  <div className="text-sm text-dark-400">
                    {currentExercise.sets} sets × {currentExercise.reps} reps @ {currentExercise.weight} lbs
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-primary-400">
                    Volume: {calculateVolume(currentExercise.sets, currentExercise.reps, currentExercise.weight)}
                  </div>
                  <div className="text-xs text-secondary-400">
                    Est. 1RM: {calculateOneRepMax(currentExercise.weight, currentExercise.reps)} lbs
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={addExercise}
            disabled={!currentExercise.name || !currentExercise.muscleGroup}
            className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={24} />
            Add Exercise
          </button>
        </div>
      )}

      {/* Exercise List - Mobile Optimized */}
      {workout.exercises.length > 0 && (
        <div className="card-glass p-4 md:p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Dumbbell className="text-accent-500" size={24} />
            Exercises ({workout.exercises.length})
          </h3>
          <div className="space-y-4">
            {workout.exercises.map((exercise, index) => (
              <div
                key={index}
                className="bg-dark-800/50 rounded-xl p-4 border border-dark-700"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-medium text-dark-100 text-lg">{exercise.name}</div>
                      <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                        {exercise.muscleGroup}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeExercise(index)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Inline editing for quick adjustments - Mobile Optimized */}
                <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3">
                  <div>
                    <label className="text-xs text-dark-400 mb-1 block">Sets</label>
                    <input
                      type="number"
                      min="1"
                      value={exercise.sets}
                      onChange={(e) => updateExerciseInWorkout(index, 'sets', parseInt(e.target.value) || 1)}
                      className="w-full px-2 md:px-3 py-3 md:py-2 bg-dark-700 border border-dark-600 rounded-lg text-center font-bold text-lg md:text-base min-h-[48px] md:min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-dark-400 mb-1 block">Reps</label>
                    <input
                      type="number"
                      min="1"
                      value={exercise.reps}
                      onChange={(e) => updateExerciseInWorkout(index, 'reps', parseInt(e.target.value) || 1)}
                      className="w-full px-2 md:px-3 py-3 md:py-2 bg-dark-700 border border-dark-600 rounded-lg text-center font-bold text-lg md:text-base min-h-[48px] md:min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-dark-400 mb-1 block">Weight</label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={exercise.weight}
                      onChange={(e) => updateExerciseInWorkout(index, 'weight', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 md:px-3 py-3 md:py-2 bg-dark-700 border border-dark-600 rounded-lg text-center font-bold text-lg md:text-base min-h-[48px] md:min-h-[40px]"
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-secondary-400">Volume: {exercise.volume}</span>
                  <span className="text-accent-400">Est. 1RM: {exercise.oneRepMax} lbs</span>
                </div>

                {/* Quick Rest Timer Buttons - Mobile Optimized */}
                <div className="flex gap-1 md:gap-2 mt-3">
                  <button
                    onClick={() => startRestTimer(60)}
                    className="flex-1 py-3 md:py-2 px-2 md:px-3 bg-secondary-600/20 hover:bg-secondary-600/30 text-secondary-400 rounded-lg text-sm font-medium transition-colors min-h-[44px] md:min-h-[36px]"
                  >
                    1min
                  </button>
                  <button
                    onClick={() => startRestTimer(90)}
                    className="flex-1 py-3 md:py-2 px-2 md:px-3 bg-secondary-600/20 hover:bg-secondary-600/30 text-secondary-400 rounded-lg text-sm font-medium transition-colors min-h-[44px] md:min-h-[36px]"
                  >
                    1.5min
                  </button>
                  <button
                    onClick={() => startRestTimer(180)}
                    className="flex-1 py-3 md:py-2 px-2 md:px-3 bg-secondary-600/20 hover:bg-secondary-600/30 text-secondary-400 rounded-lg text-sm font-medium transition-colors min-h-[44px] md:min-h-[36px]"
                  >
                    3min
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Large Save Button - Perfect for Gym Use */}
      <button
        onClick={saveWorkout}
        disabled={!workout.name || workout.exercises.length === 0 || isLoading}
        className="w-full btn-secondary text-xl py-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 rounded-2xl"
      >
        {isLoading ? (
          <div className="spinner"></div>
        ) : (
          <>
            <Save size={28} />
            Save Workout
          </>
        )}
      </button>
    </div>
  );
};

export default WorkoutLogger;