import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import RecipeEditLink from '@/components/recipe-edit-link';
import LikeButton from '@/components/like-button';
import CommentsSection from '@/components/comments-section';

interface RecipeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  // Support async params (Next.js 15+)
  const { id } = await params;

  const supabase = createClient();
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !recipe) return notFound();

  // Fetch uploader's profile
  const { data: uploader } = await supabase
    .from('profiles')
    .select('full_name, username')
    .eq('id', recipe.user_id)
    .single();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-2xl">
        {recipe.image_url && (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            width={600}
            height={400}
            className="w-full h-64 object-cover rounded mb-6"
          />
        )}
        <h1 className="text-3xl font-bold mb-2 text-gray-900">{recipe.title}</h1>
        <div className="text-sm text-gray-600 mb-2">
          {recipe.category} &middot; {new Date(recipe.created_at).toLocaleDateString()}
          {uploader && (
            <>
              {' '} &middot; Uploaded by <Link href={`/profiles/${recipe.user_id}`} className="font-semibold text-orange-600 hover:text-orange-700 underline">{uploader.full_name || uploader.username}</Link>
            </>
          )}
        </div>
        <div className="text-lg text-gray-700 mb-4">{recipe.description}</div>
        <LikeButton recipeId={recipe.id} />
        <div className="mb-4">
          <h2 className="font-semibold mb-1 text-gray-900">Ingredients</h2>
          <ul className="list-disc list-inside text-gray-800">
            {recipe.ingredients.map((ing: string, idx: number) => (
              <li key={idx}>{ing}</li>
            ))}
          </ul>
        </div>
        <div className="mb-4">
          <h2 className="font-semibold mb-1 text-gray-900">Instructions</h2>
          <ol className="list-decimal list-inside text-gray-800">
            {recipe.instructions.map((ins: string, idx: number) => (
              <li key={idx}>{ins}</li>
            ))}
          </ol>
        </div>
        <RecipeEditLink recipeUserId={recipe.user_id} recipeId={recipe.id} />
        <CommentsSection recipeId={recipe.id} />
      </div>
    </div>
  );
}