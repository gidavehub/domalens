// app/page.tsx

'use client'; // This directive is ESSENTIAL for our interactive dashboard to work.

import { DomaLensDashboard } from '../components/DomaLensDashboard';

export default function HomePage() {
  return (
    <main>
      {/*
        This is it. We are simply rendering our main dashboard component,
        which contains all the logic, styling, and UI we've built.
      */}
      <DomaLensDashboard />
    </main>
  );
}