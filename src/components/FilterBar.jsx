import { Search, Filter, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FilterBar({
  placeholder = "Search...",
  searchQuery,
  setSearchQuery,
  categories = [],
  selectedCategory,
  setSelectedCategory,
  showFilter = true
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [shortcutLabel, setShortcutLabel] = useState('Ctrl+/');
  const inputRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.userAgent.indexOf('Mac') !== -1) {
      setShortcutLabel('⌘/');
    }

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder={`${placeholder} (${shortcutLabel})`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-lg py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {showFilter && (
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium transition-colors ${isFilterOpen || selectedCategory ? 'bg-primary/10 border-primary/50 text-primary' : 'hover:bg-secondary'
              }`}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {selectedCategory && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px]">
                1
              </span>
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-lg border border-border bg-card/50 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${!selectedCategory
                        ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20'
                        : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${selectedCategory === cat
                          ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20'
                          : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
