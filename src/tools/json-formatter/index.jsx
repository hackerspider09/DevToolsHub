import { useState, useMemo } from 'react';
import { Copy, Check, Braces, Zap, CheckCircle2, XCircle, Info, RefreshCw, ChevronDown } from 'lucide-react';

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

function countKeys(obj, depth = 0) {
  if (typeof obj !== 'object' || obj === null) return { keys: 0, maxDepth: depth };
  let keys = 0;
  let maxDepth = depth;
  for (const v of Object.values(obj)) {
    keys++;
    const nested = countKeys(v, depth + 1);
    keys += nested.keys;
    if (nested.maxDepth > maxDepth) maxDepth = nested.maxDepth;
  }
  return { keys, maxDepth };
}

export default function JsonFormatter() {
  const [input, setInput] = useState(DEFAULT_JSON);
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [tabSize, setTabSize] = useState(2); 
  const [isMinified, setIsMinified] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) return { status: 'empty', output: '' };
    try {
      const parsed = JSON.parse(input);
      if (parsed === null || parsed === undefined) return { status: 'empty', output: '' };
      
      const isObject = typeof parsed === 'object';
      const { keys, maxDepth } = isObject ? countKeys(parsed) : { keys: 0, maxDepth: 0 };
      const lines = input.split('\n').filter(l => l.trim()).length;
      
      const output = isMinified ? JSON.stringify(parsed) : JSON.stringify(parsed, null, tabSize);
      
      return {
        status: 'valid',
        type: Array.isArray(parsed) ? 'Array' : typeof parsed === 'object' ? 'Object' : typeof parsed,
        topLevelKeys: isObject && !Array.isArray(parsed) ? Object.keys(parsed).length : (Array.isArray(parsed) ? parsed.length : 1),
        totalKeys: keys,
        maxDepth,
        lines,
        output
      };
    } catch (err) {
      return { status: 'error', message: err.message, output: '' };
    }
  }, [input, tabSize, isMinified]);

  const copyInputText = () => {
    navigator.clipboard.writeText(input);
    setCopiedInput(true);
    setTimeout(() => setCopiedInput(false), 2000);
  };

  const copyOutputText = () => {
    navigator.clipboard.writeText(result.status === 'valid' ? result.output : input);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  const reset = () => {
    setInput(DEFAULT_JSON);
    setIsMinified(false);
    setTabSize(2);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {result.status === 'valid' && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-400">
              <CheckCircle2 size={16} /> Valid JSON
            </span>
          )}
          {result.status === 'error' && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-red-400">
              <XCircle size={16} /> Invalid JSON
            </span>
          )}
          {result.status === 'empty' && (
            <span className="text-sm text-muted-foreground">Paste JSON to validate</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-lg border border-border">
            <span>Mode:</span>
            <div className="relative flex items-center">
              <select 
                value={isMinified ? 'minify' : 'beautify'} 
                onChange={(e) => setIsMinified(e.target.value === 'minify')}
                className="bg-transparent text-primary font-mono outline-none cursor-pointer appearance-none pr-4"
              >
                <option value="beautify" className="bg-card text-foreground">Beautify</option>
                <option value="minify" className="bg-card text-foreground">Minify</option>
              </select>
              <ChevronDown size={14} className="absolute right-0 pointer-events-none text-primary/70" />
            </div>
          </div>
          <div className={`flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-lg border border-border transition-opacity ${isMinified ? 'opacity-50 pointer-events-none' : ''}`}>
            <span>Indent:</span>
            <div className="relative flex items-center">
              <select 
                value={tabSize} 
                onChange={(e) => setTabSize(Number(e.target.value))}
                className="bg-transparent text-primary font-mono outline-none cursor-pointer appearance-none pr-4"
              >
                <option value={2} className="bg-card text-foreground">2 spaces</option>
                <option value={4} className="bg-card text-foreground">4 spaces</option>
              </select>
              <ChevronDown size={14} className="absolute right-0 pointer-events-none text-primary/70" />
            </div>
          </div>
          <button onClick={reset} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5">
            <RefreshCw size={12} /> Example
          </button>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        {/* Input */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border/60 bg-secondary/30 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Input JSON</span>
            <button 
              onClick={copyInputText}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              {copiedInput ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              {copiedInput ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="flex flex-1 overflow-auto relative">
            <textarea 
              className={`flex-1 w-full p-4 bg-transparent outline-none font-mono text-sm shadow-sm transition-all resize-none leading-relaxed h-full ${result.status === 'error' ? 'bg-red-500/5' : ''}`}
              placeholder="Paste your JSON here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck="false"
            />
          </div>
        </div>

        {/* Output */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border/60 bg-secondary/30 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Formatted Result</span>
            <button 
              onClick={copyOutputText}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              {copiedOutput ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              {copiedOutput ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className={`flex flex-1 overflow-auto p-4 bg-card/50 relative ${result.status === 'error' ? 'bg-red-500/5' : ''}`}>
             {result.status === 'error' ? (
               <div className="absolute inset-0 p-4 overflow-auto">
                 <p className="text-xs font-bold text-red-500 uppercase mb-2">Syntax Error</p>
                 <code className="text-sm text-red-400 block whitespace-pre-wrap font-mono leading-relaxed">{result.message}</code>
               </div>
             ) : (
               <textarea 
                 readOnly
                 className="flex-1 w-full h-full bg-transparent outline-none font-mono text-sm text-foreground resize-none leading-relaxed overflow-auto"
                 value={result.output}
                 placeholder="Result will appear here..."
               />
             )}
          </div>
        </div>
      </div>

      {/* Stats + Error Below */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Status card */}
          <div className={`rounded-xl border p-5 h-full ${
            result.status === 'valid' ? 'border-green-500/25 bg-green-500/5' :
            result.status === 'error' ? 'border-red-500/25 bg-red-500/5' :
            'border-border bg-card'
          }`}>
            {result.status === 'valid' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                  <CheckCircle2 size={18} /> Syntax Valid
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Root Type', val: result.type },
                    { label: 'Top Level Keys', val: result.topLevelKeys },
                    { label: 'Total Keys', val: result.totalKeys },
                    { label: 'Max Depth', val: result.maxDepth },
                    { label: 'Content Lines', val: result.lines },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-background/60 rounded-lg p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                      <p className="text-sm font-mono font-semibold text-foreground mt-0.5">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.status === 'error' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                  <XCircle size={18} /> Parse Error
                </div>
                <p className="text-xs font-mono text-red-400 leading-relaxed break-words">{result.message}</p>
              </div>
            )}
            {result.status === 'empty' && (
              <div className="flex items-start gap-2 text-muted-foreground text-sm">
                <Info size={16} className="shrink-0 mt-0.5" />
                Paste or type JSON to see validation results.
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          {/* Tips */}
          <div className="rounded-xl border border-border bg-card p-5 h-full space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Common Issues</p>
            {[
              'Trailing commas are not allowed in JSON',
              'All keys must be double-quoted',
              'Single quotes are not allowed',
              'Values must be valid JSON types'
            ].map((tip) => (
              <p key={tip} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-primary mt-0.5">›</span> {tip}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
