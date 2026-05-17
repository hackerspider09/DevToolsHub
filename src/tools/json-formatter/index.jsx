import { useState, useEffect } from 'react';
import { Copy, Check, Braces, Zap } from 'lucide-react';

const DEFAULT_JSON = JSON.stringify({
  project: "DevTools Hub",
  version: "1.0.0",
  status: "active",
  features: ["JSON Formatter", "Base64 Converter", "JWT Debugger"],
  stats: {
    speed: "Instant",
    ui: "Premium"
  }
}, null, 2);

export default function JsonFormatter() {
  const [input, setInput] = useState(DEFAULT_JSON);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [tabSize, setTabSize] = useState(2); 
  const [isMinified, setIsMinified] = useState(false);

  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      if (isMinified) {
        setOutput(JSON.stringify(parsed));
      } else {
        setOutput(JSON.stringify(parsed, null, tabSize));
      }
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, [input, tabSize, isMinified]);

  const copy = () => {
    navigator.clipboard.writeText(output || input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center gap-6">
        {/* Action Group */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Actions</span>
          <div className="flex gap-1 bg-muted/30 p-1 rounded-xl border border-border/50">
            <button
              onClick={() => setIsMinified(false)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                !isMinified 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              Beautify
            </button>
            <button
              onClick={() => setIsMinified(true)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                isMinified 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              Minify
            </button>
          </div>
        </div>

        {/* Indentation Group */}
        <div className={`flex flex-col gap-2 transition-opacity duration-300 ${isMinified ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Spaces</span>
          <div className="flex gap-1 bg-muted/30 p-1 rounded-xl border border-border/50">
            <button
              onClick={() => setTabSize(2)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                tabSize === 2 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              2
            </button>
            <button
              onClick={() => setTabSize(4)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                tabSize === 4 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              4
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        {/* Input */}
        <div className="flex flex-col space-y-3 h-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Input JSON</span>
          </div>
          <textarea 
            className={`flex-1 w-full p-5 rounded-xl bg-background border outline-none font-mono text-sm shadow-sm transition-all resize-none leading-relaxed h-full ${error ? 'border-red-500/30 focus:ring-red-500/10' : 'border-border focus:ring-primary/50'}`}
            placeholder="Paste your JSON here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck="false"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col space-y-3 h-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Formatted Result</span>
            <button 
              onClick={copy}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className={`flex-1 w-full rounded-xl border bg-card/50 overflow-hidden relative flex flex-col h-full ${error ? 'border-red-500/20' : 'border-border'}`}>
             {error ? (
               <div className="absolute inset-0 p-5 bg-red-500/5 overflow-auto">
                 <p className="text-xs font-bold text-red-500 uppercase mb-2">Syntax Error</p>
                 <code className="text-sm text-red-400 block whitespace-pre-wrap font-mono leading-relaxed">{error}</code>
               </div>
             ) : (
               <textarea 
                 readOnly
                 className="flex-1 w-full h-full p-5 bg-transparent outline-none font-mono text-sm text-foreground resize-none leading-relaxed"
                 value={output}
                 placeholder="Result will appear here..."
               />
             )}
          </div>
        </div>
      </div>


      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
        <Zap className="text-primary h-4 w-4 shrink-0" />
        <p className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">Real-time Validation:</span> Catch syntax errors instantly as you type.
        </p>
      </div>
    </div>
  );
}
