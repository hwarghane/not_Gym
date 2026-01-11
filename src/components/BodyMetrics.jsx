import React, { useState, useEffect } from 'react';
import { ref, push, set, onValue } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../firebase/config';
import { useAuth } from '../contexts/SimpleAuthContext';
import { Camera, Save, TrendingUp, TrendingDown } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

const BodyMetrics = () => {
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [currentMetric, setCurrentMetric] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    bodyFat: '',
    notes: ''
  });
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
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
      console.error('Error loading metrics:', error);
    }
    setLoading(false);
  }, [currentUser]);

  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedPhoto(file);
    }
  };

  const uploadPhoto = async (file) => {
    const timestamp = Date.now();
    const photoRef = storageRef(storage, `progress-photos/${timestamp}_${file.name}`);
    const snapshot = await uploadBytes(photoRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const saveMetric = async () => {
    if (!currentMetric.weight && !currentMetric.bodyFat && !selectedPhoto) return;
    
    if (!currentUser) {
      alert('Please log in to save metrics');
      return;
    }
    
    setUploading(true);
    try {
      let photoUrl = null;
      if (selectedPhoto) {
        try {
          photoUrl = await uploadPhoto(selectedPhoto);
        } catch (photoError) {
          console.warn('Photo upload failed:', photoError);
          // Continue without photo
        }
      }

      const metricData = {
        ...currentMetric,
        weight: parseFloat(currentMetric.weight) || null,
        bodyFat: parseFloat(currentMetric.bodyFat) || null,
        photoUrl,
        timestamp: Date.now()
      };

      // Save to localStorage
      const metricId = `metric-${Date.now()}`;
      const existingMetrics = JSON.parse(localStorage.getItem(`gymtracker_metrics_${currentUser.uid}`) || '{}');
      existingMetrics[metricId] = metricData;
      localStorage.setItem(`gymtracker_metrics_${currentUser.uid}`, JSON.stringify(existingMetrics));

      // Also try to save to Firebase if available
      try {
        const metricsRef = ref(database, `users/${currentUser.uid}/bodyMetrics`);
        const newMetricRef = push(metricsRef);
        await set(newMetricRef, metricData);
      } catch (firebaseError) {
        console.warn('Firebase save failed, data saved locally:', firebaseError);
      }

      // Reset form
      setCurrentMetric({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        bodyFat: '',
        notes: ''
      });
      setSelectedPhoto(null);
      
      alert('Metrics saved successfully!');
      
      // Reload metrics
      const updatedMetrics = JSON.parse(localStorage.getItem(`gymtracker_metrics_${currentUser.uid}`) || '{}');
      const metricsList = Object.keys(updatedMetrics).map(key => ({
        id: key,
        ...updatedMetrics[key]
      })).sort((a, b) => new Date(b.date) - new Date(a.date));
      setMetrics(metricsList);
      
    } catch (error) {
      console.error('Error saving metrics:', error);
      alert('Error saving metrics');
    } finally {
      setUploading(false);
    }
  };

  // Prepare weight chart data
  const getWeightData = () => {
    const weightData = metrics
      .filter(m => m.weight)
      .reverse()
      .slice(-30); // Last 30 entries

    return {
      labels: weightData.map(data => format(new Date(data.date), 'MMM dd')),
      datasets: [
        {
          label: 'Weight (lbs)',
          data: weightData.map(data => data.weight),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
          fill: true,
        }
      ]
    };
  };

  // Prepare body fat chart data
  const getBodyFatData = () => {
    const bodyFatData = metrics
      .filter(m => m.bodyFat)
      .reverse()
      .slice(-30); // Last 30 entries

    return {
      labels: bodyFatData.map(data => format(new Date(data.date), 'MMM dd')),
      datasets: [
        {
          label: 'Body Fat %',
          data: bodyFatData.map(data => data.bodyFat),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.1,
          fill: true,
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
          color: '#F9FAFB'
        }
      },
    },
    scales: {
      x: {
        ticks: { color: '#9CA3AF' },
        grid: { color: '#374151' }
      },
      y: {
        ticks: { color: '#9CA3AF' },
        grid: { color: '#374151' }
      }
    }
  };

  // Calculate trends
  const getWeightTrend = () => {
    const recentWeights = metrics.filter(m => m.weight).slice(0, 5);
    if (recentWeights.length < 2) return null;
    
    const latest = recentWeights[0].weight;
    const previous = recentWeights[recentWeights.length - 1].weight;
    const change = latest - previous;
    
    return {
      change: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  };

  const getBodyFatTrend = () => {
    const recentBodyFat = metrics.filter(m => m.bodyFat).slice(0, 5);
    if (recentBodyFat.length < 2) return null;
    
    const latest = recentBodyFat[0].bodyFat;
    const previous = recentBodyFat[recentBodyFat.length - 1].bodyFat;
    const change = latest - previous;
    
    return {
      change: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading metrics...</div>
      </div>
    );
  }

  const weightTrend = getWeightTrend();
  const bodyFatTrend = getBodyFatTrend();

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Body Metrics & Progress</h2>
      
      {/* Input Form */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Log New Metrics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={currentMetric.date}
              onChange={(e) => setCurrentMetric(prev => ({ ...prev, date: e.target.value }))}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Weight (lbs)</label>
            <input
              type="number"
              step="0.1"
              value={currentMetric.weight}
              onChange={(e) => setCurrentMetric(prev => ({ ...prev, weight: e.target.value }))}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500"
              placeholder="e.g., 180.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Body Fat %</label>
            <input
              type="number"
              step="0.1"
              value={currentMetric.bodyFat}
              onChange={(e) => setCurrentMetric(prev => ({ ...prev, bodyFat: e.target.value }))}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500"
              placeholder="e.g., 15.2"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            value={currentMetric.notes}
            onChange={(e) => setCurrentMetric(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500"
            rows="2"
            placeholder="Optional notes about your progress..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Progress Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500"
          />
          {selectedPhoto && (
            <div className="mt-2 text-sm text-green-400">
              Selected: {selectedPhoto.name}
            </div>
          )}
        </div>

        <button
          onClick={saveMetric}
          disabled={uploading || (!currentMetric.weight && !currentMetric.bodyFat && !selectedPhoto)}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>Uploading...</>
          ) : (
            <>
              <Save size={20} />
              Save Metrics
            </>
          )}
        </button>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {metrics.find(m => m.weight)?.weight || '--'}
          </div>
          <div className="text-sm text-gray-400">Current Weight (lbs)</div>
          {weightTrend && (
            <div className={`text-xs flex items-center justify-center gap-1 mt-1 ${
              weightTrend.direction === 'up' ? 'text-red-400' : 
              weightTrend.direction === 'down' ? 'text-green-400' : 'text-gray-400'
            }`}>
              {weightTrend.direction === 'up' ? <TrendingUp size={12} /> : 
               weightTrend.direction === 'down' ? <TrendingDown size={12} /> : null}
              {weightTrend.change} lbs
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {metrics.find(m => m.bodyFat)?.bodyFat || '--'}%
          </div>
          <div className="text-sm text-gray-400">Current Body Fat</div>
          {bodyFatTrend && (
            <div className={`text-xs flex items-center justify-center gap-1 mt-1 ${
              bodyFatTrend.direction === 'up' ? 'text-red-400' : 
              bodyFatTrend.direction === 'down' ? 'text-green-400' : 'text-gray-400'
            }`}>
              {bodyFatTrend.direction === 'up' ? <TrendingUp size={12} /> : 
               bodyFatTrend.direction === 'down' ? <TrendingDown size={12} /> : null}
              {bodyFatTrend.change}%
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{metrics.length}</div>
          <div className="text-sm text-gray-400">Total Entries</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {metrics.filter(m => m.photoUrl).length}
          </div>
          <div className="text-sm text-gray-400">Progress Photos</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Weight Progression</h3>
          <div className="chart-container">
            <Line data={getWeightData()} options={chartOptions} />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Body Fat Progression</h3>
          <div className="chart-container">
            <Line data={getBodyFatData()} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Progress Photos Gallery */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Camera size={20} />
          Progress Photos
        </h3>
        
        {metrics.filter(m => m.photoUrl).length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {metrics
              .filter(m => m.photoUrl)
              .slice(0, 12) // Show latest 12 photos
              .map((metric) => (
                <div key={metric.id} className="relative">
                  <img
                    src={metric.photoUrl}
                    alt={`Progress ${format(new Date(metric.date), 'MMM dd, yyyy')}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 rounded-b-lg">
                    <div className="text-sm font-medium">
                      {format(new Date(metric.date), 'MMM dd, yyyy')}
                    </div>
                    {metric.weight && (
                      <div className="text-xs">{metric.weight} lbs</div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            No progress photos yet. Upload your first photo above!
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyMetrics;