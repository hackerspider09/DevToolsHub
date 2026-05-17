import { useState, useMemo } from 'react';
import { Copy, Check, Plus, Trash2, Code2, Play } from 'lucide-react';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

export default function CurlBuilder() {
  const [method, setMethod] = useState('POST');
  const [url, setUrl] = useState('https://api.example.com/v1/users');
  const [headers, setHeaders] = useState([
    { key: 'Content-Type', value: 'application/json' },
    { key: 'Authorization', value: 'Bearer YOUR_TOKEN' },
  ]);
  const [body, setBody] = useState('{\n  "name": "Jane Doe",\n  "role": "admin"\n}');
  const [copied, setCopied] = useState('');

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const updateHeader = (i, field, val) => {
    const newH = [...headers];
    newH[i][field] = val;
    setHeaders(newH);
  };
  const removeHeader = (i) => setHeaders(headers.filter((_, idx) => idx !== i));

  const generated = useMemo(() => {
    let curl = `curl -X ${method} "${url || 'https://...'}"`;
    let httpie = `http ${method} "${url || 'https://...'}"`;
    
    headers.forEach(h => {
      if (h.key.trim() && h.value.trim()) {
        curl += ` \\\n  -H "${h.key}: ${h.value}"`;
        httpie += ` \\\n  "${h.key}:${h.value}"`;
      }
    });

    if (body.trim() && ['POST', 'PUT', 'PATCH'].includes(method)) {
      // Escape single quotes for shell safety
      const escapedBody = body.replace(/'/g, "'\\''");
      curl += ` \\\n  -d '${escapedBody}'`;
      
      const isJson = headers.some(h => h.key.toLowerCase() === 'content-type' && h.value.toLowerCase().includes('json'));
      if (isJson) {
         try {
           const parsed = JSON.parse(body);
           const kvs = Object.entries(parsed).map(([k,v]) => `${k}="${v}"`).join(' \\\n  ');
           httpie += ` \\\n  ${kvs}`;
         } catch {
           httpie = `echo '${escapedBody}' | ${httpie}`;
         }
      } else {
        httpie = `echo '${escapedBody}' | ${httpie}`;
      }
    }
    return { curl, httpie };
  }, [method, url, headers, body]);

  const copy = (val, type) => {
    navigator.clipboard.writeText(val);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);

  return (
    <div className="flex flex-col gap-6 p-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT: Editor */}
        <div className="space-y-6">
          {/* Method + URL */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Request</label>
            <div className="flex gap-2">
              <select 
                value={method} 
                onChange={(e) => setMethod(e.target.value)}
                className="h-10 rounded-lg bg-secondary/50 border border-border px-3 text-sm font-semibold text-primary outline-none focus:border-primary/50 appearance-none cursor-pointer"
              >
                {METHODS.map(m => (
                  <option key={m} value={m} className="bg-card text-foreground">
                    {m}
                  </option>
                ))}
              </select>
              <input 
                type="text" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api..."
                className="flex-1 h-10 rounded-lg bg-background border border-border px-3 text-sm font-mono outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Headers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Headers</label>
              <button onClick={addHeader} className="text-xs flex items-center gap-1 text-primary hover:text-primary/80">
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {headers.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <input 
                    type="text" 
                    value={h.key} 
                    onChange={(e) => updateHeader(i, 'key', e.target.value)}
                    placeholder="Key"
                    className="w-1/3 h-9 rounded-lg bg-background border border-border px-3 text-xs font-mono outline-none focus:border-primary/50"
                  />
                  <input 
                    type="text" 
                    value={h.value} 
                    onChange={(e) => updateHeader(i, 'value', e.target.value)}
                    placeholder="Value"
                    className="flex-1 h-9 rounded-lg bg-background border border-border px-3 text-xs font-mono outline-none focus:border-primary/50"
                  />
                  <button onClick={() => removeHeader(i)} className="p-2 text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {headers.length === 0 && (
                <p className="text-xs text-muted-foreground italic py-2">No headers added.</p>
              )}
            </div>
          </div>

          {/* Body */}
          {hasBody && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Body (JSON/Text)</label>
              <textarea 
                value={body}
                onChange={(e) => setBody(e.target.value)}
                spellCheck={false}
                rows={6}
                className="w-full rounded-lg bg-background border border-border p-3 text-sm font-mono text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none"
              />
            </div>
          )}
        </div>

        {/* RIGHT: Output */}
        <div className="space-y-5">
          {/* cURL */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-secondary/30">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                <Code2 size={12} /> cURL Command
              </span>
              <button 
                onClick={() => copy(generated.curl, 'curl')}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied === 'curl' ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                {copied === 'curl' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="p-4 bg-black/40 overflow-auto max-h-[300px]">
              <pre className="text-sm font-mono text-sky-300">
                <code>{generated.curl}</code>
              </pre>
            </div>
          </div>

          {/* HTTPie */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-secondary/30">
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                <Play size={12} /> HTTPie Command
              </span>
              <button 
                onClick={() => copy(generated.httpie, 'httpie')}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied === 'httpie' ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                {copied === 'httpie' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="p-4 bg-black/40 overflow-auto max-h-[200px]">
              <pre className="text-sm font-mono text-purple-300">
                <code>{generated.httpie}</code>
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
