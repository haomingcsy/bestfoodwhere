-- Migration: Rename hubspot_contact_id to ghl_contact_id
-- Date: 2026-03-01
-- Description: Rename hubspot_contact_id columns to ghl_contact_id across all tables
--              as CRM integration moves from HubSpot to GoHighLevel (GHL).

ALTER TABLE public.restaurant_profiles RENAME COLUMN hubspot_contact_id TO ghl_contact_id;
ALTER TABLE public.career_applications RENAME COLUMN hubspot_contact_id TO ghl_contact_id;
ALTER TABLE public.outreach_contacts RENAME COLUMN hubspot_contact_id TO ghl_contact_id;
