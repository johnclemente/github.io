/*
 * Neon Data API base URL (public by design — the anonymous role is insert-only).
 * Replace the placeholder with the URL from Neon console → Project → Data API.
 * Looks like: https://ep-xxxx.apirest.<region>.aws.neon.tech/neondb/rest/v1
 */
export const DATA_API_URL = "__NEON_DATA_API_URL__";

export const isConfigured = !DATA_API_URL.startsWith("__");
