// Return.js
export default function Return({ data }) {
  const value = data ?? 0;
  return (
    <div className="p-4 rounded-xl">
      <div className="tag" id="tag">Returns</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
