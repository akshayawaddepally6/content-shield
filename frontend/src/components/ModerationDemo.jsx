import { useState } from 'react'
import ResultsDisplay from './ResultsDisplay'

const EXAMPLES = [
  "Hello! How are you doing today? Hope you're having a great day!",
  "This is absolutely terrible and I hate everything about it.",
  "You're an idiot and this is the worst thing I've ever seen.",
  "I really appreciate your help with this project. Thank you!",
  "This product is complete garbage and a waste of money."
]

export default function ModerationDemo() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Configure API URL - replace with your deployed backend
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const analyzeContent = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`${API_URL}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(`Failed to analyze content: ${err.message}`)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadExample = (example) => {
    setText(example)
    setResult(null)
    setError(null)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      analyzeContent()
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-2xl p-8 mb-8">
        <div className="mb-6">
          <label className="block text-gray-700 text-lg font-semibold mb-3">
            Enter text to moderate:
          </label>
          <textarea
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-none"
            rows="6"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type or paste content here... (Ctrl+Enter to analyze)"
          />
          <p className="text-sm text-gray-500 mt-2">
            {text.length} characters
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={analyzeContent}
            disabled={loading || !text.trim()}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </span>
            ) : (
              '🔍 Analyze Content'
            )}
          </button>
          <button
            onClick={() => {
              setText('')
              setResult(null)
              setError(null)
            }}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Example Texts */}
        <div className="border-t pt-6">
          <p className="text-sm font-semibold text-gray-600 mb-3">
            Try these examples:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EXAMPLES.map((example, idx) => (
              <button
                key={idx}
                onClick={() => loadExample(example)}
                className="text-left p-3 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-sm"
              >
                "{example.substring(0, 60)}..."
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded">
          <p className="text-red-700">⚠️ {error}</p>
        </div>
      )}

      {/* Results Display */}
      {result && <ResultsDisplay result={result} />}

      {/* Info Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-3">
          🧠 How It Works
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div>
            <strong className="block mb-1">1. Text Analysis</strong>
            BERT-based transformer model processes input text
          </div>
          <div>
            <strong className="block mb-1">2. Multi-Category Detection</strong>
            Detects toxicity, hate speech, threats, insults, and more
          </div>
          <div>
            <strong className="block mb-1">3. Explainable Results</strong>
            Provides confidence scores and identifies problematic terms
          </div>
        </div>
      </div>
    </div>
  )
}