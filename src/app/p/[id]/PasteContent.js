"use client";

/**
 * Paste Content Display Component (Client Component)
 *
 * This handles the UI display with styled-jsx
 * The parent server component fetches the data
 */

export default function PasteContent({ paste }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(paste.content);
  };

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
          <button onClick={handleCopy} className="copy-btn">
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
}
