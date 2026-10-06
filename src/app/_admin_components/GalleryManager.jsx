"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Trash2,
  Plus,
  X,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  ExternalLink,
  Layers,
  Settings,
  AlertTriangle,
  RefreshCw,
  FolderPlus,
} from "lucide-react";
import toast from "react-hot-toast";

export default function GalleryManager() {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [uploading, setUploading] = useState(false);

  // Category management modal / inline
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  // Deletion modal state
  const [deletingImage, setDeletingImage] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch images and categories
  const fetchData = async () => {
    try {
      setLoading(true);
      const [imgRes, catRes] = await Promise.all([
        fetch("/api/gallery/images"),
        fetch("/api/gallery/categories"),
      ]);

      const imgData = await imgRes.json();
      const catData = await catRes.json();

      if (imgData.success) {
        setImages(imgData.images || []);
      }
      if (catData.success) {
        const fetchedCats = catData.categories || [];
        setCategories(fetchedCats);
        if (fetchedCats.length > 0 && !selectedCategory) {
          setSelectedCategory(fetchedCats[0].name);
        }
      }
    } catch (err) {
      console.error("Failed to load gallery data:", err);
      toast.error("Failed to load gallery data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, WEBP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size should be less than 10MB");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
  };

  const clearSelectedFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Upload image
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select an image to upload");
      return;
    }
    if (!selectedCategory) {
      toast.error("Please select a category or heading");
      return;
    }

    try {
      setUploading(true);
      const toastId = toast.loading("Uploading to Cloudinary...");

      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("category", selectedCategory);

      const res = await fetch("/api/gallery/images", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Upload failed");
      }

      toast.success("Image added to gallery!", { id: toastId });
      clearSelectedFile();
      // Prepend newly uploaded image
      setImages((prev) => [data.image, ...prev]);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Delete image
  const handleDeleteImage = async () => {
    if (!deletingImage) return;

    try {
      setDeletingLoading(true);
      const res = await fetch(`/api/gallery/images/${deletingImage.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Deletion failed");
      }

      toast.success("Image removed from gallery");
      setImages((prev) => prev.filter((img) => img.id !== deletingImage.id));
      setDeletingImage(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete image");
    } finally {
      setDeletingLoading(false);
    }
  };

  // Add new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    try {
      setCategorySubmitting(true);
      const res = await fetch("/api/gallery/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add category");
      }

      toast.success(`Category "${data.category.name}" added!`);
      setCategories((prev) => [...prev, data.category]);
      setSelectedCategory(data.category.name);
      setNewCategoryName("");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to add category");
    } finally {
      setCategorySubmitting(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Are you sure you want to remove "${catName}" from the dropdown list?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/gallery/categories/${catId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete category");
      }

      toast.success(`Category "${catName}" removed`);
      const updated = categories.filter((c) => c.id !== catId);
      setCategories(updated);
      if (selectedCategory === catName) {
        setSelectedCategory(updated[0]?.name || "");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to remove category");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9fe03c]/20 text-[#0b408e] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0b408e]" />
            Gallery Administration
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0b408e]">
            Manage Photo Gallery
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Upload new photos to Cloudinary (<span className="font-mono text-xs text-[#0b408e]">nexlearn/gallery</span>) and manage categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-[#0b408e] hover:border-[#0b408e]/30 hover:bg-slate-50 text-sm font-semibold transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-[#0b408e]" />
            <span>Manage Categories</span>
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            aria-label="Refresh Gallery"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-[#0b408e] hover:bg-slate-50 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#0b408e]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Upload Section Card */}
      <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
        <h2 className="text-lg md:text-xl font-bold text-[#0b408e] mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-[#9fe03c]" />
          Upload New Image
        </h2>

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Dropzone / Picker */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                Image File (JPG, PNG, WEBP)
              </label>

              {!filePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-[#0b408e] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20 flex flex-col items-center justify-center min-h-[180px]"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0b408e] flex items-center justify-center mb-3">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    Click to browse or drag & drop image
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Max file size: 10MB
                  </p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group aspect-[4/3] max-h-[220px] flex items-center justify-center">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-2 left-3 text-xs bg-black/70 text-white px-2 py-0.5 rounded-md truncate max-w-[80%]">
                    {selectedFile?.name}
                  </span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Category Selection Dropdown */}
            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                  Category / Heading Name
                </label>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/20 outline-none text-slate-700 font-medium bg-white transition-all text-sm"
                  >
                    {categories.length === 0 ? (
                      <option value="">No categories available</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))
                    )}
                  </select>

                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    title="Add / Remove Categories"
                    className="px-3.5 py-3 rounded-xl bg-slate-100 hover:bg-[#9fe03c] text-slate-700 hover:text-[#0b408e] font-semibold transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-xs hidden sm:inline">Add Item</span>
                  </button>
                </div>

                <p className="text-xs text-slate-500 mt-2">
                  Select an existing heading or click &ldquo;Add Item&rdquo; to add a new category to the dropdown.
                </p>
              </div>

              {/* Upload Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={uploading || !selectedFile || !selectedCategory}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#0b408e] hover:bg-[#082f68] text-white font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#9fe03c]" />
                      <span>Uploading to Cloudinary...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-[#9fe03c]" />
                      <span>Upload & Add to Gallery</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Gallery Images List */}
      <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-[#0b408e] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#9fe03c]" />
              Uploaded Gallery Photos ({images.length})
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Live images currently displayed in the public gallery.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0b408e] mb-2" />
            <p className="text-sm">Loading gallery images...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl p-8">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No images uploaded yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Upload your first gallery image using the form above to display it on the website.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <Image
                    src={item.image_url}
                    alt={item.category || "Gallery Photo"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-2.5 py-1 rounded-full bg-[#9fe03c] text-[#0b408e] text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      {item.category}
                    </span>
                  </div>

                  <a
                    href={item.image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-[#0b408e] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="View Original"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Card Footer with Details & Actions */}
                <div className="p-4 flex items-center justify-between border-t border-slate-100 bg-white">
                  <div>
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {item.category}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      ID: #{item.id} • {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => setDeletingImage(item)}
                    title="Delete Image"
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CATEGORY MANAGEMENT MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#0b408e]" />
                <h3 className="text-lg font-bold text-[#0b408e]">
                  Manage Categories
                </h3>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add new item input */}
            <form onSubmit={handleAddCategory} className="my-5">
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                Add New Dropdown Item
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Seminars 2026, Field Trips"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/20 outline-none text-sm text-slate-800"
                />
                <button
                  type="submit"
                  disabled={categorySubmitting || !newCategoryName.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#0b408e] hover:bg-[#082f68] text-white font-semibold text-xs transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  {categorySubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Existing Categories List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                Existing Dropdown Items ({categories.length})
              </label>

              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-sm"
                >
                  <span className="font-medium text-slate-700">{cat.name}</span>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Remove from dropdown"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingImage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Remove Gallery Image?
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              This will permanently delete the image from your database and remove it from Cloudinary (<span className="font-mono text-xs">nexlearn/gallery</span>).
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingImage(null)}
                disabled={deletingLoading}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteImage}
                disabled={deletingLoading}
                className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {deletingLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
