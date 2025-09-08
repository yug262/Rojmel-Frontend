import React, { useEffect, useState } from 'react';
import { FaChartLine, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const SalesForecast = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setMessage('');
      const apiUrl = 'http://127.0.0.1:8000/api/sales-forecast/';

      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result.forecast_data);
        setMessage(result.message);
      } catch (e) {
        setError('Failed to load forecast data. Please check your network connection.');
        console.error('Fetch error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-400">
        <FaSpinner className="animate-spin text-4xl mr-2" /> Loading sales forecast...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-400">
        <FaExclamationTriangle className="text-2xl mr-2" /> Error: {error}
      </div>
    );
  }
  
  const historicalData = data.filter(d => d.type === 'Historical');
  const forecastData = data.filter(d => d.type === 'Forecast');

  return (
    <div className="p-8 bg-gray-900 text-gray-200 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Sales Forecast</h1>
      
      {message && (
        <div className="bg-gray-800 p-4 rounded-xl mb-6 text-gray-300">
          <p>{message}</p>
        </div>
      )}

      {data.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-300">Historical & Forecasted Sales</h2>
            <FaChartLine className="text-purple-500 text-2xl" />
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="date" 
                  stroke="#a0a0a0" 
                  tick={{ fontSize: 10 }} 
                  padding={{ left: 20, right: 20 }} 
                />
                <YAxis stroke="#a0a0a0" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#2d3748', border: 'none' }} 
                  labelStyle={{ color: '#e2e8f0' }} 
                  formatter={(value) => `₹${value.toFixed(2)}`}
                />
                <Legend />
                <Line 
                  dataKey="sales" 
                  stroke="#8884d8" 
                  dot={false}
                  name="Sales"
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  dot={false}
                  strokeWidth={2}
                  name="Historical Sales"
                  stroke="#8884d8"
                  data={historicalData}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  dot={false}
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  name="Forecasted Sales"
                  stroke="#82ca9d"
                  data={forecastData}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesForecast;
