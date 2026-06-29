/* ob-steps.jsx — standard wizard steps (everything except contributions). */

// Months for the effective-date dropdown (coverage always starts the 1st).
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function Field({ label, hint, required, full, children }) {
  return (
    <label className={"ob-field" + (full ? " full" : "")}>
      <span className="ob-label">{label}{required ? <i className="ob-req">*</i> : null}</span>
      {children}
      {hint ? <small className="ob-hint">{hint}</small> : null}
    </label>
  );
}

const T = (props) => <input className="ob-input" {...props} />;

/* ---------------- Group ---------------- */
function GroupStep({ form, update }) {
  const a = form.address || {};
  const setA = (patch) => update({ address: { ...a, ...patch } });
  return (
    <div className="ob-grid">
      <Field label="Legal company name" required full>
        <T value={form.legalName} onChange={(e) => update({ legalName: e.target.value })} placeholder="As it appears on tax documents" />
      </Field>
      <Field label="Doing-business-as (DBA)" hint="Only if different from legal name">
        <T value={form.dba} onChange={(e) => update({ dba: e.target.value })} placeholder="Optional" />
      </Field>
      <Field label="Federal EIN" hint="Optional — you can provide this later">
        <T value={form.ein} onChange={(e) => update({ ein: e.target.value })} placeholder="00-0000000" />
      </Field>
      <Field label="Industry" required>
        <select className="ob-input" value={form.industry} onChange={(e) => update({ industry: e.target.value })}>
          <option value="">Select…</option>
          {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
        </select>
      </Field>
      <Field label="Approx. # of W-2 employees" required hint="Eligible employees, not total headcount">
        <T type="number" min="1" value={form.employeeCount} onChange={(e) => update({ employeeCount: e.target.value })} placeholder="e.g. 24" />
      </Field>
      <Field label="Company website">
        <T value={form.website} onChange={(e) => update({ website: e.target.value })} placeholder="Optional" />
      </Field>
      <Field label="Street address" required full>
        <T value={a.street} onChange={(e) => setA({ street: e.target.value })} placeholder="Headquarters / billing address" />
      </Field>
      <Field label="City" required>
        <T value={a.city} onChange={(e) => setA({ city: e.target.value })} />
      </Field>
      <Field label="State" required>
        <select className="ob-input" value={a.state || ""} onChange={(e) => setA({ state: e.target.value })}>
          <option value="">—</option>
          {US_STATES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="ZIP" required>
        <T value={a.zip} onChange={(e) => setA({ zip: e.target.value })} />
      </Field>
    </div>
  );
}

/* ---------------- Contacts ---------------- */
function ContactsStep({ form, update }) {
  const p = form.primaryContact || {};
  const b = form.billingContact || {};
  const setP = (patch) => update({ primaryContact: { ...p, ...patch } });
  const setB = (patch) => update({ billingContact: { ...b, ...patch } });
  return (
    <div>
      <div className="ob-section-h">Primary contact <span>The decision-maker who manages benefits day-to-day</span></div>
      <div className="ob-grid">
        <Field label="First name" required><T value={p.firstName} onChange={(e) => setP({ firstName: e.target.value })} /></Field>
        <Field label="Last name" required><T value={p.lastName} onChange={(e) => setP({ lastName: e.target.value })} /></Field>
        <Field label="Title / role"><T value={p.title} onChange={(e) => setP({ title: e.target.value })} placeholder="e.g. HR Manager, Owner" /></Field>
        <Field label="Phone" required><T value={p.phone} onChange={(e) => setP({ phone: e.target.value })} placeholder="(000) 000-0000" /></Field>
        <Field label="Email" required full><T type="email" value={p.email} onChange={(e) => setP({ email: e.target.value })} placeholder="name@company.com" /></Field>
      </div>

      <div className="ob-section-h" style={{ marginTop: 26 }}>Billing contact</div>
      <label className="ob-check-row">
        <input type="checkbox" checked={form.billingSame !== false} onChange={(e) => update({ billingSame: e.target.checked })} />
        <span>Same as primary contact</span>
      </label>
      {form.billingSame === false && (
        <div className="ob-grid" style={{ marginTop: 14 }}>
          <Field label="First name"><T value={b.firstName} onChange={(e) => setB({ firstName: e.target.value })} /></Field>
          <Field label="Last name"><T value={b.lastName} onChange={(e) => setB({ lastName: e.target.value })} /></Field>
          <Field label="Phone"><T value={b.phone} onChange={(e) => setB({ phone: e.target.value })} /></Field>
          <Field label="Email"><T type="email" value={b.email} onChange={(e) => setB({ email: e.target.value })} /></Field>
        </div>
      )}

      <div className="ob-section-h" style={{ marginTop: 26 }}>Your Zion contact</div>
      <div className="ob-grid">
        <Field label="Which Account Executive referred you?" full>
          <select className="ob-input" value={form.accountExec || ""} onChange={(e) => update({ accountExec: e.target.value })}>
            <option value="">Select…</option>
            {(window.referralOptions ? window.referralOptions() : ACCOUNT_EXECS).map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
      </div>
    </div>
  );
}

/* ---------------- Plans & coverage ---------------- */
function PlanCard({ plan, on, onToggle }) {
  return (
    <button type="button" className={"ob-plan" + (on ? " on" : "")} onClick={onToggle}>
      <div className="ob-plan-check">{on ? "✓" : ""}</div>
      <div className="ob-plan-body">
        <div className="ob-plan-name">{plan.name}{plan.tag ? <span className="ob-pop">{plan.tag}</span> : null}</div>
        <div className="ob-plan-blurb">{plan.blurb}</div>
        {plan.note ? <div className="ob-plan-note">★ {plan.note}</div> : null}
      </div>
    </button>
  );
}

function PlansStep({ form, update }) {
  const sel = form.selectedPlans || [];
  const toggle = (id) => update({ selectedPlans: sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id] });
  return (
    <div>
      <div className="ob-grid ob-grid-1">
        <Field label="Requested effective month" required hint="Coverage always begins on the 1st of the month you choose.">
          <select className="ob-input" value={form.effectiveDate || ""} onChange={(e) => update({ effectiveDate: e.target.value })} style={{ maxWidth: 280 }}>
            <option value="">Select a month…</option>
            {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
      </div>

      <div className="ob-help">
        Check the boxes for the plans you'd like to offer. Interested in <b>Dental, Vision, or additional coverage options</b>? Your Benefit Manager can help — just mention it during your setup meeting.
      </div>

      <div className="ob-section-h" style={{ marginTop: 8 }}>Zion HealthShare program <span>Choose the IUA level — the amount a member pays per medical need before sharing begins</span></div>
      <div className="ob-plans">
        {MEDICAL_PLANS.map((p) => <PlanCard key={p.id} plan={p} on={sel.includes(p.id)} onToggle={() => toggle(p.id)} />)}
      </div>

      <div className="ob-section-h" style={{ marginTop: 26 }}>Add-on programs <span>Optional — layer on as many as you like</span></div>
      <div className="ob-plans">
        {ADDON_PLANS.map((p) => <PlanCard key={p.id} plan={p} on={sel.includes(p.id)} onToggle={() => toggle(p.id)} />)}
      </div>
    </div>
  );
}

/* ---------------- Employee classes ---------------- */
let CLS_SEQ = 1;
function ClassesStep({ form, update }) {
  const classes = form.classes || [];
  const add = (name) => update({ classes: [...classes, { id: "c" + (CLS_SEQ++) + "-" + Date.now().toString(36), name: name || "New class", desc: "", eligiblePlanIds: [...(form.selectedPlans || [])] }] });
  const setC = (id, patch) => update({ classes: classes.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const del = (id) => update({ classes: classes.filter((c) => c.id !== id) });
  const used = classes.map((c) => c.name);
  return (
    <div>
      <div className="ob-help">
        <b>Optional.</b> Employee classes let you offer different plans or contributions to different groups (e.g. salaried vs. hourly). Most groups don't need any — just continue and your contributions will apply to everyone. Add classes only if different groups should get different amounts.
      </div>
      <div className="ob-tpl">
        <span>Quick add:</span>
        {CLASS_TEMPLATES.filter((t) => !used.includes(t)).map((t) => (
          <button key={t} type="button" className="ob-tpl-chip" onClick={() => add(t)}>+ {t}</button>
        ))}
      </div>
      <div className="ob-classes">
        {classes.map((c, i) => (
          <div className="ob-class" key={c.id}>
            <div className="ob-class-n">{i + 1}</div>
            <div className="ob-class-fields">
              <input className="ob-input ob-class-name" value={c.name} onChange={(e) => setC(c.id, { name: e.target.value })} placeholder="Class name" />
            </div>
            <button type="button" className="ob-del" title="Remove" onClick={() => del(c.id)}>×</button>
          </div>
        ))}
        {classes.length === 0 && <div className="ob-empty-prev">No classes yet — use a quick-add chip or the button below.</div>}
      </div>
      <button type="button" className="ob-add" onClick={() => add("")}>+ Add a custom class</button>
    </div>
  );
}

/* ---------------- Group setup (waiting period, language, payroll, history) ---------------- */
function SetupStep({ form, update }) {
  return (
    <div>
      <div className="ob-section-h">Eligibility</div>
      <div className="ob-grid">
        <Field label="Waiting period for new hires" required hint="How long new employees wait before becoming eligible. Applied automatically when they're added.">
          <select className="ob-input" value={form.waitingPeriod || ""} onChange={(e) => update({ waitingPeriod: e.target.value })}>
            <option value="">Select…</option>
            {WAITING_PERIODS.map((w) => <option key={w}>{w}</option>)}
          </select>
        </Field>
        <Field label="Language needs" hint="Any employees who need assistance in another language? Tell us which.">
          <T value={form.languageNeeds} onChange={(e) => update({ languageNeeds: e.target.value })} placeholder="e.g. Spanish — 4 employees (optional)" />
        </Field>
      </div>

      <div className="ob-section-h" style={{ marginTop: 26 }}>Payroll</div>
      <div className="ob-grid">
        <Field label="Payroll schedule" required hint="Lets us show employees their per-paycheck deduction.">
          <select className="ob-input" value={form.payrollSchedule || ""} onChange={(e) => update({ payrollSchedule: e.target.value })}>
            <option value="">Select…</option>
            {PAYROLL_SCHEDULES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Payroll provider" hint="Some providers integrate with Employee Navigator for a small fee.">
          <T value={form.payrollProvider} onChange={(e) => update({ payrollProvider: e.target.value })} placeholder="e.g. Gusto, ADP, QuickBooks" />
        </Field>
        <Field label="Interested in payroll integration?" full>
          <div className="ob-seg">
            <button type="button" className={form.payrollIntegration === "Yes" ? "on" : ""} onClick={() => update({ payrollIntegration: "Yes" })}>Yes</button>
            <button type="button" className={form.payrollIntegration === "No" ? "on" : ""} onClick={() => update({ payrollIntegration: "No" })}>No</button>
            <button type="button" className={form.payrollIntegration === "Not sure" ? "on" : ""} onClick={() => update({ payrollIntegration: "Not sure" })}>Not sure yet</button>
          </div>
        </Field>
      </div>

      <div className="ob-section-h" style={{ marginTop: 26 }}>Benefits background</div>
      <div className="ob-radio-list">
        {PAST_BENEFITS.map((p) => (
          <label key={p} className={"ob-radio" + (form.pastBenefits === p ? " on" : "")}>
            <input type="radio" name="pastBenefits" checked={form.pastBenefits === p} onChange={() => update({ pastBenefits: p })} />
            <span className="ob-radio-dot" />
            <span>{p}</span>
          </label>
        ))}
      </div>
      {form.pastBenefits === "Other" && (
        <label className="ob-field" style={{ marginTop: 12 }}>
          <span className="ob-label">Please describe</span>
          <textarea className="ob-input" rows="2" value={form.pastBenefitsOther || ""} onChange={(e) => update({ pastBenefitsOther: e.target.value })} placeholder="Tell us what your company offered before" />
        </label>
      )}
    </div>
  );
}

/* ---------------- Review ---------------- */
function Row({ k, v }) { return <div className="ob-rev-row"><dt>{k}</dt><dd>{v || <em>—</em>}</dd></div>; }

function ReviewStep({ form, goTo }) {
  const a = form.address || {};
  const p = form.primaryContact || {};
  const plans = (form.selectedPlans || []).map(planById).filter(Boolean);
  const contributions = form.contributions || {};
  return (
    <div className="ob-review">
      <div className="ob-rev-block">
        <div className="ob-rev-h">Company <button type="button" onClick={() => goTo("group")}>Edit</button></div>
        <dl>
          <Row k="Legal name" v={form.legalName} />
          <Row k="EIN" v={form.ein} />
          <Row k="Industry" v={form.industry} />
          <Row k="Employees" v={form.employeeCount} />
          <Row k="Address" v={[a.street, a.city, a.state, a.zip].filter(Boolean).join(", ")} />
        </dl>
      </div>
      <div className="ob-rev-block">
        <div className="ob-rev-h">Primary contact <button type="button" onClick={() => goTo("contacts")}>Edit</button></div>
        <dl>
          <Row k="Name" v={[p.firstName, p.lastName].filter(Boolean).join(" ")} />
          <Row k="Email" v={p.email} />
          <Row k="Phone" v={p.phone} />
          <Row k="Referred by" v={form.accountExec} />
        </dl>
      </div>
      <div className="ob-rev-block">
        <div className="ob-rev-h">Plans & effective date <button type="button" onClick={() => goTo("plans")}>Edit</button></div>
        <dl>
          <Row k="Effective" v={form.effectiveDate} />
          <Row k="Programs" v={plans.map((p) => p.name).join(" · ")} />
        </dl>
      </div>
      <div className="ob-rev-block">
        <div className="ob-rev-h">Group setup <button type="button" onClick={() => goTo("setup")}>Edit</button></div>
        <dl>
          <Row k="Waiting period" v={form.waitingPeriod} />
          <Row k="Language needs" v={form.languageNeeds} />
          <Row k="Payroll schedule" v={form.payrollSchedule} />
          <Row k="Payroll provider" v={form.payrollProvider} />
          <Row k="Payroll integration" v={form.payrollIntegration} />
          <Row k="Prior benefits" v={form.pastBenefits === "Other" && form.pastBenefitsOther ? `Other — ${form.pastBenefitsOther}` : form.pastBenefits} />
        </dl>
      </div>
      <div className="ob-rev-block">
        <div className="ob-rev-h">Contributions <button type="button" onClick={() => goTo("contributions")}>Edit</button></div>
        {(() => {
          const hasClasses = (form.classes || []).length > 0;
          const units = hasClasses ? form.classes : [{ id: "__all", name: "All employees", eligiblePlanIds: form.selectedPlans }];
          const fmtAmt = (v, method) => method === "percent" ? ((Number(v) || 0) + "%") : ("$" + (Number(v) || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }));
          return units.map((u) => {
            const elig = (form.selectedPlans || []).map(planById).filter(Boolean);
            const data = contributions[u.id] || {};
            return (
              <div className="ob-rev-class" key={u.id}>
                <div className="ob-rev-class-n">{u.name}</div>
                {elig.length === 0 ? <div className="ob-rev-class-d"><em>No plans selected</em></div> : elig.map((p) => {
                  const v = data[p.id] || {};
                  const m = v.method === "percent" ? "percent" : "fixed";
                  return (
                    <div className="ob-rev-class-d" key={p.id}>
                      <b>{p.name}</b> — EE {fmtAmt(v.mo, m)} · +Spouse {fmtAmt(v.es, m)} · +Child {fmtAmt(v.ec, m)} · Family {fmtAmt(v.fam, m)}
                    </div>
                  );
                })}
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}

Object.assign(window, { Field, GroupStep, ContactsStep, PlansStep, ClassesStep, SetupStep, ReviewStep });
