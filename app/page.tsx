import SupabaseStatusBadge from '@/components/supabase-status-badge'

export default function HomePage() {
  return (
    <>
      <SupabaseStatusBadge />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center px-4">
        {/* Hero Section */}
        <section className="w-full max-w-2xl text-center mt-20 mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-orange-700 mb-4 drop-shadow-sm">
            RecipeShare
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-6">
            Discover, share, and create amazing recipes with a vibrant cooking community.
          </p>
          <a
            href="/login"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-lg shadow transition mb-2"
          >
            Get Started
          </a>
        </section>
        {/* Features Section */}
        <section className="w-full max-w-3xl grid gap-8 md:grid-cols-2 mb-16">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-3xl mb-2">🔐</span>
            <h2 className="font-bold text-lg mb-1 text-gray-900">Authentication</h2>
            <p className="text-gray-600 text-center text-sm">
              Sign up, log in, and manage your profile securely with Supabase authentication.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-3xl mb-2">🍲</span>
            <h2 className="font-bold text-lg mb-1 text-gray-900">Recipe Management</h2>
            <p className="text-gray-600 text-center text-sm">
              Upload, edit, and delete your own recipes with images, ingredients, and steps.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-3xl mb-2">🔎</span>
            <h2 className="font-bold text-lg mb-1 text-gray-900">Browse & Search</h2>
            <p className="text-gray-600 text-center text-sm">
              Find recipes by title, ingredient, category, or prep time. See trending and recent recipes.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-3xl mb-2">👤</span>
            <h2 className="font-bold text-lg mb-1 text-gray-900">User Profiles</h2>
            <p className="text-gray-600 text-center text-sm">
              View user profiles and explore all the recipes they&apos;ve shared with the community.
            </p>
          </div>
        </section>
        {/* Placeholder for Recipe Browsing/Search */}
        <section className="w-full max-w-xl mb-24">
          <div className="bg-white/80 rounded-lg shadow p-6 flex flex-col items-center">
            <h3 className="font-semibold text-lg mb-2 text-gray-800">Browse Recipes</h3>
            <input
              type="text"
              placeholder="Search recipes by title or ingredient..."
              className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              disabled
            />
            <p className="text-gray-400 text-sm">Recipe search and browsing coming soon!</p>
          </div>
        </section>
      </main>
    </>
  );
}
