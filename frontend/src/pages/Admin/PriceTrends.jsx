import { useState } from "react";
import Chart from "react-apexcharts";
import AdminMenu from "./AdminMenu";
import Loader from "../../components/Loader";
import { useGetPriceTrendsQuery } from "../../redux/api/analyticsApiSlice";

const PriceTrends = () => {
  const { data: trends, isLoading } = useGetPriceTrendsQuery();
  const [selectedProduct, setSelectedProduct] = useState(null);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader /></div>;
  }

  const allTrends = trends || [];

  // ── Products that need price DROP (AI recommendation) ────────────
  const dropRecommended = allTrends.filter(
    (t) => t.trend === "increasing" || t.trend === "slightly_increasing"
  );

  const trendColors = {
    increasing:          { bg: "bg-red-500/20",    text: "text-red-400",    label: "↑ Increasing"    },
    slightly_increasing: { bg: "bg-orange-500/20", text: "text-orange-400", label: "↑ Slightly Up"   },
    stable:              { bg: "bg-green-500/20",  text: "text-green-400",  label: "= Stable"        },
    slightly_decreasing: { bg: "bg-blue-500/20",   text: "text-blue-400",   label: "↓ Slightly Down" },
    decreasing:          { bg: "bg-purple-500/20", text: "text-purple-400", label: "↓ Decreasing"    },
  };

  // ── Charts ────────────────────────────────────────────────────────
  const priceDistChart = {
    options: {
      chart: { type: "bar", background: "transparent", toolbar: { show: false } },
      tooltip: { theme: "dark" },
      colors: allTrends.map((t) =>
        t.trend === "increasing" ? "#FF4560" :
        t.trend === "slightly_increasing" ? "#FF9800" :
        t.trend === "decreasing" ? "#775DD0" : "#00E396"
      ),
      title: { text: "Current Price Distribution", align: "left", style: { color: "#fff" } },
      xaxis: { categories: allTrends.map((t) => t.name.substring(0, 14)), labels: { style: { colors: "#999" }, rotate: -45 } },
      yaxis: { labels: { style: { colors: "#999" }, formatter: (v) => `$${v}` } },
      plotOptions: { bar: { columnWidth: "55%", borderRadius: 4, distributed: true } },
      legend: { show: false },
    },
    series: [{ name: "Price ($)", data: allTrends.map((t) => t.currentPrice) }],
  };

  const trendCounts = {
    increasing:          allTrends.filter((t) => t.trend === "increasing").length,
    slightly_increasing: allTrends.filter((t) => t.trend === "slightly_increasing").length,
    stable:              allTrends.filter((t) => t.trend === "stable").length,
    slightly_decreasing: allTrends.filter((t) => t.trend === "slightly_decreasing").length,
    decreasing:          allTrends.filter((t) => t.trend === "decreasing").length,
  };

  const trendDonut = {
    options: {
      chart: { type: "donut", background: "transparent" },
      labels: ["Increasing", "Slightly Up", "Stable", "Slightly Down", "Decreasing"],
      colors: ["#FF4560", "#FF9800", "#00E396", "#008FFB", "#775DD0"],
      title: { text: "Trend Summary", align: "left", style: { color: "#fff" } },
      legend: { labels: { colors: "#999" }, position: "bottom" },
      plotOptions: { pie: { donut: { labels: { show: true, total: { show: true, color: "#fff", label: "Products" } } } } },
    },
    series: Object.values(trendCounts),
  };

  const selectedTrend = selectedProduct ? allTrends.find((t) => t._id === selectedProduct) : null;
  const historyChart = selectedTrend?.history?.length > 0 ? {
    options: {
      chart: { type: "line", background: "transparent", toolbar: { show: false } },
      tooltip: { theme: "dark" },
      colors: [selectedTrend.trend === "increasing" ? "#FF4560" : "#00E396"],
      stroke: { curve: "smooth", width: 3 },
      title: { text: `Price History: ${selectedTrend.name}`, align: "left", style: { color: "#fff" } },
      xaxis: { categories: selectedTrend.history.map((h) => new Date(h.date).toLocaleDateString()), labels: { style: { colors: "#999" } } },
      yaxis: { labels: { style: { colors: "#999" }, formatter: (v) => `$${v}` } },
      markers: { size: 6 },
      annotations: {
        yaxis: [{
          y: selectedTrend.currentPrice,
          borderColor: "#FF4560",
          label: { text: `Current: $${selectedTrend.currentPrice}`, style: { color: "#fff", background: "#FF4560" } },
        }],
      },
    },
    series: [{ name: "Price ($)", data: selectedTrend.history.map((h) => h.price) }],
  } : null;

  return (
    <>
      <AdminMenu />
      <section className="px-6 py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">💹 AI Price Trend Analysis</h1>
        <p className="text-gray-500 text-sm mb-6">AI monitors price changes and recommends when to drop prices</p>

        {/* ── AI DROP RECOMMENDATIONS ─────────────────────────────── */}
        {dropRecommended.length > 0 ? (
          <div className="mb-8 bg-red-900/10 border border-red-500/30 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center text-xl">🤖</div>
              <div>
                <h2 className="text-white font-bold text-lg">AI Price Drop Recommendations</h2>
                <p className="text-red-400 text-xs">{dropRecommended.length} product{dropRecommended.length > 1 ? "s" : ""} with significant price increases — action recommended</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dropRecommended.map((item) => (
                <div key={item._id} className="bg-[#1a1a2e] rounded-xl p-4 border border-red-500/20">
                  {/* Product header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <h3 className="text-white font-semibold text-sm truncate">{item.name}</h3>
                      <span className="text-gray-500 text-xs">{item.category}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${trendColors[item.trend]?.bg} ${trendColors[item.trend]?.text}`}>
                      {trendColors[item.trend]?.label}
                    </span>
                  </div>

                  {/* Price change visualization */}
                  <div className="flex items-center gap-3 mb-3 bg-black/20 rounded-lg px-3 py-2">
                    <div className="text-center">
                      <p className="text-gray-500 text-[10px]">Was</p>
                      <p className="text-gray-400 text-sm font-semibold">${item.oldestPrice}</p>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="h-0.5 bg-gradient-to-r from-gray-600 via-red-500 to-red-600 rounded-full"></div>
                      <p className="text-red-400 text-xs font-bold mt-1">+{item.changePercent}% increase</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-[10px]">Now</p>
                      <p className="text-red-400 text-sm font-bold">${item.currentPrice}</p>
                    </div>
                  </div>

                  {/* AI Suggestion */}
                  <div className="bg-yellow-900/20 border border-yellow-600/20 rounded-lg px-3 py-2 mb-3">
                    <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider mb-1">🤖 AI Suggestion</p>
                    <p className="text-yellow-200 text-xs leading-relaxed">{item.suggestion}</p>
                  </div>

                  {/* Suggested drop price */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-[10px]">Suggested Price</p>
                      <p className="text-green-400 text-sm font-bold">
                        ${(item.currentPrice * 0.85).toFixed(2)}
                        <span className="text-gray-500 text-[10px] ml-1">(−15%)</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedProduct(selectedProduct === item._id ? null : item._id)}
                      className="px-3 py-1.5 bg-pink-600/20 hover:bg-pink-600/40 border border-pink-500/30 text-pink-400 text-xs font-semibold rounded-lg transition-colors"
                    >
                      {selectedProduct === item._id ? "Hide Chart" : "View History"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-green-900/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-green-400 font-semibold">All prices are stable</p>
              <p className="text-gray-500 text-xs">No price drop recommendations at this time. Run seedOrders.js to generate sample data.</p>
            </div>
          </div>
        )}

        {/* ── Price History Chart (when product selected) ────────── */}
        {historyChart && selectedTrend && (
          <div className="bg-[#1a1a2e] rounded-xl p-5 mb-8 border border-pink-500/20">
            <Chart options={historyChart.options} series={historyChart.series} type="line" height={280} />
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <p className="text-gray-500 text-xs">Oldest Price</p>
                <p className="text-white font-bold">${selectedTrend.oldestPrice}</p>
              </div>
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <p className="text-gray-500 text-xs">Change</p>
                <p className={`font-bold ${selectedTrend.changePercent > 0 ? "text-red-400" : "text-green-400"}`}>
                  {selectedTrend.changePercent > 0 ? "+" : ""}{selectedTrend.changePercent}%
                </p>
              </div>
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <p className="text-gray-500 text-xs">Current Price</p>
                <p className="text-pink-400 font-bold">${selectedTrend.currentPrice}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Overview Charts ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#1a1a2e] rounded-xl p-4">
            <Chart options={priceDistChart.options} series={priceDistChart.series} type="bar" height={300} />
          </div>
          <div className="bg-[#1a1a2e] rounded-xl p-4">
            <Chart options={trendDonut.options} series={trendDonut.series} type="donut" height={300} />
          </div>
        </div>

        {/* ── All Products Table ───────────────────────────────────── */}
        <div className="bg-[#1a1a2e] rounded-xl p-5">
          <h2 className="text-white font-bold mb-4">All Products — Price Analysis</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead>
                <tr className="border-b border-gray-700 text-xs text-gray-500 uppercase">
                  <th className="text-left p-3">Product</th>
                  <th className="text-right p-3">Current</th>
                  <th className="text-right p-3">Change</th>
                  <th className="text-center p-3">Trend</th>
                  <th className="text-left p-3">AI Suggestion</th>
                  <th className="text-center p-3">Chart</th>
                </tr>
              </thead>
              <tbody>
                {allTrends.map((item) => {
                  const c = trendColors[item.trend] || trendColors.stable;
                  return (
                    <tr key={item._id} className="border-b border-gray-800 hover:bg-white/[0.02]">
                      <td className="p-3 font-medium max-w-[180px] truncate">{item.name}</td>
                      <td className="p-3 text-right">${item.currentPrice}</td>
                      <td className="p-3 text-right">
                        <span className={item.changePercent > 0 ? "text-red-400" : item.changePercent < 0 ? "text-green-400" : "text-gray-400"}>
                          {item.changePercent > 0 ? "+" : ""}{item.changePercent}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${c.bg} ${c.text}`}>
                          {c.label}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400 text-xs max-w-[220px]">{item.suggestion}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedProduct(selectedProduct === item._id ? null : item._id)}
                          className="text-pink-400 hover:text-pink-300 text-xs underline"
                        >
                          {selectedProduct === item._id ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </section>
    </>
  );
};

export default PriceTrends;
