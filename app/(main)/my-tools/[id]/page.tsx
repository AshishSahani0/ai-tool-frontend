"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";
import { useToast } from "@/components/toast/ToastContext";
import { getCategories, getSubCategories } from "@/lib/api/categories";
import { uploadToolLogo } from "@/lib/api/media";
import { ArrowLeft, CheckCircle2, AlertTriangle, Loader2, UploadCloud, X, Plus } from "lucide-react";
import Link from "next/link";

type PricingType = "FREE" | "PAID" | "FREEMIUM";
type ToolStatus = "PENDING" | "APPROVED" | "REJECTED";

type Category = { id: string; name: string };
type SubCategory = { id: string; name: string };

type Tool = {
  id: string;
  name: string;
  website: string;
  shortDescription: string;
  longDescription: string;
  differentiation: string;
  logoKey?: string;

  categoryId: string;
  subCategoryId: string;

  hashtags?: string[] | null;
  pricingType: PricingType;
  pricingDetails?: string | null;

  pros?: string[] | null;
  cons?: string[] | null;
  useCases?: string[] | null;
  uniqueFeatures?: string[] | null;

  approvalStatus: ToolStatus;
  rejectionReason?: string;
};

function DynamicListInput({
  label,
  values = [],
  setValues,
  disabled,
}: {
  label: string;
  values?: string[] | null;
  setValues: (v: string[]) => void;
  disabled?: boolean;
}) {
  const safeValues = Array.isArray(values) && values.length ? values : [""];

  const updateValue = (index: number, value: string) => {
    const updated = [...safeValues];
    updated[index] = value;
    setValues(updated);
  };

  const addField = () => setValues([...safeValues, ""]);
  const removeField = (index: number) => {
    const updated = safeValues.filter((_, i) => i !== index);
    setValues(updated.length ? updated : [""]);
  };

  return (
    <div className="md:col-span-2 space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      {safeValues.map((v, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            value={v}
            disabled={disabled}
            onChange={(e) => updateValue(i, e.target.value)}
            placeholder={`Enter ${label.toLowerCase()} item`}
            className="input-box flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition disabled:bg-slate-50 disabled:text-slate-500"
          />

          {!disabled && safeValues.length > 1 && (
            <button
              type="button"
              onClick={() => removeField(i)}
              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
              aria-label="Remove"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ))}

      {!disabled && (
        <button
          type="button"
          onClick={addField}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
        >
          <Plus size={14} /> Add another
        </button>
      )}
    </div>
  );
}

export default function MyToolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();

  const [tool, setTool] = useState<Tool | null>(null);
  const [form, setForm] = useState<any>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const editable = tool?.approvalStatus !== "APPROVED";

  useEffect(() => {
    apiFetch<Tool>(`/api/user/tools/${id}`)
      .then((data) => {
        setTool(data);

        setForm({
          ...data,
          name: data.name || "",
          website: data.website || "",
          shortDescription: data.shortDescription || "",
          longDescription: data.longDescription || "",
          differentiation: data.differentiation || "",
          categoryId: data.categoryId || "",
          subCategoryId: data.subCategoryId || "",
          pricingType: data.pricingType || "FREE",
          logoKey: data.logoKey || "",
          hashtags: data.hashtags?.join(", ") || "",
          pros: data.pros && data.pros.length ? data.pros : [""],
          cons: data.cons && data.cons.length ? data.cons : [""],
          useCases: data.useCases && data.useCases.length ? data.useCases : [""],
          uniqueFeatures: data.uniqueFeatures && data.uniqueFeatures.length ? data.uniqueFeatures : [""],
          pricingDetails: data.pricingDetails || "",
        });
      })
      .catch((err) => {
        console.error("Failed to load tool:", err);
        showToast("Failed to load tool details", "error");
      })
      .finally(() => setLoading(false));
  }, [id, showToast]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (!form?.categoryId) {
      setSubCategories([]);
      return;
    }
    getSubCategories(form.categoryId).then(setSubCategories).catch(console.error);
  }, [form?.categoryId]);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "categoryId") {
      setForm((p: any) => ({ ...p, categoryId: value, subCategoryId: "" }));
    } else {
      setForm((p: any) => ({ ...p, [name]: value }));
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!editable || !file) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast("Logo must be under 5MB", "error");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      showToast("Only JPG, PNG, WEBP, and SVG formats are supported", "error");
      return;
    }

    try {
      setUploading(true);
      const key = await uploadToolLogo(file);
      setForm((p: any) => ({ ...p, logoKey: key }));
      showToast("Logo updated successfully", "success");
    } catch {
      showToast("Logo upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editable) return;

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
      showToast("Category is required", "error");
      return;
    }

    if (!form.subCategoryId) {
      showToast("Subcategory is required", "error");
      return;
    }

    setSaving(true);

    try {
      await apiFetch(`/api/user/tools/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: trimmedName,
          website: trimmedWebsite,
          shortDescription: trimmedShortDesc,
          longDescription: form.longDescription ? form.longDescription.trim() : "",
          differentiation: form.differentiation ? form.differentiation.trim() : "",
          logoKey: form.logoKey,
          categoryId: form.categoryId,
          subCategoryId: form.subCategoryId,
          pricingType: form.pricingType,
          pricingDetails: form.pricingDetails ? form.pricingDetails.trim() : "",
          hashtags: form.hashtags
            ? form.hashtags
                .split(",")
                .map((t: string) => t.trim())
                .filter(Boolean)
            : [],
          pros: form.pros ? form.pros.map((p: string) => p.trim()).filter(Boolean) : [],
          cons: form.cons ? form.cons.map((c: string) => c.trim()).filter(Boolean) : [],
          useCases: form.useCases ? form.useCases.map((u: string) => u.trim()).filter(Boolean) : [],
          uniqueFeatures: form.uniqueFeatures
            ? form.uniqueFeatures.map((f: string) => f.trim()).filter(Boolean)
            : [],
        }),
      });

      showToast("Tool updated! It will be re-reviewed by moderators 🎉", "success");
      router.push("/my-tools");
    } catch (err: any) {
      const msg = err?.message || "Failed to save tool changes.";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 flex items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading tool details...</span>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 text-center space-y-4">
        <p className="text-slate-500">Tool not found or unauthorized.</p>
        <Link
          href="/my-tools"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={16} /> Back to My Tools
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/my-tools"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Tool</h1>
          <p className="text-xs text-slate-500">Edit listing details, media, and features</p>
        </div>
      </div>

      {tool?.approvalStatus === "APPROVED" && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-semibold">Approved & Publicly Live</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              This tool has been verified and published. To maintain data integrity, approved tools cannot be edited directly.
            </p>
          </div>
        </div>
      )}

      {tool?.approvalStatus === "REJECTED" && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-800 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Submission Needs Revisions</p>
            <p className="text-xs text-rose-700 mt-0.5">
              Reason: {tool.rejectionReason || "Please update the details according to submission guidelines."}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={save} className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* LOGO */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tool Logo</label>
            <div className="flex items-center gap-4">
              <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 ${editable ? "cursor-pointer hover:bg-slate-50" : "opacity-50 cursor-not-allowed"}`}>
                <UploadCloud size={18} className="text-slate-500" />
                <span>{uploading ? "Uploading..." : "Replace Logo"}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  disabled={!editable || uploading}
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && handleLogoUpload(e.target.files[0])
                  }
                />
              </label>
              {form.logoKey && (
                <span className="text-xs text-slate-500 font-mono truncate max-w-xs">
                  Key: {form.logoKey}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tool Name</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              disabled={!editable}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition disabled:bg-slate-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Website URL</label>
            <input
              name="website"
              value={form.website}
              onChange={onChange}
              disabled={!editable}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition disabled:bg-slate-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={onChange}
              disabled={!editable}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition bg-white disabled:bg-slate-50"
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subcategory</label>
            <select
              name="subCategoryId"
              value={form.subCategoryId}
              onChange={onChange}
              disabled={!editable || !form.categoryId}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition bg-white disabled:bg-slate-50"
              required
            >
              <option value="">Select subcategory</option>
              {subCategories.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Short Description</label>
            <textarea
              name="shortDescription"
              value={form.shortDescription}
              onChange={onChange}
              disabled={!editable}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition h-20 resize-none disabled:bg-slate-50"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Long Description</label>
            <textarea
              name="longDescription"
              value={form.longDescription}
              onChange={onChange}
              disabled={!editable}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition h-32 disabled:bg-slate-50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Differentiation</label>
            <textarea
              name="differentiation"
              value={form.differentiation}
              onChange={onChange}
              disabled={!editable}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition h-24 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pricing Model</label>
            <select
              name="pricingType"
              value={form.pricingType}
              onChange={onChange}
              disabled={!editable}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition bg-white disabled:bg-slate-50"
            >
              <option value="FREE">Free</option>
              <option value="PAID">Paid</option>
              <option value="FREEMIUM">Freemium</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hashtags</label>
            <input
              name="hashtags"
              value={form.hashtags}
              onChange={onChange}
              disabled={!editable}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition disabled:bg-slate-50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pricing Details</label>
            <textarea
              name="pricingDetails"
              value={form.pricingDetails}
              onChange={onChange}
              disabled={!editable}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition h-20 resize-none disabled:bg-slate-50"
            />
          </div>

          <DynamicListInput label="Unique Features" values={form.uniqueFeatures} setValues={(v) => setForm((p: any) => ({ ...p, uniqueFeatures: v }))} disabled={!editable} />
          <DynamicListInput label="Pros" values={form.pros} setValues={(v) => setForm((p: any) => ({ ...p, pros: v }))} disabled={!editable} />
          <DynamicListInput label="Cons" values={form.cons} setValues={(v) => setForm((p: any) => ({ ...p, cons: v }))} disabled={!editable} />
          <DynamicListInput label="Use Cases" values={form.useCases} setValues={(v) => setForm((p: any) => ({ ...p, useCases: v }))} disabled={!editable} />
        </div>

        {editable ? (
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving changes...</span>
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        ) : (
          <div className="w-full bg-slate-100 text-slate-500 py-3.5 rounded-xl font-semibold text-center text-sm border">
            Approved Tool (Read Only)
          </div>
        )}
      </form>
    </div>
  );
}