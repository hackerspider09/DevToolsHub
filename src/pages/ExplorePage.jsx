import { useState } from 'react';
import { Link } from 'react-router-dom';
import { topics } from '../config/topics';
import FilterBar from '../components/FilterBar';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const allTags = [...new Set(topics.flatMap(topic => topic.tags))];

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = !selectedCategory || topic.tags.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Knowledge Hub</h1>
        <p className="text-lg text-muted-foreground">
          Explore documentation, cheatsheets, and articles across various technologies.
        </p>
      </div>

      <FilterBar 
        placeholder="Search topics..."
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={allTags}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {filteredTopics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map(topic => {
            const Icon = topic.icon;
            return (
              <Link key={topic.id} to={`/explore/${topic.slug}`}>
                <div className="group rounded-xl border border-border bg-card p-6 hover:bg-card-hover hover:border-primary/50 transition-all duration-300 cursor-pointer h-full flex flex-col">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon size={24} />
                  </div>
                  <h2 className="text-xl font-bold mb-2">{topic.title}</h2>
                  <p className="text-sm text-muted-foreground mb-6 flex-grow">{topic.shortDescription}</p>
                  <div className="flex flex-wrap gap-2">
                    {topic.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center rounded-full bg-primary/5 border border-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-muted-foreground">No topics found matching your criteria.</p>
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
