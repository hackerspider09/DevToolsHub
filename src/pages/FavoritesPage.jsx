import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { tools } from '../tools/registry';
import useAppStore from '../store/useAppStore';

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useAppStore();

  const favoriteTools = tools.filter(tool => favorites.includes(tool.slug) && tool.visible);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <Star className="text-amber-400 fill-amber-400" size={36} /> Favorites
        </h1>
        <p className="text-lg text-muted-foreground">
          Your saved tools for this session.
        </p>
      </div>

      {favoriteTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteTools.map((tool, index) => {
            const Icon = tool.icon;
            const isFavorite = true;
            return (
              <div 
                key={tool.id} 
                className="group relative rounded-xl border border-border bg-card p-6 hover:bg-card-hover hover:border-primary/50 hover:shadow-xl transition-all duration-300 h-full flex flex-col"
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
                    title="Remove from favorites"
                  >
                    <Star size={20} className={isFavorite ? "text-amber-400 fill-amber-400" : "text-muted-foreground"} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{tool.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground flex-grow">{tool.shortDescription}</p>
                
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {tool.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="inline-flex items-center rounded-full bg-primary/5 border border-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link 
                    to={`/tools/${tool.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest"
                  >
                    Open <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-xl border border-dashed border-border bg-card/30">
          <Star size={48} className="text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold mb-2">No favorites yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Click the star icon on any tool card to save it here for quick access during your session.
          </p>
          <Link 
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Browse Tools
          </Link>
        </div>
      )}
    </div>
  );
}
