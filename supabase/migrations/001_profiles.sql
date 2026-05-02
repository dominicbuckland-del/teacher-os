-- Profiles table: stores subscription status and usage counters per user
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'free',
  subscription_period_end TIMESTAMPTZ,
  comments_generated INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Check usage and increment atomically — SECURITY DEFINER so it can update profiles
-- regardless of RLS. Verifies via auth.uid() so users can't spoof.
CREATE OR REPLACE FUNCTION public.check_and_increment_usage()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
  v_limit   INTEGER := 10;
  v_new_count INTEGER;
BEGIN
  -- Ensure profile exists
  INSERT INTO public.profiles (id)
  VALUES (auth.uid())
  ON CONFLICT (id) DO NOTHING;

  SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();

  -- Subscribers always allowed
  IF v_profile.subscription_status = 'active' THEN
    UPDATE public.profiles
      SET comments_generated = comments_generated + 1, updated_at = NOW()
      WHERE id = auth.uid()
      RETURNING comments_generated INTO v_new_count;

    RETURN json_build_object(
      'allowed', true,
      'subscription_status', v_profile.subscription_status,
      'comments_generated', v_new_count
    );
  END IF;

  -- Free tier: enforce limit
  IF v_profile.comments_generated >= v_limit THEN
    RETURN json_build_object(
      'allowed', false,
      'subscription_status', v_profile.subscription_status,
      'comments_generated', v_profile.comments_generated,
      'limit', v_limit
    );
  END IF;

  -- Under limit: increment and allow
  UPDATE public.profiles
    SET comments_generated = comments_generated + 1, updated_at = NOW()
    WHERE id = auth.uid()
    RETURNING comments_generated INTO v_new_count;

  RETURN json_build_object(
    'allowed', true,
    'subscription_status', v_profile.subscription_status,
    'comments_generated', v_new_count,
    'limit', v_limit
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_and_increment_usage() TO authenticated;
