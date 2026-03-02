-- ============================================================================
-- CRM Platform — Complete Database Schema
-- All 9 modules with RLS policies, indexes, and triggers
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- MODULE 1: Authentication & User Management
-- ============================================================================

CREATE TABLE teams (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    owner_id    UUID NOT NULL REFERENCES auth.users(id),
    plan        TEXT DEFAULT 'free',
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name   TEXT NOT NULL DEFAULT '',
    avatar_url  TEXT,
    role        TEXT NOT NULL DEFAULT 'viewer'
                CHECK (role IN ('admin', 'sales_manager', 'sales_rep', 'viewer')),
    team_id     UUID REFERENCES teams(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE audit_logs (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID NOT NULL REFERENCES auth.users(id),
    action        TEXT NOT NULL,
    resource_type TEXT,
    resource_id   UUID,
    ip            TEXT,
    timestamp     TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_profiles_team ON profiles(team_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- ============================================================================
-- MODULE 2: Contact Management
-- ============================================================================

CREATE TABLE companies (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id     UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    industry    TEXT,
    website     TEXT,
    size        TEXT,
    address     TEXT,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE contacts (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id     UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    owner_id    UUID NOT NULL REFERENCES auth.users(id),
    first_name  TEXT NOT NULL,
    last_name   TEXT NOT NULL,
    email       TEXT,
    phone       TEXT,
    company_id  UUID REFERENCES companies(id) ON DELETE SET NULL,
    status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    tags        TEXT[] DEFAULT '{}',
    source      TEXT,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),
    deleted_at  TIMESTAMPTZ  -- soft delete
);

CREATE TABLE tags (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id     UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    color_hex   TEXT DEFAULT '#008AD1'
);

CREATE TABLE contact_tags (
    contact_id  UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id      UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (contact_id, tag_id)
);

CREATE TABLE contact_activities (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id    UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    type          TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'task')),
    description   TEXT,
    performed_by  UUID NOT NULL REFERENCES auth.users(id),
    attachments   TEXT[] DEFAULT '{}',
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_contacts_team ON contacts(team_id);
CREATE INDEX idx_contacts_owner ON contacts(owner_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_company ON contacts(company_id);
CREATE INDEX idx_contacts_deleted ON contacts(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_team ON companies(team_id);
CREATE INDEX idx_contact_activities_contact ON contact_activities(contact_id);
CREATE INDEX idx_tags_team ON tags(team_id);

-- ============================================================================
-- MODULE 3: Lead Management
-- ============================================================================

CREATE TABLE lead_sources (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id     UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT
);

CREATE TABLE leads (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id                 UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    owner_id                UUID NOT NULL REFERENCES auth.users(id),
    name                    TEXT NOT NULL,
    email                   TEXT,
    phone                   TEXT,
    company                 TEXT,
    source                  TEXT,
    score                   INT DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    status                  TEXT DEFAULT 'new'
                            CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'disqualified')),
    converted_to_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ DEFAULT now(),
    updated_at              TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_leads_team ON leads(team_id);
CREATE INDEX idx_leads_owner ON leads(owner_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_score ON leads(score DESC);
CREATE INDEX idx_lead_sources_team ON lead_sources(team_id);

-- ============================================================================
-- MODULE 4: Sales Pipeline & Deal Management
-- ============================================================================

CREATE TABLE pipelines (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id     UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    is_default  BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pipeline_stages (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_id   UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    order_index   INT NOT NULL DEFAULT 0,
    probability   INT DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    color_hex     TEXT DEFAULT '#008AD1'
);

CREATE TABLE deals (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id       UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    pipeline_id   UUID NOT NULL REFERENCES pipelines(id),
    stage_id      UUID NOT NULL REFERENCES pipeline_stages(id),
    owner_id      UUID NOT NULL REFERENCES auth.users(id),
    contact_id    UUID REFERENCES contacts(id) ON DELETE SET NULL,
    company_id    UUID REFERENCES companies(id) ON DELETE SET NULL,
    name          TEXT NOT NULL,
    value         DECIMAL(15, 2) DEFAULT 0,
    currency      TEXT DEFAULT 'USD',
    close_date    DATE,
    probability   INT DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    status        TEXT DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
    lost_reason   TEXT,
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE deal_stage_history (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id       UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    from_stage_id UUID REFERENCES pipeline_stages(id),
    to_stage_id   UUID NOT NULL REFERENCES pipeline_stages(id),
    changed_by    UUID NOT NULL REFERENCES auth.users(id),
    changed_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE deal_products (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id     UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    product_id  TEXT NOT NULL,  -- external product reference
    qty         INT DEFAULT 1,
    unit_price  DECIMAL(12, 2) DEFAULT 0,
    discount    DECIMAL(5, 2) DEFAULT 0
);

-- Indexes
CREATE INDEX idx_pipelines_team ON pipelines(team_id);
CREATE INDEX idx_pipeline_stages_pipeline ON pipeline_stages(pipeline_id);
CREATE INDEX idx_deals_team ON deals(team_id);
CREATE INDEX idx_deals_pipeline ON deals(pipeline_id);
CREATE INDEX idx_deals_stage ON deals(stage_id);
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_close_date ON deals(close_date);
CREATE INDEX idx_deal_stage_history_deal ON deal_stage_history(deal_id);

-- ============================================================================
-- MODULE 5: Task & Activity Management
-- ============================================================================

CREATE TABLE tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    created_by      UUID NOT NULL REFERENCES auth.users(id),
    assigned_to     UUID REFERENCES auth.users(id),
    type            TEXT DEFAULT 'to-do'
                    CHECK (type IN ('call', 'email', 'meeting', 'to-do', 'follow-up')),
    title           TEXT NOT NULL,
    due_at          TIMESTAMPTZ,
    priority        TEXT DEFAULT 'medium'
                    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status          TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    contact_id      UUID REFERENCES contacts(id) ON DELETE SET NULL,
    deal_id         UUID REFERENCES deals(id) ON DELETE SET NULL,
    notes           TEXT,
    is_recurring    BOOLEAN DEFAULT false,
    recurrence_rule TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notifications (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID NOT NULL REFERENCES auth.users(id),
    type          TEXT NOT NULL,
    message       TEXT NOT NULL,
    resource_type TEXT,
    resource_id   UUID,
    read_at       TIMESTAMPTZ,
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_tasks_team ON tasks(team_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_due ON tasks(due_at);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;

-- ============================================================================
-- MODULE 6: Email & Communication Center
-- ============================================================================

CREATE TABLE email_templates (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id     UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    subject     TEXT NOT NULL,
    body_html   TEXT NOT NULL,
    variables   TEXT[] DEFAULT '{}',
    created_by  UUID NOT NULL REFERENCES auth.users(id),
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE emails_sent (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id     UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    sender_id   UUID NOT NULL REFERENCES auth.users(id),
    contact_id  UUID REFERENCES contacts(id) ON DELETE SET NULL,
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    subject     TEXT NOT NULL,
    body        TEXT NOT NULL,
    status      TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'queued', 'sent', 'delivered', 'bounced', 'failed')),
    opened_at   TIMESTAMPTZ,
    clicked_at  TIMESTAMPTZ,
    sent_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE email_campaigns (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    segment_filter  JSONB DEFAULT '{}',
    template_id     UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    scheduled_at    TIMESTAMPTZ,
    status          TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
    stats_json      JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_email_templates_team ON email_templates(team_id);
CREATE INDEX idx_emails_sent_team ON emails_sent(team_id);
CREATE INDEX idx_emails_sent_contact ON emails_sent(contact_id);
CREATE INDEX idx_email_campaigns_team ON email_campaigns(team_id);

-- ============================================================================
-- MODULE 8: Notifications & Automation
-- ============================================================================

CREATE TABLE automation_rules (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    trigger_event   TEXT NOT NULL,
    conditions_json JSONB DEFAULT '{}',
    actions_json    JSONB DEFAULT '{}',
    is_active       BOOLEAN DEFAULT true,
    created_by      UUID NOT NULL REFERENCES auth.users(id),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE automation_logs (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id       UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
    triggered_at  TIMESTAMPTZ DEFAULT now(),
    resource_type TEXT,
    resource_id   UUID,
    outcome       TEXT,
    error_msg     TEXT
);

-- Indexes
CREATE INDEX idx_automation_rules_team ON automation_rules(team_id);
CREATE INDEX idx_automation_logs_rule ON automation_logs(rule_id);

-- ============================================================================
-- UTILITY: updated_at trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at'
          AND table_schema = 'public'
    LOOP
        EXECUTE format(
            'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
            tbl
        );
    END LOOP;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) — Enabled on ALL tables
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------
-- RLS Policies: team-based isolation
-- Users can only see data belonging to their team
-- ----------------------------------------

-- Helper: get current user's team_id from profiles
CREATE OR REPLACE FUNCTION auth.user_team_id()
RETURNS UUID AS $$
    SELECT team_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Teams: owner or member can see their team
CREATE POLICY teams_select ON teams FOR SELECT USING (
    id = auth.user_team_id()
);
CREATE POLICY teams_insert ON teams FOR INSERT WITH CHECK (
    owner_id = auth.uid()
);
CREATE POLICY teams_update ON teams FOR UPDATE USING (
    owner_id = auth.uid()
);

-- Profiles: team members can see each other
CREATE POLICY profiles_select ON profiles FOR SELECT USING (
    team_id = auth.user_team_id() OR id = auth.uid()
);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (
    id = auth.uid()
);
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (
    id = auth.uid()
);

-- Audit logs: team members can read
CREATE POLICY audit_logs_select ON audit_logs FOR SELECT USING (
    user_id IN (SELECT id FROM profiles WHERE team_id = auth.user_team_id())
);
CREATE POLICY audit_logs_insert ON audit_logs FOR INSERT WITH CHECK (
    user_id = auth.uid()
);

-- Team-scoped tables: generic team_id based policies
-- (contacts, companies, leads, tags, pipelines, deals, tasks, etc.)

-- Macro-style policies for team_id tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN VALUES
        ('companies'), ('contacts'), ('tags'), ('lead_sources'), ('leads'),
        ('pipelines'), ('deals'), ('tasks'),
        ('email_templates'), ('emails_sent'), ('email_campaigns'),
        ('automation_rules')
    LOOP
        EXECUTE format('CREATE POLICY %I_team_select ON %I FOR SELECT USING (team_id = auth.user_team_id())', tbl, tbl);
        EXECUTE format('CREATE POLICY %I_team_insert ON %I FOR INSERT WITH CHECK (team_id = auth.user_team_id())', tbl, tbl);
        EXECUTE format('CREATE POLICY %I_team_update ON %I FOR UPDATE USING (team_id = auth.user_team_id())', tbl, tbl);
        EXECUTE format('CREATE POLICY %I_team_delete ON %I FOR DELETE USING (team_id = auth.user_team_id())', tbl, tbl);
    END LOOP;
END;
$$;

-- Contact tags: accessible if the contact belongs to the user's team
CREATE POLICY contact_tags_select ON contact_tags FOR SELECT USING (
    contact_id IN (SELECT id FROM contacts WHERE team_id = auth.user_team_id())
);
CREATE POLICY contact_tags_insert ON contact_tags FOR INSERT WITH CHECK (
    contact_id IN (SELECT id FROM contacts WHERE team_id = auth.user_team_id())
);
CREATE POLICY contact_tags_delete ON contact_tags FOR DELETE USING (
    contact_id IN (SELECT id FROM contacts WHERE team_id = auth.user_team_id())
);

-- Contact activities
CREATE POLICY contact_activities_select ON contact_activities FOR SELECT USING (
    contact_id IN (SELECT id FROM contacts WHERE team_id = auth.user_team_id())
);
CREATE POLICY contact_activities_insert ON contact_activities FOR INSERT WITH CHECK (
    performed_by = auth.uid()
);

-- Pipeline stages: accessible if pipeline belongs to user's team
CREATE POLICY pipeline_stages_select ON pipeline_stages FOR SELECT USING (
    pipeline_id IN (SELECT id FROM pipelines WHERE team_id = auth.user_team_id())
);
CREATE POLICY pipeline_stages_insert ON pipeline_stages FOR INSERT WITH CHECK (
    pipeline_id IN (SELECT id FROM pipelines WHERE team_id = auth.user_team_id())
);
CREATE POLICY pipeline_stages_update ON pipeline_stages FOR UPDATE USING (
    pipeline_id IN (SELECT id FROM pipelines WHERE team_id = auth.user_team_id())
);
CREATE POLICY pipeline_stages_delete ON pipeline_stages FOR DELETE USING (
    pipeline_id IN (SELECT id FROM pipelines WHERE team_id = auth.user_team_id())
);

-- Deal stage history
CREATE POLICY deal_stage_history_select ON deal_stage_history FOR SELECT USING (
    deal_id IN (SELECT id FROM deals WHERE team_id = auth.user_team_id())
);
CREATE POLICY deal_stage_history_insert ON deal_stage_history FOR INSERT WITH CHECK (
    changed_by = auth.uid()
);

-- Deal products
CREATE POLICY deal_products_select ON deal_products FOR SELECT USING (
    deal_id IN (SELECT id FROM deals WHERE team_id = auth.user_team_id())
);
CREATE POLICY deal_products_insert ON deal_products FOR INSERT WITH CHECK (
    deal_id IN (SELECT id FROM deals WHERE team_id = auth.user_team_id())
);
CREATE POLICY deal_products_update ON deal_products FOR UPDATE USING (
    deal_id IN (SELECT id FROM deals WHERE team_id = auth.user_team_id())
);
CREATE POLICY deal_products_delete ON deal_products FOR DELETE USING (
    deal_id IN (SELECT id FROM deals WHERE team_id = auth.user_team_id())
);

-- Notifications: user can only see their own
CREATE POLICY notifications_select ON notifications FOR SELECT USING (
    user_id = auth.uid()
);
CREATE POLICY notifications_insert ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY notifications_update ON notifications FOR UPDATE USING (
    user_id = auth.uid()
);

-- Automation logs: accessible if the rule belongs to user's team
CREATE POLICY automation_logs_select ON automation_logs FOR SELECT USING (
    rule_id IN (SELECT id FROM automation_rules WHERE team_id = auth.user_team_id())
);
CREATE POLICY automation_logs_insert ON automation_logs FOR INSERT WITH CHECK (true);

-- ============================================================================
-- SERVICE ROLE bypass (for backend API calls)
-- The service_role key bypasses RLS by default in Supabase
-- ============================================================================
