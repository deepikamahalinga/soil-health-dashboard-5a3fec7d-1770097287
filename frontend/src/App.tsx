// app/layout.tsx
import { Inter } from 'next/font/google';
import Navigation from '@/components/Navigation';
import { Providers } from '@/components/Providers';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Soil Health Dashboard',
  description: 'Location-based soil health data search for Indian farmers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <Providers>
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="bg-white border-t py-4 mt-8">
            <div className="container mx-auto px-4 text-center text-gray-600">
              © {new Date().getFullYear()} Soil Health Dashboard
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}

// app/page.tsx
export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Soil Health Dashboard</h1>
      <div className="grid gap-6">
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Search Soil Reports</h2>
          {/* SearchDashboard component will be rendered here */}
        </section>
      </div>
    </div>
  );
}

// app/soil-reports/page.tsx
export default function SoilReportsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Soil Reports</h1>
      {/* SoilReportsTable component will be rendered here */}
    </div>
  );
}

// app/soil-reports/[id]/page.tsx
export default function SoilReportDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Soil Report Details</h1>
      {/* SoilReportDetail component will be rendered here */}
    </div>
  );
}

// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-8">
        The page you're looking for doesn't exist.
      </p>
      <a
        href="/"
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Return Home
      </a>
    </div>
  );
}

// app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );
}

// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
      <p className="text-gray-600 mb-8">{error.message}</p>
      <button
        onClick={reset}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}