// components/ToolCategoryCard.tsx
import Link from "next/link";

type SubCategory = {
  id: string;
  name: string;
  toolCount: number;
};

type Props = {
  title: string;
  imageUrl: string;
  subCategories: SubCategory[];
};

export default function ToolCategoryCard({
  title,
  imageUrl,
  subCategories,
}: Props) {
  return (
    <div className="group bg-white rounded-xl p-6 border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex gap-6">
        {/* Image */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-lg bg-blue-200 blur-xl opacity-30 group-hover:opacity-50 transition" />
          <img
            src={imageUrl}
            alt={title}
            className="relative z-10 w-28 h-28 object-contain"
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            {title}
          </h2>

          {/* Subcategories */}
          <ul className="space-y-1 text-slate-600">
            {subCategories.slice(0, 5).map((s) => (
              <li key={s.id}>
                <Link
                  href={`/tools/subcategory/${s.id}`}
                  className="flex items-center justify-between hover:text-blue-600"
                >
                  <span>{s.name}</span>
                  <span className="text-slate-400 text-sm">
                    ({s.toolCount})
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <span className="inline-block mt-4 text-blue-600 font-medium">
            Show all {title}
          </span>
        </div>
      </div>
    </div>
  );
}