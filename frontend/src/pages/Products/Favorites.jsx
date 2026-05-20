import { useSelector } from "react-redux";
import { selectFavoriteProduct } from "../../redux/features/favorites/favoriteSlice";
import Product from "./Product";

const Favorites = () => {
  const favorites = useSelector(selectFavoriteProduct);

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-light tracking-widest uppercase text-white mb-8">
        Favorite Products
        <span className="ml-3 text-sm text-gray-500 font-normal">({favorites.length})</span>
      </h1>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-500 text-lg">No favorites yet.</p>
          <p className="text-gray-600 text-sm mt-2">Click the heart icon on any product to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((product) => (
            <Product key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
