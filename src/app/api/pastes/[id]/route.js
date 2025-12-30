/**
 * Fetch Paste Endpoint
 *
 * ROUTE: GET /api/pastes/:id
 *
 * PURPOSE:
 * - Retrieve a paste by its ID
 * - Increment the view count (each API fetch counts as a view)
 * - Check if paste is still available (not expired, views not exceeded)
 *
 * RESPONSE (200 OK):
 * {
 *   "content": "string",
 *   "remaining_views": number | null,
 *   "expires_at": "ISO-8601 string" | null
 * }
 *
 * ERRORS:
 * - 404 Not Found: Paste doesn't exist, expired, or view limit exceeded
 */

import { getPaste, incrementViewCount, initDatabase } from "@/lib/db";
import { NextResponse } from "next/server";
import { getCurrentTime, checkPasteAvailability } from "@/lib/utils";

// Ensure database table exists
let dbInitialized = false;

export async function GET(request, { params }) {
  try {
    // Initialize database table on first request
    if (!dbInitialized) {
      await initDatabase();
      dbInitialized = true;
    }

    const { id } = await params;

    // Get current time (supports TEST_MODE)
    const currentTime = getCurrentTime(request);

    // Fetch the paste from database
    const paste = await getPaste(id);

    // Check if paste exists and is available
    const availability = checkPasteAvailability(paste, currentTime);

    if (!availability.available) {
      return NextResponse.json({ error: availability.reason }, { status: 404 });
    }

    // Increment view count atomically
    const updatedPaste = await incrementViewCount(id);

    if (!updatedPaste) {
      return NextResponse.json({ error: "Paste not found" }, { status: 404 });
    }

    // After incrementing, check if this view exceeded the limit
    if (
      updatedPaste.maxViews !== null &&
      updatedPaste.viewCount > updatedPaste.maxViews
    ) {
      return NextResponse.json(
        { error: "View limit exceeded" },
        { status: 404 }
      );
    }

    // Calculate remaining views (null if unlimited)
    const remainingViews =
      updatedPaste.maxViews !== null
        ? updatedPaste.maxViews - updatedPaste.viewCount
        : null;

    // Ensure remaining views is never negative
    const safeRemainingViews =
      remainingViews !== null ? Math.max(0, remainingViews) : null;

    // Format expires_at as ISO string
    const expiresAt = updatedPaste.expiresAt
      ? new Date(updatedPaste.expiresAt).toISOString()
      : null;

    return NextResponse.json(
      {
        content: updatedPaste.content,
        remaining_views: safeRemainingViews,
        expires_at: expiresAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching paste:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
