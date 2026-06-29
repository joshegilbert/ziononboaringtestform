/* dash-data.jsx — sample groups + helpers for the staff dashboard.
   A "group" record = { id, submittedAt, source, form, + internal tracking fields }.
   form shape matches the onboarding form's DEFAULT_FORM. */

const STATUSES = [
  { id: "new", label: "New", color: "#2563a8", tint: "#e8f0fa" },
  { id: "building", label: "Building", color: "#a8632f", tint: "#f8eee3" },
  { id: "enrolling", label: "Open enrollment", color: "#1f8a5b", tint: "#e6f4ec" },
  { id: "processing", label: "Processing", color: "#b08415", tint: "#f7f0dd" },
  { id: "complete", label: "Complete", color: "#0c7a5a", tint: "#e0f1ea" },
  { id: "archived", label: "Archived", color: "#8a8f93", tint: "#eef0f1" },
];
const statusById = (id) => STATUSES.find((s) => s.id === id) || STATUSES[0];
// the two terminal outcomes that leave the active pipeline
const CLOSED_STATUSES = ["complete", "archived"];
const isClosed = (id) => CLOSED_STATUSES.includes(id);

// Per-group document checklist (replaces a pipeline stage for BSA/census)
const DOC_CHECKS = [
  { key: "bsaSent", label: "BSA sent", short: "BSA out" },
  { key: "bsaBack", label: "BSA signed & returned", short: "BSA back" },
  { key: "censusSent", label: "Census requested", short: "Census out" },
  { key: "censusBack", label: "Census received", short: "Census in" },
];

// Processing-step checklist (after open enrollment closes)
const STEP_CHECKS = [
  { key: "payrollSent", label: "Payroll deductions sent", short: "Payroll" },
  { key: "invoiceConfirmed", label: "Invoice confirmed", short: "Invoice" },
];

const BENEFIT_MANAGERS = ["Canen Hastings", "Maria Lopez", "Derek Pope", "Aisha Bello"];

// ---- sample data ----
function mkForm(o) {
  return {
    legalName: o.legalName, dba: "", ein: o.ein || "", industry: o.industry, employeeCount: String(o.emp), website: "",
    address: { street: o.street || "", city: o.city, state: o.state, zip: o.zip || "" },
    primaryContact: { firstName: o.cf, lastName: o.cl, title: o.ct || "", phone: o.phone, email: o.email },
    billingSame: true, accountExec: o.ae,
    waitingPeriod: o.wait, languageNeeds: o.lang || "", payrollSchedule: o.pay, payrollProvider: o.provider || "",
    payrollIntegration: o.integ, pastBenefits: o.past,
    effectiveDate: o.eff, selectedPlans: o.plans,
    classes: o.classes || [], contributions: o.contributions || {},
  };
}

const SAMPLE_GROUPS = [
  {
    id: "g_sample1", submittedAt: "2026-06-02T15:21:00Z", source: "form",
    status: "complete", benefitManager: "", checks: { bsaSent: true, bsaBack: true, censusSent: true, censusBack: true, payrollSent: true, invoiceConfirmed: true },
    enrollmentNotes: "Owner wants ID cards mailed. Confirmed census matches 18.", buildCompleted: "2026-06-05", closedAt: "2026-06-16",
    enrolledCount: 16, enrolledPlans: 22, oeTimeline: "Closed 6/15", processing: "Complete",
    form: mkForm({ legalName: "Summit Builders LLC", ein: "84-1102931", industry: "Construction & Trades", emp: 18, city: "Provo", state: "UT", zip: "84601", cf: "Dana", cl: "Reed", ct: "Owner", phone: "(801) 555-0142", email: "dana@summitbuilders.com", ae: "Hayley DeHaan", wait: "30 days", pay: "Every two weeks (biweekly)", provider: "Gusto", integ: "Yes", past: "We had traditional insurance", eff: "2026-06-01", plans: ["hs-1250", "rx"], classes: [{ id: "c1", name: "Field Crew" }, { id: "c2", name: "Office" }], contributions: { c1: { "hs-1250": { method: "fixed", mo: "300", es: "300", ec: "300", fam: "300" }, "rx": { method: "fixed", mo: "20", es: "20", ec: "20", fam: "20" } }, c2: { "hs-1250": { method: "fixed", mo: "400", es: "400", ec: "400", fam: "400" }, "rx": { method: "fixed", mo: "20", es: "20", ec: "20", fam: "20" } } } }),
  },
  {
    id: "g_sample2", submittedAt: "2026-06-10T18:05:00Z", source: "form",
    status: "enrolling", benefitManager: "", checks: { bsaSent: true, bsaBack: true, censusSent: true, censusBack: true },
    enrollmentNotes: "Spanish enrollment session scheduled 6/24.", buildCompleted: "2026-06-12",
    enrolledCount: 9, enrolledPlans: 13, oeTimeline: "6/20–7/3", processing: "Sending invites",
    form: mkForm({ legalName: "Vista Landscaping Co.", ein: "47-2210984", industry: "Agriculture", emp: 31, city: "Mesa", state: "AZ", zip: "85201", cf: "Marco", cl: "Ruiz", ct: "HR Lead", phone: "(480) 555-0173", email: "marco@vistaland.com", ae: "Cameron Morris", wait: "60 days", lang: "Spanish — 12 employees", pay: "Weekly", provider: "ADP", integ: "Yes", past: "We have not offered benefits before", eff: "2026-07-01", plans: ["hs-2500", "rx", "virtual"], classes: [], contributions: { __all: { "hs-2500": { method: "percent", mo: "50", es: "50", ec: "50", fam: "50" }, "rx": { method: "fixed", mo: "15", es: "15", ec: "15", fam: "15" }, "virtual": { method: "fixed", mo: "12", es: "12", ec: "12", fam: "12" } } } }),
  },
  {
    id: "g_sample3", submittedAt: "2026-06-14T13:44:00Z", source: "form",
    status: "building", benefitManager: "", checks: { bsaSent: true, bsaBack: false, censusSent: true, censusBack: false },
    enrollmentNotes: "Waiting on EIN confirmation. Payroll integration TBD.", buildCompleted: "",
    enrolledCount: 0, enrolledPlans: 0, oeTimeline: "TBD", processing: "Building portal",
    form: mkForm({ legalName: "Northgate Dental", ein: "", industry: "Healthcare & Dental", emp: 12, city: "Boise", state: "ID", zip: "83702", cf: "Priya", cl: "Shah", ct: "Office Manager", phone: "(208) 555-0190", email: "priya@northgatedental.com", ae: "Hayley DeHaan", wait: "90 days", pay: "Twice a month (semi-monthly)", provider: "QuickBooks", integ: "Not sure", past: "We had another health share (1+ year)", eff: "2026-08-01", plans: ["hs-2500", "preventive"], classes: [], contributions: { __all: { "hs-2500": { method: "fixed", mo: "250", es: "250", ec: "250", fam: "250" }, "preventive": { method: "fixed", mo: "10", es: "10", ec: "10", fam: "10" } } } }),
  },
  {
    id: "g_sample4", submittedAt: "2026-06-18T20:12:00Z", source: "form",
    status: "new", benefitManager: "", checks: {},
    enrollmentNotes: "", buildCompleted: "",
    enrolledCount: 0, enrolledPlans: 0, oeTimeline: "", processing: "",
    form: mkForm({ legalName: "Cedar & Co. Roasters", ein: "82-4419087", industry: "Retail & Hospitality", emp: 7, city: "Salt Lake City", state: "UT", zip: "84101", cf: "Eli", cl: "Tan", ct: "Founder", phone: "(385) 555-0128", email: "eli@cedarroasters.com", ae: "Hayley DeHaan", wait: "No waiting period", pay: "Every two weeks (biweekly)", provider: "Square Payroll", integ: "No", past: "We have not offered benefits before", eff: "2026-08-01", plans: ["hs-5000", "virtual"], classes: [], contributions: { __all: { "hs-5000": { method: "fixed", mo: "150", es: "150", ec: "150", fam: "150" }, "virtual": { method: "fixed", mo: "12", es: "12", ec: "12", fam: "12" } } } }),
  },
  {
    id: "g_sample5", submittedAt: "2026-05-28T16:30:00Z", source: "form",
    status: "complete", benefitManager: "", checks: { bsaSent: true, bsaBack: true, censusSent: true, censusBack: true, payrollSent: true, invoiceConfirmed: true },
    enrollmentNotes: "Renewal group, smooth. No issues.", buildCompleted: "2026-06-01", closedAt: "2026-06-11",
    enrolledCount: 44, enrolledPlans: 61, oeTimeline: "Closed 6/10", processing: "Complete",
    form: mkForm({ legalName: "Harbor Logistics Inc.", ein: "31-0998123", industry: "Transportation & Logistics", emp: 52, city: "Reno", state: "NV", zip: "89501", cf: "Tom", cl: "Becker", ct: "VP Ops", phone: "(775) 555-0166", email: "tom@harborlogistics.com", ae: "Cameron Morris", wait: "30 days", pay: "Weekly", provider: "Paychex", integ: "Yes", past: "We had traditional insurance", eff: "2026-06-01", plans: ["hs-1250", "hs-2500", "rx", "virtual"], classes: [{ id: "c1", name: "Drivers" }, { id: "c2", name: "Dispatch & Admin" }], contributions: { c1: { "hs-1250": { method: "percent", mo: "60", es: "60", ec: "60", fam: "60" } }, c2: { "hs-2500": { method: "fixed", mo: "275", es: "275", ec: "275", fam: "275" } } } }),
  },
  {
    id: "g_sample6", submittedAt: "2026-06-20T14:02:00Z", source: "form",
    status: "archived", benefitManager: "", checks: { bsaSent: true, bsaBack: false, censusSent: true, censusBack: false },
    enrollmentNotes: "BSA sent 6/21 via Adobe. Awaiting signature + census back.", buildCompleted: "", closedAt: "2026-06-28", archiveReason: "Unresponsive — no reply to BSA follow-ups (3 attempts since 6/21).",
    enrolledCount: 0, enrolledPlans: 0, oeTimeline: "TBD", processing: "Awaiting documents",
    form: mkForm({ legalName: "Bright Path Academy", ein: "26-3380291", industry: "Education", emp: 9, city: "Eugene", state: "OR", zip: "97401", cf: "Rachel", cl: "Nguyen", ct: "Director", phone: "(541) 555-0119", email: "rachel@brightpath.org", ae: "Hayley DeHaan", wait: "60 days", pay: "Monthly", provider: "Rippling", integ: "Not sure", past: "Other", eff: "2026-09-01", plans: ["hs-2500", "preventive", "rx"], classes: [], contributions: { __all: { "hs-2500": { method: "fixed", mo: "200", es: "200", ec: "200", fam: "200" } } } }),
  },
  {
    id: "g_sample7", submittedAt: "2026-06-08T11:15:00Z", source: "form",
    status: "processing", benefitManager: "", checks: { bsaSent: true, bsaBack: true, censusSent: true, censusBack: true, payrollSent: false, invoiceConfirmed: false },
    enrollmentNotes: "OE closed 6/22. 11 of 14 enrolled. Reviewing waivers.", buildCompleted: "2026-06-04",
    enrolledCount: 11, enrolledPlans: 15, oeTimeline: "Closed 6/22", processing: "Reviewing waivers",
    form: mkForm({ legalName: "Granite Peak Outfitters", ein: "55-1209384", industry: "Retail & Hospitality", emp: 14, city: "Bozeman", state: "MT", zip: "59715", cf: "Sam", cl: "Whitfield", ct: "Owner", phone: "(406) 555-0151", email: "sam@granitepeak.com", ae: "Cameron Morris", wait: "30 days", pay: "Every two weeks (biweekly)", provider: "Gusto", integ: "Yes", past: "We had traditional insurance", eff: "2026-07-01", plans: ["hs-1250", "rx", "virtual"], classes: [], contributions: { __all: { "hs-1250": { method: "fixed", mo: "350", es: "350", ec: "350", fam: "350" }, "rx": { method: "fixed", mo: "20", es: "20", ec: "20", fam: "20" }, "virtual": { method: "fixed", mo: "12", es: "12", ec: "12", fam: "12" } } } }),
  },
  {
    id: "g_sample8", submittedAt: "2026-06-06T09:40:00Z", source: "form",
    status: "processing", benefitManager: "", checks: { bsaSent: true, bsaBack: true, censusSent: true, censusBack: true, payrollSent: true, invoiceConfirmed: false },
    enrollmentNotes: "Sending final roster to underwriting. ID cards in production.", buildCompleted: "2026-06-03",
    enrolledCount: 27, enrolledPlans: 38, oeTimeline: "Closed 6/18", processing: "Finalizing with underwriting",
    form: mkForm({ legalName: "Lakeside Manufacturing", ein: "39-7741022", industry: "Manufacturing", emp: 33, city: "Spokane", state: "WA", zip: "99201", cf: "Greg", cl: "Olsen", ct: "HR Director", phone: "(509) 555-0188", email: "greg@lakesidemfg.com", ae: "Hayley DeHaan", wait: "90 days", pay: "Twice a month (semi-monthly)", provider: "Paylocity", integ: "Yes", past: "We had another health share (1+ year)", eff: "2026-07-01", plans: ["hs-2500", "hs-5000", "rx"], classes: [{ id: "c1", name: "Plant" }, { id: "c2", name: "Office" }], contributions: { c1: { "hs-2500": { method: "fixed", mo: "300", es: "300", ec: "300", fam: "300" } }, c2: { "hs-5000": { method: "fixed", mo: "220", es: "220", ec: "220", fam: "220" } } } }),
  },
];

// ---- delete (hide) groups: persist a list of removed ids ----
const DELETED_LS = "zion_deleted_v1";
function loadDeleted() { try { const d = JSON.parse(localStorage.getItem(DELETED_LS)); return Array.isArray(d) ? d : []; } catch { return []; } }
function deleteGroup(id) {
  // remove from persisted submissions if present, and remember the id so samples stay hidden too
  try {
    const persisted = (window.loadGroups ? window.loadGroups() : []).filter((g) => g.id !== id);
    if (window.saveGroups) window.saveGroups(persisted);
  } catch {}
  const del = loadDeleted();
  if (!del.includes(id)) { del.push(id); try { localStorage.setItem(DELETED_LS, JSON.stringify(del)); } catch {} }
}

// merge persisted submissions (from the form) ahead of samples, minus deleted, with staff edits applied
function allGroups() {
  const persisted = (window.loadGroups ? window.loadGroups() : []);
  const del = loadDeleted();
  const edits = loadFormEdits();
  return [...persisted, ...SAMPLE_GROUPS]
    .filter((g) => !del.includes(g.id))
    .map((g) => (edits[g.id] ? { ...g, form: edits[g.id] } : g));
}

// ---- staff edits to a group's submitted form (works for samples + submissions) ----
const FORM_EDITS_LS = "zion_group_form_edits_v1";
function loadFormEdits() { try { return JSON.parse(localStorage.getItem(FORM_EDITS_LS)) || {}; } catch { return {}; } }
function saveFormEdit(id, form) { const e = loadFormEdits(); e[id] = form; try { localStorage.setItem(FORM_EDITS_LS, JSON.stringify(e)); } catch {} }

// ---- field accessors for table/detail ----
const planNames = (g) => (g.form.selectedPlans || []).map((id) => { const p = window.planById(id); return p ? p.name.replace("Zion HealthShare — ", "").replace(" Add-On", "") : id; });
const classNames = (g) => (g.form.classes || []).map((c) => c.name);
const contribSummary = (g) => {
  const c = g.form.contributions || {};
  const units = (g.form.classes || []).length ? g.form.classes : [{ id: "__all", name: "All" }];
  const parts = [];
  units.forEach((u) => {
    const data = c[u.id] || {};
    (g.form.selectedPlans || []).forEach((pid) => {
      const v = data[pid]; if (!v) return;
      const p = window.planById(pid); const amt = v.method === "percent" ? `${v.mo || 0}%` : `$${v.mo || 0}`;
      parts.push(`${p ? p.name.split(" — ")[0].replace("Zion HealthShare", "HS").replace(" Add-On", "") : pid}: ${amt}`);
    });
  });
  return parts.join(" · ");
};
const fmtDate = (iso) => { if (!iso) return ""; const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); };

// enrollment tracker: total eligible (from form, overridable) + how many enrolled
function enrollmentOf(g, metaRec) {
  const m = metaRec || {};
  const totalRaw = (m.totalEmployees != null && m.totalEmployees !== "") ? m.totalEmployees
    : (g.totalEmployees != null && g.totalEmployees !== "") ? g.totalEmployees
    : g.form.employeeCount;
  const total = Number(totalRaw) || 0;
  const enrolledRaw = (m.enrolledCount != null && m.enrolledCount !== "") ? m.enrolledCount
    : (g.enrolledCount != null ? g.enrolledCount : 0);
  const enrolled = Number(enrolledRaw) || 0;
  const pct = total > 0 ? Math.min(100, Math.round((enrolled / total) * 100)) : 0;
  return { enrolled, total, pct };
}

// count of completed checks in a list
function checkProgress(checks, list) {
  const c = checks || {};
  const done = list.filter((d) => c[d.key]).length;
  return { done, total: list.length };
}

Object.assign(window, {
  STATUSES, statusById, CLOSED_STATUSES, isClosed, BENEFIT_MANAGERS, SAMPLE_GROUPS, allGroups,
  DOC_CHECKS, STEP_CHECKS, deleteGroup, enrollmentOf, checkProgress,
  loadFormEdits, saveFormEdit,
  planNames, classNames, contribSummary, fmtDate,
});
