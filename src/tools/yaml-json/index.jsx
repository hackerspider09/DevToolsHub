import { useState, useRef, useCallback } from 'react';
import jsYaml from 'js-yaml';
import { Copy, Check, ArrowRightLeft, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';

const DEFAULT_YAML = `# Example YAML
name: John Doe
age: 30
roles:
  - admin
  - developer
address:
  city: Mumbai
  country: India
active: true`;

function useCopy() {
  const [copied, setCopied] = useState('');
  const copy = (val, id) => {
    navigator.clipboard.writeText(val);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };
  return { copied, copy };
}

export default function YamlJsonConverter() {
  const [yaml, setYaml] = useState(DEFAULT_YAML);
  const [json, setJson] = useState(() => {
    try {
      return JSON.stringify(jsYaml.load(DEFAULT_YAML), null, 2);
    } catch { return ''; }
  });
  const [error, setError] = useState('');
  const lastEdited = useRef('yaml');
  const { copied, copy } = useCopy();

  const [indent, setIndent] = useState(2);
  const [docMode, setDocMode] = useState('single');

  const onYamlChange = (val, currentIndent = indent, currentMode = docMode) => {
    lastEdited.current = 'yaml';
    setYaml(val);
    try {
      if (currentMode === 'multiple') {
        const obj = jsYaml.loadAll(val);
        if (obj === undefined || obj === null || obj.length === 0) { setJson(''); setError(''); return; }
        setJson(JSON.stringify(obj, null, currentIndent));
      } else {
        const obj = jsYaml.load(val);
        if (obj === undefined || obj === null) { setJson(''); setError(''); return; }
        setJson(JSON.stringify(obj, null, currentIndent));
      }
      setError('');
    } catch (e) {
      setError(e.message);
      setJson('');
    }
  };

  const onJsonChange = (val, currentIndent = indent, currentMode = docMode) => {
    lastEdited.current = 'json';
    setJson(val);
    try {
      const obj = JSON.parse(val);
      if (currentMode === 'multiple' && Array.isArray(obj)) {
        setYaml(obj.map(doc => jsYaml.dump(doc, { indent: currentIndent })).join('---\n'));
      } else {
        setYaml(jsYaml.dump(obj, { indent: currentIndent }));
      }
      setError('');
    } catch (e) {
      setError(e.message);
      setYaml('');
    }
  };

  const handleIndentChange = (e) => {
    const newIndent = parseInt(e.target.value, 10);
    setIndent(newIndent);
    try {
      if (lastEdited.current === 'yaml' && yaml) {
        onYamlChange(yaml, newIndent, docMode);
      } else if (lastEdited.current === 'json' && json) {
        onJsonChange(json, newIndent, docMode);
      }
    } catch (e) {}
  };

  const handleDocModeChange = (e) => {
    const newMode = e.target.value;
    setDocMode(newMode);
    try {
      if (lastEdited.current === 'yaml' && yaml) {
        onYamlChange(yaml, indent, newMode);
      } else if (lastEdited.current === 'json' && json) {
        onJsonChange(json, indent, newMode);
      }
    } catch (e) {}
  };

  const reset = () => {
    setYaml(DEFAULT_YAML);
    setDocMode('single');
    onYamlChange(DEFAULT_YAML, indent, 'single');
    setError('');
  };

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center  gap-3 text-sm text-muted-foreground">
          <ArrowRightLeft size={16} className="text-primary" />
          <span>Edit either side — the other updates instantly</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-lg border border-border">
            <span>Mode:</span>
            <div className="relative flex items-center">
              <select 
                value={docMode} 
                onChange={handleDocModeChange}
                className="bg-transparent text-primary font-mono outline-none cursor-pointer appearance-none pr-4"
              >
                <option value="single" className="bg-card text-foreground">Single Doc</option>
                <option value="multiple" className="bg-card text-foreground">Multi Doc</option>
              </select>
              <ChevronDown size={14} className="absolute right-0 pointer-events-none text-primary/70" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-lg border border-border">
            <span>Indent:</span>
            <div className="relative flex items-center">
              <select
                value={indent}
                onChange={handleIndentChange}
                className="bg-transparent text-primary font-mono outline-none cursor-pointer appearance-none pr-4"
              >
                <option value={2} className="bg-card text-foreground">2 spaces</option>
                <option value={4} className="bg-card text-foreground">4 spaces</option>
                <option value={8} className="bg-card text-foreground">8 spaces</option>
              </select>
              <ChevronDown size={14} className="absolute right-0 pointer-events-none text-primary/70" />
            </div>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5"
          >
            <RefreshCw size={12} /> Load Example
          </button>
        </div>
      </div>

      {/* Two panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-[420px]">
        {/* YAML */}
        <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-secondary/30">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">YAML</span>
            <button
              onClick={() => copy(yaml, 'yaml')}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied === 'yaml' ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
              {copied === 'yaml' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <textarea
            value={yaml}
            onChange={(e) => onYamlChange(e.target.value)}
            spellCheck={false}
            placeholder="Paste YAML here..."
            className={`flex-1 w-full resize-none bg-transparent px-4 py-3 outline-none font-mono text-sm leading-relaxed text-amber-300 placeholder:text-muted-foreground/40 ${error && lastEdited.current === 'yaml' ? 'border-l-2 border-red-500' : ''
              }`}
          />
        </div>

        {/* JSON */}
        <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-secondary/30">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">JSON</span>
            <button
              onClick={() => copy(json, 'json')}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied === 'json' ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
              {copied === 'json' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <textarea
            value={json}
            onChange={(e) => onJsonChange(e.target.value)}
            spellCheck={false}
            placeholder="Paste JSON here..."
            className={`flex-1 w-full resize-none bg-transparent px-4 py-3 outline-none font-mono text-sm leading-relaxed text-sky-300 placeholder:text-muted-foreground/40 ${error && lastEdited.current === 'json' ? 'border-l-2 border-red-500' : ''
              }`}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-red-500/25 bg-red-500/10 text-sm text-red-400">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="font-mono text-xs">{error}</span>
        </div>
      )}
    </div>
  );
}
