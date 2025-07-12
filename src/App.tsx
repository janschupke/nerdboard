import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1 className="text-4xl font-bold text-blue-600 bg-gray-100 p-4 rounded-lg mb-8">Vite + React with Tailwind</h1>
      
      {/* Testing UI Components */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Basic Tailwind Test */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Basic Tailwind Test</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-500 text-white p-4 rounded-lg text-center">
              <div className="font-bold">Blue</div>
              <div className="text-sm">bg-blue-500</div>
            </div>
            <div className="bg-green-500 text-white p-4 rounded-lg text-center">
              <div className="font-bold">Green</div>
              <div className="text-sm">bg-green-500</div>
            </div>
            <div className="bg-purple-500 text-white p-4 rounded-lg text-center">
              <div className="font-bold">Purple</div>
              <div className="text-sm">bg-purple-500</div>
            </div>
            <div className="bg-red-500 text-white p-4 rounded-lg text-center">
              <div className="font-bold">Red</div>
              <div className="text-sm">bg-red-500</div>
            </div>
          </div>
        </div>

        {/* Spacing Test */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-secondary-800 mb-4">Spacing Test</h2>
          <div className="space-y-2">
            <div className="bg-primary-100 p-xs rounded">p-xs (0.25rem)</div>
            <div className="bg-primary-200 p-sm rounded">p-sm (0.5rem)</div>
            <div className="bg-primary-300 p-md rounded">p-md (1rem)</div>
            <div className="bg-primary-400 p-lg rounded">p-lg (1.5rem)</div>
            <div className="bg-primary-500 p-xl rounded text-white">p-xl (2rem)</div>
          </div>
        </div>

        {/* Typography Test */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-secondary-800 mb-4">Typography Test</h2>
          <div className="space-y-2">
            <p className="text-xs text-secondary-600">text-xs - Extra small text</p>
            <p className="text-sm text-secondary-600">text-sm - Small text</p>
            <p className="text-base text-secondary-700">text-base - Base text</p>
            <p className="text-lg text-secondary-800">text-lg - Large text</p>
            <p className="text-xl text-secondary-900">text-xl - Extra large text</p>
            <p className="text-2xl font-bold text-primary-700">text-2xl - 2XL text</p>
            <p className="text-3xl font-bold text-primary-800">text-3xl - 3XL text</p>
          </div>
        </div>

        {/* Interactive Components */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-secondary-800 mb-4">Interactive Components</h2>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setCount((count) => count + 1)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Count: {count}
            </button>
            <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg">
              Secondary Button
            </button>
            <button className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg">
              Accent Button
            </button>
            <button className="bg-success-500 hover:bg-success-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg">
              Success Button
            </button>
          </div>
        </div>

        {/* Border Radius Test */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-secondary-800 mb-4">Border Radius Test</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary-100 p-4 rounded-xs border border-primary-300">
              <div className="font-semibold text-primary-800">rounded-xs</div>
            </div>
            <div className="bg-primary-200 p-4 rounded-sm border border-primary-400">
              <div className="font-semibold text-primary-800">rounded-sm</div>
            </div>
            <div className="bg-primary-300 p-4 rounded-md border border-primary-500">
              <div className="font-semibold text-primary-800">rounded-md</div>
            </div>
            <div className="bg-primary-400 p-4 rounded-lg border border-primary-600">
              <div className="font-semibold text-primary-800">rounded-lg</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
