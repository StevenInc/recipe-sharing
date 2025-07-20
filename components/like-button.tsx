'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface LikeButtonProps {
  recipeId: string;
  stopPropagation?: boolean;
}

export default function LikeButton({ recipeId, stopPropagation }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchLikes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: likes } = await supabase
        .from('favorites')
        .select('user_id')
        .eq('recipe_id', recipeId);

      console.log('Fetched likes for recipe:', recipeId, 'likes:', likes);

      setCount(likes?.length || 0);
      // Check if current user has liked this recipe
      const userLiked = !!likes?.find((fav) => fav.user_id === user.id);
      console.log('User liked status:', userLiked);
      setLiked(userLiked);
      setLoading(false);
    };
    fetchLikes();
  }, [recipeId, supabase]);

  const handleToggle = async (e?: React.MouseEvent) => {
    if (stopPropagation && e) e.stopPropagation();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.id || !recipeId) {
      setLoading(false);
      return;
    }

    // Debug: Log current user and check existing favorites
    console.log('Current user ID:', user.id);
    console.log('Recipe ID:', recipeId);

    // Check what favorites exist for this recipe
    const { data: existingFavorites } = await supabase
      .from('favorites')
      .select('user_id, recipe_id')
      .eq('recipe_id', recipeId);
    console.log('Existing favorites for this recipe:', existingFavorites);

    if (liked) {
      console.log('Attempting to delete favorite:', { user_id: user.id, recipe_id: recipeId });

      // Check if the favorite actually exists before trying to delete
      const { data: existingFavorite } = await supabase
        .from('favorites')
        .select('user_id, recipe_id')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .single();

      if (!existingFavorite) {
        console.log('No favorite found to delete, resetting state');
        setLiked(false);
        setLoading(false);
        return;
      }

      const deleteResult = await supabase
      .from('favorites')
      .delete({ count: 'exact' }) // optional: if you want count of deleted rows
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId);

      console.log('Delete result:', deleteResult);
      if (!deleteResult.error) {
        setLiked(false);
        setCount((c) => c - 1);
      }
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, recipe_id: recipeId });
      setLiked(true);
      setCount((c) => c + 1);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="flex items-center gap-1 text-red-600 hover:text-red-700 transition"
      aria-label={liked ? 'Unlike' : 'Like'}
    >
      {liked ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      )}
      <span className="text-sm">{count}</span>
    </button>
  );
}