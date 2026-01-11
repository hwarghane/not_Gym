// Brzycki formula for 1RM calculation
export const calculateOneRepMax = (weight, reps) => {
  if (reps === 1) return weight;
  return Math.round(weight * (36 / (37 - reps)));
};

// Calculate total volume (Sets × Reps × Weight)
export const calculateVolume = (sets, reps, weight) => {
  return sets * reps * weight;
};

// Calculate total workout volume
export const calculateWorkoutVolume = (exercises) => {
  return exercises.reduce((total, exercise) => {
    return total + calculateVolume(exercise.sets, exercise.reps, exercise.weight);
  }, 0);
};

// Group exercises by muscle group
export const groupByMuscleGroup = (exercises) => {
  return exercises.reduce((groups, exercise) => {
    const group = exercise.muscleGroup || 'Other';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(exercise);
    return groups;
  }, {});
};

// Calculate muscle group volume distribution
export const calculateMuscleGroupVolumes = (exercises) => {
  const grouped = groupByMuscleGroup(exercises);
  const volumes = {};
  
  Object.keys(grouped).forEach(group => {
    volumes[group] = grouped[group].reduce((total, exercise) => {
      return total + calculateVolume(exercise.sets, exercise.reps, exercise.weight);
    }, 0);
  });
  
  return volumes;
};