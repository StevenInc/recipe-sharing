'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Recipe } from '@/lib/types/database';

interface FavoriteRecipe extends Recipe {
  profiles: {
    full_name: string;
    username: string;
  };
}

export default function FavoritesPage() {
  const [favoriteRecipes, setFavoriteRecipes] = useState<FavoriteRecipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<FavoriteRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const router = useRouter();
  const supabase = createClient();

  const CATEGORIES = [
    'All',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Dessert',
    'Snack',
    'Drink',
  ];

  useEffect(() => {
    const fetchFavoriteRecipes = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace('/login');
        return;
      }

      // Fetch favorite recipe IDs first
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('recipe_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (favoritesError) {
        console.error('Error fetching favorites:', favoritesError);
        setError('Failed to load favorite recipes');
        setLoading(false);
        return;
      }

      if (!favoritesData || favoritesData.length === 0) {
        setFavoriteRecipes([]);
        setFilteredRecipes([]);
        setLoading(false);
        return;
      }

      // Extract recipe IDs
      const recipeIds = favoritesData.map(fav => fav.recipe_id);

      // Fetch the actual recipes
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select(`
          id,
          title,
          description,
          ingredients,
          instructions,
          category,
          cooking_time,
          difficulty,
          image_url,
          created_at,
          user_id
        `)
        .in('id', recipeIds)
        .order('created_at', { ascending: false });

      if (recipesError) {
        console.error('Error fetching recipes:', recipesError);
        setError('Failed to load favorite recipes');
      } else {
        // Transform the data to match FavoriteRecipe interface
        const recipes: FavoriteRecipe[] = (recipesData || []).map(recipe => ({
          id: recipe.id as string,
          title: recipe.title as string,
          description: recipe.description as string | null,
          ingredients: recipe.ingredients as string[],
          instructions: recipe.instructions as string[],
          category: recipe.category as string,
          cooking_time: recipe.cooking_time as number | null,
          difficulty: recipe.difficulty as 'easy' | 'medium' | 'hard' | null,
          image_url: recipe.image_url as string | null,
          created_at: recipe.created_at as string,
          user_id: recipe.user_id as string,
          profiles: {
            full_name: 'Unknown User', // We'll handle this separately if needed
            username: 'unknown'
          }
        }));
        setFavoriteRecipes(recipes);
        setFilteredRecipes(recipes);
      }
      setLoading(false);
    };

    fetchFavoriteRecipes();
  }, [supabase, router]);

  // Filter recipes based on search and category
  useEffect(() => {
    let filtered = favoriteRecipes;

    // Filter by search term
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.description?.toLowerCase().includes(searchLower) ||
        recipe.ingredients.some(ingredient =>
          ingredient.toLowerCase().includes(searchLower)
        )
      );
    }

    // Filter by category
    if (category !== 'All') {
      filtered = filtered.filter(recipe => recipe.category === category);
    }

    setFilteredRecipes(filtered);
  }, [favoriteRecipes, search, category]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">My Favorite Recipes</h1>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">My Favorite Recipes</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">My Favorite Recipes</h1>

        {favoriteRecipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No favorite recipes yet</h2>
            <p className="text-gray-500 mb-6">Start exploring recipes and like the ones you love!</p>
            <Link
              href="/dashboard"
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Browse Recipes
            </Link>
          </div>
        ) : (
          <>
            {/* Search and Filter Controls */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search your favorite recipes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>

                {/* Category Filter */}
                <div className="sm:w-48">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-600">
                Showing {filteredRecipes.length} of {favoriteRecipes.length} favorite recipes
              </div>
            </div>

            {/* Recipe Grid */}
            {filteredRecipes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">No recipes found</h2>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => {
                    setSearch('');
                    setCategory('All');
                  }}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredRecipes.map((recipe) => (
                  <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {recipe.image_url && (
                      <Image
                        src={recipe.image_url}
                        alt={recipe.title}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">
                        <Link href={`/recipes/${recipe.id}`} className="hover:text-orange-600 transition-colors">
                          {recipe.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {recipe.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                          {recipe.category}
                        </span>
                        <span>
                          by <Link href={`/profiles/${recipe.user_id}`} className="text-orange-600 hover:text-orange-700 underline">{recipe.profiles?.full_name || recipe.profiles?.username || 'Anonymous'}</Link>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(recipe.created_at).toLocaleDateString()}
                        </span>
                        <Link
                          href={`/recipes/${recipe.id}`}
                          className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                        >
                          View Recipe →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}