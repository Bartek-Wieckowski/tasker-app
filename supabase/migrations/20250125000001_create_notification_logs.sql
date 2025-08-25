-- Table for logging sent notifications
CREATE TABLE IF NOT EXISTS "public"."notification_logs" (
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "notification_type" "text" NOT NULL DEFAULT 'daily_reminder',
    "message" "text" NOT NULL,
    "incomplete_todos_count" integer DEFAULT 0,
    "sent_at" timestamp with time zone DEFAULT now() NOT NULL,
    "status" "text" DEFAULT 'pending' NOT NULL, -- pending, sent, failed
    "error_message" "text", -- for sending errors
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    
    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notification_logs_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "public"."db_users"("id") ON DELETE CASCADE
);

-- Indexes
CREATE INDEX "idx_notification_logs_user_id" ON "public"."notification_logs" ("user_id");
CREATE INDEX "idx_notification_logs_sent_at" ON "public"."notification_logs" ("sent_at");
CREATE INDEX "idx_notification_logs_type" ON "public"."notification_logs" ("notification_type");
CREATE INDEX "idx_notification_logs_status" ON "public"."notification_logs" ("status");

-- Row Level Security
ALTER TABLE "public"."notification_logs" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notification logs" ON "public"."notification_logs"
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification logs" ON "public"."notification_logs"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage notification logs" ON "public"."notification_logs"
    FOR ALL USING (auth.role() = 'service_role');

-- Trigger for updated_at (if needed)
CREATE TRIGGER update_notification_logs_updated_at 
    BEFORE UPDATE ON "public"."notification_logs"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Permissions
GRANT ALL ON TABLE "public"."notification_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_logs" TO "service_role";

-- Function to clean up old logs (optional)
CREATE OR REPLACE FUNCTION cleanup_old_notification_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete logs older than 90 days
  DELETE FROM notification_logs 
  WHERE sent_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Cleaned up % old notification logs', deleted_count;
  RETURN deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION cleanup_old_notification_logs() TO service_role;

COMMENT ON TABLE "public"."notification_logs" IS 
'Logs all sent push notifications for debugging and statistics.';

COMMENT ON COLUMN "public"."notification_logs"."notification_type" IS 
'Notification type: daily_reminder, urgent_alert, etc.';

COMMENT ON COLUMN "public"."notification_logs"."status" IS 
'Sending status: pending (waiting), sent (sent), failed (error).';
