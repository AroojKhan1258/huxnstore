import { Link, useParams } from "react-router-dom";
import { useGetProductsQuery } from "../redux/api/productApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import ProductCard from "./Products/ProductCard";
import ProductCarousel from "./Products/ProductCarousel";

const Home = () => {
  const { keyword } = useParams();
  const { data, isLoading, isError } = useGetProductsQuery({ keyword });

  return (
    <div className="min-h-screen">
      {!keyword && (
        <>
          {/* ── Hero Section ── */}
          <section className="relative min-h-[85vh] flex items-center overflow-hidden">
            {/* Layered background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f0515] via-[#07040a] to-[#0a0208]" />
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-900/10 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-800/8 rounded-full blur-[100px]" />
            </div>
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '80px 80px'
            }} />

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 w-full py-20">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Left content */}
                <div className="space-y-8 fade-up">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-500/20 bg-rose-900/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[10px] tracking-[0.3em] uppercase text-rose-400/80">New Collection 2026</span>
                  </div>

                  <h1 className="text-6xl lg:text-7xl font-display font-light leading-[1.05] text-white">
                    Curated for<br />
                    <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">
                      the refined
                    </em><br />
                    taste.
                  </h1>

                  <p className="text-gray-500 text-base leading-relaxed max-w-md font-light">
                    Discover exceptional products — where quality meets aesthetic. 
                    Every piece in our collection is thoughtfully selected.
                  </p>

                  <div className="flex items-center gap-4 pt-2">
                    <Link
                      to="/shop"
                      className="group inline-flex items-center gap-3 px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white text-[11px] tracking-[0.25em] uppercase font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-rose-900/40 hover:shadow-rose-800/60 hover:-translate-y-0.5"
                    >
                      Shop Collection
                      <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 5h12m0 0L9 1m4 4L9 9" />
                      </svg>
                    </Link>
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 px-6 py-3.5 text-gray-400 hover:text-white text-[11px] tracking-[0.25em] uppercase font-semibold border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300"
                    >
                      View All
                    </Link>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-8 pt-4 border-t border-white/[0.06]">
                    {[
                      { number: "2K+", label: "Products" },
                      { number: "98%", label: "Satisfaction" },
                      { number: "50+", label: "Brands" },
                    ].map(({ number, label }) => (
                      <div key={label}>
                        <p className="text-xl font-bold text-white font-display">{number}</p>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-gray-600 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right — Carousel */}
                <div className="relative hidden lg:block">
                  <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/60">
                    <ProductCarousel />
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -bottom-4 -left-4 bg-[#0e0812] border border-white/[0.08] rounded-2xl px-4 py-3 shadow-xl">
                    <p className="text-[9px] tracking-[0.2em] uppercase text-gray-600">Trending Now</p>
                    <p className="text-sm text-white font-semibold mt-0.5">Top Picks ✦</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Category Strip ── */}
          <section className="border-y border-white/[0.05] bg-[#09060d]">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Electronics", icon: "⚡", desc: "Latest tech" },
                  { label: "Fashion", icon: "✦", desc: "Style icons" },
                  { label: "Accessories", icon: "◈", desc: "Fine details" },
                  { label: "Lifestyle", icon: "◎", desc: "Live well" },
                ].map(({ label, icon, desc }) => (
                  <Link
                    key={label}
                    to="/shop"
                    className="group flex items-center gap-4 p-4 rounded-xl border border-white/[0.05] hover:border-rose-500/20 bg-white/[0.02] hover:bg-rose-900/5 transition-all duration-300"
                  >
                    <span className="text-2xl w-10 h-10 rounded-lg bg-rose-900/10 flex items-center justify-center flex-shrink-0 group-hover:bg-rose-900/20 transition-colors">
                      {icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">{label}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── Products Grid ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        {isLoading ? (
          <Loader />
        ) : isError ? (
          <Message variant="danger">
            {isError?.data?.message || isError.error}
          </Message>
        ) : (
          <>
            <div className="flex justify-between items-end mb-10">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-rose-500/70 mb-2">
                  {keyword ? `Search: "${keyword}"` : "Handpicked for you"}
                </p>
                <h2 className="text-3xl font-display font-light text-white">
                  {keyword ? "Results" : "Featured Products"}
                </h2>
              </div>
              {!keyword && (
                <Link
                  to="/shop"
                  className="group inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-gray-500 hover:text-rose-400 transition-colors font-medium"
                >
                  View all
                  <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 5h12m0 0L9 1m4 4L9 9" />
                  </svg>
                </Link>
              )}
            </div>

            {data?.products?.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">✦</p>
                <p className="text-gray-500">No products found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {data.products.map((product) => (
                  <ProductCard key={product._id} p={product} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Bottom CTA ── */}
      {!keyword && (
        <section className="relative mx-6 lg:mx-10 mb-16 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-950 via-[#1a0812] to-rose-950" />
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
          <div className="relative px-10 py-16 text-center">
            <p className="text-[10px] tracking-[0.4em] uppercase text-rose-400/60 mb-4">Limited Time</p>
            <h2 className="text-4xl lg:text-5xl font-display font-light text-white mb-4">
              Exclusive Members Get<br />
              <span className="text-rose-400">20% Off</span> Everything
            </h2>
            <p className="text-gray-500 mb-8 text-sm font-light max-w-md mx-auto">
              Create a free account today and unlock member-only pricing on every order.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-3 px-10 py-3.5 bg-white text-[#07040a] text-[11px] tracking-[0.3em] uppercase font-bold rounded-xl hover:bg-rose-50 transition-colors shadow-xl"
            >
              Join Free Today
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
