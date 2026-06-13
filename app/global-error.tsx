"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-black text-white flex-col gap-4">
          <h2>Something went wrong!</h2>
          <p className="text-sm text-gray-400">{error.message || "A critical error occurred."}</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 rounded-lg"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
