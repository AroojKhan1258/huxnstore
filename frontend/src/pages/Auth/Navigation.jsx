import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../../redux/api/usersApiSlice";
import { logout } from "../../redux/features/auth/authSlice";
import FavoritesCount from "../Products/FavoritesCount";
import {
  AiOutlineShoppingCart,
  AiOutlineHeart,
  AiOutlineUser,
  AiOutlineLogin,
  AiOutlineUserAdd,
} from "react-icons/ai";
import { HiMenuAlt3, HiX } from "react-icons/hi";

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutApiCall] = useLogoutMutation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const cartCount = cartItems.reduce((a, c) => a + c.qty, 0);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/favorite", label: "Wishlist" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Announcement bar */}
      <div className="fixed top-0 left-0 right-0 z-[10000] bg-[#1a0812] border-b border-rose-900/30 text-center py-1.5 px-4">
        <p className="text-[10px] tracking-[0.25em] uppercase text-rose-300/60 font-light">
          ✦ &nbsp; Free shipping on orders over $100 &nbsp; · &nbsp; New arrivals every week &nbsp; ✦
        </p>
      </div>

      {/* Main Navbar */}
      <nav
        className={`fixed top-[29px] left-0 right-0 z-[9999] transition-all duration-500 ${
          scrolled
            ? "bg-[#07040a]/97 backdrop-blur-2xl shadow-2xl shadow-black/80 border-b border-white/[0.06]"
            : "bg-[#07040a]/90 backdrop-blur-xl border-b border-white/[0.06]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="flex items-center justify-between h-[60px]">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="relative w-9 h-9 flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-rose-800 rounded-lg group-hover:from-rose-400 group-hover:to-rose-700 transition-all duration-300 shadow-lg shadow-rose-900/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-black text-sm tracking-tight">L</span>
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white font-bold text-base tracking-[0.2em] uppercase">LUXE</span>
                <span className="text-rose-500/70 text-[8px] tracking-[0.5em] uppercase font-light">Premium Store</span>
              </div>
            </Link>

            {/* Center Nav */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`relative text-[11px] tracking-[0.25em] uppercase font-semibold transition-colors duration-200 group py-1
                    ${isActive(to) ? "text-white" : "text-gray-500 hover:text-gray-200"}`}
                >
                  {label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-300
                      ${isActive(to) ? "w-full" : "w-0 group-hover:w-full"}`}
                  />
                </Link>
              ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-0.5">
              <Link to="/favorite" className="relative p-2.5 text-gray-500 hover:text-white transition-colors rounded-xl hover:bg-white/[0.06] group" title="Wishlist">
                <AiOutlineHeart size={19} />
                <FavoritesCount />
              </Link>

              <Link to="/cart" className="relative p-2.5 text-gray-500 hover:text-white transition-colors rounded-xl hover:bg-white/[0.06]" title="Cart">
                <AiOutlineShoppingCart size={19} />
                {cartCount > 0 && (
                  <span className="absolute top-1.5 right-1 min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {cartCount}
                  </span>
                )}
              </Link>

              {userInfo ? (
                <div className="relative ml-1" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border transition-all duration-200 ${dropdownOpen ? "border-rose-500/40 bg-rose-900/10" : "border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]"}`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                      {userInfo.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-[11px] text-gray-300 max-w-[70px] truncate tracking-wide font-medium">
                      {userInfo.username}
                    </span>
                    <svg
                      className={`w-3 h-3 text-gray-500 transition-transform duration-200 flex-shrink-0 ${dropdownOpen ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#0e0812] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/70 overflow-hidden z-50">
                      <div className="px-4 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
                        <p className="text-[9px] text-gray-600 tracking-[0.25em] uppercase mb-1">Account</p>
                        <p className="text-sm text-white font-semibold truncate">{userInfo.username}</p>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{userInfo.email}</p>
                      </div>

                      <div className="py-1.5">
                        {[
                          { to: "/profile", icon: <AiOutlineUser size={14} />, label: "My Profile" },
                          { to: "/user-orders", icon: <AiOutlineShoppingCart size={14} />, label: "My Orders" },
                          { to: "/cart", icon: <AiOutlineShoppingCart size={14} />, label: "My Cart" },
                          { to: "/favorite", icon: <AiOutlineHeart size={14} />, label: "Wishlist" },
                        ].map(({ to, icon, label }) => (
                          <Link key={to} to={to} className="flex items-center gap-3 px-4 py-2.5 text-[12px] text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors" onClick={() => setDropdownOpen(false)}>
                            <span className="text-gray-600">{icon}</span>
                            {label}
                          </Link>
                        ))}
                      </div>

                      {userInfo.isAdmin && (
                        <div className="border-t border-white/[0.06] py-1.5">
                          <p className="px-4 py-1.5 text-[9px] tracking-[0.25em] uppercase text-gray-600">Admin Panel</p>
                          {[
                            { to: "/admin/dashboard", label: "Dashboard" },
                            { to: "/admin/productlist", label: "Products" },
                            { to: "/admin/categorylist", label: "Categories" },
                            { to: "/admin/orderlist", label: "Orders" },
                            { to: "/admin/userlist", label: "Users" },
                          ].map(({ to, label }) => (
                            <Link key={to} to={to} className="block px-4 py-2 text-[12px] text-rose-400/80 hover:text-rose-300 hover:bg-rose-900/10 transition-colors" onClick={() => setDropdownOpen(false)}>
                              {label}
                            </Link>
                          ))}
                        </div>
                      )}

                      <div className="border-t border-white/[0.06] py-1.5">
                        <button
                          onClick={() => { setDropdownOpen(false); logoutHandler(); }}
                          className="w-full text-left px-4 py-2.5 text-[12px] text-red-400/70 hover:text-red-300 hover:bg-red-900/10 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 ml-2">
                  <Link to="/login" className="flex items-center gap-1.5 px-3.5 py-2 text-[10px] tracking-[0.2em] uppercase text-gray-400 hover:text-white border border-white/[0.08] hover:border-white/20 rounded-xl transition-all duration-200">
                    <AiOutlineLogin size={13} />
                    Login
                  </Link>
                  <Link to="/register" className="flex items-center gap-1.5 px-3.5 py-2 text-[10px] tracking-[0.2em] uppercase text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all duration-200 shadow-lg shadow-rose-900/40">
                    <AiOutlineUserAdd size={13} />
                    Register
                  </Link>
                </div>
              )}

              <button
                className="md:hidden ml-1.5 p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/[0.06]"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <HiX size={20} /> : <HiMenuAlt3 size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? "max-h-[500px]" : "max-h-0"}`}>
          <div className="bg-[#07040a] border-t border-white/[0.05] px-5 pb-5 pt-3 space-y-0.5">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className={`block py-3 text-[11px] tracking-[0.25em] uppercase border-b border-white/[0.04] transition-colors ${isActive(to) ? "text-white" : "text-gray-500 hover:text-gray-200"}`}>
                {label}
              </Link>
            ))}
            {!userInfo && (
              <div className="flex gap-3 pt-4">
                <Link to="/login" className="flex-1 text-center py-2.5 text-[10px] tracking-[0.2em] uppercase border border-white/10 rounded-xl text-gray-400">Login</Link>
                <Link to="/register" className="flex-1 text-center py-2.5 text-[10px] tracking-[0.2em] uppercase bg-rose-600 rounded-xl text-white">Register</Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
