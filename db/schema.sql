-- Giveaway schema. Idempotent: safe to run any number of times.
-- Statements are separated by a semicolon at the end of a line (the migrate
-- script splits on that), so keep semicolons out of comments and strings.

CREATE TABLE IF NOT EXISTS entries (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name    text        NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 80),
  email         text        NOT NULL CHECK (char_length(email) <= 254 AND email = lower(btrim(email))),
  phone         text        NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 32),
  has_idea      boolean     NOT NULL,
  idea          text        CHECK (idea IS NULL OR char_length(idea) BETWEEN 1 AND 500),
  referral_code text        NOT NULL CHECK (referral_code ~ '^[A-Z2-9]{6,8}$'),
  referred_by   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT entries_email_key UNIQUE (email),
  CONSTRAINT entries_referral_code_key UNIQUE (referral_code),
  CONSTRAINT entries_referred_by_fkey FOREIGN KEY (referred_by)
    REFERENCES entries (referral_code) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT entries_no_self_referral CHECK (referred_by IS NULL OR referred_by <> referral_code),
  CONSTRAINT entries_idea_matches_flag CHECK (has_idea = (idea IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS entries_referred_by_idx ON entries (referred_by) WHERE referred_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS entries_created_at_idx ON entries (created_at DESC);

-- One row per referral-link visit. No personal data: no IP, no user agent.
CREATE TABLE IF NOT EXISTS referral_visits (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  referral_code text        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT referral_visits_referral_code_fkey FOREIGN KEY (referral_code)
    REFERENCES entries (referral_code) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS referral_visits_referral_code_idx ON referral_visits (referral_code);
