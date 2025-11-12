import { createClient } from '@supabase/supabase-js';

// =================================================================================
// IMPORTANT: Supabase Database Setup
// =================================================================================
// To enable end-to-end encryption, you need to set up your Supabase project.
// Go to the SQL Editor in your Supabase dashboard and run the following queries
// in order.
//
// 1. Create the 'profiles' table to store encryption materials for each user:
/*
  CREATE TABLE public.profiles (
    id uuid NOT NULL,
    salt text NOT NULL,
    key_check_value text NOT NULL,
    key_check_iv text NOT NULL,
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT id FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
  );
*/
//
// 2. Create the 'diaries' table for encrypted entries.
//    NOTE: We are using the 'created_at' column for filtering and sorting.
//    The actual title and content will be inside 'encrypted_entry'.
/*
  CREATE TABLE public.diaries (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    owner_id uuid NOT NULL,
    encrypted_entry text NOT NULL,
    iv text NOT NULL,
    tags text[] NULL,
    mood text NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT diaries_pkey PRIMARY KEY (id),
    CONSTRAINT owner_id FOREIGN KEY (owner_id) REFERENCES auth.users (id) ON DELETE CASCADE
  );
*/
//
// 3. Set up Row Level Security (RLS) to protect user data.
//    These policies are CRITICAL for security.
//    They ensure that users can only access their own data.
//    This script is idempotent, meaning it can be run multiple times without error.
/*
  -- Enable RLS for the tables
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.diaries ENABLE ROW LEVEL SECURITY;

  -- Create policies for the 'profiles' table
  DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
  CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

  DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
  CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
  
  DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
  CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

  -- Create policies for the 'diaries' table
  DROP POLICY IF EXISTS "Users can create their own diary entries." ON public.diaries;
  CREATE POLICY "Users can create their own diary entries."
  ON public.diaries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

  DROP POLICY IF EXISTS "Users can view their own diary entries." ON public.diaries;
  CREATE POLICY "Users can view their own diary entries."
  ON public.diaries FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

  DROP POLICY IF EXISTS "Users can update their own diary entries." ON public.diaries;
  CREATE POLICY "Users can update their own diary entries."
  ON public.diaries FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

  DROP POLICY IF EXISTS "Users can delete their own diary entries." ON public.diaries;
  CREATE POLICY "Users can delete their own diary entries."
  ON public.diaries FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);
*/
//
// 4. (Optional but Recommended) Add columns for profile name and avatar.
/*
  ALTER TABLE public.profiles ADD COLUMN full_name text;
  ALTER TABLE public.profiles ADD COLUMN avatar_url text;
*/
//
// 5. (Optional but Recommended) Set up Supabase Storage for avatars.
/*
  -- In your Supabase dashboard, go to Storage and create a new PUBLIC bucket named 'avatars'.
  -- The RLS policies below are for a PRIVATE bucket. For a PUBLIC bucket, you can skip
  -- the policies, but you must ensure your UI logic only allows users to upload to their own folder.
  -- The provided application code does this by creating a path with the user's ID.

  -- Example RLS Policies for a PRIVATE 'avatars' bucket:
  CREATE POLICY "Users can view their own avatar" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars' AND owner = auth.uid());
  CREATE POLICY "Users can upload an avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND owner = auth.uid());
  CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND owner = auth.uid());
*/
//
// NOTE: The previous trigger-based profile creation has been removed.
// The application now handles creating the user profile on their first login,
// which is a more robust method.
//
// =================================================================================


// IMPORTANT: Replace with your own Supabase project's URL and Anon Key
// You can find these in your Supabase project's dashboard under Project Settings > API.
// Fix: Explicitly type as string to allow comparison with placeholder values in Auth.tsx.
export const supabaseUrl: string = 'https://ccgiozknvlknbrkzfcdx.supabase.co';
export const supabaseKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjZ2lvemtudmxrbmJya3pmY2R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTY3NTMsImV4cCI6MjA3ODQzMjc1M30.lmmuGnynbY_n_4UlsrGw5ofRd6p9QLKCcrfHf7itEg8';

export const supabase = createClient(supabaseUrl, supabaseKey);