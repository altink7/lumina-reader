import React from 'react';
import { ReadingItem } from '../types';
import { Book, Newspaper, Clock, Trash2, ArrowRight } from 'lucide-react';

interface LibraryProps {
  items: ReadingItem[];
  onOpenItem: (item: ReadingItem) => void;
  onDeleteItem: (id: string) => void;
}

export const Library: React.FC<LibraryProps> = ({ items, onOpenItem, onDeleteItem }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fadeIn">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Book className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Your library is empty</h2>
        <p className="text-slate-500 max-w-md mb-8">
          Use the Discover tab to find books and news powered by Gemini, or add your own content to start reading.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full p-6 lg:p-10 overflow-y-auto pb-20 h-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold text-slate-900">My Library</h1>
        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {items.length} {items.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div 
            key={item.id}
            onClick={() => onOpenItem(item)}
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer"
          >
            <div className="h-40 bg-gradient-to-br from-slate-50 to-slate-200 relative overflow-hidden">
               {item.imageUrl ? (
                   <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
               ) : (
                   <>
                     {/* Fallback Decorative pattern */}
                     <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
                   </>
               )}
               
               <div className="absolute top-4 left-4 z-10 flex items-start justify-between w-[calc(100%-32px)]">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm
                    ${item.type === 'book' ? 'bg-amber-100/90 text-amber-800' : 'bg-blue-100/90 text-blue-800'}`}>
                    {item.type}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className="p-2 bg-white/50 hover:bg-red-500 hover:text-white backdrop-blur-md rounded-full text-slate-600 transition-all shadow-sm"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="font-serif font-bold text-xl text-slate-900 mb-2 line-clamp-2 group-hover:text-brand-700 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500 mb-4 font-medium">
                {item.author || 'Unknown Author'}
              </p>
              
              <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-1">
                {item.description || item.content.substring(0, 150) + "..."}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(item.dateAdded).toLocaleDateString()}
                </span>
                <button 
                  className="flex items-center gap-1 text-sm font-bold text-brand-600 group-hover:translate-x-1 transition-transform"
                >
                  Read Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};