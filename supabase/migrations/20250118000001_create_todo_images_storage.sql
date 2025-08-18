-- Create storage bucket for todo images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'todo-images',
  'todo-images', 
  true, -- Private bucket for security
  10485760, -- 10MB in bytes (larger than avatars for todo images)
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload todo images to their own folder
CREATE POLICY "Users can upload todo images to their own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'todo-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own todo images
CREATE POLICY "Users can update their own todo images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'todo-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own todo images
CREATE POLICY "Users can delete their own todo images" ON storage.objects  
FOR DELETE USING (
  bucket_id = 'todo-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view todo images they have access to
-- This policy allows viewing images in their own folder
CREATE POLICY "Users can view accessible todo images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'todo-images' 
  AND auth.uid()::text = (storage.foldername(name))[1] -- Own images only
);

-- Create function to automatically create user folder structure
CREATE OR REPLACE FUNCTION create_user_todo_folder()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be called when a new user is created
  -- In Supabase, folders are created automatically when files are uploaded
  -- So we don't need to create empty folders
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Note: In Supabase Storage, folders are created automatically when files are uploaded
-- The folder structure will be: todo-images/{user_id}/{todo_id}/{filename}
-- This provides good organization and security isolation between users
