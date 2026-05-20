import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaTrash } from "react-icons/fa";
import { addToCart, removeFromCart } from "../redux/features/cart/cartSlice";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate("/login?redirect=/shipping");
  };

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-light tracking-widest uppercase text-white mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <Link to="/shop" className="bg-pink-600 hover:bg-pink-700 text-white py-2.5 px-8 rounded-full text-sm font-semibold tracking-widest uppercase transition-colors">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center gap-4 p-4 bg-[#141414] rounded-xl border border-white/5">
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.slug || item._id}`} className="text-pink-400 hover:text-pink-300 text-sm font-medium transition-colors line-clamp-1">
                      {item.name}
                    </Link>
                    <div className="mt-1 text-xs text-gray-500">{item.brand}</div>
                    <div className="mt-1 text-white font-bold">${item.price}</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <select
                      className="px-3 py-1.5 bg-[#0a0a0b] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500"
                      style={{ color: "#fff" }}
                      value={item.qty}
                      onChange={(e) => addToCartHandler(item, Number(e.target.value))}
                    >
                      {[...Array(item.countInStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>{x + 1}</option>
                      ))}
                    </select>

                    <button
                      className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                      onClick={() => removeFromCartHandler(item._id)}
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-[#141414] rounded-xl border border-white/5 p-6 sticky top-6">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)})</span>
                  <span className="text-white font-semibold">
                    ${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-white/5 pt-3 flex justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-white font-bold text-lg">
                    ${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 rounded-full text-sm font-semibold tracking-widest uppercase transition-colors disabled:opacity-50"
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                Proceed to Checkout
              </button>

              <Link to="/shop" className="block text-center mt-4 text-xs text-gray-500 hover:text-gray-300 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
