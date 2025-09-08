import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// ✅ Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function ForecastChart(props) {
  const { productId } = props;
  const [forecast, setForecast] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL;

 useEffect(() => {
  axios.get(`${API_URL}/forecast/${productId}/`)
    .then((res) => {
      if (res.data.forecast) {
        setForecast(res.data.forecast);
        setMessage(res.data.message);
      } else {
        setForecast([]);
        setMessage("No forecast data available.");
      }
    })
    .catch((err) => {
      console.error("Error fetching forecast data:", err.response?.data || err.message);
      setMessage("Error fetching forecast data");
      setForecast([]);
    })
    .finally(() => setLoading(false));
}, [productId]);


  if (loading) return <p>Loading forecast...</p>;

  const chartData = {
    labels: forecast.map((item) => item.date),
    datasets: [
      {
        label: "Predicted Demand",
        data: forecast.map((item) => item.predicted_demand),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Monthly Demand Forecast" },
    },
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-2">Demand Forecast</h2>
      <p className="mb-4">{message}</p>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

export default ForecastChart;