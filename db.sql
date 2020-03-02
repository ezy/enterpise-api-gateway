CREATE TABLE refresh_tokens (
  user_id varchar(8) NOT NULL PRIMARY KEY UNIQUE,
  access_token varchar(1024) NOT NULL,
  refresh_token varchar(512) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);