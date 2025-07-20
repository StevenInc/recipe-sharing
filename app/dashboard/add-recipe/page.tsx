'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Dessert',
  'Snack',
  'Drink',
];

export default function AddRecipePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleIngredientChange = (idx: number, value: string) => {
    setIngredients((prev) => prev.map((ing, i) => (i === idx ? value : ing)));
  };
  const handleInstructionChange = (idx: number, value: string) => {
    setInstructions((prev) => prev.map((ins, i) => (i === idx ? value : ins)));
  };

  const addIngredient = () => setIngredients((prev) => [...prev, '']);
  const removeIngredient = (idx: number) => setIngredients((prev) => prev.filter((_, i) => i !== idx));
  const addInstruction = () => setInstructions((prev) => [...prev, '']);
  const removeInstruction = (idx: number) => setInstructions((prev) => prev.filter((_, i) => i !== idx));

  const validate = () => {
    if (!title.trim()) return 'Title is required.';
    if (!description.trim()) return 'Description is required.';
    if (ingredients.length === 0 || ingredients.some((i) => !i.trim())) return 'All ingredients are required.';
    if (instructions.length === 0 || instructions.some((i) => !i.trim())) return 'All instructions are required.';
    if (!category) return 'Category is required.';
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
    let imageUrl: string | null = null;
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
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in to add a recipe.');
      setLoading(false);
      return;
    }
    const { error: insertError } = await supabase.from('recipes').insert({
      user_id: user.id,
      title,
      description,
      ingredients,
      instructions,
      category,
      image_url: imageUrl,
    });
    if (insertError) {
      setError('Failed to add recipe.');
      setLoading(false);
      return;
    }
    setLoading(false);
    router.replace('/dashboard');
  };

  //allow for the camera.

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow max-w-lg w-full space-y-4">
        <h2 className="text-2xl font-bold text-center mb-2">Add Recipe</h2>
        <input
          className="w-full p-2 border rounded"
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <div>
          <label className="block font-semibold mb-1">Ingredients</label>
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                className="w-full p-2 border rounded"
                type="text"
                value={ing}
                onChange={e => handleIngredientChange(idx, e.target.value)}
                required
              />
              {ingredients.length > 1 && (
                <button type="button" onClick={() => removeIngredient(idx)} className="text-red-500">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addIngredient} className="text-blue-600 underline">Add Ingredient</button>
        </div>
        <div>
          <label className="block font-semibold mb-1">Instructions</label>
          {instructions.map((ins, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                className="w-full p-2 border rounded"
                type="text"
                value={ins}
                onChange={e => handleInstructionChange(idx, e.target.value)}
                required
              />
              {instructions.length > 1 && (
                <button type="button" onClick={() => removeInstruction(idx)} className="text-red-500">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addInstruction} className="text-blue-600 underline">Add Instruction</button>
        </div>
        <div>
          <label className="block font-semibold mb-1">Category</label>
          <select
            className="w-full p-2 border rounded"
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Image (optional)</label>

          <input
            ref={imageInputRef}
            className="w-full p-2 border rounded"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={e => setImageFile(e.target.files?.[0] || null)}
            multiple={false}
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving…' : 'Add Recipe'}
        </button>
      </form>
    </div>
  );
}