/**
 * Utility Functions for Pastebin-Lite
 *
 * This module contains helper functions used across the application.
 */

import { nanoid } from "nanoid";

/**
 * Generate a unique ID for a paste
 * Uses nanoid for short, URL-safe, unique identifiers
 *
 * @returns {string} - A unique 10-character ID
 */
export function generateId() {
  return nanoid(10);
}

/**
 * Get the current time for the application.
 *
 * WHY THIS EXISTS:
 * The assignment requires deterministic time testing. When TEST_MODE=1 is set,
 * the x-test-now-ms header should be treated as the current time.
 * This allows automated tests to simulate time passage without actually waiting.
 *
 * @param {Request} request - The incoming request object
 * @returns {Date} - The current time (either real or from header)
 */
export function getCurrentTime(request) {
  // Check if we're in test mode
  const isTestMode = process.env.TEST_MODE === "1";

  if (isTestMode) {
    // Try to get the time from the test header
    const testTimeMs = request.headers.get("x-test-now-ms");

    if (testTimeMs) {
      const parsedTime = parseInt(testTimeMs, 10);

      // Validate the parsed time is a valid number
      if (!isNaN(parsedTime) && parsedTime > 0) {
        return new Date(parsedTime);
      }
    }
  }

  // Default: return real system time
  return new Date();
}

/**
 * Check if a paste is still available (not expired, views not exceeded)
 *
 * @param {Object} paste - The paste object from database
 * @param {Date} currentTime - The current time to check against
 * @returns {Object} - { available: boolean, reason?: string }
 */
export function checkPasteAvailability(paste, currentTime) {
  if (!paste) {
    return { available: false, reason: "Paste not found" };
  }

  // Check time-based expiry
  if (paste.expiresAt && currentTime >= new Date(paste.expiresAt)) {
    return { available: false, reason: "Paste has expired" };
  }

  // Check view count limit
  if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
    return { available: false, reason: "View limit exceeded" };
  }

  return { available: true };
}

/**
 * Escape HTML to prevent XSS attacks
 *
 * WHY: When displaying user-generated content, we must prevent script execution.
 * This function converts potentially dangerous characters to their HTML entities.
 *
 * @param {string} text - The text to escape
 * @returns {string} - HTML-safe string
 */
export function escapeHtml(text) {
  const htmlEntities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
}

/**
 * Validate the paste creation input
 *
 * @param {Object} body - The request body
 * @returns {Object} - { valid: boolean, error?: string, data?: Object }
 */
export function validateCreatePasteInput(body) {
  // Check if content exists and is a non-empty string
  if (
    !body.content ||
    typeof body.content !== "string" ||
    body.content.trim() === ""
  ) {
    return {
      valid: false,
      error: "Content is required and must be a non-empty string",
    };
  }

  // Validate ttl_seconds if provided
  if (body.ttl_seconds !== undefined) {
    if (
      typeof body.ttl_seconds !== "number" ||
      !Number.isInteger(body.ttl_seconds) ||
      body.ttl_seconds < 1
    ) {
      return { valid: false, error: "ttl_seconds must be an integer >= 1" };
    }
  }

  // Validate max_views if provided
  if (body.max_views !== undefined) {
    if (
      typeof body.max_views !== "number" ||
      !Number.isInteger(body.max_views) ||
      body.max_views < 1
    ) {
      return { valid: false, error: "max_views must be an integer >= 1" };
    }
  }

  return {
    valid: true,
    data: {
      content: body.content,
      ttlSeconds: body.ttl_seconds || null,
      maxViews: body.max_views || null,
    },
  };
}

/**
 * Get the base URL for the application
 *
 * WHY: We need to construct absolute URLs for the paste links.
 * In different environments (local, Vercel), the URL will be different.
 *
 * @param {Request} request - The incoming request
 * @returns {string} - The base URL
 */
export function getBaseUrl(request) {
  // Try to get from request headers (works in Vercel)
  const host = request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "https";

  if (host) {
    return `${protocol}://${host}`;
  }

  // Fallback for development
  return process.env.NEXT_PUBLIC_BASE_URL;
}
