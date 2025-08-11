-- Make client-photos bucket private (use signed URLs for access)
insert into storage.buckets (id, name, public)
values ('client-photos','client-photos', false)
on conflict (id) do update set public = false;