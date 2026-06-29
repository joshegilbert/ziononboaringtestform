/* ob-data.jsx — Zion plan catalog + onboarding constants.
   Sample rates are placeholders; clearly labeled in the UI as confirmable. */

// Coverage tiers used across all plans
const TIERS = [
  { id: "mo", short: "EE", label: "Member only" },
  { id: "es", short: "EE + Spouse", label: "Member + Spouse" },
  { id: "ec", short: "EE + Child(ren)", label: "Member + Child(ren)" },
  { id: "fam", short: "Family", label: "Family" },
];

// Core medical programs — choose the IUA (Initial Unshared Amount) level.
const MEDICAL_PLANS = [
  {
    id: "hs-1250",
    group: "Zion HealthShare",
    name: "Zion HealthShare — $1,250 IUA",
    blurb: "Lowest Initial Unshared Amount — members pay less per medical need before sharing begins.",
    tag: "Most chosen",
    note: "~70% of groups pick this level",
  },
  {
    id: "hs-2500",
    group: "Zion HealthShare",
    name: "Zion HealthShare — $2,500 IUA",
    blurb: "A balanced middle option between monthly cost and per-need responsibility.",
  },
  {
    id: "hs-5000",
    group: "Zion HealthShare",
    name: "Zion HealthShare — $5,000 IUA",
    blurb: "Highest IUA — members take on more per need in exchange for a lower monthly cost.",
  },
];

// Optional add-on programs the group can layer on
const ADDON_PLANS = [
  {
    id: "preventive",
    group: "Add-ons",
    name: "Preventive Sharing Add-On",
    blurb: "Sharing for routine wellness visits, screenings, and preventive care.",
  },
  {
    id: "rx",
    group: "Add-ons",
    name: "RX Sharing Add-On",
    blurb: "Help with eligible prescription medication costs.",
  },
  {
    id: "virtual",
    group: "Add-ons",
    name: "Virtual Care Add-On",
    blurb: "24/7 access to physicians by phone or video.",
  },
];

const ALL_PLANS = [...MEDICAL_PLANS, ...ADDON_PLANS];
const planById = (id) => ALL_PLANS.find((p) => p.id === id);

const INDUSTRIES = [
  "Construction & Trades", "Healthcare & Dental", "Professional Services",
  "Retail & Hospitality", "Manufacturing", "Transportation & Logistics",
  "Technology", "Nonprofit & Faith-based", "Agriculture", "Education", "Other",
];

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

// Account Executives (managed list — admin can add/remove on the dashboard)
const AES_LS = "zion_aes_v1";
const DEFAULT_AES = ["Cameron Morris", "Hayley DeHaan"];
function loadAEs() {
  try { const a = JSON.parse(localStorage.getItem(AES_LS)); return Array.isArray(a) && a.length ? a : DEFAULT_AES.slice(); }
  catch { return DEFAULT_AES.slice(); }
}
function saveAEs(list) { try { localStorage.setItem(AES_LS, JSON.stringify(list)); } catch {} }
// the form's referral dropdown shows managed AEs plus a catch-all
function referralOptions() { return [...loadAEs(), "Not sure / other"]; }
const ACCOUNT_EXECS = referralOptions();

// Default employee class templates offered as quick-add chips
const CLASS_TEMPLATES = [
  "Full-time",
  "Management",
  "Owners & Executives",
  "Part-time",
  "Seasonal",
];

// The next-steps shown on the confirmation screen, mirroring the email sequence
const NEXT_STEPS = [
  { t: "Contract for signature", d: "Your Benefit Manager sends your group contract (BSA) via Adobe for e-signature." },
  { t: "Meet your Benefit Manager", d: "A short call to review your employer portal and confirm setup is accurate." },
  { t: "Add employees & enroll", d: "Upload your census or add employees, then enrollment invitations go out." },
];

// New form fields (from the legacy Microsoft Form)
const WAITING_PERIODS = ["No waiting period", "30 days", "60 days", "90 days"];
const PAYROLL_SCHEDULES = ["Weekly", "Every two weeks (biweekly)", "Twice a month (semi-monthly)", "Monthly"];
const PAST_BENEFITS = [
  "We have not offered benefits before",
  "We offered traditional insurance as a company",
  "We offered another health share as a company (1+ year)",
  "Other",
];

// ---- shared store: completed group submissions (form -> dashboard) ----
const GROUPS_LS = "zion_groups_v1";
function loadGroups() {
  try { const g = JSON.parse(localStorage.getItem(GROUPS_LS)); return Array.isArray(g) ? g : []; }
  catch { return []; }
}
function saveGroups(list) { try { localStorage.setItem(GROUPS_LS, JSON.stringify(list)); } catch {} }
function appendGroup(form) {
  const list = loadGroups();
  // auto-assign Benefit Manager from routing rules (referrer + state), if any
  let autoBM = "";
  try {
    const resolver = window.resolveRule || window.resolveBooking;
    const r = resolver ? resolver(window.loadRouting ? window.loadRouting() : [], form.accountExec, form.address && form.address.state) : null;
    if (r && r.bmName) autoBM = r.bmName;
  } catch (e) {}
  const rec = {
    id: "g" + Date.now().toString(36),
    submittedAt: new Date().toISOString(),
    source: "form",
    form: JSON.parse(JSON.stringify(form)),
    // internal tracking fields (staff-editable on the dashboard)
    status: "new",
    benefitManager: autoBM,
    enrollmentNotes: "",
    buildCompleted: "",
    enrolledCount: 0,
    oeTimeline: "",
  };
  saveGroups([rec, ...list]);
  return rec;
}

Object.assign(window, {
  TIERS, MEDICAL_PLANS, ADDON_PLANS, ALL_PLANS, planById,
  INDUSTRIES, US_STATES, ACCOUNT_EXECS, CLASS_TEMPLATES, NEXT_STEPS,
  WAITING_PERIODS, PAYROLL_SCHEDULES, PAST_BENEFITS,
  GROUPS_LS, loadGroups, saveGroups, appendGroup,
  loadBMs, saveBMs, loadAEs, saveAEs, referralOptions,
});

// ---- managed Benefit Manager list (shared by routing + dashboard) ----
const BMS_LS = "zion_bms_v1";
const DEFAULT_BMS = ["Crystal Jessop", "Jeff Burnett", "Tim Garden", "Aaron Adams", "Josh Gilbert"];
function loadBMs() {
  try { const b = JSON.parse(localStorage.getItem(BMS_LS)); return Array.isArray(b) && b.length ? b : DEFAULT_BMS.slice(); }
  catch { return DEFAULT_BMS.slice(); }
}
function saveBMs(list) { try { localStorage.setItem(BMS_LS, JSON.stringify(list)); } catch {} }
window.loadBMs = loadBMs; window.saveBMs = saveBMs;
window.loadAEs = loadAEs; window.saveAEs = saveAEs; window.referralOptions = referralOptions;
