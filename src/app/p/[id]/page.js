/**
 * View Paste Page (HTML) - Server Component
 *
 * ROUTE: GET /p/:id
 *
 * PURPOSE:
 * - Display paste content in a user-friendly HTML page
 * - This is the shareable URL that users will visit
 * - Must render content safely (prevent XSS attacks)
 *
 * IMPORTANT:
 * - This page fetch counts as a view through the API
 * - We use the API internally to get the paste (which counts the view)
 * - Content is HTML-escaped to prevent script execution
 */

import { notFound } from "next/navigation";
import { headers } from "next/headers";
import PasteContent from "./PasteContent";

// This is a Server Component - runs on the server
export default async function ViewPastePage({ params }) {
  const { id } = await params;

  // Get the current request headers to forward them
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "https";

  // Build the API URL
  const apiUrl = `${protocol}://${host}/api/pastes/${id}`;

  // Prepare headers to forward (for TEST_MODE support)
  const fetchHeaders = {
    "Content-Type": "application/json",
  };

  // Forward the test time header if present
  const testTimeMs = headersList.get("x-test-now-ms");
  if (testTimeMs) {
    fetchHeaders["x-test-now-ms"] = testTimeMs;
  }

  try {
    // Fetch paste from API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: fetchHeaders,
      cache: "no-store", // Don't cache - we need fresh data for view counting
    });

    if (!response.ok) {
      notFound();
    }

    const paste = await response.json();

    // Pass the data to the client component
    return <PasteContent paste={paste} />;
  } catch (error) {
    console.error("Error fetching paste:", error);
    notFound();
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  return {
    title: `Paste ${(await params).id} | Pastebin Lite`,
    description: "View shared paste content",
  };
}
