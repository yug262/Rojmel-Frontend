// SalesChart.js
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function SalesChart({ data }) {
  // Defensive check: Ensure data is an array before trying to render.
  const chartData = Array.isArray(data) ? data : [];

  // Conditional rendering: Don't render the chart if there is no data.
  // This prevents the "Cannot read properties of undefined" error.
  if (!chartData || chartData.length === 0) {
    return (
      <div className="p-4 rounded-xl h-full flex items-center justify-center">
        <p>No sales data available for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl h-full">
      <div className="tag" id="tag">Daily Sales (Last 30 Days)</div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          {/* XAxis: Maps the 'date' property from the data */}
          <XAxis dataKey="date" />
          {/* YAxis: Renders the sales values */}
          <YAxis />
          {/* Tooltip: Shows the value when a user hovers over a data point */}
          <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, "Sales"]} />
          {/* Line: The actual line on the graph, using 'sales' as the value */}
          <Line type="monotone" dataKey="sales" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}