import { useState, useMemo } from 'react';
import { Copy, Check, Info, AlertCircle, Regex, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

const DEFAULT_PATTERN = '([A-Z])\\w+';
const DEFAULT_FLAGS = 'g';
const DEFAULT_TEXT = `Welcome to DevTools Hub Regex Tester!

This tool is perfect for:
1. Extracting Emails: contact@example.com
2. Finding IPs: 192.168.1.1
3. Matching Dates: 2026-07-05

Enjoy fast and safe pattern matching.`;

export default function RegexTester() {
  const [pattern, setPattern] = useState(DEFAULT_PATTERN);
  const [flags, setFlags] = useState(DEFAULT_FLAGS);
  const [testString, setTestString] = useState(DEFAULT_TEXT);
  const [copiedInput, setCopiedInput] = useState(false);

  const result = useMemo(() => {
    if (!testString) return { elements: null, count: 0, error: '' };
    if (!pattern) return { elements: <span className="text-muted-foreground">{testString}</span>, count: 0, error: '' };

    try {
      // Validate flags first to prevent immediate crash if user types invalid flags
      const validFlags = flags.split('').every(f => 'gimsuy'.includes(f));
      if (!validFlags) {
        throw new Error("Invalid regular expression flags");
      }

      const regex = new RegExp(pattern, flags);
      const matches = [];
      let match;

      if (regex.global) {
        while ((match = regex.exec(testString)) !== null) {
          if (match[0].length === 0) {
            regex.lastIndex++; // Avoid infinite loop on zero-length matches
          }
          if (match[0].length > 0) {
            matches.push({ start: match.index, end: match.index + match[0].length, val: match[0] });
          }
        }
      } else {
        match = regex.exec(testString);
        if (match && match[0].length > 0) {
          matches.push({ start: match.index, end: match.index + match[0].length, val: match[0] });
        }
      }

      if (matches.length === 0) {
        return { elements: <span className="text-muted-foreground">{testString}</span>, count: 0, error: '' };
      }

      const elements = [];
      let cursor = 0;
      matches.forEach((m, i) => {
        if (m.start > cursor) {
          elements.push(<span key={`text-${i}`} className="text-foreground">{testString.substring(cursor, m.start)}</span>);
        }
        elements.push(
          <span 
            key={`match-${i}`} 
            className="bg-amber-400/30 text-amber-200 font-bold rounded-sm px-[2px] mx-[1px]"
            title={`Match ${i + 1}: ${m.val}`}
          >
            {m.val}
          </span>
        );
        cursor = m.end;
      });

      if (cursor < testString.length) {
        elements.push(<span key="text-end" className="text-foreground">{testString.substring(cursor)}</span>);
      }

      return { elements, count: matches.length, error: '' };
    } catch (err) {
      return { elements: <span className="text-muted-foreground">{testString}</span>, count: 0, error: err.message };
    }
  }, [pattern, flags, testString]);

  const copyInputText = () => {
    navigator.clipboard.writeText(testString);
    setCopiedInput(true);
    setTimeout(() => setCopiedInput(false), 2000);
  };

  const reset = () => {
    setPattern(DEFAULT_PATTERN);
    setFlags(DEFAULT_FLAGS);
    setTestString(DEFAULT_TEXT);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Top Toolbar / Regex Input */}
      <div className="flex flex-col gap-3 p-5 bg-card border border-border rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/80"></div>
        
        <div className="flex items-center justify-between">
           <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
             <Regex size={14} /> Regular Expression
           </span>
           <button onClick={reset} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5">
            <RefreshCw size={12} /> Example
          </button>
        </div>

        <div className={`flex items-center bg-background rounded-lg border overflow-hidden transition-colors ${result.error ? 'border-red-500/40 ring-1 ring-red-500/20' : 'border-border focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20'}`}>
           <div className="px-4 text-muted-foreground font-mono font-bold bg-muted/30 border-r border-border h-12 flex items-center text-lg">/</div>
           <input 
             type="text" 
             className="flex-1 bg-transparent px-4 font-mono text-base outline-none text-foreground placeholder:text-muted-foreground/30"
             value={pattern}
             onChange={(e) => setPattern(e.target.value)}
             placeholder="Enter pattern here..."
             spellCheck={false}
           />
           <div className="px-4 text-muted-foreground font-mono font-bold bg-muted/30 border-l border-r border-border h-12 flex items-center text-lg">/</div>
           <input 
             type="text" 
             className="w-24 bg-transparent px-4 font-mono text-base outline-none text-amber-400 placeholder:text-muted-foreground/40"
             value={flags}
             onChange={(e) => setFlags(e.target.value)}
             placeholder="gmi"
             spellCheck={false}
             maxLength={6}
           />
        </div>

        {/* Validation Result */}
        <div className="flex items-center gap-2 mt-1">
          {result.error ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-red-400">
              <AlertCircle size={14} /> {result.error}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
              <CheckCircle2 size={14} /> Valid Regex
            </span>
          )}
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
        {/* Input Text */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border/60 bg-secondary/30 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Test String</span>
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
              className="flex-1 w-full p-4 bg-transparent outline-none font-mono text-sm shadow-sm transition-all resize-none leading-relaxed h-full text-foreground placeholder:text-muted-foreground/30"
              placeholder="Paste your test string here..."
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              spellCheck="false"
            />
          </div>
        </div>

        {/* Highlighted Matches */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border/60 bg-secondary/30 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Match Results {result.count > 0 && <span className="ml-1 text-amber-400 font-bold">({result.count})</span>}
            </span>
          </div>
          <div className="flex flex-1 overflow-auto p-4 bg-card/50 relative">
             <div className="w-full h-full font-mono text-sm whitespace-pre-wrap leading-relaxed break-words">
                {result.elements}
             </div>
          </div>
        </div>
      </div>

      {/* Cheat Sheet */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
         <div className="flex items-center gap-2 mb-6">
           <Info size={18} className="text-primary" />
           <h3 className="text-sm font-bold text-foreground">Regex Cheat Sheet</h3>
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Character Classes</h4>
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between"><code className="text-amber-400 bg-amber-400/10 px-1 rounded">.</code> <span className="text-muted-foreground">Any character</span></li>
                <li className="flex justify-between"><code className="text-amber-400 bg-amber-400/10 px-1 rounded">\w</code> <span className="text-muted-foreground">Word (a-z, A-Z, 0-9, _)</span></li>
                <li className="flex justify-between"><code className="text-amber-400 bg-amber-400/10 px-1 rounded">\d</code> <span className="text-muted-foreground">Digit (0-9)</span></li>
                <li className="flex justify-between"><code className="text-amber-400 bg-amber-400/10 px-1 rounded">\s</code> <span className="text-muted-foreground">Whitespace</span></li>
                <li className="flex justify-between"><code className="text-amber-400 bg-amber-400/10 px-1 rounded">[abc]</code> <span className="text-muted-foreground">Any of a, b, or c</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Anchors</h4>
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between"><code className="text-primary bg-primary/10 px-1 rounded">^</code> <span className="text-muted-foreground">Start of string/line</span></li>
                <li className="flex justify-between"><code className="text-primary bg-primary/10 px-1 rounded">$</code> <span className="text-muted-foreground">End of string/line</span></li>
                <li className="flex justify-between"><code className="text-primary bg-primary/10 px-1 rounded">\b</code> <span className="text-muted-foreground">Word boundary</span></li>
                <li className="flex justify-between"><code className="text-primary bg-primary/10 px-1 rounded">\B</code> <span className="text-muted-foreground">Not a word boundary</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Quantifiers</h4>
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between"><code className="text-emerald-400 bg-emerald-400/10 px-1 rounded">*</code> <span className="text-muted-foreground">0 or more</span></li>
                <li className="flex justify-between"><code className="text-emerald-400 bg-emerald-400/10 px-1 rounded">+</code> <span className="text-muted-foreground">1 or more</span></li>
                <li className="flex justify-between"><code className="text-emerald-400 bg-emerald-400/10 px-1 rounded">?</code> <span className="text-muted-foreground">0 or 1 (Optional)</span></li>
                <li className="flex justify-between"><code className="text-emerald-400 bg-emerald-400/10 px-1 rounded">{'{'}3{'}'}</code> <span className="text-muted-foreground">Exactly 3 times</span></li>
                <li className="flex justify-between"><code className="text-emerald-400 bg-emerald-400/10 px-1 rounded">{'{'}2,5{'}'}</code> <span className="text-muted-foreground">Between 2 and 5 times</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Groups</h4>
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between"><code className="text-sky-400 bg-sky-400/10 px-1 rounded">(abc)</code> <span className="text-muted-foreground">Capture group</span></li>
                <li className="flex justify-between"><code className="text-sky-400 bg-sky-400/10 px-1 rounded">(?:abc)</code> <span className="text-muted-foreground">Non-capturing</span></li>
                <li className="flex justify-between"><code className="text-sky-400 bg-sky-400/10 px-1 rounded">(?=abc)</code> <span className="text-muted-foreground">Positive lookahead</span></li>
                <li className="flex justify-between"><code className="text-sky-400 bg-sky-400/10 px-1 rounded">(?!abc)</code> <span className="text-muted-foreground">Negative lookahead</span></li>
              </ul>
            </div>
         </div>
      </div>
    </div>
  );
}
