import { useState, useMemo } from 'react';
import { Copy, Check, RefreshCw, Network, Info } from 'lucide-react';

function ip2long(ip) {
  return ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0) >>> 0;
}

function long2ip(long) {
  return [
    (long >>> 24) & 0xff,
    (long >>> 16) & 0xff,
    (long >>> 8) & 0xff,
    long & 0xff,
  ].join('.');
}

function toBinary(ip) {
  return ip.split('.').map(o => parseInt(o).toString(2).padStart(8, '0')).join('.');
}

function calcCidr(cidr) {
  const [ip, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr, 10);
  if (!ip || isNaN(prefix) || prefix < 0 || prefix > 32) return null;
  const parts = ip.split('.');
  if (parts.length !== 4 || parts.some(p => isNaN(p) || parseInt(p) < 0 || parseInt(p) > 255)) return null;

  const ipLong = ip2long(ip);
  const maskLong = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const wildcardLong = (~maskLong) >>> 0;
  const networkLong = (ipLong & maskLong) >>> 0;
  const broadcastLong = (networkLong | wildcardLong) >>> 0;
  const firstHost = prefix < 31 ? networkLong + 1 : networkLong;
  const lastHost = prefix < 31 ? broadcastLong - 1 : broadcastLong;
  const totalHosts = Math.pow(2, 32 - prefix);
  const usableHosts = prefix < 31 ? totalHosts - 2 : totalHosts;

  const ipClass =
    (ipLong >>> 24) < 128 ? 'A' :
    (ipLong >>> 24) < 192 ? 'B' :
    (ipLong >>> 24) < 224 ? 'C' :
    (ipLong >>> 24) < 240 ? 'D (Multicast)' : 'E (Reserved)';

  const isPrivate =
    ((ipLong >>> 24) === 10) ||
    ((ipLong >>> 24) === 172 && ((ipLong >>> 16) & 0xff) >= 16 && ((ipLong >>> 16) & 0xff) <= 31) ||
    ((ipLong >>> 24) === 192 && ((ipLong >>> 16) & 0xff) === 168);

  return {
    network: long2ip(networkLong),
    broadcast: long2ip(broadcastLong),
    mask: long2ip(maskLong),
    wildcard: long2ip(wildcardLong),
    firstHost: long2ip(firstHost),
    lastHost: long2ip(lastHost),
    totalHosts,
    usableHosts,
    prefix,
    ipClass,
    isPrivate,
    networkBinary: toBinary(long2ip(networkLong)),
    maskBinary: toBinary(long2ip(maskLong)),
    inputIp: ip,
    inputBinary: toBinary(ip),
  };
}

const EXAMPLES = [
  { label: '192.168.1.0/24', desc: 'Typical LAN' },
  { label: '10.0.0.0/8', desc: 'Private Class A' },
  { label: '172.16.0.0/12', desc: 'Private Class B' },
  { label: '10.0.0.0/16', desc: 'VPC subnet' },
  { label: '192.168.1.128/25', desc: 'Half subnet' },
];

function CopyableRow({ label, value, mono = true }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/30 transition-colors group">
      <span className="text-xs text-muted-foreground w-36 shrink-0">{label}</span>
      <span className={`text-sm font-medium text-foreground flex-1 ${mono ? 'font-mono' : ''}`}>{value}</span>
      <button onClick={doCopy} className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-muted-foreground hover:text-foreground">
        {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
      </button>
    </div>
  );
}

export default function CidrCalc() {
  const [input, setInput] = useState('192.168.1.0/24');

  const result = useMemo(() => calcCidr(input.trim()), [input]);

  const usablePct = result ? Math.min(100, (result.usableHosts / result.totalHosts) * 100) : 0;

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Input */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Network size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 192.168.1.0/24"
            className="w-full h-11 rounded-xl bg-background border border-border pl-10 pr-4 font-mono text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(({ label, desc }) => (
            <button
              key={label}
              onClick={() => setInput(label)}
              title={desc}
              className={`px-3 py-2 rounded-xl border text-xs font-mono transition-all ${
                input === label
                  ? 'bg-primary/15 border-primary/50 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {!result && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-500/25 bg-amber-500/10 text-sm text-amber-400">
          <Info size={16} /> Enter a valid CIDR notation, e.g. <code className="font-mono">10.0.0.0/8</code>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Main results */}
          <div className="xl:col-span-2 space-y-4">
            {/* Summary badges */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: `/${result.prefix}`, color: 'text-primary bg-primary/10 border-primary/20' },
                { label: `Class ${result.ipClass}`, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
                { label: result.isPrivate ? 'Private' : 'Public', color: result.isPrivate ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                { label: `${result.totalHosts.toLocaleString()} hosts`, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
              ].map(({ label, color }) => (
                <span key={label} className={`px-3 py-1 rounded-full border text-xs font-bold ${color}`}>{label}</span>
              ))}
            </div>

            {/* Result table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm divide-y divide-border/50">
              <div className="px-3 py-2 bg-secondary/40">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Network Details</p>
              </div>
              <CopyableRow label="Network Address" value={result.network} />
              <CopyableRow label="Broadcast" value={result.broadcast} />
              <CopyableRow label="Subnet Mask" value={result.mask} />
              <CopyableRow label="Wildcard Mask" value={result.wildcard} />
              <CopyableRow label="First Usable Host" value={result.firstHost} />
              <CopyableRow label="Last Usable Host" value={result.lastHost} />
              <CopyableRow label="Usable Hosts" value={result.usableHosts.toLocaleString()} mono={false} />
              <CopyableRow label="Total Addresses" value={result.totalHosts.toLocaleString()} mono={false} />
            </div>

            {/* Host range bar */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Host range utilization</span>
                <span className="font-mono text-foreground">{result.firstHost} → {result.lastHost}</span>
              </div>
              <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${usablePct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {result.usableHosts.toLocaleString()} usable of {result.totalHosts.toLocaleString()} total addresses
              </p>
            </div>
          </div>

          {/* Binary view */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 bg-secondary/40 border-b border-border/60">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Binary Representation</p>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { label: 'IP Address', value: result.inputBinary, highlight: result.prefix },
                  { label: 'Subnet Mask', value: result.maskBinary, highlight: result.prefix },
                  { label: 'Network', value: result.networkBinary, highlight: result.prefix },
                ].map(({ label, value, highlight }) => (
                  <div key={label}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                    <p className="font-mono text-xs break-all leading-relaxed">
                      {value.replace(/\./g, '').split('').map((bit, i) => (
                        <span key={i} className={
                          i < highlight ? 'text-primary' : 'text-muted-foreground'
                        }>{bit}{(i + 1) % 8 === 0 && i < 31 ? '.' : ''}</span>
                      ))}
                    </p>
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground pt-1">
                  <span className="text-primary font-mono">Blue</span> = network bits · grey = host bits
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quick Reference</p>
              {[
                ['/8', '16.7M hosts', 'Class A'],
                ['/16', '65.5K hosts', 'Class B'],
                ['/24', '254 hosts', 'Class C'],
                ['/28', '14 hosts', 'Small LAN'],
                ['/30', '2 hosts', 'Point-to-point'],
                ['/32', '1 host', 'Single host'],
              ].map(([mask, hosts, note]) => (
                <button
                  key={mask}
                  onClick={() => setInput(input.split('/')[0] + mask)}
                  className="w-full flex items-center justify-between text-xs px-2 py-1.5 rounded hover:bg-secondary/50 transition-colors text-left"
                >
                  <span className="font-mono text-primary">{mask}</span>
                  <span className="text-muted-foreground">{hosts}</span>
                  <span className="text-muted-foreground/60">{note}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
