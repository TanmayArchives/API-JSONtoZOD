"use client"
import { useState } from 'react';

export default function Home() {
  const [data, setData] = useState('');
  const [format, setFormat] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    setError('');
    setOutput('');

    try {
      const response = await fetch('/api/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data, format: JSON.parse(format) }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setOutput(JSON.stringify(result, null, 2));
    } catch (e: any) {
      setError(`Failed to transform data: ${e.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="container max-w-4xl p-5 bg-white rounded shadow-lg">
        <h1 className="text-xl font-bold mb-4">Data Transformer</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="data" className="block text-sm font-medium text-gray-700">Data:</label>
            <input
              type="text"
              id="data"
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Enter your data"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="format" className="block text-sm font-medium text-gray-700">Format (JSON):</label>
            <textarea
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              placeholder="Enter JSON format"
              rows={5}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button type="submit" className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 text-white font-semibold rounded-lg">
            Transform
          </button>
        </form>

        {output && (
          <div className="mt-5">
            <h2 className="text-lg font-bold">Output</h2>
            <pre className="bg-gray-100 rounded p-3">{output}</pre>
          </div>
        )}

        {error && (
          <div className="mt-5 text-red-500">
            <h2>Error</h2>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
