import { useState, useEffect, useMemo } from 'react';
import { Send, Plus, Trash2, Globe, Clock, Copy, Check, RefreshCw, ChevronDown, CheckCircle2, XCircle, AlertCircle, Trash, Save, Folder, FileJson, FileText, FolderPlus, X, History } from 'lucide-react';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const STORAGE_HISTORY = 'devtools-hub-http-history';
const STORAGE_COLLECTIONS = 'devtools-hub-http-collections';

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function ApiTester() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [headers, setHeaders] = useState([{ key: 'Accept', value: 'application/json' }]);
  const [body, setBody] = useState('');
  
  const [activeTab, setActiveTab] = useState('headers');
  const [resTab, setResTab] = useState('body');
  
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  
  const [history, setHistory] = useState([]);
  const [collections, setCollections] = useState([]);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [activeCollectionId, setActiveCollectionId] = useState(null);

  const [copied, setCopied] = useState('');
  
  // Modals
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveReqName, setSaveReqName] = useState('');
  const [saveColId, setSaveColId] = useState('');
  const [newColName, setNewColName] = useState('');
  
  useEffect(() => {
    try {
      const savedHist = localStorage.getItem(STORAGE_HISTORY);
      if (savedHist) setHistory(JSON.parse(savedHist));
      const savedCol = localStorage.getItem(STORAGE_COLLECTIONS);
      if (savedCol) setCollections(JSON.parse(savedCol));
    } catch {}
  }, []);

  const persistCollections = (cols) => {
    setCollections(cols);
    try { localStorage.setItem(STORAGE_COLLECTIONS, JSON.stringify(cols)); } catch {}
  };
  
  const persistHistory = (hist) => {
    setHistory(hist);
    try { localStorage.setItem(STORAGE_HISTORY, JSON.stringify(hist)); } catch {}
  };

  const createCollection = () => {
    if (!newColName.trim()) return;
    const newCol = { id: generateId(), name: newColName, requests: [] };
    persistCollections([...collections, newCol]);
    setNewColName('');
    if (!saveColId) setSaveColId(newCol.id);
  };

  const deleteCollection = (id) => {
    const colToDelete = collections.find(c => c.id === id);
    if (colToDelete) {
      const requestIds = colToDelete.requests.map(r => r.id);
      persistHistory(history.filter(h => !requestIds.includes(h.requestId)));
    }
    persistCollections(collections.filter(c => c.id !== id));
    if (activeCollectionId === id) {
      setActiveCollectionId(null);
      setActiveRequestId(null);
    }
  };

  const saveRequestData = () => {
    if (!saveReqName.trim() || !saveColId) return;
    const reqData = { id: generateId(), name: saveReqName, method, url, headers, body };
    
    const newCols = collections.map(c => {
      if (c.id === saveColId) {
        return { ...c, requests: [...c.requests, reqData] };
      }
      return c;
    });
    
    persistCollections(newCols);
    setActiveRequestId(reqData.id);
    setActiveCollectionId(saveColId);
    setShowSaveModal(false);
    setSaveReqName('');
  };

  const updateActiveRequest = () => {
    if (!activeRequestId || !activeCollectionId) return;
    const newCols = collections.map(c => {
      if (c.id === activeCollectionId) {
        return {
          ...c,
          requests: c.requests.map(r => r.id === activeRequestId ? { ...r, method, url, headers, body } : r)
        };
      }
      return c;
    });
    persistCollections(newCols);
  };

  const loadRequest = (colId, req) => {
    setMethod(req.method);
    setUrl(req.url);
    setHeaders(req.headers || [{ key: '', value: '' }]);
    setBody(req.body || '');
    setActiveRequestId(req.id);
    setActiveCollectionId(colId);
    setResponse(null);
  };

  const deleteRequest = (colId, reqId) => {
    const newCols = collections.map(c => {
      if (c.id === colId) {
        return { ...c, requests: c.requests.filter(r => r.id !== reqId) };
      }
      return c;
    });
    persistCollections(newCols);
    persistHistory(history.filter(h => h.requestId !== reqId));
    if (activeRequestId === reqId) {
      setActiveRequestId(null);
      setActiveCollectionId(null);
    }
  };

  const saveHistoryEntry = (reqData, resData) => {
    const entry = {
      id: generateId(),
      requestId: activeRequestId, // Associate with current saved request if any
      request: reqData,
      response: resData, // Save the full response to load it later
      date: new Date().toISOString()
    };
    const newHistory = [entry, ...history].slice(0, 30); // Keep last 30
    persistHistory(newHistory);
  };

  const loadHistoryEntry = (entry) => {
    setMethod(entry.request.method);
    setUrl(entry.request.url);
    setHeaders(entry.request.headers?.length ? entry.request.headers : [{ key: '', value: '' }]);
    setBody(entry.request.body || '');
    if (entry.response) {
      setResponse(entry.response);
      setResTab('body');
    }
  };

  const clearHistory = () => {
    if (activeRequestId) {
      persistHistory(history.filter(h => h.requestId !== activeRequestId));
    } else {
      persistHistory(history.filter(h => h.requestId)); // Clears global scratchpad history
    }
  };

  const createNewRequest = () => {
    setActiveRequestId(null);
    setActiveCollectionId(null);
    setMethod('GET');
    setUrl('');
    setHeaders([{ key: 'Accept', value: 'application/json' }]);
    setBody('');
    setResponse(null);
  };

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const updateHeader = (i, field, val) => {
    const newH = [...headers];
    newH[i][field] = val;
    setHeaders(newH);
  };
  const removeHeader = (i) => setHeaders(headers.filter((_, idx) => idx !== i));

  const sendRequest = async () => {
    if (!url) return;
    setLoading(true);
    setResponse(null);
    setResTab('body');

    const startTime = Date.now();
    try {
      const reqHeaders = {};
      headers.forEach(h => {
        if (h.key.trim() && h.value.trim()) {
          reqHeaders[h.key.trim()] = h.value.trim();
        }
      });

      const options = { method, headers: reqHeaders };
      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const time = Date.now() - startTime;
      
      const resHeaders = [];
      res.headers.forEach((val, key) => resHeaders.push({ key, value: val }));
      
      let resBody = await res.text();
      let size = new Blob([resBody]).size;
      
      try {
        const parsed = JSON.parse(resBody);
        resBody = JSON.stringify(parsed, null, 2);
      } catch {}

      const resData = {
        status: res.status,
        statusText: res.statusText,
        time,
        size,
        headers: resHeaders,
        // Only save body in history if it's < 100KB to prevent localstorage crash
        body: size < 102400 ? resBody : 'Response too large to store in history.',
        displayBody: resBody // full body for current view
      };
      
      setResponse(resData);
      saveHistoryEntry({ method, url, headers, body }, resData);
      
    } catch (e) {
      const time = Date.now() - startTime;
      const resData = {
        error: e.message,
        status: 0,
        time,
        displayBody: e.message,
        body: e.message
      };
      setResponse(resData);
      saveHistoryEntry({ method, url, headers, body }, resData);
    } finally {
      setLoading(false);
    }
  };

  const getMethodColor = (m) => {
    const colors = {
      GET: 'text-blue-400', POST: 'text-green-400', PUT: 'text-amber-400',
      PATCH: 'text-amber-400', DELETE: 'text-red-400'
    };
    return colors[m] || 'text-gray-400';
  };

  const activeReqDetails = useMemo(() => {
    if (!activeCollectionId || !activeRequestId) return null;
    const col = collections.find(c => c.id === activeCollectionId);
    if (!col) return null;
    return col.requests.find(r => r.id === activeRequestId);
  }, [collections, activeCollectionId, activeRequestId]);

  const relevantHistory = useMemo(() => {
    if (activeRequestId) return history.filter(h => h.requestId === activeRequestId);
    return history;
  }, [history, activeRequestId]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 h-[calc(100vh-100px)] min-h-[600px]">
      
      {/* LEFT SIDEBAR: Collections */}
      <div className="w-full lg:w-64 flex-shrink-0 flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border/60 bg-secondary/30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <Folder size={14} /> Collections
            </span>
          </div>
          <div className="flex gap-1.5 h-7">
            <input 
              type="text" 
              placeholder="New Collection" 
              className="flex-1 bg-background border border-border rounded-md px-2 text-[10px] outline-none focus:border-primary/50 text-foreground"
              value={newColName}
              onChange={e => setNewColName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createCollection()}
            />
            <button onClick={createCollection} disabled={!newColName.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground px-2.5 rounded-md transition-colors flex items-center justify-center disabled:opacity-50">
              <Plus size={12} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-2 space-y-2">
          {collections.length === 0 && (
            <div className="text-center p-4 text-xs text-muted-foreground italic">No collections yet.</div>
          )}
          {collections.map(col => (
            <div key={col.id} className="border border-border/50 rounded-lg overflow-hidden bg-background/50">
              <div className="flex items-center justify-between px-3 py-2 bg-secondary/20 group">
                <span className="font-bold text-xs text-foreground flex items-center gap-2">
                  <Folder size={12} className="text-amber-400" /> {col.name}
                </span>
                <button onClick={() => deleteCollection(col.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-opacity">
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="flex flex-col">
                {col.requests.map(req => (
                  <div 
                    key={req.id} 
                    onClick={() => loadRequest(col.id, req)}
                    className={`flex flex-col text-left px-4 py-2 border-l-2 cursor-pointer transition-colors ${activeRequestId === req.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-secondary/30'}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-foreground truncate">{req.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); deleteRequest(col.id, req.id); }} className="text-muted-foreground hover:text-red-400 p-1">
                        <X size={10} />
                      </button>
                    </div>
                    <span className="text-[10px] font-mono mt-0.5 truncate text-muted-foreground w-full">
                      <span className={`font-bold mr-1 ${getMethodColor(req.method)}`}>{req.method}</span>
                      {req.url}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        
        {/* Top Action Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            {activeReqDetails ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">{collections.find(c => c.id === activeCollectionId)?.name}</span>
                <span>/</span>
                <span className="text-foreground font-semibold">{activeReqDetails.name}</span>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic">Unsaved Request (Scratchpad)</div>
            )}
            <button onClick={createNewRequest} className="text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80 flex items-center gap-1 transition-colors bg-primary/10 px-3 py-1 rounded-lg">
              <Plus size={14} /> New Request
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex flex-1 rounded-md h-8 bg-card border border-border shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <div className="relative flex items-center h-full">
                <select 
                  value={method} 
                  onChange={(e) => setMethod(e.target.value)} 
                  className={`h-full bg-transparent font-bold text-[10px] outline-none appearance-none cursor-pointer border-r border-border px-2 pr-6 ${getMethodColor(method)}`}
                >
                  {METHODS.map(m => <option key={m} value={m} className="bg-card text-foreground">{m}</option>)}
                </select>
                <ChevronDown size={10} className="absolute right-1.5 pointer-events-none text-muted-foreground" />
              </div>
              <input 
                type="text" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                className="flex-1 h-full bg-transparent px-2 font-mono text-xs outline-none text-foreground placeholder:text-muted-foreground/40 rounded-r-md" 
                placeholder="https://api.example.com" 
                spellCheck={false}
                onKeyDown={(e) => e.key === 'Enter' && sendRequest()}
              />
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0 h-8">
              {activeRequestId && (
                <button onClick={updateActiveRequest} className="h-full px-3 bg-primary/20 hover:bg-primary/30 text-primary font-bold uppercase text-[9px] tracking-wider rounded-md shadow-sm flex items-center gap-1 transition-colors">
                  <Save size={10} /> Save
                </button>
              )}
              <button onClick={() => setShowSaveModal(true)} className="h-full px-3 bg-secondary hover:bg-secondary/80 text-foreground font-bold uppercase text-[9px] tracking-wider rounded-md shadow-sm flex items-center gap-1 transition-colors">
                <Save size={10} /> Save As
              </button>
              <button 
                onClick={sendRequest} 
                disabled={loading || !url} 
                className="h-full px-5 bg-primary text-primary-foreground font-bold uppercase text-[10px] tracking-wider rounded-md shadow-sm hover:bg-primary/90 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {loading ? <RefreshCw size={10} className="animate-spin" /> : <Send size={10} />} Send
              </button>
            </div>
          </div>
        </div>

        {/* Editor Grid (Vertical Split) */}
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          
          {/* Request Config */}
          <div className="flex-1 flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm h-0">
            <div className="flex items-center gap-2 border-b border-border/60 bg-secondary/30 p-2 shrink-0">
              <button onClick={() => setActiveTab('headers')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'headers' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                Headers <span className="ml-1 opacity-70">({headers.filter(h => h.key).length})</span>
              </button>
              <button onClick={() => setActiveTab('body')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'body' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                Body
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 relative">
              {activeTab === 'headers' && (
                <div className="space-y-3">
                  {headers.map((h, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="text" value={h.key} onChange={(e) => updateHeader(i, 'key', e.target.value)} placeholder="Key" className="w-1/3 h-9 rounded bg-background border border-border px-3 text-xs font-mono outline-none text-sky-400" />
                      <input type="text" value={h.value} onChange={(e) => updateHeader(i, 'value', e.target.value)} placeholder="Value" className="flex-1 h-9 rounded bg-background border border-border px-3 text-xs font-mono outline-none text-foreground" />
                      <button onClick={() => removeHeader(i)} className="p-2 text-muted-foreground hover:text-red-400 shrink-0"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button onClick={addHeader} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 mt-2 ml-1"><Plus size={14} /> Add Header</button>
                </div>
              )}
              {activeTab === 'body' && (
                <textarea className="w-full h-full bg-background rounded-lg border border-border p-4 outline-none font-mono text-sm resize-none text-foreground" value={body} onChange={(e) => setBody(e.target.value)} placeholder={'{\n  "key": "value"\n}'} spellCheck={false} />
              )}
            </div>
          </div>

          {/* Response Viewer */}
          <div className="flex-1 flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm h-0">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-secondary/30 p-2 shrink-0">
              <div className="flex items-center gap-2">
                <button onClick={() => setResTab('body')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${resTab === 'body' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                  Response
                </button>
                <button onClick={() => setResTab('headers')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${resTab === 'headers' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                  Headers {response?.headers ? `<${response.headers.length}>` : ''}
                </button>
              </div>
              
              {response && !response.error && (
                <div className="flex items-center gap-3 text-[10px] font-mono font-medium px-2 shrink-0 flex-wrap uppercase">
                  <span className={`flex items-center gap-1 ${response.status < 400 ? 'text-green-400' : 'text-red-400'}`}>
                    {response.status < 400 ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    {response.status}
                  </span>
                  <span className="text-amber-400 flex items-center gap-1"><Clock size={10}/> {response.time}ms</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-auto bg-card/50 relative">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3 animate-pulse bg-background/50">
                  <RefreshCw size={24} className="animate-spin text-primary" />
                </div>
              ) : !response ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <Globe size={32} className="opacity-20" />
                  <span className="text-sm font-medium">No Response</span>
                </div>
              ) : response.error ? (
                <div className="absolute inset-0 p-5 overflow-auto">
                  <div className="text-red-500 font-bold mb-3 uppercase tracking-widest text-xs flex items-center gap-2"><AlertCircle size={16} /> Fetch Failed</div>
                  <div className="text-xs font-mono text-red-400 whitespace-pre-wrap bg-red-500/5 p-4 rounded-lg border border-red-500/20">{response.error}</div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col">
                  {resTab === 'body' && (
                    <textarea readOnly value={response.displayBody} className="flex-1 w-full h-full p-4 bg-transparent outline-none font-mono text-sm text-foreground resize-none leading-relaxed" />
                  )}
                  {resTab === 'headers' && (
                    <div className="p-4 space-y-1">
                      {response.headers.map((h, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-1 border-b border-border/40 py-1.5 text-xs">
                          <span className="font-bold text-sky-400 w-1/3">{h.key}</span>
                          <span className="text-foreground font-mono flex-1 break-all">{h.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: History */}
      <div className="w-full lg:w-72 flex-shrink-0 flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border/60 bg-secondary/30 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <History size={14} /> 
              {activeRequestId ? 'Request History' : 'Global History'}
            </span>
            {relevantHistory.length > 0 && (
              <button onClick={clearHistory} className="text-[10px] font-bold text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-1">
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {activeRequestId ? 'Past executions of this request' : 'All recent executions'}
          </span>
        </div>
        <div className="flex-1 overflow-auto bg-card/50">
          {relevantHistory.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground italic">No history available.</div>
          ) : (
            <div className="divide-y divide-border/50">
              {relevantHistory.map(h => (
                <div key={h.id} className="p-3 hover:bg-secondary/40 flex flex-col gap-2 group transition-colors">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold font-mono text-[10px] px-2 py-0.5 rounded ${getMethodColor(h.request.method)} bg-secondary/50`}>
                      {h.request.method}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{new Date(h.date).toLocaleTimeString()}</span>
                  </div>
                  <div className="font-mono text-xs truncate text-foreground/80">{h.request.url}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[10px] font-mono font-bold ${!h.response.status ? 'text-red-400' : h.response.status < 400 ? 'text-green-400' : 'text-amber-400'}`}>
                      {!h.response.status ? 'ERROR' : `${h.response.status} • ${h.response.time}ms`}
                    </span>
                    <button onClick={() => loadHistoryEntry(h)} className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold uppercase transition-all">
                      Load Run
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60 bg-secondary/30 flex justify-between items-center">
              <span className="font-bold text-sm uppercase tracking-widest text-primary">Save Request</span>
              <button onClick={() => setShowSaveModal(false)} className="text-muted-foreground hover:text-foreground"><X size={16}/></button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Request Name</label>
                <input type="text" value={saveReqName} onChange={e => setSaveReqName(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 text-foreground" placeholder="e.g. Get User Profile" />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Collection</label>
                {collections.length > 0 && (
                  <select value={saveColId} onChange={e => setSaveColId(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 text-foreground">
                    <option value="" disabled>-- Select Collection --</option>
                    {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
                
                <div className="flex items-center gap-2 my-2 opacity-50">
                  <div className="flex-1 h-px bg-border"></div>
                  <span className="text-[10px] uppercase font-bold">Or Create New</span>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                
                <div className="flex gap-2 h-8">
                  <input type="text" placeholder="New Collection Name" value={newColName} onChange={e => setNewColName(e.target.value)} className="flex-1 h-full bg-background border border-border rounded-md px-3 text-xs outline-none focus:border-primary/50 text-foreground" />
                  <button onClick={createCollection} disabled={!newColName.trim()} className="h-full px-4 bg-secondary hover:bg-secondary/80 text-foreground text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors disabled:opacity-50">
                    Create
                  </button>
                </div>
              </div>
              <button onClick={saveRequestData} disabled={!saveReqName || !saveColId} className="w-full mt-2 py-2.5 bg-primary text-primary-foreground font-bold uppercase tracking-wider rounded-lg shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors">
                Save to Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
