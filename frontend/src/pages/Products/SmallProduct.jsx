import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";

const SmallProduct = ({ product }) => {
  return (
    <div className="w-full max-w-[200px] p-2 group">
      <div className="relative overflow-hidden rounded-lg aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <HeartIcon product={product} />
      </div>

      <div className="pt-2 px-1">
        <Link to={`/product/${product.slug || product._id}`}>
          <h2 className="flex justify-between items-center gap-1">
            <div className="text-xs text-gray-300 truncate">{product.name}</div>
            <span className="bg-pink-500/20 text-pink-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-pink-500/30 whitespace-nowrap">
              ${product.price}
            </span>
          </h2>
        </Link>
      </div>
    </div>
  );
};

export default SmallProduct;
