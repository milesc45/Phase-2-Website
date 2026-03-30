import { useState, useEffect, useRef } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────

// CMS §494.62 — ESRD Emergency Preparedness Conditions for Coverage
const HAZARDS = [
  { id: "natural", icon: "🌪️", label: "Natural Hazards", cmsCite: "§494.62(a)(1) · 42 CFR Part 494", desc: "Flooding, wildfires, hurricanes, tornadoes, earthquakes, and winter storms. Site-specific protocols based on your geographic HVA. Addresses shelter-in-place and evacuation decision criteria per §494.62(b) and CMS Appendix Z." },
  { id: "humancaused", icon: "🚨", label: "Human-Caused Hazards", cmsCite: "§494.62(a)(1) · 42 CFR Part 494", desc: "Bomb threats, active shooter/violence, civil unrest, and intentional acts. Includes Run-Hide-Fight protocols, lockdown procedures, law enforcement coordination, and staff/patient tracking per §494.62(b)(2) and CMS Appendix Z." },
  { id: "technological", icon: "⚡", label: "Technological Hazards", cmsCite: "§494.62(b)(1)(ii) · 42 CFR Part 494", desc: "Utility failures (power, water, HVAC), IT/EHR outages, and infrastructure failures. Covers alternate energy sources, generator protocols, dialysate water failure, downtime procedures, and §494.62(b)(1) subsistence requirements." },
  { id: "hazmat", icon: "☢️", label: "Hazardous Materials", cmsCite: "§494.62(a)(1) · 42 CFR Part 494", desc: "Radiological, nuclear, chemical, and biological incidents — including external HAZMAT events requiring decontamination, patient surge, or facility lockdown procedures." },
  { id: "infectious", icon: "🦠", label: "Emerging Infectious Disease", cmsCite: "§494.62(a)(1) · 42 CFR Part 494", desc: "Pandemic response, novel infectious disease outbreaks (Ebola, Zika, SARS-CoV-2), infection control surge, isolation protocols, PPE management, and CMS-required surge plan per §494.62(b)." },
  { id: "communications", icon: "📡", label: "Communications Plan", cmsCite: "§494.62(c) · 42 CFR Part 494", desc: "CMS-required plan covering staff, vendors, patients, physicians, other hospitals, and federal/state/local EM officials. Backup communication systems and patient information privacy per §494.62(c)." },
  { id: "staffing", icon: "👥", label: "Staffing & Volunteer Management", cmsCite: "§494.62(b)(6) · 42 CFR Part 494", desc: "Staffing plans for all staff and volunteers per §494.62(b)(6). Covers surge staffing, mutual aid, volunteer credentialing, staff recall, and succession of command consistent with NIMS/ICS." },
  { id: "continuity", icon: "🏥", label: "Continuity of Operations", cmsCite: "§494.62(a)(3) · 42 CFR Part 494", desc: "Plan for essential services that cannot be deferred during a disaster. Includes patient prioritization, treatment modification, alternate care sites, supply chain, and information management per §494.62(a)(3) and §494.62(b)(5)." },
  { id: "training", icon: "📋", label: "Training, Testing & Exercises", cmsCite: "§494.62(d) · 42 CFR Part 494", desc: "CMS-required training every 2 years (TAG E-0037) and annual exercises including one community-based or full-scale exercise. Includes after-action reports, corrective action plans, and staff competency documentation." },
];

const PRICING = [
  {
    id: "assessment",
    name: "Compliance Gap Assessment",
    price: "$247",
    per: "one-time",
    tag: "Start Here",
    tagColor: "#0EA5E9",
    desc: "Know exactly where you stand before investing in a full plan. Delivered by a CEM, CHEP, CHEC with hands-on healthcare EM experience — not a generic checklist tool.",
    features: [
      "CMS §494.62 Emergency Preparedness checklist",
      "CMS Appendix Z surveyor guidance review",
      "All-hazards HVA readiness review",
      "Communications plan gap identification",
      "Training & exercise compliance review",
      "Prioritized corrective action report",
      "30-min consultation call with Christopher Miles",
    ],
    cta: "Request Your Assessment",
    highlight: false,
  },
  {
    id: "bundle",
    name: "All-Hazards EOP Bundle",
    price: "$897",
    per: "one-time",
    tag: "Most Popular",
    tagColor: "#10B981",
    desc: "A complete, CMS §494.62-aligned Emergency Operations Plan personally reviewed and certified by Christopher Miles, MA, CEM, CHEP, CHEC. Built specifically for outpatient dialysis centers.",
    features: [
      "Complete all-hazards EOP — 9 fully editable components",
      "Communications plan per §494.62(c)",
      "Staffing & volunteer management plan per §494.62(b)(6)",
      "Continuity of operations plan per §494.62(a)(3)",
      "Training & exercise program framework per §494.62(d)",
      "Tabletop exercise scenario template",
      "After-action report & improvement plan template",
      "HVA worksheet per §494.62(a)(1)",
      "Certificate of Personal Plan Review",
    ],
    cta: "Request the Bundle",
    highlight: true,
  },
  {
    id: "retainer",
    name: "Ongoing Compliance Retainer",
    price: "$599",
    per: "month",
    tag: "Year-Round Coverage",
    tagColor: "#8B5CF6",
    desc: "For dialysis centers that want credentialed expert oversight year-round. Your plans stay current, your staff stays trained, and you stay survey-ready — always.",
    features: [
      "Quarterly plan review & regulatory updates",
      "CMS regulatory change alerts",
      "Annual tabletop exercise facilitation (virtual)",
      "Annual full-scale exercise planning support",
      "After-action report review & corrective action",
      "Unlimited email support",
      "Priority response within 48 hours",
      "Annual compliance report for leadership",
    ],
    cta: "Request Retainer Info",
    highlight: false,
  },
];




const BUNDLE_SECTIONS = [
  {
    hazardId: "natural",
    sections: [
      { id: "hva", label: "Hazard Vulnerability Analysis (HVA)", required: true, pages: "4-6", desc: "Facility-based and community-based risk assessment using all-hazards approach per §494.62(a)(1) and CMS Appendix Z." },
      { id: "activation", label: "Plan Activation Criteria", required: true, pages: "2", desc: "Clear escalation triggers from monitoring to full activation for each hazard category." },
      { id: "evac-nat", label: "Evacuation & Shelter-in-Place Decision Tree", required: true, pages: "3", desc: "Step-by-step decision matrix per §494.62(b)(3)/(b)(4) / TAG E-0020/E-0022." },
      { id: "comms-nat", label: "Communication Protocol", required: true, pages: "2", desc: "Staff, patient, family, and media notification procedures aligned with §494.62(c)." },
      { id: "recovery-nat", label: "Recovery & After-Action Review", required: false, pages: "3", desc: "Return-to-operations checklist and after-action report template per §494.62(d)(3) and CMS Appendix Z." },
    ],
  },
  {
    hazardId: "humancaused",
    sections: [
      { id: "run-hide-fight", label: "Run-Hide-Fight Protocol", required: true, pages: "3", desc: "Staff and patient response with dialysis-specific adaptations for tethered patients." },
      { id: "lockdown", label: "Lockdown Procedures", required: true, pages: "2", desc: "Facility lockdown steps, door security, and patient/staff accountability." },
      { id: "law-enforcement", label: "Law Enforcement Coordination", required: true, pages: "2", desc: "911 coordination, facility access for responders, and scene control handoff per §494.62(b)(2) / TAG E-0018." },
      { id: "threat-comms", label: "Internal & External Communications", required: true, pages: "2", desc: "Code words, notifications, and family/media communication policies." },
      { id: "threat-training", label: "Staff Training & Drill Documentation", required: false, pages: "2", desc: "Training frequency, content, and documentation per §494.62(d)(1)." },
    ],
  },
  {
    hazardId: "technological",
    sections: [
      { id: "gen-proto", label: "Generator & Backup Power Protocol", required: true, pages: "3", desc: "Alternate energy sources, load prioritization, and testing schedule per §494.62(b)(1)(ii)." },
      { id: "water-failure", label: "Water Supply Failure Response", required: true, pages: "4", desc: "Dialysate water system failure, alternative sourcing, and patient transfer per TAG E-0015." },
      { id: "downtime-proc", label: "IT/EHR Downtime Procedures", required: true, pages: "4", desc: "Manual documentation workflows to maintain patient care during system outages per §494.62(b)(5) / TAG E-0023." },
      { id: "equip-triage", label: "Equipment & Utility Triage", required: true, pages: "2", desc: "Priority systems and machines during utility shortages; closure/evacuation criteria." },
      { id: "subsistence", label: "Subsistence Needs Plan", required: true, pages: "2", desc: "Food, water, medications, and supplies for staff and patients per §494.62(b)(1)(i) / TAG E-0015." },
      { id: "utility-contacts", label: "Utility Vendor Contact Sheet", required: false, pages: "1", desc: "Editable contact list for power, water, telecom, and medical gas vendors." },
    ],
  },
  {
    hazardId: "hazmat",
    sections: [
      { id: "hazmat-detect", label: "HAZMAT Detection & Notification", required: true, pages: "2", desc: "Identification of radiological, chemical, nuclear, or biological incident and initial notification procedures." },
      { id: "decon", label: "Decontamination Procedures", required: true, pages: "3", desc: "Patient and staff decontamination protocols appropriate for an outpatient dialysis setting." },
      { id: "hazmat-lockdown", label: "Lockdown & Shelter-in-Place", required: true, pages: "2", desc: "Facility protection procedures during external HAZMAT events." },
      { id: "hazmat-comms", label: "Agency Coordination", required: true, pages: "2", desc: "Coordination with local emergency management, fire/HAZMAT teams, and public health." },
    ],
  },
  {
    hazardId: "infectious",
    sections: [
      { id: "pandemic-surge", label: "Pandemic & Surge Plan", required: true, pages: "4", desc: "CMS-required surge plan per §494.62(b) — covering patient surge, staff surge, and supply surge." },
      { id: "isolation", label: "Isolation & Cohorting Protocols", required: true, pages: "3", desc: "Patient isolation procedures for novel infectious diseases in a dialysis treatment setting." },
      { id: "ppe-mgmt", label: "PPE Management Plan", required: true, pages: "2", desc: "PPE inventory, procurement, conservation, and staff donning/doffing procedures." },
      { id: "infectious-comms", label: "Public Health Coordination", required: true, pages: "2", desc: "Coordination with local/state public health, CDC guidance integration, and reporting requirements." },
      { id: "infectious-recovery", label: "Post-Incident Recovery", required: false, pages: "2", desc: "Return to normal operations, staff support, and lessons learned documentation." },
    ],
  },
  {
    hazardId: "communications",
    sections: [
      { id: "staff-comms", label: "Staff Notification & Recall System", required: true, pages: "2", desc: "Emergency call-back tree, accountability tracking, and backup notification methods per §494.62(c)(1)(i) / TAG E-0030." },
      { id: "patient-comms", label: "Patient & Family Communication", required: true, pages: "2", desc: "Procedures for notifying patients/families of treatment disruptions or facility status." },
      { id: "external-comms", label: "External Agency Communication", required: true, pages: "2", desc: "Communication with federal, state, tribal, regional, and local EM officials per §494.62(c)(2) / TAG E-0031." },
      { id: "backup-comms", label: "Backup Communication Systems", required: true, pages: "2", desc: "Alternate communication methods when primary systems fail per §494.62(c)." },
      { id: "info-privacy", label: "Patient Information Privacy", required: true, pages: "1", desc: "Maintaining confidentiality of patient records during emergencies per §494.62(b)(5) / TAG E-0023." },
      { id: "media-comms", label: "Media & Public Information", required: false, pages: "1", desc: "Designated spokesperson, approved messaging, and social media policy." },
    ],
  },
  {
    hazardId: "staffing",
    sections: [
      { id: "min-staffing", label: "Minimum Staffing Thresholds", required: true, pages: "2", desc: "Safe minimum staffing levels by shift and patient census per §494.62(b)(6)." },
      { id: "surge-proto", label: "Surge Staffing Protocol", required: true, pages: "3", desc: "Float pool activation, agency staff, overtime procedures, and volunteer integration per §494.62(b)(6) / TAG E-0024." },
      { id: "mutual-aid", label: "Mutual Aid Agreements", required: true, pages: "2", desc: "Pre-negotiated agreements with partner facilities for staff and resource sharing." },
      { id: "volunteer-cred", label: "Volunteer Credentialing & Management", required: true, pages: "2", desc: "Credentialing procedures for volunteer health professionals and liability documentation." },
      { id: "succession", label: "Succession of Command", required: true, pages: "2", desc: "Delegation of authority consistent with NIMS/ICS principles per §494.62(a)(4)." },
      { id: "staff-wellbeing", label: "Staff Wellbeing & Support", required: false, pages: "2", desc: "Fatigue management, mental health resources, and post-incident support." },
    ],
  },
  {
    hazardId: "continuity",
    sections: [
      { id: "patient-priority", label: "Patient Prioritization Matrix", required: true, pages: "3", desc: "Clinical criteria for triaging dialysis patients when capacity is limited per §494.62(b)(7)." },
      { id: "treatment-mod", label: "Treatment Modification Protocols", required: true, pages: "3", desc: "Approved modifications to dialysis schedules and parameters during emergencies." },
      { id: "alt-sites", label: "Alternate Care Site Agreements", required: true, pages: "2", desc: "Pre-established agreements with backup dialysis providers per §494.62(b)(8) / TAG E-0026." },
      { id: "supply-chain", label: "Supply Chain Continuity", required: true, pages: "2", desc: "Critical supply thresholds, vendor contacts, and backup sourcing." },
      { id: "info-mgmt", label: "Information Management Continuity", required: true, pages: "2", desc: "Maintaining availability of medical records during emergencies per §494.62(b)(5)." },
      { id: "after-action", label: "After-Action Review Template", required: false, pages: "2", desc: "Structured post-incident review to capture lessons learned and update plans per §494.62(d)(3) and CMS Appendix Z." },
    ],
  },
  {
    hazardId: "training",
    sections: [
      { id: "training-program", label: "Emergency Training Program", required: true, pages: "3", desc: "Initial and biennial training for all staff, contractors, and volunteers per §494.62(d)(1)." },
      { id: "training-docs", label: "Training Documentation System", required: true, pages: "2", desc: "Records of completed training, competency assessments, and training dates per §494.62(d)(1)(iii)." },
      { id: "tabletop", label: "Tabletop Exercise Template", required: true, pages: "4", desc: "Facilitated discussion-based exercise scenario aligned with HVA priority hazards per §494.62(d)(2)." },
      { id: "full-scale", label: "Full-Scale / Functional Exercise Plan", required: true, pages: "3", desc: "Annual community-based or full-scale exercise per §494.62(d)(2)." },
      { id: "aar", label: "After-Action Report & Improvement Plan", required: true, pages: "3", desc: "Structured AAR and corrective action plan to update EOP based on exercise findings per §494.62(d)(3) and CMS Appendix Z." },
      { id: "nims-ics", label: "NIMS/ICS Compliance Documentation", required: false, pages: "2", desc: "Documentation of NIMS adoption and ICS training consistent with federal requirements." },
    ],
  },
];


const NAV_ITEMS = ["Home", "Solutions", "Bundle", "Pricing", "About", "Contact"];

// ── Components ────────────────────────────────────────────────────────────────

function Tag({ children, color = "#0EA5E9" }) {
  return (
    <span style={{ display: "inline-block", background: color + "15", color, border: `1px solid ${color}30`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em" }}>
      {children}
    </span>
  );
}

function SectionDivider() {
  return <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #E2E8F020, transparent)", margin: "0" }} />;
}

function CheckItem({ children, color = "#10B981" }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: color + "20", border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
        <span style={{ fontSize: 10, color }}>✓</span>
      </div>
      <span style={{ fontSize: 14, color: "#475569", lineHeight: 1.5 }}>{children}</span>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function Phase2Website() {
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [expandedHazard, setExpandedHazard] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkedSections, setCheckedSections] = useState({});
  const [showCert, setShowCert] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const scrollTo = (id) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleCheck = (key) => setCheckedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", color: "#1E293B", fontFamily: "'DM Sans', sans-serif", opacity: mounted ? 1 : 0, transition: "opacity 0.5s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #F8FAFC; } ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
        .nav-link { font-size: 13px; font-weight: 500; color: #64748B; cursor: pointer; padding: 6px 2px; border: none; background: none; transition: color 0.15s; font-family: 'DM Sans', sans-serif; border-bottom: 2px solid transparent; }
        .nav-link:hover, .nav-link.active { color: #0F172A; border-bottom-color: #0EA5E9; }
        .btn { font-family: 'DM Sans', sans-serif; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .btn-primary { background: #0F172A; color: #fff; padding: 13px 26px; font-size: 14px; }
        .btn-primary:hover { background: #1E293B; transform: translateY(-1px); box-shadow: 0 8px 24px #0F172A20; }
        .btn-secondary { background: transparent; border: 1.5px solid #0F172A; color: #0F172A; padding: 12px 24px; font-size: 14px; }
        .btn-secondary:hover { background: #F8FAFC; }
        .btn-blue { background: #0EA5E9; color: #fff; padding: 13px 26px; font-size: 14px; }
        .btn-blue:hover { background: #0284C7; transform: translateY(-1px); box-shadow: 0 8px 24px #0EA5E930; }
        .btn-outline-blue { background: transparent; border: 1.5px solid #0EA5E9; color: #0EA5E9; padding: 11px 22px; font-size: 13px; }
        .btn-outline-blue:hover { background: #F0F9FF; }
        .btn-gold { background: linear-gradient(135deg, #1B2F4E, #2D4A6E); color: #C9A84C; border: 1px solid #C9A84C40; padding: 13px 26px; font-size: 14px; font-weight: 600; }
        .btn-gold:hover { background: linear-gradient(135deg, #243A5C, #3A5A80); box-shadow: 0 8px 24px #1B2F4E30; transform: translateY(-1px); }
        .card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; transition: all 0.2s; }
        .card:hover { border-color: #CBD5E1; box-shadow: 0 4px 20px #0F172A08; }
        .hazard-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s; }
        .hazard-card:hover { border-color: #0EA5E9; background: #F0F9FF; transform: translateY(-1px); }
        .hazard-card.open { border-color: #0EA5E9; background: #F0F9FF; }
        .pricing-card { background: #FFFFFF; border: 1.5px solid #E2E8F0; border-radius: 20px; padding: 32px; transition: all 0.25s; }
        .pricing-card:hover { border-color: #CBD5E1; box-shadow: 0 8px 32px #0F172A0A; transform: translateY(-2px); }
        .pricing-card.highlight { background: #0F172A; border-color: #0F172A; }
        .section-row { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; border-radius: 10px; border: 1px solid #E2E8F0; margin-bottom: 8px; cursor: pointer; transition: all 0.15s; background: #fff; }
        .section-row:hover { border-color: #10B981; background: #F0FDF4; }
        .section-row.checked { border-color: #10B98140; background: #F0FDF4; }
        .checkbox { width: 20px; height: 20px; border-radius: 6px; border: 2px solid #CBD5E1; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; margin-top: 1px; }
        .checkbox.checked { background: #10B981; border-color: #10B981; }
        input, select, textarea { font-family: 'DM Sans', sans-serif; font-size: 14px; background: #F8FAFC; border: 1.5px solid #E2E8F0; color: #1E293B; border-radius: 9px; padding: 12px 16px; outline: none; transition: border-color 0.15s; width: 100%; }
        input:focus, select:focus, textarea:focus { border-color: #0EA5E9; background: #fff; }
        input::placeholder, textarea::placeholder { color: #94A3B8; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.5s 0.1s ease both; }
        .fade-up-3 { animation: fadeUp 0.5s 0.2s ease both; }
        .fade-up-4 { animation: fadeUp 0.5s 0.3s ease both; }
        .stat-num { font-family: 'Fraunces', serif; font-size: 40px; font-weight: 900; color: #0F172A; line-height: 1; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #F1F5F9", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={() => scrollTo("home")}>
          <svg width="40" height="40" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="44" height="44" rx="10" fill="#1B2F4E"/>
            <rect x="2.5" y="2.5" width="39" height="39" rx="7.5" fill="none" stroke="#C9A84C" strokeWidth="1.8"/>
            <text x="22" y="31" fontFamily="sans-serif" fontSize="22" fontWeight="700" fill="white" textAnchor="middle" letterSpacing="-1">P<tspan fill="#C9A84C" fontSize="18" dy="2">2</tspan></text>
          </svg>
          <div>
            <div style={{ fontFamily: "sans-serif", fontSize: 18, fontWeight: 700, color: "#1B2F4E", lineHeight: 1, letterSpacing: "-0.5px" }}>PHASE <span style={{ color: "#C9A84C" }}>2</span></div>
            <div style={{ fontFamily: "sans-serif", fontSize: 8, fontWeight: 500, color: "#4A6FA5", letterSpacing: "2.5px", lineHeight: 1, marginTop: 3 }}>PREPAREDNESS SOLUTIONS</div>
            <div style={{ width: "100%", height: 1, background: "#C9A84C", opacity: 0.5, margin: "2px 0" }} />
            <div style={{ fontFamily: "sans-serif", fontSize: 7, color: "#8A9BB0", letterSpacing: "1px", lineHeight: 1 }}>EXPERT PLANNING. PROVEN COMPLIANCE.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {[["solutions","Solutions"],["bundle","The Process"],["pricing","Pricing"],["about","About"]].map(([id, label]) => (
            <button key={id} className={`nav-link ${activeSection === id ? "active" : ""}`} onClick={() => scrollTo(id)}>
              {label}
            </button>
          ))}
          <button className="btn btn-primary" style={{ padding: "9px 20px", fontSize: 13 }} onClick={() => scrollTo("contact")}>Work With Us</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" ref={heroRef} style={{ padding: "90px 40px 80px", maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
        <div>
          <div className="fade-up" style={{ marginBottom: 18 }}>
            <Tag color="#0EA5E9">CMS & Joint Commission Compliant</Tag>
          </div>
          <h1 className="fade-up-2" style={{ fontFamily: "'Fraunces', serif", fontSize: 52, fontWeight: 900, color: "#0F172A", lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 20 }}>
            CMS & Survey-Ready Plans Built for<br /><span style={{ color: "#0EA5E9" }}>Dialysis Centers.</span>
          </h1>
          <p className="fade-up-3" style={{ fontSize: 17, color: "#475569", lineHeight: 1.7, marginBottom: 32, fontWeight: 300 }}>
            Survey-ready Emergency Operations Plans written by a credentialed hospital emergency manager — not a template mill. Protect your patients, your staff, and your CMS certification.
          </p>
          <div className="fade-up-4" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => scrollTo("bundle")}>See The Process →</button>
            <button className="btn btn-secondary" onClick={() => scrollTo("pricing")}>See Pricing</button>
          </div>
          <div className="fade-up-4" style={{ display: "flex", gap: 24, marginTop: 36, flexWrap: "wrap" }}>
            {[
              { num: "9", label: "EOP Components" },
              { num: "100%", label: "CMS §494.62 / JC Aligned" },
              { num: "15+", label: "Years Experience" },
            ].map(({ num, label }) => (
              <div key={label}>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 900, color: "#0F172A" }}>{num}</div>
                <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero card */}
        <div className="fade-up-3" style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 20, padding: 28, position: "relative" }}>
          <div style={{ position: "absolute", top: -12, right: 24 }}>
            <Tag color="#10B981">✓ Survey Ready</Tag>
          </div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 16 }}>Dialysis EOP Bundle Includes</p>
          {HAZARDS.map((h) => (
            <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid #F1F5F9" }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{h.icon}</div>
              <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>{h.label}</span>
              <div style={{ marginLeft: "auto", width: 18, height: 18, borderRadius: "50%", background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 10, color: "#10B981" }}>✓</span>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 20, background: "#0F172A", borderRadius: 12, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 11, color: "#64748B", marginBottom: 2 }}>Complete Bundle</p>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 900, color: "#fff" }}>$897 <span style={{ fontSize: 13, fontWeight: 400, color: "#64748B" }}>one-time</span></p>
            </div>
            <button className="btn btn-blue" style={{ padding: "10px 18px", fontSize: 13 }} onClick={() => scrollTo("pricing")}>Get Bundle</button>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── TRUST BAR ── */}
      <section style={{ background: "#F8FAFC", padding: "28px 40px", borderTop: "1px solid #F1F5F9", borderBottom: "1px solid #F1F5F9" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
          {["CMS §494.62 Emergency Preparedness", "CMS 42 CFR Part 494 (ESRD)", "JC Ambulatory Care (optional)", "NFPA 1600", "NIMS / ICS Compliant"].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 12, color: "#10B981" }}>✓</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B", letterSpacing: "0.02em" }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOLUTIONS ── */}
      <section id="solutions" style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <Tag color="#0EA5E9">CMS §494.62 — All-Hazards Framework</Tag>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 38, fontWeight: 900, color: "#0F172A", marginTop: 14, marginBottom: 14, letterSpacing: "-0.02em" }}>
            All-Hazards. CMS-Required. Survey-Ready.
          </h2>
          <p style={{ fontSize: 16, color: "#64748B", maxWidth: 560, margin: "0 auto", fontWeight: 300, lineHeight: 1.7 }}>
            CMS §494.62 requires an all-hazards Emergency Operations Plan covering five official hazard categories plus functional requirements. Every section maps directly to a specific CMS TAG and Joint Commission standard.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {HAZARDS.map((h) => (
            <div key={h.id} className={`hazard-card ${expandedHazard === h.id ? "open" : ""}`}
              onClick={() => setExpandedHazard(expandedHazard === h.id ? null : h.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: expandedHazard === h.id ? "#DBEAFE" : "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{h.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>{h.label}</p>
                  {h.cmsCite && <p style={{ fontSize: 10, color: "#0EA5E9", marginTop: 2 }}>{h.cmsCite}</p>}
                </div>
                <span style={{ fontSize: 14, color: "#94A3B8", transition: "transform 0.2s", transform: expandedHazard === h.id ? "rotate(180deg)" : "none" }}>▾</span>
              </div>
              {expandedHazard === h.id && (
                <p style={{ fontSize: 13, color: "#475569", marginTop: 12, lineHeight: 1.6, paddingLeft: 52 }}>{h.desc}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* ── AI + EXPERTISE ── */}
      <section style={{ padding: "80px 40px", background: "#0F172A" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <Tag color="#F59E0B">Why It Matters</Tag>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 38, fontWeight: 900, color: "#F8FAFC", marginTop: 14, marginBottom: 14, letterSpacing: "-0.02em" }}>
              AI-Assisted. Expert-Certified.<br />
              <span style={{ color: "#C9A84C" }}>That's the Difference.</span>
            </h2>
            <p style={{ fontSize: 16, color: "#64748B", maxWidth: 640, margin: "0 auto", fontWeight: 300, lineHeight: 1.7 }}>
              Phase 2 uses the latest AI tools to accelerate plan development and ensure thorough coverage — then every plan is reviewed, refined, and certified by a credentialed emergency manager with 15+ years of real-world experience. AI alone can't do that.
            </p>
          </div>

          {/* AI alone vs AI + expertise banner */}
          <div style={{ background: "linear-gradient(135deg, #0D1520, #111827)", border: "1px solid #1E2A3A", borderRadius: 16, padding: "28px 32px", marginBottom: 32, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: 12, color: "#C9A84C", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Our Approach</p>
              <p style={{ fontSize: 16, color: "#F1F5F9", fontWeight: 600, lineHeight: 1.5 }}>AI-assisted drafting + credentialed expert review + professional certification = a plan that holds up when it matters most.</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {["AI-Assisted Drafting", "CEM, CHEP & CHEC Certified", "Survey-Ready"].map((badge) => (
                <span key={badge} style={{ background: "#C9A84C18", border: "1px solid #C9A84C40", color: "#C9A84C", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600 }}>{badge}</span>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }}>
            {[
              {
                icon: "🔍",
                title: "Surveyors Spot Generic Plans Immediately",
                body: "CMS surveyors have reviewed thousands of plans. A document with no facility-specific details — your actual generator capacity, your real receiving facility agreements, your specific water vendor — is an immediate red flag. Phase 2 plans are built as templates you customize with your facility's real information, then reviewed by a credentialed EM professional before you sign off.",
              },
              {
                icon: "⚖️",
                title: "A Credential Behind the Plan Changes Everything",
                body: "If a plan fails during a real emergency and patients are harmed, professional accountability matters. A plan reviewed and certified by a CEM, CHEP, and CHEC creates a documented chain of responsibility that protects your facility. No AI tool — and no template company — can put their credentials on your plan. We can.",
              },
              {
                icon: "🏥",
                title: "Dialysis Emergencies Require Clinical Expertise",
                body: "A water supply failure at a dialysis center is not the same as a water failure anywhere else. Patients can face life-threatening consequences without treatment. Our plans are informed by real clinical and operational experience in healthcare emergency management — then enhanced with AI-assisted research to ensure nothing is missed.",
              },
              {
                icon: "📋",
                title: "Compliance Is About Interpretation, Not Just Checklists",
                body: "42 CFR Part 494 is written in broad language. What surveyors actually look for — how they interpret 'adequate' and 'appropriate' in the context of your specific facility — comes from real survey experience. We use AI to stay current on regulatory changes, and human expertise to interpret what they mean for your operation.",
              },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{ background: "#0D1520", border: "1px solid #1E2A3A", borderRadius: 16, padding: 28 }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{icon}</div>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 800, color: "#F1F5F9", marginBottom: 12, lineHeight: 1.3 }}>{title}</h3>
                <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.8 }}>{body}</p>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div style={{ background: "#0D1520", border: "1px solid #1E2A3A", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#080E18", padding: "16px 24px", borderBottom: "1px solid #1E2A3A" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>What You Need</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>AI Alone</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#C9A84C", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>Phase 2 (AI + Expert)</span>
            </div>
            {[
              { need: "Facility-specific protocols", ai: "Generic starting point", p2: "Customizable + expert-reviewed" },
              { need: "CMS §494.62 alignment", ai: "May cite wrong standards", p2: "Built around ESRD requirements" },
              { need: "Dialysis-specific scenarios", ai: "General healthcare content", p2: "Dialysis-only clinical protocols" },
              { need: "Surveyor-ready documentation", ai: "Unpredictable outcome", p2: "Reviewed by CEM, CHEP, CHEC" },
              { need: "Professional accountability", ai: "No credentials attached", p2: "Certified review included" },
              { need: "Regulatory interpretation", ai: "Based on public documents", p2: "15+ years of real survey experience" },
            ].map(({ need, ai, p2 }, i) => (
              <div key={need} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "14px 24px", borderBottom: i < 5 ? "1px solid #1A2535" : "none", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>{need}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  <span style={{ fontSize: 11, color: "#64748B" }}>—</span>
                  <span style={{ fontSize: 13, color: "#475569" }}>{ai}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  <span style={{ fontSize: 11, color: "#C9A84C" }}>✓</span>
                  <span style={{ fontSize: 13, color: "#94A3B8" }}>{p2}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 36 }}>
            <p style={{ fontSize: 15, color: "#475569", marginBottom: 20, fontWeight: 300 }}>
              The best tools in the hands of the right expert. That's what your patients deserve.
            </p>
            <button className="btn btn-blue" style={{ padding: "14px 32px", fontSize: 15 }} onClick={() => scrollTo("pricing")}>
              See the Bundle →
            </button>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── HOW IT WORKS ── */}
      <section id="bundle" style={{ padding: "80px 40px", background: "#F8FAFC" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <Tag color="#10B981">The Process</Tag>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 38, fontWeight: 900, color: "#0F172A", marginTop: 14, marginBottom: 14, letterSpacing: "-0.02em" }}>
              From Purchase to Survey-Ready
            </h2>
            <p style={{ fontSize: 16, color: "#64748B", maxWidth: 560, margin: "0 auto", fontWeight: 300, lineHeight: 1.7 }}>
              A clear, straightforward process — built around your schedule, not ours. Every step moves forward when you're ready.
            </p>
          </div>

          {/* Timeline */}
          <div style={{ position: "relative", maxWidth: 800, margin: "0 auto 60px" }}>
            {/* Vertical line */}
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "linear-gradient(180deg, #1B2F4E, #C9A84C, #10B981)", transform: "translateX(-50%)", zIndex: 0 }} />

            {[
              {
                step: "01",
                side: "left",
                icon: "🛒",
                title: "Purchase the Bundle",
                time: "Step 1",
                color: "#1B2F4E",
                desc: "You receive the complete All-Hazards EOP template package — all 9 components, fully editable Word documents, and a welcome guide walking you through the customization process.",
              },
              {
                step: "02",
                side: "right",
                icon: "✏️",
                title: "Customize Your Plan",
                time: "Step 2",
                color: "#2D6A4F",
                desc: "Using the provided customization guide, you fill in your facility-specific details — generator capacity, vendor contacts, receiving facility agreements, staff call trees, and local hazard information.",
              },
              {
                step: "03",
                side: "left",
                icon: "📤",
                title: "Submit for Personal Review",
                time: "Step 3",
                color: "#C9A84C",
                desc: "You submit your completed plan to Christopher Miles, MA, CEM, CHEP, CHEC for personal review. Every plan is individually examined — not routed through a generic review process.",
              },
              {
                step: "04",
                side: "right",
                icon: "🔍",
                title: "Expert Review & Feedback",
                time: "Step 4",
                color: "#0EA5E9",
                desc: "Christopher personally reviews your plan against CMS §494.62 and CMS Appendix Z surveyor guidance. You receive written feedback via email, any recommended revisions, and a review summary — Review begins once your completed plan is submitted.",
              },
              {
                step: "05",
                side: "left",
                icon: "🏅",
                title: "Certificate of Personal Review Issued",
                time: "Step 5",
                color: "#8B5CF6",
                desc: "Once your plan meets the review criteria, your Certificate of Personal Plan Review is issued — signed by Christopher Miles, MA, CEM, CHEP, CHEC, with your facility name, review date, and certificate number.",
              },
              {
                step: "06",
                side: "right",
                icon: "✅",
                title: "Survey-Ready",
                time: "Step 6",
                color: "#10B981",
                desc: "Your plan, your certificate, and your documentation are ready. You have everything a CMS surveyor expects to see — organized, compliant, and backed by a credentialed professional review.",
              },
            ].map(({ step, side, icon, title, time, color, desc }, i) => (
              <div key={step} style={{ display: "flex", alignItems: "center", marginBottom: 40, flexDirection: side === "left" ? "row" : "row-reverse", position: "relative", zIndex: 1 }}>
                {/* Content card */}
                <div style={{ width: "calc(50% - 40px)", background: "#fff", border: `1px solid ${color}30`, borderRadius: 14, padding: "20px 24px", boxShadow: "0 2px 12px #0F172A08" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 22 }}>{icon}</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{title}</p>
                      <p style={{ fontSize: 11, color, fontWeight: 600 }}>{time}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>{desc}</p>
                </div>

                {/* Center circle */}
                <div style={{ width: 80, flexShrink: 0, display: "flex", justifyContent: "center", zIndex: 2 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 4px #F8FAFC, 0 0 0 6px ${color}40` }}>
                    <span style={{ fontFamily: "'Fraunces', serif", fontSize: 13, fontWeight: 900, color: "#fff" }}>{step}</span>
                  </div>
                </div>

                {/* Spacer for opposite side */}
                <div style={{ width: "calc(50% - 40px)" }} />
              </div>
            ))}
          </div>

          {/* What's included strip */}
          <div style={{ background: "#0F172A", borderRadius: 16, padding: "32px 40px" }}>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 800, color: "#F8FAFC", textAlign: "center", marginBottom: 24 }}>Everything Included in the Bundle</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
              {[
                "Complete all-hazards EOP — 9 components",
                "Communications plan per §494.62(c)",
                "Staffing & volunteer management plan",
                "Continuity of operations plan",
                "Training & exercise program framework",
                "Tabletop exercise scenario template",
                "After-action report template",
                "HVA worksheet per §494.62(a)(1)",
                "30-day email support",
                "Certificate of Personal Plan Review",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "#C9A84C", fontSize: 12, marginTop: 2, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#475569", marginBottom: 16 }}>All templates delivered as fully editable Word documents. Customize with your facility-specific details.</p>
              <button className="btn btn-gold" onClick={() => scrollTo("pricing")} style={{ padding: "13px 32px", fontSize: 14 }}>Request the Bundle — $897 →</button>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <Tag color="#8B5CF6">Pricing</Tag>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 38, fontWeight: 900, color: "#0F172A", marginTop: 14, marginBottom: 14, letterSpacing: "-0.02em" }}>
            Simple, Transparent Pricing
          </h2>
          <p style={{ fontSize: 16, color: "#64748B", maxWidth: 500, margin: "0 auto", fontWeight: 300, lineHeight: 1.7 }}>
            Transparent pricing built around your facility's needs — from a single-location clinic to a multi-site network.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {PRICING.map((plan) => (
            <div key={plan.id} className={`pricing-card ${plan.highlight ? "highlight" : ""}`}>
              <div style={{ marginBottom: 16 }}>
                <Tag color={plan.highlight ? "#38BDF8" : plan.tagColor}>{plan.tag}</Tag>
              </div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 800, color: plan.highlight ? "#F8FAFC" : "#0F172A", marginBottom: 8 }}>{plan.name}</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 14 }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 900, color: plan.highlight ? "#38BDF8" : "#0F172A" }}>{plan.price}</span>
                <span style={{ fontSize: 13, color: plan.highlight ? "#64748B" : "#94A3B8" }}>/{plan.per}</span>
              </div>
              <p style={{ fontSize: 12, color: plan.highlight ? "#94A3B8" : "#64748B", lineHeight: 1.6, marginBottom: 20 }}>{plan.desc}</p>
              <div style={{ marginBottom: 24 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 9 }}>
                    <div style={{ width: 15, height: 15, borderRadius: "50%", background: plan.highlight ? "#0EA5E920" : "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <span style={{ fontSize: 8, color: plan.highlight ? "#38BDF8" : "#10B981", fontWeight: 700 }}>✓</span>
                    </div>
                    <span style={{ fontSize: 12, color: plan.highlight ? "#CBD5E1" : "#475569", lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
              <button className={`btn ${plan.highlight ? "btn-blue" : "btn-primary"}`} style={{ width: "100%", padding: 12, textAlign: "center", fontSize: 13 }} onClick={() => scrollTo("contact")}>
                {plan.cta} →
              </button>
              {plan.id === "bundle" && (
                <button className="btn" style={{ width: "100%", padding: 9, textAlign: "center", marginTop: 8, background: "transparent", border: "1px solid #334155", color: "#64748B", fontSize: 11 }} onClick={() => setShowCert(true)}>
                  🏅 Preview Certificate of Plan Review
                </button>
              )}
            </div>
          ))}

          {/* Enterprise card */}
          <div className="pricing-card" style={{ background: "#F8FAFC", border: "1.5px solid #1B2F4E20" }}>
            <div style={{ marginBottom: 16 }}>
              <Tag color="#C9A84C">Enterprise</Tag>
            </div>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>Multi-Site & Chain</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 14 }}>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 900, color: "#1B2F4E" }}>Custom</span>
            </div>
            <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6, marginBottom: 20 }}>For regional groups and large chains with 2+ locations. Custom scoping, volume pricing, and dedicated compliance oversight across your entire network.</p>
            <div style={{ marginBottom: 24 }}>
              {[
                "Multi-site EOP development",
                "Standardized plan framework across locations",
                "Dedicated compliance retainer",
                "On-site or virtual tabletop exercises",
                "Staff training program development",
                "Executive compliance reporting",
                "Priority support & response",
                "Annual contract options available",
              ].map((f) => (
                <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 9 }}>
                  <div style={{ width: 15, height: 15, borderRadius: "50%", background: "#1B2F4E15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <span style={{ fontSize: 8, color: "#C9A84C", fontWeight: 700 }}>✓</span>
                  </div>
                  <span style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: "100%", padding: 12, textAlign: "center", fontSize: 13, background: "#1B2F4E" }} onClick={() => scrollTo("contact")}>
              Request a Quote →
            </button>
            <p style={{ fontSize: 10, color: "#94A3B8", textAlign: "center", marginTop: 10 }}>Retainers from $1,500/month</p>
          </div>
        </div>

        {/* Per-location note */}
        <div style={{ marginTop: 24 }}>
          <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>📍</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#C2410C", marginBottom: 4 }}>All pricing is per location</p>
              <p style={{ fontSize: 12, color: "#9A3412", lineHeight: 1.6 }}>Each dialysis facility requires its own Emergency Operations Plan under CMS §494.62. The Gap Assessment, EOP Bundle, and Ongoing Compliance Retainer are all priced per individual location. Organizations with multiple locations should <button onClick={() => scrollTo("contact")} style={{ background: "none", border: "none", color: "#C2410C", fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 12, textDecoration: "underline" }}>contact us for volume pricing →</button></p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 16, padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>Need tabletop exercise facilitation?</p>
            <p style={{ fontSize: 13, color: "#64748B" }}>Full-scale, functional, and tabletop exercises starting at $1,500. Required annually by CMS §494.62(d)(2). Contact us for a custom quote.</p>
          </div>
          <button className="btn btn-outline-blue" onClick={() => scrollTo("contact")}>Inquire About Tabletops</button>
        </div>
      </section>

      <SectionDivider />

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <Tag color="#0EA5E9">About Phase 2</Tag>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 38, fontWeight: 900, color: "#0F172A", marginTop: 14, marginBottom: 20, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Plans Written by Someone Who's Actually Used Them
            </h2>
            <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.9, marginBottom: 20, fontWeight: 300 }}>
              Phase 2 Preparedness Solutions is led by <strong style={{ color: "#0F172A", fontWeight: 600 }}>Christopher Miles, MA, CEM, CHEP, CHEC</strong> — a nationally credentialed emergency manager with 15+ years of hands-on experience across healthcare, higher education, and government.
            </p>
            <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.9, marginBottom: 32, fontWeight: 300 }}>
              Every plan is built from real activations, real surveys, and real lessons learned. When your surveyor arrives, you'll be ready.
            </p>

            {/* Sector badges */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
              {[
                { icon: "🏥", label: "Healthcare" },
                { icon: "🎓", label: "Higher Education" },
                { icon: "🏛️", label: "Government" },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 8, padding: "8px 14px" }}>
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0369A1" }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Credential badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                "MA — Emergency Management",
                "Certified Emergency Manager (CEM)",
                "Certified Healthcare Emergency Professional (CHEP)",
                "Certified Healthcare Emergency Coordinator (CHEC)",
              ].map((cert) => (
                <span key={cert} style={{ display: "inline-block", background: "#F0F9FF", border: "1px solid #BAE6FD", color: "#0369A1", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600 }}>{cert}</span>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div style={{ background: "#0F172A", borderRadius: 20, padding: 36 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#475569", marginBottom: 28 }}>By The Numbers</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 28 }}>
              {[
                { num: "15+", label: "Years in Emergency Management" },
                { num: "3", label: "Sectors: Healthcare, Gov't, Higher Ed" },
                { num: "100%", label: "Personally reviews every plan" },
                { num: "1", label: "Credentialed expert behind every certificate" },
              ].map(({ num, label }) => (
                <div key={label}>
                  <div className="stat-num" style={{ color: "#38BDF8", fontSize: 36 }}>{num}</div>
                  <p style={{ fontSize: 12, color: "#64748B", marginTop: 6, lineHeight: 1.4 }}>{label}</p>
                </div>
              ))}
            </div>
            <div style={{ paddingTop: 24, borderTop: "1px solid #1E293B" }}>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, fontStyle: "italic" }}>
                "Every plan that leaves Phase 2 has been personally reviewed by a credentialed emergency manager. That's not a marketing claim — it's a commitment backed by professional credentials and 15 years of real-world experience."
              </p>
              <p style={{ fontSize: 12, color: "#334155", marginTop: 12, fontWeight: 600 }}>— Christopher Miles, MA, CEM, CHEP, CHEC</p>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── CONTACT ── */}
      <section id="contact" style={{ background: "#F8FAFC", padding: "80px 40px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <Tag color="#10B981">Work With Us</Tag>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 900, color: "#0F172A", marginTop: 14, marginBottom: 12, letterSpacing: "-0.02em" }}>
              Let's Talk About Your Facility
            </h2>
            <p style={{ fontSize: 15, color: "#64748B", fontWeight: 300, lineHeight: 1.7 }}>
              Fill out the form below and Christopher will personally respond within 1–2 business days. Every engagement starts with a conversation — not a checkout page.
            </p>
          </div>
          <div className="card" style={{ padding: 36 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <input placeholder="Your name" />
              <input placeholder="Email address" type="email" />
              <input placeholder="Facility / organization name" />
              <select defaultValue="">
                <option value="" disabled>Facility type</option>
                {["Independent Dialysis Center", "Dialysis Chain / Regional Group", "Hospital-Based Dialysis Unit", "Home Dialysis Program", "Multi-Site Network (5+ locations)", "Other Healthcare Facility"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <select defaultValue="" style={{ marginBottom: 14 }}>
                <option value="" disabled>I'd like to…</option>
                {PRICING.map((p) => <option key={p.id}>Request: {p.name} — {p.price}/{p.per}</option>)}
                <option>Request: Tabletop Exercise Facilitation</option>
                <option>Request: Multi-Site / Enterprise Quote</option>
                <option>Not sure yet — I need guidance</option>
              </select>
              <textarea placeholder="Tell us about your facility — number of locations, upcoming surveys, or current planning status. The more detail you share, the better we can help." rows={4} style={{ resize: "vertical" }} />
            </div>
            <button className="btn btn-primary" style={{ width: "100%", padding: 14, fontSize: 15, textAlign: "center" }}>
              Submit Request →
            </button>
            <div style={{ marginTop: 18, display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
              <p style={{ fontSize: 12, color: "#94A3B8", display: "flex", alignItems: "center", gap: 6 }}>
                <span>📧</span> Personal response from Christopher within 1–2 business days
              </p>
              <p style={{ fontSize: 12, color: "#94A3B8", display: "flex", alignItems: "center", gap: 6 }}>
                <span>🔒</span> No payment until we've confirmed your scope
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CERTIFICATE MODAL ── */}
      {showCert && (
        <div style={{ position: "fixed", inset: 0, background: "#0F172AEE", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }} onClick={() => setShowCert(false)}>
          <div style={{ background: "#fff", borderRadius: 20, maxWidth: 760, width: "100%", overflow: "hidden", boxShadow: "0 32px 80px #00000080", margin: "auto" }} onClick={(e) => e.stopPropagation()}>

            {/* Header bar */}
            <div style={{ background: "#0F172A", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <svg width="36" height="36" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="44" height="44" rx="10" fill="#243A5C"/>
                  <rect x="2.5" y="2.5" width="39" height="39" rx="7.5" fill="none" stroke="#C9A84C" strokeWidth="1.8"/>
                  <text x="22" y="31" fontFamily="sans-serif" fontSize="22" fontWeight="700" fill="white" textAnchor="middle" letterSpacing="-1">P<tspan fill="#C9A84C" fontSize="18" dy="2">2</tspan></text>
                </svg>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 900, color: "#F8FAFC" }}>Phase 2 Preparedness Solutions</div>
                  <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase" }}>Certificate of Personal Plan Review</div>
                </div>
              </div>
              <button onClick={() => setShowCert(false)} style={{ background: "#1E293B", border: "none", color: "#64748B", width: 30, height: 30, borderRadius: 6, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>

            {/* Gold accent strip */}
            <div style={{ height: 4, background: "linear-gradient(90deg, #1B2F4E, #C9A84C, #1B2F4E)" }} />

            {/* Certificate body */}
            <div style={{ padding: "36px 48px", position: "relative", borderBottom: "1px solid #E2E8F0" }}>
              {/* Decorative corner borders */}
              <div style={{ position: "absolute", top: 16, left: 16, width: 40, height: 40, borderTop: "2px solid #C9A84C", borderLeft: "2px solid #C9A84C", borderRadius: "4px 0 0 0" }} />
              <div style={{ position: "absolute", top: 16, right: 16, width: 40, height: 40, borderTop: "2px solid #C9A84C", borderRight: "2px solid #C9A84C", borderRadius: "0 4px 0 0" }} />
              <div style={{ position: "absolute", bottom: 16, left: 16, width: 40, height: 40, borderBottom: "2px solid #C9A84C", borderLeft: "2px solid #C9A84C", borderRadius: "0 0 0 4px" }} />
              <div style={{ position: "absolute", bottom: 16, right: 16, width: 40, height: 40, borderBottom: "2px solid #C9A84C", borderRight: "2px solid #C9A84C", borderRadius: "0 0 4px 0" }} />

              {/* Certificate title */}
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <p style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 8 }}>Certificate of Personal Plan Review</p>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.02em", marginBottom: 4 }}>This is to certify that</h2>
                <div style={{ width: 60, height: 2, background: "#C9A84C", margin: "12px auto" }} />
              </div>

              {/* Facility name block */}
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "16px 32px", display: "inline-block" }}>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 900, color: "#0F172A", marginBottom: 4 }}>[FACILITY NAME]</p>
                  <p style={{ fontSize: 12, color: "#94A3B8" }}>[City, State] · CMS Certification No. [CCN]</p>
                </div>
              </div>

              {/* Personal review statement */}
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: "18px 24px", marginBottom: 20 }}>
                <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.8, textAlign: "center" }}>
                  has had its Emergency Operations Plan framework <strong>personally reviewed</strong> by the undersigned credentialed emergency management professional. The reviewer has individually examined this plan's structure, content, and organizational approach and determined that it is designed to address the emergency preparedness framework requirements of:
                </p>
              </div>

              {/* Standards badges */}
              <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                {[
                  "CMS §494.62 Emergency Preparedness",
                  "42 CFR Part 494 ESRD",
                  "CMS Appendix Z Surveyor Guidance",
                  "All-Hazards Approach per §494.62(a)(1)",
                  "NFPA 1600",
                ].map((s) => (
                  <span key={s} style={{ background: "#1B2F4E10", border: "1px solid #1B2F4E30", color: "#1B2F4E", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600 }}>{s}</span>
                ))}
              </div>

              {/* What was personally reviewed */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
                {[
                  { icon: "✓", label: "HVA Structure & Scope" },
                  { icon: "✓", label: "All-Hazards Coverage" },
                  { icon: "✓", label: "Communications Plan" },
                  { icon: "✓", label: "Staffing Framework" },
                  { icon: "✓", label: "Continuity of Operations" },
                  { icon: "✓", label: "Training & Exercise Plan" },
                ].map(({ icon, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "8px 12px" }}>
                    <span style={{ color: "#16A34A", fontSize: 12, fontWeight: 700 }}>{icon}</span>
                    <span style={{ fontSize: 12, color: "#166534", fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Signature area */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, paddingTop: 24, borderTop: "1px solid #E2E8F0" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ height: 48, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 6 }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 900, color: "#1B2F4E", borderBottom: "1.5px solid #1B2F4E", paddingBottom: 4, paddingRight: 8 }}>Christopher Miles</div>
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 2 }}>Christopher Miles, MA, CEM, CHEP, CHEC</p>
                  <p style={{ fontSize: 10, color: "#64748B", marginBottom: 2 }}>Founder & Principal Reviewer</p>
                  <p style={{ fontSize: 10, color: "#64748B" }}>Phase 2 Preparedness Solutions</p>
                  <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 8, flexWrap: "wrap" }}>
                    {["CEM", "CHEP", "CHEC"].map((c) => (
                      <span key={c} style={{ background: "#1B2F4E", color: "#C9A84C", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>{c}</span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ height: 48, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 6 }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "#94A3B8", borderBottom: "1.5px solid #E2E8F0", paddingBottom: 4, paddingRight: 8 }}>[Date of Review]</div>
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 2 }}>Date of Personal Review</p>
                  <p style={{ fontSize: 10, color: "#64748B", marginBottom: 2 }}>Annual review recommended per §494.62(a)</p>
                  <p style={{ fontSize: 10, color: "#64748B" }}>Certificate No: P2PS-[YEAR]-[ID]</p>
                </div>
              </div>
            </div>

            {/* Legal disclaimer — carefully worded */}
            <div style={{ padding: "20px 32px", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              <p style={{ fontSize: 10, color: "#94A3B8", lineHeight: 1.7, textAlign: "center" }}>
                <strong style={{ color: "#64748B" }}>Important Limitations & Disclaimer: </strong>
                This certificate confirms only that the named individual personally reviewed the structural framework and organizational approach of the Emergency Operations Plan templates provided by Phase 2 Preparedness Solutions against applicable emergency preparedness regulatory requirements. This certificate does not constitute legal advice, regulatory counsel, or a guarantee of survey compliance or accreditation outcome. It does not represent a warranty, express or implied, regarding the performance of any plan during an actual emergency. The facility remains solely responsible for customizing, implementing, maintaining, and exercising its emergency operations plan, for ensuring that all facility-specific information is accurate and current, and for achieving and maintaining regulatory compliance. Phase 2 Preparedness Solutions and Christopher Miles, MA, CEM, CHEP, CHEC, assume no liability for survey outcomes, regulatory findings, or emergency events. Facilities are encouraged to consult qualified legal counsel and their applicable accrediting or regulatory body regarding jurisdiction-specific compliance requirements.
              </p>
            </div>

            {/* CTA footer */}
            <div style={{ padding: "18px 32px", background: "#fff", display: "flex", gap: 10, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
              <p style={{ fontSize: 13, color: "#64748B", marginRight: 8 }}>Included with every All-Hazards EOP Bundle</p>
              <button className="btn btn-primary" style={{ padding: "10px 24px" }} onClick={() => scrollTo("pricing")}>Request the Bundle — $897 →</button>
              <button className="btn btn-secondary" style={{ padding: "10px 20px" }} onClick={() => setShowCert(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0F172A", padding: "36px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="40" height="40" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="44" height="44" rx="10" fill="#243A5C"/>
              <rect x="2.5" y="2.5" width="39" height="39" rx="7.5" fill="none" stroke="#C9A84C" strokeWidth="1.8"/>
              <text x="22" y="31" fontFamily="sans-serif" fontSize="22" fontWeight="700" fill="white" textAnchor="middle" letterSpacing="-1">P<tspan fill="#C9A84C" fontSize="18" dy="2">2</tspan></text>
            </svg>
            <div>
              <div style={{ fontFamily: "sans-serif", fontSize: 18, fontWeight: 700, color: "#E2E8F0", lineHeight: 1, letterSpacing: "-0.5px" }}>PHASE <span style={{ color: "#C9A84C" }}>2</span></div>
              <div style={{ fontFamily: "sans-serif", fontSize: 8, fontWeight: 500, color: "#4A6FA5", letterSpacing: "2.5px", lineHeight: 1, marginTop: 3 }}>PREPAREDNESS SOLUTIONS</div>
              <div style={{ width: "100%", height: 1, background: "#C9A84C", opacity: 0.3, margin: "2px 0" }} />
              <div style={{ fontFamily: "sans-serif", fontSize: 7, color: "#334155", letterSpacing: "1px", lineHeight: 1 }}>EXPERT PLANNING. PROVEN COMPLIANCE.</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[["solutions","Solutions"],["bundle","The Process"],["pricing","Pricing"],["about","About"],["contact","Contact"]].map(([id, label]) => (
              <button key={id} style={{ background: "none", border: "none", fontSize: 13, color: "#475569", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }} onClick={() => scrollTo(id)}>
                {label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#334155" }}>© 2026 Phase 2 Preparedness Solutions · phase2prep.com</p>
        </div>
      </footer>
    </div>
  );
}
