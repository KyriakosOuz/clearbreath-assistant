
-- Create a storage bucket for dataset files
insert into storage.buckets (id, name, public)
values ('datasets', 'datasets', true);

-- Set up storage policy to allow authenticated users to upload to this bucket
create policy "Allow authenticated users to upload files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'datasets');

-- Allow authenticated users to select their own objects
create policy "Allow authenticated users to select their own objects"
on storage.objects for select
to authenticated
using (bucket_id = 'datasets');

-- Allow authenticated users to update their own objects
create policy "Allow authenticated users to update their own objects"
on storage.objects for update
to authenticated
using (bucket_id = 'datasets');

-- Allow authenticated users to delete their own objects
create policy "Allow authenticated users to delete their own objects"
on storage.objects for delete
to authenticated
using (bucket_id = 'datasets');
