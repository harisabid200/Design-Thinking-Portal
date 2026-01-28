-- Add parent_id to stage_content to link resources to videos
alter table stage_content 
add column parent_id uuid references stage_content(id) on delete cascade;

-- Policy update (ensure open access for now)
-- (Existing policies likely cover this, but good to double check if RLS issues arise)

-- Clean up existing resources if any (optional, or we can manually link them later)
-- For now, we assume fresh data or manual fix for existing.
