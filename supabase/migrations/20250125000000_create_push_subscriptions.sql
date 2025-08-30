-- Table for push notification subscriptions
CREATE TABLE IF NOT EXISTS "public"."push_subscriptions" (
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL,
    "user_id" "uuid" NOT NULL,
    
    -- Push subscription data (from browser API)
    "endpoint" "text" NOT NULL,
    "p256dh_key" "text" NOT NULL,
    "auth_key" "text" NOT NULL,
    
    -- Metadata
    "user_agent" "text",
    "device_type" "text", -- mobile, desktop, tablet
    "browser_name" "text", -- Chrome, Firefox, Safari, etc.
    
    -- Management
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now(),
    "last_used_at" timestamp with time zone DEFAULT now(),
    
    -- Constraints
    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "push_subscriptions_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "public"."db_users"("id") ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX "idx_push_subscriptions_user_id" ON "public"."push_subscriptions" ("user_id");
CREATE INDEX "idx_push_subscriptions_active" ON "public"."push_subscriptions" ("is_active");
CREATE INDEX "idx_push_subscriptions_endpoint" ON "public"."push_subscriptions" ("endpoint");

-- Unique endpoint per user (needed for upsert)
CREATE UNIQUE INDEX "idx_push_subscriptions_user_endpoint" 
ON "public"."push_subscriptions" ("user_id", "endpoint");

-- Row Level Security
ALTER TABLE "public"."push_subscriptions" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users and service role can view subscriptions" ON "public"."push_subscriptions"
    FOR SELECT USING (
        (select auth.uid()) = user_id OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users and service role can insert subscriptions" ON "public"."push_subscriptions"
    FOR INSERT WITH CHECK (
        (select auth.uid()) = user_id OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users and service role can update subscriptions" ON "public"."push_subscriptions"
    FOR UPDATE USING (
        (select auth.uid()) = user_id OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Service role can delete subscriptions" ON "public"."push_subscriptions"
    FOR DELETE USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_push_subscriptions_updated_at 
    BEFORE UPDATE ON "public"."push_subscriptions"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Permissions
GRANT ALL ON TABLE "public"."push_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "service_role";

-- Function to clean up inactive subscriptions (optional)
CREATE OR REPLACE FUNCTION cleanup_inactive_push_subscriptions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete subscriptions not used for 30 days
  DELETE FROM push_subscriptions 
  WHERE is_active = false 
    AND updated_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Cleaned up % inactive push subscriptions', deleted_count;
  RETURN deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION cleanup_inactive_push_subscriptions() TO service_role;

COMMENT ON TABLE "public"."push_subscriptions" IS 
'Stores push notification subscriptions. One user can have many active subscriptions (different devices/browsers).';

COMMENT ON COLUMN "public"."push_subscriptions"."endpoint" IS 
'Unique URL endpoint for sending push notifications for a given device.';

COMMENT ON COLUMN "public"."push_subscriptions"."p256dh_key" IS 
'Public key for encrypting push messages (from browser Push API).';

COMMENT ON COLUMN "public"."push_subscriptions"."auth_key" IS 
'Authorization key for verifying sender (from browser Push API).';
