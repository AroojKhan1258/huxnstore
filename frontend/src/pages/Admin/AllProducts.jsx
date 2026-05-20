import { Link } from "react-router-dom";
import moment from "moment";
import { useAllProductsQuery } from "../../redux/api/productApiSlice";
import AdminMenu from "./AdminMenu";

const AllProducts = () => {
  const { data: products, isLoading, isError } = useAllProductsQuery();

  if (isLoading) return <div className="px-6 py-8 text-gray-400">Loading...</div>;
  if (isError) return <div className="px-6 py-8 text-red-400">Error loading products</div>;

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <AdminMenu />
      <h1 className="text-2xl font-light tracking-widest uppercase text-white mb-8">
        All Products
        <span className="ml-3 text-sm text-gray-500 font-normal">({products.length})</span>
      </h1>

      <div className="space-y-3">
        {products.map((product) => (
          <Link
            key={product._id}
            to={`/admin/product/update/${product._id}`}
            className="flex items-center gap-4 p-4 bg-[#141414] rounded-xl border border-white/5 hover:border-white/20 transition-all group"
          >
            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-1">
                <h5 className="text-sm font-semibold text-white truncate">{product?.name}</h5>
                <span className="text-xs text-gray-500 flex-shrink-0">{moment(product.createdAt).format("MMM D, YYYY")}</span>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2 mb-2">{product?.description?.substring(0, 160)}...</p>
              <div className="flex items-center gap-4">
                <span className="text-pink-400 font-bold text-sm">${product?.price}</span>
                <span className="inline-flex items-center gap-1 text-xs text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20 group-hover:bg-pink-500/20 transition-colors">
                  Update Product →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AllProducts;
