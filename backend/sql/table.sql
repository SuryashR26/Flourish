Create Table public.users
(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT NOT NULL UNIQUE,
    password    TEXT ,
    first_name  TEXT,
    last_name   TEXT ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_admin    BOOLEAN NOT NULL DEFAULT FALSE,
    age         INTEGER CHECK (age >= 13),
    personal_preferences varchar(500),
    code        TEXT, 
    profileurl varchar, 
    CONSTRAINT email_unique UNIQUE (email),
);

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

Create Table public.postData 
(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_image TEXT,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL,
    role_count  INTEGER  DEFAULT 1,
    role_description TEXT,
    image_url   TEXT,
    project_tags TEXT[],
    skill_tags   TEXT[],
    status      TEXT NOT NULL DEFAULT 'active',
    location_preference TEXT NOT NULL DEFAULT 'remote',
    location     TEXT,
    difficulty  TEXT NOT NULL DEFAULT 'beginner',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_draft    BOOLEAN NOT NULL DEFAULT FALSE,
)