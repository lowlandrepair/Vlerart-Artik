-- Create storage bucket for place images
INSERT INTO storage.buckets (id, name, public)
VALUES ('place-images', 'place-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for place images
CREATE POLICY "Anyone can view place images"
ON storage.objects FOR SELECT
USING (bucket_id = 'place-images');

CREATE POLICY "Admins can upload place images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'place-images' AND auth.uid() IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
));

CREATE POLICY "Admins can update place images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'place-images' AND auth.uid() IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
));

CREATE POLICY "Admins can delete place images"
ON storage.objects FOR DELETE
USING (bucket_id = 'place-images' AND auth.uid() IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
));

-- Add images array column to places table if not exists
ALTER TABLE public.places
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Update the places table to support better amenities structure
ALTER TABLE public.places
ADD COLUMN IF NOT EXISTS rating numeric(2,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews integer DEFAULT 0;