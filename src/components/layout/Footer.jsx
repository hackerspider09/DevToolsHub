import { Terminal, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 z-50 w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 md:py-0 md:h-16">
      <div className="mx-auto flex flex-col items-center justify-between w-full gap-2 h-full md:flex-row px-4 sm:px-6 lg:px-8 xl:px-16">
        <div className="flex items-center gap-2 text-sm leading-loose text-muted-foreground">
          <img src="/logo.png" alt="Logo" className="h-6 w-6 rounded-sm opacity-80" />
          <p>
            Built by <span className="text-primary">Prasad Khatake</span>.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <a
            href="https://github.com/hackerspider09/DevToolsHub"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <Github size={16} />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
