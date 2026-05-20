import { useState } from "react";
import AdminMenu from "./AdminMenu";
import Loader from "../../components/Loader";
import { useAllProductsQuery } from "../../redux/api/productApiSlice";
import {
  useGenerateKeywordsQuery,
  useSaveKeywordsMutation,
} from "../../redux/api/analyticsApiSlice";
import { toast } from "react-toastify";

const KeywordEditor = ({ productId }) => {
  const { data, isLoading, refetch } = useGenerateKeywordsQuery(productId);
  const [saveKeywords, { isLoading: saving }] = useSaveKeywordsMutation();
  const [keywords, setKeywords] = useState([]);
  const [metaDescription, setMetaDescription] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (isLoading) return <Loader />;
  if (!data) return <p className="text-gray-400">No data available</p>;

  if (!initialized && data) {
    setKeywords(data.existingKeywords?.length > 0 ? data.existingKeywords : data.keywords);
    setMetaDescription(data.existingMetaDescription || data.metaDescription);
    setInitialized(true);
  }

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (kw) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const handleUseAISuggestions = () => {
    setKeywords(data.keywords);
    setMetaDescription(data.metaDescription);
  };

  const handleSave = async () => {
    try {
      await saveKeywords({ productId, keywords, metaDescription }).unwrap();
      toast.success("Keywords & meta saved successfully!");
    } catch (err) {
      toast.error("Failed to save. Try again.");
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Suggestions */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-white font-medium">AI Generated Keywords</h4>
          <button
            onClick={handleUseAISuggestions}
            className="text-xs bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded"
          >
            Use AI Suggestions
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.keywords.map((kw) => (
            <span key={kw} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
              {kw}
            </span>
          ))}
        </div>
        <p className="text-gray-500 text-xs mt-2">AI Meta: {data.metaDescription}</p>
      </div>

      {/* Editable Keywords */}
      <div>
        <label className="text-gray-300 text-sm block mb-2">Current Keywords (editable)</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {keywords.map((kw) => (
            <span key={kw} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs flex items-center gap-1">
              {kw}
              <button onClick={() => handleRemoveKeyword(kw)} className="text-red-400 hover:text-red-300 ml-1">
                x
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
            placeholder="Add keyword..."
            className="bg-gray-700 text-white px-3 py-1 rounded text-sm flex-1"
          />
          <button onClick={handleAddKeyword} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
            Add
          </button>
        </div>
      </div>

      {/* Meta Description */}
      <div>
        <label className="text-gray-300 text-sm block mb-2">Meta Description</label>
        <textarea
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm h-20 resize-none"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Keywords & Meta"}
      </button>
    </div>
  );
};

const AIKeywords = () => {
  const { data: products, isLoading } = useAllProductsQuery();
  const [selectedProduct, setSelectedProduct] = useState(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <AdminMenu />
      <section className="px-6 py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">
          AI Meta & Keyword Generator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product List */}
          <div className="bg-[#1a1a2e] rounded-lg p-4 lg:col-span-1">
            <h2 className="text-lg font-bold text-white mb-4">Select Product</h2>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {(products || []).map((product) => (
                <button
                  key={product._id}
                  onClick={() => setSelectedProduct(product._id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedProduct === product._id
                      ? "bg-pink-500/20 border border-pink-500"
                      : "bg-gray-800/50 border border-gray-700 hover:border-gray-500"
                  }`}
                >
                  <p className="text-white text-sm font-medium truncate">{product.name}</p>
                  <p className="text-gray-400 text-xs">{product.brand} - ${product.price}</p>
                  {product.metaKeywords?.length > 0 && (
                    <p className="text-green-400 text-xs mt-1">Has keywords</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Keyword Editor */}
          <div className="bg-[#1a1a2e] rounded-lg p-4 lg:col-span-2">
            {selectedProduct ? (
              <>
                <h2 className="text-lg font-bold text-white mb-4">Keywords & SEO</h2>
                <KeywordEditor key={selectedProduct} productId={selectedProduct} />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Select a product to generate AI keywords and meta descriptions</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default AIKeywords;
