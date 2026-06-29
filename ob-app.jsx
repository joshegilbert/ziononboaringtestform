/* dash-detail.jsx — slide-in detail drawer for one group. */

function DRow({ k, v }) { return <div className="dd-row"><dt>{k}</dt><dd>{v || <em>—</em>}</dd></div>; }

// editable field row: read-only display, or an input when `editing`
function EField({ label, path, value, editing, onEdit, input, options }) {
  if (!editing) return <div className="dd-row"><dt>{label}</dt><dd>{value || <em>—</em>}</dd></div>;
  return (
    <div className="dd-erow">
      <span className="dd-elabel">{label}</span>
      {input === "select" ? (
        <select value={value || ""} onChange={(e) => onEdit(path, e.target.value)}>
          <option value="">—</option>
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : input === "textarea" ? (
        <textarea rows="2" value={value || ""} onChange={(e) => onEdit(path, e.target.value)} placeholder="—" />
      ) : (
        <input type={input === "date" ? "date" : input === "number" ? "number" : "text"} value={value || ""} onChange={(e) => onEdit(path, e.target.value)} placeholder="—" />
      )}
    </div>
  );
}

// section wrapper with an Edit / Done toggle
function EditSection({ title, children }) {
  const [editing, setEditing] = React.useState(false);
  return (
    <section className="dd-sec">
      <h3 className="dd-sec-h-edit">{title}
        <button className={"dd-edit-toggle" + (editing ? " on" : "")} onClick={() => setEditing((v) => !v)}>{editing ? "Done" : "Edit"}</button>
      </h3>
      <dl className={editing ? "dd-editing" : ""}>{children(editing)}</dl>
    </section>
  );
}

function fmtContribAmt(v, method) {
  return method === "percent" ? `${Number(v) || 0}%` : `$${(Number(v) || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function relTime(iso) {
  const d = new Date(iso); const s = (Date.now() - d) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  if (s < 604800) return Math.floor(s / 86400) + "d ago";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function initials(name) {
  if (!name) return "?";
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function NotesTimeline({ notes, currentUser, onAdd, onEdit, onDelete }) {
  const [text, setText] = React.useState("");
  const [editId, setEditId] = React.useState(null);
  const [editText, setEditText] = React.useState("");
  const submit = () => { const t = text.trim(); if (!t) return; onAdd(t); setText(""); };
  const startEdit = (n) => { setEditId(n.id); setEditText(n.text); };
  const saveEdit = (n) => { const t = editText.trim(); if (t) onEdit(n.id, t); setEditId(null); setEditText(""); };
  return (
    <div>
      <div className="dd-note-add">
        <textarea rows="2" value={text} placeholder={`Add a note as ${currentUser || "you"}…`} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit(); }} />
        <button className="dd-note-btn" onClick={submit} disabled={!text.trim()}>Add note</button>
      </div>
      {(notes && notes.length > 0) ? (
        <ul className="dd-notes">
          {notes.map((n) => (
            <li key={n.id} className="dd-note">
              <div className="dd-note-head">
                <span className="dd-note-avatar" title={n.author || "Unknown"}>{initials(n.author)}</span>
                <span className="dd-note-author">{n.author || "Unknown"}</span>
                <span className="dd-note-meta">{relTime(n.ts)}{n.editedTs ? " · edited" : ""}</span>
                {editId !== n.id && (
                  <span className="dd-note-actions">
                    <button title="Edit" onClick={() => startEdit(n)}>✎</button>
                    <button title="Delete" onClick={() => onDelete(n.id)}>×</button>
                  </span>
                )}
              </div>
              {editId === n.id ? (
                <div className="dd-note-edit">
                  <textarea rows="2" value={editText} autoFocus onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") saveEdit(n); if (e.key === "Escape") { setEditId(null); } }} />
                  <div className="dd-note-edit-foot">
                    <button className="dd-note-cancel" onClick={() => setEditId(null)}>Cancel</button>
                    <button className="dd-note-save" onClick={() => saveEdit(n)}>Save</button>
                  </div>
                </div>
              ) : (
                <div className="dd-note-text">{n.text}</div>
              )}
            </li>
          ))}
        </ul>
      ) : <div className="dd-notes-empty">No notes yet.</div>}
    </div>
  );
}

function CustomFields({ cols, valueFor, onSetValue, onAddCol, onRenameCol, onDeleteCol }) {
  const [k, setK] = React.useState(""); const [v, setV] = React.useState("");
  const add = () => { const key = k.trim(); if (!key) return; onAddCol(key, v); setK(""); setV(""); };
  return (
    <div>
      <div className="dd-cf-hint">These are shared columns — they also appear in the Table view.</div>
      {(cols && cols.length > 0) && (
        <div className="dd-cf-list">
          {cols.map((c) => (
            <div className="dd-cf" key={c.id}>
              <button className="dd-cf-k" title="Rename column" onClick={() => onRenameCol(c.id)}>{c.label}</button>
              <input className="dd-cf-v" value={valueFor(c.id)} placeholder="—" onChange={(e) => onSetValue(c.id, e.target.value)} />
              <button className="dd-cf-del" title="Delete column (all groups)" onClick={() => onDeleteCol(c.id)}>×</button>
            </div>
          ))}
        </div>
      )}
      <div className="dd-cf-add">
        <input value={k} placeholder="Column name (e.g. SIC code)" onChange={(e) => setK(e.target.value)} />
        <input value={v} placeholder="Value (optional)" onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} />
        <button className="dd-cf-btn" onClick={add} disabled={!k.trim()}>Add column</button>
      </div>
    </div>
  );
}

function ChecklistBar({ title, items, checks, onToggle, step }) {
  const done = items.filter((d) => checks && checks[d.key]).length;
  const pct = Math.round((done / items.length) * 100);
  return (
    <div className="dd-cl">
      <div className="dd-cl-head">
        <span className="dd-cl-title">{title}</span>
        <span className="dd-cl-count">{done} of {items.length}</span>
      </div>
      <div className={"dd-bar" + (step ? " step" : "")}><div className="dd-bar-fill" style={{ width: pct + "%" }} /></div>
      <div className="dd-cl-items">
        {items.map((d) => {
          const on = !!(checks && checks[d.key]);
          return (
            <button key={d.key} className={"dd-cl-item" + (on ? " on" : "") + (step ? " step" : "")} onClick={() => onToggle(d.key)}>
              <span className="dd-cl-box">{on ? "✓" : ""}</span>{d.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EnrollTracker({ group, meta, onMeta }) {
  const en = window.enrollmentOf(group, meta);
  const totalVal = (meta && meta.totalEmployees != null && meta.totalEmployees !== "") ? meta.totalEmployees : (group.form.employeeCount || "");
  const enrolledVal = (meta && meta.enrolledCount != null && meta.enrolledCount !== "") ? meta.enrolledCount : (group.enrolledCount != null ? group.enrolledCount : "");
  const plansVal = (meta && meta.enrolledPlans != null && meta.enrolledPlans !== "") ? meta.enrolledPlans : (group.enrolledPlans != null ? group.enrolledPlans : "");
  return (
    <div className="dd-enrolltrack">
      <div className="dd-cl-head">
        <span className="dd-cl-title">Enrollment</span>
        <span className="dd-cl-count"><b>{en.enrolled}</b> of {en.total} members · {en.pct}%</span>
      </div>
      <div className="dd-bar big"><div className="dd-bar-fill" style={{ width: en.pct + "%" }} /></div>
      <div className="dd-enroll-inputs dd-enroll-inputs-3">
        <label className="dd-f"><span>Enrolled members</span>
          <input type="number" min="0" value={enrolledVal} onChange={(e) => onMeta(group.id, "enrolledCount", e.target.value)} placeholder="0" />
        </label>
        <label className="dd-f"><span>Total enrolled plans</span>
          <input type="number" min="0" value={plansVal} onChange={(e) => onMeta(group.id, "enrolledPlans", e.target.value)} placeholder="0" />
        </label>
        <label className="dd-f"><span>Total eligible</span>
          <input type="number" min="0" value={totalVal} onChange={(e) => onMeta(group.id, "totalEmployees", e.target.value)} placeholder="0" />
        </label>
      </div>
    </div>
  );
}

function PlansContribEditor({ group, onUpdateForm }) {
  const [editing, setEditing] = React.useState(false);
  const f = group.form;
  const TIERS = [["mo", "EE"], ["es", "+Spouse"], ["ec", "+Child"], ["fam", "Family"]];
  const selected = f.selectedPlans || [];
  const units = (f.classes || []).length ? f.classes : [{ id: "__all", name: "All employees" }];
  const contributions = f.contributions || {};
  const allPlans = window.ALL_PLANS;

  const commit = (next) => onUpdateForm(group.id, next);

  const togglePlan = (pid) => {
    const on = selected.includes(pid);
    const nextSel = on ? selected.filter((x) => x !== pid) : [...selected, pid];
    commit({ ...f, selectedPlans: nextSel });
  };
  const setTier = (uId, pId, tier, value) => {
    const c = JSON.parse(JSON.stringify(contributions));
    c[uId] = c[uId] || {};
    c[uId][pId] = { ...(c[uId][pId] || {}), [tier]: value };
    commit({ ...f, contributions: c });
  };
  const setMethod = (uId, pId, method) => {
    const c = JSON.parse(JSON.stringify(contributions));
    c[uId] = c[uId] || {};
    c[uId][pId] = { ...(c[uId][pId] || {}), method };
    commit({ ...f, contributions: c });
  };

  const plans = selected.map(window.planById).filter(Boolean);

  return (
    <section className="dd-sec">
      <h3 className="dd-sec-h-edit">Plans & contributions
        <button className={"dd-edit-toggle" + (editing ? " on" : "")} onClick={() => setEditing((v) => !v)}>{editing ? "Done" : "Edit"}</button>
      </h3>

      {editing && (
        <div className="dd-planpick">
          <div className="dd-planpick-h">Plans offered</div>
          <div className="dd-planpick-chips">
            {allPlans.map((pl) => {
              const on = selected.includes(pl.id);
              return (
                <button key={pl.id} className={"dd-planchip" + (on ? " on" : "")} onClick={() => togglePlan(pl.id)}>
                  <span className="dd-planchip-box">{on ? "✓" : "+"}</span>{pl.name.replace("Zion HealthShare — ", "").replace(" Add-On", "")}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!editing && (
        <div className="dd-plans-tags">{plans.map((pl) => <span key={pl.id} className="dd-tag">{pl.name}</span>)}</div>
      )}

      {units.map((u) => (
        <div className="dd-contrib-unit" key={u.id}>
          <div className="dd-contrib-name">{u.name}</div>
          {editing ? (
            <table className="dd-contrib-tbl dd-contrib-edit">
              <thead><tr><th>Plan</th><th>Type</th>{TIERS.map(([k, l]) => <th key={k}>{l}</th>)}</tr></thead>
              <tbody>
                {plans.map((pl) => {
                  const v = (contributions[u.id] || {})[pl.id] || {};
                  const isPct = v.method === "percent";
                  return (
                    <tr key={pl.id}>
                      <td className="dd-ce-name">{pl.name.split(" — ")[0].replace(" Add-On", "")}</td>
                      <td>
                        <select className="dd-ce-method" value={isPct ? "percent" : "fixed"} onChange={(e) => setMethod(u.id, pl.id, e.target.value)}>
                          <option value="fixed">$</option>
                          <option value="percent">%</option>
                        </select>
                      </td>
                      {TIERS.map(([k]) => (
                        <td key={k}><input className="dd-ce-in" type="number" min="0" value={v[k] ?? ""} placeholder="0" onChange={(e) => setTier(u.id, pl.id, k, e.target.value)} /></td>
                      ))}
                    </tr>
                  );
                })}
                {plans.length === 0 && <tr><td colSpan="6" className="dd-ce-empty">No plans selected.</td></tr>}
              </tbody>
            </table>
          ) : (
            <table className="dd-contrib-tbl">
              <thead><tr><th>Plan</th><th>EE</th><th>+Spouse</th><th>+Child</th><th>Family</th></tr></thead>
              <tbody>
                {plans.map((pl) => {
                  const v = (contributions[u.id] || {})[pl.id];
                  if (!v) return null;
                  const m = v.method === "percent" ? "percent" : "fixed";
                  return (
                    <tr key={pl.id}>
                      <td>{pl.name.split(" — ")[0].replace(" Add-On", "")}</td>
                      <td>{fmtContribAmt(v.mo, m)}</td>
                      <td>{fmtContribAmt(v.es, m)}</td>
                      <td>{fmtContribAmt(v.ec, m)}</td>
                      <td>{fmtContribAmt(v.fam, m)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </section>
  );
}

function DetailDrawer({ group, meta, currentUser, bms, bmValue, bmIsAuto, checks, onToggleCheck, onComplete, onReopen, onArchive, onDelete, onMeta, onFormField, onUpdateForm, customCols, colValueFor, onSetColVal, onAddCol, onRenameCol, onDeleteCol, onAddNote, onEditNote, onDeleteNote, onClose }) {
  if (!group) return null;
  const f = group.form;
  const p = f.primaryContact || {};
  const a = f.address || {};
  const plans = (f.selectedPlans || []).map(window.planById).filter(Boolean);
  const units = (f.classes || []).length ? f.classes : [{ id: "__all", name: "All employees" }];
  const contributions = f.contributions || {};
  const val = (key) => (meta && key in meta ? meta[key] : group[key]) || "";
  const notes = (meta && meta.notes) || [];
  const customFields = (meta && meta.customFields) || [];
  const edit = (path, value) => onFormField(group.id, path, value);

  return (
    <div className="dd-scrim" onClick={onClose}>
      <aside className="dd" onClick={(e) => e.stopPropagation()}>
        <div className="dd-top">
          <div>
            <div className="dd-eyebrow">{f.accountExec || "—"} · submitted {window.fmtDate(group.submittedAt)}</div>
            <h2 className="dd-title">{f.legalName}</h2>
          </div>
          <button className="dd-x" onClick={onClose}>×</button>
        </div>

        <div className="dd-body">
          {/* Document & step progress */}
          <section className="dd-sec">
            <h3>Documents & steps</h3>
            <ChecklistBar title="Documents" items={window.DOC_CHECKS} checks={checks} onToggle={(k) => onToggleCheck(group.id, k)} />
            <ChecklistBar title="Processing" items={window.STEP_CHECKS} checks={checks} onToggle={(k) => onToggleCheck(group.id, k)} step />
          </section>

          {/* Internal tracking — most useful first for staff */}
          <section className="dd-sec dd-sec-internal">
            <h3>Internal tracking</h3>
            <div className="dd-int-grid">
              <label className="dd-f"><span>Status</span>
                <select value={val("status") || "new"} onChange={(e) => onMeta(group.id, "status", e.target.value)}>
                  {window.STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </label>
              <label className="dd-f"><span>Benefit Manager{bmIsAuto ? <em className="dd-auto-tag">auto</em> : null}</span>
                <select value={bmValue || ""} onChange={(e) => onMeta(group.id, "benefitManager", e.target.value)}>
                  <option value="">Unassigned</option>
                  {(bms || []).map((b) => <option key={b}>{b}</option>)}
                </select>
              </label>
              <label className="dd-f"><span>Build completed</span>
                <input type="date" value={val("buildCompleted")} onChange={(e) => onMeta(group.id, "buildCompleted", e.target.value)} />
              </label>
              <label className="dd-f"><span>OE timeline</span>
                <input value={val("oeTimeline")} onChange={(e) => onMeta(group.id, "oeTimeline", e.target.value)} placeholder="—" />
              </label>
            </div>
            <EnrollTracker group={group} meta={meta} onMeta={onMeta} />
          </section>

          <section className="dd-sec">
            <h3>Notes & activity</h3>
            <NotesTimeline notes={notes} currentUser={currentUser} onAdd={(t) => onAddNote(group.id, t)} onEdit={(nid, t) => onEditNote(group.id, nid, t)} onDelete={(nid) => onDeleteNote(group.id, nid)} />
          </section>

          <section className="dd-sec">
            <h3>Additional fields</h3>
            <CustomFields cols={customCols} valueFor={colValueFor} onSetValue={onSetColVal} onAddCol={onAddCol} onRenameCol={onRenameCol} onDeleteCol={onDeleteCol} />
          </section>

          <EditSection title="Company">
            {(editing) => (<>
              <EField label="Legal name" path="legalName" value={f.legalName} editing={editing} onEdit={edit} input="text" />
              <EField label="EIN" path="ein" value={f.ein} editing={editing} onEdit={edit} input="text" />
              <EField label="Industry" path="industry" value={f.industry} editing={editing} onEdit={edit} input="select" options={window.INDUSTRIES} />
              <EField label="Eligible employees" path="employeeCount" value={f.employeeCount} editing={editing} onEdit={edit} input="number" />
              {editing ? (<>
                <EField label="Street" path="address.street" value={a.street} editing={editing} onEdit={edit} input="text" />
                <EField label="City" path="address.city" value={a.city} editing={editing} onEdit={edit} input="text" />
                <EField label="State" path="address.state" value={a.state} editing={editing} onEdit={edit} input="select" options={window.US_STATES} />
                <EField label="ZIP" path="address.zip" value={a.zip} editing={editing} onEdit={edit} input="text" />
              </>) : (
                <DRow k="Address" v={[a.street, a.city, a.state, a.zip].filter(Boolean).join(", ")} />
              )}
            </>)}
          </EditSection>

          <EditSection title="Contact">
            {(editing) => (<>
              <EField label="First name" path="primaryContact.firstName" value={p.firstName} editing={editing} onEdit={edit} input="text" />
              <EField label="Last name" path="primaryContact.lastName" value={p.lastName} editing={editing} onEdit={edit} input="text" />
              <EField label="Title" path="primaryContact.title" value={p.title} editing={editing} onEdit={edit} input="text" />
              <EField label="Phone" path="primaryContact.phone" value={p.phone} editing={editing} onEdit={edit} input="text" />
              <EField label="Email" path="primaryContact.email" value={p.email} editing={editing} onEdit={edit} input="text" />
              <EField label="Referred by" path="accountExec" value={f.accountExec} editing={editing} onEdit={edit} input="select" options={window.ACCOUNT_EXECS} />
            </>)}
          </EditSection>

          <EditSection title="Group setup">
            {(editing) => (<>
              <EField label="Effective date" path="effectiveDate" value={f.effectiveDate} editing={editing} onEdit={edit} input="date" />
              <EField label="Waiting period" path="waitingPeriod" value={f.waitingPeriod} editing={editing} onEdit={edit} input="select" options={window.WAITING_PERIODS} />
              <EField label="Language needs" path="languageNeeds" value={f.languageNeeds} editing={editing} onEdit={edit} input="text" />
              <EField label="Payroll schedule" path="payrollSchedule" value={f.payrollSchedule} editing={editing} onEdit={edit} input="select" options={window.PAYROLL_SCHEDULES} />
              <EField label="Payroll provider" path="payrollProvider" value={f.payrollProvider} editing={editing} onEdit={edit} input="text" />
              <EField label="Payroll integration" path="payrollIntegration" value={f.payrollIntegration} editing={editing} onEdit={edit} input="select" options={["Yes", "No", "Not sure"]} />
              <EField label="Prior benefits" path="pastBenefits" value={f.pastBenefits} editing={editing} onEdit={edit} input="select" options={window.PAST_BENEFITS} />
            </>)}
          </EditSection>

          <PlansContribEditor group={group} onUpdateForm={onUpdateForm} />

          <section className="dd-sec dd-sec-danger">
            {(() => {
              const st = val("status") || "new";
              const closed = window.isClosed(st);
              const reason = val("archiveReason");
              const closedAt = val("closedAt");
              if (closed) {
                const isComp = st === "complete";
                return (
                  <>
                    <div className={"dd-closed-tag " + (isComp ? "complete" : "archived")}>
                      {isComp ? "✓ Completed" : "Archived"}{closedAt ? " · " + window.fmtDate(closedAt) : ""}
                    </div>
                    {!isComp && (
                      <label className="dd-f" style={{ marginTop: 10 }}><span>Archive reason</span>
                        <input value={reason} onChange={(e) => onMeta(group.id, "archiveReason", e.target.value)} placeholder="Why was this archived?" />
                      </label>
                    )}
                    <div className="dd-danger-row" style={{ marginTop: 14 }}>
                      <div>
                        <div className="dd-danger-t">Reopen or delete</div>
                        <div className="dd-danger-d">Reopen returns this group to the active pipeline. Deleting removes it permanently.</div>
                      </div>
                      <div className="dd-danger-btns">
                        <button className="dd-reopen-btn" onClick={() => onReopen(group.id)}>Reopen</button>
                        <button className="dd-delete-btn" onClick={() => onDelete(group)}>Delete</button>
                      </div>
                    </div>
                  </>
                );
              }
              return (
                <div className="dd-danger-row">
                  <div>
                    <div className="dd-danger-t">Close out this group</div>
                    <div className="dd-danger-d"><b>Complete</b> = finished enrolling. <b>Archive</b> = went unresponsive / dropped off. <b>Delete</b> removes it permanently.</div>
                  </div>
                  <div className="dd-danger-btns">
                    <button className="dd-complete-btn" onClick={() => onComplete(group.id)}>✓ Mark complete</button>
                    <button className="dd-archive-btn" onClick={() => onArchive(group.id)}>Archive</button>
                    <button className="dd-delete-btn" onClick={() => onDelete(group)}>Delete</button>
                  </div>
                </div>
              );
            })()}
          </section>
        </div>
      </aside>
    </div>
  );
}

Object.assign(window, { DetailDrawer });
