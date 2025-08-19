CREATE TABLE public.users
(
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               TEXT NOT NULL UNIQUE,
    password            TEXT,
    first_name          TEXT,
    last_name           TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
    is_admin            BOOLEAN NOT NULL DEFAULT FALSE,
    age                 INTEGER CHECK (age >= 13),
    personal_preferences TEXT[],        -- Changed from varchar(500) to text array
    code                TEXT,
    profileurl          TEXT,
    bookmark_projects   UUID[] DEFAULT '{}',  -- Array of UUIDs for bookmarked posts,
    birthday            DATE,
    phone_number        VARCHAR,
    last_active         TIMESTAMPTZ DEFAULT NOW(),
    last_notified       TIMESTAMPTZ DEFAULT NOW(),
    hasPosted           BOOLEAN
    fulltext            TSVECTOR GENERATED ALWAYS AS (
                            to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, ''))
                        ) STORED,
    CONSTRAINT email_unique UNIQUE (email)
);


CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_is_verified ON users(is_verified);
CREATE INDEX idx_users_preferences_gin ON users USING GIN (personal_preferences);
CREATE INDEX idx_users_fulltext ON users USING GIN (fulltext);


Create Table public.login_attempts
(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempt_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    success     BOOLEAN NOT NULL,
    ip_address  TEXT NOT NULL,
    email       TEXT NOT NULL,
);

Create Table public.contact_usSubmissions
(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name  TEXT NOT NULL,
    last_name   TEXT NOT NULL,
    email       TEXT NOT NULL,
    message     TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_resolved BOOLEAN DEFAULT FALSE
);

Create Table public.reset_password_requests
(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reset_code  TEXT NOT NULL,
    email       TEXT NOT NULL
);

CREATE TABLE public.postData (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_image TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    role_count INTEGER DEFAULT 1,
    role_description JSONB,
    project_tags TEXT[],
    skill_tags TEXT[],
    status TEXT NOT NULL DEFAULT 'active',
    location_preference TEXT NOT NULL DEFAULT 'remote',
    location TEXT,
    difficulty TEXT NOT NULL DEFAULT 'beginner',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    photourl VARCHAR,
    is_draft BOOLEAN NOT NULL DEFAULT FALSE,
    time_commitment TEXT,
    project_category TEXT

    
   
    document_with_weights TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(content, '')), 'B')
    ) STORED
);


CREATE INDEX idx_postdata_project_tags_gin ON public.postData USING GIN (project_tags);
CREATE INDEX idx_postdata_skill_tags_gin ON public.postData USING GIN (skill_tags);
CREATE INDEX idx_postdata_role_description_gin ON public.postData USING GIN (role_description);


CREATE INDEX idx_postdata_status ON public.postData (status);
CREATE INDEX idx_postdata_location_preference ON public.postData (location_preference);
CREATE INDEX idx_postdata_difficulty ON public.postData (difficulty);
CREATE INDEX idx_postdata_created_at ON public.postData (created_at);
CREATE INDEX idx_postdata_is_draft ON public.postData (is_draft);


CREATE INDEX idx_postdata_fulltext ON public.postData USING GIN (document_with_weights);

Create Table public.conversations 
(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT unique_participants UNIQUE(participant1_id, participant2_id),
    CONSTRAINT no_self_conversation CHECK (participant1_id != participant2_id)
);

Create Table public.messages 
(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE
)


CREATE TABLE post_views (
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  viewed_at TIMESTAMP DEFAULT NOW(),
);


CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,              
    actor_id UUID REFERENCES users(id) ON DELETE CASCADE, 
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
    target_id UUID,                        
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    actor_name TEXT,
);
