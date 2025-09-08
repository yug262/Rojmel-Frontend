import { useEffect, useState } from "react";
import CategoryChart from "./CategoryChart";

export default function Dashboard() {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard_metrics/", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
    })
      .then(res => res.json())
      .then(data => {
        setCategoryData(data.category_chart_data || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading chart...</p>;
  if (!categoryData.length) return <p>No category data available</p>;

  return (
    <div className="w-full h-96 p-4 bg-white rounded-xl shadow">
      <CategoryChart data={categoryData} />
    </div>
  );
}
