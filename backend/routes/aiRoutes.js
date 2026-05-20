import express from "express";
const router = express.Router();

// POST /api/ai/blog
router.post("/blog", async (req, res) => {
  try {
    const { topic, storeName = "LUXE Store", products = [] } = req.body;
    if (!topic || topic.trim().length < 3)
      return res.status(400).json({ error: "Blog topic is required" });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey)
      return res.status(500).json({ error: "GROQ_API_KEY not found in .env" });

    const productContext = products.length > 0
      ? "\n\nOur store sells: " + products.slice(0, 6).map(p => p.name + " ($" + p.price + ")").join(", ") + "."
      : "";

    const prompt = "You are a professional e-commerce content writer for \"" + storeName + "\".\n" +
      "Write a complete SEO-optimized blog post about: \"" + topic + "\"" + productContext + "\n" +
      "Requirements: 400-500 words, use ## for section headings, engaging modern tone, end with a call-to-action.\n" +
      "After the blog add these 3 lines:\n" +
      "META_TITLE: [SEO title under 60 chars]\n" +
      "META_DESC: [meta description under 155 chars]\n" +
      "KEYWORDS: [6-8 comma-separated keywords]";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1200,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("[AI] Groq error:", data);
      return res.status(500).json({ error: data?.error?.message || "Groq API failed" });
    }

    const fullText = data.choices?.[0]?.message?.content || "";
    if (!fullText) return res.status(500).json({ error: "No content returned. Try again." });

    console.log("[AI] Blog generated successfully with Groq");

    const metaTitleMatch = fullText.match(/META_TITLE:\s*(.+)/);
    const metaDescMatch  = fullText.match(/META_DESC:\s*(.+)/);
    const keywordsMatch  = fullText.match(/KEYWORDS:\s*(.+)/);

    const blogContent = fullText
      .replace(/META_TITLE:.*$/m, "")
      .replace(/META_DESC:.*$/m, "")
      .replace(/KEYWORDS:.*$/m, "")
      .trim();

    const titleLine = blogContent.split("\n").filter(Boolean)[0]?.replace(/^#+\s*/, "").trim();

    res.json({
      blog: blogContent,
      title: metaTitleMatch?.[1]?.trim() || titleLine,
      metaDescription: metaDescMatch?.[1]?.trim() || "",
      keywords: keywordsMatch?.[1]?.trim() || "",
    });

  } catch (error) {
    console.error("Blog error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/seo
router.post("/seo", async (req, res) => {
  try {
    const { name, description, brand, category } = req.body;
    if (!name) return res.status(400).json({ error: "Product name is required" });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY not found in .env" });

    const prompt = "You are an SEO expert for an e-commerce store.\n" +
      "Generate SEO meta fields for this product:\n" +
      "Name: " + name + "\n" +
      "Brand: " + (brand || "") + "\n" +
      "Category: " + (category || "") + "\n" +
      "Description: " + (description || "").substring(0, 200) + "\n\n" +
      "Respond ONLY with this exact JSON (no extra text, no markdown):\n" +
      "{\"metaTitle\": \"SEO title under 60 chars\", \"metaDescription\": \"compelling description under 155 chars\", \"metaKeywords\": \"keyword1, keyword2, keyword3, keyword4, keyword5\"}";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data?.error?.message || "AI failed" });

    const raw = data.choices?.[0]?.message?.content || "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: "Could not parse AI response" });

    const seo = JSON.parse(jsonMatch[0]);
    res.json(seo);
  } catch (error) {
    console.error("SEO gen error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
