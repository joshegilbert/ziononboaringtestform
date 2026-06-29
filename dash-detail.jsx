/* dash-board.jsx — pipeline (Kanban) view: groups as cards in status columns.
   Drag a card between columns to change its status. */

function GroupCard({ g, meta, checks, bms, bmFor, isAutoBM, onToggleCheck, onComplete, onOpen, onDragStart, onAssignBM, onArchive, onDelete }) {
  const [menu, setMenu] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const notes = (meta && meta.notes) || [];
  const bm = bmFor(g);
  const auto = isAutoBM(g);
  const plans = window.planNames(g);
  const status = meta && "status" in meta ? meta.status : g.status;
  const showStep = status === "processing";
  const en = window.enrollmentOf(g, meta);
  const docProg = window.checkProgress(checks, window.DOC_CHECKS);
  const stepProg = window.checkProgress(checks, window.STEP_CHECKS);
  return (
    <div className={"db-card" + (open ? " open" : "")} draggable onDragStart={(e) => onDragStart(e, g.id)}>
      <div className="db-card-headrow">
        <button className="db-caret" title={open ? "Collapse" : "Expand"} onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}>{open ? "▾" : "▸"}</button>
        <div className="db-card-name" onClick={() => onOpen(g.id)} title="Open full details">{g.form.legalName}</div>
        <div className="db-menu-wrap" onClick={(e) => e.stopPropagation()}>
          <button className="db-menu-btn" title="More" onClick={() => setMenu((v) => !v)}>⋯</button>
          {menu && (
            <>
              <div className="db-menu-scrim" onClick={() => setMenu(false)} />
              <div className="db-menu">
                <button onClick={() => { setMenu(false); onOpen(g.id); }}>Open details</button>
                <button className="db-menu-done" onClick={() => { setMenu(false); onComplete(g.id); }}>✓ Mark complete</button>
                <button onClick={() => { setMenu(false); onArchive(g.id); }}>Archive (unresponsive)</button>
                <button className="db-menu-del" onClick={() => { setMenu(false); onDelete(g); }}>Delete</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* compact row: BM + quick enrolled count, always visible */}
      <div className="db-card-compact">
        <select className={"db-bm" + (auto ? " auto" : "")} value={bm || ""} title={auto ? "Auto-assigned by routing" : ""} onClick={(e) => e.stopPropagation()} onChange={(e) => { e.stopPropagation(); onAssignBM(g.id, e.target.value); }}>
          <option value="">Unassigned</option>
          {bms.map((b) => <option key={b}>{b}</option>)}
        </select>
        <span className="db-compact-en" title="Enrolled / eligible">{en.enrolled}/{en.total}</span>
      </div>
      <div className="db-compact-eff" title="Effective date">Eff. {g.form.effectiveDate || "—"}</div>

      {open && (
        <div className="db-card-detail">
          <div className="db-card-loc">{g.form.address?.city}, {g.form.address?.state}</div>
          <div className="db-card-plans">{plans.slice(0, 3).map((p, i) => <span key={i} className="db-tag">{p}</span>)}{plans.length > 3 ? <span className="db-tag db-more">+{plans.length - 3}</span> : null}</div>

          <div className="db-enroll">
            <div className="db-enroll-top"><span>Enrolled</span><span className="db-enroll-n">{en.enrolled} / {en.total}</span></div>
            <div className="db-bar"><div className="db-bar-fill" style={{ width: en.pct + "%" }} /></div>
          </div>

          <div className="db-prog" onClick={(e) => e.stopPropagation()}>
            <div className="db-prog-row">
              <span className="db-prog-label">Docs</span>
              <div className="db-segs">
                {window.DOC_CHECKS.map((d) => (
                  <button key={d.key} className={"db-seg" + (checks[d.key] ? " on" : "")} title={d.label} onClick={() => onToggleCheck(g.id, d.key)} />
                ))}
              </div>
              <span className="db-prog-n">{docProg.done}/{docProg.total}</span>
            </div>
            {showStep && (
              <div className="db-prog-row">
                <span className="db-prog-label">Processing</span>
                <div className="db-segs">
                  {window.STEP_CHECKS.map((d) => (
                    <button key={d.key} className={"db-seg db-seg-step" + (checks[d.key] ? " on" : "")} title={d.label} onClick={() => onToggleCheck(g.id, d.key)} />
                  ))}
                </div>
                <span className="db-prog-n">{stepProg.done}/{stepProg.total}</span>
              </div>
            )}
          </div>
          <div className="db-card-foot">
            <button className="db-opendetails" onClick={() => onOpen(g.id)}>Open full details →</button>
            <div className="db-card-icons">
              {notes.length > 0 ? <span className="db-ic" title={notes.length + " notes"}>✎ {notes.length}</span> : null}
              <span className="db-ae">{g.form.accountExec ? g.form.accountExec.split(" ")[0] : ""}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Board({ groups, meta, fieldVal, bms, bmFor, isAutoBM, checksFor, onToggleCheck, onComplete, onOpen, onSetStatus, onAssignBM, onArchive, onDelete }) {
  const [dragId, setDragId] = React.useState(null);
  const [overCol, setOverCol] = React.useState(null);
  const onDragStart = (e, id) => { setDragId(id); e.dataTransfer.effectAllowed = "move"; };
  const onDrop = (statusId) => { if (dragId) onSetStatus(dragId, statusId); setDragId(null); setOverCol(null); };

  return (
    <div className="db-board">
      {window.STATUSES.filter((s) => !window.isClosed(s.id)).map((s) => {
        const cards = groups.filter((g) => (fieldVal(g, "status") || "new") === s.id);
        return (
          <div
            key={s.id}
            className={"db-col" + (overCol === s.id ? " over" : "")}
            onDragOver={(e) => { e.preventDefault(); setOverCol(s.id); }}
            onDragLeave={() => setOverCol((c) => (c === s.id ? null : c))}
            onDrop={() => onDrop(s.id)}
          >
            <div className="db-col-head" style={{ "--sc": s.color, "--st": s.tint }}>
              <span className="db-col-dot" />
              <span className="db-col-label">{s.label}</span>
              <span className="db-col-count">{cards.length}</span>
            </div>
            <div className="db-col-body">
              {cards.map((g) => (
                <GroupCard key={g.id} g={g} meta={meta[g.id]} checks={checksFor(g)} bms={bms} bmFor={bmFor} isAutoBM={isAutoBM} onToggleCheck={onToggleCheck} onComplete={onComplete} onOpen={onOpen} onDragStart={onDragStart} onAssignBM={onAssignBM} onArchive={onArchive} onDelete={onDelete} />
              ))}
              {cards.length === 0 && <div className="db-col-empty">Drop here</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ClosedView({ kind, groups, meta, onOpen, onReopen, onDelete }) {
  const isComplete = kind === "complete";
  if (!groups.length) {
    return <div className="db-arch-empty">{isComplete
      ? "No completed groups yet. When a group finishes enrolling, mark it complete and it lands here."
      : "No archived groups. Archive a group that goes unresponsive or drops off, and it lands here."}</div>;
  }
  return (
    <div className="db-closed-wrap">
      <div className={"db-closed-banner " + (isComplete ? "complete" : "archived")}>
        {isComplete
          ? <span><b>Complete</b> — these groups finished onboarding and are enrolled.</span>
          : <span><b>Archived</b> — these groups went unresponsive or dropped off before finishing. Reopen one if they re-engage.</span>}
      </div>
      <div className="db-arch-grid">
        {groups.map((g) => {
          const mv = meta[g.id] || {};
          const bm = ("benefitManager" in mv ? mv.benefitManager : g.benefitManager) || "Unassigned";
          const reason = mv.archiveReason || g.archiveReason;
          const closedAt = mv.closedAt || g.closedAt;
          const en = window.enrollmentOf(g, mv);
          return (
            <div key={g.id} className={"db-arch-card " + (isComplete ? "complete" : "archived")} onClick={() => onOpen(g.id)}>
              <div className="db-arch-top">
                <span className={"db-arch-badge " + (isComplete ? "complete" : "archived")}>{isComplete ? "✓ Complete" : "Archived"}</span>
                {closedAt ? <span className="db-arch-date">{window.fmtDate(closedAt)}</span> : null}
              </div>
              <div className="db-arch-name">{g.form.legalName}</div>
              <div className="db-arch-loc">{g.form.address?.city}, {g.form.address?.state}</div>
              {isComplete
                ? <div className="db-arch-meta">{en.enrolled} of {en.total} enrolled · Eff. {g.form.effectiveDate || "—"}</div>
                : <div className="db-arch-reason">{reason || "No reason recorded."}</div>}
              <div className="db-arch-foot">
                <span className="db-arch-bm">{bm}</span>
                <div className="db-arch-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="db-arch-unbtn" onClick={() => onReopen(g.id)}>Reopen</button>
                  <button className="db-arch-delbtn" onClick={() => onDelete(g)}>Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { Board, ClosedView });
