/**
 * `,`, `.`, `(`, and `)` are structural characters in PostgREST's filter
 * DSL (used by supabase-js's `.or()`). Strip them from free-text search
 * input before splicing it into an `.or("col.ilike.%value%,...")` string,
 * so a search term can't inject extra filter clauses or break parsing.
 */
export function sanitizeFilterValue(value: string) {
  return value.replace(/[,.()]/g, " ").trim();
}
