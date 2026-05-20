import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { useLoginMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { AiOutlineMail, AiOutlineLock } from "react-icons/ai";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-89px)] flex">
      {/* Left — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-[#07040a]">
        <div className="w-full max-w-sm fade-up">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center">
              <span className="text-white font-black text-sm">L</span>
            </div>
            <span className="text-white font-bold tracking-[0.2em] uppercase text-sm">LUXE</span>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-display font-light text-white mb-2">Welcome back</h1>
            <p className="text-gray-600 text-sm font-light">Sign in to your account to continue.</p>
          </div>

          <form onSubmit={submitHandler} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[10px] tracking-[0.25em] uppercase text-gray-500 mb-2 font-medium">
                Email Address
              </label>
              <div className="relative">
                <AiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-[#0e0812] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-700 focus:outline-none focus:border-rose-500/50 focus:bg-[#110d15] transition-all"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] tracking-[0.25em] uppercase text-gray-500 mb-2 font-medium">
                Password
              </label>
              <div className="relative">
                <AiOutlineLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-3 bg-[#0e0812] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-700 focus:outline-none focus:border-rose-500/50 focus:bg-[#110d15] transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 text-xs"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-500 text-white py-3.5 px-6 rounded-xl text-[11px] font-bold tracking-[0.3em] uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-900/30 hover:shadow-rose-800/50 hover:-translate-y-0.5 mt-2"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            {isLoading && <Loader />}
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.06] text-sm text-gray-600">
            New here?{" "}
            <Link
              to={redirect ? `/register?redirect=${redirect}` : "/register"}
              className="text-rose-400 hover:text-rose-300 transition-colors font-medium"
            >
              Create a free account
            </Link>
          </div>
        </div>
      </div>

      {/* Right — visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0812] via-[#0e050c] to-[#07040a]" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-rose-700/15 rounded-full blur-[80px]" />
          <div className="absolute bottom-1/3 left-1/4 w-60 h-60 bg-rose-900/10 rounded-full blur-[60px]" />
        </div>
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }} />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-center">
          <div className="mb-6 text-5xl font-display font-light text-white/10">✦</div>
          <h2 className="text-4xl font-display font-light text-white mb-4 leading-snug">
            Premium<br />shopping<br /><em className="text-rose-400/80">redefined.</em>
          </h2>
          <p className="text-gray-600 text-sm font-light max-w-xs leading-relaxed">
            Join thousands of discerning customers who trust LUXE for their finest purchases.
          </p>
          <div className="mt-10 flex gap-6">
            {["Quality", "Curated", "Premium"].map((word) => (
              <div key={word} className="text-center">
                <div className="w-1 h-1 rounded-full bg-rose-500/40 mx-auto mb-2" />
                <p className="text-[9px] tracking-[0.25em] uppercase text-gray-700">{word}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
