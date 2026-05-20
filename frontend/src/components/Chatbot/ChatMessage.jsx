import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart, removeFromCart, clearCartItems } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import { AiOutlineShoppingCart, AiOutlineDelete } from "react-icons/ai";
import { FaBox, FaCheckCircle, FaClock, FaTruck } from "react-icons/fa";

// ── Product mini card ────────────────────────────────────────────
const MiniProduct = ({ product, onAddToCart }) => (
  <div className="flex gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] hover:border-rose-500/20 transition-colors group">
    <Link to={`/product/${product._id}`}>
      <img
        src={product.image}
        alt={product.name}
        className="w-14 h-14 rounded-lg object-cover flex-shrink-0 group-hover:opacity-90 transition-opacity"
      />
    </Link>
    <div className="flex-1 min-w-0">
      <Link to={`/product/${product._id}`} className="text-[12px] font-semibold text-gray-100 leading-snug hover:text-rose-300 transition-colors line-clamp-1 block">
        {product.name}
      </Link>
      <p className="text-[10px] text-gray-600 mt-0.5">{product.brand}</p>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-rose-400 font-bold text-[12px]">
          ${product.price?.toFixed(2)}
        </span>
        <button
          onClick={() => onAddToCart(product)}
          className="flex items-center gap-1 px-2 py-1 bg-rose-600/80 hover:bg-rose-500 text-white text-[9px] font-bold tracking-wider uppercase rounded-lg transition-colors"
        >
          <AiOutlineShoppingCart size={10} />
          Add
        </button>
      </div>
    </div>
  </div>
);

// ── Order status card ────────────────────────────────────────────
const OrderCard = ({ order }) => {
  const getStatus = () => {
    if (order.isDelivered) return { label: 'Delivered', icon: <FaCheckCircle className="text-green-400" size={12} />, color: 'text-green-400' };
    if (order.isPaid) return { label: 'Shipped', icon: <FaTruck className="text-blue-400" size={12} />, color: 'text-blue-400' };
    return { label: 'Processing', icon: <FaClock className="text-yellow-400" size={12} />, color: 'text-yellow-400' };
  };

  const status = getStatus();
  const total = order.totalPrice?.toFixed(2);

  return (
    <Link to={`/order/${order._id}`} className="block">
      <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] hover:border-rose-500/20 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-gray-600 font-mono">#{order._id.slice(-8).toUpperCase()}</span>
          <div className={`flex items-center gap-1 ${status.color}`}>
            {status.icon}
            <span className="text-[10px] font-semibold">{status.label}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-400">{order.orderItems?.length} item(s)</span>
          <span className="text-[12px] font-bold text-white">${total}</span>
        </div>
        {/* Mini timeline */}
        <div className="flex items-center gap-1 mt-2.5">
          {['Order Placed', 'Payment', 'Shipped', 'Delivered'].map((step, i) => {
            const done = (i === 0) || (i === 1 && order.isPaid) || (i === 2 && order.isPaid) || (i === 3 && order.isDelivered);
            return (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${done ? 'bg-rose-500' : 'bg-white/10'}`} />
                {i < 3 && <div className={`h-px flex-1 ${done ? 'bg-rose-500/50' : 'bg-white/5'}`} />}
              </div>
            );
          })}
        </div>
        <p className="text-[9px] text-rose-400/60 mt-1 text-right">View details →</p>
      </div>
    </Link>
  );
};

// ── Cart summary row ─────────────────────────────────────────────
const CartRow = ({ item, onRemove, showRemove }) => (
  <div className="flex items-center gap-2 py-2 border-b border-white/[0.04] last:border-0">
    <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-gray-200 truncate">{item.name}</p>
      <p className="text-[10px] text-gray-600">Qty: {item.qty}</p>
    </div>
    <div className="text-right flex items-center gap-1.5">
      <span className="text-[11px] font-bold text-rose-400">${(item.price * item.qty).toFixed(2)}</span>
      {showRemove && (
        <button onClick={() => onRemove(item._id)} className="p-1 text-gray-600 hover:text-red-400 transition-colors">
          <AiOutlineDelete size={12} />
        </button>
      )}
    </div>
  </div>
);

// ── FAQ card ─────────────────────────────────────────────────────
const FaqCard = ({ title, items }) => (
  <div className="rounded-xl overflow-hidden border border-white/[0.06]">
    <div className="bg-rose-900/20 px-3 py-2 border-b border-white/[0.06]">
      <p className="text-[11px] font-bold text-rose-300">{title}</p>
    </div>
    <div className="divide-y divide-white/[0.04]">
      {items.map(({ q, a }) => (
        <div key={q} className="px-3 py-2">
          <p className="text-[10px] font-semibold text-gray-300 mb-0.5">{q}</p>
          <p className="text-[10px] text-gray-500 leading-relaxed">{a}</p>
        </div>
      ))}
    </div>
  </div>
);

// ── Help options ─────────────────────────────────────────────────
const HelpOptions = ({ options, onSelect }) => (
  <div className="grid grid-cols-2 gap-1.5 mt-2">
    {options.map(opt => (
      <button
        key={opt.value}
        onClick={() => onSelect(opt.value)}
        className="text-left px-2.5 py-2 bg-white/[0.03] border border-white/[0.06] hover:border-rose-500/30 hover:bg-rose-900/10 rounded-xl text-[10px] text-gray-400 hover:text-gray-200 transition-all"
      >
        {opt.label}
      </button>
    ))}
  </div>
);

// ── Main ChatMessage component ────────────────────────────────────
const ChatMessage = ({ msg, onAction, onSend }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isBot = msg.role === 'bot';

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, qty: 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  const handleRemoveFromCart = (id) => {
    dispatch(removeFromCart(id));
    toast.info("Item removed from cart");
  };

  const handleClearCart = () => {
    dispatch(clearCartItems());
    toast.info("Cart cleared");
    onAction && onAction({ type: 'cleared' });
  };

  const handleLink = (to) => {
    navigate(to);
  };

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}>
      {isBot && (
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center flex-shrink-0 mr-2 mt-1 shadow-lg shadow-rose-900/30">
          <span className="text-white text-[10px] font-black">L</span>
        </div>
      )}

      <div className={`max-w-[85%] space-y-2 ${isBot ? '' : 'items-end flex flex-col'}`}>
        {/* Main text bubble */}
        {msg.text && (
          <div className={`px-3.5 py-2.5 rounded-2xl text-[12px] leading-relaxed ${
            isBot
              ? 'bg-[#140d1a] border border-white/[0.07] text-gray-200 rounded-tl-sm'
              : 'bg-rose-600 text-white rounded-tr-sm'
          }`}>
            {msg.text}
          </div>
        )}

        {/* Subtitle */}
        {msg.subtitle && (
          <p className="text-[9px] text-gray-600 px-1 tracking-widest uppercase">{msg.subtitle}</p>
        )}

        {/* Products grid */}
        {msg.type === 'products' && msg.products && (
          <div className="space-y-2 w-full">
            {msg.products.map(p => (
              <MiniProduct key={p._id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}

        {/* Orders list */}
        {msg.type === 'orders' && msg.orders && (
          <div className="space-y-2 w-full">
            {msg.orders.map(o => <OrderCard key={o._id} order={o} />)}
            <Link to="/profile" className="block text-center text-[10px] text-rose-400/70 hover:text-rose-300 transition-colors py-1">
              View all orders →
            </Link>
          </div>
        )}

        {/* Cart summary */}
        {(msg.type === 'cart' || msg.type === 'cart_remove') && msg.cartItems && (
          <div className="w-full bg-[#140d1a] rounded-xl border border-white/[0.07] overflow-hidden">
            <div className="px-3 py-2.5">
              {msg.cartItems.map(item => (
                <CartRow
                  key={item._id}
                  item={item}
                  onRemove={handleRemoveFromCart}
                  showRemove={msg.type === 'cart_remove'}
                />
              ))}
              <div className="flex justify-between items-center pt-2 mt-1">
                <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Total</span>
                <span className="text-[13px] font-bold text-white">
                  ${msg.cartItems.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* FAQ card */}
        {msg.type === 'faq' && msg.items && (
          <FaqCard title={msg.title} items={msg.items} />
        )}

        {/* Help options */}
        {(msg.type === 'help' || msg.type === 'unknown') && msg.options && (
          <HelpOptions options={msg.options} onSelect={onSend} />
        )}

        {/* Confirm action */}
        {msg.type === 'confirm' && (
          <div className="flex gap-2">
            <button
              onClick={handleClearCart}
              className="flex-1 py-2 bg-red-600/80 hover:bg-red-500 text-white text-[10px] font-bold tracking-wider uppercase rounded-xl transition-colors"
            >
              {msg.confirmLabel}
            </button>
            <button
              onClick={() => onAction && onAction({ type: 'cancel' })}
              className="flex-1 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 text-[10px] font-bold tracking-wider uppercase rounded-xl transition-colors"
            >
              {msg.cancelLabel}
            </button>
          </div>
        )}

        {/* Blog result */}
        {msg.type === 'blog_result' && msg.blog && (
          <BlogDisplay
            blog={msg.blog}
            title={msg.title || ''}
            metaDescription={msg.metaDescription || ''}
            keywords={msg.keywords || ''}
          />
        )}

        {/* Blog topic prompt */}
        {msg.type === 'blog_topic_prompt' && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {['New Arrivals 2026','Summer Fashion Tips','Gift Guide','Best Products','Style Trends'].map(t => (
              <button
                key={t}
                onClick={() => onSend && onSend(`write a blog about ${t}`)}
                className="px-2.5 py-1 bg-white/[0.04] hover:bg-rose-900/20 border border-white/[0.07] hover:border-rose-500/30 rounded-full text-[9px] text-gray-400 hover:text-rose-300 transition-all"
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* CTA Link button */}
        {msg.action?.type === 'link' && (
          <button
            onClick={() => handleLink(msg.action.to)}
            className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/20 hover:border-rose-500/40 text-rose-300 text-[10px] font-bold tracking-widest uppercase rounded-xl transition-all"
          >
            {msg.action.label}
          </button>
        )}

        {/* Timestamp */}
        {isBot && msg.timestamp && (
          <p className="text-[9px] text-gray-700 px-1">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {!isBot && (
        <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 ml-2 mt-1 flex-shrink-0">
          <span className="text-[10px] text-gray-400">You</span>
        </div>
      )}
    </div>
  );
};


// ── Blog Display ─────────────────────────────────────────────────
const BlogDisplay = ({ blog, title, metaDescription, keywords }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(blog).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([blog], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.slice(0, 40).replace(/[^a-z0-9]/gi, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Simple markdown-like rendering (## headings, **bold**)
  const renderLine = (line, i) => {
    if (line.startsWith('## ')) {
      return <h4 key={i} className="text-rose-300 font-bold text-[11px] mt-3 mb-1">{line.replace('## ', '')}</h4>;
    }
    if (line.startsWith('# ')) {
      return <h3 key={i} className="text-white font-bold text-[12px] mt-2 mb-1">{line.replace('# ', '')}</h3>;
    }
    if (!line.trim()) return <br key={i} />;
    // Bold text
    const parts = line.split(/\*\*(.+?)\*\*/g);
    return (
      <p key={i} className="text-gray-300 text-[10px] leading-relaxed mb-1">
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part
        )}
      </p>
    );
  };

  return (
    <div className="mt-2 rounded-xl border border-rose-500/20 bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-rose-900/20 border-b border-rose-500/10">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]">✍️</span>
          <span className="text-[10px] text-rose-300 font-semibold tracking-wide">AI BLOG POST</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={handleCopy}
            className="px-2 py-1 bg-white/[0.06] hover:bg-rose-600/30 text-gray-400 hover:text-rose-300 text-[9px] font-bold tracking-wider uppercase rounded-lg transition-colors"
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="px-2 py-1 bg-white/[0.06] hover:bg-rose-600/30 text-gray-400 hover:text-rose-300 text-[9px] font-bold tracking-wider uppercase rounded-lg transition-colors"
          >
            ↓ Save
          </button>
        </div>
      </div>

      {/* Blog content */}
      <div className="px-3 py-2.5 max-h-64 overflow-y-auto scrollbar-hide">
        {blog.split('\n').map((line, i) => renderLine(line, i))}
      </div>

      {/* SEO meta footer */}
      {(metaDescription || keywords) && (
        <div className="px-3 py-2 bg-white/[0.02] border-t border-white/[0.05]">
          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider mb-1">SEO Info</p>
          {metaDescription && (
            <p className="text-[9px] text-gray-500 leading-relaxed mb-1">
              <span className="text-gray-600">Meta:</span> {metaDescription}
            </p>
          )}
          {keywords && (
            <p className="text-[9px] text-gray-500">
              <span className="text-gray-600">Keywords:</span> {keywords}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
