-- 1. Główna tabela współdzielonych todos
CREATE TABLE IF NOT EXISTS "public"."coop_todos_shared" (
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    
    -- Nazwa tabeli/grupy todos
    "table_name" "text" NOT NULL,
    "description" "text",
    
    -- Właściciel tabeli (reference do db_users)
    "owner_user_id" "uuid" REFERENCES "public"."db_users"("id") ON DELETE CASCADE NOT NULL,
    
    -- Array emailów które mają dostęp (włącznie z owner email)
    "member_emails" "text"[] NOT NULL DEFAULT '{}',
    
    -- Czy tabela jest aktywna
    "is_active" boolean DEFAULT true NOT NULL,
    
    CONSTRAINT "coop_todos_shared_pkey" PRIMARY KEY ("id")
);

-- 2. Tabela todos powiązana z shared table
CREATE TABLE IF NOT EXISTS "public"."coop_todos" (
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL,
    "shared_table_id" "uuid" REFERENCES coop_todos_shared(id) ON DELETE CASCADE NOT NULL,
    "creator_user_id" "uuid" REFERENCES "public"."db_users"("id") ON DELETE CASCADE NOT NULL,
    "todo" "text" NOT NULL,
    "todo_more_content" "text",
    "is_completed" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone,
    "who_updated" "uuid" REFERENCES "public"."db_users"("id") ON DELETE SET NULL,
    "who_completed" "uuid" REFERENCES "public"."db_users"("id") ON DELETE SET NULL,
    "completed_at" timestamp with time zone,
    CONSTRAINT "coop_todos_pkey" PRIMARY KEY ("id")
);

-- 3. Tabela zaproszeń (tymczasowa, do czasu akceptacji)
CREATE TABLE IF NOT EXISTS "public"."coop_invitations" (
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    
    -- Do jakiej tabeli zaproszenie
    "shared_table_id" "uuid" REFERENCES coop_todos_shared(id) ON DELETE CASCADE NOT NULL,
    
    -- Kto zaprasza (reference do db_users)
    "inviter_user_id" "uuid" REFERENCES "public"."db_users"("id") ON DELETE CASCADE NOT NULL,
    
    -- Kogo zaprasza (przez email)
    "invitee_email" "text" NOT NULL,
    "invitee_user_id" "uuid" REFERENCES "public"."db_users"("id") ON DELETE SET NULL,
    
    -- Status
    "status" "text" CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending' NOT NULL,
    "expires_at" timestamp with time zone DEFAULT (now() + interval '7 days') NOT NULL,
    
    CONSTRAINT "coop_invitations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "unique_pending_invitation" UNIQUE ("shared_table_id", "invitee_email")
);

-- 4. Indeksy
CREATE INDEX IF NOT EXISTS "idx_coop_todos_shared_table_id" ON "coop_todos"("shared_table_id");
CREATE INDEX IF NOT EXISTS "idx_coop_todos_creator_user_id" ON "coop_todos"("creator_user_id");
CREATE INDEX IF NOT EXISTS "idx_coop_todos_is_completed" ON "coop_todos"("is_completed");
CREATE INDEX IF NOT EXISTS "idx_coop_todos_who_updated" ON "coop_todos"("who_updated");
CREATE INDEX IF NOT EXISTS "idx_coop_todos_who_completed" ON "coop_todos"("who_completed");

CREATE INDEX IF NOT EXISTS "idx_shared_owner_user_id" ON "coop_todos_shared"("owner_user_id");
CREATE INDEX IF NOT EXISTS "idx_shared_member_emails" ON "coop_todos_shared" USING GIN("member_emails");
CREATE INDEX IF NOT EXISTS "idx_shared_is_active" ON "coop_todos_shared"("is_active");

CREATE INDEX IF NOT EXISTS "idx_invitations_shared_table" ON "coop_invitations"("shared_table_id");
CREATE INDEX IF NOT EXISTS "idx_invitations_inviter" ON "coop_invitations"("inviter_user_id");
CREATE INDEX IF NOT EXISTS "idx_invitations_invitee_email" ON "coop_invitations"("invitee_email");
CREATE INDEX IF NOT EXISTS "idx_invitations_invitee_user" ON "coop_invitations"("invitee_user_id");
CREATE INDEX IF NOT EXISTS "idx_invitations_status" ON "coop_invitations"("status");

-- 5. Triggery do updated_at i śledzenia zmian
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger do automatycznego ustawiania who_updated
CREATE OR REPLACE FUNCTION set_who_updated()
RETURNS TRIGGER AS $$
BEGIN
    -- Ustaw who_updated przy każdej aktualizacji
    NEW.who_updated = auth.uid();
    
    -- Jeśli zmieniono is_completed na true, ustaw who_completed i completed_at
    IF OLD.is_completed = false AND NEW.is_completed = true THEN
        NEW.who_completed = auth.uid();
        NEW.completed_at = NOW();
    END IF;
    
    -- Jeśli zmieniono is_completed z true na false, wyczyść who_completed i completed_at
    IF OLD.is_completed = true AND NEW.is_completed = false THEN
        NEW.who_completed = NULL;
        NEW.completed_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coop_todos_updated_at 
    BEFORE UPDATE ON coop_todos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_coop_todos_who_updated 
    BEFORE UPDATE ON coop_todos 
    FOR EACH ROW EXECUTE FUNCTION set_who_updated();

CREATE TRIGGER update_coop_todos_shared_updated_at 
    BEFORE UPDATE ON coop_todos_shared 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. RLS (Row Level Security)
-- Zakładając że używasz auth.uid() do identyfikacji aktualnego użytkownika w RLS
ALTER TABLE coop_todos_shared ENABLE ROW LEVEL SECURITY;
ALTER TABLE coop_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE coop_invitations ENABLE ROW LEVEL SECURITY;

-- Funkcja pomocnicza do pobrania emaila aktualnego użytkownika
CREATE OR REPLACE FUNCTION current_user_email()
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT email FROM db_users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Polityki dla coop_todos_shared - widzi tylko te tabele gdzie jest członkiem
CREATE POLICY "Users can view tables they are members of" ON coop_todos_shared
    FOR SELECT USING (
        current_user_email() = ANY(member_emails) AND is_active = true
    );

CREATE POLICY "Users can create shared tables" ON coop_todos_shared
    FOR INSERT WITH CHECK (
        owner_user_id = auth.uid() AND 
        current_user_email() = ANY(member_emails)
    );

CREATE POLICY "Owners can update their tables" ON coop_todos_shared
    FOR UPDATE USING (owner_user_id = auth.uid());

CREATE POLICY "Owners can delete their tables" ON coop_todos_shared
    FOR DELETE USING (owner_user_id = auth.uid());

-- Polityki dla coop_todos - widzi tylko todos z tabel gdzie jest członkiem
CREATE POLICY "Users can view todos from accessible tables" ON coop_todos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM coop_todos_shared cts
            WHERE cts.id = coop_todos.shared_table_id
            AND current_user_email() = ANY(cts.member_emails)
            AND cts.is_active = true
        )
    );

CREATE POLICY "Users can insert todos to accessible tables" ON coop_todos
    FOR INSERT WITH CHECK (
        creator_user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM coop_todos_shared cts
            WHERE cts.id = shared_table_id
            AND current_user_email() = ANY(cts.member_emails)
            AND cts.is_active = true
        )
    );

CREATE POLICY "Users can update todos in accessible tables" ON coop_todos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM coop_todos_shared cts
            WHERE cts.id = coop_todos.shared_table_id
            AND current_user_email() = ANY(cts.member_emails)
            AND cts.is_active = true
        )
    );

-- Brakująca polityka DELETE
CREATE POLICY "Users can delete todos in accessible tables" ON coop_todos
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM coop_todos_shared cts
            WHERE cts.id = coop_todos.shared_table_id
            AND current_user_email() = ANY(cts.member_emails)
            AND cts.is_active = true
        )
    );

-- Polityki dla coop_invitations
CREATE POLICY "Users can view relevant invitations" ON coop_invitations
    FOR SELECT USING (
        inviter_user_id = auth.uid() OR 
        invitee_user_id = auth.uid() OR 
        invitee_email = current_user_email()
    );

CREATE POLICY "Members can create invitations" ON coop_invitations
    FOR INSERT WITH CHECK (
        inviter_user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM coop_todos_shared cts
            WHERE cts.id = shared_table_id
            AND current_user_email() = ANY(cts.member_emails)
        )
    );

CREATE POLICY "Invitees can update invitations" ON coop_invitations
    FOR UPDATE USING (
        invitee_user_id = auth.uid() OR 
        invitee_email = current_user_email()
    );

-- 7. Funkcje pomocnicze

-- Tworzenie nowej shared tabeli
CREATE OR REPLACE FUNCTION create_shared_todos_table(
    p_table_name TEXT,
    p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    table_id UUID;
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM db_users WHERE id = auth.uid();
    
    IF user_email IS NULL THEN
        RAISE EXCEPTION 'Użytkownik nie jest zalogowany lub nie istnieje';
    END IF;
    
    INSERT INTO coop_todos_shared (
        table_name,
        description,
        owner_user_id,
        member_emails
    ) VALUES (
        p_table_name,
        p_description,
        auth.uid(),
        ARRAY[user_email]  -- owner automatycznie jest członkiem
    ) RETURNING id INTO table_id;
    
    RETURN table_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Zapraszanie do shared tabeli
CREATE OR REPLACE FUNCTION invite_to_shared_table(
    p_shared_table_id UUID,
    p_invitee_email TEXT
) RETURNS UUID AS $$
DECLARE
    invitation_id UUID;
    current_user_email TEXT;
    invitee_user_id UUID;
    existing_invitation_id UUID;
BEGIN
    SELECT email INTO current_user_email FROM db_users WHERE id = auth.uid();
    
    -- Sprawdź czy zapraszający ma dostęp do tabeli
    IF NOT EXISTS (
        SELECT 1 FROM coop_todos_shared 
        WHERE id = p_shared_table_id 
        AND current_user_email = ANY(member_emails)
        AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Nie masz dostępu do tej tabeli';
    END IF;
    
    -- Sprawdź czy email już nie jest członkiem
    IF EXISTS (
        SELECT 1 FROM coop_todos_shared 
        WHERE id = p_shared_table_id 
        AND p_invitee_email = ANY(member_emails)
    ) THEN
        RAISE EXCEPTION 'Ten email już ma dostęp do tabeli';
    END IF;
    
    -- Sprawdź czy użytkownik o tym emailu istnieje w db_users
    SELECT id INTO invitee_user_id FROM db_users WHERE email = p_invitee_email;
    
    IF invitee_user_id IS NULL THEN
        RAISE EXCEPTION 'Użytkownik o emailu % nie istnieje w systemie', p_invitee_email;
    END IF;
    
    -- Sprawdź czy już istnieje zaproszenie dla tego emaila i tabeli
    SELECT id INTO existing_invitation_id 
    FROM coop_invitations 
    WHERE shared_table_id = p_shared_table_id 
    AND invitee_email = p_invitee_email;
    
    IF existing_invitation_id IS NOT NULL THEN
        -- Aktualizuj istniejące zaproszenie
        UPDATE coop_invitations 
        SET 
            status = 'pending',
            expires_at = NOW() + interval '7 days',
            inviter_user_id = auth.uid(),
            invitee_user_id = COALESCE(invitee_user_id, invitee_user_id)
        WHERE id = existing_invitation_id
        RETURNING id INTO invitation_id;
    ELSE
        -- Utwórz nowe zaproszenie
        INSERT INTO coop_invitations (
            shared_table_id,
            inviter_user_id,
            invitee_email,
            invitee_user_id
        ) VALUES (
            p_shared_table_id,
            auth.uid(),
            p_invitee_email,
            invitee_user_id
        ) RETURNING id INTO invitation_id;
    END IF;
    
    RETURN invitation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Akceptacja zaproszenia
CREATE OR REPLACE FUNCTION accept_invitation(
    p_invitation_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    invitation_record RECORD;
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM db_users WHERE id = auth.uid();
    
    -- Pobierz zaproszenie
    SELECT * INTO invitation_record
    FROM coop_invitations 
    WHERE id = p_invitation_id 
    AND (invitee_user_id = auth.uid() OR invitee_email = user_email)
    AND status = 'pending'
    AND expires_at > NOW();
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Zaproszenie nie zostało znalezione lub wygasło';
    END IF;
    
    -- KLUCZOWA CZĘŚĆ: Dodaj email do member_emails w shared table
    UPDATE coop_todos_shared 
    SET member_emails = array_append(member_emails, user_email)
    WHERE id = invitation_record.shared_table_id;
    
    -- Oznacz zaproszenie jako zaakceptowane i ustaw user_id jeśli nie był ustawiony
    UPDATE coop_invitations 
    SET 
        status = 'accepted',
        invitee_user_id = COALESCE(invitee_user_id, auth.uid())
    WHERE id = p_invitation_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Odrzucenie zaproszenia
CREATE OR REPLACE FUNCTION decline_invitation(
    p_invitation_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM db_users WHERE id = auth.uid();
    
    UPDATE coop_invitations 
    SET status = 'declined'
    WHERE id = p_invitation_id 
    AND (invitee_user_id = auth.uid() OR invitee_email = user_email)
    AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Zaproszenie nie zostało znalezione';
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Opuszczenie tabeli / usunięcie członka
CREATE OR REPLACE FUNCTION leave_shared_table(
    p_shared_table_id UUID,
    p_email_to_remove TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    current_user_email TEXT;
    target_email TEXT;
    table_record RECORD;
BEGIN
    SELECT email INTO current_user_email FROM db_users WHERE id = auth.uid();
    
    -- Jeśli nie podano emaila, użyj swojego
    target_email := COALESCE(p_email_to_remove, current_user_email);
    
    -- Pobierz informacje o tabeli
    SELECT cts.*, du.email as owner_email 
    INTO table_record
    FROM coop_todos_shared cts
    JOIN db_users du ON du.id = cts.owner_user_id
    WHERE cts.id = p_shared_table_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tabela nie została znaleziona';
    END IF;
    
    -- Sprawdź uprawnienia
    IF target_email != current_user_email AND table_record.owner_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Nie masz uprawnień do usunięcia tego użytkownika';
    END IF;
    
    -- Nie pozwól właścicielowi opuścić własnej tabeli
    IF target_email = table_record.owner_email THEN
        RAISE EXCEPTION 'Właściciel nie może opuścić własnej tabeli';
    END IF;
    
    -- Usuń email z member_emails
    UPDATE coop_todos_shared 
    SET member_emails = array_remove(member_emails, target_email)
    WHERE id = p_shared_table_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Widoki pomocnicze

-- Tabele dostępne dla użytkownika
CREATE OR REPLACE VIEW my_shared_tables AS
SELECT 
    cts.*,
    du.email as owner_email,
    CASE 
        WHEN cts.owner_user_id = auth.uid() THEN 'owner'
        ELSE 'member'
    END as my_role,
    array_length(cts.member_emails, 1) as member_count
FROM coop_todos_shared cts
JOIN db_users du ON du.id = cts.owner_user_id
WHERE current_user_email() = ANY(cts.member_emails)
AND cts.is_active = true;

-- Todos z wszystkich dostępnych tabel
CREATE OR REPLACE VIEW my_accessible_todos AS
SELECT 
    ct.*,
    cts.table_name,
    owner_du.email as table_owner_email,
    creator_du.email as creator_email,
    updated_du.email as updated_by_email,
    completed_du.email as completed_by_email,
    CASE 
        WHEN ct.creator_user_id = auth.uid() THEN 'own'
        ELSE 'shared'
    END as todo_type
FROM coop_todos ct
JOIN coop_todos_shared cts ON cts.id = ct.shared_table_id
JOIN db_users owner_du ON owner_du.id = cts.owner_user_id
JOIN db_users creator_du ON creator_du.id = ct.creator_user_id
LEFT JOIN db_users updated_du ON updated_du.id = ct.who_updated
LEFT JOIN db_users completed_du ON completed_du.id = ct.who_completed
WHERE current_user_email() = ANY(cts.member_emails)
AND cts.is_active = true;

-- Pending zaproszenia
CREATE OR REPLACE VIEW my_pending_invitations AS
SELECT 
    ci.*,
    cts.table_name,
    cts.description,
    inviter_du.email as inviter_email
FROM coop_invitations ci
JOIN coop_todos_shared cts ON cts.id = ci.shared_table_id
JOIN db_users inviter_du ON inviter_du.id = ci.inviter_user_id
WHERE (ci.invitee_user_id = auth.uid() OR ci.invitee_email = current_user_email())
AND ci.status = 'pending'
AND ci.expires_at > NOW();

-- Moje wysłane zaproszenia (wszystkie statusy)
CREATE OR REPLACE VIEW my_sent_invitations AS
SELECT 
    ci.id,
    ci.created_at,
    ci.expires_at,
    ci.invitee_email,
    ci.invitee_user_id,
    ci.inviter_user_id,
    ci.shared_table_id,
    ci.status,
    cts.table_name,
    cts.description,
    invitee_du.email as invitee_user_email
FROM coop_invitations ci
JOIN coop_todos_shared cts ON cts.id = ci.shared_table_id
LEFT JOIN db_users invitee_du ON invitee_du.id = ci.invitee_user_id
WHERE ci.inviter_user_id = auth.uid();

-- Moje otrzymane zaproszenia (wszystkie statusy)
CREATE OR REPLACE VIEW my_received_invitations AS
SELECT 
    ci.id,
    ci.created_at,
    ci.expires_at,
    ci.invitee_email,
    ci.invitee_user_id,
    ci.inviter_user_id,
    ci.shared_table_id,
    ci.status,
    cts.table_name,
    cts.description,
    inviter_du.email as inviter_email
FROM coop_invitations ci
JOIN coop_todos_shared cts ON cts.id = ci.shared_table_id
JOIN db_users inviter_du ON inviter_du.id = ci.inviter_user_id
WHERE (ci.invitee_user_id = auth.uid() OR ci.invitee_email = current_user_email());