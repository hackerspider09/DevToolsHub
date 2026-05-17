import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, BookOpen } from 'lucide-react';
import { getTopicBySlug } from '../config/topics';

export default function TopicDetailPage() {
  const { topic: slug } = useParams();
  const topicData = getTopicBySlug(slug);

  if (!topicData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Topic Not Found</h2>
        <Link to="/explore" className="text-primary hover:underline flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link to="/explore" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explore
        </Link>
        <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" /> {topicData.title}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">{topicData.shortDescription}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {topicData.tags.map(tag => (
            <span key={tag} className="inline-flex items-center rounded-full bg-primary/5 border border-primary/20 px-3 py-1 text-xs font-bold text-primary uppercase tracking-widest">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-8">
        <h2 className="text-2xl font-semibold mb-6">Learning Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topicData.resources.map((res, i) => (
            <a 
              key={i} 
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-card-hover transition-colors group"
            >
              <div>
                <div className="font-medium group-hover:text-primary transition-colors">{res.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{res.type}</div>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
