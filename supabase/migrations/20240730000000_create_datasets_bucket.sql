
-- Create a storage bucket for dataset files
INSERT INTO storage.buckets (id, name, public)
VALUES ('datasets', 'datasets', false)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the datasets bucket
CREATE POLICY "Authenticated users can view datasets"
ON storage.objects FOR SELECT
USING (bucket_id = 'datasets')
ON CONFLICT (name, bucket_id) DO NOTHING;

CREATE POLICY "Authenticated users can upload datasets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'datasets')
ON CONFLICT (name, bucket_id) DO NOTHING;

CREATE POLICY "Authenticated users can update datasets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'datasets')
ON CONFLICT (name, bucket_id) DO NOTHING;

CREATE POLICY "Authenticated users can delete datasets"
ON storage.objects FOR DELETE
USING (bucket_id = 'datasets')
ON CONFLICT (name, bucket_id) DO NOTHING;
