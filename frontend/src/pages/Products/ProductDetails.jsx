import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from "../../redux/api/productApiSlice";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { FaBox, FaClock, FaShoppingCart, FaStar, FaStore } from "react-icons/fa";
import moment from "moment";
import HeartIcon from "./HeartIcon";
import Ratings from "./Ratings";
import ProductTabs from "./ProductTabs";
import { addToCart } from "../../redux/features/cart/cartSlice";

const ProductDetails = () => {
  const { slug: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data: product, isLoading, refetch, error } = useGetProductDetailsQuery(productId);
  const { userInfo } = useSelector((state) => state.auth);
  const [createReview, { isLoading: loadingProductReview }] = useCreateReviewMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await createReview({ productId, rating, comment }).unwrap();
      refetch();
      toast.success("Review created successfully");
    } catch (error) {
      toast.error(error?.data || error.message);
    }
  };

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate("/cart");
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors mb-8">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </Link>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error?.data?.message || error.message}</Message>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
            {/* Product Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden bg-[#141414] aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <HeartIcon product={product} />
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-between py-2">
              <div>
                <h2 className="text-3xl font-light tracking-wide text-white mb-3">{product.name}</h2>
                <p className="text-gray-400 leading-relaxed mb-6">{product.description}</p>
                <p className="text-4xl font-bold text-white mb-8">${product.price}</p>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: FaStore, label: "Brand", value: product.brand },
                    { icon: FaClock, label: "Added", value: moment(product.createdAt).fromNow() },
                    { icon: FaStar, label: "Reviews", value: product.numReviews },
                    { icon: FaStar, label: "Rating", value: `${Math.round(product.rating)}/5` },
                    { icon: FaShoppingCart, label: "Quantity", value: product.quantity },
                    { icon: FaBox, label: "In Stock", value: product.countInStock },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2 p-3 bg-[#141414] rounded-lg border border-white/5">
                      <Icon className="text-pink-400 flex-shrink-0" size={14} />
                      <span className="text-xs text-gray-500">{label}:</span>
                      <span className="text-xs text-white font-medium truncate">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Ratings value={product.rating} text={`${product.numReviews} reviews`} />

                <div className="flex items-center gap-4 mt-6">
                  {product.countInStock > 0 && (
                    <select
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="px-4 py-2.5 bg-[#141414] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500 transition-colors"
                      style={{ color: "#fff" }}
                    >
                      {[...Array(product.countInStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>{x + 1}</option>
                      ))}
                    </select>
                  )}

                  <button
                    onClick={addToCartHandler}
                    disabled={product.countInStock === 0}
                    className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-2.5 px-6 rounded-full font-semibold text-sm tracking-widest uppercase transition-colors disabled:opacity-50"
                  >
                    {product.countInStock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Tabs */}
          <div className="border-t border-white/5 pt-10">
            <ProductTabs
              loadingProductReview={loadingProductReview}
              userInfo={userInfo}
              submitHandler={submitHandler}
              rating={rating}
              setRating={setRating}
              comment={comment}
              setComment={setComment}
              product={product}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ProductDetails;
