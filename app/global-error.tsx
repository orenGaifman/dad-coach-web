'use client';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for the root layout.
 * Catches errors that occur in the root layout itself.
 * Must define its own <html> and <body> tags.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="bg-gray-900">
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Something went wrong
            </h2>
            <p className="mb-6 text-gray-400">
              We encountered an unexpected error. Please try again.
            </p>
            <button
              onClick={reset}
              className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
