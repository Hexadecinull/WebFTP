-- Add self-service account suspension (deactivation) support.
-- This is NOT an admin ban — users suspend/reactivate their own accounts.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS suspended BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

-- Users can update their own suspended status (part of the existing
-- "Users can update their own profile" policy — no new policy needed
-- since that policy already covers UPDATE on any column for auth.uid() = id).
