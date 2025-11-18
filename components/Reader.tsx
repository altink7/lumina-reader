import React, { useState, useEffect, useRef } from 'react';
import { ReadingItem, Highlight } from '../types';
import { ArrowLeft, X, Sparkles, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { explainText } from '../services/gemini';

interface ReaderProps {
  item: ReadingItem;
  onBack: () => void;
  highlights: Highlight[];
  onAddHighlight: (highlight: Highlight) => void;
  onRemoveHighlight: (id: string) => void;
}

export const Reader: React.FC<ReaderProps> = ({ item, onBack, highlights, onAddHighlight, onRemoveHighlight }) => {
  const [selection, setSelection] = useState<{ text: string; top: number; left: number } | null>(null);
  const [fontSize, setFontSize] = useState(20);
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle Text Selection
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && contentRef.current?.contains(sel.anchorNode)) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Only show if selection is substantial
        if (sel.toString().trim().length > 2) {
            setSelection({
            text: sel.toString(),
            top: rect.top + window.scrollY - 60,
            left: rect.left + rect.width / 2
            });
            return;
        }
      }
      setSelection(null);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleHighlight = (color: Highlight['color']) => {
    if (!selection) return;
    
    const newHighlight: Highlight = {
      id: crypto.randomUUID(),
      itemId: item.id,
      text: selection.text,
      color,
      timestamp: Date.now(),
    };
    
    onAddHighlight(newHighlight);
    // Clear selection
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  };

  const handleExplain = async () => {
    if (!selection) return;
    setShowExplainModal(true);
    setIsExplaining(true);
    setExplanation(null);

    try {
        const text = await explainText(selection.text, item.content.substring(0, 1000));
        setExplanation(text);
    } catch (error) {
        setExplanation("Sorry, I couldn't explain that right now.");
    } finally {
        setIsExplaining(false);
    }
  };

  // Filter highlights for this item
  const itemHighlights = highlights.filter(h => h.itemId === item.id);

  return (
    <div className="flex flex-col h-full bg-[#fcfbf9] relative">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="hidden md:block">
            <h1 className="font-serif font-bold text-slate-900 text-lg line-clamp-1">{item.title}</h1>
            <p className="text-xs text-slate-500">{item.author || "Unknown Author"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 rounded-full p-1">
          <button 
            onClick={() => setFontSize(Math.max(14, fontSize - 2))}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-slate-500 hover:shadow-sm transition-all"
          >
            <span className="text-xs font-bold">A-</span>
          </button>
          <span className="text-sm font-medium w-6 text-center text-slate-700">{fontSize}</span>
          <button 
            onClick={() => setFontSize(Math.min(32, fontSize + 2))}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-slate-500 hover:shadow-sm transition-all"
          >
            <span className="text-lg font-bold">A+</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative scroll-smooth">
        {/* Hero Image */}
        {item.imageUrl && (
            <div className="w-full h-64 md:h-96 relative">
                <img src={item.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#fcfbf9] to-transparent"></div>
            </div>
        )}

        <div className="max-w-3xl mx-auto px-6 py-12 lg:px-10 lg:py-16 relative">
           {/* Title Section if no image, or overlay */}
           {!item.imageUrl && (
               <div className="mb-12 text-center border-b border-slate-200 pb-8">
                   <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4 leading-tight">{item.title}</h1>
                   <p className="text-lg text-slate-500 font-medium">{item.author}</p>
               </div>
           )}
           
           {item.imageUrl && (
               <div className="mb-12 -mt-20 relative z-10 text-center">
                   <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4 leading-tight drop-shadow-sm">{item.title}</h1>
               </div>
           )}

           {/* Main Text */}
           <div 
            ref={contentRef}
            className="prose prose-slate prose-lg max-w-none font-serif leading-relaxed prose-headings:font-sans prose-headings:font-bold prose-p:text-slate-800"
            style={{ fontSize: `${fontSize}px` }}
           >
             <ReactMarkdown>{item.content}</ReactMarkdown>
           </div>
        </div>

        {/* Side Panel for Highlights (Desktop) */}
        {itemHighlights.length > 0 && (
            <div className="fixed right-6 top-24 w-64 hidden xl:block space-y-4 animate-fadeIn z-30">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-1">Your Highlights</h3>
                <div className="space-y-3 max-h-[calc(100vh-150px)] overflow-y-auto pr-2 pb-4 custom-scrollbar">
                    {itemHighlights.map(h => (
                        <div key={h.id} className={`p-4 rounded-xl text-sm border-l-4 shadow-sm bg-white transition-all hover:shadow-md
                            ${h.color === 'yellow' ? 'border-yellow-300' : 
                              h.color === 'green' ? 'border-green-300' : 
                              h.color === 'blue' ? 'border-blue-300' : 'border-pink-300'}`}
                        >
                            <p className="text-slate-700 italic mb-3 line-clamp-4 font-serif leading-relaxed">"{h.text}"</p>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                <span className="text-[10px] text-slate-400 font-medium">{new Date(h.timestamp).toLocaleDateString()}</span>
                                <button 
                                    onClick={() => onRemoveHighlight(h.id)}
                                    className="text-slate-300 hover:text-red-400 transition-colors p-1"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* Floating Toolbar for Selection */}
      {selection && (
        <div 
            className="fixed z-50 bg-slate-900 text-white rounded-full shadow-2xl px-2 py-2 flex items-center gap-1 -translate-x-1/2 animate-in fade-in zoom-in duration-200"
            style={{ top: selection.top, left: selection.left }}
        >
            <div className="flex items-center gap-1 border-r border-slate-700 pr-2 mr-2">
                <ColorBtn color="yellow" onClick={() => handleHighlight('yellow')} />
                <ColorBtn color="green" onClick={() => handleHighlight('green')} />
                <ColorBtn color="pink" onClick={() => handleHighlight('pink')} />
            </div>
            <button 
                onClick={handleExplain}
                className="flex items-center gap-2 hover:bg-slate-800 px-3 py-1.5 rounded-full transition-colors"
            >
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-xs font-bold tracking-wide">Explain</span>
            </button>
        </div>
      )}

      {/* Explanation Modal */}
      {showExplainModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-100 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3 text-brand-600">
                        <div className="p-2 bg-brand-50 rounded-xl">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900">Gemini Analysis</h3>
                      </div>
                      <button onClick={() => setShowExplainModal(false)} className="text-slate-300 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-full">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  {isExplaining ? (
                      <div className="py-12 flex flex-col items-center text-slate-500">
                          <div className="relative w-12 h-12 mb-4">
                             <div className="absolute inset-0 border-4 border-brand-100 rounded-full"></div>
                             <div className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"></div>
                          </div>
                          <p className="text-sm font-medium">Analyzing context...</p>
                      </div>
                  ) : (
                      <div className="prose prose-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl">
                          <p className="m-0">{explanation}</p>
                      </div>
                  )}
                  
                  {!isExplaining && (
                      <div className="mt-6 flex justify-end">
                          <button onClick={() => setShowExplainModal(false)} className="text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors">
                              Done
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

// Subcomponents
const ColorBtn = ({ color, onClick }: { color: string, onClick: () => void }) => {
    const bgClass = {
        yellow: 'bg-yellow-400',
        green: 'bg-green-400',
        blue: 'bg-blue-400',
        pink: 'bg-pink-400'
    }[color] || 'bg-yellow-400';

    return (
        <button 
            onClick={onClick}
            className={`w-6 h-6 rounded-full ${bgClass} hover:scale-110 transition-transform ring-2 ring-offset-2 ring-offset-slate-900 ring-transparent hover:ring-white/20`} 
        />
    );
}