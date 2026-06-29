/* dash-app.jsx — staff groups dashboard: spreadsheet table, filters,
   inline-editable internal columns, status pipeline, detail drawer, BM routing. */

const { useState, useEffect, useMemo } = React;
const META_LS = "zion_group_meta_v1";
const USER_LS = "zion_current_user_v1";
const STAFF = ["Canen Hastings", "Maria Lopez", "Derek Pope", "Aisha Bello", "Cameron Morris", "Hayley DeHaan"];

function loadMeta() { try { return JSON.parse(localStorage.getItem(META_LS)) || {}; } catch { return {}; } }
function saveMeta(m) { try { localStorage.setItem(META_LS, JSON.stringify(m)); } catch {} }

const CUSTOMCOLS_LS = "zion_custom_cols_v1";
function loadCustomCols() { try { return JSON.parse(localStorage.getItem(CUSTOMCOLS_LS)) || []; } catch { return []; } }
function saveCustomCols(c) { try { localStorage.setItem(CUSTOMCOLS_LS, JSON.stringify(c)); } catch {} }

// set a nested value by dot-path (e.g. "primaryContact.phone") immutably
function setByPath(obj, path, value) {
  const keys = path.split(".");
  const next = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur = next;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    cur[k] = (cur[k] && typeof cur[k] === "object") ? (Array.isArray(cur[k]) ? [...cur[k]] : { ...cur[k] }) : {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return next;
}

// client-submitted columns (now inline-editable where it makes sense)
const CLIENT_COLS = [
  { key: "ae", label: "Referred by", w: 140, get: (g) => g.form.accountExec, path: "accountExec", input: "select", options: () => window.ACCOUNT_EXECS },
  { key: "contact", label: "Contact", w: 140, get: (g) => [g.form.primaryContact?.firstName, g.form.primaryContact?.lastName].filter(Boolean).join(" ") },
  { key: "phone", label: "Phone", w: 130, get: (g) => g.form.primaryContact?.phone, path: "primaryContact.phone", input: "text" },
  { key: "email", label: "Email", w: 200, get: (g) => g.form.primaryContact?.email, path: "primaryContact.email", input: "text" },
  { key: "eff", label: "Effective", w: 120, get: (g) => g.form.effectiveDate, path: "effectiveDate", input: "date" },
  { key: "state", label: "State", w: 70, get: (g) => g.form.address?.state, path: "address.state", input: "select", options: () => window.US_STATES },
  { key: "emp", label: "Eligible", w: 80, get: (g) => g.form.employeeCount, path: "employeeCount", input: "number", num: true },
  { key: "classes", label: "Classes", w: 150, get: (g) => window.classNames(g).join(", ") || "—" },
  { key: "plans", label: "Plans", w: 200, get: (g) => window.planNames(g).join(", ") },
  { key: "contrib", label: "Employer contributions", w: 280, get: (g) => window.contribSummary(g) },
  { key: "wait", label: "Waiting", w: 120, get: (g) => g.form.waitingPeriod, path: "waitingPeriod", input: "select", options: () => window.WAITING_PERIODS },
  { key: "pay", label: "Payroll", w: 160, get: (g) => g.form.payrollSchedule, path: "payrollSchedule", input: "select", options: () => window.PAYROLL_SCHEDULES },
  { key: "provider", label: "Provider", w: 130, get: (g) => g.form.payrollProvider, path: "payrollProvider", input: "text" },
  { key: "integ", label: "Integration", w: 110, get: (g) => g.form.payrollIntegration, path: "payrollIntegration", input: "select", options: () => ["Yes", "No", "Not sure"] },
  { key: "lang", label: "Language", w: 150, get: (g) => g.form.languageNeeds, path: "languageNeeds", input: "text" },
  { key: "past", label: "Prior benefits", w: 200, get: (g) => g.form.pastBenefits, path: "pastBenefits", input: "select", options: () => window.PAST_BENEFITS },
  { key: "submitted", label: "Submitted", w: 110, get: (g) => window.fmtDate(g.submittedAt) },
];

// internal (editable) columns
const INTERNAL_COLS = [
  { key: "benefitManager", label: "Benefit Manager", w: 150, type: "select" },
  { key: "buildCompleted", label: "Build done", w: 130, type: "date" },
  { key: "enrolledCount", label: "Enrolled members", w: 130, type: "number" },
  { key: "enrolledPlans", label: "Total enrolled plans", w: 150, type: "number" },
  { key: "oeTimeline", label: "OE timeline", w: 120, type: "text" },
];

function StatusPill({ value, onChange }) {
  const s = window.statusById(value || "new");
  return (
    <div className="ds-status">
      <select value={value || "new"} onChange={(e) => onChange(e.target.value)} style={{ color: s.color, background: s.tint, borderColor: s.color + "55" }}>
        {window.STATUSES.map((o) => <option key={o.id} value={o.id} style={{ background: "#fff", color: "#1b2622" }}>{o.label}</option>)}
      </select>
    </div>
  );
}

// editable client-data cell (text/number/date/select); falls back to read-only text
function ClientCell({ col, g, onEdit }) {
  const v = col.get(g);
  if (!col.path) {
    return <td className={col.num ? "ds-num" : ""} title={typeof v === "string" && v.length > 30 ? v : undefined}>{v || <span className="ds-empty">—</span>}</td>;
  }
  const raw = (() => { // pull the underlying scalar from the form by path
    const parts = col.path.split(".");
    let cur = g.form;
    for (const p of parts) { cur = cur ? cur[p] : undefined; }
    return cur == null ? "" : cur;
  })();
  return (
    <td className={"ds-edit-cell" + (col.num ? " ds-num" : "")}>
      {col.input === "select" ? (
        <select value={raw} onChange={(e) => onEdit(g.id, col.path, e.target.value)}>
          <option value="">—</option>
          {col.options().map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={col.input === "date" ? "date" : col.input === "number" ? "number" : "text"} value={raw} placeholder="—" onChange={(e) => onEdit(g.id, col.path, e.target.value)} />
      )}
    </td>
  );
}

function Dashboard() {
  const [meta, setMeta] = useState(loadMeta);
  const [groups, setGroups] = useState(() => window.allGroups());
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bmFilter, setBmFilter] = useState("all");
  const [detailId, setDetailId] = useState(null);
  const [showRouting, setShowRouting] = useState(false);
  const [routing, setRouting] = useState(() => window.loadRouting());
  const [view, setView] = useState("board");
  const [bms, setBms] = useState(() => window.loadBMs());
  const [aes, setAes] = useState(() => window.loadAEs());
  const [customCols, setCustomCols] = useState(() => loadCustomCols());
  const [currentUser, setCurrentUser] = useState(() => { try { return localStorage.getItem(USER_LS) || STAFF[0]; } catch { return STAFF[0]; } });

  useEffect(() => saveMeta(meta), [meta]);
  useEffect(() => { try { localStorage.setItem(USER_LS, currentUser); } catch {} }, [currentUser]);
  useEffect(() => saveCustomCols(customCols), [customCols]);

  const setMetaField = (id, key, value) => setMeta((m) => ({ ...m, [id]: { ...(m[id] || {}), [key]: value } }));
  const fieldVal = (g, key) => { const mv = meta[g.id]; return mv && key in mv ? mv[key] : (g[key] || ""); };

  // staff edits to a group's submitted form — persisted, then groups state refreshed
  const setFormField = (id, path, value) => {
    setGroups((gs) => gs.map((g) => {
      if (g.id !== id) return g;
      const nextForm = setByPath(g.form, path, value);
      window.saveFormEdit(id, nextForm);
      return { ...g, form: nextForm };
    }));
  };
  const updateForm = (id, nextForm) => {
    setGroups((gs) => gs.map((g) => {
      if (g.id !== id) return g;
      window.saveFormEdit(id, nextForm);
      return { ...g, form: nextForm };
    }));
  };

  // custom (Excel-like) columns: definitions shared, values per-group in meta[id].cols
  const colUid = () => "col" + Date.now().toString(36) + Math.floor(Math.random() * 99).toString(36);
  const addCustomCol = () => { const name = (window.prompt("New column name:") || "").trim(); if (!name) return; setCustomCols((c) => [...c, { id: colUid(), label: name }]); };
  const renameCustomCol = (cid) => { const col = customCols.find((c) => c.id === cid); const name = (window.prompt("Rename column:", col ? col.label : "") || "").trim(); if (!name) return; setCustomCols((c) => c.map((x) => (x.id === cid ? { ...x, label: name } : x))); };
  const deleteCustomCol = (cid) => { if (!window.confirm("Delete this column for all groups?")) return; setCustomCols((c) => c.filter((x) => x.id !== cid)); };
  const customColVal = (g, cid) => { const mv = meta[g.id]; return (mv && mv.cols && mv.cols[cid]) || ""; };
  const setCustomColVal = (id, cid, value) => setMeta((m) => ({ ...m, [id]: { ...(m[id] || {}), cols: { ...((m[id] || {}).cols || {}), [cid]: value } } }));
  // add a column (optionally with a starting value for one group) — used by the drawer's Additional fields
  const addColumnWithValue = (groupId, label, value) => {
    const name = (label || "").trim(); if (!name) return;
    const id = colUid();
    setCustomCols((c) => [...c, { id, label: name }]);
    if (value && value.trim()) setCustomColVal(groupId, id, value.trim());
  };

  // Benefit Manager: auto-assign from routing when not manually set; manage the BM list
  const autoBM = (g) => { try { const r = window.resolveRule(routing, g.form.accountExec, g.form.address && g.form.address.state); return r && r.bmName ? r.bmName : ""; } catch { return ""; } };
  const bmFor = (g) => { const mv = meta[g.id]; const manual = mv && "benefitManager" in mv ? mv.benefitManager : g.benefitManager; return manual || autoBM(g); };
  const isAutoBM = (g) => { const mv = meta[g.id]; const manual = mv && "benefitManager" in mv ? mv.benefitManager : g.benefitManager; return !manual && !!autoBM(g); };
  const addBM = (name) => { const n = name.trim(); if (!n || bms.includes(n)) return; const next = [...bms, n]; setBms(next); window.saveBMs(next); };
  const removeBM = (name) => { const next = bms.filter((b) => b !== name); setBms(next); window.saveBMs(next); };
  const addAE = (name) => { const n = name.trim(); if (!n || aes.includes(n)) return; const next = [...aes, n]; setAes(next); window.saveAEs(next); };
  const removeAE = (name) => { const next = aes.filter((a) => a !== name); setAes(next); window.saveAEs(next); };

  // notes + custom fields live in the per-group meta record
  const uid = () => Date.now().toString(36) + Math.floor(Math.random() * 999).toString(36);
  const addNote = (id, text) => setMeta((m) => ({ ...m, [id]: { ...(m[id] || {}), notes: [{ id: uid(), text, author: currentUser, ts: new Date().toISOString() }, ...((m[id] || {}).notes || [])] } }));
  const editNote = (id, nid, text) => setMeta((m) => ({ ...m, [id]: { ...(m[id] || {}), notes: ((m[id] || {}).notes || []).map((n) => (n.id === nid ? { ...n, text, editedTs: new Date().toISOString() } : n)) } }));
  const deleteNote = (id, nid) => setMeta((m) => ({ ...m, [id]: { ...(m[id] || {}), notes: ((m[id] || {}).notes || []).filter((n) => n.id !== nid) } }));
  const addField = (id, key, value) => setMeta((m) => ({ ...m, [id]: { ...(m[id] || {}), customFields: [...((m[id] || {}).customFields || []), { id: uid(), key, value }] } }));
  const updateField = (id, fid, value) => setMeta((m) => ({ ...m, [id]: { ...(m[id] || {}), customFields: ((m[id] || {}).customFields || []).map((f) => (f.id === fid ? { ...f, value } : f)) } }));
  const deleteField = (id, fid) => setMeta((m) => ({ ...m, [id]: { ...(m[id] || {}), customFields: ((m[id] || {}).customFields || []).filter((f) => f.id !== fid) } }));

  // document checklist (per group), stored in meta.checks, falling back to sample defaults
  const checksFor = (g) => (meta[g.id] && meta[g.id].checks) || g.checks || {};
  const toggleCheck = (id, key) => setMeta((m) => {
    const g = groups.find((x) => x.id === id);
    const cur = (m[id] && m[id].checks) || (g && g.checks) || {};
    return { ...m, [id]: { ...(m[id] || {}), checks: { ...cur, [key]: !cur[key] } } };
  });

  // delete / archive
  const removeGroup = (id) => { window.deleteGroup(id); setGroups(window.allGroups()); if (detailId === id) setDetailId(null); };
  const completeGroup = (id) => setMeta((m) => ({ ...m, [id]: { ...(m[id] || {}), status: "complete", closedAt: new Date().toISOString().slice(0, 10), archiveReason: "" } }));
  const archiveGroup = (id) => {
    const reason = window.prompt("Archive this group (e.g. went unresponsive). Add a short reason:", "Unresponsive — no reply to follow-ups.");
    if (reason === null) return;
    setMeta((m) => ({ ...m, [id]: { ...(m[id] || {}), status: "archived", closedAt: new Date().toISOString().slice(0, 10), archiveReason: reason } }));
  };
  const reopenGroup = (id) => setMeta((m) => ({ ...m, [id]: { ...(m[id] || {}), status: "processing", archiveReason: "" } }));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups.filter((g) => {
      const status = fieldVal(g, "status") || "new";
      const bm = bmFor(g);
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (bmFilter !== "all" && bm !== bmFilter) return false;
      if (!q) return true;
      const hay = [g.form.legalName, g.form.accountExec, g.form.address?.state, g.form.primaryContact?.email, bm].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [groups, query, statusFilter, bmFilter, meta, routing]);

  const counts = useMemo(() => {
    const c = { all: groups.length };
    window.STATUSES.forEach((s) => (c[s.id] = 0));
    groups.forEach((g) => { const s = fieldVal(g, "status") || "new"; c[s] = (c[s] || 0) + 1; });
    return c;
  }, [groups, meta]);

  const detailGroup = groups.find((g) => g.id === detailId) || null;

  // who-am-I options: managed Benefit Managers + account execs (so added BMs appear here)
  const staffList = (() => {
    const aeList = (aes || []).filter((x) => x && !/not sure/i.test(x));
    const merged = [...bms, ...aeList];
    if (currentUser && !merged.includes(currentUser)) merged.push(currentUser);
    return Array.from(new Set(merged));
  })();

  return (
    <div className="ds-root">
      <header className="ds-head">
        <div className="ds-head-l">
          <div className="ds-logo" role="img" aria-label="Zion HealthShare"></div>
          <div>
            <h1>Groups</h1>
            <div className="ds-sub">{groups.length} groups · onboarding pipeline</div>
          </div>
        </div>
        <div className="ds-head-r">
          <label className="ds-whoami" title="Notes you add are attributed to this person">
            <span className="ds-whoami-av">{(currentUser || "?").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}</span>
            <select value={currentUser} onChange={(e) => setCurrentUser(e.target.value)}>
              {staffList.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <button className="ds-btn ds-btn-ghost" onClick={() => setShowRouting(true)}>⚙ Benefit Manager routing</button>
          <a className="ds-btn" href="Zion New Group Onboarding.html">+ New onboarding</a>
        </div>
      </header>

      <div className="ds-stats">
        {window.STATUSES.map((s) => (
          <button key={s.id} className={"ds-stat" + (statusFilter === s.id ? " on" : "")} onClick={() => setStatusFilter(statusFilter === s.id ? "all" : s.id)} style={{ "--sc": s.color, "--st": s.tint }}>
            <span className="ds-stat-n">{counts[s.id] || 0}</span>
            <span className="ds-stat-l">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="ds-toolbar">
        <input className="ds-search" placeholder="Search company, AE, state, email…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <label className="ds-filter">BM
          <select value={bmFilter} onChange={(e) => setBmFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="">Unassigned</option>
            {bms.map((b) => <option key={b}>{b}</option>)}
          </select>
        </label>
        {(statusFilter !== "all" || bmFilter !== "all" || query) && (
          <button className="ds-clear" onClick={() => { setStatusFilter("all"); setBmFilter("all"); setQuery(""); }}>Clear filters</button>
        )}
        <div className="ds-viewtoggle">
          <button className={view === "board" ? "on" : ""} onClick={() => setView("board")}>▦ Board</button>
          <button className={view === "table" ? "on" : ""} onClick={() => setView("table")}>▤ Table</button>
        </div>
        <span className="ds-count">{filtered.length} shown</span>
      </div>

      {view === "board" ? (
        <div className="ds-boardwrap">
          {(statusFilter === "archived" || statusFilter === "complete") ? (
            <ClosedView kind={statusFilter} groups={filtered} meta={meta} onOpen={setDetailId} onReopen={reopenGroup} onDelete={(g) => { if (window.confirm(`Delete ${g.form.legalName}? This can't be undone.`)) removeGroup(g.id); }} />
          ) : (
            <Board groups={filtered} meta={meta} fieldVal={fieldVal} bms={bms} bmFor={bmFor} isAutoBM={isAutoBM} checksFor={checksFor} onToggleCheck={toggleCheck} onComplete={completeGroup} onArchive={archiveGroup} onDelete={(g) => { if (window.confirm(`Delete ${g.form.legalName}? This can't be undone.`)) removeGroup(g.id); }} onOpen={setDetailId} onSetStatus={(id, s) => setMetaField(id, "status", s)} onAssignBM={(id, bm) => setMetaField(id, "benefitManager", bm)} />
          )}
        </div>
      ) : (
      <div className="ds-tablewrap">
        <table className="ds-table">
          <thead>
            <tr>
              <th className="ds-fz ds-fz-1">Company</th>
              <th className="ds-fz ds-fz-2">Status</th>
              {INTERNAL_COLS.map((c) => <th key={c.key} className="ds-int-h" style={{ minWidth: c.w }}>{c.label}</th>)}
              {CLIENT_COLS.map((c) => <th key={c.key} style={{ minWidth: c.w }} className={c.num ? "ds-num" : ""}>{c.label}</th>)}
              {customCols.map((c) => (
                <th key={c.id} className="ds-cust-h" style={{ minWidth: 150 }}>
                  <span className="ds-cust-label" onClick={() => renameCustomCol(c.id)} title="Rename">{c.label}</span>
                  <button className="ds-cust-del" title="Delete column" onClick={() => deleteCustomCol(c.id)}>×</button>
                </th>
              ))}
              <th className="ds-addcol-h"><button className="ds-addcol" title="Add column" onClick={addCustomCol}>+ Column</button></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.id}>
                <td className="ds-fz ds-fz-1 ds-company" onClick={() => setDetailId(g.id)}>
                  <span className="ds-company-name">{g.form.legalName}</span>
                  <span className="ds-company-sub">{g.form.address?.city}, {g.form.address?.state}</span>
                </td>
                <td className="ds-fz ds-fz-2"><StatusPill value={fieldVal(g, "status") || "new"} onChange={(v) => setMetaField(g.id, "status", v)} /></td>
                {INTERNAL_COLS.map((c) => (
                  <td key={c.key} className="ds-int-cell">
                    {c.type === "select" ? (
                      <select value={c.key === "benefitManager" ? bmFor(g) : fieldVal(g, c.key)} onChange={(e) => setMetaField(g.id, c.key, e.target.value)} className={c.key === "benefitManager" && isAutoBM(g) ? "ds-bm-auto" : ""}>
                        <option value="">—</option>
                        {bms.map((b) => <option key={b}>{b}</option>)}
                      </select>
                    ) : (
                      <input type={c.type === "date" ? "date" : c.type === "number" ? "number" : "text"} value={fieldVal(g, c.key)} onChange={(e) => setMetaField(g.id, c.key, e.target.value)} placeholder="—" />
                    )}
                  </td>
                ))}
                {CLIENT_COLS.map((c) => <ClientCell key={c.key} col={c} g={g} onEdit={setFormField} />)}
                {customCols.map((c) => (
                  <td key={c.id} className="ds-cust-cell">
                    <input value={customColVal(g, c.id)} placeholder="—" onChange={(e) => setCustomColVal(g.id, c.id, e.target.value)} />
                  </td>
                ))}
                <td className="ds-addcol-cell"></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={3 + INTERNAL_COLS.length + CLIENT_COLS.length + customCols.length} className="ds-noresults">No groups match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {detailGroup && <DetailDrawer group={detailGroup} meta={meta[detailGroup.id]} currentUser={currentUser} bms={bms} bmValue={bmFor(detailGroup)} bmIsAuto={isAutoBM(detailGroup)} checks={checksFor(detailGroup)} onToggleCheck={toggleCheck} onComplete={completeGroup} onReopen={reopenGroup} onArchive={archiveGroup} onDelete={(g) => { if (window.confirm(`Delete ${g.form.legalName}? This can't be undone.`)) removeGroup(g.id); }} onMeta={setMetaField} onFormField={setFormField} onUpdateForm={updateForm} customCols={customCols} colValueFor={(cid) => customColVal(detailGroup, cid)} onSetColVal={(cid, v) => setCustomColVal(detailGroup.id, cid, v)} onAddCol={(label, value) => addColumnWithValue(detailGroup.id, label, value)} onRenameCol={renameCustomCol} onDeleteCol={deleteCustomCol} onAddNote={addNote} onEditNote={editNote} onDeleteNote={deleteNote} onClose={() => setDetailId(null)} />}
      {showRouting && <AdminModal rules={routing} bms={bms} aes={aes} onAddBM={addBM} onRemoveBM={removeBM} onAddAE={addAE} onRemoveAE={removeAE} onSave={(r) => { setRouting(r); window.saveRouting(r); }} onClose={() => setShowRouting(false)} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Dashboard />);
