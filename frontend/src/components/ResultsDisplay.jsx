export default function ResultsDisplay({ result }) {
    const getStatusColor = (isFlagged) => {
      return isFlagged 
        ? 'from-red-500 to-orange-500' 
        : 'from-green-500 to-emerald-500'
    }
  
    const getStatusText = (isFlagged) => {
      return isFlagged ? '⚠️ Content Flagged' : '✅ Content Safe'
    }
  
    const getCategoryColor = (score) => {
      if (score >= 0.7) return 'bg-red-500'
      if (score >= 0.4) return 'bg-yellow-500'
      return 'bg-green-500'
    }
  
    return (
      <div className="bg-white rounded-lg shadow-2xl p-8 mb-8 animate-fade-in">
        {/* Overall Status */}
        <div className={`bg-gradient-to-r ${getStatusColor(result.is_flagged)} text-white rounded-lg p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {getStatusText(result.is_flagged)}
              </h2>
              <p className="text-lg opacity-90">
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-6xl opacity-50">
              {result.is_flagged ? '⚠️' : '✅'}
            </div>
          </div>
          {result.latency_ms && (
            <p className="text-sm mt-3 opacity-75">
              ⚡ Analyzed in {result.latency_ms}ms
            </p>
          )}
        </div>
  
        {/* Category Breakdown */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            📊 Category Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(result.categories).map(([category, data]) => (
              <div key={category} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-700 capitalize">
                    {category.replace('_', ' ')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-white text-sm ${
                    data.flagged ? 'bg-red-500' : 'bg-gray-400'
                  }`}>
                    {data.flagged ? 'Flagged' : 'Safe'}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full ${getCategoryColor(data.score)} transition-all duration-500`}
                    style={{ width: `${data.score * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Score: {(data.score * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
  
        {/* Explanations */}
        {result.explanation && result.explanation.length > 0 && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              💡 Explanation
            </h3>
            <ul className="space-y-2">
              {result.explanation.map((exp, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-gray-700">{exp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
  
        {/* Toxic Words */}
        {result.top_toxic_words && result.top_toxic_words.length > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              🔍 Potentially Problematic Terms
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.top_toxic_words.map((word, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-sm font-medium"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
  
        {/* Analyzed Text */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Analyzed Text:
          </h3>
          <p className="text-gray-700 bg-gray-50 p-4 rounded italic">
            "{result.text}"
          </p>
        </div>
      </div>
    )
  }