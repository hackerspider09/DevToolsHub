import { useState, useMemo } from 'react';
import jsYaml from 'js-yaml';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Copy, Check, Info } from 'lucide-react';

const DEFAULT_YAML = `# Kubernetes Deployment manifest
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: production
  labels:
    app: my-app
    version: "1.0"
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: my-app
          image: my-app:1.0
          ports:
            - containerPort: 8080
          env:
            - name: NODE_ENV
              value: production`;

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

export default function YamlValidator() {
  const [yaml, setYaml] = useState(DEFAULT_YAML);
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState(2);

  const result = useMemo(() => {
    if (!yaml.trim()) return { status: 'empty' };
    try {
      const parsed = jsYaml.load(yaml);
      if (parsed === null || parsed === undefined) return { status: 'empty' };
      const isObject = typeof parsed === 'object';
      const { keys, maxDepth } = isObject ? countKeys(parsed) : { keys: 0, maxDepth: 0 };
      const lines = yaml.split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).length;
      return {
        status: 'valid',
        type: Array.isArray(parsed) ? 'Array' : typeof parsed === 'object' ? 'Object' : typeof parsed,
        topLevelKeys: isObject && !Array.isArray(parsed) ? Object.keys(parsed).length : (Array.isArray(parsed) ? parsed.length : 1),
        totalKeys: keys,
        maxDepth,
        lines,
      };
    } catch (e) {
      const match = e.message.match(/line (\d+)/i);
      const lineNum = match ? parseInt(match[1]) : null;
      return { status: 'error', message: e.message, line: lineNum };
    }
  }, [yaml]);

  const handleIndentChange = (e) => {
    const spaces = parseInt(e.target.value, 10);
    setIndent(spaces);
    if (yaml && result.status === 'valid') {
      try {
        const obj = jsYaml.load(yaml);
        if (obj !== undefined && obj !== null) {
          setYaml(jsYaml.dump(obj, { indent: spaces }));
        }
      } catch (e) {}
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(yaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setYaml(DEFAULT_YAML);
    setIndent(2);
  };

  const highlightedLines = yaml.split('\n').map((line, i) => {
    const isErrorLine = result.status === 'error' && result.line === i + 1;
    return { line, isErrorLine, num: i + 1 };
  });

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {result.status === 'valid' && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-400">
              <CheckCircle2 size={16} /> Valid YAML
            </span>
          )}
          {result.status === 'error' && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-red-400">
              <XCircle size={16} /> Invalid YAML
            </span>
          )}
          {result.status === 'empty' && (
            <span className="text-sm text-muted-foreground">Paste YAML to validate</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-lg border border-border">
            <span>Indent:</span>
            <select 
              value={indent} 
              onChange={handleIndentChange}
              className="bg-transparent text-primary font-mono outline-none cursor-pointer appearance-none"
            >
              <option value={2} className="bg-card text-foreground">2 spaces</option>
              <option value={4} className="bg-card text-foreground">4 spaces</option>
              <option value={8} className="bg-card text-foreground">8 spaces</option>
            </select>
          </div>
          <button onClick={copy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-primary/40">
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={reset} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5">
            <RefreshCw size={12} /> Example
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Editor */}
        <div className="xl:col-span-2 rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-secondary/30">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">YAML Input</span>
          </div>
          <div className="flex overflow-auto max-h-[500px]">
            {/* Line numbers */}
            <div className="flex flex-col px-3 py-3 bg-secondary/20 text-right select-none min-w-[3rem] border-r border-border/40">
              {highlightedLines.map(({ num, isErrorLine }) => (
                <span
                  key={num}
                  className={`font-mono text-xs leading-6 ${isErrorLine ? 'text-red-400 font-bold' : 'text-muted-foreground/40'}`}
                >
                  {num}
                </span>
              ))}
            </div>
            {/* Textarea */}
            <textarea
              value={yaml}
              onChange={(e) => setYaml(e.target.value)}
              spellCheck={false}
              placeholder="Paste your YAML here..."
              style={{ minHeight: '400px', height: `${Math.max(400, highlightedLines.length * 24 + 48)}px` }}
              className="flex-1 w-full resize-none bg-transparent px-4 py-3 outline-none font-mono text-sm leading-6 text-amber-300 placeholder:text-muted-foreground/40 overflow-hidden"
            />
          </div>
        </div>

        {/* Stats + Error */}
        <div className="flex flex-col gap-4">
          {/* Status card */}
          <div className={`rounded-xl border p-4 ${
            result.status === 'valid' ? 'border-green-500/25 bg-green-500/5' :
            result.status === 'error' ? 'border-red-500/25 bg-red-500/5' :
            'border-border bg-card'
          }`}>
            {result.status === 'valid' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                  <CheckCircle2 size={18} /> Syntax Valid
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
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
                {result.line && (
                  <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                    Line {result.line}
                  </div>
                )}
                <p className="text-xs font-mono text-red-400 leading-relaxed break-words">{result.message}</p>
              </div>
            )}
            {result.status === 'empty' && (
              <div className="flex items-start gap-2 text-muted-foreground text-sm">
                <Info size={16} className="shrink-0 mt-0.5" />
                Paste or type YAML to see validation results.
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Common Issues</p>
            {[
              'Use spaces, never tabs for indentation',
              'String with special chars need quotes',
              'Consistent indent level throughout',
              'Colons in values must be quoted',
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
