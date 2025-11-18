
import React, { useState } from 'react';
import { getAiInsight } from '../services/geminiService';
import { AnalysisData } from '../types';
import { Spinner } from './Spinner';
import { SendIcon, SparklesIcon } from './IconComponents';

interface AiAnalystProps {
  analysisData: AnalysisData;
}

const suggestedPrompts = [
    "What are the key trends in duty paid over the years?",
    "Which HSN code is the most significant and why?",
    "Identify the top 3 suppliers by value in the most recent year.",
    "Summarize the overall trade performance based on this data.",
];

export const AiAnalyst: React.FC<AiAnalystProps> = ({ analysisData }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (currentPrompt: string) => {
    if (!currentPrompt.trim()) return;
    setIsLoading(true);
    setResponse('');

    const dataSnapshot = {
        yearlySummary: analysisData.yearlySummary,
        hsnSummary: analysisData.hsnSummary.slice(0, 10),
        supplierSummary: analysisData.supplierSummaryByYear[analysisData.yearlySummary.slice(-1)[0].year]?.slice(0,10)
    };
    
    const result = await getAiInsight(currentPrompt, dataSnapshot);
    setResponse(result);
    setIsLoading(false);
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSubmit(prompt);
      setPrompt('');
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center mb-4">
        <SparklesIcon className="w-8 h-8 text-primary" />
        <h3 className="text-xl font-semibold text-text-primary ml-2">AI Trade Analyst</h3>
      </div>
      <p className="text-text-secondary mb-4">Ask a question about your data to get AI-powered insights.</p>

        <div className="mb-4 flex flex-wrap gap-2">
            {suggestedPrompts.map(p => (
                <button 
                    key={p} 
                    onClick={() => { setPrompt(p); handleSubmit(p); }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition"
                >
                    {p}
                </button>
            ))}
        </div>

      <form onSubmit={handleFormSubmit} className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Which year had the highest growth?'"
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400"
        >
          {isLoading ? <Spinner size="sm"/> : <SendIcon className="w-5 h-5" />}
          <span className="ml-2 hidden sm:inline">Ask</span>
        </button>
      </form>

      {isLoading && (
        <div className="p-4 border rounded-lg bg-gray-50 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      )}

      {response && (
        <div className="p-4 border rounded-lg bg-blue-50">
          <pre className="whitespace-pre-wrap font-sans text-text-primary">{response}</pre>
        </div>
      )}
    </div>
  );
};
