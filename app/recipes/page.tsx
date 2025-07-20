'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Recipe } from '@/lib/types/database';

function RecipesContent() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const searchParams = useSearchParams();

  const CATEGORIES = [
    'All',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Dessert',
    'Snack',
    'Drink',
  ];

  const supabase = createClient();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        let query = supabase
          .from('recipes')
          .select('*')
          .order('created_at', { ascending: false });

        // Apply category filter
        if (category !== 'All') {
          query = query.eq('category', category);
        }

        const { data: recipeData, error: recipeError } = await query;

        if (recipeError) {
          setError(recipeError.message);
        } else {
          const recipes: Recipe[] = (recipeData || []).map(recipe => ({
            id: recipe.id as string,
            created_at: recipe.created_at as string,
            user_id: recipe.user_id as string,
            title: recipe.title as string,
            description: recipe.description as string | null,
            ingredients: recipe.ingredients as string[],
            cooking_time: recipe.cooking_time as number | null,
            difficulty: recipe.difficulty as 'easy' | 'medium' | 'hard' | null,
            category: recipe.category as string,
            instructions: recipe.instructions as string[],
            image_url: recipe.image_url as string | null
          }));
          setRecipes(recipes);
        }
      } catch {
        setError('Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [category, supabase]);

  // Handle search from URL params
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearch(searchQuery);
    }
  }, [searchParams]);

  // Filter recipes based on search
  const filteredRecipes = recipes.filter(recipe => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    return (
      recipe.title.toLowerCase().includes(searchLower) ||
      recipe.description?.toLowerCase().includes(searchLower) ||
      recipe.ingredients.some(ingredient =>
        ingredient.toLowerCase().includes(searchLower)
      ) ||
      recipe.category.toLowerCase().includes(searchLower)
    );
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by filtering the already loaded recipes
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Loading recipes...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">
      Error: {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Browse Recipes
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover amazing recipes from our community. Sign in to save favorites and add your own recipes!
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search recipes by title, ingredient, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-900 placeholder-gray-500"
              />
            </div>
            <div className="md:w-48">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-900"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Recipe Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">No recipes found</p>
            <p className="text-gray-400">Try adjusting your search or category filter</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                {recipe.image_url && (
                  <div className="relative h-48 bg-gray-200">
                    <Image
                      src={recipe.image_url}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      {recipe.category}
                    </span>
                    {recipe.cooking_time && (
                      <span className="text-sm text-gray-500">
                        {recipe.cooking_time} min
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {recipe.title}
                  </h3>
                  {recipe.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/recipes/${recipe.id}`}
                      className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                    >
                      View Recipe →
                    </Link>
                    {recipe.difficulty && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        recipe.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {recipe.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Want to save favorites and add your own recipes?
            </h2>
            <p className="text-gray-600 mb-6">
              Sign up for free to create your own recipes, save favorites, and join our cooking community!
            </p>
            <Link
              href="/login"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-lg shadow transition"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecipesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading recipes...</div>
      </div>
    }>
      <RecipesContent />
    </Suspense>
  );
}