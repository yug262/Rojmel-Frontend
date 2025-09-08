import React, { useState } from "react";
import { FaChartPie, FaChartLine, FaChartBar, FaBoxes, FaUserTag } from 'react-icons/fa';
import Navbar from "../components/Navbar";

const tabOptions = [
  { id: 'sales', title: 'Sales Overview', icon: <FaChartPie className="mr-2" />, component: 'SalesOverview' },
  { id: 'returns', title: 'Returns Analysis', icon: <FaChartLine className="mr-2" />, component: 'ReturnsAnalysis' },
  { id: 'revenue', title: 'Revenue & Profit', icon: <FaChartBar className="mr-2" />, component: 'RevenueProfitAnalysis' },
  { id: 'inventory', title: 'Inventory Analysis', icon: <FaBoxes className="mr-2" />, component: 'InventoryAnalysis' },
  { id: 'customers', title: 'Customer & Sales', icon: <FaUserTag className="mr-2" />, component: 'CustomerSalesAnalysis' },
];

const components = {
  SalesOverview: React.lazy(() => import("../components/SalesOverview")),
  ReturnsAnalysis: React.lazy(() => import("../components/ReturnsAnalysis")),
  RevenueProfitAnalysis: React.lazy(() => import("../components/RevenueProfitAnalysis")),
  InventoryAnalysis: React.lazy(() => import("../components/InventoryAnalysis")),
  CustomerSalesAnalysis: React.lazy(() => import("../components/CustomerSalesAnalysis")),
};

const AnalysisTabs = () => {
  const [activeTab, setActiveTab] = useState(tabOptions[0].id);

  const ActiveComponent = components[tabOptions.find(tab => tab.id === activeTab).component];

  return (
    <>
    <section>
      <Navbar />
    </section>
    <section className="mt-24">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-wrap items-center justify-center p-2 rounded-xl shadow-md bg-white">
            {tabOptions.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white shadow-md transform scale-105"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.icon}
                {tab.title}
              </button>
            ))}
          </div>
          <div className="p-4 bg-gray-50 rounded-xl shadow-md">
            <React.Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <svg className="animate-spin h-8 w-8 text-purple-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.062 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            }>
              <ActiveComponent />
            </React.Suspense>
          </div>
        </div>
    </section>
    </>
  );
};

export default AnalysisTabs;
