import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { tools, categories } from '../tools/registry';
import FilterBar from '../components/FilterBar';
import useAppStore from '../store/useAppStore';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { favorites, toggleFavorite } = useAppStore();

  const filteredTools = tools.filter(tool => {
    if (!tool.visible) return false;
    
    const matchesSearch = 
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = !selectedCategory || tool.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Developer Tools</h1>
        <p className="text-lg text-muted-foreground">
          A collection of tools and utilities for developers.
        </p>
      </div>

      <FilterBar 
        placeholder="Search tools..."
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.id} to={`/tools/${tool.slug}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative rounded-xl border border-border bg-card p-6 hover:bg-card-hover hover:border-primary/50 hover:shadow-xl transition-all duration-300 h-full flex flex-col cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Icon size={24} />
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(tool.slug);
                      }}
                      className="p-2 -mt-2 -mr-2 rounded-full hover:bg-secondary transition-colors"
                      title={favorites.includes(tool.slug) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star size={20} className={favorites.includes(tool.slug) ? "text-amber-400 fill-amber-400" : "text-muted-foreground hover:text-amber-400"} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{tool.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground flex-grow">{tool.shortDescription}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {tool.tags.slice(0,3).map(tag => (
                      <span key={tag} className="inline-flex items-center rounded-full bg-primary/5 border border-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-muted-foreground">No tools found matching your criteria.</p>
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
