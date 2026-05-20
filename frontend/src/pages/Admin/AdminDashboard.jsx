import Chart from "react-apexcharts";
import { useGetUsersQuery } from "../../redux/api/usersApiSlice";
import {
  useGetTotalOrdersQuery,
  useGetTotalSalesByDateQuery,
  useGetTotalSalesQuery,
} from "../../redux/api/orderApiSlice";
import {
  useGetDashboardSummaryQuery,
  useGetInventoryAnalyticsQuery,
  useGetCategoryPredictionsQuery,
  useGetPriceTrendsQuery,
} from "../../redux/api/analyticsApiSlice";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminMenu from "./AdminMenu";
import Loader from "../../components/Loader";

const AdminDashboard = () => {
  const { data: sales }     = useGetTotalSalesQuery();
  const { data: customers } = useGetUsersQuery();
  const { data: orders }    = useGetTotalOrdersQuery();
  const { data: salesDetail } = useGetTotalSalesByDateQuery();
  const { data: summary }   = useGetDashboardSummaryQuery();
  const { data: inventoryData } = useGetInventoryAnalyticsQuery();
  const { data: catPredictions } = useGetCategoryPredictionsQuery();
  const { data: priceTrends } = useGetPriceTrendsQuery();

  // ── Critical alerts only (no full chart duplication) ─────────────
  const analytics = inventoryData?.analytics || [];
  const criticalItems = analytics.filter(
    (a) => a.stockStatus === "out_of_stock" || a.stockStatus === "critical"
  ).slice(0, 3);

  const topDemandCat = [...(catPredictions || [])]
    .sort((a, b) => (b.predictedNext30Days || 0) - (a.predictedNext30Days || 0))
    .slice(0, 3);

  const dropAlerts = [...(priceTrends || [])]
    .filter((t) => t.trend === "increasing" || t.trend === "slightly_increasing")
    .slice(0, 3);

  // ── Sales trend chart ─────────────────────────────────────────────
  const [salesChart, setSalesChart] = useState({
    options: {
      chart: { type: "bar", background: "transparent", toolbar: { show: false } },
      tooltip: { theme: "dark" },
      colors: ["#f43f5e"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
      title: { text: "Daily Sales ($)", align: "left", style: { color: "#fff", fontSize: "13px" } },
      grid: { borderColor: "#333" },
      xaxis: { categories: [], labels: { style: { colors: "#666" }, rotate: -45, rotateAlways: false } },
      yaxis: { labels: { style: { colors: "#666" }, formatter: (v) => `$${v}` } },
    },
    series: [{ name: "Sales ($)", data: [] }],
  });

  // ── Revenue area chart ────────────────────────────────────────────
  const [revenueChart, setRevenueChart] = useState({
    options: {
      chart: { type: "area", background: "transparent", toolbar: { show: false } },
      tooltip: { theme: "dark" },
      colors: ["#8b5cf6"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
      title: { text: "Monthly Revenue", align: "left", style: { color: "#fff", fontSize: "13px" } },
      grid: { borderColor: "#333" },
      xaxis: { categories: [], labels: { style: { colors: "#666" } } },
      yaxis: { labels: { style: { colors: "#666" }, formatter: (v) => `$${v}` } },
      fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.05 } },
    },
    series: [{ name: "Revenue ($)", data: [] }],
  });

  // ── Stock donut ───────────────────────────────────────────────────
  const [stockChart, setStockChart] = useState({
    options: {
      chart: { type: "donut", background: "transparent" },
      labels: ["Out of Stock", "Low (1–10)", "Medium (11–50)", "High (50+)"],
      colors: ["#ef4444", "#f59e0b", "#10b981", "#3b82f6"],
      title: { text: "Stock Health", align: "left", style: { color: "#fff", fontSize: "13px" } },
      legend: { labels: { colors: "#999" }, position: "bottom" },
      plotOptions: { pie: { donut: { labels: { show: true, total: { show: true, color: "#fff" } } } } },
    },
    series: [0, 0, 0, 0],
  });

  // ── Category bar ──────────────────────────────────────────────────
  const [catChart, setCatChart] = useState({
    options: {
      chart: { type: "bar", background: "transparent", toolbar: { show: false } },
      tooltip: { theme: "dark" },
      colors: ["#f43f5e", "#10b981"],
      title: { text: "Products by Category", align: "left", style: { color: "#fff", fontSize: "13px" } },
      xaxis: { categories: [], labels: { style: { colors: "#666" } } },
      yaxis: { labels: { style: { colors: "#666" } } },
      plotOptions: { bar: { columnWidth: "50%" } },
      legend: { labels: { colors: "#999" } },
    },
    series: [],
  });

  useEffect(() => {
    if (salesDetail?.length) {
      const sorted = [...salesDetail].sort((a, b) => a._id > b._id ? 1 : -1);
      setSalesChart((p) => ({
        ...p,
        options: { ...p.options, xaxis: { ...p.options.xaxis, categories: sorted.map((i) => i._id) } },
        series: [{ name: "Sales ($)", data: sorted.map((i) => +(i.totalSales || 0).toFixed(2)) }],
      }));
    }
  }, [salesDetail]);

  useEffect(() => {
    if (!summary) return;
    setRevenueChart((p) => ({
      ...p,
      options: { ...p.options, xaxis: { ...p.options.xaxis, categories: summary.monthlyRevenue.map((m) => m.month) } },
      series: [{ name: "Revenue ($)", data: summary.monthlyRevenue.map((m) => +(m.revenue || 0).toFixed(2)) }],
    }));
    const sl = summary.stockLevels || {};
    setStockChart((p) => ({ ...p, series: [sl.outOfStock || 0, sl.low || 0, sl.medium || 0, sl.high || 0] }));
    setCatChart((p) => ({
      ...p,
      options: { ...p.options, xaxis: { ...p.options.xaxis, categories: summary.categoryDistribution.map((c) => c.name) } },
      series: [
        { name: "Products", data: summary.categoryDistribution.map((c) => c.productCount) },
        { name: "In Stock", data: summary.categoryDistribution.map((c) => c.totalStock) },
      ],
    }));
  }, [summary]);

  return (
    <>
      <AdminMenu />
      <section className="px-6 py-6 max-w-7xl mx-auto">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Revenue", value: `$${(sales?.totalSales || 0).toFixed(2)}`, color: "bg-pink-500", icon: "$" },
            { label: "Total Orders", value: orders?.totalOrders || 0, color: "bg-green-500", icon: "🛒" },
            { label: "Customers", value: customers?.length || 0, color: "bg-blue-500", icon: "👤" },
            { label: "Products", value: summary?.totalProducts || 0, color: "bg-purple-500", icon: "📦" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-[#0f0f1a] border border-gray-800 p-5">
              <div className={`w-10 h-10 ${s.color} rounded-full flex items-center justify-center text-white font-bold mb-3`}>
                {s.icon}
              </div>
              <p className="text-gray-400 text-xs">{s.label}</p>
              <h2 className="text-white text-xl font-bold mt-1">{s.value}</h2>
            </div>
          ))}
        </div>

        {/* ── Quick AI Alerts (compact — no duplication of sub-pages) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Critical stock only */}
          <div className="bg-[#0f0f1a] border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span>📦</span>
                <span className="text-white font-semibold text-sm">Critical Stock Alerts</span>
              </div>
              <Link to="/admin/inventory-analytics" className="text-xs text-violet-400 hover:text-violet-300">
                Full Analysis →
              </Link>
            </div>
            {criticalItems.length === 0 ? (
              <p className="text-green-400 text-xs">✅ All stock levels healthy</p>
            ) : (
              criticalItems.map((item) => (
                <div key={item.productId} className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
                  <span className="text-gray-300 text-xs truncate max-w-[60%]">{item.name}</span>
                  <span className={`text-xs font-semibold ${item.stockStatus === "out_of_stock" ? "text-red-400" : "text-yellow-400"}`}>
                    {item.stockStatus === "out_of_stock" ? "Out of stock" : `${item.currentStock} left`}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Top demand categories */}
          <div className="bg-[#0f0f1a] border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span>📈</span>
                <span className="text-white font-semibold text-sm">Top Demand (Next 30d)</span>
              </div>
              <Link to="/admin/inventory-analytics" className="text-xs text-violet-400 hover:text-violet-300">
                Full Forecast →
              </Link>
            </div>
            {topDemandCat.length === 0 ? (
              <p className="text-gray-400 text-xs">Place some orders to see predictions</p>
            ) : (
              topDemandCat.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
                  <span className="text-gray-300 text-xs truncate max-w-[60%]">{cat.name}</span>
                  <span className="text-green-400 text-xs font-semibold">{cat.predictedNext30Days} units</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── AI Price Drop Recommendations ── */}
        {dropAlerts.length > 0 && (
          <div className="mb-6 bg-red-900/10 border border-red-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 flex items-center justify-center text-lg">🤖</div>
                <div>
                  <h2 className="text-white font-bold">AI Price Drop Recommendations</h2>
                  <p className="text-red-400 text-xs">{dropAlerts.length} product{dropAlerts.length > 1 ? "s" : ""} with significant price increase — action needed</p>
                </div>
              </div>
              <Link to="/admin/price-trends" className="text-xs text-pink-400 hover:text-pink-300 border border-pink-500/30 px-3 py-1.5 rounded-lg">
                Full Analysis →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {dropAlerts.map((item) => (
                <div key={item._id} className="bg-[#1a1a2e] rounded-xl p-4 border border-red-500/20">
                  <p className="text-white font-semibold text-sm truncate mb-1">{item.name}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-400 text-xs line-through">${item.oldestPrice}</span>
                    <span className="text-red-400 text-sm font-bold">${item.currentPrice}</span>
                    <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      +{item.changePercent}%
                    </span>
                  </div>
                  <p className="text-yellow-300 text-[11px] leading-relaxed bg-yellow-900/20 rounded p-2">
                    💡 {item.suggestion}
                  </p>
                  <p className="text-green-400 text-xs mt-2 font-semibold">
                    Suggested: ${(item.currentPrice * 0.85).toFixed(2)} (−15%)
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1a1a2e] rounded-xl p-4">
            <Chart options={salesChart.options} series={salesChart.series} type="bar" height={280} />
          </div>
          <div className="bg-[#1a1a2e] rounded-xl p-4">
            <Chart options={revenueChart.options} series={revenueChart.series} type="area" height={280} />
          </div>
          <div className="bg-[#1a1a2e] rounded-xl p-4">
            <Chart options={stockChart.options} series={stockChart.series} type="donut" height={280} />
          </div>
          <div className="bg-[#1a1a2e] rounded-xl p-4">
            <Chart options={catChart.options} series={catChart.series} type="bar" height={280} />
          </div>
        </div>

        {/* ── Top products table ── */}
        {summary?.topProducts?.length > 0 && (
          <div className="mt-8 bg-[#1a1a2e] rounded-xl p-5">
            <h2 className="text-white font-bold mb-4">🏆 Top Selling Products</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-300">
                <thead>
                  <tr className="border-b border-gray-700 text-xs text-gray-500 uppercase">
                    <th className="text-left p-2">#</th>
                    <th className="text-left p-2">Product</th>
                    <th className="text-right p-2">Qty Sold</th>
                    <th className="text-right p-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.topProducts.map((p, i) => (
                    <tr key={p.id} className="border-b border-gray-800 hover:bg-white/[0.02]">
                      <td className="p-2 text-gray-500">{i + 1}</td>
                      <td className="p-2">{p.name}</td>
                      <td className="p-2 text-right text-green-400">{p.qty}</td>
                      <td className="p-2 text-right text-pink-400">${(p.revenue || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Recent Orders ── */}
        <div className="mt-8 bg-[#1a1a2e] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">Recent Orders</h2>
            <Link to="/admin/orderlist" className="text-xs text-violet-400 hover:text-violet-300">View All →</Link>
          </div>
          {summary?.recentOrders?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-300">
                <thead>
                  <tr className="border-b border-gray-700 text-xs text-gray-500 uppercase">
                    <th className="text-left p-2">Order ID</th>
                    <th className="text-left p-2">User</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-right p-2">Total</th>
                    <th className="text-center p-2">Paid</th>
                    <th className="text-center p-2">Delivered</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentOrders.map((o) => (
                    <tr key={o._id} className="border-b border-gray-800 hover:bg-white/[0.02]">
                      <td className="p-2 font-mono text-xs text-gray-500">#{String(o._id).slice(-8).toUpperCase()}</td>
                      <td className="p-2">{o.user?.username || "Guest"}</td>
                      <td className="p-2 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="p-2 text-right text-pink-400">${(o.totalPrice || 0).toFixed(2)}</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${o.isPaid ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {o.isPaid ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${o.isDelivered ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}`}>
                          {o.isDelivered ? "Done" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No orders yet</p>
          )}
        </div>

      </section>
    </>
  );
};

export default AdminDashboard;
