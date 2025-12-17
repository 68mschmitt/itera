import crypto from 'crypto';

/**
 * Extract template variables from content using {var_name} pattern
 * Example: "Hello {name}, your issue is {issue_id}" => ["name", "issue_id"]
 */
export function extractVariables(content: string): string[] {
  const regex = /\{(\w+)\}/g;
  const matches = content.matchAll(regex);
  return Array.from(matches, m => m[1]);
}

/**
 * Render a prompt template with input variables
 * Returns the rendered prompt and the template variables that were used
 */
export function renderPrompt(
  content: string,
  inputJson: Record<string, any>
): { renderedPrompt: string; templateVars: Record<string, any> } {
  const variables = extractVariables(content);
  
  const templateVars: Record<string, any> = {};
  let rendered = content;
  
  for (const varName of variables) {
    const value = inputJson[varName];
    if (value === undefined) {
      throw new Error(`Missing required variable: ${varName}`);
    }
    templateVars[varName] = value;
    rendered = rendered.replace(
      new RegExp(`\\{${varName}\\}`, 'g'),
      String(value)
    );
  }
  
  return { renderedPrompt: rendered, templateVars };
}

/**
 * Generate a SHA256 hash of the input JSON for deduplication
 * Normalizes JSON to ensure consistent hashing
 */
export function generateInputHash(inputJson: Record<string, any>): string {
  // Normalize JSON to ensure consistent hashing
  const normalized = JSON.stringify(inputJson, Object.keys(inputJson).sort());
  return crypto.createHash('sha256').update(normalized).digest('hex');
}
