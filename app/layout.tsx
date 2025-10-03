// app/layout.tsx

import type { Metadata } from 'next';

// --- METADATA ---
// This provides the title and description for the browser tab and search engines.
export const metadata: Metadata = {
  title: 'DomaLens | AI-Powered DomainFi Explorer',
  description: 'An intelligent dashboard for exploring the Doma Protocol, enriched with live AI analytics for rarity, pricing, trends, and more.',
};

// --- ROOT LAYOUT COMPONENT ---
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/*
          We are placing the font import directly here to adhere to the "no external CSS files" rule.
          This link fetches the 'Inter' font family from Google Fonts.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/*
          The 'children' prop here will be the content from our 'page.tsx' file.
          This is how Next.js nests the page inside the layout.
        */}
        {children}
      </body>
    </html>
  );
}