import { useGetTopProductsQuery } from "../../redux/api/productApiSlice";
import Message from "../../components/Message";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import moment from "moment";
import { FaBox, FaClock, FaShoppingCart, FaStar, FaStore } from "react-icons/fa";

const ProductCarousel = () => {
  const { data: products, isLoading, error } = useGetTopProductsQuery();

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  return (
    <div className="w-full">
      {isLoading ? null : error ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : (
        <Slider {...settings} className="w-full">
          {products.map(({ image, _id, name, price, description, brand, createdAt, numReviews, rating, quantity, countInStock }) => (
            <div key={_id}>
              <div className="relative w-full rounded-xl overflow-hidden" style={{ height: "420px" }}>
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {/* Info overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-xl font-semibold text-white mb-1">{name}</h2>
                  <p className="text-pink-400 font-bold text-lg mb-2">${price}</p>
                  <p className="text-gray-300 text-sm line-clamp-2">{description.substring(0, 120)}...</p>
                </div>
              </div>
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FaStore className="text-pink-400 flex-shrink-0" size={12} />
                  <span className="truncate">{brand}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FaStar className="text-pink-400 flex-shrink-0" size={12} />
                  <span>{numReviews} reviews</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FaBox className="text-pink-400 flex-shrink-0" size={12} />
                  <span>{countInStock} in stock</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FaStar className="text-pink-400 flex-shrink-0" size={12} />
                  <span>Rating: {Math.round(rating)}/5</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FaShoppingCart className="text-pink-400 flex-shrink-0" size={12} />
                  <span>Qty: {quantity}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FaClock className="text-pink-400 flex-shrink-0" size={12} />
                  <span>{moment(createdAt).fromNow()}</span>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
};

export default ProductCarousel;
