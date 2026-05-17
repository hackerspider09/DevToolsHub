import { Link, useLocation } from 'react-router-dom';
import { Github, Search, Settings } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

export default function Navbar() {
  const location = useLocation();

  const links = [
    { name: 'Tools', path: '/' },
    { name: 'Favorites', path: '/favorites' },
    { name: 'Explore', path: '/explore' },
    { name: 'Downloads', path: '/downloads' },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between w-full px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center space-x-2 shrink-0">
          <img src="/logo.png" alt="DevTools Hub" className="h-8 w-8 rounded-md" />
          <span className="hidden font-bold sm:inline-block">
            DevTools Hub
          </span>
        </Link>
        <nav className="flex items-center space-x-4 sm:space-x-6 text-sm font-medium overflow-x-auto no-scrollbar">
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition-colors hover:text-foreground/80 whitespace-nowrap ${
                location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
                  ? 'text-foreground'
                  : 'text-foreground/60'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </nav>
  );
}
