export default function TopSales({ data }) {
  const items = Array.isArray(data) ? data : [];

  return (
    <div className="p-4 rounded-xl">
      <div className="tag" id="tag">Top Products</div>
      {items.length === 0 ? (
        <div className="text-sm text-gray-500">No top products yet</div>
      ) : (
        <ul className="space-y-2 mt-3">
          {items.map((p, i) => (
            <li key={i} className="flex justify-between">
              <div>
                <div className="font-medium">{p.product_name}</div>
                <div className="text-xs text-gray-500">{p.quantity} sold</div>
              </div>
              <div className="text-sm font-semibold">₹ {p.revenue.toLocaleString?.() ?? p.revenue}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
