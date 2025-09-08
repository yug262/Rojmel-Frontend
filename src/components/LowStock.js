import { useState, useEffect } from "react";
import '../css/comp.css';

export default function LowStock({ data }) {
  const [inputMode, setInputMode] = useState(false);
  const [stock, setStock] = useState(20);
  const [lowStockItems, setLowStockItems] = useState([]);

  // Update low stock items whenever data or stock threshold changes
  useEffect(() => {
    const filtered = Array.isArray(data)
      ? data.filter(item => item.current_stock <= stock).slice(0, 5)
      : [];
    setLowStockItems(filtered);
  }, [data, stock]);

  return (
    <>
      {inputMode ? (
        <div className="input mt-12 h-[170px]" id="comp">
          
        </div>
      ) : (
        <>
          <button
            className="low-s p-1 px-3 text-red-900 bg-red-100 rounded-2xl"
            onClick={() => setInputMode(false)}
          >
            Low Stock
          </button>
          <div className="py-3">
            <table className="border-0 text-black w-full">
              <tbody>
                {lowStockItems.length > 0 ? (
                  lowStockItems.map((item, index) => (
                    <tr key={item.product_name || index}>
                      <td className="px-5">{item.product_name}</td>
                      <td className="text-red-500 px-5">{item.current_stock}</td>
                      <td className="text-gray-400 px-5">/ {item.min_stock}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-gray-400">
                      No low stock products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}