-- Create todos table with image support
CREATE TABLE IF NOT EXISTS "public"."todos" (
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "todo" "text" NOT NULL,
    "todo_more_content" "text",
    "image_url" "text",
    "is_completed" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone,
    "original_todo_id" "uuid",
    "is_independent_edit" boolean DEFAULT false,
    "from_delegated" boolean DEFAULT false,
    "todo_date" date NOT NULL,
    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);

-- Create delegated_todos table for future functionality
CREATE TABLE IF NOT EXISTS "public"."delegated_todos" (
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "todo" "text" NOT NULL,
    "todo_more_content" "text",
    "image_url" "text",
    "is_completed" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone,
    "original_todo_id" "uuid",
    "from_delegated" boolean DEFAULT false,
    "delegated_by" "uuid",
    "delegated_at" timestamp with time zone,
    CONSTRAINT "delegated_todos_pkey" PRIMARY KEY ("id")
);

-- Create global_todos table for future functionality
CREATE TABLE IF NOT EXISTS "public"."global_todos" (
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "todo" "text" NOT NULL,
    "todo_more_content" "text",
    "image_url" "text",
    "is_completed" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone,
    "original_todo_id" "uuid",
    "from_delegated" boolean DEFAULT false,
    "delegated_by" "uuid",
    "delegated_at" timestamp with time zone,
    CONSTRAINT "global_todos_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE ONLY "public"."todos"
    ADD CONSTRAINT "todos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."db_users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."delegated_todos"
    ADD CONSTRAINT "delegated_todos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."db_users"("id") ON DELETE CASCADE,
    ADD CONSTRAINT "delegated_todos_delegated_by_fkey" FOREIGN KEY ("delegated_by") REFERENCES "public"."db_users"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."global_todos"
    ADD CONSTRAINT "global_todos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."db_users"("id") ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX "idx_todos_user_id" ON "public"."todos" USING "btree" ("user_id");
CREATE INDEX "idx_todos_todo_date" ON "public"."todos" USING "btree" ("todo_date");
CREATE INDEX "idx_todos_user_date" ON "public"."todos" USING "btree" ("user_id", "todo_date");
CREATE INDEX "idx_todos_original_todo_id" ON "public"."todos" USING "btree" ("original_todo_id");
CREATE INDEX "idx_todos_is_completed" ON "public"."todos" USING "btree" ("is_completed");

CREATE INDEX "idx_delegated_todos_user_id" ON "public"."delegated_todos" USING "btree" ("user_id");
CREATE INDEX "idx_delegated_todos_delegated_by" ON "public"."delegated_todos" USING "btree" ("delegated_by");

CREATE INDEX "idx_global_todos_user_id" ON "public"."global_todos" USING "btree" ("user_id");

-- Enable Row Level Security
ALTER TABLE "public"."todos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."delegated_todos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."global_todos" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for todos table
CREATE POLICY "Users can view their own todos" ON "public"."todos"
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos" ON "public"."todos"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" ON "public"."todos"
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" ON "public"."todos"
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for delegated_todos table
CREATE POLICY "Users can view delegated todos assigned to them" ON "public"."delegated_todos"
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert delegated todos" ON "public"."delegated_todos"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update delegated todos assigned to them" ON "public"."delegated_todos"
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete delegated todos assigned to them" ON "public"."delegated_todos"
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for global_todos table
CREATE POLICY "Users can view public global todos" ON "public"."global_todos"
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert global todos" ON "public"."global_todos"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update global todos they created or are assigned to" ON "public"."global_todos"
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete global todos they created" ON "public"."global_todos"
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON "public"."todos"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delegated_todos_updated_at BEFORE UPDATE ON "public"."delegated_todos"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_global_todos_updated_at BEFORE UPDATE ON "public"."global_todos"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON TABLE "public"."todos" TO "authenticated";
GRANT ALL ON TABLE "public"."delegated_todos" TO "authenticated";
GRANT ALL ON TABLE "public"."global_todos" TO "authenticated";

GRANT USAGE ON SCHEMA "public" TO "authenticated";
