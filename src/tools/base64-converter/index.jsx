import { useState, useEffect, useRef } from 'react';
import { Copy, Check, ArrowRightLeft } from 'lucide-react';

const DEFAULT_TEXT = 'Hello, Developer! Welcome to the DevTools Hub.';

export default function Base64Converter() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [base64, setBase64] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);
  
  const lastEdited = useRef('text');

  useEffect(() => {
    if (lastEdited.current === 'text') {
      try {
        setBase64(btoa(text));
        setError('');
      } catch (e) {
        setBase64('');
        setError('Cannot encode: non-Latin1 characters detected.');
      }
    }
  }, [text]);

  useEffect(() => {
    if (lastEdited.current === 'base64') {
      try {
        if (!base64.trim()) {
          setText('');
          setError('');
          return;
        }
        setText(atob(base64));
        setError('');
      } catch (e) {
        setError('Invalid Base64 string');
      }
    }
  }, [base64]);

  const copy = (val, type) => {
    navigator.clipboard.writeText(val);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
        {/* Text Input */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Plain Text</span>
            <button 
              onClick={() => copy(text, 'text')}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              {copied === 'text' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              {copied === 'text' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <textarea 
            className="flex-1 w-full p-5 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/50 outline-none font-mono text-sm shadow-sm transition-all resize-none leading-relaxed"
            placeholder="Type or paste text here..."
            value={text}
            onChange={(e) => {
              lastEdited.current = 'text';
              setText(e.target.value);
            }}
          />
        </div>

        {/* Base64 Output/Input */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Base64</span>
            <button 
              onClick={() => copy(base64, 'base64')}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              {copied === 'base64' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              {copied === 'base64' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <textarea 
            className={`flex-1 w-full p-5 rounded-xl bg-background border outline-none font-mono text-sm shadow-sm transition-all resize-none leading-relaxed ${error ? 'border-red-500/50 focus:ring-red-500/20 text-red-400' : 'border-border focus:ring-primary/50'}`}
            placeholder="Type or paste Base64 here..."
            value={base64}
            onChange={(e) => {
              lastEdited.current = 'base64';
              setBase64(e.target.value);
            }}
          />
          {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter text-right">{error}</p>}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
        <ArrowRightLeft className="text-primary h-4 w-4 shrink-0" />
        <p className="text-xs text-muted-foreground">
          This tool features <span className="font-bold text-foreground">Bi-directional Sync</span>. Editing either side instantly updates the other.
        </p>
      </div>
    </div>
  );
}
