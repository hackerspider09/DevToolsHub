import { useState, useMemo } from 'react';
import { Copy, Check, Info, Clock } from 'lucide-react';

// Basic cron parser for demo purposes (can be replaced with a real library like cron-parser later)
function parseCron(cron) {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  
  const [min, hour, dom, month, dow] = parts;
  
  const desc = [];
  
  if (min === '*' && hour === '*' && dom === '*' && month === '*' && dow === '*') {
    return 'Every minute';
  }
  
  if (min !== '*') {
    if (min.includes('/')) desc.push(`Every ${min.split('/')[1]} minutes`);
    else desc.push(`At minute ${min}`);
  } else {
    desc.push('Every minute');
  }
  
  if (hour !== '*') {
    if (hour.includes('/')) desc.push(`past every ${hour.split('/')[1]} hours`);
    else desc.push(`past hour ${hour}`);
  }
  
  if (dom !== '*') {
    if (dom.includes('/')) desc.push(`on every ${dom.split('/')[1]} days of the month`);
    else desc.push(`on day-of-month ${dom}`);
  }
  
  if (month !== '*') {
    if (month.includes('/')) desc.push(`in every ${month.split('/')[1]} months`);
    else desc.push(`in month ${month}`);
  }
  
  if (dow !== '*') {
    if (dow.includes('/')) desc.push(`on every ${dow.split('/')[1]} days of the week`);
    else desc.push(`on day-of-week ${dow}`);
  }
  
  return desc.join(' ');
}

// Generate next 5 run times roughly (mocked for visual demo)
function getNextRuns() {
  const runs = [];
  let d = new Date();
  d.setSeconds(0, 0);
  for (let i = 0; i < 5; i++) {
    d.setMinutes(d.getMinutes() + Math.floor(Math.random() * 5) + 1); // Mock progression
    runs.push(new Date(d));
  }
  return runs;
}

const EXAMPLES = [
  { label: '*/5 * * * *', desc: 'Every 5 minutes' },
  { label: '0 * * * *', desc: 'Every hour' },
  { label: '0 0 * * *', desc: 'Every day at midnight' },
  { label: '0 0 * * 0', desc: 'Every Sunday' },
  { label: '30 8 * * 1-5', desc: '8:30 AM on weekdays' },
];

export default function CronParser() {
  const [cron, setCron] = useState('*/5 * * * *');
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => parseCron(cron), [cron]);
  const nextRuns = useMemo(() => getNextRuns(), [cron]); // Re-roll mocks when cron changes

  const copy = () => {
    navigator.clipboard.writeText(cron);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parts = cron.trim().split(/\s+/);
  const isComplete = parts.length === 5;

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Input */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={cron}
            onChange={(e) => setCron(e.target.value)}
            placeholder="e.g. */5 * * * *"
            className="w-full h-11 rounded-xl bg-background border border-border pl-10 pr-4 font-mono text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(({ label, desc }) => (
            <button
              key={label}
              onClick={() => setCron(label)}
              title={desc}
              className={`px-3 py-2 rounded-xl border text-xs font-mono transition-all ${
                cron === label
                  ? 'bg-primary/15 border-primary/50 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {!isComplete && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-500/25 bg-amber-500/10 text-sm text-amber-400">
          <Info size={16} /> Enter a valid 5-part cron expression.
        </div>
      )}

      {isComplete && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Details */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center shadow-sm">
              <p className="text-sm font-medium text-muted-foreground mb-2">Translation</p>
              <p className="text-xl font-bold text-primary capitalize leading-snug">
                "{parsed || 'Complex schedule'}"
              </p>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {[
                { label: 'Minute', val: parts[0], range: '0-59' },
                { label: 'Hour', val: parts[1], range: '0-23' },
                { label: 'Day', val: parts[2], range: '1-31' },
                { label: 'Month', val: parts[3], range: '1-12' },
                { label: 'Weekday', val: parts[4], range: '0-6' },
              ].map(({ label, val, range }) => (
                <div key={label} className="bg-card border border-border rounded-lg py-3 flex flex-col items-center">
                  <span className="font-mono text-lg font-bold text-foreground mb-1">{val}</span>
                  <span className="font-semibold text-muted-foreground uppercase tracking-widest text-[9px] mb-0.5">{label}</span>
                  <span className="text-[9px] text-muted-foreground/60">{range}</span>
                </div>
              ))}
            </div>
            
            <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-xs text-muted-foreground">
              <p className="text-[10px] font-bold uppercase tracking-widest">Operators</p>
              <div className="grid grid-cols-2 gap-y-2 mt-2">
                <div><span className="font-mono font-bold text-primary">*</span> Any value</div>
                <div><span className="font-mono font-bold text-primary">,</span> Value list separator</div>
                <div><span className="font-mono font-bold text-primary">-</span> Range of values</div>
                <div><span className="font-mono font-bold text-primary">/</span> Step values</div>
              </div>
            </div>
          </div>

          {/* Next Runs */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm flex flex-col">
            <div className="px-4 py-3 bg-secondary/40 border-b border-border/60">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Next 5 Executions (Simulated)</p>
            </div>
            <div className="flex flex-col divide-y divide-border/50">
              {nextRuns.map((date, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/20">
                  <span className="font-mono text-sm">{date.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">in {Math.floor((date - new Date()) / 60000)} mins</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
