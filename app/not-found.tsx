"use client"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white flex-col gap-4">
      <h2 className="text-3xl font-bold">404 - Page Not Found</h2>
      <p className="text-gray-400">The page you are looking for does not exist.</p>
    </div>
  )
}
