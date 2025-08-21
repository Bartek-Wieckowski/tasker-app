-- Tabela dla push notification subscriptions
CREATE TABLE IF NOT EXISTS "public"."push_subscriptions" (
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL,
    "user_id" "uuid" NOT NULL,
    
    -- Push subscription data (z browser API)
    "endpoint" "text" NOT NULL,
    "p256dh_key" "text" NOT NULL,
    "auth_key" "text" NOT NULL,
    
    -- Metadane
    "user_agent" "text",
    "device_type" "text", -- mobile, desktop, tablet
    "browser_name" "text", -- Chrome, Firefox, Safari
    
    -- Zarządzanie
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now(),
    "last_used_at" timestamp with time zone DEFAULT now(),
    
    -- Ograniczenia
    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "push_subscriptions_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "public"."db_users"("id") ON DELETE CASCADE
);

-- Indeksy dla wydajności
CREATE INDEX "idx_push_subscriptions_user_id" ON "public"."push_subscriptions" ("user_id");
CREATE INDEX "idx_push_subscriptions_active" ON "public"."push_subscriptions" ("is_active");
CREATE INDEX "idx_push_subscriptions_endpoint" ON "public"."push_subscriptions" ("endpoint");

-- Unikalny endpoint per user (potrzebne dla upsert)
CREATE UNIQUE INDEX "idx_push_subscriptions_user_endpoint" 
ON "public"."push_subscriptions" ("user_id", "endpoint");

-- Row Level Security
ALTER TABLE "public"."push_subscriptions" ENABLE ROW LEVEL SECURITY;

-- Polityki RLS
CREATE POLICY "Users can view their own subscriptions" ON "public"."push_subscriptions"
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON "public"."push_subscriptions"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON "public"."push_subscriptions"
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can access all subscriptions" ON "public"."push_subscriptions"
    FOR ALL USING (auth.role() = 'service_role');

-- Trigger dla updated_at
CREATE TRIGGER update_push_subscriptions_updated_at 
    BEFORE UPDATE ON "public"."push_subscriptions"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Permissions
GRANT ALL ON TABLE "public"."push_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "service_role";

-- Funkcja do czyszczenia nieaktywnych subscriptions (opcjonalna)
CREATE OR REPLACE FUNCTION cleanup_inactive_push_subscriptions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Usuń subscriptions nieużywane przez 30 dni
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
'Przechowuje push notification subscriptions. Jeden user może mieć wiele aktywnych subscriptions (różne urządzenia/przeglądarki).';

COMMENT ON COLUMN "public"."push_subscriptions"."endpoint" IS 
'Unikalny URL endpoint do wysyłania push notifications dla danego urządzenia.';

COMMENT ON COLUMN "public"."push_subscriptions"."p256dh_key" IS 
'Klucz publiczny do szyfrowania wiadomości push (z browser Push API).';

COMMENT ON COLUMN "public"."push_subscriptions"."auth_key" IS 
'Klucz autoryzacji do weryfikacji nadawcy (z browser Push API).';
