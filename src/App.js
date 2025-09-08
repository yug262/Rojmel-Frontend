import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import OrdersReturns from "./pages/OrdersReturns";
import Login from "./pages/Login"
import Analysis from "./pages/Analysis";
import AdvanceAnalysis from "./pages/AdvanceAnalysis";
import { BusinessProvider } from "./contexts/BusinessContext";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/test/")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <>
    <BusinessProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders&returns" element={<OrdersReturns />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/advance_analysis" element={<AdvanceAnalysis />} />
        </Routes>
      </Router>
    </BusinessProvider>
    </>
  );
}

export default App;