// ─────────────────────────────────────────────────────────────────
//  LUXE AI Chatbot Engine
//  All intent detection, response generation, and action building
// ─────────────────────────────────────────────────────────────────

export const INTENTS = {
  SEARCH:         'search',
  RECOMMEND:      'recommend',
  ORDER_TRACK:    'order_track',
  CART_ADD:       'cart_add',
  CART_REMOVE:    'cart_remove',
  CART_VIEW:      'cart_view',
  CART_CLEAR:     'cart_clear',
  CHECKOUT:       'checkout',
  FAQ_SHIPPING:   'faq_shipping',
  FAQ_RETURNS:    'faq_returns',
  FAQ_PAYMENT:    'faq_payment',
  FAQ_GENERAL:    'faq_general',
  GREETING:       'greeting',
  HELP:           'help',
  BLOG_WRITE:     'blog_write',
  UNKNOWN:        'unknown',
};

// ── Intent detection ──────────────────────────────────────────────
export function detectIntent(message) {
  const m = message.toLowerCase().trim();

  // Greeting
  if (/^(hi|hello|hey|salaam|salam|hola|yo|sup|good\s*(morning|evening|afternoon))/.test(m))
    return INTENTS.GREETING;

  // Help
  if (/\b(help|what can you do|commands|options|guide)\b/.test(m))
    return INTENTS.HELP;

  // Order tracking
  if (/\b(order|track|where.*order|order.*status|delivery.*status|shipped|dispatch|parcel)\b/.test(m))
    return INTENTS.ORDER_TRACK;

  // Cart actions
  if (/\b(add|put|throw|include)\b.*\b(cart|basket|bag)\b/.test(m) ||
      /\b(cart|basket)\b.*\b(add|put)\b/.test(m))
    return INTENTS.CART_ADD;

  if (/\b(remove|delete|take out|clear item)\b.*\b(cart|basket)\b/.test(m) ||
      /\b(cart|basket)\b.*\b(remove|delete)\b/.test(m))
    return INTENTS.CART_REMOVE;

  if (/\b(clear|empty)\b.*\b(cart|basket|bag)\b/.test(m) ||
      /\b(cart|basket)\b.*\b(clear|empty)\b/.test(m))
    return INTENTS.CART_CLEAR;

  if (/\b(view|show|see|check|open|what.*in)\b.*\b(cart|basket|bag)\b/.test(m) ||
      /\b(cart|basket|bag)\b/.test(m))
    return INTENTS.CART_VIEW;

  // Checkout
  if (/\b(checkout|pay|payment|buy now|place.*order|proceed)\b/.test(m))
    return INTENTS.CHECKOUT;

  // FAQ: Shipping
  if (/\b(ship|shipping|delivery|deliver|arrive|how.*long|dispatch|free.*shipping|shipping.*cost)\b/.test(m))
    return INTENTS.FAQ_SHIPPING;

  // FAQ: Returns
  if (/\b(return|refund|exchange|send.*back|money.*back|cancel|warranty)\b/.test(m))
    return INTENTS.FAQ_RETURNS;

  // FAQ: Payment
  if (/\b(pay|payment|method|credit|debit|card|paypal|cash|cod|bank|transfer|how.*pay)\b/.test(m))
    return INTENTS.FAQ_PAYMENT;

  // Recommendation
  if (/\b(recommend|suggest|popular|trending|best|top|what.*should|similar|like|you.*think|gift)\b/.test(m))
    return INTENTS.RECOMMEND;

  // Search — last before unknown
  if (/\b(show|find|search|looking for|want|need|buy|get|under|less than|below|price|cheap|affordable)\b/.test(m) ||
      /\$\d+/.test(m))
    return INTENTS.SEARCH;

  // Blog writing
  if (/\b(write|create|generate|make|draft)\b.*\b(blog|article|post|content|write-up)\b/.test(m) ||
      /\b(blog)\b/.test(m))
    return INTENTS.BLOG_WRITE;

  return INTENTS.UNKNOWN;
}

// ── Parse price from message ──────────────────────────────────────
export function extractPrice(message) {
  const m = message.toLowerCase();
  // "$50", "50 dollars", "under 50", "below $100"
  const match = m.match(/\$?(\d+(?:\.\d+)?)\s*(?:dollars?|bucks?)?/);
  return match ? parseFloat(match[1]) : null;
}

// ── Parse keywords from message ───────────────────────────────────
export function extractKeywords(message) {
  const stopWords = new Set([
    'show','me','find','search','looking','for','want','need','buy','get',
    'some','the','a','an','i','is','are','under','below','above','less',
    'than','more','with','price','cheap','good','best','please','can','you',
    'have','any','do','dollars','under','around','approximately','about',
  ]);
  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

// ── Filter products by message ────────────────────────────────────
export function filterProducts(products, message) {
  if (!products || products.length === 0) return [];
  const maxPrice = extractPrice(message);
  const keywords = extractKeywords(message);

  let results = products;

  // Price filter
  if (maxPrice) {
    results = results.filter(p => p.price <= maxPrice);
  }

  // Keyword filter (name, brand, description, category)
  if (keywords.length > 0) {
    results = results.filter(p => {
      const haystack = `${p.name} ${p.brand} ${p.description} ${p.category?.name || ''}`.toLowerCase();
      return keywords.some(kw => haystack.includes(kw));
    });
  }

  return results.slice(0, 6);
}

// ── Get trending / recommended products ──────────────────────────
export function getRecommendations(products, cartItems = [], topProducts = []) {
  if (!products || products.length === 0) return [];

  // Priority 1: top-rated products from API
  if (topProducts && topProducts.length > 0) {
    return topProducts.slice(0, 4);
  }

  // Priority 2: Sort by rating desc
  return [...products]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);
}

// ── Generate response text ────────────────────────────────────────
export function generateResponse(intent, context = {}) {
  const { products, cartItems, orders, userInfo, message } = context;

  switch (intent) {
    case INTENTS.GREETING: {
      const name = userInfo?.username ? `, ${userInfo.username}` : '';
      const greetings = [
        `Hello${name}! 👋 Welcome to LUXE. I'm your personal shopping assistant. How can I help you today?`,
        `Hey${name}! ✨ Great to see you at LUXE. Looking for something specific, or can I suggest some picks?`,
        `Hi${name}! I'm here to help you shop smarter at LUXE. Ask me to find products, track orders, or anything else!`,
      ];
      return { text: greetings[Math.floor(Math.random() * greetings.length)], type: 'text' };
    }

    case INTENTS.HELP:
      return {
        text: "Here's what I can do for you:",
        type: 'help',
        options: [
          { label: '🔍 Search Products', value: 'show me shoes under $50' },
          { label: '⭐ Recommendations', value: 'recommend something popular' },
          { label: '📦 Track My Order', value: 'where is my order' },
          { label: '🛒 View My Cart', value: 'show my cart' },
          { label: '🚚 Shipping Info', value: 'shipping info' },
          { label: '↩️ Return Policy', value: 'return policy' },
          { label: '💳 Payment Methods', value: 'payment methods' },
          { label: '✍️ Write a Blog', value: 'write a blog' },
        ],
      };

    case INTENTS.SEARCH: {
      const found = filterProducts(products, message);
      if (found.length === 0) {
        return {
          text: "I couldn't find products matching that. Try different keywords or check our full shop.",
          type: 'text',
          action: { type: 'link', label: 'Browse All Products', to: '/shop' },
        };
      }
      const maxPrice = extractPrice(message);
      const priceNote = maxPrice ? ` under $${maxPrice}` : '';
      return {
        text: `Found ${found.length} product${found.length > 1 ? 's' : ''}${priceNote} for you:`,
        type: 'products',
        products: found,
      };
    }

    case INTENTS.RECOMMEND: {
      const recs = getRecommendations(products, cartItems);
      if (recs.length === 0) {
        return { text: "Let me connect you to our shop for the best picks!", type: 'text', action: { type: 'link', label: 'Visit Shop', to: '/shop' } };
      }
      return {
        text: "✨ Here are our top picks for you:",
        type: 'products',
        products: recs,
        subtitle: 'Based on ratings & popularity',
      };
    }

    case INTENTS.ORDER_TRACK: {
      if (!userInfo) {
        return {
          text: "Please sign in to track your orders.",
          type: 'text',
          action: { type: 'link', label: 'Sign In', to: '/login' },
        };
      }
      if (!orders || orders.length === 0) {
        return { text: "You don't have any orders yet. Time to shop! 🛍️", type: 'text', action: { type: 'link', label: 'Start Shopping', to: '/shop' } };
      }
      return {
        text: `You have ${orders.length} order${orders.length > 1 ? 's' : ''}. Here's your latest:`,
        type: 'orders',
        orders: orders.slice(0, 3),
      };
    }

    case INTENTS.CART_VIEW: {
      if (!cartItems || cartItems.length === 0) {
        return {
          text: "Your cart is empty right now. Want me to find something for you?",
          type: 'text',
          action: { type: 'link', label: 'Browse Products', to: '/shop' },
        };
      }
      const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
      return {
        text: `Your cart has ${cartItems.reduce((s, i) => s + i.qty, 0)} item(s) — Total: $${total.toFixed(2)}`,
        type: 'cart',
        cartItems,
      };
    }

    case INTENTS.CART_CLEAR:
      return {
        text: "Are you sure you want to clear your entire cart?",
        type: 'confirm',
        action: { type: 'clear_cart' },
        confirmLabel: 'Yes, Clear Cart',
        cancelLabel: 'No, Keep It',
      };

    case INTENTS.CHECKOUT: {
      if (!cartItems || cartItems.length === 0) {
        return { text: "Your cart is empty! Add some items first.", type: 'text', action: { type: 'link', label: 'Shop Now', to: '/shop' } };
      }
      return {
        text: "Ready to checkout? Here's your cart summary:",
        type: 'cart',
        cartItems,
        action: { type: 'link', label: '→ Proceed to Checkout', to: '/shipping' },
      };
    }

    case INTENTS.FAQ_SHIPPING:
      return {
        text: null,
        type: 'faq',
        topic: 'shipping',
        title: '🚚 Shipping Information',
        items: [
          { q: 'Free Shipping', a: 'On all orders over $100. Standard shipping is $5.99.' },
          { q: 'Delivery Time', a: 'Standard: 5-7 business days. Express: 2-3 business days.' },
          { q: 'Express Shipping', a: 'Available for $12.99. Order before 2 PM for same-day dispatch.' },
          { q: 'International', a: 'We ship to 30+ countries. Rates calculated at checkout.' },
          { q: 'Tracking', a: 'You\'ll receive an email with tracking info once your order ships.' },
        ],
      };

    case INTENTS.FAQ_RETURNS:
      return {
        text: null,
        type: 'faq',
        topic: 'returns',
        title: '↩️ Return Policy',
        items: [
          { q: 'Return Window', a: '30 days from delivery for a full refund, no questions asked.' },
          { q: 'Condition', a: 'Items must be unused, in original packaging with all tags attached.' },
          { q: 'Refund Time', a: 'Refunds processed in 3-5 business days after we receive the item.' },
          { q: 'How to Return', a: 'Go to your order history, select the item, and click "Return".' },
          { q: 'Exchanges', a: 'We offer free exchanges. Contact support to arrange.' },
        ],
      };

    case INTENTS.FAQ_PAYMENT:
      return {
        text: null,
        type: 'faq',
        topic: 'payment',
        title: '💳 Payment Methods',
        items: [
          { q: 'Credit / Debit Cards', a: 'Visa, Mastercard, American Express, Discover — all accepted.' },
          { q: 'PayPal', a: 'Pay securely with your PayPal account at checkout.' },
          { q: 'Security', a: 'All transactions are SSL encrypted. We never store card details.' },
          { q: 'Currency', a: 'We accept USD. International cards charge in your local currency.' },
          { q: 'Invoices', a: 'A receipt is emailed after every successful order.' },
        ],
      };

    case INTENTS.CART_ADD:
      return {
        text: "Which product would you like to add to your cart? Try searching for it:",
        type: 'text',
        action: { type: 'search_prompt' },
      };

    case INTENTS.CART_REMOVE:
      if (!cartItems || cartItems.length === 0) {
        return { text: "Your cart is already empty!", type: 'text' };
      }
      return {
        text: "Which item would you like to remove?",
        type: 'cart_remove',
        cartItems,
      };

    case INTENTS.BLOG_WRITE: {
      // Extract topic after "blog about / blog on / blog for"
      const topicMatch = message.match(
        /(?:blog|article|post|content)\s+(?:about|on|for|regarding)?\s*(.+)/i
      );
      const rawTopic = topicMatch?.[1]?.replace(/^(write|a|an|the)\s+/i, '').trim();
      if (!rawTopic || rawTopic.length < 3) {
        return {
          text: "Sure! What should the blog be about? For example: **new arrivals**, **summer fashion tips**, **gift guide**, etc.",
          type: 'blog_topic_prompt',
        };
      }
      return {
        text: `✍️ Writing a blog post about **"${rawTopic}"**...`,
        type: 'blog_loading',
        topic: rawTopic,
      };
    }

    default:
      return {
        text: "I'm not sure I understood that. Here are some things I can help with:",
        type: 'help',
        options: [
          { label: '🔍 Find Products', value: 'show me popular products' },
          { label: '📦 Track Order', value: 'track my order' },
          { label: '🛒 My Cart', value: 'show my cart' },
          { label: '🚚 Shipping', value: 'shipping info' },
        ],
      };
  }
}

// ── Quick reply suggestions based on context ─────────────────────
export function getQuickReplies(lastIntent, context = {}) {
  const { cartItems } = context;
  const hasCart = cartItems && cartItems.length > 0;

  const base = [
    { label: '🔍 Search', value: 'show me popular products' },
    { label: '⭐ Top Picks', value: 'recommend something' },
    { label: '📦 Track Order', value: 'where is my order' },
    { label: '✍️ Write Blog', value: 'write a blog' },
  ];

  if (hasCart) {
    base.push({ label: `🛒 Cart (${cartItems.length})`, value: 'show my cart' });
    base.push({ label: '✓ Checkout', value: 'proceed to checkout' });
  }

  if (lastIntent === INTENTS.SEARCH || lastIntent === INTENTS.RECOMMEND) {
    return [
      { label: '🛒 View Cart', value: 'show my cart' },
      { label: '🔍 Search More', value: 'show me more products' },
      { label: '🚚 Shipping?', value: 'shipping info' },
    ];
  }

  if (lastIntent === INTENTS.ORDER_TRACK) {
    return [
      { label: '🔍 Keep Shopping', value: 'show me popular products' },
      { label: '↩️ Returns?', value: 'return policy' },
    ];
  }

  return base;
}
