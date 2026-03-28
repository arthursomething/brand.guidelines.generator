import { useState, useCallback, useRef, useEffect } from "react";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const FONTS_URL = "https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Fraunces:ital,opsz,wght@1,9..144,300&family=Syne:wght@700;800&display=swap";

const GF_POPULAR = [
  "Inter","Plus Jakarta Sans","DM Sans","Outfit","Nunito","Poppins","Raleway",
  "Montserrat","Lato","Source Sans 3","Manrope","Figtree","Geist",
  "Fraunces","Playfair Display","Cormorant Garamond","Libre Baskerville",
  "Merriweather","Lora","DM Serif Display","EB Garamond",
  "Space Grotesk","Syne","Cabinet Grotesk","Bricolage Grotesque",
  "DM Mono","IBM Plex Mono","Fira Code","JetBrains Mono","Space Mono",
  "Geist Mono","Courier Prime"
];

const COLOR_ROLES = [
  { key:"primary",   label:"Primario",   hint:"Color dominante de la marca" },
  { key:"secondary", label:"Secundario", hint:"Complementa al primario" },
  { key:"accent",    label:"Acento",     hint:"Llamadas a la acción, énfasis" },
  { key:"neutral",   label:"Neutro",     hint:"Fondos, textos secundarios" },
];

const DEFAULT_COLORS = [
  { hex:"#0A0A0A", role:"primary"   },
  { hex:"#F5F5F5", role:"secondary" },
  { hex:"#6366F1", role:"accent"    },
  { hex:"#E4E4E7", role:"neutral"   },
];

const TONES = ["Directo","Cálido","Técnico","Inspirador","Irreverente","Premium","Cercano","Audaz","Minimalista","Experto"];

const INDUSTRIES = ["B2B SaaS","Fintech","Healthtech","Edtech","E-commerce","Agencia / Servicios","Marketplace","Developer Tools","AI / Machine Learning","CleanTech","Retail","Real Estate","Otro"];

const STAGES = ["Idea / Pre-seed","Seed","Serie A","Serie B+","SME / PyME","Empresa establecida"];

const SEC_LABELS = ["Analizando marca...","Definiendo posicionamiento...","Analizando competencia...","Construyendo identidad visual...","Evaluando tipografías...","Diseñando sistema de color...","Redactando voz y tono...","Generando taglines...","Finalizando manual..."];

/* ─────────────────────────────────────────────
   COLOR UTILS
───────────────────────────────────────────── */
function hexToHsl(hex) {
  let r = parseInt(hex.slice(1,3),16)/255;
  let g = parseInt(hex.slice(3,5),16)/255;
  let b = parseInt(hex.slice(5,7),16)/255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h,s,l=(max+min)/2;
  if(max===min){h=s=0;}else{
    const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min);
    switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;}
    h/=6;
  }
  return [Math.round(h*360),Math.round(s*100),Math.round(l*100)];
}

function hslToHex(h,s,l) {
  s/=100; l/=100;
  const a=s*Math.min(l,1-l);
  const f=n=>{const k=(n+h/30)%12; const c=l-a*Math.max(Math.min(k-3,9-k,1),-1); return Math.round(255*c).toString(16).padStart(2,'0');};
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)];
}

function rgbToHex(r,g,b) {
  return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
}

/* ─────────────────────────────────────────────
   COLOR PICKER COMPONENT
───────────────────────────────────────────── */
function ColorPicker({ value, onChange, onClose }) {
  const [hsl, setHsl] = useState(() => hexToHsl(value||'#6366F1'));
  const [alpha, setAlpha] = useState(100);
  const [hexInput, setHexInput] = useState(value||'#6366F1');
  const [tab, setTab] = useState('hex');
  const svRef = useRef(null);
  const isDraggingSV = useRef(false);

  const h = hsl[0], s = hsl[1], l = hsl[2];
  const currentHex = hslToHex(h,s,l);

  // Convert HSL to SV coords
  const sv_s = s / (100 - Math.abs(2*l/100*100 - 100) || 1);
  const sv_v = l/100 + s/100 * Math.min(l/100, 1 - l/100);

  useEffect(() => {
    setHexInput(currentHex.toUpperCase());
    onChange(currentHex);
  }, [hsl]);

  function svFromEvent(e) {
    const rect = svRef.current.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const sx = Math.max(0, Math.min(1, (cx - rect.left) / rect.width));
    const sy = Math.max(0, Math.min(1, (cy - rect.top) / rect.height));
    // Convert back SV → HSL
    const v = 1 - sy;
    const sv = sx;
    const nl = v * (1 - sv/2);
    const ns = nl === 0 || nl === 1 ? 0 : (v - nl) / Math.min(nl, 1 - nl);
    setHsl([h, Math.round(ns*100), Math.round(nl*100)]);
  }

  const svX = (() => {
    const v = l/100 + s/100 * Math.min(l/100, 1-l/100);
    const sv = v === 0 ? 0 : 2*(v - l/100)/v;
    return Math.max(0, Math.min(1, sv)) * 100;
  })();
  const svY = (() => {
    const v = l/100 + s/100 * Math.min(l/100, 1-l/100);
    return (1-v)*100;
  })();

  const rgb = hexToRgb(currentHex);

  return (
    <div style={{ background:"#fff", borderRadius:12, boxShadow:"0 8px 32px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.12)", padding:"16px", width:260, userSelect:"none" }}>
      {/* SV Gradient */}
      <div ref={svRef}
        style={{ width:"100%", height:180, borderRadius:8, position:"relative", cursor:"crosshair", overflow:"hidden", marginBottom:12,
          background:`hsl(${h},100%,50%)` }}
        onMouseDown={e=>{isDraggingSV.current=true; svFromEvent(e);}}
        onMouseMove={e=>{if(isDraggingSV.current) svFromEvent(e);}}
        onMouseUp={()=>{isDraggingSV.current=false;}}
        onMouseLeave={()=>{isDraggingSV.current=false;}}
      >
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,#fff,transparent)"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent,#000)"}}/>
        <div style={{ position:"absolute", width:14, height:14, borderRadius:"50%", border:"2px solid #fff", boxShadow:"0 1px 4px rgba(0,0,0,.4)", left:`calc(${svX}% - 7px)`, top:`calc(${svY}% - 7px)`, background:currentHex, pointerEvents:"none" }}/>
      </div>

      {/* Hue slider */}
      <div style={{ marginBottom:8, position:"relative", height:14 }}>
        <input type="range" min={0} max={360} value={h}
          onChange={e=>setHsl([+e.target.value,s,l])}
          style={{ width:"100%", height:14, borderRadius:7, outline:"none", cursor:"pointer", appearance:"none", WebkitAppearance:"none",
            background:`linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)` }}
        />
      </div>

      {/* Alpha slider */}
      <div style={{ marginBottom:12, position:"relative", height:14 }}>
        <div style={{ position:"absolute", inset:0, borderRadius:7, backgroundImage:"repeating-conic-gradient(#ccc 0%25%,#fff 0 50%)", backgroundSize:"14px 14px" }}/>
        <div style={{ position:"absolute", inset:0, borderRadius:7, background:`linear-gradient(to right,transparent,${currentHex})` }}/>
        <input type="range" min={0} max={100} value={alpha}
          onChange={e=>setAlpha(+e.target.value)}
          style={{ position:"absolute", inset:0, width:"100%", height:14, appearance:"none", WebkitAppearance:"none", background:"transparent", cursor:"pointer", outline:"none" }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:10, background:"#f3f4f6", borderRadius:8, padding:3 }}>
        {["hex","rgb","hsl"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ flex:1, padding:"4px 0", border:"none", borderRadius:6, cursor:"pointer", fontSize:".65rem", fontFamily:"'DM Mono',monospace", fontWeight:tab===t?500:300, background:tab===t?"#fff":"transparent", color:tab===t?"#0a0a0a":"rgba(10,10,10,.5)", boxShadow:tab===t?"0 1px 3px rgba(0,0,0,.1)":"none", letterSpacing:".04em", textTransform:"uppercase" }}>
            {t}
          </button>
        ))}
      </div>

      {/* Value inputs */}
      {tab==="hex" && (
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:6, background:currentHex, border:"1px solid rgba(10,10,10,.12)", flexShrink:0 }}/>
          <input value={hexInput} onChange={e=>{
            const v=e.target.value;
            setHexInput(v);
            if(/^#[0-9A-Fa-f]{6}$/.test(v)) setHsl(hexToHsl(v));
          }}
          style={{ flex:1, background:"#f3f4f6", border:"none", borderRadius:6, padding:"6px 10px", fontFamily:"'DM Mono',monospace", fontSize:".75rem", color:"#0a0a0a", outline:"none" }}/>
        </div>
      )}
      {tab==="rgb" && (
        <div style={{ display:"flex", gap:6 }}>
          {["R","G","B"].map((ch,i)=>(
            <div key={ch} style={{ flex:1, textAlign:"center" }}>
              <input type="number" min={0} max={255} value={rgb[i]}
                onChange={e=>{const nr=[...rgb]; nr[i]=+e.target.value; setHsl(hexToHsl(rgbToHex(...nr)));}}
                style={{ width:"100%", background:"#f3f4f6", border:"none", borderRadius:6, padding:"5px 4px", fontFamily:"'DM Mono',monospace", fontSize:".72rem", textAlign:"center", outline:"none", color:"#0a0a0a" }}/>
              <div style={{ fontSize:".5rem", color:"rgba(10,10,10,.35)", marginTop:3, letterSpacing:".1em" }}>{ch}</div>
            </div>
          ))}
          <div style={{ flex:1, textAlign:"center" }}>
            <input type="number" min={0} max={100} value={alpha} onChange={e=>setAlpha(+e.target.value)}
              style={{ width:"100%", background:"#f3f4f6", border:"none", borderRadius:6, padding:"5px 4px", fontFamily:"'DM Mono',monospace", fontSize:".72rem", textAlign:"center", outline:"none", color:"#0a0a0a" }}/>
            <div style={{ fontSize:".5rem", color:"rgba(10,10,10,.35)", marginTop:3, letterSpacing:".1em" }}>A%</div>
          </div>
        </div>
      )}
      {tab==="hsl" && (
        <div style={{ display:"flex", gap:6 }}>
          {[["H",h,0,360],["S",s,0,100],["L",l,0,100]].map(([ch,val,mn,mx])=>(
            <div key={ch} style={{ flex:1, textAlign:"center" }}>
              <input type="number" min={mn} max={mx} value={val}
                onChange={e=>{const nv=+e.target.value; setHsl(ch==="H"?[nv,s,l]:ch==="S"?[h,nv,l]:[h,s,nv]);}}
                style={{ width:"100%", background:"#f3f4f6", border:"none", borderRadius:6, padding:"5px 4px", fontFamily:"'DM Mono',monospace", fontSize:".72rem", textAlign:"center", outline:"none", color:"#0a0a0a" }}/>
              <div style={{ fontSize:".5rem", color:"rgba(10,10,10,.35)", marginTop:3, letterSpacing:".1em" }}>{ch}</div>
            </div>
          ))}
        </div>
      )}

      <button onClick={onClose} style={{ width:"100%", marginTop:12, background:"#0a0a0a", color:"#fff", border:"none", borderRadius:6, padding:"7px", fontFamily:"'DM Mono',monospace", fontSize:".62rem", letterSpacing:".12em", textTransform:"uppercase", cursor:"pointer" }}>
        Aplicar →
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COLOR SWATCH ROW (vertical stack)
───────────────────────────────────────────── */
function ColorRow({ color, roleInfo, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div style={{ marginBottom:8, position:"relative" }} ref={ref}>
      <div onClick={() => setOpen(!open)}
        style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"#fff", border:"1px solid rgba(10,10,10,.1)", borderRadius:6, cursor:"pointer", transition:"border-color .15s" }}
      >
        <div style={{ width:36, height:36, borderRadius:6, background:color.hex, border:"1px solid rgba(10,10,10,.08)", flexShrink:0 }}/>
        <div style={{ flex:1, minWidth:0, overflow:"hidden" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:".72rem", fontWeight:700, color:"#0a0a0a", marginBottom:2 }}>{roleInfo.label}</div>
          <div style={{ fontSize:".58rem", color:"rgba(10,10,10,.38)", fontFamily:"'DM Mono',monospace", letterSpacing:".06em" }}>{color.hex.toUpperCase()}</div>
          {roleInfo.hint && <div style={{ fontSize:".55rem", color:"rgba(10,10,10,.25)", fontFamily:"'DM Mono',monospace", marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{roleInfo.hint}</div>}
        </div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink:0, opacity:.25 }}>
          <path d="M2 4l4 4 4-4" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {open && (
        <div style={{ position:"absolute", left:0, top:"calc(100% + 4px)", zIndex:300 }}>
          <ColorPicker value={color.hex} onChange={hex => onChange({ ...color, hex })} onClose={() => setOpen(false)}/>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   FONT SELECTOR COMPONENT
───────────────────────────────────────────── */
function FontSelector({ fonts, onChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(null); // index of open dropdown
  const ref = useRef(null);

  const filtered = search
    ? GF_POPULAR.filter(f => f.toLowerCase().includes(search.toLowerCase()))
    : GF_POPULAR;

  useEffect(() => {
    if (open === null) return;
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(null); }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  function addFont() {
    onChange([...fonts, { name: "Inter", role: fonts.length === 0 ? "Display" : fonts.length === 1 ? "Body" : "Acento" }]);
  }

  function removeFont(i) {
    onChange(fonts.filter((_,idx) => idx !== i));
  }

  function updateFont(i, name) {
    onChange(fonts.map((f, idx) => idx === i ? { ...f, name } : f));
  }

  function updateRole(i, role) {
    onChange(fonts.map((f, idx) => idx === i ? { ...f, role } : f));
  }

  const roles = ["Display","Body","UI","Acento","Mono","Título"];

  return (
    <div ref={ref}>
      {fonts.map((font, i) => (
        <div key={i} style={{ marginBottom:8 }}>
          <div style={{ display:"flex", gap:6, alignItems:"stretch" }}>
            {/* Role pill */}
            <select value={font.role} onChange={e => updateRole(i, e.target.value)}
              style={{ background:"#0a0a0a", color:"#fff", border:"none", borderRadius:4, fontFamily:"'DM Mono',monospace", fontSize:".58rem", padding:"8px 28px 8px 10px", cursor:"pointer", flexShrink:0, appearance:"none", WebkitAppearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(255,255,255,0.5)' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"calc(100% - 8px) center" }}>
              {roles.map(r => <option key={r}>{r}</option>)}
            </select>
            {/* Font name button */}
            <div style={{ flex:1, position:"relative" }}>
              <div onClick={() => setOpen(open === i ? null : i)}
                style={{ padding:"8px 12px", background:"#fff", border:"1px solid rgba(10,10,10,.12)", borderRadius:4, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, minHeight:36 }}>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:".72rem", color:"#0a0a0a", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{font.name}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity:.3, flexShrink:0 }}>
                  <path d="M1 3l4 4 4-4" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              {open === i && (
                <div style={{ position:"absolute", top:"calc(100% + 2px)", left:0, right:0, background:"#fff", border:"1px solid rgba(10,10,10,.12)", borderRadius:6, boxShadow:"0 8px 24px rgba(0,0,0,.12)", zIndex:200, overflow:"hidden" }}>
                  <div style={{ padding:"8px 8px 4px" }}>
                    <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Buscar fuente..."
                      style={{ width:"100%", background:"#f3f4f6", border:"none", borderRadius:4, padding:"6px 8px", fontFamily:"'DM Mono',monospace", fontSize:".7rem", outline:"none", color:"#0a0a0a" }}/>
                  </div>
                  <div style={{ maxHeight:180, overflowY:"auto", padding:"4px 0" }}>
                    {filtered.map(f => (
                      <div key={f} onClick={() => { updateFont(i, f); setOpen(null); setSearch(""); }}
                        style={{ padding:"7px 12px", cursor:"pointer", fontFamily:"'DM Mono',monospace", fontSize:".72rem", color: f === font.name ? "#0a0a0a" : "rgba(10,10,10,.7)", background: f === font.name ? "#f3f4f6" : "transparent" }}
                        onMouseEnter={e => e.currentTarget.style.background="#f3f4f6"}
                        onMouseLeave={e => e.currentTarget.style.background = f === font.name ? "#f3f4f6" : "transparent"}
                      >{f}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Remove */}
            {fonts.length > 1 && (
              <button onClick={() => removeFont(i)}
                style={{ background:"transparent", border:"1px solid rgba(10,10,10,.1)", borderRadius:4, cursor:"pointer", padding:"0 8px", color:"rgba(10,10,10,.35)", fontSize:".8rem", flexShrink:0 }}>×</button>
            )}
          </div>
        </div>
      ))}
      <button onClick={addFont}
        style={{ width:"100%", background:"transparent", border:"1px dashed rgba(10,10,10,.18)", borderRadius:4, padding:"7px", cursor:"pointer", fontFamily:"'DM Mono',monospace", fontSize:".6rem", color:"rgba(10,10,10,.4)", letterSpacing:".08em", marginTop:2 }}>
        + Agregar tipografía
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TOGGLE COMPONENT
───────────────────────────────────────────── */
function Toggle({ checked, onChange, label, hint }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid rgba(10,10,10,.05)" }}>
      <div style={{ flex:1, paddingRight:12 }}>
        <div style={{ fontSize:".66rem", color:"rgba(10,10,10,.7)", lineHeight:1.4 }}>{label}</div>
        {hint && <div style={{ fontSize:".57rem", color:"rgba(10,10,10,.35)", marginTop:2, lineHeight:1.4 }}>{hint}</div>}
      </div>
      <div onClick={() => onChange(!checked)}
        style={{ position:"relative", width:36, height:20, flexShrink:0, cursor:"pointer", marginTop:1 }}>
        <div style={{ position:"absolute", inset:0, background:checked?"#0a0a0a":"rgba(10,10,10,.12)", borderRadius:10, transition:"background .2s" }}/>
        <div style={{ position:"absolute", width:14, height:14, background:"#fff", borderRadius:"50%", top:3, left:checked?19:3, transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,.2)" }}/>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FORM SECTION WRAPPER
───────────────────────────────────────────── */
function FormSection({ icon, title, children, optional }) {
  return (
    <div style={{ marginBottom:"1.5rem", paddingBottom:"1.5rem", borderBottom:"1px solid rgba(10,10,10,.07)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:"1rem" }}>
        <span style={{ fontSize:"1rem" }}>{icon}</span>
        <span style={{ fontFamily:"'Syne',sans-serif", fontSize:".72rem", fontWeight:700, color:"#0a0a0a", letterSpacing:".02em" }}>{title}</span>
        {optional && <span style={{ fontFamily:"'DM Mono',monospace", fontSize:".52rem", color:"rgba(10,10,10,.3)", letterSpacing:".1em", textTransform:"uppercase", marginLeft:"auto" }}>Opcional</span>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom:".75rem" }}>
      {label && <label style={{ display:"block", fontFamily:"'DM Mono',monospace", fontSize:".54rem", letterSpacing:".12em", textTransform:"uppercase", color:"rgba(10,10,10,.45)", marginBottom:".3rem" }}>{label}</label>}
      {children}
      {hint && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:".55rem", color:"rgba(10,10,10,.35)", marginTop:".22rem", lineHeight:1.5 }}>{hint}</div>}
    </div>
  );
}

const inp = { width:"100%", background:"#fff", border:"1px solid rgba(10,10,10,.12)", borderRadius:4, color:"#0a0a0a", fontFamily:"'DM Mono',monospace", fontSize:".73rem", padding:".48rem .68rem", outline:"none" };
const tex = { ...inp, resize:"none", lineHeight:1.6, minHeight:68 };
const sel = { ...inp, appearance:"none", cursor:"pointer" };

/* ─────────────────────────────────────────────
   LOGO UPLOAD
───────────────────────────────────────────── */
function LogoUpload({ value, onChange }) {
  const fileRef = useRef(null);
  return (
    <div>
      <div onClick={() => fileRef.current.click()}
        style={{ border:"1.5px dashed rgba(10,10,10,.15)", borderRadius:6, padding:"20px", textAlign:"center", cursor:"pointer", background:value?"#f7f7f7":"#fafafa", transition:"border-color .2s" }}
        onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(10,10,10,.4)"}
        onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(10,10,10,.15)"}
      >
        {value
          ? <img src={value} alt="logo" style={{ maxHeight:56, maxWidth:160, objectFit:"contain", margin:"0 auto", display:"block" }}/>
          : <>
              <div style={{ fontSize:"1.4rem", marginBottom:6, opacity:.25 }}>◻</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:".62rem", color:"rgba(10,10,10,.4)" }}>Haz clic para subir logo</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:".54rem", color:"rgba(10,10,10,.25)", marginTop:3 }}>SVG, PNG, JPG — máx 2MB</div>
            </>
        }
      </div>
      {value && (
        <button onClick={() => onChange(null)} style={{ marginTop:6, background:"transparent", border:"none", cursor:"pointer", fontFamily:"'DM Mono',monospace", fontSize:".56rem", color:"rgba(10,10,10,.35)", letterSpacing:".08em" }}>
          × Eliminar logo
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }}
        onChange={e => {
          const f = e.target.files[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = ev => onChange(ev.target.result);
          r.readAsDataURL(f);
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   PROMPT BUILDER
───────────────────────────────────────────── */
function buildPrompt(d) {
  const fontStr = d.fonts.map(f => `${f.role}: ${f.name}`).join(", ");
  const colorStr = d.colors.map((c,i) => `${COLOR_ROLES[i]?.label||'Color '+(i+1)}: ${c.hex}`).join(", ");
  const urlStr = d.url ? `\nBrand URL: ${d.url} (analyze this to infer existing positioning, tone, visual style)` : "";
  const compStr = d.competitors ? `\nReferences/competitors: ${d.competitors}` : "";
  let extras = "";
  if (d.wantTagline)     extras += "\n- Generate 4 strong tagline options";
  if (d.wantMarket)      extras += "\n- Deeply analyze and segment the target market";
  if (d.wantCompetitors) extras += "\n- Auto-identify 3-5 direct competitors";
  if (d.hasLogo)         extras += "\n- Include logo usage guidelines section";

  return `You are a world-class brand strategist and identity designer. Generate a complete brand identity manual as JSON only. No markdown, no backticks, no extra text.

Brand: ${d.name}${urlStr}
Tagline: ${d.tagline || "none"}
Description: ${d.desc || "none"}
Industry: ${d.industry || "tech"}
Stage: ${d.stage || "startup"}
Market: ${d.market || "startups"}
Personality: ${d.personality || "none"}${compStr}
Tone: ${d.tones.join(", ") || "professional"}
Values: ${d.values || "none"}
Fonts: ${fontStr}
Colors: ${colorStr}
Has logo: ${d.hasLogo ? "yes" : "no"}

Extra instructions:${extras}
- Evaluate if chosen fonts (${fontStr}) are optimal for this brand. Recommend alternatives with reasoning if not ideal.
- Analyze competitor/reference names or URLs to find market patterns and positioning gaps.

Return this exact JSON (no other text):
{
  "positioning": {
    "headline": "one powerful brand statement max 12 words",
    "essence": "2-3 sentences on core essence and what makes this brand unique",
    "differentiators": ["differentiator 1", "differentiator 2", "differentiator 3"],
    "statement": "one longer italic positioning quote for the manual hero"
  },
  "market": {
    "summary": "2 sentences on target market opportunity",
    "icp": "ideal customer profile described in 2 sentences",
    "gap": "the positioning gap this brand fills vs competitors",
    "segments": ["Segment name: description", "Segment 2: description", "Segment 3: description"]
  },
  "competitors": ["Competitor — one line competitive analysis", "Comp 2 — analysis", "Comp 3 — analysis"],
  "voice": {
    "description": "2 sentences describing brand voice and personality",
    "do": ["communication guideline 1", "2", "3", "4", "5"],
    "dont": ["avoid 1", "2", "3", "4"]
  },
  "taglines": [
    {"text": "tagline", "context": "Hero / Awareness"},
    {"text": "tagline", "context": "Diferenciador"},
    {"text": "tagline", "context": "Mercado local"},
    {"text": "tagline", "context": "CTA / Acción"}
  ],
  "typography": {
    "evaluation": "2 sentences evaluating the chosen fonts for this brand",
    "fonts": [{"name": "font name", "role": "Display/Body/etc", "fits": true, "why": "reason", "usage": "Headlines, logo", "sample": "Short sample phrase"}],
    "recommendation": {"needed": false, "alts": [], "reasoning": ""}
  },
  "color_system": {
    "strategy": "2 sentences on color strategy and what emotions/values they convey",
    "roles": ["Primary: how to use", "Secondary: how to use", "Accent: how to use", "Neutral: how to use"],
    "rules": {"do": "good combinations", "dont": "forbidden combinations", "proportions": "60/30/10 or similar rule"}
  },
  "applications": {
    "digital": "how the brand applies to digital (web, app, social)",
    "print": "how it applies to print materials",
    "motion": "animation and motion principles"
  }
}`;
}

/* ─────────────────────────────────────────────
   MANUAL OUTPUT COMPONENTS
───────────────────────────────────────────── */
function ManualHero({ d, ai }) {
  const tagline = d.tagline || ai.taglines?.[0]?.text || ai.positioning?.headline || "";
  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", display:"grid", placeItems:"center", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle, rgba(255,255,255,.04) 1px, transparent 1px)", backgroundSize:"40px 40px" }}/>
      <div style={{ position:"relative", zIndex:2, textAlign:"center", padding:"3rem 4rem", maxWidth:800 }}>
        {d.logo && <img src={d.logo} alt="logo" style={{ height:60, objectFit:"contain", marginBottom:"2rem", opacity:.9 }}/>}
        <span style={{ fontSize:".58rem", letterSpacing:".28em", textTransform:"uppercase", color:"rgba(255,255,255,.3)", display:"block", marginBottom:"1.8rem" }}>
          Manual de Identidad · {d.industry||"Brand"} · {new Date().getFullYear()}
        </span>
        <div style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:"clamp(3rem,8vw,7rem)", fontWeight:300, color:"#fff", lineHeight:1, marginBottom:".4rem" }}>{d.name}</div>
        {tagline && <div style={{ fontSize:".82rem", color:"rgba(255,255,255,.45)", letterSpacing:".05em", maxWidth:460, margin:"1.8rem auto 0", lineHeight:1.7 }}>{tagline}</div>}
        <div style={{ display:"flex", gap:"3rem", justifyContent:"center", marginTop:"3rem", paddingTop:"2.5rem", borderTop:"1px solid rgba(255,255,255,.08)", flexWrap:"wrap" }}>
          {[d.industry&&["Industria",d.industry], d.stage&&["Etapa",d.stage], ["Año",new Date().getFullYear()]].filter(Boolean).map(([lbl,val])=>(
            <div key={lbl} style={{ textAlign:"center" }}>
              <span style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:"1.4rem", fontWeight:300, color:"#fff", display:"block" }}>{val}</span>
              <span style={{ fontSize:".52rem", letterSpacing:".16em", textTransform:"uppercase", color:"rgba(255,255,255,.3)", marginTop:".2rem", display:"block" }}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MSec({ num, label, title, children }) {
  return (
    <div style={{ padding:"5rem 0", borderBottom:"1px solid rgba(10,10,10,.08)" }}>
      <span style={{ fontSize:".54rem", letterSpacing:".22em", textTransform:"uppercase", color:"rgba(10,10,10,.35)", display:"block", marginBottom:".55rem" }}>{num} — {label}</span>
      <div style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:"clamp(1.8rem,3.5vw,2.8rem)", fontWeight:300, lineHeight:1.15, marginBottom:"2.5rem", color:"#0a0a0a" }} dangerouslySetInnerHTML={{__html:title}}/>
      {children}
    </div>
  );
}

function Prose({ children }) {
  return <div style={{ fontSize:".82rem", lineHeight:1.9, color:"rgba(10,10,10,.62)" }}>{children}</div>;
}

function Cards({ items, renderItem }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:1, background:"rgba(10,10,10,.08)", border:"1px solid rgba(10,10,10,.08)", marginTop:"2rem" }}>
      {items.map((item, i) => renderItem(item, i))}
    </div>
  );
}

function Card({ num, title, body }) {
  return (
    <div style={{ background:"#fff", padding:"1.8rem" }}>
      <div style={{ fontSize:".56rem", letterSpacing:".16em", color:"rgba(10,10,10,.35)", marginBottom:".7rem" }}>{num}</div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:".92rem", fontWeight:700, marginBottom:".55rem" }}>{title}</div>
      <div style={{ fontSize:".76rem", lineHeight:1.75, color:"rgba(10,10,10,.55)" }}>{body}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FULL MANUAL COMPONENT
───────────────────────────────────────────── */
function ManualOutput({ d, ai }) {
  const pos   = ai.positioning   || {};
  const mkt   = ai.market        || {};
  const voice = ai.voice         || {};
  const typo  = ai.typography    || {};
  const cs    = ai.color_system  || {};
  const apps  = ai.applications  || {};

  return (
    <div>
      <ManualHero d={d} ai={ai}/>
      <div style={{ maxWidth:900, margin:"0 auto", padding:"0 3.5rem" }}>

        {/* 01 POSICIONAMIENTO */}
        <MSec num="01" label="Posicionamiento" title="Esencia de <em style='color:rgba(10,10,10,.4)'>marca</em>">
          <Prose>
            <p><strong style={{color:"#0a0a0a",fontWeight:400}}>{pos.headline}</strong></p>
            <p style={{marginTop:".8rem"}}>{pos.essence}</p>
          </Prose>
          <div style={{ display:"flex", flexDirection:"column", gap:1, background:"rgba(10,10,10,.08)", border:"1px solid rgba(10,10,10,.08)", marginTop:"2rem" }}>
            {(pos.differentiators||[]).map((t,i)=>(
              <div key={i} style={{ background:"#fff", padding:"1.5rem 1.8rem", display:"grid", gridTemplateColumns:"2.2rem 1fr", gap:"1.2rem", alignItems:"start" }}>
                <span style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:"2rem", fontWeight:300, lineHeight:1, color:"rgba(10,10,10,.12)" }}>{i+1}</span>
                <span style={{ fontSize:".8rem", lineHeight:1.7, color:"rgba(10,10,10,.65)", paddingTop:".2rem" }}>{t}</span>
              </div>
            ))}
          </div>
          {pos.statement && (
            <div style={{ background:"#0a0a0a", padding:"3.5rem", marginTop:"2rem", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:"-2rem", left:"1rem", fontFamily:"'Fraunces',serif", fontSize:"14rem", fontStyle:"italic", color:"rgba(255,255,255,.04)", lineHeight:1, pointerEvents:"none" }}>"</div>
              <p style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(1.1rem,2vw,1.6rem)", fontWeight:300, fontStyle:"italic", color:"#fff", lineHeight:1.5, position:"relative" }}>{pos.statement}</p>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:".6rem", letterSpacing:".14em", color:"rgba(255,255,255,.3)", marginTop:"1.5rem", display:"block", textTransform:"uppercase", position:"relative" }}>— Posicionamiento central</span>
            </div>
          )}
        </MSec>

        {/* 02 MERCADO */}
        <MSec num="02" label="Mercado" title="Análisis de <em style='color:rgba(10,10,10,.4)'>mercado meta</em>">
          <Prose>
            <p>{mkt.summary}</p>
            <p style={{marginTop:".8rem"}}><strong style={{color:"#0a0a0a",fontWeight:400}}>Cliente ideal:</strong> {mkt.icp}</p>
            <p style={{marginTop:".8rem"}}><strong style={{color:"#0a0a0a",fontWeight:400}}>Brecha competitiva:</strong> {mkt.gap}</p>
          </Prose>
          {mkt.segments?.length > 0 && (
            <Cards items={mkt.segments} renderItem={(s,i)=>(
              <Card key={i} num={`SEGMENTO 0${i+1}`} title={s.split(":")[0]} body={s}/>
            )}/>
          )}
        </MSec>

        {/* 03 COMPETENCIA */}
        {ai.competitors?.length > 0 && (
          <MSec num="03" label="Competencia" title="Landscape <em style='color:rgba(10,10,10,.4)'>competitivo</em>">
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:".76rem", marginTop:"2rem" }}>
              <thead>
                <tr>{["Competidor","Análisis"].map(h=>(
                  <th key={h} style={{ fontSize:".54rem", letterSpacing:".14em", textTransform:"uppercase", color:"rgba(10,10,10,.4)", textAlign:"left", padding:".7rem .9rem", borderBottom:"2px solid #0a0a0a", background:"#f7f7f7" }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {ai.competitors.map((c,i)=>{
                  const p=c.split(" — ");
                  return (
                    <tr key={i} style={{ background:i%2===0?"#fff":"#f9f9f9" }}>
                      <td style={{ padding:".85rem .9rem", borderBottom:"1px solid rgba(10,10,10,.07)" }}><strong style={{fontWeight:400}}>{p[0]||c}</strong></td>
                      <td style={{ padding:".85rem .9rem", borderBottom:"1px solid rgba(10,10,10,.07)", color:"rgba(10,10,10,.55)" }}>{p[1]||c}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </MSec>
        )}

        {/* 04 COLOR */}
        <MSec num="04" label="Color" title="Sistema de <em style='color:rgba(10,10,10,.4)'>color</em>">
          {cs.strategy && <Prose><p>{cs.strategy}</p></Prose>}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:"1rem", marginTop:"2rem" }}>
            {d.colors.map((c,i)=>(
              <div key={i} style={{ borderRadius:3, overflow:"hidden", border:"1px solid rgba(10,10,10,.08)" }}>
                <div style={{ height:90, background:c.hex }}/>
                <div style={{ padding:".65rem .8rem", background:"#fff" }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontSize:".72rem", fontWeight:700, display:"block", marginBottom:".12rem" }}>{COLOR_ROLES[i]?.label||"Color"}</span>
                  <span style={{ fontSize:".58rem", color:"rgba(10,10,10,.4)", letterSpacing:".1em", display:"block" }}>{c.hex.toUpperCase()}</span>
                  {cs.roles?.[i] && <span style={{ fontSize:".55rem", color:"rgba(10,10,10,.35)", display:"block", marginTop:".22rem", lineHeight:1.4 }}>{cs.roles[i]}</span>}
                </div>
              </div>
            ))}
          </div>
          {(cs.rules?.do||cs.rules?.dont||cs.rules?.proportions) && (
            <div style={{ fontSize:".8rem", lineHeight:1.85, color:"rgba(10,10,10,.62)", marginTop:"1.5rem", padding:"1.5rem", background:"#f7f7f7", border:"1px solid rgba(10,10,10,.08)" }}>
              {cs.rules.proportions && <p><strong style={{color:"#0a0a0a",fontWeight:400}}>Proporciones:</strong> {cs.rules.proportions}</p>}
              {cs.rules.do && <p style={{marginTop:".5rem"}}><strong style={{color:"#0a0a0a",fontWeight:400}}>Combinaciones recomendadas:</strong> {cs.rules.do}</p>}
              {cs.rules.dont && <p style={{marginTop:".5rem"}}><strong style={{color:"#0a0a0a",fontWeight:400}}>Prohibido:</strong> {cs.rules.dont}</p>}
            </div>
          )}
        </MSec>

        {/* 05 TIPOGRAFÍA */}
        <MSec num="05" label="Tipografía" title="Sistema <em style='color:rgba(10,10,10,.4)'>tipográfico</em>">
          {typo.evaluation && <Prose><p>{typo.evaluation}</p></Prose>}
          <div style={{ display:"flex", flexDirection:"column", gap:1, background:"rgba(10,10,10,.08)", border:"1px solid rgba(10,10,10,.08)", marginTop:"2rem" }}>
            {(typo.fonts||[]).map((f,i)=>(
              <div key={i} style={{ background:"#fff", padding:"2rem 2rem" }}>
                <div style={{ fontSize:".54rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(10,10,10,.38)", marginBottom:".8rem" }}>{f.role} · {f.name}</div>
                <div style={{ fontFamily:`'${f.name}',serif,sans-serif`, fontSize:"clamp(1.8rem,3.5vw,3.2rem)", fontWeight:300, lineHeight:1.1, color:"#0a0a0a", marginBottom:".6rem" }}>{f.sample||d.name}</div>
                <div style={{ fontSize:".8rem", lineHeight:1.85, color:"rgba(10,10,10,.55)", marginBottom:"1rem", maxWidth:580 }}>{f.why}</div>
                <div style={{ fontSize:".6rem", color:"rgba(10,10,10,.35)", letterSpacing:".06em", paddingTop:".8rem", borderTop:"1px solid rgba(10,10,10,.07)" }}>
                  <strong style={{color:"rgba(10,10,10,.55)"}}>Uso:</strong> {f.usage}
                </div>
              </div>
            ))}
          </div>
          {typo.recommendation?.needed && (typo.recommendation.alts?.length > 0) && (
            <div style={{ padding:"1.5rem 2rem", background:"#0a0a0a", marginTop:"1.5rem" }}>
              <p style={{ fontSize:".8rem", color:"#fff", lineHeight:1.75 }}><strong style={{fontWeight:400}}>Recomendación:</strong> {typo.recommendation.reasoning}</p>
              <div style={{ display:"flex", gap:8, marginTop:".8rem", flexWrap:"wrap" }}>
                {typo.recommendation.alts.map(alt=>(
                  <span key={alt} style={{ background:"#fff", color:"#0a0a0a", fontSize:".58rem", letterSpacing:".12em", textTransform:"uppercase", padding:".3rem .7rem", borderRadius:2 }}>{alt}</span>
                ))}
              </div>
            </div>
          )}
        </MSec>

        {/* 06 VOZ */}
        <MSec num="06" label="Comunicación" title="Voz y <em style='color:rgba(10,10,10,.4)'>tono</em>">
          <Prose><p>{voice.description}</p></Prose>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:1, background:"rgba(10,10,10,.08)", border:"1px solid rgba(10,10,10,.08)", marginTop:"2rem" }}>
            {[{title:"Sí hacemos", items:voice.do||[], isDo:true},{title:"No hacemos", items:voice.dont||[], isDo:false}].map(col=>(
              <div key={col.title} style={{ background:"#fff", padding:"1.8rem" }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:".65rem", fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", paddingBottom:".7rem", marginBottom:".85rem", borderBottom:`2px solid ${col.isDo?"#0a0a0a":"rgba(10,10,10,.12)"}`, color:col.isDo?"#0a0a0a":"rgba(10,10,10,.4)" }}>{col.title}</div>
                {col.items.map((item,i)=>(
                  <div key={i} style={{ fontSize:".76rem", color:"rgba(10,10,10,.58)", padding:".45rem 0", borderBottom:"1px solid rgba(10,10,10,.06)", display:"flex", gap:".55rem", lineHeight:1.55 }}>
                    <span style={{ color:col.isDo?"#0a0a0a":"rgba(10,10,10,.25)", flexShrink:0 }}>{col.isDo?"↳":"×"}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </MSec>

        {/* 07 TAGLINES */}
        <MSec num="07" label="Mensajes" title="Taglines y <em style='color:rgba(10,10,10,.4)'>mensajes clave</em>">
          {(ai.taglines||[]).map((t,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"baseline", gap:"1.2rem", padding:"1rem 0", borderBottom:"1px solid rgba(10,10,10,.06)" }}>
              <span style={{ fontSize:".58rem", color:"rgba(10,10,10,.2)", flexShrink:0, width:"1.6rem" }}>0{i+1}</span>
              <span style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:"1.1rem", fontWeight:300, color:"#0a0a0a", flex:1, lineHeight:1.3 }}>{t.text}</span>
              <span style={{ fontSize:".56rem", color:"rgba(10,10,10,.3)", letterSpacing:".1em", textTransform:"uppercase", flexShrink:0 }}>{t.context}</span>
            </div>
          ))}
        </MSec>

        {/* 08 APLICACIONES */}
        {(apps.digital||apps.print||apps.motion) && (
          <MSec num="08" label="Aplicaciones" title="La marca <em style='color:rgba(10,10,10,.4)'>en contexto</em>">
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:1, background:"rgba(10,10,10,.08)", border:"1px solid rgba(10,10,10,.08)" }}>
              {[["Digital",apps.digital,"◻"],["Impresión",apps.print,"◻"],["Motion",apps.motion,"◻"]].filter(([,v])=>v).map(([t,v,ic])=>(
                <div key={t} style={{ background:"#fff", padding:"1.8rem" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:".72rem", fontWeight:700, marginBottom:".6rem" }}>{t}</div>
                  <div style={{ fontSize:".76rem", lineHeight:1.75, color:"rgba(10,10,10,.55)" }}>{v}</div>
                </div>
              ))}
            </div>
          </MSec>
        )}

      </div>
      {/* FOOTER */}
      <div style={{ background:"#0a0a0a", padding:"4rem 3.5rem", textAlign:"center" }}>
        {d.logo && <img src={d.logo} alt="logo" style={{ height:40, objectFit:"contain", marginBottom:"1.5rem", opacity:.5, display:"block", margin:"0 auto 1.5rem" }}/>}
        <span style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:"2rem", fontWeight:300, color:"#fff", display:"block", marginBottom:".4rem" }}>{d.name}</span>
        <span style={{ fontSize:".58rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,.3)" }}>Manual de Identidad · {new Date().getFullYear()}</span>
        <div style={{ marginTop:"2.5rem", fontSize:".55rem", color:"rgba(255,255,255,.15)", letterSpacing:".1em" }}>Generado con Brand Manual Generator · by Arthur Something</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */
export default function App() {
  const [name,         setName]         = useState("");
  const [logo,         setLogo]         = useState(null);
  const [url,          setUrl]          = useState("");
  const [tagline,      setTagline]      = useState("");
  const [desc,         setDesc]         = useState("");
  const [industry,     setIndustry]     = useState("");
  const [stage,        setStage]        = useState("");
  const [market,       setMarket]       = useState("");
  const [personality,  setPersonality]  = useState("");
  const [competitors,  setCompetitors]  = useState("");
  const [tones,        setTones]        = useState([]);
  const [values,       setValues]       = useState("");
  const [fonts,        setFonts]        = useState([{name:"Fraunces",role:"Display"},{name:"DM Mono",role:"Body"}]);
  const [colors,       setColors]       = useState(DEFAULT_COLORS);
  const [wantTagline,  setWantTagline]  = useState(false);
  const [wantMarket,   setWantMarket]   = useState(false);
  const [wantComps,    setWantComps]    = useState(false);

  const [screen,    setScreen]    = useState("empty");
  const [genLabel,  setGenLabel]  = useState(SEC_LABELS[0]);
  const [result,    setResult]    = useState(null);
  const [formData,  setFormData]  = useState(null);
  const [error,     setError]     = useState("");

  const toggleTone = t => setTones(p => p.includes(t) ? p.filter(x=>x!==t) : [...p,t]);
  const updateColor = (i,c) => setColors(p => p.map((x,idx) => idx===i ? c : x));

  const generate = useCallback(async () => {
    if (!name.trim()) return;
    const d = { name:name.trim(), logo, url, tagline, desc, industry, stage, market, personality, competitors, tones, values, fonts, colors, wantTagline, wantMarket, wantCompetitors:wantComps, hasLogo:!!logo };
    setFormData(d); setScreen("gen"); setError("");
    let idx = 0; setGenLabel(SEC_LABELS[0]);
    const timer = setInterval(() => { idx=(idx+1)%SEC_LABELS.length; setGenLabel(SEC_LABELS[idx]); }, 1300);
    try {
      const resp = await fetch("/.netlify/functions/anthropic", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:buildPrompt(d)}] })
      });
      const data = await resp.json();
      const raw = data.content[0].text;
      const ai = JSON.parse(raw.replace(/```json|```/g,"").trim());
      clearInterval(timer); setResult(ai); setScreen("manual");
    } catch(e) {
      clearInterval(timer); setError("No se pudo generar. Verifica tu conexión e inténtalo de nuevo."); setScreen("empty");
    }
  }, [name,logo,url,tagline,desc,industry,stage,market,personality,competitors,tones,values,fonts,colors,wantTagline,wantMarket,wantComps]);

  const canGen = name.trim().length > 0;

  return (
    <>
      <link rel="stylesheet" href={FONTS_URL}/>
      <style>{`
        @keyframes pulse{0%,100%{transform:scale(1);opacity:.1}50%{transform:scale(1.3);opacity:.2}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        input[type=range]{-webkit-appearance:none;appearance:none;height:14px;border-radius:7px;outline:none;cursor:pointer}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.35);cursor:pointer;margin-top:-2px}
        input[type=range]::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.35);cursor:pointer;border:none}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(10,10,10,.1);border-radius:2px}
        select option{background:#fff;color:#0a0a0a}
      `}</style>

      <div style={{ fontFamily:"'DM Mono',monospace", fontWeight:300, background:"#fff", color:"#0a0a0a", minHeight:"100vh", fontSize:16 }}>

        {/* TOPBAR */}
        <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:200, height:48, background:"rgba(255,255,255,.97)", borderBottom:"1px solid rgba(10,10,10,.1)", backdropFilter:"blur(16px)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 2rem" }}>
          <div style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:".92rem" }}>Brand Manual Generator</div>
          <div style={{ fontSize:".5rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(10,10,10,.3)" }}>by Arthur Something</div>
          <div style={{ fontSize:".56rem", color:screen==="manual"?"#0a0a0a":"rgba(10,10,10,.4)", letterSpacing:".1em", transition:"color .3s" }}>
            {screen==="empty"?"Configura tu marca →":screen==="gen"?"Generando...":"✓ Manual generado"}
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", minHeight:"100vh", paddingTop:48 }}>

          {/* ── FORM PANEL ── */}
          <div style={{ background:"#f7f7f7", borderRight:"1px solid rgba(10,10,10,.08)", height:"calc(100vh - 48px)", position:"sticky", top:48, overflowY:"auto" }}>
            <div style={{ padding:"1.4rem" }}>

              <FormSection icon="◈" title="Identidad básica">
                <Field label="Nombre de la marca *">
                  <input style={inp} value={name} onChange={e=>setName(e.target.value)} placeholder="ej. Acme Studio"/>
                </Field>
                <Field label="Logo" hint="SVG, PNG o JPG. Se incluirá en el manual.">
                  <LogoUpload value={logo} onChange={setLogo}/>
                </Field>
                <Field label="URL actual" hint="Se analiza para inferir posicionamiento existente.">
                  <input style={inp} type="url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://tudominio.com"/>
                </Field>
                <Field label="Descripción">
                  <textarea style={tex} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Qué hace, para quién, cuál es su propósito..."/>
                </Field>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <Field label="Industria">
                    <select style={sel} value={industry} onChange={e=>setIndustry(e.target.value)}>
                      <option value="">Selecciona...</option>
                      {INDUSTRIES.map(o=><option key={o}>{o}</option>)}
                    </select>
                  </Field>
                  <Field label="Etapa">
                    <select style={sel} value={stage} onChange={e=>setStage(e.target.value)}>
                      <option value="">Selecciona...</option>
                      {STAGES.map(o=><option key={o}>{o}</option>)}
                    </select>
                  </Field>
                </div>
              </FormSection>

              <FormSection icon="◎" title="Tagline" optional>
                <Field label="Tagline / claim actual">
                  <input style={inp} value={tagline} onChange={e=>setTagline(e.target.value)} placeholder="ej. Build faster, scale smarter"/>
                </Field>
                <Toggle checked={wantTagline} onChange={setWantTagline} label="Generar opciones de tagline" hint="Claude sugerirá 4 alternativas"/>
              </FormSection>

              <FormSection icon="◉" title="Mercado & Competencia" optional>
                <Field label="Mercado meta">
                  <input style={inp} value={market} onChange={e=>setMarket(e.target.value)} placeholder="ej. Startups Serie A en LATAM y USA"/>
                </Field>
                <Toggle checked={wantMarket} onChange={setWantMarket} label="Analizar y recomendar mercado" hint="Segmentación profunda del mercado objetivo"/>
                <Field label="Competidores / referencias" hint="URLs o nombres separados por comas. Pueden ser competidores directos o marcas que te inspiren.">
                  <textarea style={{...tex, minHeight:80}} value={competitors} onChange={e=>setCompetitors(e.target.value)} placeholder={"ej. https://stripe.com, Linear, Notion\n\nCompetidores o marcas referencia."}/>
                </Field>
                <Toggle checked={wantComps} onChange={setWantComps} label="Identificar competidores automáticamente"/>
              </FormSection>

              <FormSection icon="◐" title="Personalidad">
                <Field label="Descripción de personalidad" hint="Cómo quieres que se sienta la marca (libre).">
                  <textarea style={{...tex, minHeight:56}} value={personality} onChange={e=>setPersonality(e.target.value)} placeholder="ej. Como un amigo experto en tech, no una corporación..."/>
                </Field>
                <Field label="Tono de comunicación">
                  <div style={{ display:"flex", flexWrap:"wrap", gap:".25rem", marginTop:".1rem" }}>
                    {TONES.map(t=>(
                      <button key={t} onClick={()=>toggleTone(t)}
                        style={{ fontSize:".54rem", letterSpacing:".04em", padding:".18rem .48rem", borderRadius:2, border:tones.includes(t)?"1px solid #0a0a0a":"1px solid rgba(10,10,10,.15)", color:tones.includes(t)?"#fff":"rgba(10,10,10,.45)", cursor:"pointer", background:tones.includes(t)?"#0a0a0a":"transparent", fontFamily:"'DM Mono',monospace" }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Valores de marca">
                  <input style={inp} value={values} onChange={e=>setValues(e.target.value)} placeholder="ej. transparencia, velocidad, impacto"/>
                </Field>
              </FormSection>

              <FormSection icon="◑" title="Paleta de color">
                {colors.map((c,i)=>(
                  <ColorRow key={i} color={c} roleInfo={COLOR_ROLES[i]||{label:"Extra",hint:""}} onChange={nc=>updateColor(i,nc)}/>
                ))}
              </FormSection>

              <FormSection icon="◒" title="Tipografía" optional={false}>
                <FontSelector fonts={fonts} onChange={setFonts}/>
              </FormSection>

              {error && <div style={{ fontSize:".65rem", color:"#c00", marginBottom:".75rem", padding:".5rem .75rem", background:"#fff0f0", border:"1px solid rgba(200,0,0,.15)", borderRadius:4 }}>{error}</div>}

              <button onClick={generate} disabled={!canGen}
                style={{ width:"100%", background:canGen?"#0a0a0a":"rgba(10,10,10,.2)", color:"#fff", border:"none", borderRadius:4, fontFamily:"'DM Mono',monospace", fontSize:".66rem", fontWeight:500, letterSpacing:".18em", textTransform:"uppercase", padding:".8rem", cursor:canGen?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:".5rem", marginTop:"1rem" }}>
                {screen==="gen"
                  ? <div style={{ width:12, height:12, border:"1.5px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .65s linear infinite" }}/>
                  : null}
                <span>{screen==="gen"?"Generando...":"Generar Manual →"}</span>
              </button>
              {screen==="manual" && (
                <button onClick={generate}
                  style={{ width:"100%", background:"transparent", color:"rgba(10,10,10,.5)", border:"1px solid rgba(10,10,10,.12)", borderRadius:4, fontFamily:"'DM Mono',monospace", fontSize:".62rem", letterSpacing:".14em", textTransform:"uppercase", padding:".6rem", cursor:"pointer", marginTop:6 }}>
                  ↺ Regenerar
                </button>
              )}

            </div>
          </div>

          {/* ── PREVIEW ── */}
          <div style={{ minHeight:"calc(100vh - 48px)", overflowY:"auto", background:"#fff" }}>
            {screen==="empty" && (
              <div style={{ height:"calc(100vh - 48px)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:".85rem", textAlign:"center", padding:"2rem" }}>
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none" style={{opacity:.07}}>
                  <rect x="3" y="3" width="44" height="44" rx="5" stroke="#0a0a0a" strokeWidth="1.5"/>
                  <path d="M13 18h24M13 25h14M13 32h18" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:"1.1rem", fontWeight:300, color:"rgba(10,10,10,.2)" }}>Tu manual aparecerá aquí</div>
                <div style={{ fontSize:".6rem", color:"rgba(10,10,10,.18)", letterSpacing:".05em", lineHeight:1.7, maxWidth:240 }}>Completa los campos y haz clic en "Generar Manual" para crear tu identidad de marca con IA.</div>
              </div>
            )}
            {screen==="gen" && (
              <div style={{ height:"calc(100vh - 48px)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"1rem", textAlign:"center" }}>
                <div style={{ width:40, height:40, borderRadius:"50%", background:"#0a0a0a", opacity:.1, animation:"pulse 1.4s ease-in-out infinite" }}/>
                <div style={{ fontSize:".6rem", letterSpacing:".14em", textTransform:"uppercase", color:"rgba(10,10,10,.3)" }}>Generando manual de identidad</div>
                <div style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:".9rem", color:"#0a0a0a", opacity:.6 }}>{genLabel}</div>
              </div>
            )}
            {screen==="manual" && result && formData && <ManualOutput d={formData} ai={result}/>}
          </div>
        </div>
      </div>
    </>
  );
}
