"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", username: "", full_name: "", bio: "" });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.replace("/login");
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) {
        setError(error.message);
      } else {
        const profile: Profile = {
          id: data.id as string,
          created_at: data.created_at as string,
          username: data.username as string,
          full_name: data.full_name as string,
          updated_at: data.updated_at as string,
          email: data.email as string,
          bio: data.bio as string | null,
        };
        setProfile(profile);
        setForm({
          email: profile.email || "",
          username: profile.username || "",
          full_name: profile.full_name || "",
          bio: profile.bio || "",
        });
      }
      setLoading(false);
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    if (!form.email || !form.username || !form.full_name) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }
    // Update profile in Supabase
    const { error } = await supabase
      .from("profiles")
      .update({
        email: form.email,
        username: form.username,
        full_name: form.full_name,
        bio: form.bio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile!.id);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Profile updated successfully.");
      setProfile((p) => p && { ...p, ...form, updated_at: new Date().toISOString() });
    }
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!profile) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow max-w-md w-full space-y-4"
      >
        <h2 className="text-2xl font-bold text-center mb-2">Edit Profile</h2>
        <input
          className="w-full p-2 border rounded"
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 border rounded"
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 border rounded"
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={form.full_name}
          onChange={handleChange}
          required
        />
        <textarea
          className="w-full p-2 border rounded min-h-[100px] resize-y"
          name="bio"
          placeholder="Bio"
          value={form.bio}
          onChange={handleChange}
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <div className="flex gap-2">
          <button
            className="basis-3/4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
            type="submit"
            disabled={loading}
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>
          <button
            type="button"
            className="basis-1/4 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 rounded transition border border-red-300"
            onClick={() => router.push('/dashboard')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}