import { useState } from "react";

// ─── Data Constants ────────────────────────────────────────────────────────
const SECTORS = [
  "Sector 1", "Sector 2", "Sector 3", "Sector 4",
  "Sector 5", "Sector 6", "Ilfov", "Online Only",
];

const LEGAL_TYPES = [
  { value: "CIP", label: "CIP — Cabinet Individual Psiholog", desc: "Persoană fizică autorizată" },
  { value: "SRL", label: "SRL — Societate cu Răspundere Limitată", desc: "Persoană juridică" },
  { value: "CLINICA", label: "Clinică / Centru", desc: "Structură medicală acreditată" },
];

const GBP_STATUS = [
  { value: "HAS_GBP", label: "Am deja un profil Google", icon: "✅" },
  { value: "NEEDS_NEW", label: "Am nevoie de un profil nou", icon: "🆕" },
  { value: "NEEDS_RECLAIM", label: "Trebuie să revendic un profil existent", icon: "🔄" },
];

const SERVICES = [
  { id: "individual", label: "Terapie Individuală", defaultDuration: 50, price: "200–350 RON" },
  { id: "couple", label: "Terapie de Cuplu", defaultDuration: 80, price: "300–450 RON" },
  { id: "child", label: "Copii / Adolescenți", defaultDuration: 50, price: "200–350 RON" },
  { id: "evaluation", label: "Evaluare Clinică", defaultDuration: 90, price: "350–600 RON" },
  { id: "online", label: "Ședință Online", defaultDuration: 50, price: "200–300 RON" },
  { id: "corporate", label: "Corporate / Burnout", defaultDuration: 60, price: "400–600 RON" },
];

const DELIVERY_MODES = [
  { value: "cabinet", label: "Cabinet Only", icon: "🏢" },
  { value: "video", label: "Video Call Only", icon: "📹" },
  { value: "hybrid", label: "Hybrid (Cabinet + Online)", icon: "⚡" },
];

const AUTOMATION_LEVELS = [
  {
    value: "passive",
    label: "Pasiv",
    desc: "Formular de contact → email. Zero setup.",
    badge: "Simplu",
    color: "slate",
  },
  {
    value: "whatsapp",
    label: "Hybrid WhatsApp",
    desc: "+30% volum lead-uri. Popular în București.",
    badge: "Recomandat",
    color: "emerald",
  },
  {
    value: "calendar",
    label: "Calendar Full",
    desc: "Cal.com EU sincronizat cu Google Calendar.",
    badge: "Avansat",
    color: "blue",
  },
];

const BUFFER_TIMES = ["Fără pauză", "10 min (Standard)", "15 min", "30 min"];

const SPECIALTIES = [
  { id: "anxiety", label: "Anxietate", kw: "psiholog anxietate" },
  { id: "depression", label: "Depresie", kw: "psiholog depresie" },
  { id: "couples", label: "Cuplu / Relații", kw: "terapie cuplu" },
  { id: "kids", label: "Copii / Adolescenți", kw: "psiholog copii" },
  { id: "adhd", label: "ADHD", kw: "evaluare ADHD" },
  { id: "trauma", label: "Trauma / EMDR", kw: "terapie EMDR trauma" },
  { id: "addiction", label: "Adicții", kw: "psiholog adicții" },
  { id: "burnout", label: "Burnout Corporate", kw: "psiholog burnout" },
];

const LANGUAGES = [
  { value: "ro", label: "Română only" },
  { value: "ro_en", label: "Română + Engleză" },
  { value: "other", label: "Altă combinație" },
];

const CONTENT_STATUS = [
  { value: "ready", label: "Am texte gata", icon: "📄" },
  { value: "ai", label: "Vreau draft-uri AI", icon: "🤖" },
  { value: "copywriting", label: "Vreau copywriting profesional", icon: "✍️" },
];

const DOMAIN_STATUS = [
  { value: "need_ro", label: "Trebuie să cumpăr .ro", icon: "🛒" },
  { value: "have", label: "Am domeniu activ", icon: "✅" },
  { value: "need_com", label: "Vreau .com / altul", icon: "🌐" },
];

const COMPLIANCE_ITEMS = [
  { id: "anpc", label: "Link ANPC în footer", required: true },
  { id: "sal", label: "Link SAL în footer", required: true },
  { id: "gdpr", label: "Acord GDPR / Prelucrare Date", required: true },
  { id: "copsi", label: "Număr înregistrare COPSI vizibil", required: false },
  { id: "dpa", label: "DPA semnat cu CloseBy Studio SRL", required: true },
];

// ─── Step indicator ────────────────────────────────────────────────────────
const STEPS = [
  { num: 1, label: "Identitate" },
  { num: 2, label: "Servicii" },
  { num: 3, label: "Automatizare" },
  { num: 4, label: "SEO & Content" },
  { num: 5, label: "Tehnic" },
  { num: 6, label: "Confirmare" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
}

function generateKeywords(sector, specialties) {
  const sectorLower = sector.toLowerCase().replace(" ", "-");
  const base = [
    `psiholog ${sectorLower} bucuresti`,
    `cabinet psihologie ${sectorLower}`,
    `psihoterapeut ${sectorLower} bucuresti`,
  ];
  const specKws = specialties.map((s) => {
    const found = SPECIALTIES.find((x) => x.id === s);
    return found ? `${found.kw} ${sectorLower}` : null;
  }).filter(Boolean);
  return [...base, ...specKws].slice(0, 10);
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function Badge({ children, color = "slate" }) {
  const colors = {
    slate: "bg-slate-700 text-slate-300",
    emerald: "bg-emerald-900/60 text-emerald-400 border border-emerald-700/40",
    blue: "bg-blue-900/60 text-blue-400 border border-blue-700/40",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide ${colors[color]}`}>
      {children}
    </span>
  );
}

function StepHeader({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-white tracking-tight">{title}</h2>
      {subtitle && <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-xs font-medium text-slate-300 uppercase tracking-widest mb-2">
      {children} {required && <span className="text-emerald-500 normal-case tracking-normal">*</span>}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, ...props }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600 transition-colors"
      {...props}
    />
  );
}

function SelectCard({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition-all duration-150 ${
        selected
          ? "border-emerald-600 bg-emerald-950/40 ring-1 ring-emerald-600/30"
          : "border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

function CheckCard({ checked, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-lg border px-4 py-3 flex items-center gap-3 transition-all duration-150 ${
        checked
          ? "border-emerald-600 bg-emerald-950/30"
          : "border-slate-700 bg-slate-900/40 hover:border-slate-600"
      }`}
    >
      <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
        checked ? "bg-emerald-600 border-emerald-600" : "border-slate-600"
      }`}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      {children}
    </button>
  );
}

// ─── Step Components ─────────────────────────────────────────────────────────
function Step1({ data, onChange }) {
  return (
    <div className="space-y-6">
      <StepHeader
        title="Identitate & Localizare"
        subtitle="Aceste date populează tabela clients + locations din Supabase."
      />

      <div>
        <FieldLabel required>Nume Cabinet / Psihoterapeut</FieldLabel>
        <TextInput
          value={data.cabinetName}
          onChange={(e) => onChange("cabinetName", e.target.value)}
          placeholder="ex: Dr. Maria Ionescu — Cabinet Psihoterapie"
        />
        {data.cabinetName && (
          <p className="mt-1.5 text-xs text-slate-500">
            Slug generat: <span className="text-emerald-400 font-mono">{generateSlug(data.cabinetName)}</span>
          </p>
        )}
      </div>

      <div>
        <FieldLabel required>Tip Entitate Juridică</FieldLabel>
        <div className="space-y-2">
          {LEGAL_TYPES.map((t) => (
            <SelectCard
              key={t.value}
              selected={data.legalType === t.value}
              onClick={() => onChange("legalType", t.value)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-200">{t.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{t.desc}</div>
                </div>
                {data.legalType === t.value && (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            </SelectCard>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel required>Locație Principală (Sector)</FieldLabel>
        <div className="grid grid-cols-4 gap-2">
          {SECTORS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange("sector", s)}
              className={`rounded-lg border py-2.5 text-xs font-medium transition-all ${
                data.sector === s
                  ? "border-emerald-600 bg-emerald-950/40 text-emerald-400"
                  : "border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:text-slate-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel required>Status Google Business Profile</FieldLabel>
        <div className="space-y-2">
          {GBP_STATUS.map((g) => (
            <SelectCard
              key={g.value}
              selected={data.gbpStatus === g.value}
              onClick={() => onChange("gbpStatus", g.value)}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{g.icon}</span>
                <span className="text-sm text-slate-200">{g.label}</span>
              </div>
            </SelectCard>
          ))}
        </div>
        {data.gbpStatus === "HAS_GBP" && (
          <div className="mt-3">
            <TextInput
              value={data.gbpUrl}
              onChange={(e) => onChange("gbpUrl", e.target.value)}
              placeholder="https://maps.google.com/..."
            />
            <p className="mt-1 text-xs text-slate-500">
              Linkul se folosește pentru a popula <span className="font-mono text-slate-400">locations.gbp_location_id</span>
            </p>
          </div>
        )}
      </div>

      <div>
        <FieldLabel>Adresă Cabinet</FieldLabel>
        <TextInput
          value={data.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="ex: Bd. Unirii 14, Sector 3, București"
        />
        <p className="mt-1 text-xs text-slate-500">
          Coordonatele se vor seta automat via Google Places API la deploy.
        </p>
      </div>
    </div>
  );
}

function Step2({ data, onChange }) {
  const toggleService = (id) => {
    const current = data.services || [];
    const updated = current.includes(id)
      ? current.filter((s) => s !== id)
      : [...current, id];
    onChange("services", updated);
  };

  return (
    <div className="space-y-6">
      <StepHeader
        title="Servicii & Tarife"
        subtitle="Configurează tipurile de ședință — populează tabela services din merged-client.json."
      />

      <div>
        <FieldLabel required>Tipuri de Servicii Oferite</FieldLabel>
        <div className="space-y-2">
          {SERVICES.map((s) => {
            const isSelected = (data.services || []).includes(s.id);
            return (
              <CheckCard
                key={s.id}
                checked={isSelected}
                onClick={() => toggleService(s.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-200">{s.label}</span>
                    <span className="text-xs text-slate-500 font-mono">{s.price}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Durată implicită: <span className="text-slate-400">{s.defaultDuration} min</span>
                  </div>
                </div>
              </CheckCard>
            );
          })}
        </div>
      </div>

      <div>
        <FieldLabel required>Mod de Livrare</FieldLabel>
        <div className="space-y-2">
          {DELIVERY_MODES.map((m) => (
            <SelectCard
              key={m.value}
              selected={data.deliveryMode === m.value}
              onClick={() => onChange("deliveryMode", m.value)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{m.icon}</span>
                <span className="text-sm font-medium text-slate-200">{m.label}</span>
              </div>
            </SelectCard>
          ))}
        </div>
      </div>

      {(data.deliveryMode === "hybrid" || data.deliveryMode === "video") && (
        <div className="rounded-xl border border-blue-800/40 bg-blue-950/20 p-4">
          <div className="flex items-start gap-3">
            <span className="text-blue-400 mt-0.5">ℹ</span>
            <div>
              <p className="text-sm text-blue-300 font-medium">Pagina /terapie-online va fi generată automat</p>
              <p className="text-xs text-blue-400/70 mt-1">
                Include keywords locale + beneficii GDPR EU (servere Frankfurt). Datele se salvează în Cal.com EU.
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <FieldLabel>Preț Ședință Individuală (RON)</FieldLabel>
        <div className="flex items-center gap-3">
          <TextInput
            type="number"
            value={data.priceIndividual || ""}
            onChange={(e) => onChange("priceIndividual", e.target.value)}
            placeholder="ex: 280"
          />
          <span className="text-slate-500 text-sm whitespace-nowrap">RON / ședință</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">Media piață București: 200–450 RON</p>
      </div>
    </div>
  );
}

function Step3({ data, onChange }) {
  return (
    <div className="space-y-6">
      <StepHeader
        title="Automatizare & Programări"
        subtitle="Determină integrarea Cal.com și nivelul de automatizare — impactează direct volumul de lead-uri."
      />

      <div>
        <FieldLabel required>Nivel de Automatizare</FieldLabel>
        <div className="space-y-3">
          {AUTOMATION_LEVELS.map((a) => (
            <SelectCard
              key={a.value}
              selected={data.automation === a.value}
              onClick={() => onChange("automation", a.value)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-200">{a.label}</span>
                    <Badge color={a.color}>{a.badge}</Badge>
                  </div>
                  <p className="text-xs text-slate-400">{a.desc}</p>
                </div>
                {data.automation === a.value && (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            </SelectCard>
          ))}
        </div>
      </div>

      {data.automation === "whatsapp" && (
        <div>
          <FieldLabel required>Număr WhatsApp (cu prefix țară)</FieldLabel>
          <TextInput
            value={data.whatsappNumber || ""}
            onChange={(e) => onChange("whatsappNumber", e.target.value)}
            placeholder="ex: 40722000000"
          />
          <p className="mt-1 text-xs text-emerald-400/70">
            ⚡ WhatsApp adaugă +30% volum lead-uri față de formular simplu
          </p>
        </div>
      )}

      {data.automation === "calendar" && (
        <div className="space-y-4">
          <div>
            <FieldLabel>Cal.com Username (EU)</FieldLabel>
            <TextInput
              value={data.calUsername || ""}
              onChange={(e) => onChange("calUsername", e.target.value)}
              placeholder="ex: dr-maria-ionescu"
            />
            <p className="mt-1 text-xs text-slate-500">
              Format: <span className="font-mono text-slate-400">cal.com/{data.calUsername || "username"}</span>
            </p>
          </div>
          <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4">
            <p className="text-xs text-emerald-300">
              <span className="font-semibold">Date stocate pe servere EU (Frankfurt)</span> — argument de vânzare GDPR pentru clienți.
            </p>
          </div>
        </div>
      )}

      <div>
        <FieldLabel>Timp Pauză între Ședințe</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {BUFFER_TIMES.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => onChange("bufferTime", b)}
              className={`rounded-lg border py-2.5 px-3 text-xs font-medium text-left transition-all ${
                data.bufferTime === b
                  ? "border-emerald-600 bg-emerald-950/40 text-emerald-400"
                  : "border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step4({ data, onChange }) {
  const toggleSpecialty = (id) => {
    const current = data.specialties || [];
    if (current.includes(id)) {
      onChange("specialties", current.filter((s) => s !== id));
    } else if (current.length < 3) {
      onChange("specialties", [...current, id]);
    }
  };

  const kws = data.sector && data.specialties?.length
    ? generateKeywords(data.sector, data.specialties)
    : [];

  return (
    <div className="space-y-6">
      <StepHeader
        title="SEO & Strategie de Conținut"
        subtitle="Generează automat keywords + structura paginilor de servicii."
      />

      <div>
        <FieldLabel required>Specialități Target (max 3)</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {SPECIALTIES.map((s) => {
            const selected = (data.specialties || []).includes(s.id);
            const maxed = (data.specialties || []).length >= 3 && !selected;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSpecialty(s.id)}
                disabled={maxed}
                className={`rounded-lg border px-3 py-2.5 text-xs font-medium text-left transition-all ${
                  selected
                    ? "border-emerald-600 bg-emerald-950/40 text-emerald-400"
                    : maxed
                    ? "border-slate-800 bg-slate-900/20 text-slate-600 cursor-not-allowed"
                    : "border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-600"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        {(data.specialties || []).length === 3 && (
          <p className="mt-2 text-xs text-amber-400/80">Ai selectat 3 specialități — limita maximă recomandată.</p>
        )}
      </div>

      {kws.length > 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">Keywords generate automat</p>
          <div className="flex flex-wrap gap-1.5">
            {kws.map((kw) => (
              <span key={kw} className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-mono">
                {kw}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Aceste keywords vor fi inserate automat în tabela <span className="font-mono text-slate-400">keywords</span> la deploy.
          </p>
        </div>
      )}

      <div>
        <FieldLabel required>Versiuni Limbă Site</FieldLabel>
        <div className="space-y-2">
          {LANGUAGES.map((l) => (
            <SelectCard
              key={l.value}
              selected={data.language === l.value}
              onClick={() => onChange("language", l.value)}
            >
              <span className="text-sm text-slate-200">{l.label}</span>
            </SelectCard>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel required>Status Conținut</FieldLabel>
        <div className="space-y-2">
          {CONTENT_STATUS.map((c) => (
            <SelectCard
              key={c.value}
              selected={data.contentStatus === c.value}
              onClick={() => onChange("contentStatus", c.value)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{c.icon}</span>
                <span className="text-sm text-slate-200">{c.label}</span>
              </div>
            </SelectCard>
          ))}
        </div>
        {data.contentStatus === "ai" && (
          <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900/50 p-3">
            <p className="text-xs text-slate-400">
              Pipeline TOON → Claude Sonnet → merge va genera automat texte SEO personalizate pe sector + specialitate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Step5({ data, onChange }) {
  const toggleCompliance = (id) => {
    const current = data.compliance || [];
    const updated = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    onChange("compliance", updated);
  };

  return (
    <div className="space-y-6">
      <StepHeader
        title="Tehnic & Conformitate"
        subtitle="Specific pieței RO. Toate elementele marcate * sunt obligatorii legal."
      />

      <div>
        <FieldLabel required>Status Domeniu</FieldLabel>
        <div className="space-y-2">
          {DOMAIN_STATUS.map((d) => (
            <SelectCard
              key={d.value}
              selected={data.domainStatus === d.value}
              onClick={() => onChange("domainStatus", d.value)}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{d.icon}</span>
                <span className="text-sm text-slate-200">{d.label}</span>
              </div>
            </SelectCard>
          ))}
        </div>
        {data.domainStatus === "have" && (
          <div className="mt-3">
            <TextInput
              value={data.domain || ""}
              onChange={(e) => onChange("domain", e.target.value)}
              placeholder="ex: dr-maria-ionescu.ro"
            />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <FieldLabel>Conformitate RO</FieldLabel>
          <span className="text-xs text-slate-500">
            {(data.compliance || []).length}/{COMPLIANCE_ITEMS.length} bifate
          </span>
        </div>
        <div className="space-y-2">
          {COMPLIANCE_ITEMS.map((c) => (
            <CheckCard
              key={c.id}
              checked={(data.compliance || []).includes(c.id)}
              onClick={() => toggleCompliance(c.id)}
            >
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm text-slate-200">{c.label}</span>
                {c.required && (
                  <span className="text-xs text-amber-500 font-medium ml-2">Obligatoriu</span>
                )}
              </div>
            </CheckCard>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>Număr Înregistrare COPSI</FieldLabel>
        <TextInput
          value={data.copsiNumber || ""}
          onChange={(e) => onChange("copsiNumber", e.target.value)}
          placeholder="ex: 12345"
        />
        <p className="mt-1 text-xs text-slate-500">
          Se afișează în footer și în schema.org MedicalBusiness.
        </p>
      </div>

      <div>
        <FieldLabel>Email Contact Principal</FieldLabel>
        <TextInput
          type="email"
          value={data.email || ""}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="ex: contact@dr-maria-ionescu.ro"
        />
      </div>

      <div>
        <FieldLabel>Telefon Afișat</FieldLabel>
        <TextInput
          value={data.phone || ""}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="ex: 0722 000 000"
        />
      </div>
    </div>
  );
}

function Step6({ data }) {
  const slug = generateSlug(data.cabinetName || "cabinet");
  const kws = generateKeywords(data.sector || "sector", data.specialties || []);

  const deployConfig = {
    // maps to Supabase clients table
    client: {
      client_slug: slug,
      display_name: data.cabinetName || "",
      primary_domain: data.domain || null,
    },
    // maps to Supabase locations table
    location: {
      address_text: data.address || "",
      gbp_location_id: data.gbpUrl || null,
      lat: null,
      lng: null,
    },
    // maps to Supabase keywords table
    keywords: kws,
    // maps to merged-client.json integrations
    integrations: {
      automationLevel: data.automation,
      calComUsername: data.calUsername || null,
      whatsappNumber: data.whatsappNumber || null,
      deliveryMode: data.deliveryMode,
    },
    // toon.json input for Claude generation
    toon: {
      name: data.cabinetName || "",
      sector: data.sector || "",
      services: (data.services || []).map((id) => SERVICES.find((s) => s.id === id)?.label),
      specialties: (data.specialties || []).map((id) => SPECIALTIES.find((s) => s.id === id)?.label),
      language: data.language,
      contentStatus: data.contentStatus,
    },
  };

  const requiredCompliance = COMPLIANCE_ITEMS.filter((c) => c.required).map((c) => c.id);
  const missingCompliance = requiredCompliance.filter((c) => !(data.compliance || []).includes(c));

  return (
    <div className="space-y-6">
      <StepHeader
        title="Confirmare & Deploy"
        subtitle="Verifică configurația înainte de a lansa pipeline-ul de onboarding."
      />

      {missingCompliance.length > 0 && (
        <div className="rounded-xl border border-amber-700/50 bg-amber-950/20 p-4">
          <div className="flex items-start gap-3">
            <span className="text-amber-400 text-lg">⚠</span>
            <div>
              <p className="text-sm font-medium text-amber-300">Conformitate incompletă</p>
              <p className="text-xs text-amber-400/80 mt-1">
                {missingCompliance.length} element(e) obligatorii lipsă. Bifează-le în pasul 5 înainte de deploy.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Cabinet", value: data.cabinetName || "—", icon: "🏢" },
          { label: "Slug generat", value: slug, icon: "🔗", mono: true },
          { label: "Sector", value: data.sector || "—", icon: "📍" },
          { label: "Tip Entitate", value: data.legalType || "—", icon: "📋" },
          { label: "Automatizare", value: data.automation || "—", icon: "⚡" },
          { label: "Servicii", value: `${(data.services || []).length} tipuri`, icon: "📅" },
          { label: "Specialități", value: `${(data.specialties || []).length}/3 selectate`, icon: "🎯" },
          { label: "Keywords", value: `${kws.length} generate`, icon: "🔍" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{item.icon}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</span>
            </div>
            <p className={`text-sm font-medium text-slate-200 truncate ${item.mono ? "font-mono text-emerald-400" : ""}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Generated config preview */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">
          Config generat (preview JSON)
        </p>
        <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 overflow-auto max-h-64">
          <pre className="text-xs text-emerald-400/80 font-mono leading-relaxed whitespace-pre-wrap">
            {JSON.stringify(deployConfig, null, 2)}
          </pre>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4 space-y-2">
        <p className="text-sm font-semibold text-emerald-300">Pipeline de deploy va executa:</p>
        <ul className="space-y-1.5">
          {[
            "npm run onboard:client -- --toon=generated.toon.json",
            "TOON → Claude Sonnet → merged-client.json",
            "Template zip → npm ci → next build",
            "GitHub private repo → Vercel Git-linked project",
            "Env sync (Cal, Resend, QStash, Upstash)",
            "clients.website_deploy_url actualizat în Supabase",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-emerald-600 text-xs mt-0.5 font-mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-xs text-emerald-400/80 font-mono">{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Main Form ───────────────────────────────────────────────────────────────
export default function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1
    cabinetName: "",
    legalType: "",
    sector: "",
    gbpStatus: "",
    gbpUrl: "",
    address: "",
    // Step 2
    services: [],
    deliveryMode: "",
    priceIndividual: "",
    // Step 3
    automation: "",
    whatsappNumber: "",
    calUsername: "",
    bufferTime: "10 min (Standard)",
    // Step 4
    specialties: [],
    language: "",
    contentStatus: "",
    // Step 5
    domainStatus: "",
    domain: "",
    compliance: [],
    copsiNumber: "",
    email: "",
    phone: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 1) return formData.cabinetName && formData.legalType && formData.sector && formData.gbpStatus;
    if (step === 2) return formData.services.length > 0 && formData.deliveryMode;
    if (step === 3) return !!formData.automation;
    if (step === 4) return formData.specialties.length > 0 && formData.language && formData.contentStatus;
    if (step === 5) return formData.domainStatus && formData.email;
    return true;
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-600/20 border-2 border-emerald-600 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
              <path d="M2 11L9 18L26 2" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Onboarding trimis!</h2>
          <p className="text-slate-400 text-sm mb-6">
            Configurația a fost salvată. Pipeline-ul de deploy va porni automat.
          </p>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-left space-y-2 mb-6">
            {[
              { label: "Client slug", value: generateSlug(formData.cabinetName), mono: true },
              { label: "Sector", value: formData.sector },
              { label: "Automatizare", value: formData.automation },
              { label: "Keywords", value: `${generateKeywords(formData.sector, formData.specialties).length} generate` },
            ].map((r) => (
              <div key={r.label} className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{r.label}</span>
                <span className={`text-sm ${r.mono ? "font-mono text-emerald-400" : "text-slate-200"}`}>{r.value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => { setSubmitted(false); setStep(1); setFormData({ cabinetName: "", legalType: "", sector: "", gbpStatus: "", gbpUrl: "", address: "", services: [], deliveryMode: "", priceIndividual: "", automation: "", whatsappNumber: "", calUsername: "", bufferTime: "10 min (Standard)", specialties: [], language: "", contentStatus: "", domainStatus: "", domain: "", compliance: [], copsiNumber: "", email: "", phone: "" }); }}
            className="text-sm text-slate-400 hover:text-slate-200 underline underline-offset-4"
          >
            Resetează formularul
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-700/40 flex items-center justify-center">
              <span className="text-emerald-400 text-sm font-bold">C</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">CloseBy Studio</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Onboarding Cabinet Psihologie</h1>
          <p className="text-sm text-slate-400 mt-1">
            Generează configurația completă pentru deploy automat pe Vercel.
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step > s.num
                        ? "bg-emerald-600 text-white"
                        : step === s.num
                        ? "bg-emerald-600 text-white ring-4 ring-emerald-600/20"
                        : "bg-slate-800 text-slate-500 border border-slate-700"
                    }`}
                  >
                    {step > s.num ? (
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                        <path d="M1 5l3 3 7-7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      s.num
                    )}
                  </div>
                  <span className={`text-[9px] mt-1 font-medium hidden sm:block ${
                    step === s.num ? "text-emerald-400" : "text-slate-600"
                  }`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-1 mb-4 transition-colors ${
                    step > s.num ? "bg-emerald-600/50" : "bg-slate-800"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          {step === 1 && <Step1 data={formData} onChange={handleChange} />}
          {step === 2 && <Step2 data={formData} onChange={handleChange} />}
          {step === 3 && <Step3 data={formData} onChange={handleChange} />}
          {step === 4 && <Step4 data={formData} onChange={handleChange} />}
          {step === 5 && <Step5 data={formData} onChange={handleChange} />}
          {step === 6 && <Step6 data={formData} />}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Înapoi
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600">{step} / {STEPS.length}</span>
              {step < STEPS.length ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canProceed()}
                  className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-900/40"
                >
                  Continuă →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-all duration-150 hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-900/40"
                >
                  🚀 Lansează Deploy
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Date procesate de CloseBy Studio SRL · Servere EU (Frankfurt) · GDPR compliant
        </p>
      </div>
    </div>
  );
}
