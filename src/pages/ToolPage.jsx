import { Suspense, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Share2, Check } from 'lucide-react';
import { getToolBySlug } from '../tools/registry';
import useAppStore from '../store/useAppStore';

export default function ToolPage() {
  const { slug } = useParams();
  const toolData = getToolBySlug(slug);
  const { favorites, toggleFavorite } = useAppStore();
  const [shared, setShared] = useState(false);

  if (!toolData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Tool Not Found</h2>
        <Link to="/" className="text-primary hover:underline flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const ToolComponent = toolData.component;
  const Icon = toolData.icon;

  const handleShare = async () => {
    const shareData = {
      title: `${toolData.title} - DevTools Hub`,
      text: toolData.shortDescription,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="w-full mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> All Tools
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
              <Icon size={32} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{toolData.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-widest">
                  {toolData.category}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:self-start md:self-auto">
            <button
              onClick={() => toggleFavorite(toolData.slug)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/40 text-muted-foreground hover:text-amber-400 transition-colors text-xs font-semibold shadow-sm"
              title={favorites.includes(toolData.slug) ? "Remove from favorites" : "Add to favorites"}
            >
              <Star size={14} className={favorites.includes(toolData.slug) ? "text-amber-400 fill-amber-400" : "text-muted-foreground"} />
              <span>{favorites.includes(toolData.slug) ? "Favorited" : "Favorite"}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/40 text-muted-foreground hover:text-primary transition-colors text-xs font-semibold shadow-sm"
              title="Share tool link"
            >
              {shared ? (
                <>
                  <Check size={14} className="text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>
        <p className="text-lg text-muted-foreground mt-2">{toolData.longDescription}</p>
      </div>

      <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
        <Suspense fallback={
          <div className="p-12 flex items-center justify-center">
            <div className="animate-pulse flex space-x-2 items-center text-muted-foreground">
              <div className="h-4 w-4 bg-primary/50 rounded-full animate-bounce"></div>
              <span>Loading tool...</span>
            </div>
          </div>
        }>
          <ToolComponent />
        </Suspense>
      </div>
    </div>
  );
}
