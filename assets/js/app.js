// PlayPicks (No-Stakes Prediction Demo) – enhanced visuals
// This app uses LocalStorage and mock data only. No real money, no gambling.
(function(){
  const elYear = document.getElementById('year');
  if(elYear){ elYear.textContent = new Date().getFullYear(); }

  // ---------- Storage helpers ----------
  const S = {
    read(k, def){ try{ return JSON.parse(localStorage.getItem(k)) ?? def; }catch{ return def; } },
    write(k, v){ localStorage.setItem(k, JSON.stringify(v)); },
  };

  // ---------- User profile & balance ----------
  const PROFILE_KEY = 'pp_profile';
  const PICKS_KEY = 'pp_picks';
  const EVENTS_KEY = 'pp_events';

  function initProfile(){
    const p = S.read(PROFILE_KEY, null);
    if(!p){
      const profile = { nickname: 'Player'+Math.floor(Math.random()*1000), coins: 1000 };
      S.write(PROFILE_KEY, profile);
    }
  }

  function getProfile(){ initProfile(); return S.read(PROFILE_KEY, {}); }
  function setProfile(p){ S.write(PROFILE_KEY, p); }

  // ---------- Mock events with images ----------
  function initEvents(){
    let events = S.read(EVENTS_KEY, null);
    if(!events){
      const now = Date.now();
      const hour = 3600_000;
      events = [
        { id:'E1001', sport:'Cricket', sportImg:'assets/img/sports/cricket.svg', a:'Tigers', aImg:'assets/img/teams/tigers.svg', b:'Falcons', bImg:'assets/img/teams/falcons.svg', start: now+2*hour, mA:1.8, mB:2.1 },
        { id:'E1002', sport:'Football', sportImg:'assets/img/sports/football.svg', a:'Red FC', aImg:'assets/img/teams/redfc.svg', b:'Blue FC', bImg:'assets/img/teams/bluefc.svg', start: now+5*hour, mA:1.6, mB:2.4 },
        { id:'E1003', sport:'Tennis', sportImg:'assets/img/sports/tennis.svg', a:'Player X', aImg:'assets/img/teams/playerx.svg', b:'Player Y', bImg:'assets/img/teams/playery.svg', start: now+26*hour, mA:1.9, mB:1.9 },
        { id:'E1004', sport:'Cricket', sportImg:'assets/img/sports/cricket.svg', a:'Royals', aImg:'assets/img/teams/royals.svg', b:'Kings', bImg:'assets/img/teams/kings.svg', start: now+50*hour, mA:2.2, mB:1.7 },
      ].map(e=>({ ...e, status:'scheduled', winner:null }));
      S.write(EVENTS_KEY, events);
    }
  }
  function getEvents(){ initEvents(); return S.read(EVENTS_KEY, []); }
  function setEvents(evts){ S.write(EVENTS_KEY, evts); }

  // ---------- Picks ----------
  function getPicks(){ return S.read(PICKS_KEY, []); }
  function setPicks(p){ S.write(PICKS_KEY, p); }

  // ---------- Utilities ----------
  function fmtTime(ts){ const d = new Date(ts); return d.toLocaleString(); }
  function countdown(ts){
    const diff = Math.max(0, ts - Date.now());
    const h = Math.floor(diff/3600000);
    const m = Math.floor((diff%3600000)/60000);
    const s = Math.floor((diff%60000)/1000);
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }

  // ---------- Rendering helpers ----------
  function q(id){ return document.getElementById(id); }
  function showBalance(){
    const el = document.querySelectorAll('[data-profile-balance]');
    el.forEach(n=>{ n.textContent = getProfile().coins; });
  }

  // ---------- Events page ----------
  if(q('events-root')){
    renderEvents();
    showBalance();
    setInterval(()=>{
      document.querySelectorAll('[data-countdown]').forEach(node=>{
        const ts = Number(node.getAttribute('data-countdown'));
        node.textContent = countdown(ts);
      });
    },1000);
  }

  function renderEvents(){
    const root = q('events-root');
    const events = getEvents().sort((a,b)=>a.start-b.start);
    root.innerHTML = events.map(e=>{
      const now = Date.now();
      const locked = now >= e.start || e.status!=='scheduled';
      return `
        <div class="card card-event mb-3 shadow-sm event-bg">
          <div class="banner"></div>
          <div class="card-body">
            <div class="d-flex justify-content-between flex-wrap">
              <div class="d-flex align-items-center mb-2">
                <img src="${e.sportImg}" width="22" class="me-2" alt="${e.sport}">
                <div class="badge bg-secondary me-2">${e.sport}</div>
                <div class="small text-muted">Starts: ${fmtTime(e.start)} • <span class="countdown" data-countdown="${e.start}">${countdown(e.start)}</span></div>
              </div>
              <div class="text-end multipliers">
                <div class="small">Multipliers</div>
                <div><span class="badge bg-light text-dark me-1">${e.a}: ×${e.mA}</span><span class="badge bg-light text-dark">${e.b}: ×${e.mB}</span></div>
              </div>
            </div>

            <div class="row g-3 align-items-center mt-1">
              <div class="col-md-5 team">
                <img src="${e.aImg}" alt="${e.a}"><span class="name">${e.a}</span>
                <span class="text-muted mx-2">vs</span>
                <img src="${e.bImg}" alt="${e.b}"><span class="name">${e.b}</span>
              </div>
              <div class="col-sm-3">
                <label class="form-label">Pick</label>
                <select class="form-select" id="pick-${e.id}" ${locked?'disabled':''}>
                  <option value="A">${e.a}</option>
                  <option value="B">${e.b}</option>
                </select>
              </div>
              <div class="col-sm-2">
                <label class="form-label">Coins</label>
                <input type="number" min="1" step="1" value="50" class="form-control" id="coins-${e.id}" ${locked?'disabled':''} />
                <div class="form-text">Bal: <span class="coins" data-profile-balance></span></div>
              </div>
              <div class="col-sm-2 d-flex gap-2">
                <button class="btn btn-primary flex-fill" ${locked?'disabled':''} onclick="window.placePick('${e.id}')">Pick</button>
                <button class="btn btn-outline-secondary flex-fill" onclick="window.simulateResult('${e.id}')">Sim</button>
              </div>
            </div>

          </div>
        </div>`;
    }).join('');
  }

  // ---------- Actions ----------
  window.placePick = function(eventId){
    const events = getEvents();
    const e = events.find(x=>x.id===eventId);
    if(!e) return alert('Event not found');
    if(Date.now()>=e.start || e.status!=='scheduled'){ return alert('Event locked'); }

    const sel = document.getElementById('pick-'+eventId).value;
    const coins = parseInt(document.getElementById('coins-'+eventId).value,10) || 0;
    if(coins<=0) return alert('Enter coins > 0');

    const profile = getProfile();
    if(coins>profile.coins) return alert('Insufficient coins');

    profile.coins -= coins;
    setProfile(profile);

    const picks = getPicks();
    picks.push({ id:'P'+Date.now(), eventId, side:sel, coins, ts:Date.now(), status:'open', payout:0 });
    setPicks(picks);

    showBalance();
    alert('Pick placed!');
  };

  window.simulateResult = function(eventId){
    const events = getEvents();
    const e = events.find(x=>x.id===eventId);
    if(!e) return alert('Event not found');
    if(e.status!=='scheduled'){ return alert('Event already settled'); }

    const winner = Math.random()<0.5?'A':'B';
    e.status = 'finished';
    e.winner = winner;
    setEvents(events);

    const picks = getPicks();
    const profile = getProfile();
    picks.forEach(p=>{
      if(p.eventId===eventId && p.status==='open'){
        if(p.side===winner){
          const multiplier = winner==='A'? e.mA : e.mB;
          const win = Math.round(p.coins * multiplier);
          p.payout = win;
          profile.coins += win;
        }
        p.status = 'settled';
      }
    });
    setPicks(picks);
    setProfile(profile);
    showBalance();
    alert(`Result simulated. Winner: ${winner==='A'?e.a:e.b}`);
    if(q('events-root')) renderEvents();
    if(q('mypicks-root')) renderMyPicks();
  };

  window.cancelPick = function(pid){
    const picks = getPicks();
    const p = picks.find(x=>x.id===pid);
    if(!p) return;

    const events = getEvents();
    const e = events.find(x=>x.id===p.eventId);
    if(!e || Date.now()>=e.start || e.status!=='scheduled'){
      return alert('Cannot cancel after start');
    }

    const profile = getProfile();
    profile.coins += p.coins; // refund
    setProfile(profile);

    const updated = picks.filter(x=>x.id!==pid);
    setPicks(updated);
    showBalance();
    renderMyPicks();
  };

  // ---------- My Picks page ----------
  if(q('mypicks-root')){
    renderMyPicks();
    showBalance();
  }

  function renderMyPicks(){
    const root = q('mypicks-root');
    const picks = getPicks().sort((a,b)=>b.ts-a.ts);
    const events = getEvents();

    if(picks.length===0){
      root.innerHTML = '<p class="text-muted">No picks yet. Go to Events to place one.</p>';
      return;
    }

    root.innerHTML = picks.map(p=>{
      const e = events.find(x=>x.id===p.eventId) || {a:'?',b:'?',aImg:'',bImg:'',start:0,status:'?'};
      const sideName = p.side==='A'? e.a : e.b;
      const sideImg = p.side==='A'? e.aImg : e.bImg;
      const canCancel = Date.now()<e.start && e.status==='scheduled' && p.status==='open';
      const statusBadge = p.status==='open'? '<span class="badge bg-info">Open</span>' : '<span class="badge bg-success">Settled</span>';
      const payout = p.status==='settled'? `<div><strong>Payout:</strong> ${p.payout} coins</div>`:'';
      return `
        <div class="card mb-3 shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-center flex-wrap">
            <div class="d-flex align-items-center">
              <img src="${sideImg}" class="me-2" style="width:32px;height:32px;border-radius:50%" alt="pick">
              <div>
                <div class="fw-semibold">${e.a} vs ${e.b}</div>
                <div class="text-muted small">Pick: ${sideName} • Stake: ${p.coins} coins</div>
                ${payout}
              </div>
            </div>
            <div class="text-end">
              ${statusBadge}
              <div class="mt-2">
                ${canCancel? `<button class="btn btn-outline-danger btn-sm" onclick="window.cancelPick('${p.id}')">Cancel</button>`: ''}
              </div>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  // ---------- Leaderboard page ----------
  if(q('leaderboard-root')){
    renderLeaderboard();
    showBalance();
    const nickInp = q('nickname');
    const profile = getProfile();
    if(nickInp){ nickInp.value = profile.nickname; }
    const saveBtn = q('save-nick');
    if(saveBtn){ saveBtn.addEventListener('click',()=>{
      const p = getProfile();
      p.nickname = (nickInp.value||'').trim()||p.nickname;
      setProfile(p);
      renderLeaderboard();
    }); }
  }

  function renderLeaderboard(){
    const root = q('leaderboard-root');
    const profile = getProfile();
    const sample = [
      { nickname:'Aarav', coins: 1850 },
      { nickname:'Diya', coins: 1420 },
      { nickname:'Vikram', coins: 990 },
      { nickname: profile.nickname + ' (You)', coins: profile.coins },
    ].sort((a,b)=>b.coins-a.coins);

    root.innerHTML = `
      <div class="table-responsive">
        <table class="table align-middle">
          <thead><tr><th>#</th><th>Player</th><th>Coins</th></tr></thead>
          <tbody>
            ${sample.map((r,i)=>`<tr><td>${i+1}</td><td><span class="leader-avatar"></span>${r.nickname}</td><td>${r.coins}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }
})();
