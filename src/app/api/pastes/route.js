/**
 * Create Paste Endpoint
 *
 * ROUTE: POST /api/pastes
 *
 * PURPOSE:
 * - Create a new paste with the provided content
 * - Optionally set TTL (time-to-live) and/or max view count
 * - Return the paste ID and shareable URL
 *
 * REQUEST BODY:
 * {
 *   "content": "string" (required, non-empty),
 *   "ttl_seconds": number (optional, >= 1),
 *   "max_views": number (optional, >= 1)
 * }
 *
 * RESPONSE (201 Created):
 * {
 *   "id": "nanoid-string",
 *   "url": "https://your-app.vercel.app/p/<id>"
 * }
 *
 * ERRORS:
 * - 400 Bad Request: Invalid input
 */

import { createPaste, initDatabase } from "@/lib/db";
import { NextResponse } from "next/server";
import { validateCreatePasteInput, getBaseUrl, generateId } from "@/lib/utils";

// Ensure database table exists
let dbInitialized = false;

export async function POST(request) {
  try {
    // Initialize database table on first request
    if (!dbInitialized) {
      await initDatabase();
      dbInitialized = true;
    }

    // Parse the request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate input
    const validation = validateCreatePasteInput(body);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { content, ttlSeconds, maxViews } = validation.data;

    // Calculate expiry time if TTL is provided
    let expiresAt = null;
    if (ttlSeconds) {
      const now = new Date();
      expiresAt = new Date(now.getTime() + ttlSeconds * 1000);
    }

    // Generate unique ID
    const id = generateId();

    // Create the paste in database
    await createPaste({
      id,
      content,
      expiresAt,
      maxViews,
    });

    // Construct the response with the shareable URL
    const baseUrl = getBaseUrl(request);

    return NextResponse.json(
      {
        id,
        url: `${baseUrl}/p/${id}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating paste:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
