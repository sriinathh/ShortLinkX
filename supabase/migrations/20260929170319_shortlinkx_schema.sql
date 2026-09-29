/*
# ShortLinkX — Core Schema

## Overview
Creates the core tables for a multi-user URL shortening SaaS: folders, links,
clicks. Users authenticate via Supabase Auth (email/password) and each user can
only access their own rows.

## Tables
1. `folders` — user folders to organize links
   - id (uuid PK), user_id, name, created_at
2. `links` — short links created by users
   - id (uuid PK), user_id (owner), original_url, short_code (unique),
     title, folder_id (nullable FK), tags (text[]), password_hash (nullable),
     expires_at (nullable), is_active (bool), clicks_count (int counter),
     created_at, updated_at
3. `clicks` — individual click events for analytics
   - id (uuid PK), link_id (FK), ip_hash, country, device, browser, os,
     referrer, created_at

## Security (RLS)
- `folders`: owner-scoped CRUD
- `links`: owner-scoped CRUD (user_id = auth.uid())
- `clicks`: users can read clicks for their own links; anyone can insert
  clicks (anon + authenticated) since redirects happen without a session.
  UPDATE/DELETE restricted to the link owner via subquery.

## Important Notes
1. folders created BEFORE links so the FK reference resolves.
2. `user_id` columns default to `auth.uid()` so client inserts omitting
   user_id still satisfy RLS WITH CHECK.
3. `clicks` INSERT policy is open to anon — redirects are anonymous by design.
4. `increment_clicks` SECURITY DEFINER function bumps the counter safely.
*/

-- ============ folders (must exist before links FK) ============
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_folders" ON folders;
CREATE POLICY "select_own_folders" ON folders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_folders" ON folders;
CREATE POLICY "insert_own_folders" ON folders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_folders" ON folders;
CREATE POLICY "update_own_folders" ON folders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_folders" ON folders;
CREATE POLICY "delete_own_folders" ON folders FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ links ============
CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  original_url text NOT NULL,
  short_code text NOT NULL UNIQUE,
  title text,
  folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  password_hash text,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  clicks_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_links" ON links;
CREATE POLICY "select_own_links" ON links FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_links" ON links;
CREATE POLICY "insert_own_links" ON links FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_links" ON links;
CREATE POLICY "update_own_links" ON links FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_links" ON links;
CREATE POLICY "delete_own_links" ON links FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at DESC);

-- ============ clicks ============
CREATE TABLE IF NOT EXISTS clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  ip_hash text,
  country text,
  device text,
  browser text,
  os text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_clicks" ON clicks;
CREATE POLICY "select_own_clicks" ON clicks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM links WHERE links.id = clicks.link_id AND links.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_clicks" ON clicks;
CREATE POLICY "insert_clicks" ON clicks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_own_clicks" ON clicks;
CREATE POLICY "update_own_clicks" ON clicks FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM links WHERE links.id = clicks.link_id AND links.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_clicks" ON clicks;
CREATE POLICY "delete_own_clicks" ON clicks FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM links WHERE links.id = clicks.link_id AND links.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_clicks_link_id ON clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON clicks(created_at DESC);

-- ============ increment_clicks RPC ============
CREATE OR REPLACE FUNCTION increment_clicks(target_code text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE links SET clicks_count = clicks_count + 1 WHERE short_code = target_code;
$$;