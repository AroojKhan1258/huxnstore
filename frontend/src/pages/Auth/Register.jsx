import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { useRegisterMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { AiOutlineMail, AiOutlineLock, AiOutlineUser } from "react-icons/ai";

const Register = () => {
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
    } else {
      try {
        const res = await register({ username, email, password }).unwrap();
        dispatch(setCredentials({ ...res }));
        navigate(redirect);
        toast.success("Welcome to LUXE!");
      } catch (err) {
        toast.error(err.data.message);
      }
    }
  };

  const field = (label, icon, type, placeholder, value, onChange, id) => (
    <div>
      <label htmlFor={id} className="block text-[10px] tracking-[0.25em] uppercase text-gray-500 mb-2 font-medium">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">{icon}</span>
        <input
          id={id}
          type={type}
          className="w-full pl-10 pr-4 py-3 bg-[#0e0812] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-700 focus:outline-none focus:border-rose-500/50 focus:bg-[#110d15] transition-all"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-89px)] flex">
      {/* Right — visual (reversed order) */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden order-last">
        <div className="absolute inset-0 bg-gradient-to-bl from-[#1a0812] via-[#0e050c] to-[#07040a]" />
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-rose-700/12 rounded-full blur-[80px]" />
          <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-rose-900/10 rounded-full blur-[60px]" />
        </div>
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }} />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-center">
          <div className="mb-6 text-5xl font-display font-light text-white/10">◈</div>
          <h2 className="text-4xl font-display font-light text-white mb-4 leading-snug">
            Begin your<br />luxury<br /><em className="text-rose-400/80">experience.</em>
          </h2>
          <p className="text-gray-600 text-sm font-light max-w-xs leading-relaxed">
            Create your free account and enjoy exclusive member benefits on every purchase.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-3 w-full max-w-xs">
            {[
              { icon: "✓", text: "Early access to new arrivals" },
              { icon: "✓", text: "Member-only pricing" },
              { icon: "✓", text: "Free express shipping" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-left">
                <span className="w-5 h-5 rounded-full bg-rose-900/30 flex items-center justify-center text-rose-500 text-[10px] flex-shrink-0">
                  {icon}
                </span>
                <p className="text-[11px] text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Left — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-[#07040a]">
        <div className="w-full max-w-sm fade-up">
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center">
              <span className="text-white font-black text-sm">L</span>
            </div>
            <span className="text-white font-bold tracking-[0.2em] uppercase text-sm">LUXE</span>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-display font-light text-white mb-2">Create account</h1>
            <p className="text-gray-600 text-sm font-light">Join the LUXE community today.</p>
          </div>

          <form onSubmit={submitHandler} className="space-y-4">
            {field("Full Name", <AiOutlineUser size={15} />, "text", "Your name", username, (e) => setName(e.target.value), "name")}
            {field("Email Address", <AiOutlineMail size={15} />, "email", "your@email.com", email, (e) => setEmail(e.target.value), "email")}
            {field("Password", <AiOutlineLock size={15} />, "password", "Create a password", password, (e) => setPassword(e.target.value), "password")}
            {field("Confirm Password", <AiOutlineLock size={15} />, "password", "Confirm your password", confirmPassword, (e) => setConfirmPassword(e.target.value), "confirmPassword")}

            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-500 text-white py-3.5 px-6 rounded-xl text-[11px] font-bold tracking-[0.3em] uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-900/30 hover:shadow-rose-800/50 hover:-translate-y-0.5 mt-2"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            {isLoading && <Loader />}
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.06] text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to={redirect ? `/login?redirect=${redirect}` : "/login"}
              className="text-rose-400 hover:text-rose-300 transition-colors font-medium"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
