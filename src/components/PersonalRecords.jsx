import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase/config';
import { useAuth } from '../contexts/SimpleAuthContext';
import { Trophy, TrendingUp, Calendar, Weight } from 'lucide-react';
import { format } from 'date-fns';

const PersonalRecords = () => {
  const { currentUser } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [personalRecords, setPersonalRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All');

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
        calculatePersonalRecords(workoutsList);
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
    }
    setLoading(false);
  }, [currentUser]);

  const calculatePersonalRecords = (workoutsList) => {
    const records = {};
    
    workoutsList.forEach(workout => {
      if (workout.exercises) {
        workout.exercises.forEach(exercise => {
          const key = exercise.name;
          
          if (!records[key]) {
            records[key] = {
              exerciseName: exercise.name,
              muscleGroup: exercise.muscleGroup,
              maxWeight: {
                weight: exercise.weight,
                reps: exercise.reps,
                date: workout.date,
                workoutName: workout.name,
                oneRepMax: exercise.oneRepMax
              },
              maxVolume: {
                volume: exercise.volume,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight,
                date: workout.date,
                workoutName: workout.name
              },
              maxOneRepMax: {
                oneRepMax: exercise.oneRepMax,
                weight: exercise.weight,
                reps: exercise.reps,
                date: workout.date,
                workoutName: workout.name
              },
              totalSessions: 1,
              firstPerformed: workout.date,
              lastPerformed: workout.date
            };
          } else {
            // Update max weight
            if (exercise.weight > records[key].maxWeight.weight) {
              records[key].maxWeight = {
                weight: exercise.weight,
                reps: exercise.reps,
                date: workout.date,
                workoutName: workout.name,
                oneRepMax: exercise.oneRepMax
              };
            }
            
            // Update max volume
            if (exercise.volume > records[key].maxVolume.volume) {
              records[key].maxVolume = {
                volume: exercise.volume,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight,
                date: workout.date,
                workoutName: workout.name
              };
            }
            
            // Update max 1RM
            if (exercise.oneRepMax > records[key].maxOneRepMax.oneRepMax) {
              records[key].maxOneRepMax = {
                oneRepMax: exercise.oneRepMax,
                weight: exercise.weight,
                reps: exercise.reps,
                date: workout.date,
                workoutName: workout.name
              };
            }
            
            // Update session count and dates
            records[key].totalSessions++;
            if (new Date(workout.date) < new Date(records[key].firstPerformed)) {
              records[key].firstPerformed = workout.date;
            }
            if (new Date(workout.date) > new Date(records[key].lastPerformed)) {
              records[key].lastPerformed = workout.date;
            }
          }
        });
      }
    });
    
    setPersonalRecords(records);
  };

  // Get unique muscle groups
  const muscleGroups = ['All', ...new Set(
    Object.values(personalRecords).map(record => record.muscleGroup)
  )].filter(Boolean);

  // Filter records by muscle group
  const filteredRecords = selectedMuscleGroup === 'All' 
    ? Object.values(personalRecords)
    : Object.values(personalRecords).filter(record => record.muscleGroup === selectedMuscleGroup);

  // Sort records by different criteria
  const sortedByWeight = [...filteredRecords].sort((a, b) => b.maxWeight.weight - a.maxWeight.weight);
  const sortedByOneRM = [...filteredRecords].sort((a, b) => b.maxOneRepMax.oneRepMax - a.maxOneRepMax.oneRepMax);
  const sortedByVolume = [...filteredRecords].sort((a, b) => b.maxVolume.volume - a.maxVolume.volume);

  // Get recent PRs (last 30 days)
  const recentPRs = Object.values(personalRecords).filter(record => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(record.maxWeight.date) >= thirtyDaysAgo ||
           new Date(record.maxOneRepMax.date) >= thirtyDaysAgo ||
           new Date(record.maxVolume.date) >= thirtyDaysAgo;
  }).sort((a, b) => {
    const aLatest = Math.max(
      new Date(a.maxWeight.date),
      new Date(a.maxOneRepMax.date),
      new Date(a.maxVolume.date)
    );
    const bLatest = Math.max(
      new Date(b.maxWeight.date),
      new Date(b.maxOneRepMax.date),
      new Date(b.maxVolume.date)
    );
    return bLatest - aLatest;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading personal records...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <Trophy className="text-yellow-400" size={28} />
        Personal Records
      </h2>

      {/* Filter */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <label className="text-sm font-medium mr-4 self-center">Filter by muscle group:</label>
          {muscleGroups.map(group => (
            <button
              key={group}
              onClick={() => setSelectedMuscleGroup(group)}
              className={`px-3 py-1 rounded text-sm ${
                selectedMuscleGroup === group
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{Object.keys(personalRecords).length}</div>
          <div className="text-sm text-gray-400">Total Exercises</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{recentPRs.length}</div>
          <div className="text-sm text-gray-400">Recent PRs (30 days)</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {sortedByWeight[0]?.maxWeight.weight || 0}
          </div>
          <div className="text-sm text-gray-400">Heaviest Weight (lbs)</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {sortedByOneRM[0]?.maxOneRepMax.oneRepMax || 0}
          </div>
          <div className="text-sm text-gray-400">Highest 1RM (lbs)</div>
        </div>
      </div>

      {/* Recent PRs */}
      {recentPRs.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-400" size={20} />
            Recent Personal Records (Last 30 Days)
          </h3>
          <div className="space-y-3">
            {recentPRs.slice(0, 5).map((record, index) => (
              <div key={record.exerciseName} className="bg-gray-700 rounded p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-yellow-400">{record.exerciseName}</div>
                    <div className="text-sm text-gray-300">{record.muscleGroup}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      Max Weight: {record.maxWeight.weight} lbs × {record.maxWeight.reps}
                    </div>
                    <div className="text-xs text-gray-400">
                      {format(new Date(record.maxWeight.date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Records Tables */}
      <div className="space-y-6">
        {/* Top Weights */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Weight className="text-blue-400" size={20} />
            Top Weights
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-2">Exercise</th>
                  <th className="text-left p-2">Muscle Group</th>
                  <th className="text-left p-2">Max Weight</th>
                  <th className="text-left p-2">Reps</th>
                  <th className="text-left p-2">Est. 1RM</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {sortedByWeight.slice(0, 10).map((record, index) => (
                  <tr key={record.exerciseName} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="p-2 font-medium">{record.exerciseName}</td>
                    <td className="p-2 text-gray-400">{record.muscleGroup}</td>
                    <td className="p-2 text-blue-400 font-bold">{record.maxWeight.weight} lbs</td>
                    <td className="p-2">{record.maxWeight.reps}</td>
                    <td className="p-2 text-green-400">{record.maxWeight.oneRepMax} lbs</td>
                    <td className="p-2 text-gray-400">
                      {format(new Date(record.maxWeight.date), 'MMM dd, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 1RMs */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="text-green-400" size={20} />
            Top Estimated 1RMs
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-2">Exercise</th>
                  <th className="text-left p-2">Muscle Group</th>
                  <th className="text-left p-2">Est. 1RM</th>
                  <th className="text-left p-2">From Weight</th>
                  <th className="text-left p-2">Reps</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {sortedByOneRM.slice(0, 10).map((record, index) => (
                  <tr key={record.exerciseName} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="p-2 font-medium">{record.exerciseName}</td>
                    <td className="p-2 text-gray-400">{record.muscleGroup}</td>
                    <td className="p-2 text-green-400 font-bold">{record.maxOneRepMax.oneRepMax} lbs</td>
                    <td className="p-2">{record.maxOneRepMax.weight} lbs</td>
                    <td className="p-2">{record.maxOneRepMax.reps}</td>
                    <td className="p-2 text-gray-400">
                      {format(new Date(record.maxOneRepMax.date), 'MMM dd, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Volumes */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-purple-400" size={20} />
            Top Single-Exercise Volumes
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-2">Exercise</th>
                  <th className="text-left p-2">Muscle Group</th>
                  <th className="text-left p-2">Max Volume</th>
                  <th className="text-left p-2">Sets × Reps × Weight</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {sortedByVolume.slice(0, 10).map((record, index) => (
                  <tr key={record.exerciseName} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="p-2 font-medium">{record.exerciseName}</td>
                    <td className="p-2 text-gray-400">{record.muscleGroup}</td>
                    <td className="p-2 text-purple-400 font-bold">{record.maxVolume.volume}</td>
                    <td className="p-2">
                      {record.maxVolume.sets} × {record.maxVolume.reps} × {record.maxVolume.weight} lbs
                    </td>
                    <td className="p-2 text-gray-400">
                      {format(new Date(record.maxVolume.date), 'MMM dd, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalRecords;