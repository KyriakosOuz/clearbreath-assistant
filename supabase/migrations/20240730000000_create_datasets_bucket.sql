
-- Create a storage bucket for dataset files
INSERT INTO storage.buckets (id, name, public)
VALUES ('datasets', 'datasets', false)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the datasets bucket
CREATE POLICY "Users can view their own datasets"
ON storage.objects FOR SELECT
USING (bucket_id = 'datasets' AND (auth.uid() = owner));

CREATE POLICY "Users can upload their own datasets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'datasets' AND (auth.uid() = owner));

CREATE POLICY "Users can update their own datasets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'datasets' AND (auth.uid() = owner));

CREATE POLICY "Users can delete their own datasets"
ON storage.objects FOR DELETE
USING (bucket_id = 'datasets' AND (auth.uid() = owner));
