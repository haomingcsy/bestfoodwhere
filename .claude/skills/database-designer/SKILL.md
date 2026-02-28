---
name: database-designer
description: Design Supabase database schemas, migrations, and RLS policies. Use when creating new tables, modifying schema, or implementing security policies.
---

# Database Designer Skill

Design and implement Supabase PostgreSQL schemas with proper types, relationships, and security.

## When to Use

- Creating new database tables
- Writing Supabase migrations
- Designing RLS (Row Level Security) policies
- Optimizing queries and indexes
- Setting up foreign key relationships

## Supabase Schema Patterns

### Table Creation Template

```sql
-- Migration: YYYYMMDDHHMMSS_create_tablename.sql

-- Create table
CREATE TABLE IF NOT EXISTS public.table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Foreign keys
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Data fields
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
  metadata JSONB DEFAULT '{}',

  -- Constraints
  CONSTRAINT table_name_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 255)
);

-- Indexes
CREATE INDEX idx_table_name_user_id ON public.table_name(user_id);
CREATE INDEX idx_table_name_status ON public.table_name(status);
CREATE INDEX idx_table_name_created_at ON public.table_name(created_at DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_table_name_updated_at
  BEFORE UPDATE ON public.table_name
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;
```

### RLS Policy Patterns

#### Public Read, Authenticated Write

```sql
-- Anyone can read
CREATE POLICY "Public read access"
  ON public.table_name FOR SELECT
  USING (true);

-- Only authenticated users can insert
CREATE POLICY "Authenticated insert"
  ON public.table_name FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own
CREATE POLICY "Users update own"
  ON public.table_name FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### Private User Data

```sql
-- Users can only see their own data
CREATE POLICY "Users read own data"
  ON public.table_name FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only modify their own data
CREATE POLICY "Users modify own data"
  ON public.table_name FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### Admin Access

```sql
-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admins can do anything
CREATE POLICY "Admin full access"
  ON public.table_name FOR ALL
  TO authenticated
  USING (is_admin());
```

## Common Table Patterns for BFW

### User Profile Extension

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Content with Status

```sql
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Many-to-Many Relationship

```sql
-- Junction table
CREATE TABLE public.article_tags (
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);
```

### Subscription/Membership

```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'basic', 'premium', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'expired')),
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## TypeScript Type Generation

After creating tables, generate types:

```bash
npx supabase gen types typescript --project-id <project-id> > types/database.ts
```

## Migration File Naming

Format: `YYYYMMDDHHMMSS_description.sql`

Examples:

- `20260103120000_create_profiles.sql`
- `20260103120100_add_user_roles.sql`
- `20260103120200_create_subscriptions.sql`

## Best Practices

1. **Always use UUIDs** for primary keys
2. **Include timestamps** (created_at, updated_at) on all tables
3. **Enable RLS** on every table
4. **Create indexes** for frequently queried columns
5. **Use CHECK constraints** for enum-like values
6. **Add foreign key constraints** with appropriate ON DELETE actions
7. **Use JSONB** for flexible metadata fields
