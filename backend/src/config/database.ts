import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Database from 'better-sqlite3';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DB_PATH = process.env.DATABASE_PATH || './data/itera.db';
const MIGRATIONS_DIR = join(__dirname, '../../migrations');

// Ensure data directory exists
const dataDir = dirname(DB_PATH);
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Create database connection
export const db = new Database(DB_PATH, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create migrations table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL UNIQUE,
    executed_at INTEGER NOT NULL DEFAULT (unixepoch())
  )
`);

// Run migrations
function runMigrations() {
  const migrations = [
    '001_initial_schema.sql'
  ];

  for (const filename of migrations) {
    const existing = db.prepare('SELECT filename FROM migrations WHERE filename = ?').get(filename);
    
    if (!existing) {
      console.log(`Running migration: ${filename}`);
      const migrationPath = join(MIGRATIONS_DIR, filename);
      const sql = readFileSync(migrationPath, 'utf-8');
      db.exec(sql);
      db.prepare('INSERT INTO migrations (filename) VALUES (?)').run(filename);
      console.log(`Migration ${filename} completed`);
    }
  }
}

// Run migrations on startup
runMigrations();

export default db;
