"use client";

/**
 * Not Found Page for /p/:id
 *
 * This is displayed when a paste is not found, expired, or view limit exceeded
 */

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>😕 Paste Not Found</h1>
        <p>
          This paste doesn&apos;t exist, has expired, or has reached its view
          limit.
        </p>
        <Link href="/" className="home-link">
          ← Create a new paste
        </Link>
      </div>

      <style jsx>{`
        .not-found-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .not-found-content {
          text-align: center;
          max-width: 400px;
        }

        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #1a202c;
        }

        p {
          color: #64748b;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .home-link {
          background: #4f46e5;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          display: inline-block;
          transition: background 0.2s;
        }

        .home-link:hover {
          background: #4338ca;
        }
      `}</style>
    </div>
  );
}
