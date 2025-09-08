import Navbar from "../components/Navbar";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx-js-style";
import { useBusiness } from "../contexts/BusinessContext";

const CATEGORY_CHOICES = [
    { key: "electronics", label: "Electronics" },
    { key: "furniture", label: "Furniture" },
    { key: "apparel", label: "Apparel" },
    { key: "books", label: "Books" },
    { key: "kitchen", label: "Kitchen" },
    { key: "gaming", label: "Gaming" },
    { key: "beauty", label: "Beauty" },
    { key: "office", label: "Office" },
    { key: "sports", label: "Sports" },
    { key: "toys", label: "Toys" },
    { key: "groceries", label: "Groceries / Food & Beverages" },
    { key: "automotive", label: "Automotive / Vehicle Accessories" },
    { key: "health", label: "Health / Personal Care" },
    { key: "stationery", label: "Stationery / School Supplies" },
    { key: "home_decor", label: "Home Decor / Garden" },
];

export default function Products() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [editProduct, setEditProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { selected } = useBusiness();
    const API_URL = process.env.REACT_APP_API_URL;
    
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) return;

        try {
            const url = new URL(`${API_URL}/products/`);
            if (selected) url.searchParams.set("business", selected);
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const filterProducts = products.filter((item) => {
        const matchSearch =
            item.sku.toLowerCase().includes(search.toLowerCase()) ||
            item.product_name.toLowerCase().includes(search.toLowerCase());
        const matchCategory =
            categoryFilter === "All" || item.category === categoryFilter;
        return matchSearch && matchCategory;
    });

    const handleExportExcel = () => {
        if (!products || products.length === 0) return;

        const mainRows = products.map((p) => ({
            id: p.id,
            "Product name": p.product_name,
            sku: p.sku,
            "max stock": p.max_stock,
            "current stock": p.current_stock,
            "unit price": Number(p.price || 0),
            "Selling price": Number(p.selling_price || 0),
            "total price": Number(p.price || 0) * Number(p.max_stock || 0),
        }));

        const totalStock = products.reduce((acc, p) => acc + Number(p.max_stock || 0), 0);
        const totalInventoryValue = products.reduce(
            (acc, p) => acc + Number(p.price || 0) * Number(p.max_stock || 0),
            0
        );

        const wb = XLSX.utils.book_new();
        const wsData = XLSX.utils.json_to_sheet(mainRows);
        // Append a TOTAL row for the "total price" column (column H)
        if (wsData && wsData["!ref"]) {
            const range = XLSX.utils.decode_range(wsData["!ref"]);
            const headerRow = range.s.r + 0; // 0-based, header at row 0
            const dataStartRow = headerRow + 1; // 1
            const dataEndRow = range.e.r; // last data row (0-based)
            const totalRowIndex = dataEndRow + 1; // next row (0-based)

            // Extend the sheet range to include the new total row
            range.e.r = totalRowIndex;
            wsData["!ref"] = XLSX.utils.encode_range(range);

            // Put label in column G (index 6 -> 'G') and formula sum in column H (index 7 -> 'H')
            const labelAddr = XLSX.utils.encode_cell({ r: totalRowIndex, c: 6 });
            const sumAddr = XLSX.utils.encode_cell({ r: totalRowIndex, c: 7 });
            const sumFormula = `SUM(H${dataStartRow + 1}:H${dataEndRow + 1})`;

            wsData[labelAddr] = { t: "s", v: "TOTAL" };
            wsData[sumAddr] = { t: "n", f: sumFormula };

            // Bold styling for total row cells we just added
            wsData[labelAddr].s = {
                alignment: { horizontal: "center", vertical: "center" },
                font: { bold: true },
            };
            wsData[sumAddr].s = {
                alignment: { horizontal: "center", vertical: "center" },
                font: { bold: true },
            };
        }
        const applySheetStyles = (ws, headerRowIndex = 1) => {
            if (!ws || !ws["!ref"]) return;
            const range = XLSX.utils.decode_range(ws["!ref"]);
            for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const addr = XLSX.utils.encode_cell({ r: R, c: C });
                    const cell = ws[addr];
                    if (!cell) continue;
                    cell.s = {
                        ...(cell.s || {}),
                        alignment: { horizontal: "center", vertical: "center", wrapText: true },
                    };
                    if (R === headerRowIndex - 1) {
                        cell.s = {
                            ...cell.s,
                            font: { bold: true, color: { rgb: "FFFFFFFF" } },
                            fill: { patternType: "solid", fgColor: { rgb: "2563EB" } }, // blue-600
                        };
                    }
                }
            }
            // Reasonable default column widths and header height
            const numCols = XLSX.utils.decode_range(ws["!ref"]).e.c - XLSX.utils.decode_range(ws["!ref"]).s.c + 1;
            ws["!cols"] = Array(numCols).fill({ wch: 18 });
            ws["!rows"] = ws["!rows"] || [];
            ws["!rows"][headerRowIndex - 1] = { hpt: 24 };
        };
        XLSX.utils.book_append_sheet(wb, wsData, "Products");
        applySheetStyles(wsData, 1);

        const summaryRows = [
            { Metric: "Product name", Value: "Max stock", Extra: "Total price" },
            ...products.map((p) => ({
                Metric: p.product_name,
                Value: Number(p.max_stock || 0),
                Extra: Number(p.price || 0) * Number(p.max_stock || 0),
            })),
            {},
            { Metric: "Total stock (sum of max stock)", Value: totalStock },
            { Metric: "Total inventory value", Value: totalInventoryValue },
        ];
        const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
        applySheetStyles(wsSummary, 1);

        XLSX.writeFile(wb, `products_${Date.now()}.xlsx`);
    };

    const handleDelete = async (sku) => {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) return;

        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                const response = await fetch(
                    `${API_URL}/products/delete/${sku}/`,
                    {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );
                if (response.ok)
                    setProducts((prev) => prev.filter((item) => item.sku !== sku));
            } catch (err) {
                console.error("Error deleting product:", err);
            }
        }
    };

    const [formErrors, setFormErrors] = useState({});

    // ✅ Validation before saving
    const handleSave = async () => {
        let errors = {};
        if (!editProduct.product_name) errors.product_name = "Product name is required";
        if (!editProduct.sku) errors.sku = "SKU is required";
        if (!editProduct.category) errors.category = "Category is required";
        if (!editProduct.price) errors.price = "Price is required";
        if (!editProduct.selling_price) errors.selling_price = "Selling price is required";
        if (!editProduct.supplier) errors.supplier = "Supplier is required";

        // ✅ Check for duplicate SKU locally
        const isDuplicateSKU = products.some(
            (p) => p.sku === editProduct.sku && p.id !== editProduct.id
        );
        if (isDuplicateSKU) errors.sku = "SKU already exists!";

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return; // stop if errors exist

        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) return;

        try {
            const isEdit =
                editProduct?.id !== undefined; // Check for a product id to determine if it's an edit
            // 🟢 CORRECTED: Use the new, correct URL for edits
            let url;
            if (isEdit) {
                url = `${API_URL}/products/${editProduct.id}/`;
            } else {
                if (selected === 'all') {
                    alert('Please select a specific business (not All) to add a product.');
                    return;
                }
                const u = new URL(`${API_URL}/products/`);
                if (selected) u.searchParams.set('business', selected);
                url = u.toString();
            }

            const method = isEdit ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(editProduct),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setFormErrors(errorData); // backend errors like duplicate SKU
                return;
            }

            const data = await response.json();
            console.log("✅ Saved:", data);

            fetchProducts();
            setEditProduct(null);
            setShowModal(false);
            setFormErrors({});
        } catch (err) {
            console.error("❌ Failed to save product:", err.message);
        }
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
                            <h1 className="font-bold text-4xl">Products</h1>
                            <p className="opacity-40 mt-1">
                                Manage your inventory items and stock levels
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                className="rounded-xl bg-green-600 text-white px-3 py-2 hover:bg-green-700 active:scale-95 flex items-center gap-2"
                                id="comp"
                                onClick={handleExportExcel}
                                title="Export to Excel"
                            >
                                <FaFileExcel /> Export Excel
                            </button>
                            <button
                                className="rounded-xl bg-gray-200 p-2 hover: active:scale-95"
                                id="comp"
                                onClick={() => {
                                    setEditProduct({
                                        sku: "",
                                        product_name: "",
                                        category: "",
                                        current_stock: 0,
                                        min_stock: 0,
                                        max_stock: 0,
                                        price: "",
                                        selling_price: "",
                                        supplier: "",
                                    });
                                    setShowModal(true);
                                }}
                            >
                                Add Product
                            </button>
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="search mt-5 flex gap-2 items-center">
                        <input
                            type="search"
                            className="flex-1 outline-0 p-2 bg-gray-200 rounded-lg"
                            id="comp"
                            placeholder="Search Products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            value={categoryFilter}
                            id="comp"
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="p-2 rounded-xl h-10 bg-gray-200"
                        >
                            <option value="All">All Categories</option>
                            {CATEGORY_CHOICES.map((cat) => (
                                <option key={cat.key} value={cat.key}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <hr className="mt-5 border-gray-900" />

                    <div className="content grid lg:grid-cols-4 md:grid-cols-2 gap-1 mt-5">
                        {filterProducts.length === 0 ? (
                            <div className="text-center text-gray-500 mt-10">
                                No products yet. <span className="font-bold">Add products</span>{" "}
                                to get started.
                            </div>
                        ) : (
                            filterProducts.map((item) => (
                                <div
                                    className="light-comp card rounded-xl m-5 p-5"
                                    id="comp"
                                    key={item.sku}
                                >
                                    <div className="card-head m-2 flex justify-between">
                                        <div className="items-start">
                                            <h1 className="font-bold text-lg">{item.product_name}</h1>
                                            <h1 className="text-gray-600">SKU: {item.sku}</h1>
                                        </div>
                                        {item.current_stock <= item.min_stock ? (
                                            <div className="bg-red-600 rounded-3xl w-2 h-2"></div>
                                        ) : (
                                            <div className="bg-green-600 rounded-3xl w-2 h-2"></div>
                                        )}
                                    </div>
                                    <div className="card-body p-1 mt-5 text-gray-600">
                                        <div className="flex justify-between">
                                            <h1>Category: </h1>
                                            <h1>
                                                {CATEGORY_CHOICES.find(
                                                    (c) => c.key === item.category
                                                )?.label || item.category}
                                            </h1>
                                        </div>
                                        <div className="flex justify-between">
                                            <h1>Current Stock: </h1>
                                            <h1>{item.current_stock}</h1>
                                        </div>
                                        <div className="flex justify-between">
                                            <h1>Min/Max: </h1>
                                            <h1>
                                                {item.min_stock}/{item.max_stock}
                                            </h1>
                                        </div>
                                        <div className="flex justify-between">
                                            <h1>Price: </h1>
                                            <h1>{item.price}</h1>
                                        </div>
                                        <div className="flex justify-between">
                                            <h1>Supplier: </h1>
                                            <h1>{item.supplier}</h1>
                                        </div>
                                        <div className="flex justify-between">
                                            <h1>Last Update: </h1>
                                            <h1>{new Date(item.updated_at).toLocaleString()}</h1>
                                        </div>
                                    </div>
                                    <div className="card-footr p-1 mt-5">
                                        <div className="flex gap-3">
                                            <button
                                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-xl flex justify-center items-center gap-2"
                                                onClick={() => {
                                                    setEditProduct(item);
                                                    setShowModal(true);
                                                }}
                                            >
                                                <FaEdit /> Edit
                                            </button>
                                            <button
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl flex justify-center items-center gap-2"
                                                onClick={() => handleDelete(item.sku)}
                                            >
                                                <FaTrash /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Modal */}
                    {showModal && editProduct && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-gray-600 p-6 rounded-xl w-[90%] sm:w-[400px] space-y-4 max-h-[90vh] overflow-y-auto">
                                <div className="head">
                                    <h2 className="text-xl font-bold">
                                        {editProduct?.sku &&
                                            products.some((p) => p.sku === editProduct.sku)
                                            ? "Edit Product"
                                            : "Add Product"}
                                    </h2>
                                    <p className="text-gray-500 text-sm">
                                        {editProduct?.sku &&
                                            products.some((p) => p.sku === editProduct.sku)
                                            ? "Update the product information. Changes will be saved immediately."
                                            : "Fill in the product details to add a new product."}
                                    </p>
                                </div>
                                <hr className="border-gray-300" />

                                <div className="flex gap-4">
                                    {/* Product Name */}
                                    <div className="flex-1">
                                        <label className="block font-medium">Product Name</label>
                                        <input
                                            type="text"
                                            value={editProduct.product_name}
                                            onChange={(e) =>
                                                setEditProduct({ ...editProduct, product_name: e.target.value })
                                            }
                                            className="w-full border text-black p-2 rounded"
                                        />
                                        {formErrors.product_name && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.product_name}</p>
                                        )}
                                    </div>

                                    {/* SKU */}
                                    <div className="flex-1">
                                        <label className="block font-medium">SKU</label>
                                        <input
                                            type="text"
                                            value={editProduct.sku}
                                            onChange={(e) =>
                                                setEditProduct({ ...editProduct, sku: e.target.value })
                                            }
                                            disabled={!!editProduct.id}
                                            className="w-full border text-black p-2 rounded"
                                        />
                                        {formErrors.sku && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.sku}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="flex-1">
                                    <label className="block font-medium">Category</label>
                                    <select
                                        value={editProduct.category}
                                        onChange={(e) =>
                                            setEditProduct({ ...editProduct, category: e.target.value })
                                        }
                                        className="w-full border text-black p-2 rounded"
                                    >
                                        <option value="">Select Category</option>
                                        <option value="electronics">Electronics</option>
                                        <option value="furniture">Furniture</option>
                                        <option value="apparel">Apparel</option>
                                        <option value="books">Books</option>
                                        <option value="kitchen">Kitchen</option>
                                        <option value="gaming">Gaming</option>
                                        <option value="beauty">Beauty</option>
                                        <option value="office">Office</option>
                                        <option value="sports">Sports</option>
                                        <option value="toys">Toys</option>
                                        <option value="groceries">Groceries / Food & Beverages</option>
                                        <option value="automotive">Automotive / Vehicle Accessories</option>
                                        <option value="health">Health / Personal Care</option>
                                        <option value="stationery">Stationery / School Supplies</option>
                                        <option value="home_decor">Home Decor / Garden</option>
                                    </select>
                                    {formErrors.category && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
                                    )}
                                </div>


                                {/* Stock Fields */}
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label>Current Stock</label>
                                        <input
                                            type="number"
                                            value={editProduct.current_stock}
                                            onChange={(e) =>
                                                setEditProduct({
                                                    ...editProduct,
                                                    current_stock: parseInt(e.target.value),
                                                })
                                            }
                                            className="w-full border text-black p-2 rounded"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label>Min Stock</label>
                                        <input
                                            type="number"
                                            value={editProduct.min_stock}
                                            onChange={(e) =>
                                                setEditProduct({
                                                    ...editProduct,
                                                    min_stock: parseInt(e.target.value),
                                                })
                                            }
                                            className="w-full border text-black p-2 rounded"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label>Max Stock</label>
                                        <input
                                            type="number"
                                            value={editProduct.max_stock}
                                            onChange={(e) =>
                                                setEditProduct({
                                                    ...editProduct,
                                                    max_stock: parseInt(e.target.value),
                                                })
                                            }
                                            className="w-full border text-black p-2 rounded"
                                        />
                                    </div>
                                </div>

                                {/* Price, Selling Price & Supplier */}
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label>Price</label>
                                        <input
                                            type="number"
                                            value={editProduct.price}
                                            onChange={(e) =>
                                                setEditProduct({
                                                    ...editProduct,
                                                    price: parseFloat(e.target.value),
                                                })
                                            }
                                            min={0.01}
                                            required
                                            className="w-full border text-black p-2 rounded"
                                        />
                                        {formErrors.price && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label>Selling Price</label>
                                        <input
                                            type="number"
                                            value={editProduct.selling_price}
                                            onChange={(e) =>
                                                setEditProduct({
                                                    ...editProduct,
                                                    selling_price: parseFloat(e.target.value),
                                                })
                                            }
                                            min={0.01}
                                            required
                                            className="w-full border text-black p-2 rounded"
                                        />
                                        {formErrors.selling_price && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.selling_price}</p>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label>Supplier</label>
                                        <input
                                            type="text"
                                            value={editProduct.supplier}
                                            onChange={(e) =>
                                                setEditProduct({
                                                    ...editProduct,
                                                    supplier: e.target.value,
                                                })
                                            }
                                            className="w-full border text-black p-2 rounded"
                                        />
                                        {formErrors.supplier && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.supplier}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditProduct(null);
                                        }}
                                        className="px-4 py-2 rounded-xl bg-red-400 hover:bg-red-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            <section className="footer"></section>
        </ProtectedRoute>
    );
}
