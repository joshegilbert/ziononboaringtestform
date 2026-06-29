<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Zion — Groups Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
<style>
  :root{
    --bg:#eef2f5; --surface:#ffffff; --surface-2:#f7f9fb;
    --ink:#15242f; --ink-2:#33454f; --muted:#5f717c; --faint:#93a3ad;
    --line:#dde5ea; --line-2:#e8eef2;
    --accent:#1496c9; --accent-dark:#15607e;
    --accent-tint:color-mix(in oklab, var(--accent) 9%, white);
    --accent-tint-2:color-mix(in oklab, var(--accent) 16%, white);
    --internal:#7a4a2b; --internal-tint:#f7f1ea;
    --radius:14px; --radius-sm:9px;
    --hfont:'Libre Franklin', Georgia, serif;
    --ui:'Libre Franklin', system-ui, -apple-system, sans-serif;
    --shadow:0 1px 2px rgba(27,38,34,.04), 0 8px 28px -14px rgba(27,38,34,.18);
  }
  *{box-sizing:border-box;}
  html,body{margin:0;height:100%;}
  body{background:var(--bg);color:var(--ink);font-family:var(--ui);-webkit-font-smoothing:antialiased;font-size:14px;}
  #root{height:100%;}
  .ds-root{height:100%;display:flex;flex-direction:column;}

  /* header */
  .ds-head{display:flex;justify-content:space-between;align-items:center;padding:18px 26px;background:var(--surface);border-bottom:1px solid var(--line);flex:none;}
  .ds-head-l{display:flex;align-items:center;gap:14px;}
  .ds-logo{width:118px;height:40px;flex:none;background:url('zion-logo.png') left center/contain no-repeat;}
  .ds-head-l>div:last-child{border-left:1px solid var(--line);padding-left:14px;}
  .ds-head h1{font-family:var(--hfont);font-size:21px;font-weight:700;margin:0;letter-spacing:-.01em;}
  .ds-sub{font-size:12.5px;color:var(--muted);margin-top:1px;}
  .ds-head-r{display:flex;align-items:center;gap:10px;}
  .ds-whoami{display:flex;align-items:center;gap:7px;background:var(--surface);border:1px solid var(--line);border-radius:9px;padding:4px 8px 4px 5px;}
  .ds-whoami-av{width:28px;height:28px;flex:none;border-radius:50%;background:linear-gradient(160deg,var(--accent),var(--accent-dark));color:#fff;display:grid;place-items:center;font-size:11.5px;font-weight:700;}
  .ds-whoami select{font:inherit;font-size:13px;font-weight:600;border:none;background:none;color:var(--ink-2);cursor:pointer;padding-right:2px;}
  .ds-whoami select:focus{outline:none;}
  .ds-btn{font:inherit;font-size:13.5px;font-weight:600;background:linear-gradient(135deg,#1aa0d3,var(--accent-dark));color:#fff;border:none;border-radius:9px;padding:10px 16px;cursor:pointer;text-decoration:none;transition:.15s;}
  .ds-btn:hover{filter:brightness(.94);}
  .ds-btn-ghost{background:var(--surface);color:var(--ink-2);border:1px solid var(--line);}
  .ds-btn-ghost:hover{background:var(--surface-2);border-color:var(--accent);color:var(--accent);}

  /* stat chips */
  .ds-stats{display:flex;gap:10px;padding:16px 26px 4px;flex:none;flex-wrap:wrap;}
  .ds-stat{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:96px;background:var(--surface);border:1px solid var(--line);border-left:3px solid var(--sc);border-radius:11px;padding:11px 15px;cursor:pointer;transition:.15s;font:inherit;}
  .ds-stat:hover{box-shadow:var(--shadow);}
  .ds-stat.on{background:var(--st);border-color:var(--sc);}
  .ds-stat-n{font-size:22px;font-weight:700;color:var(--sc);font-family:var(--hfont);line-height:1;}
  .ds-stat-l{font-size:12px;font-weight:600;color:var(--muted);letter-spacing:.02em;}

  /* toolbar */
  .ds-toolbar{display:flex;align-items:center;gap:12px;padding:14px 26px;flex:none;flex-wrap:wrap;}
  .ds-search{flex:1;max-width:360px;font:inherit;font-size:14px;border:1px solid var(--line);border-radius:9px;padding:9px 13px;background:var(--surface);}
  .ds-search:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in oklab, var(--accent) 16%, transparent);}
  .ds-filter{display:flex;align-items:center;gap:7px;font-size:13px;color:var(--muted);font-weight:500;}
  .ds-filter select{font:inherit;font-size:13.5px;border:1px solid var(--line);border-radius:8px;padding:8px 10px;background:var(--surface);color:var(--ink-2);}
  .ds-clear{font:inherit;font-size:13px;color:var(--accent);background:none;border:none;cursor:pointer;font-weight:600;}
  .ds-clear:hover{text-decoration:underline;}
  .ds-count{margin-left:auto;font-size:12.5px;color:var(--faint);}
  .ds-viewtoggle{display:inline-flex;background:var(--surface);border:1px solid var(--line);border-radius:9px;padding:3px;gap:2px;}
  .ds-viewtoggle button{font:inherit;font-size:13px;font-weight:600;border:none;background:none;color:var(--muted);padding:6px 13px;border-radius:6px;cursor:pointer;}
  .ds-viewtoggle button.on{background:var(--accent-tint);color:var(--accent);}

  /* pipeline board */
  .ds-boardwrap{flex:1;overflow:auto;padding:2px 26px 22px;}
  .db-board{display:flex;gap:14px;height:100%;min-height:0;align-items:flex-start;}
  .db-col{flex:1;min-width:248px;max-width:340px;background:var(--surface-2);border:1px solid var(--line);border-radius:var(--radius);display:flex;flex-direction:column;max-height:100%;transition:.15s;}
  .db-col.over{border-color:var(--accent);background:var(--accent-tint);box-shadow:0 0 0 2px color-mix(in oklab, var(--accent) 22%, transparent);}
  .db-col-head{display:flex;align-items:center;gap:9px;padding:13px 15px;border-bottom:1px solid var(--line-2);}
  .db-col-dot{width:9px;height:9px;border-radius:50%;background:var(--sc);flex:none;}
  .db-col-label{font-weight:700;font-size:13.5px;color:var(--ink);flex:1;}
  .db-col-count{font-size:12px;font-weight:600;color:var(--sc);background:var(--st);border-radius:20px;padding:2px 9px;}
  .db-col-body{padding:11px;display:flex;flex-direction:column;gap:10px;overflow-y:auto;flex:1;}
  .db-col-empty{font-size:12.5px;color:var(--faint);text-align:center;padding:24px 10px;border:1px dashed var(--line);border-radius:10px;}
  .db-card{background:var(--surface);border:1px solid var(--line);border-radius:11px;padding:11px 12px;transition:.12s;box-shadow:0 1px 2px rgba(27,38,34,.04);}
  .db-card:hover{border-color:var(--accent);box-shadow:var(--shadow);}
  .db-card.open{box-shadow:var(--shadow);}
  .db-card:active{cursor:grabbing;}
  .db-caret{flex:none;width:18px;height:18px;border:none;background:none;color:var(--muted);font-size:11px;cursor:pointer;padding:0;border-radius:5px;}
  .db-caret:hover{background:var(--surface-2);color:var(--accent);}
  .db-card-compact{display:flex;align-items:center;gap:8px;margin-top:9px;}
  .db-compact-en{font-size:12px;font-weight:600;color:var(--muted);font-variant-numeric:tabular-nums;flex:none;}
  .db-compact-eff{font-size:11.5px;color:var(--faint);margin-top:6px;padding-left:25px;}
  .db-card-detail{margin-top:11px;padding-top:11px;border-top:1px solid var(--line-2);}
  .db-opendetails{font:inherit;font-size:12px;font-weight:600;color:var(--accent);background:none;border:none;cursor:pointer;padding:0;}
  .db-opendetails:hover{text-decoration:underline;}
  .db-card-top{margin-bottom:2px;}
  .db-card-headrow{display:flex;align-items:center;gap:7px;}
  .db-card-name{font-weight:600;font-size:14px;color:var(--ink);line-height:1.25;flex:1;cursor:pointer;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .db-card-name:hover{color:var(--accent);}
  .db-card-loc{font-size:12px;color:var(--faint);margin-top:1px;}
  .db-menu-wrap{position:relative;flex:none;}
  .db-menu-btn{border:none;background:none;color:var(--faint);font-size:18px;line-height:1;cursor:pointer;padding:0 4px;border-radius:6px;}
  .db-menu-btn:hover{background:var(--surface-2);color:var(--ink);}
  .db-menu-scrim{position:fixed;inset:0;z-index:20;}
  .db-menu{position:absolute;top:100%;right:0;z-index:21;background:var(--surface);border:1px solid var(--line);border-radius:9px;box-shadow:0 12px 30px -10px rgba(20,28,25,.35);padding:5px;min-width:120px;display:flex;flex-direction:column;}
  .db-menu button{font:inherit;font-size:13px;font-weight:500;text-align:left;border:none;background:none;color:var(--ink-2);padding:8px 11px;border-radius:6px;cursor:pointer;}
  .db-menu button:hover{background:var(--surface-2);}
  .db-menu-del{color:#bd5a3c !important;}
  .db-menu-del:hover{background:#fbeeea !important;}
  .db-menu-done{color:#0c7a5a !important;}
  .db-menu-done:hover{background:#e0f1ea !important;}

  .db-checks{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:11px;}
  .db-check{display:inline-flex;align-items:center;gap:5px;font:inherit;font-size:11px;font-weight:600;color:var(--muted);background:var(--surface-2);border:1px solid var(--line);border-radius:6px;padding:3px 7px 3px 5px;cursor:pointer;transition:.12s;}
  .db-check:hover{border-color:var(--accent);}
  .db-check-box{width:13px;height:13px;flex:none;border-radius:4px;border:1.5px solid var(--faint);display:grid;place-items:center;font-size:9px;color:#fff;background:transparent;transition:.12s;}
  .db-check.on{color:var(--accent);background:var(--accent-tint);border-color:color-mix(in oklab, var(--accent) 30%, white);}
  .db-check.on .db-check-box{background:var(--accent);border-color:var(--accent);}
  .db-check-step.on{color:#8a6810;background:#f7f0dd;border-color:#e2cf95;}
  .db-check-step.on .db-check-box{background:#b08415;border-color:#b08415;}

  /* card enrollment + progress bars */
  .db-bar{height:6px;border-radius:4px;background:var(--line-2);overflow:hidden;}
  .db-bar-fill{height:100%;background:var(--accent);border-radius:4px;transition:width .2s;}
  .db-enroll{margin-bottom:11px;}
  .db-enroll-top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px;}
  .db-enroll-top span{font-size:11.5px;color:var(--muted);font-weight:500;}
  .db-enroll-n{font-weight:700 !important;color:var(--ink) !important;font-variant-numeric:tabular-nums;}
  .db-prog{display:flex;flex-direction:column;gap:7px;margin-bottom:11px;}
  .db-prog-row{display:flex;align-items:center;gap:9px;}
  .db-prog-label{font-size:11px;font-weight:600;color:var(--muted);width:74px;flex:none;}
  .db-segs{display:flex;gap:3px;flex:1;}
  .db-seg{flex:1;height:7px;border-radius:3px;background:var(--line-2);border:none;padding:0;cursor:pointer;transition:.12s;}
  .db-seg:hover{background:color-mix(in oklab, var(--accent) 35%, var(--line-2));}
  .db-seg.on{background:var(--accent);}
  .db-seg-step.on{background:#b08415;}
  .db-prog-n{font-size:11px;font-weight:600;color:var(--muted);font-variant-numeric:tabular-nums;flex:none;width:24px;text-align:right;}

  /* drawer checklist bars + enrollment tracker */
  .dd-cl{margin-bottom:16px;}
  .dd-cl:last-child{margin-bottom:0;}
  .dd-cl-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:7px;}
  .dd-cl-title{font-size:13px;font-weight:600;color:var(--ink-2);}
  .dd-cl-count{font-size:12.5px;color:var(--muted);font-variant-numeric:tabular-nums;}
  .dd-cl-count b{color:var(--ink);}
  .dd-bar{height:8px;border-radius:5px;background:var(--line-2);overflow:hidden;}
  .dd-bar.big{height:10px;}
  .dd-bar-fill{height:100%;background:var(--accent);border-radius:5px;transition:width .2s;}
  .dd-bar.step .dd-bar-fill{background:#b08415;}
  .dd-cl-items{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px;}
  .dd-cl-item{display:inline-flex;align-items:center;gap:7px;font:inherit;font-size:12.5px;font-weight:500;color:var(--ink-2);background:var(--surface-2);border:1px solid var(--line);border-radius:8px;padding:6px 11px 6px 8px;cursor:pointer;transition:.12s;}
  .dd-cl-item:hover{border-color:var(--accent);}
  .dd-cl-box{width:16px;height:16px;flex:none;border-radius:5px;border:1.5px solid var(--faint);display:grid;place-items:center;font-size:10px;color:#fff;transition:.12s;}
  .dd-cl-item.on{color:var(--accent);background:var(--accent-tint);border-color:color-mix(in oklab, var(--accent) 30%, white);}
  .dd-cl-item.on .dd-cl-box{background:var(--accent);border-color:var(--accent);}
  .dd-cl-item.step.on{color:#8a6810;background:#f7f0dd;border-color:#e2cf95;}
  .dd-cl-item.step.on .dd-cl-box{background:#b08415;border-color:#b08415;}
  .dd-enrolltrack{margin-top:16px;padding-top:16px;border-top:1px solid var(--line-2);}
  .dd-enroll-inputs{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;}
  .dd-enroll-inputs-3{grid-template-columns:1fr 1fr 1fr;}

  /* archived grid */
  .db-arch-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:13px;align-content:start;}
  .db-arch-card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:15px;cursor:pointer;transition:.12s;}
  .db-arch-card:hover{border-color:var(--accent);box-shadow:var(--shadow);}
  .db-arch-name{font-weight:600;font-size:14.5px;color:var(--ink);}
  .db-arch-loc{font-size:12px;color:var(--faint);margin-top:1px;}
  .db-arch-meta{font-size:12.5px;color:var(--muted);margin:10px 0 12px;}
  .db-arch-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;border-top:1px solid var(--line-2);padding-top:11px;}
  .db-arch-bm{font-size:12px;font-weight:600;color:var(--ink-2);}
  .db-arch-actions{display:flex;gap:6px;}
  .db-arch-unbtn{font:inherit;font-size:12px;font-weight:600;color:var(--accent);background:var(--accent-tint);border:1px solid color-mix(in oklab, var(--accent) 24%, white);border-radius:7px;padding:5px 10px;cursor:pointer;}
  .db-arch-unbtn:hover{background:var(--accent-tint-2);}
  .db-arch-delbtn{font:inherit;font-size:12px;font-weight:600;color:#bd5a3c;background:none;border:1px solid var(--line);border-radius:7px;padding:5px 10px;cursor:pointer;}
  .db-arch-delbtn:hover{background:#fbeeea;border-color:#d98a72;}
  .db-arch-empty{font-size:14px;color:var(--faint);text-align:center;padding:60px 20px;}
  /* closed view: complete vs archived */
  .db-closed-banner{font-size:13.5px;color:var(--ink-2);padding:11px 15px;border-radius:10px;margin-bottom:16px;border:1px solid var(--line);}
  .db-closed-banner.complete{background:#e0f1ea;border-color:#b6ddca;color:#0a5f46;}
  .db-closed-banner.archived{background:#eef0f1;border-color:#dadde0;color:#5f6469;}
  .db-arch-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
  .db-arch-badge{font-size:10.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;border-radius:6px;padding:3px 8px;}
  .db-arch-badge.complete{color:#0c7a5a;background:#e0f1ea;}
  .db-arch-badge.archived{color:#8a8f93;background:#eef0f1;}
  .db-arch-date{font-size:11.5px;color:var(--faint);font-variant-numeric:tabular-nums;}
  .db-arch-card.complete{border-left:3px solid #0c7a5a;}
  .db-arch-card.archived{border-left:3px solid #b6babd;}
  .db-arch-reason{font-size:12.5px;color:var(--ink-2);margin-top:7px;line-height:1.45;font-style:italic;}

  /* drawer: checklist + danger */
  .dd-checks{display:flex;flex-wrap:wrap;gap:8px;}
  .dd-checks-sub{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--faint);margin:14px 0 9px;}
  .dd-check{display:inline-flex;align-items:center;gap:8px;font:inherit;font-size:13px;font-weight:500;color:var(--ink-2);background:var(--surface-2);border:1px solid var(--line);border-radius:9px;padding:8px 13px 8px 9px;cursor:pointer;transition:.12s;}
  .dd-check:hover{border-color:var(--accent);}
  .dd-check-box{width:17px;height:17px;flex:none;border-radius:5px;border:1.5px solid var(--faint);display:grid;place-items:center;font-size:11px;color:#fff;transition:.12s;}
  .dd-check.on{color:var(--accent);background:var(--accent-tint);border-color:color-mix(in oklab, var(--accent) 30%, white);}
  .dd-check.on .dd-check-box{background:var(--accent);border-color:var(--accent);}
  .dd-check-step.on{color:#8a6810;background:#f7f0dd;border-color:#e2cf95;}
  .dd-check-step.on .dd-check-box{background:#b08415;border-color:#b08415;}
  .dd-sec-danger{background:var(--surface);border-color:var(--line);}
  .dd-danger-row{display:flex;align-items:center;justify-content:space-between;gap:16px;}
  .dd-danger-t{font-weight:600;font-size:14px;color:var(--ink);}
  .dd-danger-d{font-size:12.5px;color:var(--muted);margin-top:3px;max-width:42ch;line-height:1.45;}
  .dd-danger-btns{display:flex;gap:8px;flex:none;}
  .dd-archive-btn{font:inherit;font-size:13px;font-weight:600;color:var(--ink-2);background:var(--surface-2);border:1px solid var(--line);border-radius:8px;padding:8px 15px;cursor:pointer;}
  .dd-archive-btn:hover{border-color:var(--accent);color:var(--accent);}
  .dd-delete-btn{font:inherit;font-size:13px;font-weight:600;color:#bd5a3c;background:none;border:1px solid #e3b8aa;border-radius:8px;padding:8px 15px;cursor:pointer;}
  .dd-delete-btn:hover{background:#fbeeea;}
  .dd-complete-btn{font:inherit;font-size:13px;font-weight:600;color:#fff;background:#0c7a5a;border:1px solid #0c7a5a;border-radius:8px;padding:8px 15px;cursor:pointer;}
  .dd-complete-btn:hover{background:#0a6b4f;}
  .dd-reopen-btn{font:inherit;font-size:13px;font-weight:600;color:var(--accent);background:var(--accent-tint);border:1px solid color-mix(in oklab, var(--accent) 24%, white);border-radius:8px;padding:8px 15px;cursor:pointer;}
  .dd-reopen-btn:hover{background:var(--accent-tint-2);}
  .dd-closed-tag{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;border-radius:7px;padding:5px 11px;}
  .dd-closed-tag.complete{color:#0c7a5a;background:#e0f1ea;}
  .dd-closed-tag.archived{color:#8a8f93;background:#eef0f1;}
  .db-card-meta{display:flex;flex-wrap:wrap;gap:5px;margin:10px 0 9px;}
  .db-pill{font-size:11px;font-weight:500;color:var(--ink-2);background:var(--surface-2);border:1px solid var(--line-2);border-radius:6px;padding:2px 7px;white-space:nowrap;}
  .db-card-plans{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:11px;}
  .db-tag{font-size:10.5px;font-weight:600;color:var(--accent);background:var(--accent-tint);border-radius:5px;padding:2px 6px;white-space:nowrap;}
  .db-tag.db-more{color:var(--muted);background:var(--surface-2);}
  .db-card-foot{display:flex;align-items:center;gap:8px;justify-content:space-between;border-top:1px solid var(--line-2);padding-top:10px;}
  .db-bm{font:inherit;font-size:12px;font-weight:500;border:1px solid var(--line);border-radius:7px;padding:5px 7px;background:var(--surface);color:var(--ink-2);max-width:140px;}
  .db-bm:focus{outline:none;border-color:var(--accent);}
  .db-card-icons{display:flex;align-items:center;gap:9px;flex:none;}
  .db-ic{font-size:11.5px;color:var(--muted);font-weight:600;}
  .db-ae{font-size:11px;color:var(--faint);font-weight:600;}

  /* detail: notes timeline + custom fields */
  .dd-note-add{display:flex;flex-direction:column;gap:8px;margin-bottom:14px;}
  .dd-note-add textarea{font:inherit;font-size:13.5px;border:1px solid var(--line);border-radius:9px;padding:9px 11px;background:var(--surface);resize:vertical;}
  .dd-note-add textarea:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 2px color-mix(in oklab, var(--accent) 16%, transparent);}
  .dd-note-btn{align-self:flex-end;font:inherit;font-size:13px;font-weight:600;color:#fff;background:var(--accent);border:none;border-radius:8px;padding:8px 16px;cursor:pointer;}
  .dd-note-btn:hover{background:var(--accent-dark);}
  .dd-note-btn:disabled{background:var(--line);color:var(--faint);cursor:default;}
  .dd-notes{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:9px;}
  .dd-note{background:var(--surface-2);border:1px solid var(--line-2);border-radius:9px;padding:10px 12px;}
  .dd-note-head{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
  .dd-note-avatar{width:24px;height:24px;flex:none;border-radius:50%;background:color-mix(in oklab, var(--accent) 16%, white);color:var(--accent-dark);display:grid;place-items:center;font-size:10.5px;font-weight:700;}
  .dd-note-author{font-size:12.5px;font-weight:600;color:var(--ink);}
  .dd-note-meta{font-size:11.5px;color:var(--faint);font-weight:500;}
  .dd-note-actions{margin-left:auto;display:flex;gap:2px;}
  .dd-note-actions button{border:none;background:none;color:var(--faint);font-size:14px;line-height:1;cursor:pointer;padding:3px 5px;border-radius:6px;}
  .dd-note-actions button:hover{background:var(--surface);color:var(--accent);}
  .dd-note-actions button[title="Delete"]:hover{color:#bd5a3c;}
  .dd-note-text{font-size:13.5px;color:var(--ink-2);line-height:1.45;white-space:pre-wrap;}
  .dd-note-edit textarea{width:100%;font:inherit;font-size:13.5px;border:1px solid var(--accent);border-radius:8px;padding:8px 10px;background:var(--surface);resize:vertical;box-shadow:0 0 0 2px color-mix(in oklab, var(--accent) 14%, transparent);}
  .dd-note-edit textarea:focus{outline:none;}
  .dd-note-edit-foot{display:flex;justify-content:flex-end;gap:7px;margin-top:7px;}
  .dd-note-cancel{font:inherit;font-size:12.5px;font-weight:600;color:var(--muted);background:none;border:none;cursor:pointer;padding:5px 10px;}
  .dd-note-save{font:inherit;font-size:12.5px;font-weight:600;color:#fff;background:var(--accent);border:none;border-radius:7px;padding:6px 14px;cursor:pointer;}
  .dd-note-save:hover{background:var(--accent-dark);}
  .dd-notes-empty{font-size:13px;color:var(--faint);}
  .dd-cf-hint{font-size:12px;color:var(--muted);margin-bottom:11px;}
  .dd-cf-list{display:flex;flex-direction:column;gap:8px;margin-bottom:12px;}
  .dd-cf{display:flex;align-items:center;gap:9px;}
  .dd-cf-k{flex:none;min-width:120px;text-align:left;font:inherit;font-size:13px;font-weight:600;color:var(--ink-2);background:none;border:none;border-bottom:1px dashed transparent;cursor:pointer;padding:0;}
  .dd-cf-k:hover{border-bottom-color:var(--faint);color:var(--ink);}
  .dd-cf-v{flex:1;font:inherit;font-size:13.5px;border:1px solid var(--line);border-radius:8px;padding:7px 10px;background:var(--surface);}
  .dd-cf-v:focus{outline:none;border-color:var(--accent);}
  .dd-cf-del{flex:none;border:none;background:none;color:var(--faint);font-size:17px;cursor:pointer;padding:0 4px;}
  .dd-cf-del:hover{color:#bd5a3c;}
  .dd-cf-add{display:flex;gap:8px;align-items:center;border-top:1px solid var(--line-2);padding-top:12px;}
  .dd-cf-add input{font:inherit;font-size:13px;border:1px solid var(--line);border-radius:8px;padding:7px 10px;background:var(--surface);}
  .dd-cf-add input:first-child{flex:none;width:160px;}
  .dd-cf-add input:nth-child(2){flex:1;}
  .dd-cf-add input:focus{outline:none;border-color:var(--accent);}
  .dd-cf-btn{font:inherit;font-size:13px;font-weight:600;color:var(--accent);background:var(--accent-tint);border:1px solid color-mix(in oklab, var(--accent) 24%, white);border-radius:8px;padding:7px 13px;cursor:pointer;white-space:nowrap;}
  .dd-cf-btn:disabled{color:var(--faint);background:var(--surface-2);border-color:var(--line);cursor:default;}

  /* table */
  .ds-tablewrap{flex:1;overflow:auto;margin:0 26px 22px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface);box-shadow:var(--shadow);}
  .ds-table{border-collapse:separate;border-spacing:0;width:max-content;min-width:100%;font-size:13px;}
  .ds-table th,.ds-table td{border-bottom:1px solid var(--line-2);border-right:1px solid var(--line-2);padding:0;text-align:left;vertical-align:middle;}
  .ds-table thead th{position:sticky;top:0;z-index:4;background:var(--surface-2);padding:11px 13px;font-size:11px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:var(--faint);white-space:nowrap;}
  .ds-table tbody td{padding:9px 13px;color:var(--ink-2);white-space:nowrap;max-width:300px;overflow:hidden;text-overflow:ellipsis;}
  .ds-num{text-align:right;font-variant-numeric:tabular-nums;}
  .ds-empty{color:var(--faint);}

  /* frozen first two columns */
  .ds-fz{position:sticky;z-index:5;background:var(--surface);}
  thead .ds-fz{z-index:6;background:var(--surface-2);}
  .ds-fz-1{left:0;min-width:210px;box-shadow:none;}
  .ds-fz-2{left:210px;min-width:120px;border-right:2px solid var(--line);}
  thead .ds-fz-2{border-right:2px solid var(--line);}
  .ds-company{cursor:pointer;}
  .ds-company:hover{background:var(--accent-tint);}
  .ds-company-name{display:block;font-weight:600;color:var(--ink);font-size:13.5px;}
  .ds-company-sub{display:block;font-size:11.5px;color:var(--faint);margin-top:1px;}

  /* internal columns visually separated */
  .ds-int-h{background:var(--internal-tint) !important;color:var(--internal) !important;}
  .ds-int-cell{background:color-mix(in oklab, var(--internal) 4%, white);}
  .ds-int-cell input,.ds-int-cell select{width:100%;font:inherit;font-size:13px;border:1px solid transparent;background:transparent;border-radius:6px;padding:6px 8px;color:var(--ink);transition:.12s;}
  .ds-int-cell input:hover,.ds-int-cell select:hover{border-color:var(--line);background:var(--surface);}
  .ds-int-cell input:focus,.ds-int-cell select:focus{outline:none;border-color:var(--internal);background:var(--surface);box-shadow:0 0 0 2px color-mix(in oklab, var(--internal) 18%, transparent);}

  /* editable client cells */
  .ds-edit-cell{padding:4px 6px !important;}
  .ds-edit-cell input,.ds-edit-cell select{width:100%;font:inherit;font-size:13px;border:1px solid transparent;background:transparent;border-radius:6px;padding:5px 7px;color:var(--ink-2);transition:.12s;}
  .ds-edit-cell input:hover,.ds-edit-cell select:hover{border-color:var(--line);background:var(--surface-2);}
  .ds-edit-cell input:focus,.ds-edit-cell select:focus{outline:none;border-color:var(--accent);background:var(--surface);box-shadow:0 0 0 2px color-mix(in oklab, var(--accent) 16%, transparent);}
  .ds-edit-cell.ds-num input{text-align:right;}

  /* custom (Excel-like) columns */
  .ds-cust-h{background:#f3f1ea !important;}
  .ds-cust-h .ds-cust-label{cursor:pointer;border-bottom:1px dashed transparent;}
  .ds-cust-h .ds-cust-label:hover{border-bottom-color:var(--faint);}
  .ds-cust-del{border:none;background:none;color:var(--faint);font-size:14px;line-height:1;cursor:pointer;margin-left:7px;padding:0 2px;border-radius:4px;}
  .ds-cust-del:hover{color:#bd5a3c;}
  .ds-cust-cell{padding:4px 6px !important;background:color-mix(in oklab, #b8a06a 5%, white);}
  .ds-cust-cell input{width:100%;font:inherit;font-size:13px;border:1px solid transparent;background:transparent;border-radius:6px;padding:5px 7px;color:var(--ink-2);transition:.12s;}
  .ds-cust-cell input:hover{border-color:var(--line);background:var(--surface);}
  .ds-cust-cell input:focus{outline:none;border-color:#b08415;background:var(--surface);box-shadow:0 0 0 2px color-mix(in oklab, #b08415 16%, transparent);}
  .ds-addcol-h{background:var(--surface-2) !important;min-width:96px;}
  .ds-addcol{font:inherit;font-size:12px;font-weight:600;color:var(--accent);background:var(--accent-tint);border:1px dashed color-mix(in oklab, var(--accent) 38%, white);border-radius:7px;padding:5px 10px;cursor:pointer;white-space:nowrap;}
  .ds-addcol:hover{background:var(--accent-tint-2);}
  .ds-addcol-cell{background:var(--surface);}

  /* drawer: edit toggle + editable rows */
  .dd-sec-h-edit{display:flex;align-items:center;justify-content:space-between;}
  .dd-edit-toggle{font:inherit;font-size:12px;font-weight:600;color:var(--accent);background:var(--accent-tint);border:1px solid color-mix(in oklab, var(--accent) 22%, white);border-radius:7px;padding:4px 12px;cursor:pointer;}
  .dd-edit-toggle:hover{background:var(--accent-tint-2);}
  .dd-edit-toggle.on{background:var(--accent);color:#fff;border-color:var(--accent);}
  .dd-editing{display:block;}
  .dd-erow{display:flex;flex-direction:column;gap:5px;margin-bottom:11px;}
  .dd-erow:last-child{margin-bottom:0;}
  .dd-elabel{font-size:12px;font-weight:600;color:var(--ink-2);}
  .dd-erow input,.dd-erow select,.dd-erow textarea{font:inherit;font-size:13.5px;border:1px solid var(--line);border-radius:8px;padding:8px 10px;background:var(--surface);color:var(--ink);resize:vertical;}
  .dd-erow input:focus,.dd-erow select:focus,.dd-erow textarea:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 2px color-mix(in oklab, var(--accent) 16%, transparent);}

  /* drawer: plan picker + contribution editor */
  .dd-planpick{margin-bottom:16px;}
  .dd-planpick-h{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--faint);margin-bottom:9px;}
  .dd-planpick-chips{display:flex;flex-wrap:wrap;gap:7px;}
  .dd-planchip{display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:12.5px;font-weight:500;color:var(--ink-2);background:var(--surface-2);border:1.5px solid var(--line);border-radius:8px;padding:6px 11px 6px 8px;cursor:pointer;transition:.12s;}
  .dd-planchip:hover{border-color:var(--accent);}
  .dd-planchip.on{color:var(--accent);background:var(--accent-tint);border-color:color-mix(in oklab, var(--accent) 30%, white);font-weight:600;}
  .dd-planchip-box{width:15px;height:15px;flex:none;border-radius:4px;border:1.5px solid var(--faint);display:grid;place-items:center;font-size:9px;color:#fff;}
  .dd-planchip.on .dd-planchip-box{background:var(--accent);border-color:var(--accent);}
  .dd-contrib-edit th{text-align:center;}
  .dd-contrib-edit th:first-child,.dd-contrib-edit td:first-child{text-align:left;}
  .dd-ce-name{font-size:12.5px;color:var(--ink-2);white-space:nowrap;}
  .dd-ce-method{font:inherit;font-size:13px;border:1px solid var(--line);border-radius:6px;padding:5px 6px;background:var(--surface);cursor:pointer;}
  .dd-ce-in{width:62px;font:inherit;font-size:13px;border:1px solid var(--line);border-radius:6px;padding:6px 7px;background:var(--surface);text-align:right;color:var(--ink);}
  .dd-ce-in:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 2px color-mix(in oklab, var(--accent) 16%, transparent);}
  .dd-ce-empty{text-align:center;color:var(--faint);font-size:13px;padding:14px;}

  /* status pill */
  .ds-status select{font:inherit;font-size:12px;font-weight:700;border:1px solid;border-radius:20px;padding:5px 10px;cursor:pointer;appearance:none;}
  .ds-status select:focus{outline:none;}

  .ds-noresults{text-align:center;color:var(--faint);padding:40px;font-size:14px;}

  /* detail drawer */
  .dd-scrim{position:fixed;inset:0;background:rgba(20,28,25,.4);backdrop-filter:blur(2px);z-index:40;display:flex;justify-content:flex-end;}
  .dd{width:min(620px,100%);height:100%;background:var(--bg);overflow-y:auto;box-shadow:-20px 0 60px -20px rgba(20,28,25,.4);animation:ddin .22s ease;}
  @keyframes ddin{from{transform:translateX(30px);opacity:.4;}to{transform:translateX(0);opacity:1;}}
  .dd-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:24px 26px 18px;background:var(--surface);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:2;}
  .dd-eyebrow{font-size:12px;color:var(--muted);margin-bottom:5px;}
  .dd-title{font-family:var(--hfont);font-size:24px;font-weight:700;margin:0;letter-spacing:-.015em;}
  .dd-x{width:34px;height:34px;flex:none;border-radius:9px;border:1px solid var(--line);background:var(--surface);font-size:21px;color:var(--muted);cursor:pointer;}
  .dd-x:hover{background:var(--surface-2);color:var(--ink);}
  .dd-body{padding:20px 26px 60px;display:flex;flex-direction:column;gap:16px;}
  .dd-sec{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:18px 20px;}
  .dd-sec h3{font-family:var(--hfont);font-size:15px;font-weight:700;margin:0 0 14px;color:var(--ink);}
  .dd-sec-internal{border-color:color-mix(in oklab, var(--internal) 30%, white);background:var(--internal-tint);}
  .dd-sec-internal h3{color:var(--internal);}
  .dd-sec dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:9px 18px;}
  .dd-row{display:contents;}
  .dd-row dt{color:var(--muted);font-size:13px;}
  .dd-row dd{margin:0;color:var(--ink);font-size:13px;font-weight:500;text-align:right;}
  .dd-row dd em{color:var(--faint);font-weight:400;}
  .dd-int-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 14px;margin-bottom:14px;}
  .dd-f{display:flex;flex-direction:column;gap:5px;}
  .dd-f-full{grid-column:1 / -1;}
  .dd-f>span{font-size:12px;font-weight:600;color:var(--ink-2);}
  .dd-f input,.dd-f select,.dd-f textarea{font:inherit;font-size:13.5px;border:1px solid var(--line);border-radius:8px;padding:8px 10px;background:var(--surface);color:var(--ink);resize:vertical;}
  .dd-f input:focus,.dd-f select:focus,.dd-f textarea:focus{outline:none;border-color:var(--internal);box-shadow:0 0 0 2px color-mix(in oklab, var(--internal) 16%, transparent);}
  .dd-plans-tags{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px;}
  .dd-tag{font-size:12px;font-weight:600;color:var(--accent);background:var(--accent-tint);border:1px solid color-mix(in oklab, var(--accent) 24%, white);border-radius:7px;padding:4px 9px;}
  .dd-contrib-unit{margin-bottom:14px;}
  .dd-contrib-unit:last-child{margin-bottom:0;}
  .dd-contrib-name{font-size:12.5px;font-weight:600;color:var(--ink-2);margin-bottom:7px;}
  .dd-contrib-tbl{width:100%;border-collapse:collapse;font-size:12.5px;}
  .dd-contrib-tbl th{text-align:right;font-weight:600;color:var(--faint);font-size:11px;text-transform:uppercase;letter-spacing:.03em;padding:6px 10px;border-bottom:1px solid var(--line-2);}
  .dd-contrib-tbl th:first-child,.dd-contrib-tbl td:first-child{text-align:left;}
  .dd-contrib-tbl td{padding:6px 10px;border-bottom:1px solid var(--line-2);color:var(--ink-2);text-align:right;font-variant-numeric:tabular-nums;}
  .dd-contrib-tbl tr:last-child td{border-bottom:none;}

  /* reused: admin modal + state multiselect (from form) */
  .ob-modal-bg{position:fixed;inset:0;background:rgba(20,28,25,.5);backdrop-filter:blur(3px);display:grid;place-items:center;padding:28px;z-index:60;}
  .ob-modal{background:var(--surface);border-radius:18px;width:min(720px,100%);max-height:88vh;overflow-y:auto;padding:26px 28px;box-shadow:0 30px 80px -20px rgba(20,28,25,.5);}
  .ob-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:22px;}
  .ob-modal-t{font-family:var(--hfont);font-weight:600;font-size:22px;color:var(--ink);}
  .ob-modal-s{font-size:13.5px;color:var(--muted);margin-top:6px;max-width:62ch;line-height:1.5;}
  .ob-modal-x{width:34px;height:34px;flex:none;border-radius:9px;border:1px solid var(--line);background:var(--surface);font-size:21px;line-height:1;color:var(--muted);cursor:pointer;}
  .ob-modal-x:hover{background:var(--surface-2);color:var(--ink);}
  .ob-modal-foot{display:flex;justify-content:flex-end;gap:10px;margin-top:22px;padding-top:18px;border-top:1px solid var(--line);}

  /* BM manager + auto-assign */
  .ob-bmmgr{background:var(--surface-2);border:1px solid var(--line);border-radius:12px;padding:15px 16px;margin-bottom:20px;}
  .ob-bmmgr-h{font-size:13px;font-weight:700;color:var(--ink);margin-bottom:11px;}
  .ob-bmmgr-list{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px;}
  .ob-bmmgr-chip{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--accent);background:var(--accent-tint);border:1px solid color-mix(in oklab, var(--accent) 26%, white);border-radius:8px;padding:5px 6px 5px 11px;}
  .ob-bmmgr-chip button{border:none;background:none;color:var(--accent);opacity:.55;font-size:15px;line-height:1;cursor:pointer;padding:0 2px;}
  .ob-bmmgr-chip button:hover{opacity:1;}
  .ob-bmmgr-empty{font-size:13px;color:var(--faint);}
  .ob-bmmgr-add{display:flex;gap:8px;}
  .ob-bmmgr-add .ob-input{flex:1;padding:9px 12px;font-size:14px;}
  .ob-bmmgr-add .ob-btn{padding:9px 18px;font-size:14px;}
  .ds-bm-auto{font-style:italic;color:var(--muted) !important;}
  .db-bm.auto{font-style:italic;color:var(--muted);}
  .dd-auto-tag{font-style:normal;font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#8a6810;background:#f7f0dd;border-radius:5px;padding:1px 6px;margin-left:7px;}
  .ob-input{width:100%;font:inherit;font-size:15px;color:var(--ink);background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-sm);padding:11px 13px;}
  .ob-input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in oklab, var(--accent) 16%, transparent);}
  select.ob-input{appearance:none;cursor:pointer;}
  .ob-btn{font:inherit;font-size:15px;font-weight:600;background:var(--accent);color:#fff;border:none;border-radius:10px;padding:11px 22px;cursor:pointer;}
  .ob-btn:hover{background:var(--accent-dark);}
  .ob-btn-ghost{background:none;color:var(--muted);}
  .ob-btn-ghost:hover{background:var(--surface-2);color:var(--ink);}
  .ob-add{font:inherit;font-size:14px;font-weight:600;color:var(--accent);background:var(--accent-tint);border:1px dashed color-mix(in oklab, var(--accent) 38%, white);border-radius:var(--radius-sm);padding:12px;width:100%;cursor:pointer;}
  .ob-add:hover{background:var(--accent-tint-2);}
  .ob-del{width:30px;height:30px;flex:none;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--faint);font-size:18px;line-height:1;cursor:pointer;}
  .ob-del:hover{border-color:#d98a72;color:#bd5a3c;background:#fbeeea;}
  .ob-empty-prev{font-size:13.5px;color:var(--faint);background:var(--surface-2);border:1px dashed var(--line);border-radius:10px;padding:16px;text-align:center;}
  .ob-rules{display:flex;flex-direction:column;gap:9px;}
  .ob-rulecard{border:1px solid var(--line);border-radius:12px;background:var(--surface-2);}
  .ob-rulecard.open{background:var(--surface);box-shadow:var(--shadow);position:relative;z-index:5;}
  .ob-rulecard-head{display:flex;align-items:center;gap:11px;padding:13px 15px;cursor:pointer;border-radius:12px;}
  .ob-rulecard.open .ob-rulecard-head{border-radius:12px 12px 0 0;}
  .ob-rulecard-head:hover{background:color-mix(in oklab, var(--accent) 4%, transparent);}
  .ob-rulecard-caret{color:var(--muted);font-size:11px;flex:none;width:12px;}
  .ob-rulecard-sum{display:flex;align-items:center;gap:8px;flex:1;font-size:13.5px;min-width:0;flex-wrap:wrap;}
  .ob-sum-ref{font-weight:600;color:var(--ink);}
  .ob-sum-sep,.ob-sum-arrow{color:var(--faint);}
  .ob-sum-st{color:var(--ink-2);}
  .ob-sum-bm{font-weight:600;color:var(--accent);}
  .ob-rulecard-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 14px;padding:4px 15px 16px;}
  .ob-rf{display:flex;flex-direction:column;gap:6px;}
  .ob-rf.ob-rf-full{grid-column:1 / -1;}
  .ob-rf>span{font-size:12.5px;font-weight:600;color:var(--ink-2);}
  .ob-rf>span i{font-style:normal;font-weight:400;color:var(--faint);}
  .ob-sms{position:relative;}
  .ob-sms-field{display:flex;align-items:center;gap:8px;min-height:42px;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--surface);padding:7px 10px;cursor:pointer;}
  .ob-sms-field:hover{border-color:color-mix(in oklab, var(--accent) 40%, var(--line));}
  .ob-sms-ph{color:var(--faint);font-size:14px;flex:1;}
  .ob-sms-chips{display:flex;flex-wrap:wrap;gap:5px;flex:1;}
  .ob-sms-chip{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:600;background:var(--accent-tint);color:var(--accent);border:1px solid color-mix(in oklab, var(--accent) 28%, white);border-radius:7px;padding:3px 4px 3px 8px;cursor:pointer;}
  .ob-sms-chip i{font-style:normal;font-size:14px;opacity:.6;width:14px;text-align:center;}
  .ob-sms-caret{color:var(--muted);font-size:12px;flex:none;}
  .ob-sms-scrim{position:fixed;inset:0;z-index:70;}
  .ob-sms-panel{position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:71;background:var(--surface);border:1px solid var(--line);border-radius:12px;box-shadow:0 18px 50px -16px rgba(20,28,25,.4);padding:12px;}
  .ob-sms-top{display:flex;gap:7px;margin-bottom:11px;}
  .ob-sms-top .ob-input{flex:1;padding:8px 11px;font-size:13.5px;}
  .ob-sms-act{font:inherit;font-size:12.5px;font-weight:600;color:var(--accent);background:var(--accent-tint);border:1px solid color-mix(in oklab, var(--accent) 24%, white);border-radius:8px;padding:0 12px;cursor:pointer;}
  .ob-sms-act:hover{background:var(--accent-tint-2);}
  .ob-sms-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:5px;max-height:188px;overflow-y:auto;}
  .ob-sms-opt{font:inherit;font-size:12.5px;font-weight:500;color:var(--ink-2);background:var(--surface-2);border:1px solid var(--line);border-radius:7px;padding:7px 0;cursor:pointer;transition:.12s;}
  .ob-sms-opt:hover{border-color:var(--accent);color:var(--accent);}
  .ob-sms-opt.on{background:var(--accent);color:#fff;border-color:var(--accent);}
  .ob-sms-foot{display:flex;justify-content:space-between;align-items:center;margin-top:11px;padding-top:10px;border-top:1px solid var(--line-2);}
  .ob-sms-foot>span{font-size:12.5px;color:var(--muted);}
  .ob-sms-done{font:inherit;font-size:13px;font-weight:600;color:#fff;background:var(--accent);border:none;border-radius:8px;padding:7px 16px;cursor:pointer;}
  .ob-sms-done:hover{background:var(--accent-dark);}

  @media (max-width:680px){
    .dd-int-grid{grid-template-columns:1fr;}
    .ob-rulecard-grid{grid-template-columns:1fr;}
    .ob-sms-grid{grid-template-columns:repeat(6,1fr);}
  }
</style>
</head>
<body>
  <div id="root"></div>

  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>

  <script type="text/babel" src="ob-data.jsx"></script>
  <script type="text/babel" src="ob-admin.jsx"></script>
  <script type="text/babel" src="dash-data.jsx"></script>
  <script type="text/babel" src="dash-board.jsx"></script>
  <script type="text/babel" src="dash-detail.jsx"></script>
  <script type="text/babel" src="dash-app.jsx"></script>
</body>
</html>
