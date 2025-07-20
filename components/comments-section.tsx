'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    username: string;
  };
}

interface CommentsSectionProps {
  recipeId: string;
}

export default function CommentsSection({ recipeId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Start collapsed by default
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [supabase]);

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            full_name,
            username
          )
        `)
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
      } else {
        const comments: Comment[] = (data || []).map(comment => ({
          id: comment.id as string,
          content: comment.content as string,
          created_at: comment.created_at as string,
          user_id: comment.user_id as string,
          profiles: {
            full_name: 'Unknown User', // We'll handle this separately if needed
            username: 'unknown'
          }
        }));
        setComments(comments);
      }
      setLoading(false);
    };

    fetchComments();
  }, [recipeId, supabase]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    const { error } = await supabase
      .from('comments')
      .insert({
        content: newComment.trim(),
        recipe_id: recipeId,
        user_id: user.id
      });

    if (error) {
      console.error('Error posting comment:', error);
    } else {
      setNewComment('');
      // Refresh comments
      const { data } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            full_name,
            username
          )
        `)
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false });

      const comments: Comment[] = (data || []).map(comment => ({
        id: comment.id as string,
        content: comment.content as string,
        created_at: comment.created_at as string,
        user_id: comment.user_id as string,
        profiles: {
          full_name: 'Unknown User', // We'll handle this separately if needed
          username: 'unknown'
        }
      }));
      setComments(comments);
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id); // Ensure user can only delete their own comments

    if (error) {
      console.error('Error deleting comment:', error);
    } else {
      // Remove comment from local state
      setComments(comments.filter(comment => comment.id !== commentId));
    }
  };

  return (
    <div className="mt-8 border-t pt-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Comments ({comments.length})</h3>
      </div>

      {/* New Comment Form */}
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={3}
            disabled={submitting}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      )}

      {/* Hide/Show Comments Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label={isExpanded ? 'Hide comments' : 'Show comments'}
        >
          <span className="text-sm">{isExpanded ? 'Hide' : 'Show'}</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Comments List */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-4">
          {loading ? (
            <div className="text-gray-500">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-gray-500">No comments yet. Be the first to comment!</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-4 rounded-lg relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">
                    {comment.profiles?.full_name || comment.profiles?.username || 'Anonymous'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                    {user && user.id === comment.user_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        aria-label="Delete comment"
                        title="Delete comment"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-800">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}