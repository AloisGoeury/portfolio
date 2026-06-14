ALTER TABLE projects
  ADD COLUMN github_repository_url text,
  ADD COLUMN last_commit_sha text,
  ADD COLUMN last_commit_url text,
  ADD COLUMN last_commit_message text,
  ADD COLUMN last_commit_at timestamptz;

CREATE UNIQUE INDEX projects_github_repository_url_unique_idx
  ON projects (lower(github_repository_url))
  WHERE github_repository_url IS NOT NULL;

CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  content_markdown text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notes_public_idx
  ON notes (published, published_at DESC, created_at DESC);

CREATE TABLE project_update_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  commit_sha text NOT NULL,
  commit_url text NOT NULL,
  commit_message text NOT NULL,
  committed_at timestamptz NOT NULL,
  author_name text,
  proposed_title text NOT NULL,
  proposed_content_markdown text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'published', 'ignored')),
  note_id uuid REFERENCES notes(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, commit_sha)
);

CREATE INDEX project_update_queue_status_idx
  ON project_update_queue (status, committed_at DESC);
