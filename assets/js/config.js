/*
 * Neon Data API base URL (public by design — the anonymous role is insert-only).
 * Replace the placeholder with the URL from Neon console → Project → Data API.
 * Looks like: https://ep-xxxx.apirest.<region>.aws.neon.tech/neondb/rest/v1
 */
export const DATA_API_URL = "https://ep-delicate-term-axjow28p.apirest.c-4.us-east-2.aws.neon.tech/neondb/rest/v1";

export const isConfigured = !DATA_API_URL.startsWith("__");
