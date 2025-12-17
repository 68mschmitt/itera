-- Phase 2: Runs table for reproducible execution tracking

CREATE TABLE runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt_version_id INTEGER NOT NULL,
  
  -- Input tracking
  input_json TEXT NOT NULL,           -- JSON string
  input_hash TEXT NOT NULL,           -- SHA256 hash
  template_vars_json TEXT NOT NULL,   -- Extracted vars as JSON
  rendered_prompt TEXT NOT NULL,      -- Final prompt sent to model
  
  -- Provider/model config
  provider_spec_json TEXT NOT NULL,   -- e.g., {"provider":"ollama","base_url":"..."}
  model_id TEXT NOT NULL,             -- e.g., "llama3.1:8b"
  model_params_json TEXT NOT NULL,    -- temperature, top_p, etc.
  
  -- Results
  status TEXT NOT NULL,               -- 'success' | 'error'
  error_text TEXT,                    -- Nullable, only on error
  output_text TEXT,                   -- Nullable on error
  
  -- Metrics
  latency_ms INTEGER,                 -- Nullable
  prompt_tokens INTEGER,              -- Nullable (if available)
  completion_tokens INTEGER,          -- Nullable (if available)
  cost_estimate REAL DEFAULT 0,       -- For future cloud models
  
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  
  FOREIGN KEY (prompt_version_id) REFERENCES prompt_versions(id)
);

-- Indexes for common queries
CREATE INDEX idx_runs_prompt_version ON runs(prompt_version_id);
CREATE INDEX idx_runs_input_hash ON runs(input_hash);
CREATE INDEX idx_runs_created_at ON runs(created_at DESC);
