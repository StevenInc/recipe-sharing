import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Recipe } from '@/lib/types/database';

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const supabase = createClient();

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (profileError || !profile) return notFound();

  // Fetch user's recipes
  const { data: recipes } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false });

  const userRecipes: Recipe[] = (recipes || []).map(recipe => ({
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
    image_url: recipe.image_url as string | null,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-orange-600">
                {(profile.full_name || profile.username).charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profile.full_name || profile.username}
              </h1>
              <p className="text-gray-600 mb-1">@{profile.username}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          {profile.bio && (
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">About</h2>
              <p className="text-gray-700">{profile.bio}</p>
            </div>
          )}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span className="font-semibold text-gray-900">{userRecipes.length}</span>
              {userRecipes.length === 1 ? 'recipe' : 'recipes'}
            </span>
          </div>
        </div>

        {/* Recipes Section */}
        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {profile.full_name || profile.username}&apos;s Recipes
          </h2>

          {userRecipes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <p className="text-gray-600 mb-2">No recipes yet</p>
              <p className="text-sm text-gray-500">
                {profile.full_name || profile.username} hasn&apos;t shared any recipes yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userRecipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.id}`}
                  className="block bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {recipe.image_url && (
                    <div className="relative h-48">
                      <Image
                        src={recipe.image_url}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {recipe.title}
                    </h3>
                    {recipe.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {recipe.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        {recipe.category}
                      </span>
                      <span>
                        {new Date(recipe.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}