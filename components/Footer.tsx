export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-800 bg-black">
      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* Top Section */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">

          {/* Brand */}
          <div>
            <h2 className="text-xl font-bold text-white">
              AItoolHub
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              Discover, compare and explore the best AI tools in one place.
            </p>
          </div>

          {/* Explore Links */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              Explore
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li className="cursor-pointer hover:text-white">AI Tools</li>
              <li className="cursor-pointer hover:text-white">Categories</li>
              <li className="cursor-pointer hover:text-white">Compare Tools</li>
              <li className="cursor-pointer hover:text-white">Trending</li>
            </ul>
          </div>

          {/* Premium Links */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              Premium
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li className="cursor-pointer hover:text-white">Export PDF</li>
              <li className="cursor-pointer hover:text-white">Saved Tools</li>
              <li className="cursor-pointer hover:text-white">Subscriptions</li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              Support
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li className="cursor-pointer hover:text-white">Help Center</li>
              <li className="cursor-pointer hover:text-white">Contact Us</li>
              <li className="cursor-pointer hover:text-white">Privacy Policy</li>
              <li className="cursor-pointer hover:text-white">Terms of Service</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-6 text-sm text-gray-500 md:flex-row">
          <p>© {new Date().getFullYear()} AItoolHub. All rights reserved.</p>

          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-white">Twitter</span>
            <span className="cursor-pointer hover:text-white">LinkedIn</span>
            <span className="cursor-pointer hover:text-white">GitHub</span>
          </div>
        </div>

      </div>
    </footer>
  );
}