import { useState } from "react";
import Chart from "react-apexcharts";
import AdminMenu from "./AdminMenu";
import Loader from "../../components/Loader";
import {
  useGetInventoryAnalyticsQuery,
  useGetCategoryPredictionsQuery,
} from "../../redux/api/analyticsApiSlice";

const InventoryAnalytics = () => {
  const { data: inventoryData, isLoading: loadingInventory } = useGetInventoryAnalyticsQuery();
  const { data: categoryPredictions, isLoading: loadingPredictions } = useGetCategoryPredictionsQuery();
  const [filter, setFilter] = useState("all");

  if (loadingInventory || loadingPredictions) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  const analytics = inventoryData?.analytics || [];
  const summary = inventoryData?.summary || {};

  const filteredAnalytics =
    filter === "all" ? analytics : analytics.filter((a) => a.stockStatus === filter);

  const statusColors = {
    out_of_stock: "bg-red-600",
    critical: "bg-red-500",
    warning: "bg-yellow-500",
    low: "bg-orange-500",
    healthy: "bg-green-500",
  };

  const statusLabels = {
    out_of_stock: "Out of Stock",
    critical: "Critical (<7 days)",
    warning: "Warning (<14 days)",
    low: "Low (<30 days)",
    healthy: "Healthy",
  };

  // Category prediction chart
  const catPredChart = {
    options: {
      chart: { type: "bar", background: "transparent", toolbar: { show: false } },
      tooltip: { theme: "dark" },
      colors: ["#00E396", "#FF4560", "#775DD0"],
      title: { text: "AI Category Sales Predictions (Next 30 Days)", align: "left", style: { color: "#fff" } },
      xaxis: {
        categories: (categoryPredictions || []).map((c) => c.name),
        labels: { style: { colors: "#999" } },
      },
      yaxis: { labels: { style: { colors: "#999" } } },
      plotOptions: { bar: { horizontal: false, columnWidth: "60%" } },
      legend: { labels: { colors: "#999" } },
    },
    series: [
      {
        name: "Past 30 Days Sales",
        data: (categoryPredictions || []).map((c) => c.totalSold),
      },
      {
        name: "Predicted Next 30 Days",
        data: (categoryPredictions || []).map((c) => c.predictedNext30Days),
      },
    ],
  };

  // Stock status donut
  const stockDonut = {
    options: {
      chart: { type: "donut", background: "transparent" },
      labels: ["Out of Stock", "Critical", "Warning", "Low", "Healthy"],
      colors: ["#FF4560", "#FF6178", "#FEB019", "#FF9800", "#00E396"],
      title: { text: "Inventory Health", align: "left", style: { color: "#fff" } },
      legend: { labels: { colors: "#999" }, position: "bottom" },
      plotOptions: {
        pie: { donut: { labels: { show: true, total: { show: true, label: "Total", color: "#fff" } } } },
      },
    },
    series: [
      summary.outOfStock || 0,
      summary.critical || 0,
      summary.warning || 0,
      summary.low || 0,
      summary.healthy || 0,
    ],
  };

  return (
    <>
      <AdminMenu />
      <section className="px-6 py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">
          AI Inventory Control System
        </h1>

        {/* Summary Cards */}
        <div className="flex flex-wrap gap-4 mb-6">
          {Object.entries(statusLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? "all" : key)}
              className={`rounded-lg p-4 w-[12rem] border transition-all ${
                filter === key ? "border-pink-500 scale-105" : "border-gray-700"
              } bg-[#1a1a2e]`}
            >
              <div className={`w-3 h-3 rounded-full ${statusColors[key]} mb-2`} />
              <p className="text-gray-400 text-sm">{label}</p>
              <h2 className="text-2xl font-bold text-white">{summary[key === "out_of_stock" ? "outOfStock" : key] || 0}</h2>
            </button>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#1a1a2e] rounded-lg p-4">
            <Chart options={stockDonut.options} series={stockDonut.series} type="donut" height={350} />
          </div>
          <div className="bg-[#1a1a2e] rounded-lg p-4">
            <Chart options={catPredChart.options} series={catPredChart.series} type="bar" height={350} />
          </div>
        </div>

        {/* Category Predictions Table */}
        {categoryPredictions && categoryPredictions.length > 0 && (
          <div className="bg-[#1a1a2e] rounded-lg p-4 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              AI Category Demand Forecast
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-300">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3">Category</th>
                    <th className="text-right p-3">Sold (30d)</th>
                    <th className="text-right p-3">Revenue (30d)</th>
                    <th className="text-right p-3">Daily Rate</th>
                    <th className="text-right p-3">Predicted (Next 30d)</th>
                    <th className="text-center p-3">Demand Level</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryPredictions.map((cat) => (
                    <tr key={cat.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-3 font-medium">{cat.name}</td>
                      <td className="p-3 text-right">{cat.totalSold}</td>
                      <td className="p-3 text-right">${cat.totalRevenue.toFixed(2)}</td>
                      <td className="p-3 text-right">{cat.dailyRate}/day</td>
                      <td className="p-3 text-right font-bold">{cat.predictedNext30Days}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            cat.demandLevel === "high"
                              ? "bg-green-500/20 text-green-400"
                              : cat.demandLevel === "medium"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {cat.demandLevel.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Inventory Table */}
        <div className="bg-[#1a1a2e] rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">
              Product Stock Alerts
              {filter !== "all" && (
                <span className="text-sm text-gray-400 ml-2">
                  (Filtered: {statusLabels[filter]})
                </span>
              )}
            </h2>
            {filter !== "all" && (
              <button
                onClick={() => setFilter("all")}
                className="text-pink-400 text-sm hover:underline"
              >
                Show All
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-3">Product</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-right p-3">Price</th>
                  <th className="text-right p-3">Stock</th>
                  <th className="text-right p-3">Sales/Day</th>
                  <th className="text-right p-3">Days Until Out</th>
                  <th className="text-center p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnalytics.map((item) => (
                  <tr key={item._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3 text-gray-400">{item.category}</td>
                    <td className="p-3 text-right">${item.price}</td>
                    <td className="p-3 text-right">{item.countInStock}</td>
                    <td className="p-3 text-right">{item.salesVelocity}</td>
                    <td className="p-3 text-right">
                      {item.daysUntilOutOfStock !== null ? `${item.daysUntilOutOfStock} days` : "N/A"}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          item.stockStatus === "out_of_stock"
                            ? "bg-red-600/20 text-red-400"
                            : item.stockStatus === "critical"
                            ? "bg-red-500/20 text-red-400"
                            : item.stockStatus === "warning"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : item.stockStatus === "low"
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {statusLabels[item.stockStatus]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
};

export default InventoryAnalytics;
