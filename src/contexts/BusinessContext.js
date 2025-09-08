import { createContext, useContext, useEffect, useState } from "react";

const BusinessContext = createContext({
  businesses: [],
  selected: "all",
  setSelected: () => {},
  refresh: () => {},
});

export const BusinessProvider = ({ children }) => {
  const [businesses, setBusinesses] = useState([]);
  const [selected, setSelected] = useState(() => localStorage.getItem("business_selected") || "all");

  const fetchBusinesses = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/businesses/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setBusinesses(data);
      if (data.length > 0 && selected !== "all") {
        const exist = data.find((b) => String(b.id) === String(selected));
        if (!exist) setSelected("all");
      }
    } catch (e) {
      console.error("Failed to fetch businesses", e);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    localStorage.setItem("business_selected", selected);
  }, [selected]);

  return (
    <BusinessContext.Provider value={{ businesses, selected, setSelected, refresh: fetchBusinesses }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => useContext(BusinessContext);


