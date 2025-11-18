import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Discover } from './components/Discover';
import { Library } from './components/Library';
import { Reader } from './components/Reader';
import { Settings } from './components/Settings';
import { ReadingItem, Highlight, AppSettings } from './types';

// Sample Initial Data
const DEMO_ITEMS: ReadingItem[] = [
  {
    id: 'demo-1',
    title: 'The Future of AI',
    author: 'Tech Daily',
    description: 'An exploration of how Artificial Intelligence is reshaping our world, from healthcare to creative arts.',
    content: `
# The Future of Artificial Intelligence

Artificial Intelligence (AI) is no longer a concept confined to science fiction; it is a reality that is rapidly transforming our world. From the algorithms that power our social media feeds to the advanced diagnostics in healthcare, AI is pervasive.

## The Impact on Healthcare
One of the most promising areas for AI application is healthcare. Machine learning models are now capable of analyzing medical images with accuracy that rivals, and sometimes exceeds, human experts. This capability allows for earlier detection of diseases such as cancer, potentially saving countless lives.

## Creative Renaissance
Contrary to the fear that AI will replace human creativity, many artists are finding it to be a powerful tool. Generative AI models allow creators to explore new visual styles, generate musical ideas, and even brainstorm plot points for novels.

## Ethical Considerations
However, this rapid progress comes with challenges. Issues of bias in algorithms, data privacy, and the displacement of jobs are critical conversations that society must address. As we move forward, the goal should be to develop ethical AI that augments human capabilities rather than diminishing them.
    `,
    type: 'article',
    dateAdded: Date.now() - 10000000,
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1600' // Demo image
  }
];

const DEFAULT_SETTINGS: AppSettings = {
    enableAIImages: true,
    userName: 'Reader',
    themeColor: 'teal'
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'discover' | 'library' | 'reader' | 'settings'>('discover');
  
  const [library, setLibrary] = useState<ReadingItem[]>(() => {
      const saved = localStorage.getItem('lumina-library');
      return saved ? JSON.parse(saved) : DEMO_ITEMS;
  });
  
  const [highlights, setHighlights] = useState<Highlight[]>(() => {
      const saved = localStorage.getItem('lumina-highlights');
      return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
      const saved = localStorage.getItem('lumina-settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [activeItem, setActiveItem] = useState<ReadingItem | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('lumina-library', JSON.stringify(library));
  }, [library]);

  useEffect(() => {
    localStorage.setItem('lumina-highlights', JSON.stringify(highlights));
  }, [highlights]);

  useEffect(() => {
    localStorage.setItem('lumina-settings', JSON.stringify(settings));
  }, [settings]);

  // Update theme color in CSS vars if needed, or just handle via classes
  // For now, we stick to the 'brand' color tailwind setup in index.html

  const addToLibrary = (item: ReadingItem) => {
    setLibrary(prev => [item, ...prev]);
  };

  const removeFromLibrary = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
        setLibrary(prev => prev.filter(i => i.id !== id));
        if (activeItem?.id === id) {
            setActiveItem(null);
            setCurrentView('library');
        }
    }
  };

  const openReader = (item: ReadingItem) => {
    setActiveItem(item);
    setCurrentView('reader');
  };

  const addHighlight = (h: Highlight) => {
      setHighlights(prev => [...prev, h]);
  };

  const removeHighlight = (id: string) => {
      setHighlights(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden selection:bg-brand-200 selection:text-brand-900">
      {/* Sidebar Navigation */}
      {currentView !== 'reader' && (
          <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden relative">
        {currentView === 'discover' && (
          <Discover 
            onAddToLibrary={addToLibrary} 
            onReadNow={openReader} 
            settings={settings}
          />
        )}
        
        {currentView === 'library' && (
          <Library 
            items={library} 
            onOpenItem={openReader} 
            onDeleteItem={removeFromLibrary} 
          />
        )}
        
        {currentView === 'settings' && (
            <Settings settings={settings} onUpdateSettings={setSettings} />
        )}
        
        {currentView === 'reader' && activeItem && (
          <Reader 
            item={activeItem} 
            onBack={() => setCurrentView('library')}
            highlights={highlights}
            onAddHighlight={addHighlight}
            onRemoveHighlight={removeHighlight}
          />
        )}
      </main>
    </div>
  );
};

export default App;