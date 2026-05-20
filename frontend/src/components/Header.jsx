import { useGetTopProductsQuery } from "../redux/api/productApiSlice";
import Loader from "./Loader";
import SmallProduct from "../pages/Products/SmallProduct";
import ProductCarousel from "../pages/Products/ProductCarousel";

const Header = () => {
  const { data, isLoading, error } = useGetTopProductsQuery();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <h1>ERROR</h1>;
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6 px-8 pt-8 pb-6 max-w-7xl mx-auto">
      {/* Small products grid - only on xl */}
      <div className="hidden xl:grid grid-cols-2 gap-3 content-start flex-shrink-0">
        {data.map((product) => (
          <SmallProduct key={product._id} product={product} />
        ))}
      </div>
      {/* Carousel */}
      <div className="flex-1 min-w-0">
        <ProductCarousel />
      </div>
    </div>
  );
};

export default Header;
