'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Recipe } from '@/lib/types/database';
import { useParams } from 'next/navigation';

const CATEGORIES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Dessert',
  'Snack',
  'Drink',
];

export default function EditRecipePage() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    category: CATEGORIES[0],
    image_url: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ type: 'ingredient' | 'instruction', index: number } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      const { id } = params as { id: string };
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) {
        setError('Recipe not found.');
        setLoading(false);
        return;
      }
      const recipe: Recipe = {
        id: data.id as string,
        created_at: data.created_at as string,
        user_id: data.user_id as string,
        title: data.title as string,
        description: data.description as string | null,
        ingredients: data.ingredients as string[],
        cooking_time: data.cooking_time as number | null,
        difficulty: data.difficulty as 'easy' | 'medium' | 'hard' | null,
        category: data.category as string,
        instructions: data.instructions as string[],
        image_url: data.image_url as string | null,
      };
      setRecipe(recipe);
      setForm({
        title: recipe.title || '',
        description: recipe.description || '',
        ingredients: recipe.ingredients || [''],
        instructions: recipe.instructions || [''],
        category: recipe.category || CATEGORIES[0],
        image_url: recipe.image_url || '',
      });
      setLoading(false);
    };
    fetchRecipe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleIngredientChange = (idx: number, value: string) => {
    setForm(f => ({ ...f, ingredients: f.ingredients.map((ing, i) => (i === idx ? value : ing)) }));
  };
  const handleInstructionChange = (idx: number, value: string) => {
    setForm(f => ({ ...f, instructions: f.instructions.map((ins, i) => (i === idx ? value : ins)) }));
  };
  const addIngredient = () => setForm(f => ({ ...f, ingredients: [...f.ingredients, ''] }));
  const removeIngredient = (idx: number) => setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }));
  const addInstruction = () => setForm(f => ({ ...f, instructions: [...f.instructions, ''] }));
  const removeInstruction = (idx: number) => setForm(f => ({ ...f, instructions: f.instructions.filter((_, i) => i !== idx) }));

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, type: 'ingredient' | 'instruction', index: number) => {
    setDraggedItem({ type, index });
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null);
    setDragOverIndex(null);
    e.currentTarget.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, type: 'ingredient' | 'instruction', dropIndex: number) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.type !== type) return;

    const draggedIndex = draggedItem.index;
    if (draggedIndex === dropIndex) return;

    if (type === 'ingredient') {
      setForm(f => {
        const newIngredients = [...f.ingredients];
        const [draggedItem] = newIngredients.splice(draggedIndex, 1);
        newIngredients.splice(dropIndex, 0, draggedItem);
        return { ...f, ingredients: newIngredients };
      });
    } else {
      setForm(f => {
        const newInstructions = [...f.instructions];
        const [draggedItem] = newInstructions.splice(draggedIndex, 1);
        newInstructions.splice(dropIndex, 0, draggedItem);
        return { ...f, instructions: newInstructions };
      });
    }

    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const validate = () => {
    if (!form.title.trim()) return 'Title is required.';
    if (!form.description.trim()) return 'Description is required.';
    if (form.ingredients.length === 0 || form.ingredients.some(i => !i.trim())) return 'All ingredients are required.';
    if (form.instructions.length === 0 || form.instructions.some(i => !i.trim())) return 'All instructions are required.';
    if (!form.category) return 'Category is required.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    let imageUrl = form.image_url;
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('recipe-images').upload(fileName, imageFile);
      if (uploadError) {
        setError('Image upload failed.');
        setLoading(false);
        return;
      }
      imageUrl = supabase.storage.from('recipe-images').getPublicUrl(fileName).data.publicUrl;
    }
    const { id } = params as { id: string };
    const { error: updateError } = await supabase.from('recipes').update({
      user_id: recipe?.user_id, // ensure user_id is included
      title: form.title,
      description: form.description,
      ingredients: form.ingredients,
      instructions: form.instructions,
      category: form.category,
      image_url: imageUrl,
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    if (updateError) {
      setError('Failed to update recipe.');
      setLoading(false);
      return;
    }
    setLoading(false);
    router.replace(`/recipes/${id}`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!recipe) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow max-w-lg w-full space-y-4">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">Edit Recipe</h2>
        <input
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-900 placeholder-gray-500"
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <textarea
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-900 placeholder-gray-500"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          rows={6}
          required
        />
        <div>
          <label className="block font-semibold mb-1 text-gray-900">Ingredients</label>
          {form.ingredients.map((ing, idx) => (
            <div
              key={idx}
              className={`flex gap-2 mb-2 items-center transition-all duration-200 ${
                dragOverIndex === idx ? 'bg-orange-50 border-l-4 border-orange-400 pl-2' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, 'ingredient', idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, 'ingredient', idx)}
            >
              <div className="text-gray-400 text-sm mr-2 cursor-move select-none">⋮⋮</div>
              <input
                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-900 placeholder-gray-500"
                type="text"
                value={ing}
                onChange={e => handleIngredientChange(idx, e.target.value)}
                required
              />
              {form.ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(idx)}
                  className="text-red-500 hover:text-red-700 p-2 transition-colors flex-shrink-0"
                  title="Remove ingredient"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addIngredient} className="text-blue-600 underline">Add Ingredient</button>
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-900">Instructions</label>
          {form.instructions.map((ins, idx) => (
            <div
              key={idx}
              className={`flex gap-2 mb-2 items-center transition-all duration-200 ${
                dragOverIndex === idx ? 'bg-orange-50 border-l-4 border-orange-400 pl-2' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, 'instruction', idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, 'instruction', idx)}
            >
              <div className="text-gray-400 text-sm mr-2 cursor-move select-none">⋮⋮</div>
              <input
                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-900 placeholder-gray-500"
                type="text"
                value={ins}
                onChange={e => handleInstructionChange(idx, e.target.value)}
                required
              />
              {form.instructions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInstruction(idx)}
                  className="text-red-500 hover:text-red-700 p-2 transition-colors flex-shrink-0"
                  title="Remove instruction"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addInstruction} className="text-blue-600 underline">Add Instruction</button>
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-900">Category</label>
          <select
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-900"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-900">Image (optional)</label>
          <input
            ref={imageInputRef}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-900"
            type="file"
            accept="image/*"
            onChange={e => setImageFile(e.target.files?.[0] || null)}
          />
          {form.image_url && (
            <Image
              src={form.image_url}
              alt="Current"
              width={300}
              height={150}
              className="w-full h-32 object-cover rounded mt-2"
            />
          )}
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}