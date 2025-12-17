-- Initial database schema for Itera

-- prompts table
CREATE TABLE prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  default_version_id INTEGER,
  FOREIGN KEY (default_version_id) REFERENCES prompt_versions(id)
);

-- prompt_versions table
CREATE TABLE prompt_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt_id INTEGER NOT NULL,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  parent_version_id INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_version_id) REFERENCES prompt_versions(id),
  UNIQUE(prompt_id, version_number)
);

-- Create index for faster lookups
CREATE INDEX idx_prompt_versions_prompt_id ON prompt_versions(prompt_id);
