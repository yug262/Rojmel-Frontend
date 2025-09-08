import React, { useEffect, useState, useCallback } from "react";
import { useBusiness } from "../contexts/BusinessContext";
import { FaChartLine, FaChartBar, FaSpinner, FaDownload, FaExclamationTriangle } from 'react-icons/fa';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const CustomerSalesAnalysis = ({
  apiUrl = "http://127.0.0.1:8000/api/analysis/customer-sales-analysis/",
  reportApiUrl = "http://127.0.0.1:8000/api/analysis/customer-sales-analysis-report/",
}) => {
  const [data, setData] = useState({ top_customers: [], top_selling_products: [], sales_trend_data: [] });
  const [loading, setLoading] = useState(true);
  const { selected } = useBusiness();
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

    let fetchUrl = apiUrl;
    if (startDate && endDate) {
      fetchUrl = `${apiUrl}?start_date=${startDate}&end_date=${endDate}`;
    }
    const u = new URL(fetchUrl);
    if (selected) u.searchParams.set("business", selected);
    fetchUrl = u.toString();

    try {
      const response = await fetch(fetchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      setData({
        top_customers: result.top_customers || [],
        top_selling_products: result.top_selling_products || [],
        sales_trend_data: result.sales_trend_data || [],
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, startDate, endDate, selected]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownload = async () => {
    setIsDownloading(true);
    let downloadUrl = reportApiUrl;
    if (startDate && endDate) {
      downloadUrl = `${reportApiUrl}?start_date=${startDate}&end_date=${endDate}`;
    }
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
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition && disposition.match(/filename="(.+)"/);
      const filename = filenameMatch && filenameMatch[1] ? filenameMatch[1] : `customer_sales_report_${Date.now()}.csv`;

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
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
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-700">
        Please log in to view this dashboard.
      </div>
    );
  }
  
  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Customer & Sales Analysis</h1>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded px-2 py-1" />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded px-2 py-1" />
              <button onClick={fetchData} className="px-4 py-2 bg-blue-600 text-white rounded-md">Apply</button>
            </div>
            <button onClick={handleDownload} className="flex items-center px-4 py-2 text-sm rounded-md bg-green-500 text-white shadow-md hover:bg-green-600 transition-colors duration-200" disabled={isDownloading}>
              {isDownloading ? (<><FaSpinner className="animate-spin mr-2" />Downloading...</>) : (<><FaDownload className="mr-2" />Download Report</>)}
            </button>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-md">
            <FaSpinner className="animate-spin text-4xl text-purple-500 mb-4" />
            <p className="text-gray-600">Loading analysis data...</p>
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
            {/* Top Customers */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Top Customers</h3>
                <FaChartBar className="text-teal-500 text-xl" />
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.top_customers} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="customer_name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_revenue" fill="#82ca9d" name="Total Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Selling Products */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Top Selling Products</h3>
                <FaChartBar className="text-orange-500 text-xl" />
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.top_selling_products} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="product_name" type="category" width={100}/>
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_quantity" fill="#ff7300" name="Total Quantity" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sales Trend Over Time */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Sales Trend Over Time</h3>
                <FaChartLine className="text-blue-500 text-xl" />
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.sales_trend_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sales" stroke="#3b82f6" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSalesAnalysis;
