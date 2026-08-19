"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Plus, X, UploadCloud, CheckCircle2 } from "lucide-react";

import { getCategories, getSubCategories } from "@/lib/api/categories";
import { uploadToolLogo } from "@/lib/api/media";
import { submitTool } from "@/lib/api/tools";

type PricingType = "FREE" | "PAID" | "FREEMIUM";
type Category = { id: string; name: string };
type SubCategory = { id: string; name: string };

function DynamicListInput({
  label,
  placeholder,
  values,
  setValues,
}: {
  label: string;
  placeholder?: string;
  values: string[];
  setValues: (v: string[]) => void;
}) {
  const updateValue = (index: number, value: string) => {
    const updated = [...values];
    updated[index] = value;
    setValues(updated);
  };

  const addField = () => setValues([...values, ""]);

  const removeField = (index: number) => {
    const updated = values.filter((_, i) => i !== index);
    setValues(updated.length ? updated : [""]);
  };

  return (
    <div className="md:col-span-2 space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      {values.map((v, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            value={v}
            onChange={(e) => updateValue(i, e.target.value)}
            placeholder={placeholder || `Enter ${label.toLowerCase()} item`}
            className="input-box flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition"
          />

          {values.length > 1 && (
            <button
              type="button"
              onClick={() => removeField(i)}
              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
              aria-label="Remove item"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addField}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
      >
        <Plus size={14} /> Add another
      </button>
    </div>
  );
}

export default function ToolSubmitForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  const [form, setForm] = useState({
    name: "",
    website: "",
    shortDescription: "",
    longDescription: "",
    differentiation: "",
    hashtags: "",
    categoryId: "",
    subCategoryId: "",
    pricingType: "FREE" as PricingType,
    logoKey: "",
    pricingDetails: "",
    uniqueFeatures: [""],
    pros: [""],
    cons: [""],
    useCases: [""],
  });

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => showToast("Failed to load categories", "error"));
  }, [showToast]);

  useEffect(() => {
    if (!form.categoryId) {
      setSubCategories([]);
      return;
    }

    setLoadingSubCategories(true);
    getSubCategories(form.categoryId)
      .then((data) => {
        setSubCategories(data);
      })
      .catch(() => showToast("Failed to load subcategories", "error"))
      .finally(() => setLoadingSubCategories(false));
  }, [form.categoryId, showToast]);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "categoryId") {
      setForm((p) => ({ ...p, categoryId: value, subCategoryId: "" }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!file) return;

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast("Logo image must be under 5MB", "error");
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      showToast("Only JPG, PNG, WEBP, and SVG formats are supported", "error");
      return;
    }

    try {
      setUploading(true);
      const key = await uploadToolLogo(file);
      setForm((p) => ({ ...p, logoKey: key }));
      setUploadedFileName(file.name);
      showToast("Logo uploaded successfully", "success");
    } catch {
      showToast("Logo upload failed. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast("Please login to submit an AI tool 🔐", "error");
      return;
    }

    const trimmedName = form.name.trim();
    let trimmedWebsite = form.website.trim();
    const trimmedShortDesc = form.shortDescription.trim();

    if (!trimmedName) {
      showToast("Tool name is required", "error");
      return;
    }

    if (!trimmedWebsite) {
      showToast("Website URL is required", "error");
      return;
    }

    if (!trimmedWebsite.startsWith("http://") && !trimmedWebsite.startsWith("https://")) {
      trimmedWebsite = `https://${trimmedWebsite}`;
    }

    if (!trimmedShortDesc) {
      showToast("Short description is required", "error");
      return;
    }

    if (!form.categoryId) {
      showToast("Please select a category", "error");
      return;
    }

    if (!form.subCategoryId) {
      showToast("Please select a subcategory", "error");
      return;
    }

    setLoading(true);

    try {
      await submitTool({
        name: trimmedName,
        website: trimmedWebsite,
        shortDescription: trimmedShortDesc,
        longDescription: form.longDescription.trim(),
        differentiation: form.differentiation.trim(),
        logoKey: form.logoKey,
        categoryId: form.categoryId,
        subCategoryId: form.subCategoryId,
        hashtags: form.hashtags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        pricingType: form.pricingType,
        pricingDetails: form.pricingDetails.trim(),
        pros: form.pros.map((p) => p.trim()).filter(Boolean),
        cons: form.cons.map((c) => c.trim()).filter(Boolean),
        useCases: form.useCases.map((u) => u.trim()).filter(Boolean),
        uniqueFeatures: form.uniqueFeatures
          .map((f) => f.trim())
          .filter(Boolean),
      });

      showToast("Tool submitted successfully! It is now pending review 🎉", "success");
      setTimeout(() => router.push("/my-tools"), 1200);
    } catch (err: any) {
      const msg = err?.message || "Submission failed. Please check required fields.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 md:p-10 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Submit Your AI Tool</h2>
        <p className="text-sm text-slate-500 mt-1">
          Share your AI product with thousands of active creators and engineers.
        </p>
      </div>

      {!authLoading && user && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs flex items-center justify-between text-blue-900">
          <div>
            <span className="font-semibold">Submitting as:</span> {user.displayName || user.email}
          </div>
          <span className="text-blue-600 bg-blue-100/80 px-2.5 py-0.5 rounded-full font-medium">Verified User</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* LOGO UPLOAD */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              AI Tool Logo
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 transition text-sm font-medium text-slate-700">
                <UploadCloud size={18} className="text-slate-500" />
                <span>{uploading ? "Uploading..." : form.logoKey ? "Change Logo" : "Upload Logo"}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  disabled={uploading}
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && handleLogoUpload(e.target.files[0])
                  }
                />
              </label>

              {form.logoKey && (
                <span className="inline-flex items-center gap-1.5 text-xs text-green-700 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  <CheckCircle2 size={14} /> {uploadedFileName || "Logo attached"}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Tool Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              placeholder="e.g. Acme AI"
              onChange={onChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Website URL <span className="text-red-500">*</span>
            </label>
            <input
              name="website"
              value={form.website}
              placeholder="https://example.com"
              onChange={onChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={onChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition bg-white"
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Subcategory <span className="text-red-500">*</span>
            </label>
            <select
              name="subCategoryId"
              value={form.subCategoryId}
              onChange={onChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition bg-white disabled:bg-slate-50 disabled:cursor-not-allowed"
              disabled={!form.categoryId || loadingSubCategories}
              required
            >
              <option value="">
                {loadingSubCategories ? "Loading subcategories..." : "Select subcategory"}
              </option>
              {subCategories.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Short Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="shortDescription"
              value={form.shortDescription}
              placeholder="One or two punchy sentences describing what your tool does"
              onChange={onChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition h-20 resize-none"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Long Description
            </label>
            <textarea
              name="longDescription"
              value={form.longDescription}
              placeholder="Detailed overview of features, workflows, and integrations"
              onChange={onChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition h-32"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Differentiation / Secret Sauce
            </label>
            <textarea
              name="differentiation"
              value={form.differentiation}
              placeholder="What makes your tool uniquely better than alternatives?"
              onChange={onChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Pricing Model <span className="text-red-500">*</span>
            </label>
            <select
              name="pricingType"
              value={form.pricingType}
              onChange={onChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition bg-white"
            >
              <option value="FREE">Free</option>
              <option value="PAID">Paid</option>
              <option value="FREEMIUM">Freemium</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Hashtags / Keywords
            </label>
            <input
              name="hashtags"
              value={form.hashtags}
              placeholder="e.g. copywriting, gpt4, marketing"
              onChange={onChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Pricing Details (Optional)
            </label>
            <textarea
              name="pricingDetails"
              value={form.pricingDetails}
              placeholder="e.g. $19/mo starter plan, free tier with 50 credits/month"
              onChange={onChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition h-20 resize-none"
            />
          </div>

          <DynamicListInput
            label="Unique Features"
            placeholder="e.g. Instant voice cloning with zero latency"
            values={form.uniqueFeatures}
            setValues={(v) => setForm((p) => ({ ...p, uniqueFeatures: v }))}
          />

          <DynamicListInput
            label="Pros"
            placeholder="e.g. Extremely high throughput and clean UI"
            values={form.pros}
            setValues={(v) => setForm((p) => ({ ...p, pros: v }))}
          />

          <DynamicListInput
            label="Cons"
            placeholder="e.g. Advanced features require paid plan"
            values={form.cons}
            setValues={(v) => setForm((p) => ({ ...p, cons: v }))}
          />

          <DynamicListInput
            label="Use Cases"
            placeholder="e.g. Automating daily newsletter summaries"
            values={form.useCases}
            setValues={(v) => setForm((p) => ({ ...p, useCases: v }))}
          />
        </div>

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-semibold disabled:opacity-60 transition shadow-sm hover:shadow flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting tool...</span>
            </>
          ) : (
            "Submit Tool for Review"
          )}
        </button>
      </form>
    </div>
  );
}