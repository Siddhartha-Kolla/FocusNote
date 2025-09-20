import React from 'react'

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          My Documents
        </h1>
        <p className="text-gray-600 mb-6">
          Upload and manage your study documents here.
        </p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="space-y-4">
            <div className="text-4xl text-gray-400">📄</div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">No documents yet</h3>
              <p className="text-gray-500">Upload your first document to get started</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
              Upload Document
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}