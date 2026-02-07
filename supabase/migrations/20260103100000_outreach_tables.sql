-- Outreach & SEO Content Tables Migration
-- For cold outreach campaigns and SEO content management
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. OUTREACH CAMPAIGNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('food-blogger', 'tourism', 'supplier', 'partnership', 'media')),
  description TEXT,

  -- Email configuration
  email_subject_template TEXT,
  email_body_template TEXT,
  sender_name TEXT DEFAULT 'BestFoodWhere Team',
  sender_email TEXT DEFAULT 'hello@bestfoodwhere.sg',

  -- Campaign settings
  daily_send_limit INTEGER DEFAULT 20,
  delay_between_sends_seconds INTEGER DEFAULT 300, -- 5 minutes

  -- Tracking
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  target_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  replied_count INTEGER DEFAULT 0,
  converted_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- ============================================
-- 2. OUTREACH CONTACTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS outreach_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES outreach_campaigns(id) ON DELETE CASCADE,

  -- Contact information
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  company TEXT,
  website TEXT,

  -- SEO metrics (for prioritization)
  domain_authority INTEGER, -- Moz DA
  domain_rating INTEGER,    -- Ahrefs DR
  monthly_traffic INTEGER,

  -- Social metrics
  instagram_followers INTEGER,
  twitter_followers INTEGER,

  -- Personalization data (for GPT email generation)
  recent_post_title TEXT,
  recent_post_url TEXT,
  niche TEXT,
  notes TEXT,
  personalization_data JSONB,

  -- CRM integration
  hubspot_contact_id TEXT,

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Not yet sent
    'queued',       -- In send queue
    'sent',         -- Email sent
    'delivered',    -- Confirmed delivered
    'opened',       -- Email opened
    'clicked',      -- Link clicked
    'replied',      -- Received reply
    'converted',    -- Backlink obtained
    'unsubscribed', -- Opted out
    'bounced',      -- Email bounced
    'failed'        -- Send failed
  )),

  -- Email tracking
  tracking_id TEXT UNIQUE, -- For open/click tracking
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,

  -- Result tracking
  backlink_url TEXT,       -- URL where they linked to us
  backlink_anchor TEXT,    -- Anchor text used

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. OUTREACH EMAIL LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS outreach_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES outreach_contacts(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES outreach_campaigns(id) ON DELETE CASCADE,

  -- Email content (personalized)
  subject TEXT NOT NULL,
  body_html TEXT,
  body_text TEXT,

  -- Delivery status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'failed')),
  resend_message_id TEXT, -- Resend API message ID
  error_message TEXT,

  -- Timestamps
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. OUTREACH TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS outreach_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('food-blogger', 'tourism', 'supplier', 'partnership', 'media')),

  -- Template content (with placeholders like {first_name}, {blog_name}, etc.)
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,

  -- Performance metrics
  usage_count INTEGER DEFAULT 0,
  open_rate DECIMAL(5,2),
  reply_rate DECIMAL(5,2),

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. SEO CONTENT TABLE (for AI-generated guides)
-- ============================================
CREATE TABLE IF NOT EXISTS seo_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mall-guide', 'cuisine-guide', 'location-guide', 'best-of', 'how-to', 'comparison')),

  -- Content
  title TEXT NOT NULL,
  meta_description TEXT,
  content JSONB, -- Structured content blocks for flexibility
  excerpt TEXT,

  -- SEO targeting
  target_keywords TEXT[],
  internal_links TEXT[],
  external_links TEXT[],

  -- Media
  featured_image_url TEXT,

  -- Publishing
  publish_status TEXT DEFAULT 'draft' CHECK (publish_status IN ('draft', 'review', 'published', 'archived')),
  published_at TIMESTAMPTZ,

  -- Author
  author_name TEXT DEFAULT 'BestFoodWhere Team',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_outreach_campaigns_status ON outreach_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_outreach_campaigns_type ON outreach_campaigns(type);

CREATE INDEX IF NOT EXISTS idx_outreach_contacts_campaign ON outreach_contacts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_email ON outreach_contacts(email);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_status ON outreach_contacts(status);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_tracking ON outreach_contacts(tracking_id);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_domain_authority ON outreach_contacts(domain_authority DESC);

CREATE INDEX IF NOT EXISTS idx_outreach_email_logs_contact ON outreach_email_logs(contact_id);
CREATE INDEX IF NOT EXISTS idx_outreach_email_logs_campaign ON outreach_email_logs(campaign_id);

CREATE INDEX IF NOT EXISTS idx_seo_content_slug ON seo_content(slug);
CREATE INDEX IF NOT EXISTS idx_seo_content_type ON seo_content(type);
CREATE INDEX IF NOT EXISTS idx_seo_content_status ON seo_content(publish_status);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only authenticated users (admin) can access outreach data
-- For now, we'll use service role key for API access
CREATE POLICY "Service role full access to campaigns" ON outreach_campaigns
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to contacts" ON outreach_contacts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to email logs" ON outreach_email_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to templates" ON outreach_templates
  FOR ALL USING (auth.role() = 'service_role');

-- SEO content: public read for published, service role for all
CREATE POLICY "Public can view published content" ON seo_content
  FOR SELECT USING (publish_status = 'published');

CREATE POLICY "Service role full access to seo content" ON seo_content
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_outreach_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_outreach_campaigns_updated_at
  BEFORE UPDATE ON outreach_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_outreach_updated_at();

CREATE TRIGGER update_outreach_contacts_updated_at
  BEFORE UPDATE ON outreach_contacts
  FOR EACH ROW EXECUTE FUNCTION update_outreach_updated_at();

CREATE TRIGGER update_outreach_templates_updated_at
  BEFORE UPDATE ON outreach_templates
  FOR EACH ROW EXECUTE FUNCTION update_outreach_updated_at();

CREATE TRIGGER update_seo_content_updated_at
  BEFORE UPDATE ON seo_content
  FOR EACH ROW EXECUTE FUNCTION update_outreach_updated_at();

-- ============================================
-- SEED DATA: Default Email Templates
-- ============================================
INSERT INTO outreach_templates (name, type, subject_template, body_template) VALUES
(
  'Food Blogger Initial Outreach',
  'food-blogger',
  'Quick question about {blog_name}',
  E'Hi {first_name},\n\nI came across your recent post about {recent_post_title} and loved your take on Singapore''s food scene.\n\nI''m reaching out from BestFoodWhere - we''re building Singapore''s most comprehensive mall dining directory with 10,000+ restaurants across 19 shopping malls.\n\nI noticed you often cover {niche}. We have exclusive data on:\n- Opening hours and menus for every restaurant\n- User reviews and ratings\n- Exclusive deals and promotions\n\nWould you be interested in:\n1. Early access to our data for your content?\n2. A collaboration where we feature your reviews?\n\nEither way, I''d love to connect with a fellow food enthusiast!\n\nBest,\n{sender_name}\nBestFoodWhere Team\n\nP.S. Check us out at https://bestfoodwhere.sg'
),
(
  'Tourism Site Outreach',
  'tourism',
  'Singapore dining resource for your readers',
  E'Hi {first_name},\n\nI noticed {company} covers Singapore travel and dining - great resource for visitors!\n\nWe''ve built BestFoodWhere, a comprehensive directory of 10,000+ restaurants across 19 major Singapore shopping malls. Tourists often struggle to find good food in malls, and we solve that.\n\nWould you be interested in:\n- Adding us as a resource for your Singapore dining guides?\n- A content partnership where we provide mall-by-mall dining recommendations?\n\nHappy to provide any specific data or content that would help your readers.\n\nBest,\n{sender_name}\nBestFoodWhere Team'
),
(
  'Partnership Outreach',
  'partnership',
  'Partnership opportunity - {company} x BestFoodWhere',
  E'Hi {first_name},\n\nI hope this message finds you well. I''m reaching out from BestFoodWhere, Singapore''s leading food directory with 10,000+ restaurant listings across 19 major malls.\n\nWe see a great synergy between {company} and BestFoodWhere, and I''d love to explore potential partnership opportunities:\n\n- Cross-promotion to our engaged audience\n- Data sharing for mutual benefit\n- Co-branded content or campaigns\n\nWould you be open to a quick call to discuss?\n\nBest regards,\n{sender_name}\nBestFoodWhere'
);

-- ============================================
-- RPC FUNCTIONS FOR ATOMIC COUNTER UPDATES
-- ============================================

CREATE OR REPLACE FUNCTION increment_campaign_sent(p_campaign_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE outreach_campaigns
  SET sent_count = sent_count + 1
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_campaign_opened(p_campaign_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE outreach_campaigns
  SET opened_count = opened_count + 1
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_campaign_clicked(p_campaign_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE outreach_campaigns
  SET clicked_count = clicked_count + 1
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_campaign_replied(p_campaign_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE outreach_campaigns
  SET replied_count = replied_count + 1
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_campaign_converted(p_campaign_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE outreach_campaigns
  SET converted_count = converted_count + 1
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPFUL COMMENTS
-- ============================================
COMMENT ON TABLE outreach_campaigns IS 'Cold outreach campaigns for backlink building and partnerships';
COMMENT ON TABLE outreach_contacts IS 'Contacts for outreach campaigns with tracking data';
COMMENT ON TABLE outreach_email_logs IS 'Log of all emails sent for tracking and debugging';
COMMENT ON TABLE outreach_templates IS 'Reusable email templates with performance metrics';
COMMENT ON TABLE seo_content IS 'AI-generated SEO content (guides, best-of lists, etc.)';
