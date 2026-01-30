import { useState } from 'react'
import './index.css'
import ModerationDemo from './components/ModerationDemo'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🛡️ Content Shield
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real-time AI-powered content moderation with explainability
          </p>
          <div className="mt-6 flex gap-4 justify-center">
            <span className="px-4 py-2 bg-purple-600 rounded-full text-white text-sm">
              🤖 BERT-based Detection
            </span>
            <span className="px-4 py-2 bg-blue-600 rounded-full text-white text-sm">
              ⚡ Real-time Analysis
            </span>
            <span className="px-4 py-2 bg-green-600 rounded-full text-white text-sm">
              📊 Explainable AI
            </span>
          </div>
        </header>

        {/* Main Demo */}
        <ModerationDemo />

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-400">
          <p className="mb-2">
            Built with FastAPI, React, and Transformers 🚀
          </p>
          <p className="text-sm">
            Powered by unitary/toxic-bert model
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App