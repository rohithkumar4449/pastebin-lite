/**
 * Health Check Endpoint
 *
 * ROUTE: GET /api/healthz
 *
 * PURPOSE:
 * - Allows monitoring systems to verify the application is running
 * - Checks if the database connection is working
 * - Must return quickly (automated tests expect fast response)
 *
 * RESPONSE:
 * - 200 OK: { "ok": true } when everything is healthy
 * - 503 Service Unavailable: { "ok": false, "error": "..." } when DB is down
 */

import { checkHealth, initDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

// Ensure database table exists
let dbInitialized = false;

export async function GET() {
  try {
    // Initialize database table on first request
    if (!dbInitialized) {
      await initDatabase();
      dbInitialized = true;
    }

    // Test database connectivity
    const healthy = await checkHealth();

    if (healthy) {
      return NextResponse.json(
        { ok: true },
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      return NextResponse.json(
        {
          ok: false,
          error: "Database connection failed",
        },
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    // Database connection failed
    console.error("Health check failed:", error.message);

    return NextResponse.json(
      {
        ok: false,
        error: "Database connection failed",
      },
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
