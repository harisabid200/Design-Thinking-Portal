-- Add last_position_seconds to video_progress for resume functionality
alter table video_progress 
add column last_position_seconds numeric default 0;
    