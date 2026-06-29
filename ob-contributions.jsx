/* ob-admin.jsx — Benefit Manager booking-link routing.
   An admin maps (referring AE + state) -> a BM and a booking link.
   On the confirmation screen the matching link is shown; no match -> no link. */

const BM_LS = "zion_bm_routing_v1";

// Region maps provided by the team (Benefit Manager states per Account Executive).
// UT for Cameron is split Tim(2)/Crystal(1) — assigned to Tim here; adjust as needed.
const DEFAULT_ROUTING = [
  { id: "cam-crystal", referrer: "Cameron Morris", bmName: "Crystal Jessop", link: "",
    states: ["CA","AZ","SD","MN","WI","MI","IN","OH","WV","PA","NY","VT","NH","MA","CT","RI","ME","NJ","DE","MD","DC"] },
  { id: "cam-jeff", referrer: "Cameron Morris", bmName: "Jeff Burnett", link: "",
    states: ["KS","MO","OK","AR","NM","TX","LA","MS","AL","GA","TN","KY","SC","NC","VA","FL"] },
  { id: "cam-tim", referrer: "Cameron Morris", bmName: "Tim Garden", link: "",
    states: ["OR","ID","MT","ND","NE","IA","IL","WY","CO","NV","AK","HI","UT"] },
  { id: "hay-aaron", referrer: "Hayley DeHaan", bmName: "Aaron Adams", link: "",
    states: ["WI","MI","IL","IN","OH","WV","KY","TN","VA","NC","SC","GA","FL","AL","MS","LA","AR","MO","KS","OK","TX","IA","PA","NY","NJ","DE","MD","DC","CT","RI","MA","NH","VT","ME"] },
  { id: "hay-josh", referrer: "Hayley DeHaan", bmName: "Josh Gilbert", link: "",
    states: ["OR","ID","MT","ND","SD","MN","NE","WY","CO","UT","NV","CA","AZ","NM","AK","HI"] },
];

function loadRouting() {
  try { const r = JSON.parse(localStorage.getItem(BM_LS)); return (Array.isArray(r) && r.length) ? r : DEFAULT_ROUTING; }
  catch { return DEFAULT_ROUTING; }
}
function saveRouting(rules) { try { localStorage.setItem(BM_LS, JSON.stringify(rules)); } catch {} }

// Most-specific match wins: referrer+state (3) > referrer only (2) > state only (1) > Any (0).
// resolveRule matches regardless of booking link (used for BM auto-assignment).
function resolveRule(rules, ae, state, requireLink) {
  let best = null, bestScore = -1;
  (rules || []).forEach((r) => {
    const refOk = !r.referrer || r.referrer === "Any" || r.referrer === ae;
    const hasStates = r.states && r.states.length > 0;
    const stOk = !hasStates || (state && r.states.includes(state));
    if (refOk && stOk && (!requireLink || r.link)) {
      const score = (r.referrer && r.referrer !== "Any" ? 2 : 0) + (hasStates ? 1 : 0);
      if (score > bestScore) { bestScore = score; best = r; }
    }
  });
  return best;
}
// booking link resolver (requires a link on the matched rule)
function resolveBooking(rules, ae, state) { return resolveRule(rules, ae, state, true); }

const REFERRER_OPTS = ["Any", "Cameron Morris", "Hayley DeHaan"];

function StateMultiSelect({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const sel = value || [];
  const toggle = (s) => onChange(sel.includes(s) ? sel.filter((x) => x !== s) : [...sel, s]);
  const filtered = US_STATES.filter((s) => s.includes(q.toUpperCase().trim()));
  return (
    <div className="ob-sms">
      <div className="ob-sms-field" onClick={() => setOpen((o) => !o)}>
        {sel.length === 0 ? (
          <span className="ob-sms-ph">Any state</span>
        ) : (
          <div className="ob-sms-chips">
            {sel.map((s) => (
              <span key={s} className="ob-sms-chip" onClick={(e) => { e.stopPropagation(); toggle(s); }}>{s}<i>×</i></span>
            ))}
          </div>
        )}
        <span className="ob-sms-caret">{open ? "▴" : "▾"}</span>
      </div>
      {open && (
        <>
          <div className="ob-sms-scrim" onClick={() => setOpen(false)} />
          <div className="ob-sms-panel">
            <div className="ob-sms-top">
              <input autoFocus className="ob-input" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
              <button type="button" className="ob-sms-act" onClick={() => onChange([...US_STATES])}>All</button>
              <button type="button" className="ob-sms-act" onClick={() => onChange([])}>Clear</button>
            </div>
            <div className="ob-sms-grid">
              {filtered.map((s) => (
                <button key={s} type="button" className={"ob-sms-opt" + (sel.includes(s) ? " on" : "")} onClick={() => toggle(s)}>{s}</button>
              ))}
            </div>
            <div className="ob-sms-foot">
              <span>{sel.length} selected</span>
              <button type="button" className="ob-sms-done" onClick={() => setOpen(false)}>Done</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AdminModal({ rules, bms, aes, onAddBM, onRemoveBM, onAddAE, onRemoveAE, onSave, onClose }) {
  const [draft, setDraft] = React.useState(() => JSON.parse(JSON.stringify(rules)));
  const [newBM, setNewBM] = React.useState("");
  const [newAE, setNewAE] = React.useState("");
  const manageBMs = Array.isArray(bms);
  const manageAEs = Array.isArray(aes);
  const referrerOpts = manageAEs ? ["Any", ...aes] : REFERRER_OPTS;
  const setR = (id, patch) => setDraft((d) => d.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const newId = () => "r" + Date.now().toString(36) + Math.floor(Math.random() * 99);
  const [openId, setOpenId] = React.useState(rules[0] ? rules[0].id : null);
  const add = () => { const id = newId(); setDraft((d) => [...d, { id, referrer: "Any", states: [], bmName: "", link: "" }]); setOpenId(id); };
  const del = (id) => setDraft((d) => d.filter((r) => r.id !== id));
  const summarize = (r) => {
    const ref = !r.referrer || r.referrer === "Any" ? "Any referrer" : r.referrer;
    const st = !r.states || r.states.length === 0 ? "any state" : r.states.length <= 3 ? r.states.join(", ") : `${r.states.length} states`;
    const bm = r.bmName ? r.bmName : (r.link ? "link set" : "no link");
    return { ref, st, bm };
  };

  return (
    <div className="ob-modal-bg" onClick={onClose}>
      <div className="ob-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ob-modal-head">
          <div>
            <div className="ob-modal-t">Benefit Managers & routing</div>
            <div className="ob-modal-s">New groups are <b>auto-assigned a Benefit Manager</b> (and shown a booking link) based on who referred them and their state. Most-specific rule wins; groups matching no rule stay unassigned.</div>
          </div>
          <button className="ob-modal-x" onClick={onClose}>×</button>
        </div>

        {manageBMs && (
          <div className="ob-bmmgr">
            <div className="ob-bmmgr-h">Your Benefit Managers</div>
            <div className="ob-bmmgr-list">
              {bms.map((b) => (
                <span className="ob-bmmgr-chip" key={b}>{b}<button title="Remove" onClick={() => onRemoveBM(b)}>×</button></span>
              ))}
              {bms.length === 0 && <span className="ob-bmmgr-empty">No Benefit Managers yet — add one below.</span>}
            </div>
            <div className="ob-bmmgr-add">
              <input className="ob-input" value={newBM} placeholder="Add a Benefit Manager…" onChange={(e) => setNewBM(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && newBM.trim()) { onAddBM(newBM); setNewBM(""); } }} />
              <button className="ob-btn" onClick={() => { if (newBM.trim()) { onAddBM(newBM); setNewBM(""); } }}>Add</button>
            </div>
          </div>
        )}

        {manageAEs && (
          <div className="ob-bmmgr">
            <div className="ob-bmmgr-h">Account Executives</div>
            <div className="ob-bmmgr-list">
              {aes.map((a) => (
                <span className="ob-bmmgr-chip ob-bmmgr-chip-ae" key={a}>{a}<button title="Remove" onClick={() => onRemoveAE(a)}>×</button></span>
              ))}
              {aes.length === 0 && <span className="ob-bmmgr-empty">No Account Executives yet — add one below.</span>}
            </div>
            <div className="ob-bmmgr-add">
              <input className="ob-input" value={newAE} placeholder="Add an Account Executive…" onChange={(e) => setNewAE(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && newAE.trim()) { onAddAE(newAE); setNewAE(""); } }} />
              <button className="ob-btn" onClick={() => { if (newAE.trim()) { onAddAE(newAE); setNewAE(""); } }}>Add</button>
            </div>
          </div>
        )}

        <div className="ob-rules">
          {draft.map((r, i) => {
            const open = openId === r.id;
            const s = summarize(r);
            return (
              <div className={"ob-rulecard" + (open ? " open" : "")} key={r.id}>
                <div className="ob-rulecard-head" onClick={() => setOpenId(open ? null : r.id)}>
                  <span className="ob-rulecard-caret">{open ? "▾" : "▸"}</span>
                  <div className="ob-rulecard-sum">
                    <span className="ob-sum-ref">{s.ref}</span>
                    <span className="ob-sum-sep">·</span>
                    <span className="ob-sum-st">{s.st}</span>
                    <span className="ob-sum-arrow">→</span>
                    <span className="ob-sum-bm">{s.bm}</span>
                  </div>
                  <button className="ob-del" title="Remove rule" onClick={(e) => { e.stopPropagation(); del(r.id); }}>×</button>
                </div>
                {open && (
                  <div className="ob-rulecard-grid">
                    <label className="ob-rf">
                      <span>Referred by</span>
                      <select className="ob-input" value={r.referrer} onChange={(e) => setR(r.id, { referrer: e.target.value })}>
                        {referrerOpts.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </label>
                    <label className="ob-rf">
                      <span>Benefit Manager</span>
                      {manageBMs ? (
                        <select className="ob-input" value={r.bmName || ""} onChange={(e) => setR(r.id, { bmName: e.target.value })}>
                          <option value="">Select…</option>
                          {bms.map((b) => <option key={b}>{b}</option>)}
                        </select>
                      ) : (
                        <input className="ob-input" value={r.bmName} placeholder="Name" onChange={(e) => setR(r.id, { bmName: e.target.value })} />
                      )}
                    </label>
                    <label className="ob-rf ob-rf-full">
                      <span>States <i>— leave empty to match any state</i></span>
                      <StateMultiSelect value={r.states} onChange={(v) => setR(r.id, { states: v })} />
                    </label>
                    <label className="ob-rf ob-rf-full">
                      <span>Booking link</span>
                      <input className="ob-input" value={r.link} placeholder="https://outlook.office.com/bookwithme/…" onChange={(e) => setR(r.id, { link: e.target.value })} />
                    </label>
                  </div>
                )}
              </div>
            );
          })}
          {draft.length === 0 && <div className="ob-empty-prev">No rules — every group sees next steps without a booking link.</div>}
        </div>

        <button className="ob-add" style={{ marginTop: 14 }} onClick={add}>+ Add routing rule</button>

        <div className="ob-modal-foot">
          <button className="ob-btn ob-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="ob-btn" onClick={() => { onSave(draft); onClose(); }}>Save routing</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { loadRouting, saveRouting, resolveBooking, resolveRule, AdminModal, DEFAULT_ROUTING });
