import React, { useEffect, useState, useCallback } from "react";
import { useBusiness } from "../contexts/BusinessContext";
import { FaChartLine, FaChartBar, FaChartPie, FaExclamationTriangle, FaSpinner, FaDownload } from 'react-icons/fa';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// This component fetches and displays charts and data for sales overview.
const SalesOverview = ({ apiUrl = "http://127.0.0.1:8000/api/analysis/sales-overview/", reportApiUrl = "http://127.00.1:8000/api/analysis/sales-overview-report/" }) => {
  const [data, setData] = useState({ line_data: [], bar_data: [], pie_data: [] });
  const [loading, setLoading] = useState(true);
  const { selected } = useBusiness();
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // New state to track login status
  const [isDownloading, setIsDownloading] = useState(false);

  // Define fetchData using useCallback to prevent unnecessary re-creations
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    
    if (!token) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }
    
    setIsLoggedIn(true);
    setLoading(true);
    setError(null);

    // Use a URL with start and end dates if they are set
    let fetchUrl = (startDate && endDate)
      ? `${apiUrl}?start_date=${startDate}&end_date=${endDate}`
      : apiUrl; // Fallback to the default URL if no dates are selected
    const u = new URL(fetchUrl);
    if (selected) u.searchParams.set("business", selected);
    fetchUrl = u.toString();
    
    try {
      const response = await fetch(fetchUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData({
        line_data: result.line_data || [],
        bar_data: result.bar_data || [],
        pie_data: result.pie_data || [],
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, startDate, endDate, selected]); // Add dependencies to useCallback

  // Call fetchData when the component mounts or when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Dependency array includes fetchData

  const handleDownload = async () => {
    setIsDownloading(true);
    let downloadUrl = (startDate && endDate)
      ? `${reportApiUrl}?start_date=${startDate}&end_date=${endDate}`
      : reportApiUrl; // Fallback to the default URL if no dates are selected
    const d = new URL(downloadUrl);
    if (selected) d.searchParams.set("business", selected);
    downloadUrl = d.toString();
    
    const token = localStorage.getItem("access_token");

    if (!token) {
        alert("Authentication token not found. Please log in.");
        setIsDownloading(false);
        return;
    }

    try {
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const disposition = response.headers.get('Content-Disposition');
      const filenameMatch = disposition && disposition.match(/filename="(.+)"/);
      const filename = filenameMatch && filenameMatch[1] ? filenameMatch[1] : `report_${Date.now()}.csv`;

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (e) {
      console.error("Download failed:", e);
      alert(`Failed to download report: ${e.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isLoggedIn) {
    return <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-700">Please log in to view this dashboard.</div>;
  }
  
  const PIE_CHART_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#d0ed57", "#a4de6c", "#d19a66", "#d81e5b"];

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Sales Overview</h1>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
            <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded px-2 py-1"
            />
            <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded px-2 py-1"
            />
            <button
                onClick={fetchData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
                Apply
            </button>
            </div>

            <button
                onClick={handleDownload}
                className="flex items-center px-4 py-2 text-sm rounded-md bg-green-500 text-white shadow-md hover:bg-green-600 transition-colors duration-200"
                disabled={isDownloading}
            >
                {isDownloading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <FaDownload className="mr-2" />
                    Download Report
                  </>
                )}
            </button>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-md">
            <FaSpinner className="animate-spin text-4xl text-purple-500 mb-4" />
            <p className="text-gray-600">Loading charts...</p>
          </div>
        )}
        {error && !loading && (
          <div className="flex items-center justify-center p-8 bg-red-50 rounded-xl shadow-md">
            <FaExclamationTriangle className="text-red-500 mr-4 text-2xl" />
            <p className="text-red-700 font-medium">Error fetching data: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Sales Trend Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Sales Trend</h3>
                <FaChartLine className="text-green-500 text-xl" />
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.line_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                    <Line type="monotone" dataKey="sales" stroke="#22c55e" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Selling Products Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Top 10 Selling Products</h3>
                <FaChartBar className="text-blue-500 text-xl" />
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.bar_data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                    <Bar dataKey="sales" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sales by Category Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Sales by Category</h3>
                <FaChartPie className="text-pink-500 text-xl" />
              </div>
              <div className="h-96 flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.pie_data}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      labelLine={false}
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.pie_data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default SalesOverview;