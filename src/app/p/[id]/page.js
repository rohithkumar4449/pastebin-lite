/**
 * View Paste Page (HTML)
 *
 * ROUTE: GET /p/:id
 *
 * PURPOSE:
 * - Display paste content in a user-friendly HTML page
 * - This is the shareable URL that users will visit
 * - Must render content safely (prevent XSS attacks)
 *
 * IMPORTANT:
 * - This page fetch does NOT count as a view (only API calls do)
 * - We use the API internally to get the paste (which counts the view)
 * - Content is HTML-escaped to prevent script execution
 */

import { notFound } from "next/navigation";
import { headers } from "next/headers";

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

    return (
      <div className="view-paste-container">
        <header className="view-header">
          <h1>📋 Pastebin Lite</h1>
          <a href="/" className="create-new-btn">
            Create New Paste
          </a>
        </header>

        <main className="paste-content-wrapper">
          <div className="paste-meta">
            {paste.remaining_views !== null && (
              <span className="meta-item">
                👁️ Remaining views: <strong>{paste.remaining_views}</strong>
              </span>
            )}
            {paste.expires_at && (
              <span className="meta-item">
                ⏰ Expires:{" "}
                <strong>{new Date(paste.expires_at).toLocaleString()}</strong>
              </span>
            )}
          </div>

          <div className="paste-content">
            <pre>{paste.content}</pre>
          </div>

          <div className="paste-actions">
            <button
              onClick={`navigator.clipboard.writeText(${JSON.stringify(
                paste.content
              )}); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy Content', 2000);`}
              className="copy-btn"
            >
              Copy Content
            </button>
          </div>
        </main>

        <style jsx>{`
          .view-paste-container {
            min-height: 100vh;
            padding: 2rem;
            max-width: 900px;
            margin: 0 auto;
          }

          .view-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #e2e8f0;
          }

          .view-header h1 {
            margin: 0;
            font-size: 1.5rem;
            color: #1a202c;
          }

          .create-new-btn {
            background: #4f46e5;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            transition: background 0.2s;
          }

          .create-new-btn:hover {
            background: #4338ca;
          }

          .paste-meta {
            display: flex;
            gap: 1.5rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
          }

          .meta-item {
            background: #f1f5f9;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.9rem;
            color: #475569;
          }

          .paste-content {
            background: #1e293b;
            border-radius: 8px;
            padding: 1.5rem;
            overflow-x: auto;
          }

          .paste-content pre {
            margin: 0;
            color: #e2e8f0;
            font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
            font-size: 0.9rem;
            line-height: 1.6;
            white-space: pre-wrap;
            word-wrap: break-word;
          }

          .paste-actions {
            margin-top: 1rem;
          }

          .copy-btn {
            background: #10b981;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.2s;
          }

          .copy-btn:hover {
            background: #059669;
          }
        `}</style>
      </div>
    );
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
