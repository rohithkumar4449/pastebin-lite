/**
 * Root Layout
 *
 * This is the root layout for the entire application.
 * It includes global styles and meta tags.
 */

import "./globals.css";

export const metadata = {
  title: "Pastebin Lite",
  description:
    "A simple Pastebin-like application for storing and sharing text content",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
