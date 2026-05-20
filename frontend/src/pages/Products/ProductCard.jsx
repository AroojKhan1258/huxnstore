import { Link } from "react-router-dom";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import HeartIcon from "./HeartIcon";

const ProductCard = ({ p }) => {
  const dispatch = useDispatch();

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
    toast.success("Added to cart");
  };

  return (
    <div className="group relative bg-[#0e0812] rounded-2xl overflow-hidden border border-white/[0.06] hover:border-rose-500/20 transition-all duration-400 hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-950/40 w-full flex flex-col">
      {/* Image */}
      <section className="relative overflow-hidden flex-shrink-0">
        <Link to={`/product/${p.slug || p._id}`}>
          <div className="relative w-full" style={{ paddingBottom: "72%" }}>
            <img
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              src={p.image}
              alt={p.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0812]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          {/* Brand badge */}
          <span className="absolute top-3 left-3 bg-[#07040a]/80 backdrop-blur-sm text-white text-[9px] font-semibold px-2.5 py-1 rounded-full border border-white/10 tracking-widest uppercase">
            {p?.brand}
          </span>
        </Link>

        {/* Heart */}
        <div className="absolute top-3 right-3">
          <HeartIcon product={p} />
        </div>

        {/* Quick add — shows on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={() => addToCartHandler(p, 1)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-[#07040a] text-[10px] font-bold tracking-[0.2em] uppercase rounded-xl hover:bg-rose-50 transition-colors"
          >
            <AiOutlineShoppingCart size={14} />
            Quick Add
          </button>
        </div>
      </section>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h5 className="text-sm font-semibold text-gray-100 leading-snug flex-1 line-clamp-1">
            {p?.name}
          </h5>
          <p className="text-rose-400 font-bold text-sm whitespace-nowrap flex-shrink-0">
            {p?.price?.toLocaleString("en-US", { style: "currency", currency: "USD" })}
          </p>
        </div>

        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4 flex-1">
          {p?.description?.substring(0, 90)}...
        </p>

        <Link
          to={`/product/${p.slug || p._id}`}
          className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-400 hover:text-white border border-white/[0.07] hover:border-rose-500/30 rounded-xl transition-all duration-200 hover:bg-rose-900/10"
        >
          View Details
          <svg className="w-3 h-3" fill="none" viewBox="0 0 14 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 5h12m0 0L9 1m4 4L9 9" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
