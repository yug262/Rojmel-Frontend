import { useState, useEffect } from "react";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx-js-style";
import Navbar from "../components/Navbar";
import Sales from "../components/Sales";
import TotalOrders from "../components/TotalOrders";
import TopSales from "../components/TopSales";
import LowStock from "../components/LowStock";
import Return from "../components/Return";
import NetProfit from "../components/NetProfit";
import SalesChart from "../charts/SalesChart";
import ProtectedRoute from "../components/ProtectedRoute";
import { useBusiness } from "../contexts/BusinessContext";

export default function Dashboard() {
    const { selected } = useBusiness();
    const [dashboardData, setDashboardData] = useState({
        total_sales: 0,
        total_orders: 0,
        net_profit: 0,
        total_returns: 0,
        top_sales: [],
        low_stock_products: [],
        sales_chart_data: [],
        category_chart_data: []
    });

    const [lastUpdated, setLastUpdated] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            const accessToken = localStorage.getItem("access_token");
            if (!accessToken) {
                setError("Authentication token not found. Redirecting to login...");
                setIsLoading(false);
                window.location.href = "/login";
                return;
            }

            try {
                const url = new URL("http://127.0.0.1:8000/api/dashboard/");
                if (selected) url.searchParams.set("business", selected);
                const response = await fetch(url, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`,
                    },
                });

                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("access_token");
                    setError("Unauthorized. Redirecting to login...");
                    setIsLoading(false);
                    window.location.href = "/login";
                    return;
                }

                const text = await response.text();
                const data = JSON.parse(text);

                const limitedTopSales = (data.top_sales || []).slice(0, 5);
                const limitedLowStock = (data.low_stock_products || []).slice(0, 5);
                const limitedSalesChartData = (data.sales_chart_data || []).slice(-30);
                const limitedCategoryData = (data.category_chart_data || []).slice(0, 7);

                const transformedCategoryData = limitedCategoryData.map(item => ({
                    name: item.category || item.name,
                    value: Number(item.count || item.value || 0)
                }));

                setDashboardData({
                    ...data,
                    top_sales: limitedTopSales,
                    low_stock_products: limitedLowStock,
                    sales_chart_data: limitedSalesChartData,
                    category_chart_data: transformedCategoryData
                });
                setLastUpdated(new Date());

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();

        const today = new Date();
        const nextMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        const msUntilMidnight = nextMidnight - today;

        const midnightTimeout = setTimeout(() => {
            fetchDashboardData();
            localStorage.setItem("lastDashboardFetch", Date.now());

            const dailyInterval = setInterval(() => {
                fetchDashboardData();
                localStorage.setItem("lastDashboardFetch", Date.now());
            }, 24 * 60 * 60 * 1000);

            window.dailyIntervalId = dailyInterval;
        }, msUntilMidnight);

        return () => {
            clearTimeout(midnightTimeout);
            if (window.dailyIntervalId) clearInterval(window.dailyIntervalId);
        };
    }, [selected]);

    const handleExportDashboardExcel = async () => {
        try {
            setIsExporting(true);
            const token = localStorage.getItem("access_token");
            if (!token) return;

            const headers = { Authorization: `Bearer ${token}` };

            // Always fetch products for current selection (selected or all)
            const prodUrl = new URL("http://127.0.0.1:8000/api/products/");
            if (selected) prodUrl.searchParams.set("business", selected);

            // Fetch all businesses to compute per-business order/return columns
            const bizUrl = new URL("http://127.0.0.1:8000/api/businesses/");

            const [prodRes, bizRes] = await Promise.all([
                fetch(prodUrl, { headers }),
                fetch(bizUrl, { headers })
            ]);
            if (!prodRes.ok || !bizRes.ok) throw new Error("Failed to fetch base report data");
            const [products, businesses] = await Promise.all([prodRes.json(), bizRes.json()]);

            // For each business, fetch orders and returns scoped to that business
            const perBusiness = await Promise.all((businesses || []).map(async (b) => {
                const ordUrl = new URL("http://127.0.0.1:8000/api/orders/");
                const retUrl = new URL("http://127.0.0.1:8000/api/returns/");
                ordUrl.searchParams.set("business", b.id);
                retUrl.searchParams.set("business", b.id);
                const [ordRes, retRes] = await Promise.all([
                    fetch(ordUrl, { headers }),
                    fetch(retUrl, { headers })
                ]);
                const [orders, returnsData] = await Promise.all([ordRes.json(), retRes.json()]);
                const sellQtyByName = {};
                const returnQtyByName = {};
                for (const o of orders) sellQtyByName[o.product_name] = (sellQtyByName[o.product_name] || 0) + Number(o.quantity || 0);
                for (const r of returnsData) returnQtyByName[r.product_name] = (returnQtyByName[r.product_name] || 0) + Number(r.quantity || 0);
                return { business: b, sellQtyByName, returnQtyByName };
            }));

            const rows = products.map((p) => {
                const unitPrice = Number(p.price || 0);
                const maxStock = Number(p.max_stock || 0);
                // Aggregate across ALL businesses for totals
                let sellingQty = 0;
                let returnQty = 0;
                perBusiness.forEach(({ sellQtyByName, returnQtyByName }) => {
                    sellingQty += Number(sellQtyByName[p.product_name] || 0);
                    returnQty += Number(returnQtyByName[p.product_name] || 0);
                });
                const finalSellingQty = sellingQty - returnQty; // 8
                const sellQtyAmount = finalSellingQty * unitPrice; // 10 = 8*4
                const purchaseQtyAmount = unitPrice * maxStock; // 11 = 4*5
                const base = {
                    id: p.id, // 1
                    "product name": p.product_name, // 2
                    sku: p.sku, // 3
                    "unit price": unitPrice, // 4
                    "max stock": maxStock, // 5
                    "selling qty": sellingQty, // 6
                    "return qty": returnQty, // 7
                    "final selling qty": finalSellingQty, // 8
                    "current stock": Number(p.current_stock || 0), // 9
                    "sell qty amount": sellQtyAmount, // 10
                    "purchase qty amount": purchaseQtyAmount, // 11
                };
                // Add per-business columns: Orders and Returns for each business
                perBusiness.forEach(({ business, sellQtyByName, returnQtyByName }) => {
                   const bizName = business.business_name || ("Business " + business.id);
                    base["orders (" + bizName + ")"] = Number(sellQtyByName[p.product_name] || 0);
                    base["returns (" + bizName + ")"] = Number(returnQtyByName[p.product_name] || 0);  });
                return base;
            });

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(rows);

            // Append TOTAL row for sum columns (including dynamic per-business columns)
            if (ws && ws["!ref"]) {
                const range = XLSX.utils.decode_range(ws["!ref"]);
                const headerRow = range.s.r; // 0-based
                const dataStart = headerRow + 1;
                const dataEnd = range.e.r;
                const totalRow = dataEnd + 1;
                range.e.r = totalRow;
                ws["!ref"] = XLSX.utils.encode_range(range);

                const headersRow = XLSX.utils.sheet_to_json(ws, { header: 1 })[0] || [];
                const colIndex = (name) => headersRow.findIndex((h) => String(h).toLowerCase() === name);
                const sumCols = headersRow
                    .map((h) => String(h))
                    .filter((h) => {
                        const lower = h.toLowerCase();
                        return (
                            lower === "selling qty" ||
                            lower === "return qty" ||
                            lower === "final selling qty" ||
                            lower === "sell qty amount" ||
                            lower === "purchase qty amount" ||
                            lower.startsWith("orders (") ||
                            lower.startsWith("returns (")
                        );
                    });

                const labelAddr = XLSX.utils.encode_cell({ r: totalRow, c: 1 });
                ws[labelAddr] = { t: "s", v: "TOTAL" };
                ws[labelAddr].s = { alignment: { horizontal: "center", vertical: "center" }, font: { bold: true } };

                for (const headerName of sumCols) {
                    const idx = colIndex(headerName.toLowerCase());
                    if (idx >= 0) {
                        const sumCell = XLSX.utils.encode_cell({ r: totalRow, c: idx });
                        const colLetter = XLSX.utils.encode_col(idx);
                        ws[sumCell] = { t: "n", f: "SUM(" + colLetter + (dataStart + 1) + ":" + colLetter + (dataEnd + 1) + ")" };                        ws[sumCell].s = { alignment: { horizontal: "center", vertical: "center" }, font: { bold: true } };
                    }
                }
            }

            const applySheetStyles = (sheet) => {
                if (!sheet || !sheet["!ref"]) return;
                const r = XLSX.utils.decode_range(sheet["!ref"]);
                for (let R = r.s.r; R <= r.e.r; ++R) {
                    for (let C = r.s.c; C <= r.e.c; ++C) {
                        const addr = XLSX.utils.encode_cell({ r: R, c: C });
                        const cell = sheet[addr];
                        if (!cell) continue;
                        cell.s = {
                            ...(cell.s || {}),
                            alignment: { horizontal: "center", vertical: "center", wrapText: true },
                        };
                        if (R === 0) {
                            cell.s = {
                                ...cell.s,
                                font: { bold: true, color: { rgb: "FFFFFFFF" } },
                                fill: { patternType: "solid", fgColor: { rgb: "2563EB" } },
                            };
                        }
                    }
                }
                const numCols = XLSX.utils.decode_range(sheet["!ref"]).e.c - XLSX.utils.decode_range(sheet["!ref"]).s.c + 1;
                sheet["!cols"] = Array(numCols).fill({ wch: 18 });
                sheet["!rows"] = sheet["!rows"] || [];
                sheet["!rows"][0] = { hpt: 24 };
            };

            XLSX.utils.book_append_sheet(wb, ws, "Dashboard Report");
            applySheetStyles(ws);
            XLSX.writeFile(wb, `dashboard_report_${Date.now()}.xlsx`);
        } catch (e) {
            console.error(e);
            alert("Failed to export dashboard report");
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                    <p>Loading dashboard...</p>
                </div>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center h-screen bg-gray-900 text-red-400">
                    <p>Error: {error}</p>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <section className="header">
                <Navbar />
            </section>

            <section className="body">
                <div className="main w-full pt-5 px-12">
                    <div className="heading mt-12 flex justify-between items-center">
                        <div>
                            <h1 className="font-bold text-4xl">Dashboard</h1>
                            <p className="opacity-40 mt-1">Overview of today s sales, orders, and inventory</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="rounded-xl bg-green-600 text-white px-3 py-2 hover:bg-green-700 active:scale-95 flex items-center gap-2"
                                id="comp"
                                onClick={handleExportDashboardExcel}
                                title="Export to Excel"
                                disabled={isExporting}
                            >
                                <FaFileExcel /> {isExporting ? "Exporting..." : "Export Excel"}
                            </button>
                            <span className="text-sm opacity-60">
                                {`Last updated: ${lastUpdated.toLocaleString()}`}
                            </span>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 mt-5">
                        <div className="light-comp card rounded-xl m-5 p-5" id="comp">
                            <Sales data={dashboardData.total_sales} id="comp"/>
                        </div>
                        <div className="light-comp card rounded-xl m-5 p-5" id="comp">
                            <TotalOrders data={dashboardData.total_orders} id="comp"/>
                        </div>
                        <div className="light-comp card rounded-xl m-5 p-5" id="comp">
                            <NetProfit data={dashboardData.net_profit} id="comp"/>
                        </div>
                        <div className="light-comp card rounded-xl m-5 p-5" id="comp">
                            <Return data={dashboardData.total_returns} id="comp"/>
                        </div>
                    </div>

                    {/* Lists */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        <div className="light-comp card rounded-xl m-5 p-5" id="comp">
                            <TopSales data={dashboardData.top_sales} id="comp"/>
                        </div>
                        <div className="light-comp card rounded-xl m-5 p-5 overflow-auto" id="comp">
                            <LowStock data={dashboardData.low_stock_products} id="comp"/>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 gap-1">
                        <div className="light-comp card rounded-xl m-5 p-5 h-80" id="comp">
                            <SalesChart data={dashboardData.sales_chart_data} id="comp"/>
                        </div>
                        {/* <div className="light-comp card rounded-xl m-5 p-5 h-80" id="comp">
                            <CategoryChart data={dashboardData.category_chart_data} id="comp"/>
                        </div> */}
                    </div>
                </div>
            </section>

            <section className="Footer"></section>
        </ProtectedRoute>
    );
}