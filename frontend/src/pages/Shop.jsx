import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetFilteredProductsQuery } from "../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";
import { setCategories, setProducts, setChecked } from "../redux/features/shop/shopSlice";
import Loader from "../components/Loader";
import ProductCard from "./Products/ProductCard";

const Shop = () => {
  const dispatch = useDispatch();
  const { categories, products, checked, radio } = useSelector((state) => state.shop);
  const categoriesQuery = useFetchCategoriesQuery();
  const [priceFilter, setPriceFilter] = useState("");
  const filteredProductsQuery = useGetFilteredProductsQuery({ checked, radio });

  useEffect(() => {
    if (!categoriesQuery.isLoading) {
      dispatch(setCategories(categoriesQuery.data));
    }
  }, [categoriesQuery.data, dispatch]);

  useEffect(() => {
    if (!checked.length || !radio.length) {
      if (!filteredProductsQuery.isLoading) {
        const filteredProducts = filteredProductsQuery.data.filter((product) => {
          return (
            product.price.toString().includes(priceFilter) ||
            product.price === parseInt(priceFilter, 10)
          );
        });
        dispatch(setProducts(filteredProducts));
      }
    }
  }, [checked, radio, filteredProductsQuery.data, dispatch, priceFilter]);

  const handleBrandClick = (brand) => {
    const productsByBrand = filteredProductsQuery.data?.filter((product) => product.brand === brand);
    dispatch(setProducts(productsByBrand));
  };

  const handleCheck = (value, id) => {
    const updatedChecked = value ? [...checked, id] : checked.filter((c) => c !== id);
    dispatch(setChecked(updatedChecked));
  };

  const uniqueBrands = [
    ...Array.from(
      new Set(
        filteredProductsQuery.data?.map((product) => product.brand).filter((brand) => brand !== undefined)
      )
    ),
  ];

  const handlePriceChange = (e) => {
    setPriceFilter(e.target.value);
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden sticky top-6">
            {/* Categories */}
            <div className="p-5 border-b border-white/5">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">
                Categories
              </h2>
              <div className="space-y-2.5">
                {categories?.map((c) => (
                  <div key={c._id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`cat-${c._id}`}
                      onChange={(e) => handleCheck(e.target.checked, c._id)}
                      className="w-3.5 h-3.5 accent-pink-500 rounded"
                    />
                    <label htmlFor={`cat-${c._id}`} className="text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
                      {c.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="p-5 border-b border-white/5">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">
                Brands
              </h2>
              <div className="space-y-2.5">
                {uniqueBrands?.map((brand) => (
                  <div key={brand} className="flex items-center gap-3">
                    <input
                      type="radio"
                      id={`brand-${brand}`}
                      name="brand"
                      onChange={() => handleBrandClick(brand)}
                      className="w-3.5 h-3.5 accent-pink-500"
                    />
                    <label htmlFor={`brand-${brand}`} className="text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="p-5 border-b border-white/5">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">
                Price
              </h2>
              <input
                type="text"
                placeholder="Filter by price..."
                value={priceFilter}
                onChange={handlePriceChange}
                className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors"
                style={{ color: "#fff" }}
              />
            </div>

            {/* Reset */}
            <div className="p-5">
              <button
                className="w-full py-2 px-4 text-sm font-semibold tracking-wide uppercase border border-white/20 rounded-lg text-gray-300 hover:bg-white hover:text-black transition-all duration-200"
                onClick={() => window.location.reload()}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-medium text-gray-400 tracking-wide">
              <span className="text-white font-semibold">{products?.length}</span> Products
            </h2>
          </div>

          {products.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {products?.map((p) => (
                <ProductCard key={p._id} p={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
