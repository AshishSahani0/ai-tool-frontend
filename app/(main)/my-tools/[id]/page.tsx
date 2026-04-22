"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";
import { useToast } from "@/components/toast/ToastContext";
import { getCategories, getSubCategories } from "@/lib/api/categories";
import { uploadToolLogo } from "@/lib/api/media";


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
};

//////////////////////////////////////////////////////////
// Dynamic List
//////////////////////////////////////////////////////////

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
  const safeValues = Array.isArray(values) ? values : [""];

  const updateValue = (index: number, value: string) => {
    const updated = [...safeValues];
    updated[index] = value;
    setValues(updated);
  };

  const addField = () => setValues([...safeValues, ""]);
  const removeField = (index: number) =>
    setValues(safeValues.filter((_, i) => i !== index) || [""]);

  return (
    <div className="md:col-span-2 space-y-2">
      <label className="text-sm font-medium">{label}</label>

      {safeValues.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={v}
            disabled={disabled}
            onChange={(e) => updateValue(i, e.target.value)}
            className="input-box flex-1"
          />

          {!disabled && safeValues.length > 1 && (
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

      {!disabled && (
        <button
          type="button"
          onClick={addField}
          className="text-sm text-blue-600 font-medium"
        >
          + Add another
        </button>
      )}
    </div>
  );
}

//////////////////////////////////////////////////////////
// Main Page
//////////////////////////////////////////////////////////

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

  //////////////////////////////////////////////////////////
  // Load Tool (SAFE VERSION)
  //////////////////////////////////////////////////////////

  useEffect(() => {
    apiFetch<Tool>(`/api/user/tools/${id}`)
      .then((data) => {
        setTool(data);

        setForm({
          ...data,

          hashtags: data.hashtags?.join(", ") || "",

          pros: data.pros ?? [""],
          cons: data.cons ?? [""],
          useCases: data.useCases ?? [""],
          uniqueFeatures: data.uniqueFeatures ?? [""],

          pricingDetails: data.pricingDetails ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  //////////////////////////////////////////////////////////
  // Categories
  //////////////////////////////////////////////////////////

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!form?.categoryId) return;
    getSubCategories(form.categoryId).then(setSubCategories);
  }, [form?.categoryId]);

  //////////////////////////////////////////////////////////
  // Change
  //////////////////////////////////////////////////////////

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((p: any) => ({ ...p, [name]: value }));
  };

  //////////////////////////////////////////////////////////
  // Logo Upload
  //////////////////////////////////////////////////////////

  const handleLogoUpload = async (file: File) => {
    if (!editable) return;

    try {
      setUploading(true);
      const key = await uploadToolLogo(file);
      setForm((p: any) => ({ ...p, logoKey: key }));
    } catch {
      showToast("Logo upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  //////////////////////////////////////////////////////////
  // Save
  //////////////////////////////////////////////////////////

  const save = async () => {
    if (!editable) return;

    setSaving(true);

    await apiFetch(`/api/user/tools/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...form,
        hashtags: form.hashtags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean),
      }),
    });

    showToast("Tool updated successfully", "success");
    router.push("/my-tools");
  };

  //////////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////////

  if (loading) return <p className="p-10">Loading…</p>;
  if (!form) return null;

  return (
   
      <div className="max-w-5xl mx-auto p-10 space-y-8">
        <h1 className="text-3xl font-bold">Tool Details</h1>

        {tool?.approvalStatus === "APPROVED" && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-green-700">
            ✅ Approved tool (Read Only)
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="md:col-span-2">
            <label>Tool Logo</label>
            <input
              type="file"
              disabled={!editable}
              onChange={(e) =>
                e.target.files && handleLogoUpload(e.target.files[0])
              }
            />
            {uploading && <p>Uploading…</p>}
          </div>

          <input name="name" value={form.name} onChange={onChange} disabled={!editable} className="input-box" />
          <input name="website" value={form.website} onChange={onChange} disabled={!editable} className="input-box" />

          <select name="categoryId" value={form.categoryId} onChange={onChange} disabled={!editable} className="input-box">
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select name="subCategoryId" value={form.subCategoryId} onChange={onChange} disabled={!editable} className="input-box">
            <option value="">Select subcategory</option>
            {subCategories.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <textarea name="shortDescription" value={form.shortDescription} onChange={onChange} disabled={!editable} className="input-box md:col-span-2 h-20" />
          <textarea name="longDescription" value={form.longDescription} onChange={onChange} disabled={!editable} className="input-box md:col-span-2 h-32" />
          <textarea name="differentiation" value={form.differentiation} onChange={onChange} disabled={!editable} className="input-box md:col-span-2 h-24" />

          <input name="hashtags" value={form.hashtags} onChange={onChange} disabled={!editable} className="input-box" />

          <select name="pricingType" value={form.pricingType} onChange={onChange} disabled={!editable} className="input-box">
            <option value="FREE">Free</option>
            <option value="PAID">Paid</option>
            <option value="FREEMIUM">Freemium</option>
          </select>

          <textarea name="pricingDetails" value={form.pricingDetails} onChange={onChange} disabled={!editable} className="input-box md:col-span-2 h-20" />

          <DynamicListInput label="Unique Features" values={form.uniqueFeatures} setValues={(v) => setForm((p: any) => ({ ...p, uniqueFeatures: v }))} disabled={!editable} />
          <DynamicListInput label="Pros" values={form.pros} setValues={(v) => setForm((p: any) => ({ ...p, pros: v }))} disabled={!editable} />
          <DynamicListInput label="Cons" values={form.cons} setValues={(v) => setForm((p: any) => ({ ...p, cons: v }))} disabled={!editable} />
          <DynamicListInput label="Use Cases" values={form.useCases} setValues={(v) => setForm((p: any) => ({ ...p, useCases: v }))} disabled={!editable} />

        </div>

        {editable ? (
          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-black text-white py-4 rounded-xl font-semibold"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        ) : (
          <button
            disabled
            className="w-full bg-gray-400 text-white py-4 rounded-xl cursor-not-allowed"
          >
            Approved Tool (Read Only)
          </button>
        )}
      </div>
    
  );
}