import DashboardSearchBar from "@/components/DashboardSearchBar";

export default function DashboardPage() {
  return (
    <>
      {/* 🔍 Sticky Search Bar (Below Navbar) */}
      <DashboardSearchBar />

      {/* ✅ SECTION 1: Hero Section */}
      <section className="w-full bg-gradient-to-r from-gray-50 to-white py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Discover the Best AI Tools
          </h1>

          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore, compare and find the perfect AI tool for your workflow.
          </p>

          <button className="mt-8 rounded-xl bg-black px-8 py-3 text-white font-semibold hover:bg-gray-800 transition">
            Explore Tools
          </button>
        </div>
      </section>

      {/* ✅ SECTION 2: Popular Tools Section */}
      <section className="w-full py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Popular AI Tools
          </h2>

          <p className="mt-2 text-gray-600">
            Trending tools that users are comparing today.
          </p>

          {/* Tool Cards */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border p-6 hover:shadow-md transition">
              <h3 className="font-semibold text-lg">ChatGPT</h3>
              <p className="mt-2 text-sm text-gray-600">
                Best for AI chat & writing assistance.
              </p>
            </div>

            <div className="rounded-2xl border p-6 hover:shadow-md transition">
              <h3 className="font-semibold text-lg">Midjourney</h3>
              <p className="mt-2 text-sm text-gray-600">
                Top AI tool for image generation.
              </p>
            </div>

            <div className="rounded-2xl border p-6 hover:shadow-md transition">
              <h3 className="font-semibold text-lg">Jasper AI</h3>
              <p className="mt-2 text-sm text-gray-600">
                AI copywriting tool for marketers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}