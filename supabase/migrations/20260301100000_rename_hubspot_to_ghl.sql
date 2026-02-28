-- Migration: Rename hubspot_contact_id to ghl_contact_id
-- Date: 2026-03-01
-- Description: Rename hubspot_contact_id columns to ghl_contact_id across all tables
--              as CRM integration moves from HubSpot to GoHighLevel (GHL).

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'restaurant_profiles' AND column_name = 'hubspot_contact_id') THEN
    ALTER TABLE public.restaurant_profiles RENAME COLUMN hubspot_contact_id TO ghl_contact_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'career_applications' AND column_name = 'hubspot_contact_id') THEN
    ALTER TABLE public.career_applications RENAME COLUMN hubspot_contact_id TO ghl_contact_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'outreach_contacts' AND column_name = 'hubspot_contact_id') THEN
    ALTER TABLE public.outreach_contacts RENAME COLUMN hubspot_contact_id TO ghl_contact_id;
  END IF;
END $$;
