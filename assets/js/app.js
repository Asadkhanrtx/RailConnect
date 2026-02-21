// RailConnect Lite – purely front-end demo
(function(){
  const elYear = document.getElementById('year');
  if(elYear){ elYear.textContent = new Date().getFullYear(); }

  // --- Simple in-memory demo data ---
  const stations = [
    { code: 'TVC', name: 'Thiruvananthapuram Central' },
    { code: 'ERS', name: 'Ernakulam Junction' },
    { code: 'QLN', name: 'Kollam Junction' },
    { code: 'MAS', name: 'Puratchi Thalaivar Dr. M.G. Ramachandran Central (Chennai Central)' },
    { code: 'SBC', name: 'KSR Bengaluru' },
    { code: 'HYB', name: 'Hyderabad Deccan' },
    { code: 'NZM', name: 'Hazrat Nizamuddin' },
    { code: 'NDLS', name: 'New Delhi' },
  ];

  const trains = [
    { no: '12626', name: 'Kerala Express', from: 'TVC', to: 'NDLS', dep: '11:15', arr: '13:45+1', classes:['2A','3A','SL'] },
    { no: '12624', name: 'Trivandrum Mail', from: 'TVC', to: 'MAS', dep: '19:45', arr: '10:30+1', classes:['2A','3A','SL'] },
    { no: '12678', name: 'Bengaluru Express', from: 'ERS', to: 'SBC', dep: '20:30', arr: '06:15+1', classes:['3A','SL','CC'] },
    { no: '16346', name: 'Nethravathi Express', from: 'TVC', to: 'LTT', dep: '09:30', arr: '16:45+1', classes:['2A','3A','SL'] },
    { no: '12618', name: 'Mangaluru Express', from: 'TVC', to: 'ERS', dep: '06:15', arr: '11:10', classes:['CC','2S'] },
  ];

  function byId(id){ return document.getElementById(id); }
  function fmtStation(code){
    const s = stations.find(x=>x.code===code);
    return s ? `${s.name} (${s.code})` : code;
  }

  // --- Train search page logic ---
  if(byId('search-form')){
    const form = byId('search-form');
    const fromEl = byId('from');
    const toEl = byId('to');
    const dateEl = byId('journey-date');
    const outEl = byId('results');

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const from = fromEl.value.trim().toUpperCase();
      const to = toEl.value.trim().toUpperCase();
      const date = dateEl.value;

      const list = trains.filter(t=>t.from===from && t.to===to);
      outEl.innerHTML = '';

      if(!from || !to || !date){
        outEl.innerHTML = `<div class="alert alert-warning">Please fill From, To and Date.</div>`;
        return;
      }

      if(list.length===0){
        outEl.innerHTML = `<div class="alert alert-info">No direct trains found for ${from} → ${to} on ${date}. Try different stations.</div>`;
        return;
      }

      const rows = list.map(t=>{
        const classes = t.classes.map(c=>`<span class="badge rounded-pill text-bg-light me-1">${c}</span>`).join('');
        return `
          <tr>
            <td><div class="fw-semibold">${t.no}</div><div class="text-muted small">${t.name}</div></td>
            <td><div class="fw-semibold">${t.dep}</div><div class="text-muted small">${fmtStation(t.from)}</div></td>
            <td><div class="fw-semibold">${t.arr}</div><div class="text-muted small">${fmtStation(t.to)}</div></td>
            <td>${classes}</td>
            <td><button class="btn btn-sm btn-primary" data-train="${t.no}" onclick="window.mockBook('${t.no}','${date}')">Book</button></td>
          </tr>`;
      }).join('');

      outEl.innerHTML = `
        <div class="table-responsive">
          <table class="table align-middle">
            <thead><tr><th>Train</th><th>Departure</th><th>Arrival</th><th>Classes</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    });

    // simple station autocomplete (by code)
    [fromEl, toEl].forEach(inp=>{
      inp.addEventListener('input',()=>{ inp.value = inp.value.toUpperCase().replace(/[^A-Z]/g,''); });
      inp.setAttribute('placeholder','e.g., TVC');
    });
  }

  // --- PNR status mock ---
  if(byId('pnr-form')){
    const form = byId('pnr-form');
    const pnrEl = byId('pnr');
    const outEl = byId('pnr-result');

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const p = pnrEl.value.trim();
      if(!/^\d{10}$/.test(p)){
        outEl.innerHTML = `<div class="alert alert-warning">Enter a valid 10-digit PNR.</div>`;return;
      }
      const samples = [
        { status:'CNF', berth:'S3 / 23 Lower', chart:'Prepared' },
        { status:'WL 12 → CNF', berth:'S2 / 18 Upper', chart:'Prepared' },
        { status:'RAC 34', berth:'Side Lower', chart:'Not Prepared' },
      ];
      const s = samples[Math.floor(Math.random()*samples.length)];
      outEl.innerHTML = `
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">PNR: ${p}</h5>
            <p class="mb-1"><strong>Booking Status:</strong> ${s.status}</p>
            <p class="mb-1"><strong>Coach/Berth:</strong> ${s.berth}</p>
            <p class="mb-0"><strong>Charting:</strong> ${s.chart}</p>
          </div>
        </div>`;
    });
  }

  // simple booking modal replacement
  window.mockBook = function(trainNo, date){
    const t = trains.find(x=>x.no===trainNo);
    if(!t) return alert('Train not found');
    const msg = `Booking (demo) for ${t.name} (${t.no})

`+
                `From: ${fmtStation(t.from)}
`+
                `To:   ${fmtStation(t.to)}
`+
                `Date: ${date}

`+
                `This is a front-end demo. No real booking is performed.`;
    alert(msg);
    try{
      const list = JSON.parse(localStorage.getItem('rc_bookings')||'[]');
      list.push({ ts:Date.now(), trainNo, date, from:t.from, to:t.to, name:t.name });
      localStorage.setItem('rc_bookings', JSON.stringify(list));
      window.location.href = '../pages/my-bookings.html';
    }catch(e){ console.warn('LocalStorage unavailable'); }
  }

  // my bookings page
  if(byId('booking-list')){
    const ul = byId('booking-list');
    const list = JSON.parse(localStorage.getItem('rc_bookings')||'[]').sort((a,b)=>b.ts-a.ts);
    if(list.length===0){
      ul.innerHTML = '<p class="text-muted">No demo bookings yet. Search trains and click Book.</p>';
    } else {
      ul.innerHTML = list.map(b=>{
        const d = new Date(b.ts);
        return `<div class="card mb-3"><div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <div class="fw-semibold">${b.name} (${b.trainNo})</div>
            <div class="text-muted small">${b.from} → ${b.to} • ${b.date} • Saved ${d.toLocaleString()}</div>
          </div>
          <button class="btn btn-outline-danger btn-sm" onclick="window.deleteBooking(${b.ts})">Delete</button>
        </div></div>`;
      }).join('');
    }
  }

  window.deleteBooking = function(ts){
    const list = JSON.parse(localStorage.getItem('rc_bookings')||'[]').filter(x=>x.ts!==ts);
    localStorage.setItem('rc_bookings', JSON.stringify(list));
    location.reload();
  }
})();
