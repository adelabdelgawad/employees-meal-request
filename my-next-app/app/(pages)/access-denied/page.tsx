
import Link from 'next/link';

export default function AccessDenied() {
  return (
    <div className="flex items-center min-h-screen px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="w-full space-y-6 text-center">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
            Access Denied
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            You do not have permission to view this page.
          </p>
        </div>
        <Link href="/">
          <a className="inline-flex h-10 items-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
            Return to Home
          </a>
        </Link>
      </div>
    </div>
  );
}
