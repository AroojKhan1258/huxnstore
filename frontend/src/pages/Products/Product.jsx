import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";

const Product = ({ product }) => {
  return (
    <div className="relative group bg-[#141414] rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <HeartIcon product={product} />
      </div>

      <div className="p-4">
        <Link to={`/product/${product.slug || product._id}`}>
          <h2 className="flex justify-between items-start gap-2">
            <div className="text-sm font-medium text-white truncate">{product.name}</div>
            <span className="bg-pink-500/20 text-pink-400 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap border border-pink-500/30">
              ${product.price}
            </span>
          </h2>
        </Link>
      </div>
    </div>
  );
};

export default Product;
