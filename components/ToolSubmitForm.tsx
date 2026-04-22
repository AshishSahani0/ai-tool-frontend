"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast/ToastContext";
import { auth } from "@/lib/firebase";

import { getCategories, getSubCategories } from "@/lib/api/categories";
import { uploadToolLogo } from "@/lib/api/media";
import { submitTool } from "@/lib/api/tools";

type PricingType = "FREE" | "PAID" | "FREEMIUM";
type Category = { id: string; name: string };
type SubCategory = { id: string; name: string };

//////////////////////////////////////////////////////////
// Reusable Dynamic Input
//////////////////////////////////////////////////////////

function DynamicListInput({
  label,
  values,
  setValues,
}: {
  label: string;
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
      <label className="text-sm font-medium">{label}</label>

      {values.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={v}
            onChange={(e) => updateValue(i, e.target.value)}
            placeholder={`Enter ${label.toLowerCase()} sentence`}
            className="input-box flex-1"
          />

          {values.length > 1 && (
            <button
              type="button"
              onClick={() => removeField(i)}
              className="px-3 bg-red-500 text-white rounded"
            >
              ✕
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addField}
        className="text-sm text-blue-600 font-medium"
      >
        + Add another
      </button>
    </div>
  );
}

//////////////////////////////////////////////////////////
// Main Component
//////////////////////////////////////////////////////////

export default function ToolSubmitForm() {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
  } | null>(null);

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

  //////////////////////////////////////////////////////////
  // Auth state
  //////////////////////////////////////////////////////////

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) return setUserInfo(null);

      setUserInfo({
        name: user.displayName || "Unknown User",
        email: user.email || "",
      });
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////////
  // Load Categories
  //////////////////////////////////////////////////////////

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => showToast("Failed to load categories", "error"));
  }, []);

  //////////////////////////////////////////////////////////
  // Load Subcategories
  //////////////////////////////////////////////////////////

  useEffect(() => {
    if (!form.categoryId) return setSubCategories([]);

    getSubCategories(form.categoryId)
      .then(setSubCategories)
      .catch(() => showToast("Failed to load subcategories", "error"));
  }, [form.categoryId]);

  //////////////////////////////////////////////////////////
  // Input Change
  //////////////////////////////////////////////////////////

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  //////////////////////////////////////////////////////////
  // Logo Upload (API separated)
  //////////////////////////////////////////////////////////

  const handleLogoUpload = async (file: File) => {
    try {
      setUploading(true);
      const key = await uploadToolLogo(file);
      setForm((p) => ({ ...p, logoKey: key }));
    } catch {
      showToast("Logo upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  //////////////////////////////////////////////////////////
  // Submit (API separated)
  //////////////////////////////////////////////////////////

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      showToast("Please login to submit 🔐", "error");
      return;
    }

    if (
      !form.name.trim() ||
      !form.website.trim() ||
      !form.shortDescription.trim() ||
      !form.categoryId ||
      !form.subCategoryId
    ) {
      showToast("Please fill required fields", "error");
      return;
    }

    setLoading(true);

    try {
      await submitTool({
        name: form.name.trim(),
        website: form.website.trim(),
        shortDescription: form.shortDescription.trim(),
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

      showToast("Tool submitted successfully 🎉", "success");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch {
      showToast("Submission failed", "error");
    } finally {
      setLoading(false);
    }
  };

  //////////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////////

  return (
    <div className="bg-white rounded-2xl shadow p-10 space-y-8">
      <h2 className="text-2xl font-semibold">Submit Your AI Tool</h2>

      {userInfo && (
        <div className="rounded-xl border bg-gray-50 p-4 text-sm">
          <p><strong>Name:</strong> {userInfo.name}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="md:col-span-2">
          <label className="text-sm font-medium">AI Tool Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files && handleLogoUpload(e.target.files[0])
            }
          />
          {uploading && <p className="text-sm">Uploading…</p>}
        </div>

        <input name="name" placeholder="Tool name *" onChange={onChange} className="input-box" />
        <input name="website" placeholder="Website URL *" onChange={onChange} className="input-box" />

        <select name="categoryId" value={form.categoryId} onChange={onChange} className="input-box">
          <option value="">Select category *</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          name="subCategoryId"
          value={form.subCategoryId}
          onChange={onChange}
          className="input-box"
          disabled={!form.categoryId}
        >
          <option value="">Select subcategory *</option>
          {subCategories.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <textarea name="shortDescription" placeholder="Short description *" onChange={onChange} className="input-box md:col-span-2 h-20" />
        <textarea name="longDescription" placeholder="Long description" onChange={onChange} className="input-box md:col-span-2 h-32" />
        <textarea name="differentiation" placeholder="How is it different?" onChange={onChange} className="input-box md:col-span-2 h-24" />

        <input name="hashtags" placeholder="Hashtags (comma separated)" onChange={onChange} className="input-box" />

        <select name="pricingType" onChange={onChange} className="input-box">
          <option value="FREE">Free</option>
          <option value="PAID">Paid</option>
          <option value="FREEMIUM">Freemium</option>
        </select>

        <textarea name="pricingDetails" placeholder="Pricing details" onChange={onChange} className="input-box md:col-span-2 h-20" />

        <DynamicListInput
          label="Unique Features"
          values={form.uniqueFeatures}
          setValues={(v) => setForm((p) => ({ ...p, uniqueFeatures: v }))}
        />

        <DynamicListInput
          label="Pros"
          values={form.pros}
          setValues={(v) => setForm((p) => ({ ...p, pros: v }))}
        />

        <DynamicListInput
          label="Cons"
          values={form.cons}
          setValues={(v) => setForm((p) => ({ ...p, cons: v }))}
        />

        <DynamicListInput
          label="Use Cases"
          values={form.useCases}
          setValues={(v) => setForm((p) => ({ ...p, useCases: v }))}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-black text-white py-4 rounded-xl font-semibold disabled:opacity-60"
      >
        {loading ? "Submitting…" : "Submit Tool"}
      </button>
    </div>
  );
}