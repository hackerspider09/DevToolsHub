import { useEffect, useMemo, useRef, useState } from "react";
import CryptoJS from "crypto-js";
import {
  Copy,
  Check,
  ShieldCheck,
  ShieldX,
  KeyRound,
  Info,
  ChevronDown,
  Lock,
  Unlock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

// ─── Default demo token ────────────────────────────────────────────────────
const DEFAULT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const DEFAULT_HEADER = JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2);
const DEFAULT_PAYLOAD = JSON.stringify(
  {
    sub: "1234567890",
    name: "John Doe",
    iat: 1516239022,
  },
  null,
  2
);

// ─── Helpers ────────────────────────────────────────────────────────────────
function base64UrlDecode(str) {
  try {
    let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const parsed = CryptoJS.enc.Base64.parse(b64);
    return CryptoJS.enc.Utf8.stringify(parsed);
  } catch {
    return "";
  }
}

function base64UrlEncode(str) {
  const wa = CryptoJS.enc.Utf8.parse(str);
  return CryptoJS.enc.Base64.stringify(wa)
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function buildSignature(unsignedToken, alg, secret) {
  switch (alg) {
    case "HS256":
      return CryptoJS.HmacSHA256(unsignedToken, secret);
    case "HS384":
      return CryptoJS.HmacSHA384(unsignedToken, secret);
    case "HS512":
      return CryptoJS.HmacSHA512(unsignedToken, secret);
    default:
      return null;
  }
}

function encodeSignature(sig) {
  return CryptoJS.enc.Base64.stringify(sig)
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

// ─── Copy hook ──────────────────────────────────────────────────────────────
function useCopy() {
  const [copied, setCopied] = useState("");
  const copy = async (value, id) => {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };
  return { copied, copy };
}

// ─── Small reusable components ──────────────────────────────────────────────

function SectionHeader({ color, title, subtitle, action }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 border-b border-border/60"
      style={{ borderBottomColor: `${color}22` }}
    >
      <div>
        <p
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color }}
        >
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function CopyBtn({ onClick, copied }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-primary/10"
    >
      {copied ? (
        <Check size={13} className="text-green-400" />
      ) : (
        <Copy size={13} />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function MonoArea({ value, onChange, rows = 10, color, placeholder, readOnly }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      spellCheck={false}
      rows={rows}
      placeholder={placeholder}
      style={{ color: color || "inherit" }}
      className="w-full resize-none bg-transparent px-4 py-3 outline-none font-mono text-sm leading-relaxed placeholder:text-muted-foreground/40"
    />
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function JwtTool() {
  // ── mode: "decode" (token → JSON) | "encode" (JSON → token)
  const [mode, setMode] = useState("decode");

  // ── shared state
  const [token, setToken] = useState(DEFAULT_TOKEN);
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [error, setError] = useState("");

  const isEncodingRef = useRef(false);
  const { copied, copy } = useCopy();

  // ── DECODE: token → header + payload JSON
  useEffect(() => {
    if (isEncodingRef.current) return;
    if (!token.trim()) {
      setHeader("");
      setPayload("");
      setError("");
      return;
    }
    try {
      const parts = token.split(".");
      if (parts.length !== 3) throw new Error("JWT must have exactly 3 parts separated by dots.");
      setHeader(JSON.stringify(JSON.parse(base64UrlDecode(parts[0])), null, 2));
      setPayload(JSON.stringify(JSON.parse(base64UrlDecode(parts[1])), null, 2));
      setError("");
    } catch (e) {
      setError(e.message || "Invalid JWT");
    }
  }, [token]);

  // ── ENCODE: header + payload + secret → token
  useEffect(() => {
    if (!header || !payload) return;
    try {
      isEncodingRef.current = true;
      const ph = JSON.parse(header);
      const pp = JSON.parse(payload);
      const encH = base64UrlEncode(JSON.stringify(ph));
      const encP = base64UrlEncode(JSON.stringify(pp));
      const unsigned = `${encH}.${encP}`;
      const sig = buildSignature(unsigned, ph.alg, secret);
      const encSig = sig ? encodeSignature(sig) : "";
      setToken(`${unsigned}.${encSig}`);
      setError("");
    } catch {
      setError("Invalid JSON — fix the Header or Payload.");
    } finally {
      setTimeout(() => { isEncodingRef.current = false; }, 0);
    }
  }, [header, payload, secret]);

  // ── Colour-coded token parts
  const tokenParts = useMemo(() => {
    const p = token.split(".");
    return { header: p[0] || "", payload: p[1] || "", sig: p[2] || "" };
  }, [token]);

  // ── Signature verification
  const verification = useMemo(() => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return { valid: false, text: "Invalid structure" };
      const hdr = JSON.parse(base64UrlDecode(parts[0]));
      const sig = buildSignature(`${parts[0]}.${parts[1]}`, hdr.alg, secret);
      if (!sig) return { valid: false, text: `${hdr.alg || "Unknown"} not supported` };
      if (encodeSignature(sig) === parts[2])
        return { valid: true, text: "Signature verified ✓" };
      return { valid: false, text: "Signature mismatch — wrong secret?" };
    } catch {
      return { valid: false, text: "Cannot verify — token is malformed" };
    }
  }, [token, secret]);

  // ── Token meta (alg, typ, iat, exp)
  const meta = useMemo(() => {
    try {
      const h = JSON.parse(header || "{}");
      const p = JSON.parse(payload || "{}");
      return {
        alg: h.alg || "—",
        typ: h.typ || "—",
        iat: p.iat ? new Date(p.iat * 1000).toLocaleString() : "—",
        exp: p.exp ? new Date(p.exp * 1000).toLocaleString() : "—",
        isExpired: p.exp ? p.exp * 1000 < Date.now() : false,
      };
    } catch {
      return { alg: "—", typ: "—", iat: "—", exp: "—", isExpired: false };
    }
  }, [header, payload]);

  // ── Reset to demo
  const reset = () => {
    isEncodingRef.current = false;
    setToken(DEFAULT_TOKEN);
    setSecret("your-256-bit-secret");
    setError("");
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 p-5">

      {/* ── Mode toggle + Reset ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Mode pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/60 border border-border">
          {[
            { id: "decode", label: "Decode", icon: Unlock },
            { id: "encode", label: "Encode", icon: Lock },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mode === id
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5"
        >
          <RefreshCw size={12} />
          Load Demo Token
        </button>
      </div>

      {/* ── Description banner ─────────────────────────────────────── */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/15 text-sm text-muted-foreground">
        <Info size={16} className="text-primary mt-0.5 shrink-0" />
        <span>
          {mode === "decode"
            ? "Paste a JWT in the token field. The header and payload are decoded automatically. Change the secret to verify the signature."
            : "Edit the header or payload JSON — the signed token is regenerated in real-time. All processing happens client-side."}
        </span>
      </div>

      {/* ── Main grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* LEFT — Token ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Token card */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <SectionHeader
              color="hsl(var(--primary))"
              title="JWT Token"
              subtitle={mode === "decode" ? "Paste your token here" : "Generated live from header + payload"}
              action={
                <CopyBtn
                  onClick={() => copy(token, "token")}
                  copied={copied === "token"}
                />
              }
            />

            {/* Colour-coded overlay + transparent textarea */}
            <div className="relative min-h-[200px]">
              {/* Visual overlay — colour coded */}
              <div
                className="absolute inset-0 px-4 py-3 pointer-events-none font-mono text-sm leading-relaxed break-all whitespace-pre-wrap z-10 select-none"
                aria-hidden
              >
                <span className="text-[#f87171]">{tokenParts.header}</span>
                <span className="text-muted-foreground">.</span>
                <span className="text-[#a78bfa]">{tokenParts.payload}</span>
                <span className="text-muted-foreground">.</span>
                <span className="text-[#34d399]">{tokenParts.sig}</span>
              </div>
              {/* Real textarea — transparent text, visible caret */}
              <textarea
                value={token}
                onChange={(e) => {
                  isEncodingRef.current = false;
                  setToken(e.target.value);
                }}
                spellCheck={false}
                rows={8}
                placeholder="Paste your JWT here…"
                className="relative z-20 w-full resize-none bg-transparent px-4 py-3 outline-none font-mono text-sm leading-relaxed break-all text-transparent caret-foreground placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Colour legend */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border/60 bg-secondary/30 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f87171]" />
                Header
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#a78bfa]" />
                Payload
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
                Signature
              </span>
            </div>
          </div>

          {/* Verification status */}
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
              verification.valid
                ? "bg-green-500/10 border-green-500/25 text-green-400"
                : "bg-red-500/10 border-red-500/25 text-red-400"
            }`}
          >
            {verification.valid ? (
              <ShieldCheck size={18} className="shrink-0" />
            ) : (
              <ShieldX size={18} className="shrink-0" />
            )}
            {verification.text}
          </div>

          {/* Token meta */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <SectionHeader
              color="hsl(var(--primary))"
              title="Token Info"
              subtitle="Parsed from header and payload"
            />
            <div className="grid grid-cols-2 gap-px bg-border/40">
              {[
                { label: "Algorithm", value: meta.alg },
                { label: "Type", value: meta.typ },
                { label: "Issued At", value: meta.iat },
                {
                  label: "Expires",
                  value: meta.exp,
                  warn: meta.isExpired,
                },
              ].map(({ label, value, warn }) => (
                <div key={label} className="bg-card px-4 py-3 space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {label}
                  </p>
                  <p
                    className={`text-sm font-mono font-medium ${
                      warn ? "text-amber-400" : "text-foreground"
                    }`}
                  >
                    {value}
                    {warn && " ⚠"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Header / Payload / Secret ──────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Header */}
          <div className="rounded-xl border border-[#f87171]/25 bg-card overflow-hidden shadow-sm">
            <SectionHeader
              color="#f87171"
              title="Header"
              subtitle="Algorithm and token type"
              action={
                <CopyBtn
                  onClick={() => copy(header, "header")}
                  copied={copied === "header"}
                />
              }
            />
            <MonoArea
              value={header}
              onChange={(e) => setHeader(e.target.value)}
              color="#fca5a5"
              rows={5}
              placeholder='{ "alg": "HS256", "typ": "JWT" }'
            />
          </div>

          {/* Payload */}
          <div className="rounded-xl border border-[#a78bfa]/25 bg-card overflow-hidden shadow-sm">
            <SectionHeader
              color="#a78bfa"
              title="Payload"
              subtitle="Claims — user data, expiry, roles, etc."
              action={
                <CopyBtn
                  onClick={() => copy(payload, "payload")}
                  copied={copied === "payload"}
                />
              }
            />
            <MonoArea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              color="#c4b5fd"
              rows={7}
              placeholder='{ "sub": "123", "name": "Jane Doe" }'
            />
          </div>

          {/* Secret */}
          <div className="rounded-xl border border-[#34d399]/25 bg-card overflow-hidden shadow-sm">
            <SectionHeader
              color="#34d399"
              title="Secret / Key"
              subtitle="Used to sign and verify the signature"
              action={
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#34d399]/70 bg-[#34d399]/10 px-2.5 py-1 rounded-lg border border-[#34d399]/20">
                  <KeyRound size={10} />
                  {meta.alg}
                </div>
              }
            />
            <div className="p-4">
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter HMAC secret…"
                className="w-full h-10 rounded-lg bg-background border border-border px-3 outline-none font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#34d399]/60 focus:ring-2 focus:ring-[#34d399]/10 transition-all"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-red-500/25 bg-red-500/10 text-sm text-red-400">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}