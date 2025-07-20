export interface Profile {
  id: string;
  created_at: string;
  username: string;
  full_name: string;
  updated_at: string;
  email: string;
  bio?: string | null;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Recipe {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  description?: string | null;
  ingredients: string[];
  cooking_time?: number | null;
  difficulty?: Difficulty | null;
  category: string;
  instructions: string[];
  image_url?: string | null;
}