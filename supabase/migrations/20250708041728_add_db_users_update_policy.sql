-- Add UPDATE policy for db_users table
CREATE POLICY "Allow active users to UPDATE their own email" 
ON "public"."db_users" 
FOR UPDATE 
USING (("auth"."uid"() = "id") AND ("is_active" = true))
WITH CHECK (("auth"."uid"() = "id") AND ("is_active" = true)); 