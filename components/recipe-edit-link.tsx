'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface RecipeEditLinkProps {
  recipeUserId: string;
  recipeId: string;
}

export default function RecipeEditLink({ recipeUserId, recipeId }: RecipeEditLinkProps) {
  const [isOwner, setIsOwner] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkOwner = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsOwner(!!user && user.id === recipeUserId);
    };
    checkOwner();
  }, [recipeUserId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from('recipes').delete().eq('id', recipeId);
    setDeleting(false);
    if (!error) {
      router.replace('/dashboard');
    } else {
      alert('Failed to delete recipe.');
    }
  };

  if (!isOwner) return null;

  return (
    <div className="flex gap-2 mt-4">
      <a
        href={`/recipes/${recipeId}/edit`}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
      >
        Edit Recipe
      </a>
      <button
        type="button"
        onClick={handleDelete}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition"
        disabled={deleting}
      >
        {deleting ? 'Deleting…' : 'Delete Recipe'}
      </button>
    </div>
  );
}