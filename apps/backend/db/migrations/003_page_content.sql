CREATE TABLE page_content_current (
  page_name text NOT NULL,
  page_version integer NOT NULL CHECK (page_version > 0),
  cell text NOT NULL,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (page_name, cell)
);

CREATE TABLE page_content_history (
  page_name text NOT NULL,
  page_version integer NOT NULL CHECK (page_version > 0),
  cell text NOT NULL,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (page_name, page_version, cell)
);

CREATE INDEX page_content_history_page_version_idx
  ON page_content_history (page_name, page_version DESC);
