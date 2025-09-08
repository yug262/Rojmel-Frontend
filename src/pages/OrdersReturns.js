import { useState, useEffect, useMemo } from "react";
import { useBusiness } from "../contexts/BusinessContext";
import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Navbar";

export default function OrdersReturns() {
  const { selected } = useBusiness();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(formatDate(today));
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const dismissMessage = () => {
    setMessage(null);
    setMessageType(null);
  };
  const [activeTab, setActiveTab] = useState('orders');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOrder, setNewOrder] = useState({ product_name: "", quantity: 1, customer_name: "", order_id: "", tracking_id: "" });
  const [orderSearch, setOrderSearch] = useState("");
  const [returnSearch, setReturnSearch] = useState("");
  const [debouncedOrderSearch, setDebouncedOrderSearch] = useState("");
  const [debouncedReturnSearch, setDebouncedReturnSearch] = useState("");
  const API_URL = process.env.REACT_APP_API_URL;
  
  // Debounce search inputs for smoother UX
  useEffect(() => {
    const t = setTimeout(() => setDebouncedOrderSearch(orderSearch), 300);
    return () => clearTimeout(t);
  }, [orderSearch]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedReturnSearch(returnSearch), 300);
    return () => clearTimeout(t);
  }, [returnSearch]);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const isAuthenticated = !!token;

  function formatDate(dateObj) {
    const d = new Date(dateObj);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  // Calendar logic
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const days = Array.from({ length: firstDay }, () => null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const disableNextMonth = currentYear === today.getFullYear() && currentMonth >= today.getMonth();

  function handlePreviousMonth() {
    let month = currentMonth - 1;
    let year = currentYear;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
    setCurrentMonth(month);
    setCurrentYear(year);
  }

  function handleNextMonth() {
    if (disableNextMonth) return;
    let month = currentMonth + 1;
    let year = currentYear;
    if (month > 11) {
      month = 0;
      year += 1;
    }
    setCurrentMonth(month);
    setCurrentYear(year);
  }

  function handleDateClick(day) {
    if (!day) return;
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setMessage(null);
  }

  async function fetchOrders() {
    if (!token) return;
    try {
      const url = new URL(`${API_URL}/orders/`);
      // If searching, fetch across all dates; otherwise, scope to selected date
      if (!(debouncedOrderSearch || "").trim()) {
        url.searchParams.set('date', selectedDate);
      }
      if (selected) url.searchParams.set('business', selected);
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON response:", text);
        return;
      }
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  }

  async function fetchReturns() {
    if (!token) return;
    try {
      const url = new URL(`${API_URL}/returns/`);
      // If searching, fetch across all dates; otherwise, scope to selected date
      if (!(debouncedReturnSearch || "").trim()) {
        url.searchParams.set('date', selectedDate);
      }
      if (selected) url.searchParams.set('business', selected);
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON response:", text);
        setMessage("Server returned invalid response.");
        setMessageType("error");
        return;
      }
      setReturns(data);
    } catch (err) {
      console.error("Error fetching returns", err);
    }
  }

  async function fetchProducts() {
    if (!token) return;
    try {
      const url = new URL(`${API_URL}/products/`);
      if (selected) url.searchParams.set('business', selected);
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON response:", text);
        return;
      }
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchReturns();
      fetchProducts();
    }
  }, [selectedDate, isAuthenticated, selected, debouncedOrderSearch, debouncedReturnSearch]);

  async function handleAddOrder(e) {
    e.preventDefault();
    setMessage(null);

    if (!token) {
      setMessage("You are not logged in!");
      setMessageType("error");
      return;
    }

    const today = new Date();
    const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    if (new Date(selectedDate) > new Date(todayFormatted)) {
      setMessage("Cannot add an order for a future date.");
      setMessageType("error");
      return;
    }

    const selectedProduct = e.target.product_name.value;
    if (selectedProduct === "") {
      setMessage("Please select a product.");
      setMessageType("error");
      return;
    }


    const orderForm = {
      order_id: (e.target.order_id?.value || "").trim(),
      tracking_id: (e.target.tracking_id?.value || "").trim(),
      product_name: selectedProduct,
      quantity: parseInt(e.target.quantity.value, 10),
      customer_name: e.target.customer_name.value.trim(),
      date: selectedDate,
    };

    if (
      !orderForm.product_name ||
      !orderForm.customer_name ||
      !orderForm.order_id ||
      !orderForm.tracking_id ||
      isNaN(orderForm.quantity) ||
      orderForm.quantity < 1
    ) {
      setMessage("Please fill all required fields with valid values");
      setMessageType("error");
      return;
    }

    try {
      let url = new URL(`${API_URL}/orders/add/`);
      if (selected && selected !== 'all') url.searchParams.set('business', selected);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderForm),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Backend validation errors:", data);
        if (data.errors) {
          const messages = Object.entries(data.errors)
            .map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(", ") : msg}`)
            .join("\n");
          setMessage(messages);
        } else {
          setMessage(data.message || "Something went wrong");
        }
        setMessageType("error");
      } else {
        fetchOrders();
        fetchProducts();
        e.target.reset();
        setMessage("Order added and inventory updated successfully!");
        setMessageType("success");
      }
    } catch (err) {
      console.error("Network error:", err);
      setMessage("Failed to connect to server.");
      setMessageType("error");
    }
  }


  async function handleReturn(order) {
    setMessage(null);
    if (!token) {
      setMessage("You are not logged in!");
      setMessageType("error");
      return;
    }

    const returnPayload = { order: order.id, quantity: order.quantity, date: selectedDate };

    try {
      const url = new URL(`${API_URL}/returns/add/`);
      if (selected && selected !== 'all') url.searchParams.set('business', selected);
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(returnPayload)
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON response:", text);
        setMessage("Server returned invalid response.");
        setMessageType("error");
        return;
      }

      if (res.ok) {
        fetchReturns();
        fetchOrders();
        fetchProducts();
        setMessage(`Order ${order.order_id} has been returned and inventory updated successfully!`);
        setMessageType("success");
      } else {
        setMessage(data.message || "Failed to return order");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Network error:", err);
      setMessage("Failed to connect to server.");
      setMessageType("error");
    }
  }


  async function handleRemoveReturn(returnId) {
    setMessage(null);
    if (!token) {
      setMessage("You are not logged in!");
      setMessageType("error");
      return;
    }

    const returnToRemove = returns.find(r => r.id === returnId);
    if (!returnToRemove) {
      setMessage("Return not found.");
      setMessageType("error");
      return;
    }

    try {
      // Attempt 1: POST remove/<id>/
      const url1 = new URL(`${API_URL}/returns/remove/` + encodeURIComponent(returnId) + "/");
      if (selected && selected !== 'all') url1.searchParams.set('business', selected);
      let res = await fetch(url1, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });

      // Attempt 2: POST <id>/delete/
      if (res.status === 405) {
        const url2 = new URL(`${API_URL}/returns/` + encodeURIComponent(returnId) + "/delete/");
        if (selected && selected !== 'all') url2.searchParams.set('business', selected);
        res = await fetch(url2, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      }

      // Attempt 3: DELETE returns/?id=
      if (res.status === 405) {
        const url3 = new URL(`${API_URL}/returns/`);
        url3.searchParams.set('id', returnId);
        if (selected && selected !== 'all') url3.searchParams.set('business', selected);
        res = await fetch(url3, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      }
      if (res.ok) {
        fetchReturns();
        fetchOrders();
        fetchProducts();
        setMessage("Return has been removed and inventory updated successfully!");
        setMessageType("success");
      } else {
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = null; }
        setMessage((data && (data.message || data.error)) || text || "Failed to remove return");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Network error:", err);
      setMessage("Failed to connect to server.");
      setMessageType("error");
    }
  }

  const handleConfirmDelete = async (orderId) => {
    setMessage(null);
    try {
      const orderToDelete = orders.find(o => o.id === orderId);
      if (!orderToDelete) {
        setMessage("Order not found.");
        setMessageType("error");
        return;
      }

      const res = await fetch(`${API_URL}/orders/${orderId}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 204) {
        fetchOrders();
        fetchProducts();
        setMessage("Order deleted and inventory updated successfully!");
        setMessageType("success");
      } else {
        const data = await res.json();
        console.error("Failed to delete order:", data);
        setMessage(data.message || "Failed to delete order.");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Network error:", err);
      setMessage("Failed to connect to server.");
      setMessageType("error");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const handleDeleteOrder = (orderId) => {
    if (!token) {
      setMessage("You are not logged in!");
      setMessageType("error");
      return;
    }
    setConfirmDeleteId(orderId);
  };

  return (
    <ProtectedRoute>
      <section className="header">
        <Navbar />
      </section>
      <section className="body">
        <div className="main w-full pt-5 px-12">
          <div className="heading mt-12 flex justify-between items-center">
            <div>
              <h1 className="font-bold text-4xl">Orders & Returns</h1>
              <p className="opacity-40 mt-1">Manage daily orders, returns, and inventory updates</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAddModal(true)} className="rounded-xl bg-gray-200 px-3 py-2 hover:bg-gray-300 text-sm">Add Order</button>
            </div>
          </div>

          {/* Message Box */}
          {message && (
            <div className={`mt-5 p-3 rounded-lg flex items-start justify-between ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <span className="pr-3 leading-6">{message}</span>
              <button type="button" onClick={dismissMessage} className="ml-4 text-sm opacity-70 hover:opacity-100">✕</button>
            </div>
          )}

          {/* Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 mt-5">
            <div id="comp" className="light-comp card rounded-xl m-5 p-5">
              <div className="card-head m-2 flex justify-between">
                <h2 className="text-lg font-semibold">Select Date</h2>
              </div>
              <div className="card-body p-1 mt-5 text-gray-600">
                <div className="flex justify-between items-center mb-3 text-sm">
                  <button onClick={handlePreviousMonth} className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs">Prev</button>
                  <span className="font-medium">{months[currentMonth]} {currentYear}</span>
                  <button onClick={handleNextMonth} disabled={disableNextMonth} className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs disabled:opacity-50">Next</button>
                </div>
                <div className="grid grid-cols-7 text-center text-xs gap-1">
                  {weekdays.map(d => <div key={d} className="font-medium opacity-60 py-1">{d}</div>)}
                  {days.map((day, i) => (
                    <div
                      key={i}
                      className={`p-1 rounded-lg text-xs transition-colors ${selectedDate === `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                          ? "bg-blue-600 text-white"
                          : day ? "cursor-pointer hover:bg-blue-100" : ""
                        }`}
                      onClick={() => handleDateClick(day)}
                    >
                      {day || ""}
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs opacity-70">Selected: <span className="font-medium">{selectedDate}</span></div>
              </div>
            </div>
            {/* Tabbed list */}
            <div id="comp" className="light-comp card rounded-xl m-5 p-5">
              <div className="card-head m-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveTab('orders')} className={`px-3 py-1.5 rounded-lg text-sm ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Orders</button>
                  <button onClick={() => setActiveTab('returns')} className={`px-3 py-1.5 rounded-lg text-sm ${activeTab === 'returns' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Returns</button>
                </div>
                {activeTab === 'orders' ? (
                  <input
                    type="search"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search orders by product or customer"
                    aria-label="Search orders"
                    className="border px-3 py-2 rounded-lg text-sm w-full md:w-72"
                  />
                ) : (
                  <input
                    type="search"
                    value={returnSearch}
                    onChange={(e) => setReturnSearch(e.target.value)}
                    placeholder="Search returns by product or customer"
                    aria-label="Search returns"
                    className="border px-3 py-2 rounded-lg text-sm w-full md:w-72"
                  />
                )}
              </div>
              <div className="card-body p-1 mt-3 text-gray-600">
                {activeTab === 'orders' ? (
                  <div className="grid md:grid-cols-2 gap-3">
                    {(() => {
                      const q = debouncedOrderSearch.trim().toLowerCase();
                      const list = orders
                        .filter(o => !o.is_returned)
                        .filter(o => {
                          if (!q) return true;
                          const haystacks = [
                            o.product_name,
                            o.customer_name || '',
                            o.order_id || '',
                            o.tracking_id || '',
                            String(o.quantity || '')
                          ].map(String).map(s => s.toLowerCase());
                          return haystacks.some(h => h.includes(q));
                        });
                      if (list.length === 0) return (<div className="text-center opacity-60 py-6 col-span-2">No matching orders</div>);
                      return list.map(order => (
                        <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-3 flex flex-col gap-2">
                          <div className="flex justify-between">
                            <div>
                              <div className="font-semibold">{order.product_name}</div>
                              <div className="text-xs opacity-70">Customer: {order.customer_name}</div>
                              <div className="text-xs opacity-70">Order ID: {order.order_id}</div>
                            </div>
                            <div className="text-sm font-medium">Qty: {order.quantity}</div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleReturn(order)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs">Return</button>
                            <button onClick={() => handleDeleteOrder(order.id)} className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs">Delete</button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {(() => {
                      const q = debouncedReturnSearch.trim().toLowerCase();
                      const list = returns
                        .filter(r => {
                          if (!q) return true;
                          const haystacks = [
                            r.product_name,
                            r.customer_name || '',
                            r.order_id || '',
                            r.tracking_id || '',
                            String(r.quantity || '')
                          ].map(String).map(s => s.toLowerCase());
                          return haystacks.some(h => h.includes(q));
                        });
                      if (list.length === 0) return (<div className="text-center opacity-60 py-6 col-span-2">No matching returns</div>);
                      return list.map(r => (
                        <div key={r.id} className="bg-white rounded-lg border border-gray-200 p-3 flex flex-col gap-2">
                          <div className="flex justify-between">
                            <div>
                              <div className="font-semibold">{r.product_name}</div>
                              <div className="text-xs opacity-70">Customer: {r.customer_name}</div>
                              <div className="text-xs opacity-70">Order ID: {r.order_id}</div>
                            </div>
                            <div className="text-sm font-medium">Qty: {r.quantity}</div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleRemoveReturn(r.id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs">Remove</button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modals */}
          {confirmDeleteId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl w-[90%] sm:w-[420px] space-y-4 shadow-xl">
                <div className="head">
                  <h2 className="text-xl font-bold">Delete this order?</h2>
                  <p className="text-gray-600 text-sm mt-1">This action will remove the order and restore its stock.</p>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={handleCancelDelete} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
                  <button onClick={() => handleConfirmDelete(confirmDeleteId)} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
                </div>
              </div>
            </div>
          )}

          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-600 p-6 rounded-xl w-[90%] sm:w-[420px] space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="head">
                  <h2 className="text-xl font-bold">Add New Order</h2>
                  <p className="text-gray-200 text-sm">For date: {selectedDate}</p>
                </div>
                <hr className="border-gray-300" />
                <form onSubmit={(e) => { handleAddOrder(e); if (e.target.checkValidity()) { setShowAddModal(false); setNewOrder({ product_name: "", quantity: 1, customer_name: "", order_id: "", tracking_id: "" }); } }} className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Product</label>
                    <select name="product_name" value={newOrder.product_name} onChange={(e) => setNewOrder({ ...newOrder, product_name: e.target.value })} className="w-full border p-2 rounded text-sm" required>
                      <option value="">Select product</option>
                      {products.map(p => <option key={p.id} value={p.product_name}>{p.product_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Order ID</label>
                    <input type="text" name="order_id" value={newOrder.order_id} onChange={(e) => setNewOrder({ ...newOrder, order_id: e.target.value })} className="w-full border p-2 rounded text-sm" placeholder="Order Id" required/>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Tracking ID</label>
                    <input type="text" name="tracking_id" value={newOrder.tracking_id} onChange={(e) => setNewOrder({ ...newOrder, tracking_id: e.target.value })} className="w-full border p-2 rounded text-sm" placeholder="Tracking Id" required/>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Quantity</label>
                    <input type="number" name="quantity" min="1" value={newOrder.quantity} onChange={(e) => setNewOrder({ ...newOrder, quantity: Number(e.target.value) })} className="w-full border p-2 rounded text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Customer</label>
                    <input type="text" name="customer_name" value={newOrder.customer_name} onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })} className="w-full border p-2 rounded text-sm" placeholder="Customer name" required />
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button type="button" onClick={() => { setShowAddModal(false); setNewOrder({ product_name: "", quantity: 1, customer_name: "" }); }} className="px-4 py-2 rounded-lg bg-red-400 hover:bg-red-500">Cancel</button>
                    <button type="submit" disabled={products.length === 0} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50">Add Order</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </section>
    </ProtectedRoute>
  );
}
