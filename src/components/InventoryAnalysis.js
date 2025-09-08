import React, { useEffect, useState, useCallback } from "react";
import { useBusiness } from "../contexts/BusinessContext";
import { FaChartLine, FaSpinner, FaDownload, FaExclamationTriangle } from "react-icons/fa";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const API_URL = process.env.REACT_APP_API_URL;
const REPORT_API_URL = process.env.REACT_APP_REPORT_API_URL;

const InventoryAnalysis = () => {
  const [data, setData] = useState({ low_stock_products: [], inventory_value: 0, stock_movement_data: [] });
  const [loading, setLoading] = useState(true);
  const { selected } = useBusiness();
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch Data
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

    let fetchUrl = API_URL;
    if (startDate && endDate) {
      fetchUrl = `${API_URL}?start_date=${startDate}&end_date=${endDate}`;
    }

    const urlObj = new URL(fetchUrl);
    if (selected) urlObj.searchParams.set("business", selected);
    fetchUrl = urlObj.toString();

    try {
      const response = await fetch(fetchUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL, startDate, endDate, selected]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Download Report
  const handleDownload = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Authentication token not found. Please log in.");
      return;
    }

    setIsDownloading(true);

    let downloadUrl = REPORT_API_URL;
    if (startDate && endDate) {
      downloadUrl = `${REPORT_API_URL}?start_date=${startDate}&end_date=${endDate}`;
    }

    const urlObj = new URL(downloadUrl);
    if (selected) urlObj.searchParams.set("business", selected);
    downloadUrl = urlObj.toString();

    try {
      const response = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition && disposition.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `inventory_analysis_report_${Date.now()}.csv`;

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
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
          <h1 className="text-3xl font-bold text-gray-800">Inventory Analysis</h1>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded px-2 py-1" />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded px-2 py-1" />
              <button onClick={fetchData} className="px-4 py-2 bg-blue-600 text-white rounded-md">Apply</button>
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
            <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
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

            {/* Inventory Value */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Inventory Value</h3>
              <p className="text-4xl font-bold text-blue-600">
                ₹{data.inventory_value.toLocaleString()}
              </p>
              <p className="text-gray-500 mt-2">Total value of all products in stock.</p>
            </div>

            {/* Low Stock Products */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Low Stock Products</h3>
              {data.low_stock_products.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {data.low_stock_products.map((p, index) => (
                    <li key={index} className="flex items-center justify-between text-gray-700">
                      <span>{p.product_name}</span>
                      <span className="font-semibold text-red-500">Stock: {p.current_stock}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">All products are adequately stocked!</p>
              )}
            </div>

            {/* Stock Movement Trend */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Total Stock Movement Trend</h3>
                <FaChartLine className="text-green-500 text-xl" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.stock_movement_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="stock" stroke="#4ade80" activeDot={{ r: 8 }} />
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

export default InventoryAnalysis;
