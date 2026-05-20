import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useAllProductsQuery } from "../../redux/api/productApiSlice";
import { useGetMyOrdersQuery } from "../../redux/api/orderApiSlice";
import { useGetTopProductsQuery } from "../../redux/api/productApiSlice";
import ChatMessage from "./ChatMessage";
import { detectIntent, generateResponse, getQuickReplies, INTENTS } from "./chatbotEngine";

// ── Typing indicator ─────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex items-end gap-2 mb-3">
    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-900/30">
      <span className="text-white text-[10px] font-black">L</span>
    </div>
    <div className="px-3.5 py-3 bg-[#140d1a] border border-white/[0.07] rounded-2xl rounded-tl-sm">
      <div className="flex items-center gap-1">
        {[0,1,2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-rose-400/50"
            style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ── Quick replies bar ────────────────────────────────────────────
const QuickReplies = ({ replies, onSelect }) => (
  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
    {replies.map(r => (
      <button
        key={r.value}
        onClick={() => onSelect(r.value)}
        className="flex-shrink-0 px-3 py-1.5 bg-white/[0.04] hover:bg-rose-900/20 border border-white/[0.07] hover:border-rose-500/30 rounded-full text-[10px] text-gray-400 hover:text-rose-300 transition-all whitespace-nowrap"
      >
        {r.label}
      </button>
    ))}
  </div>
);

// ── Main ChatbotWidget ────────────────────────────────────────────
const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastIntent, setLastIntent] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasGreeted, setHasGreeted] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  const { data: allProducts } = useAllProductsQuery();
  const { data: topProducts } = useGetTopProductsQuery();
  const { data: myOrders } = useGetMyOrdersQuery(undefined, { skip: !userInfo });

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // Greeting on first open
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      const greetMsg = generateResponse(INTENTS.GREETING, { userInfo });
      addBotMessage({ ...greetMsg, timestamp: Date.now() }, 600);
      // Follow up with help
      setTimeout(() => {
        const helpMsg = generateResponse(INTENTS.HELP, {});
        addBotMessage({ ...helpMsg, text: "What would you like to do?", timestamp: Date.now() }, 0);
      }, 1200);
    }
  }, [isOpen, hasGreeted, userInfo]);

  // Unread badge when closed
  const addBotMessage = useCallback((msgData, delay = 0) => {
    setTimeout(() => {
      setMessages(prev => [...prev, { ...msgData, role: 'bot', id: Date.now() + Math.random() }]);
      setIsTyping(false);
      if (!isOpen) setUnreadCount(prev => prev + 1);
    }, delay);
  }, [isOpen]);

  const getContext = () => ({
    products: allProducts || [],
    topProducts: topProducts || [],
    cartItems: cartItems || [],
    orders: myOrders || [],
    userInfo,
    message: input,
  });

  // ── Blog generation via backend AI route ──────────────────────
  const generateBlog = async (topic) => {
    setIsTyping(true);
    try {
      const products = allProducts || [];
      const res = await fetch("/api/ai/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, storeName: "LUXE Store", products }),
      });
      const data = await res.json();
      if (data.error) {
        addBotMessage({
          text: `❌ ${data.error}`,
          type: "text",
          timestamp: Date.now(),
        }, 0);
      } else {
        addBotMessage({
          text: `✅ Here\'s your blog post about **"${topic}"**:`,
          type: "blog_result",
          blog: data.blog,
          title: data.title,
          metaDescription: data.metaDescription,
          keywords: data.keywords,
          timestamp: Date.now(),
        }, 0);
      }
    } catch {
      addBotMessage({
        text: "❌ Could not connect to AI service. Make sure your backend is running.",
        type: "text",
        timestamp: Date.now(),
      }, 0);
    }
  };

  const handleSend = useCallback((text) => {
    const msg = (text || input).trim();
    if (!msg) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: msg, id: Date.now() }]);
    setInput("");
    setIsTyping(true);

    // Detect intent & generate response
    const intent = detectIntent(msg);
    setLastIntent(intent);

    const ctx = { ...getContext(), message: msg };
    const response = generateResponse(intent, ctx);

    if (intent === INTENTS.BLOG_WRITE) {
      if (response.type === 'blog_loading' && response.topic) {
        // Show "writing..." message then call API
        addBotMessage({ text: response.text, type: 'text', timestamp: Date.now() }, 400);
        setTimeout(() => generateBlog(response.topic), 800);
        return;
      }
      // No topic extracted — ask for it
      addBotMessage({ ...response, timestamp: Date.now() }, 600);
      return;
    }

    // All other intents — existing behaviour untouched
    const delay = 600 + Math.random() * 500;
    addBotMessage({ ...response, timestamp: Date.now() }, delay);
  }, [input, allProducts, topProducts, cartItems, myOrders, userInfo, addBotMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const quickReplies = getQuickReplies(lastIntent, { cartItems });

  return (
    <>
      {/* ── Bounce animation style ── */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatPop {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .chat-widget { animation: chatSlideUp 0.3s ease forwards; }
        .chat-fab { animation: chatPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .chat-messages::-webkit-scrollbar { width: 3px; }
        .chat-messages::-webkit-scrollbar-track { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb { background: rgba(225,29,72,0.2); border-radius: 2px; }
      `}</style>

      {/* ── Chat Window ── */}
      {isOpen && !isMinimized && (
        <div
          className="chat-widget fixed bottom-24 right-5 z-[9998] w-[360px] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/70"
          style={{ height: '580px', maxHeight: 'calc(100vh - 120px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-[#1a0812] to-[#120a18] border-b border-white/[0.07] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-900/40">
                  <span className="text-white font-black text-sm">L</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a0812]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-white">LUXE Assistant</p>
                <p className="text-[10px] text-green-400/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Online · AI Powered
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 text-gray-600 hover:text-gray-300 hover:bg-white/[0.05] rounded-lg transition-colors"
                title="Minimize"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors"
                title="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="chat-messages flex-1 overflow-y-auto px-3 py-4 bg-[#09060c]"
          >
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                msg={msg}
                onSend={handleSend}
                onAction={(action) => {
                  if (action.type === 'cleared') {
                    addBotMessage({ text: "Cart cleared! Ready to start fresh?", type: 'text', action: { type: 'link', label: 'Browse Products', to: '/shop' }, timestamp: Date.now() });
                  }
                }}
              />
            ))}

            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {messages.length > 0 && !isTyping && (
            <div className="px-3 py-2 bg-[#09060c] border-t border-white/[0.04]">
              <QuickReplies replies={quickReplies} onSelect={handleSend} />
            </div>
          )}

          {/* Input */}
          <div className="flex items-end gap-2 px-3 py-3 bg-[#0e0812] border-t border-white/[0.07] flex-shrink-0">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={1}
                className="w-full bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15] focus:border-rose-500/40 rounded-xl px-3.5 py-2.5 text-[12px] text-white placeholder-gray-600 focus:outline-none resize-none transition-colors"
                style={{ minHeight: '40px', maxHeight: '100px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 flex items-center justify-center bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-all flex-shrink-0 shadow-lg shadow-rose-900/30 hover:shadow-rose-800/50"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Minimized pill ── */}
      {isOpen && isMinimized && (
        <div
          className="fixed bottom-24 right-5 z-[9998] cursor-pointer"
          onClick={() => setIsMinimized(false)}
        >
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#0e0812] border border-white/[0.08] rounded-full shadow-2xl hover:border-rose-500/30 transition-colors">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center">
              <span className="text-white font-black text-[9px]">L</span>
            </div>
            <span className="text-[11px] text-gray-300 font-medium">LUXE Assistant</span>
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        </div>
      )}

      {/* ── FAB Button ── */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="chat-fab fixed bottom-5 right-5 z-[9998] group"
        >
          <div className="relative w-14 h-14 flex items-center justify-center">
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-2xl bg-rose-600/30 animate-ping" style={{ animationDuration: '2s' }} />
            {/* Button */}
            <div className="relative w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-700 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-900/50 group-hover:shadow-rose-800/70 group-hover:scale-110 transition-all duration-300">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            {/* Unread badge */}
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-md border-2 border-[#07040a]">
                {unreadCount}
              </div>
            )}
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-[#0e0812] border border-white/10 rounded-lg px-3 py-1.5 whitespace-nowrap">
              <p className="text-[11px] text-gray-300">LUXE AI Assistant</p>
            </div>
          </div>
        </button>
      )}
    </>
  );
};

export default ChatbotWidget;
