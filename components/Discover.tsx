import React, { useState } from 'react';
import { Search as SearchIcon, Loader2, Plus, ExternalLink, Sparkles, BookOpen, Image as ImageIcon } from 'lucide-react';
import { searchContent, generateReadingItem, generateCoverImage } from '../services/gemini';
import { ReadingItem, Source, AppSettings } from '../types';
import ReactMarkdown from 'react-markdown';

interface DiscoverProps {
  onAddToLibrary: (item: ReadingItem) => void;
  onReadNow: (item: ReadingItem) => void;
  settings: AppSettings;
}

export const Discover: React.FC<DiscoverProps> = ({ onAddToLibrary, onReadNow, settings }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<{ text: string; sources: Source[] } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setResult(null);
    try {
      const data = await searchContent(query);
      setResult(data);
    } catch (error) {
      console.error(error);
      // In a real app, show toast
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async () => {
    if (!result) return;
    setIsAdding(true);
    setLoadingStage('Analyzing content...');
    
    try {
      // 1. Generate structure
      const itemData = await generateReadingItem(result.text);
      
      let imageUrl = undefined;
      
      // 2. Generate Image if enabled
      if (settings.enableAIImages) {
        setLoadingStage('Generating AI art...');
        const generatedImage = await generateCoverImage(itemData.title, itemData.description);
        if (generatedImage) {
            imageUrl = generatedImage;
        }
      }
      
      const newItem: ReadingItem = {
        id: crypto.randomUUID(),
        type: 'article',
        dateAdded: Date.now(),
        ...itemData,
        imageUrl,
        sourceUrl: result.sources[0]?.uri
      };
      
      onAddToLibrary(newItem);
      alert("Added to library!");
    } catch (error) {
      console.error("Failed to import", error);
    } finally {
      setIsAdding(false);
      setLoadingStage('');
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-6 overflow-y-auto pb-20">
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Discover Content</h1>
        <p className="text-slate-500">Use AI to find the latest books, news, and articles.</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative mb-8 group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for 'sci-fi books 2024' or 'latest AI news'..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="absolute right-2 top-2 bottom-2 bg-brand-600 text-white px-6 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      {/* Results Area */}
      {isSearching && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-fadeIn">
          <Loader2 className="w-12 h-12 animate-spin mb-4 text-brand-500" />
          <p>Gemini is researching...</p>
        </div>
      )}

      {!isSearching && result && (
        <div className="animate-fadeIn space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8 relative overflow-hidden">
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">AI Overview</h2>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Based on Google Search</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleImport}
                  disabled={isAdding}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg font-medium transition-colors text-sm disabled:opacity-70"
                >
                   {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                   {isAdding ? loadingStage : 'Save as Article'}
                </button>
              </div>
            </div>
            
            <div className="prose prose-slate max-w-none prose-a:text-brand-600 prose-headings:font-serif relative z-10">
              <ReactMarkdown>{result.text}</ReactMarkdown>
            </div>
          </div>

          {/* Sources */}
          {result.sources.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Sources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-300 hover:shadow-md transition-all group"
                  >
                    <div className="mt-1 p-2 bg-slate-50 rounded-lg group-hover:bg-brand-50 transition-colors">
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-brand-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 line-clamp-2 group-hover:text-brand-700">{source.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 truncate">{new URL(source.uri).hostname}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isSearching && !result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[
            "Latest sci-fi books released in 2024",
            "News about renewable energy breakthroughs",
            "History of the Roman Empire",
            "Best beginner gardening guides",
            "Analysis of recent tech market trends",
            "Classic literature summaries"
          ].map((suggestion, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(suggestion);
              }}
              className="text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-300 hover:shadow-sm transition-all text-slate-600 text-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};