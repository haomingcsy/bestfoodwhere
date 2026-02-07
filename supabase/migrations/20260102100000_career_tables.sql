-- Career Tables Migration
-- Run this in your Supabase SQL Editor

-- 1. Career Jobs Table
CREATE TABLE IF NOT EXISTS career_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('marketing', 'technology', 'content', 'operations')),
  type TEXT NOT NULL CHECK (type IN ('Full-time', 'Part-time', 'Contract', 'Internship')),
  description TEXT NOT NULL,
  requirements TEXT[],
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Career Team Table
CREATE TABLE IF NOT EXISTS career_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Career Applications Table
CREATE TABLE IF NOT EXISTS career_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  area_of_interest TEXT,
  availability TEXT,
  message TEXT,
  resume_url TEXT,
  job_id UUID REFERENCES career_jobs(id) ON DELETE SET NULL,
  hubspot_contact_id TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'contacted', 'interviewing', 'offered', 'hired', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_career_jobs_category ON career_jobs(category);
CREATE INDEX IF NOT EXISTS idx_career_jobs_is_active ON career_jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_career_applications_email ON career_applications(email);
CREATE INDEX IF NOT EXISTS idx_career_applications_status ON career_applications(status);
CREATE INDEX IF NOT EXISTS idx_career_applications_created_at ON career_applications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE career_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public can read active jobs and team members
CREATE POLICY "Public can view active jobs" ON career_jobs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active team members" ON career_team
  FOR SELECT USING (is_active = true);

-- RLS Policy: Applications can only be inserted (no public read)
CREATE POLICY "Public can submit applications" ON career_applications
  FOR INSERT WITH CHECK (true);

-- Trigger to update updated_at on career_jobs
CREATE OR REPLACE FUNCTION update_career_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER career_jobs_updated_at
  BEFORE UPDATE ON career_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_career_jobs_updated_at();

-- Seed initial job data
INSERT INTO career_jobs (title, category, type, description, requirements, sort_order) VALUES
('Social Media Manager', 'marketing', 'Full-time', 'Drive engagement across our social media platforms by creating compelling content strategies that showcase Singapore''s food scene.', ARRAY['2+ years social media management', 'Content creation skills', 'Analytics proficiency', 'Passion for food'], 1),
('SEO Specialist', 'marketing', 'Full-time', 'Drive organic traffic to our platform through expert SEO strategies and data-driven optimization. Grow our food content visibility.', ARRAY['3+ years SEO experience', 'Google Analytics expertise', 'Content optimization skills', 'Keyword research'], 2),
('Project Manager', 'operations', 'Full-time', 'Lead and coordinate our product development initiatives to enhance user experience for food discovery in Singapore.', ARRAY['3+ years project management', 'Agile methodology', 'Cross-functional team leadership', 'Tech background preferred'], 3),
('Content Creator', 'content', 'Full-time', 'Create compelling visual and written content that showcases Singapore''s diverse food scene across multiple platforms.', ARRAY['Portfolio of content work', 'Photography/videography skills', 'Writing proficiency', 'Food industry knowledge'], 4),
('Copywriter', 'content', 'Part-time', 'Craft compelling copy that brings Singapore''s food scene to life through engaging descriptions, articles, and promotional content.', ARRAY['Strong writing portfolio', 'SEO copywriting experience', 'Food/lifestyle writing', 'Attention to detail'], 5),
('Sales/Outreach Specialist', 'marketing', 'Full-time', 'Build and nurture relationships with restaurants across Singapore to grow our restaurant partner network.', ARRAY['Sales experience', 'Relationship building', 'CRM proficiency', 'F&B industry knowledge preferred'], 6);

-- Seed initial team data
INSERT INTO career_team (name, role, bio, image_url, sort_order) VALUES
('Alex Tan', 'Founder & CEO', 'Passionate foodie and tech entrepreneur. Started BFW to help Singaporeans discover amazing food experiences.', '/images/team/alex-tan.jpg', 1),
('Mei Lin', 'Content Lead', 'Former food blogger with 10+ years covering Singapore''s vibrant food scene.', '/images/team/mei-lin.jpg', 2),
('Raj Kumar', 'Tech Lead', 'Full-stack developer passionate about building products that connect people with great food.', '/images/team/raj-kumar.jpg', 3);

-- Create storage bucket for resumes (run separately in Supabase Dashboard > Storage)
-- Bucket name: career-resumes
-- Public: false (private bucket)
-- Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
-- Max file size: 5MB
