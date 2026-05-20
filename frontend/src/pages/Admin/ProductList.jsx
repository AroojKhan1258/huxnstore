import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import AdminMenu from "./AdminMenu";

const ProductList = () => {
  const [image, setImage]               = useState("");
  const [name, setName]                 = useState("");
  const [description, setDescription]   = useState("");
  const [price, setPrice]               = useState("");
  const [category, setCategory]         = useState("");
  const [quantity, setQuantity]         = useState("");
  const [brand, setBrand]               = useState("");
  const [stock, setStock]               = useState(0);
  const [imageUrl, setImageUrl]         = useState(null);
  const [metaTitle, setMetaTitle]       = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [aiLoading, setAiLoading]       = useState(false);

  const navigate = useNavigate();
  const [uploadProductImage] = useUploadProductImageMutation();
  const [createProduct]      = useCreateProductMutation();
  const { data: categories } = useFetchCategoriesQuery();

  // ── AI SEO Auto-Generate ──────────────────────────────────────────
  const handleAiSEO = async () => {
    if (!name) { toast.error("Enter product name first"); return; }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, brand, category }),
      });
      const data = await res.json();
      if (data.error) { toast.error(data.error); return; }
      setMetaTitle(data.metaTitle || "");
      setMetaDescription(data.metaDescription || "");
      setMetaKeywords(data.metaKeywords || "");
      toast.success("✨ SEO fields auto-generated!");
    } catch {
      toast.error("AI SEO generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await createProduct({
        name, description, price, category, quantity, brand,
        countInStock: stock, image, metaTitle, metaDescription, metaKeywords,
      });
      if (data?.error) { toast.error(data.error); return; }
      toast.success(`${data.name} created!`);
      navigate("/admin/allproductslist");
    } catch (error) {
      console.error(error);
      toast.error("Product create failed. Try Again.");
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (jpg, png, webp, etc.)");
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success("✅ Image uploaded successfully!");
      setImage(res.image);
      setImageUrl(res.image);
    } catch (err) {
      console.error("Upload error:", err);
      const msg = err?.data?.message || err?.error || "Image upload failed. Make sure you are logged in as admin.";
      toast.error(msg);
    }
  };

  const inputCls = "p-3 w-full border border-gray-700 rounded-lg bg-[#101011] text-white text-sm focus:outline-none focus:border-pink-500";
  const labelCls = "block text-gray-400 text-xs mb-1 uppercase tracking-wider";

  return (
    <div className="container xl:mx-[9rem] sm:mx-[0]">
      <div className="flex flex-col md:flex-row">
        <AdminMenu />
        <div className="md:w-3/4 p-5">
          <h1 className="text-white text-xl font-bold mb-6">Create Product</h1>

          {imageUrl && (
            <div className="mb-4 text-center">
              <img src={imageUrl} alt="preview" className="mx-auto max-h-48 rounded-lg object-cover" />
            </div>
          )}

          <div className="mb-5">
            <label className="border-2 border-dashed border-gray-700 hover:border-pink-500 text-gray-400 hover:text-pink-400 px-4 block w-full text-center rounded-lg cursor-pointer py-8 transition-colors">
              {image ? "✅ Image uploaded — click to change" : "📷 Click to Upload Product Image"}
              <input type="file" name="image" accept="image/*" onChange={uploadFileHandler} className="hidden" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Product Name *</label>
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wireless Headphones" />
            </div>
            <div>
              <label className={labelCls}>Price ($) *</label>
              <input type="number" className={inputCls} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className={labelCls}>Brand *</label>
              <input className={inputCls} value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Quantity *</label>
              <input type="number" className={inputCls} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Count In Stock</label>
              <input type="number" className={inputCls} value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Category *</label>
              <select className={inputCls} onChange={(e) => setCategory(e.target.value)}>
                <option value="">-- Select Category --</option>
                {categories?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className={labelCls}>Description *</label>
            <textarea rows={4} className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* SEO Section with AI Button */}
          <div className="border border-gray-700 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-sm">🔍 SEO &amp; Meta Details</h3>
                <p className="text-gray-500 text-xs mt-0.5">Fills automatically — or use AI to generate</p>
              </div>
              <button
                type="button"
                onClick={handleAiSEO}
                disabled={aiLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-xs font-bold rounded-lg disabled:opacity-50 transition-all"
              >
                {aiLoading ? "⏳ Generating..." : "✨ AI Auto-Generate SEO"}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Meta Title</label>
                <input className={inputCls} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="SEO title (max 60 chars)" />
              </div>
              <div>
                <label className={labelCls}>Meta Keywords</label>
                <input className={inputCls} value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} placeholder="keyword1, keyword2, keyword3" />
              </div>
            </div>
            <div className="mt-4">
              <label className={labelCls}>Meta Description</label>
              <textarea rows={2} className={inputCls} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Short description for search engines (150–160 chars)" />
            </div>
          </div>

          <button onClick={handleSubmit} className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg transition-colors">
            Create Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
