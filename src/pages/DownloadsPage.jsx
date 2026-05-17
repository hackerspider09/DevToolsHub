import { useState } from 'react';
import { Download, Monitor, Copy } from 'lucide-react';
import { downloads } from '../config/downloads';
import FilterBar from '../components/FilterBar';

export default function DownloadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [...new Set(downloads.map(dl => dl.category))];

  const filteredDownloads = downloads.filter(dl => {
    const matchesSearch = 
      dl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dl.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = !selectedCategory || dl.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Downloads Directory</h1>
        <p className="text-lg text-muted-foreground">
          Essential developer software and tools.
        </p>
      </div>

      <FilterBar 
        placeholder="Search downloads..."
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {filteredDownloads.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDownloads.map(dl => {
            const Icon = dl.icon;
            return (
              <div key={dl.id} className="group flex flex-col justify-between p-3 rounded-xl border border-border bg-card hover:bg-card-hover hover:border-primary/50 transition-all duration-300">
                <div className="flex gap-4">
                  <div className="shrink-0 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h2 className="text-base font-bold truncate text-foreground">{dl.title}</h2>
                    </div>
                    <div className="mb-2">
                      <span className="inline-flex items-center rounded-full bg-primary/5 border border-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary uppercase tracking-wider">
                        {dl.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">{dl.shortDescription}</p>
                  </div>
                </div>
                
                <div className="mt-auto space-y-3 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {dl.os.map((o) => (
                        <span key={o} className="inline-flex items-center rounded-md bg-secondary/30 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground uppercase tracking-tight">
                          {o}
                        </span>
                      ))}
                    </div>
                    <a 
                      href={dl.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 hover:bg-primary hover:text-white transition-colors rounded-lg"
                    >
                      <Download size={12} /> Get
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-muted-foreground">No downloads found matching your criteria.</p>
          <button 
            onClick={() => {setSearchQuery(''); setSelectedCategory('');}}
            className="mt-4 text-primary hover:underline text-sm"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
