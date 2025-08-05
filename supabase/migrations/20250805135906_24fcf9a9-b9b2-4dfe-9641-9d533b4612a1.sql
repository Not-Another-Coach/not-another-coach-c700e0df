-- Add new stages to engagement_stage enum (each value must be added separately)
ALTER TYPE engagement_stage ADD VALUE 'shortlisted';
ALTER TYPE engagement_stage ADD VALUE 'unmatched'; 
ALTER TYPE engagement_stage ADD VALUE 'declined';