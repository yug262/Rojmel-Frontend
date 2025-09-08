// NetProfit.js
export default function NetProfit({ data }) {
  const value = data ?? 0;
  return (
    <div className="p-4 rounded-xl">
      <div className="tag" id="tag">Net Profit</div>
      <div className="text-2xl font-bold mt-1">₹ {value.toLocaleString?.() ?? value}</div>
    </div>
  );
}