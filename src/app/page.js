"use client";

/**
 * Home Page - Create Paste UI
 *
 * This is the main page where users can create new pastes.
 * It includes a form with:
 * - Text area for content
 * - Optional TTL (time-to-live) setting
 * - Optional max views setting
 *
 * The form submits to /api/pastes and displays the resulting URL.
 */

"use client";

import { useState } from "react";

export default function HomePage() {
  const [content, setContent] = useState("");
  const [ttlSeconds, setTtlSeconds] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      // Build request body
      const body = { content };

      // Add optional fields if provided
      if (ttlSeconds && parseInt(ttlSeconds) > 0) {
        body.ttl_seconds = parseInt(ttlSeconds);
      }
      if (maxViews && parseInt(maxViews) > 0) {
        body.max_views = parseInt(maxViews);
      }

      const response = await fetch("/api/pastes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create paste");
      }

      setResult(data);
      // Clear form on success
      setContent("");
      setTtlSeconds("");
      setMaxViews("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (result?.url) {
      await navigator.clipboard.writeText(result.url);
      // Show feedback
      const btn = document.querySelector(".copy-url-btn");
      const originalText = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    }
  };

  return (
    <div className="home-container">
      <header className="header">
        <h1>📋 Pastebin Lite</h1>
        <p>Store and share text content with optional expiration</p>
      </header>

      <main className="main">
        <form onSubmit={handleSubmit} className="paste-form">
          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your text here..."
              rows={12}
              required
            />
          </div>

          <div className="options-row">
            <div className="form-group">
              <label htmlFor="ttl">
                Expires after (seconds)
                <span className="optional">optional</span>
              </label>
              <input
                type="number"
                id="ttl"
                value={ttlSeconds}
                onChange={(e) => setTtlSeconds(e.target.value)}
                placeholder="e.g., 3600 for 1 hour"
                min="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxViews">
                Max views
                <span className="optional">optional</span>
              </label>
              <input
                type="number"
                id="maxViews"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                placeholder="e.g., 5"
                min="1"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="submit-btn"
          >
            {loading ? "Creating..." : "Create Paste"}
          </button>
        </form>

        {error && <div className="error-message">❌ {error}</div>}

        {result && (
          <div className="success-message">
            <h3>✅ Paste Created!</h3>
            <div className="url-display">
              <input type="text" value={result.url} readOnly />
              <button
                type="button"
                onClick={copyToClipboard}
                className="copy-url-btn"
              >
                Copy URL
              </button>
            </div>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="view-link"
            >
              View Paste →
            </a>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Built for Aganitha Take-Home Exercise</p>
      </footer>

      <style jsx>{`
        .home-container {
          min-height: 100vh;
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
        }

        .header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: #1a202c;
        }

        .header p {
          color: #64748b;
          font-size: 1.1rem;
        }

        .main {
          flex: 1;
        }

        .paste-form {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
        }

        .optional {
          font-weight: 400;
          color: #9ca3af;
          font-size: 0.85rem;
          margin-left: 0.5rem;
        }

        textarea {
          width: 100%;
          padding: 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-family: "Monaco", "Menlo", monospace;
          font-size: 0.9rem;
          resize: vertical;
          transition: border-color 0.2s;
        }

        textarea:focus {
          outline: none;
          border-color: #4f46e5;
        }

        .options-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 600px) {
          .options-row {
            grid-template-columns: 1fr;
          }
        }

        input[type="number"] {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        input[type="number"]:focus {
          outline: none;
          border-color: #4f46e5;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          background: #4338ca;
        }

        .submit-btn:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        .error-message {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
        }

        .success-message {
          margin-top: 1.5rem;
          padding: 1.5rem;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
        }

        .success-message h3 {
          margin: 0 0 1rem 0;
          color: #16a34a;
        }

        .url-display {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .url-display input {
          flex: 1;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          font-family: monospace;
          font-size: 0.9rem;
        }

        .copy-url-btn {
          padding: 0.75rem 1rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
          white-space: nowrap;
        }

        .copy-url-btn:hover {
          background: #059669;
        }

        .view-link {
          color: #4f46e5;
          font-weight: 500;
          text-decoration: none;
        }

        .view-link:hover {
          text-decoration: underline;
        }

        .footer {
          text-align: center;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #e2e8f0;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
