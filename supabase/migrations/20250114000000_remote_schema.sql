

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."deactivate_user"("p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  update public.db_users
  set is_active = false
  where id = p_user_id;
end;
$$;


ALTER FUNCTION "public"."deactivate_user"("p_user_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."db_users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "lang" "text" DEFAULT 'en' NOT NULL,
    CONSTRAINT "valid_lang" CHECK ("lang" IN ('en', 'pl'))
);


ALTER TABLE "public"."db_users" OWNER TO "postgres";

ALTER TABLE ONLY "public"."db_users"
    ADD CONSTRAINT "db_users_pkey" PRIMARY KEY ("id");

CREATE INDEX "idx_db_users_email" ON "public"."db_users" USING "btree" ("email");

CREATE INDEX "idx_db_users_email_active" ON "public"."db_users" USING "btree" ("email", "is_active");

CREATE INDEX "idx_db_users_is_active" ON "public"."db_users" USING "btree" ("is_active");

CREATE INDEX "idx_db_users_lang" ON "public"."db_users" USING "btree" ("lang");



CREATE POLICY "Allow active users to SELECT" ON "public"."db_users" FOR SELECT USING ((("auth"."uid"() = "id") AND ("is_active" = true)));

ALTER TABLE "public"."db_users" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


GRANT ALL ON FUNCTION "public"."deactivate_user"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."deactivate_user"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."deactivate_user"("p_user_id" "uuid") TO "service_role";


GRANT ALL ON TABLE "public"."db_users" TO "anon";
GRANT ALL ON TABLE "public"."db_users" TO "authenticated";
GRANT ALL ON TABLE "public"."db_users" TO "service_role";


ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";


ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";


ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";


RESET ALL;
