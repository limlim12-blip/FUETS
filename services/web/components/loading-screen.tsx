import { Loader2 } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-white">
            <path
              fill="currentColor"
              d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">DocuFlow</h1>
        <div className="flex items-center justify-center space-x-1">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading your workspace...</span>
        </div>
      </div>
    </div>
  )
}
