'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Recipe } from '@/lib/types/database'
import LikeButton from '@/components/like-button';

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const CATEGORIES = [
    'All',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Dessert',
    'Snack',
    'Drink',
  ];
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchProfileAndRecipes = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.replace('/login')
        return
      }
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (profileError) {
        setError(profileError.message)
      } else {
        const profile: Profile = {
          id: profileData.id as string,
          created_at: profileData.created_at as string,
          username: profileData.username as string,
          full_name: profileData.full_name as string,
          updated_at: profileData.updated_at as string,
          email: profileData.email as string,
          bio: profileData.bio as string | null
        };
        setProfile(profile)
      }
      // Fetch all recipes (not just user's)
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })
      if (recipeError) {
        setError(recipeError.message)
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
        setRecipes(recipes)
      }
      setLoading(false)
    }
    fetchProfileAndRecipes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  if (!profile) return null

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md mb-8">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Welcome, {profile.full_name || profile.username}!</h1>
        <div className="text-gray-700 mb-4">Email: {profile.email}</div>
        <div className="text-gray-700 mb-4">Username: {profile.username}</div>
        <button
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded transition"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">My Recipes</h2>
          <button
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded transition"
            onClick={() => router.push('/dashboard/add-recipe')}
          >
            Add Recipe
          </button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
          <input
            type="text"
            className="w-full sm:basis-3/4 p-2 border border-gray-300 rounded h-10 focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-900 placeholder-gray-500"
            placeholder="Search recipes by title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="w-full sm:basis-1/4 p-2 border border-gray-300 rounded h-10 focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-900"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        {recipes.length === 0 ? (
          <div className="bg-white rounded shadow p-6 text-gray-400 text-center">
            (No recipes yet)
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recipes
              .filter(recipe =>
                recipe.title.toLowerCase().includes(search.toLowerCase()) &&
                (category === 'All' || recipe.category === category)
              )
              .map(recipe => (
                <div
                  key={recipe.id}
                  className="bg-white rounded-xl shadow p-4 flex flex-col cursor-pointer hover:shadow-lg transition"
                  onClick={() => router.push(`/recipes/${recipe.id}`)}
                >
                  {recipe.image_url ? (
                    <Image
                      src={recipe.image_url}
                      alt={recipe.title}
                      width={320}
                      height={200}
                      className="w-full h-40 object-cover rounded mb-3"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400 text-4xl">🍲</div>
                  )}
                  <h3 className="font-bold text-lg mb-1 truncate text-gray-900">{recipe.title}</h3>
                  <div className="text-sm text-gray-500 mb-1">{recipe.category}</div>
                  <div className="text-xs text-gray-400 mb-2">{new Date(recipe.created_at).toLocaleDateString()}</div>
                  <div className="text-gray-600 text-sm line-clamp-2 mb-2">{recipe.description}</div>
                  <LikeButton recipeId={recipe.id} stopPropagation />
                  {/* Add view/edit/delete actions here if needed */}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}