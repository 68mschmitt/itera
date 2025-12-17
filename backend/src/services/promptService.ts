import { db } from '../config/database.js';

// Types
export interface Prompt {
  id: number;
  name: string;
  created_at: number;
  default_version_id: number | null;
}

export interface PromptVersion {
  id: number;
  prompt_id: number;
  version_number: number;
  content: string;
  parent_version_id: number | null;
  created_at: number;
}

export interface PromptWithVersions extends Prompt {
  versions: (PromptVersion & { is_default?: boolean })[];
}

// Prepared statements
const getPromptStmt = db.prepare('SELECT * FROM prompts WHERE id = ?');
const insertPromptStmt = db.prepare('INSERT INTO prompts (name) VALUES (?) RETURNING *');
const updatePromptDefaultStmt = db.prepare('UPDATE prompts SET default_version_id = ? WHERE id = ? RETURNING *');

const getVersionStmt = db.prepare('SELECT * FROM prompt_versions WHERE id = ?');
const getVersionsForPromptStmt = db.prepare('SELECT * FROM prompt_versions WHERE prompt_id = ? ORDER BY version_number ASC');
const getMaxVersionNumberStmt = db.prepare('SELECT MAX(version_number) as max_version FROM prompt_versions WHERE prompt_id = ?');
const insertVersionStmt = db.prepare(`
  INSERT INTO prompt_versions (prompt_id, version_number, content, parent_version_id)
  VALUES (?, ?, ?, ?)
  RETURNING *
`);

/**
 * Create a new prompt with just a name (no versions yet)
 */
export function createPrompt(name: string): Prompt {
  return insertPromptStmt.get(name) as Prompt;
}

/**
 * Get a prompt by ID
 */
export function getPrompt(promptId: number): Prompt | undefined {
  return getPromptStmt.get(promptId) as Prompt | undefined;
}

/**
 * Get a prompt with all its versions
 */
export function getPromptWithVersions(promptId: number): PromptWithVersions | undefined {
  const prompt = getPrompt(promptId);
  if (!prompt) return undefined;

  const versions = getVersionsForPromptStmt.all(promptId) as PromptVersion[];
  
  // Mark which version is default
  const versionsWithDefault = versions.map(v => ({
    ...v,
    is_default: v.id === prompt.default_version_id
  }));

  return {
    ...prompt,
    versions: versionsWithDefault
  };
}

/**
 * Create a new version of a prompt (transactional)
 * This is the core versioning logic:
 * 1. Get current default version
 * 2. Calculate next version number
 * 3. Create new version with parent set to previous default
 * 4. Update prompt's default pointer to new version
 */
export const createVersion: (promptId: number, content: string) => PromptVersion = db.transaction((promptId: number, content: string): PromptVersion => {
  // 1. Get current prompt state
  const prompt = getPrompt(promptId);
  if (!prompt) {
    throw new Error(`Prompt ${promptId} not found`);
  }
  
  const previousDefaultId = prompt.default_version_id;
  
  // 2. Calculate next version number
  const result = getMaxVersionNumberStmt.get(promptId) as { max_version: number | null };
  const nextVersionNumber = (result.max_version ?? 0) + 1;
  
  // 3. Create new version
  const newVersion = insertVersionStmt.get(
    promptId,
    nextVersionNumber,
    content,
    previousDefaultId
  ) as PromptVersion;
  
  // 4. Update default pointer
  updatePromptDefaultStmt.run(newVersion.id, promptId);
  
  return newVersion;
});

/**
 * Set the default version for a prompt (used for rollback)
 */
export function setDefaultVersion(promptId: number, versionId: number): Prompt {
  // Verify the version exists and belongs to this prompt
  const version = getVersionStmt.get(versionId) as PromptVersion | undefined;
  if (!version || version.prompt_id !== promptId) {
    throw new Error(`Version ${versionId} not found or does not belong to prompt ${promptId}`);
  }
  
  const result = updatePromptDefaultStmt.get(versionId, promptId) as Prompt;
  return result;
}

/**
 * Get a specific version by ID
 */
export function getVersion(versionId: number): PromptVersion | undefined {
  return getVersionStmt.get(versionId) as PromptVersion | undefined;
}

/**
 * Get two versions for comparison
 */
export function getVersionsForDiff(promptId: number, version1Id: number, version2Id: number): { version_a: PromptVersion; version_b: PromptVersion } {
  const v1 = getVersionStmt.get(version1Id) as PromptVersion | undefined;
  const v2 = getVersionStmt.get(version2Id) as PromptVersion | undefined;
  
  if (!v1 || v1.prompt_id !== promptId) {
    throw new Error(`Version ${version1Id} not found or does not belong to prompt ${promptId}`);
  }
  
  if (!v2 || v2.prompt_id !== promptId) {
    throw new Error(`Version ${version2Id} not found or does not belong to prompt ${promptId}`);
  }
  
  return { version_a: v1, version_b: v2 };
}
