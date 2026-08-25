-- ============================================================================
-- 0004_storage.sql
-- Public storage bucket for product images. Anyone can view images (they're
-- shown on the public storefront); only admins can upload/modify/remove
-- them.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "product_images_admin_write" on storage.objects
  for insert with check (bucket_id = 'product-images' and is_admin());

create policy "product_images_admin_update" on storage.objects
  for update using (bucket_id = 'product-images' and is_admin());

create policy "product_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'product-images' and is_admin());
