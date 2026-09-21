/* =====================================================================
   LLM NEEDLE IN A HAYSTACK — Interactive Learning App
   ===================================================================== */

// ── Utilities ──────────────────────────────────────────────────────────
const qs  = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];
const el  = (tag, cls, html = '') => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
};

// ── Section colour palette ──────────────────────────────────────────────
const COLORS = {
  rag:      { bg: '#6c63ff', light: 'rgba(108,99,255,0.12)' },
  chunk:    { bg: '#00d2ff', light: 'rgba(0,210,255,0.12)'  },
  embed:    { bg: '#43e97b', light: 'rgba(67,233,123,0.12)' },
  metric:   { bg: '#f7971e', light: 'rgba(247,151,30,0.12)' },
  flat:     { bg: '#ff6584', light: 'rgba(255,101,132,0.12)'},
  hnsw:     { bg: '#c471ed', light: 'rgba(196,113,237,0.12)'},
  recall:   { bg: '#12c2e9', light: 'rgba(18,194,233,0.12)' },
  filter:   { bg: '#f64f59', light: 'rgba(246,79,89,0.12)'  },
};

// ── Progress tracking ───────────────────────────────────────────────────
const visited = new Set();
const SECTIONS = ['rag','chunk','embed','metric','flat','hnsw','recall','filter','quiz'];
function markVisited(id) {
  visited.add(id);
  const pct = Math.round((visited.size / SECTIONS.length) * 100);
  const fill = qs('.progress-bar-fill');
  if (fill) fill.style.width = pct + '%';
}

// =====================================================================
//  SECTION 1 — RAG Overview
// =====================================================================
function buildRAG() {
  const sec = el('div','section');
  sec.id = 'rag';
  sec.innerHTML = `
    <div class="section-header">
      <div class="section-icon" style="background:${COLORS.rag.light}">🔍</div>
      <div>
        <div class="section-num">Section 01</div>
        <h2>Why LLMs Need a Retrieval Layer</h2>
      </div>
    </div>
    <div class="card">
      <p>LLMs don't have access to your company's private documents. Instead, a
      <strong><span data-tip="Retrieval-Augmented Generation: fetch relevant passages first, then let the LLM answer using them as evidence.">RAG</span></strong>
      pipeline retrieves relevant passages at query time and injects them as context before generation.</p>
      <p>The scenario: an employee asks <em>"Can I expense a hotel if my flight gets cancelled?"</em>
      The policy document says <em>"accommodation costs from involuntary travel disruption are reimbursable."</em>
      Those two phrases share meaning, not keywords.</p>
    </div>
    <div class="callout">
      <strong>Key insight:</strong> Even a perfect LLM produces a wrong answer if retrieval returns
      an outdated or off-region policy. Quality of the answer is bounded by quality of retrieval.
    </div>
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:24px;margin-top:16px;">
      <div style="font-size:13px;font-weight:700;color:var(--text-bright);margin-bottom:18px;text-align:center;">RAG Pipeline</div>
      <div id="rag-pipeline" style="display:flex;gap:0;align-items:stretch;flex-wrap:wrap;justify-content:center;"></div>
    </div>
  `;
  // Build animated pipeline
  const steps = [
    { icon: '💬', label: 'User Query', sub: '"Can I expense a hotel?"', color: '#6c63ff' },
    { icon: '⚡', label: 'Embed Query', sub: 'query → vector', color: '#00d2ff' },
    { icon: '🗄️', label: 'Vector DB Search', sub: 'nearest k vectors', color: '#43e97b' },
    { icon: '📄', label: 'Retrieved Chunks', sub: 'top passages', color: '#f7971e' },
    { icon: '🤖', label: 'LLM + Context', sub: 'grounded generation', color: '#ff6584' },
    { icon: '✅', label: 'Cited Answer', sub: '"Yes, up to ₹7,000…"', color: '#c471ed' },
  ];
  const pipe = sec.querySelector('#rag-pipeline');
  steps.forEach((s, i) => {
    const box = el('div','');
    box.style.cssText = `display:flex;align-items:center;`;
    const card = el('div','');
    card.style.cssText = `background:var(--bg);border:2px solid ${s.color};border-radius:10px;padding:12px 14px;text-align:center;min-width:110px;transition:transform 0.2s;cursor:default;`;
    card.innerHTML = `<div style="font-size:22px;margin-bottom:4px;">${s.icon}</div>
      <div style="font-size:12px;font-weight:700;color:#fff;">${s.label}</div>
      <div style="font-size:11px;color:var(--text-dim);margin-top:2px;">${s.sub}</div>`;
    card.addEventListener('mouseenter', () => { card.style.transform = 'scale(1.06)'; });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    box.appendChild(card);
    if (i < steps.length - 1) {
      const arrow = el('div','');
      arrow.style.cssText = `color:var(--text-dim);font-size:18px;padding:0 6px;align-self:center;`;
      arrow.textContent = '→';
      box.appendChild(arrow);
    }
    pipe.appendChild(box);
  });
  return sec;
}

// =====================================================================
//  SECTION 2 — Chunking Demo
// =====================================================================
const POLICY_TEXT = `Travel Policy Section 4.2 — Accommodation Expenses.
Employees may claim hotel accommodation when travelling for business purposes.
Accommodation expenses are reimbursable following a cancellation.
This applies only when accommodation is not provided by the airline.
Claims must be submitted within 30 days of travel.
Regional limits apply: India ₹7,000 per night, EU €150 per night.
For US-based employees, refer to the North America Travel Addendum.
Approval from a direct manager is required for stays exceeding 3 nights.
All receipts must be uploaded to the expense portal.`;

function buildChunking() {
  const sec = el('div','section');
  sec.id = 'chunk';
  sec.innerHTML = `
    <div class="section-header">
      <div class="section-icon" style="background:${COLORS.chunk.light}">✂️</div>
      <div>
        <div class="section-num">Section 02</div>
        <h2>How Documents Become Searchable Chunks</h2>
      </div>
    </div>
    <div class="card">
      <p>A long document is split into smaller <strong>chunks</strong> — the granular units stored and searched.
      Too small: you lose surrounding context (a condition in the next sentence). Too large: one chunk
      covers several unrelated topics, muddying similarity scores.</p>
    </div>
    <div class="chunk-demo card">
      <div class="chunk-controls">
        <div class="chunk-slider-wrap">
          <label>Chunk size (sentences):</label>
          <input type="range" id="chunkSize" min="1" max="4" value="2" step="1">
          <div class="chunk-value" id="chunkSizeVal">2</div>
        </div>
        <div class="chunk-slider-wrap">
          <label>Overlap:</label>
          <input type="range" id="chunkOverlap" min="0" max="1" value="0" step="1">
          <div class="chunk-value" id="chunkOverlapVal">0</div>
        </div>
      </div>
      <div class="doc-text" id="docText"></div>
      <div class="chunk-legend" id="chunkLegend"></div>
      <div class="chunk-info" id="chunkInfo">Hover a highlighted chunk to inspect it.</div>
    </div>
    <div class="callout tip">
      <strong>Try it:</strong> Set chunk size = 1. Notice the cancellation rule (sentence 3) loses
      its condition (sentence 4). Set size = 2 — both stay together. This is the context preservation problem.
    </div>
  `;
  const SENTENCES = POLICY_TEXT.split('\n').filter(Boolean);
  const CHUNK_COLORS = ['rgba(108,99,255,0.35)','rgba(0,210,255,0.3)','rgba(67,233,123,0.3)',
    'rgba(247,151,30,0.3)','rgba(255,101,132,0.3)','rgba(196,113,237,0.3)','rgba(18,194,233,0.3)'];
  const CHUNK_DOTS   = ['#6c63ff','#00d2ff','#43e97b','#f7971e','#ff6584','#c471ed','#12c2e9'];

  function renderChunks() {
    const size    = parseInt(qs('#chunkSize', sec).value);
    const overlap = parseInt(qs('#chunkOverlap', sec).value);
    qs('#chunkSizeVal', sec).textContent   = size;
    qs('#chunkOverlapVal', sec).textContent = overlap;

    const chunks = [];
    let i = 0;
    while (i < SENTENCES.length) {
      const chunk = SENTENCES.slice(i, i + size);
      chunks.push({ sentences: chunk, start: i });
      i += Math.max(1, size - overlap);
    }

    const docDiv = qs('#docText', sec);
    docDiv.innerHTML = '';
    const sentColors = {};
    chunks.forEach((c, ci) => {
      c.sentences.forEach((_, si) => {
        const idx = c.start + si;
        if (!sentColors[idx]) sentColors[idx] = [];
        sentColors[idx].push(ci);
      });
    });
    SENTENCES.forEach((sent, si) => {
      const chunkIds = sentColors[si] || [];
      const ci = chunkIds[0] ?? 0;
      const span = el('span','doc-chunk');
      span.style.background = CHUNK_COLORS[ci % CHUNK_COLORS.length];
      span.textContent = sent + ' ';
      if (chunkIds.length > 1) {
        span.style.outline = `2px solid ${CHUNK_DOTS[(chunkIds[1] ?? 1) % CHUNK_DOTS.length]}`;
        span.style.outlineOffset = '-1px';
      }
      span.addEventListener('mouseenter', () => {
        const chunkTexts = chunkIds.map(id => `Chunk ${id+1}: "${chunks[id].sentences.join(' | ')}"`).join('<br>');
        qs('#chunkInfo', sec).innerHTML = `<strong>Sentence ${si+1}</strong> belongs to ${chunkIds.length > 1 ? '<strong>2 chunks (overlap)</strong>' : 'Chunk ' + (ci+1)}<br>${chunkTexts}`;
      });
      docDiv.appendChild(span);
    });

    const legend = qs('#chunkLegend', sec);
    legend.innerHTML = '';
    chunks.slice(0, 7).forEach((_, ci) => {
      const item = el('div','chunk-leg-item');
      item.innerHTML = `<div class="chunk-leg-dot" style="background:${CHUNK_DOTS[ci % CHUNK_DOTS.length]}"></div> Chunk ${ci+1}`;
      legend.appendChild(item);
    });
  }

  qs('#chunkSize', sec).addEventListener('input', renderChunks);
  qs('#chunkOverlap', sec).addEventListener('input', renderChunks);
  renderChunks();
  return sec;
}

// =====================================================================
//  SECTION 3 — Embedding Visualiser (2-D projection)
// =====================================================================
const EMBED_DOCS = [
  { label: 'Travel disruption policy',    x: 0.72, y: 0.68, color: '#6c63ff' },
  { label: 'Hotel reimbursement limits',  x: 0.65, y: 0.55, color: '#00d2ff' },
  { label: 'Flight cancellation rules',   x: 0.78, y: 0.62, color: '#43e97b' },
  { label: 'Meal allowance policy',       x: 0.40, y: 0.30, color: '#f7971e' },
  { label: 'Password reset instructions', x: 0.12, y: 0.15, color: '#ff6584' },
  { label: 'EU travel addendum',          x: 0.55, y: 0.80, color: '#c471ed' },
  { label: 'North America addendum',      x: 0.50, y: 0.72, color: '#12c2e9' },
  { label: 'IT equipment policy',         x: 0.20, y: 0.80, color: '#f64f59' },
  { label: 'Visa & immigration guide',    x: 0.30, y: 0.55, color: '#fd7b6f' },
  { label: 'Manager approval workflow',   x: 0.45, y: 0.45, color: '#a18cd1' },
];

const QUERY_PRESETS = {
  'hotel cancelled flight': { x: 0.70, y: 0.64 },
  'reset my password':       { x: 0.13, y: 0.18 },
  'meal expense claim':      { x: 0.38, y: 0.28 },
  'visa for UK travel':      { x: 0.28, y: 0.52 },
};

function buildEmbedding() {
  const sec = el('div','section');
  sec.id = 'embed';
  sec.innerHTML = `
    <div class="section-header">
      <div class="section-icon" style="background:${COLORS.embed.light}">🧭</div>
      <div>
        <div class="section-num">Section 03</div>
        <h2>Embeddings — Meaning as Coordinates</h2>
      </div>
    </div>
    <div class="card">
      <p>An <strong><span data-tip="A dense numerical vector produced by a neural network that encodes the semantic meaning of text.">embedding model</span></strong>
      maps text to a high-dimensional vector. Documents with related meanings land nearby in that space.
      The 2-D plot below is a simplified projection — real vectors have hundreds of dimensions.</p>
    </div>
    <div class="embed-controls">
      <input class="embed-query-input" id="embedQuery" placeholder="Type a query… or pick one below" value="hotel cancelled flight">
      <button class="btn" id="embedBtn">Search</button>
    </div>
    <div class="tags" id="queryPresets"></div>
    <div class="embed-canvas-wrap">
      <canvas id="embedCanvas" height="360"></canvas>
    </div>
    <div class="card" id="embedResult" style="margin-top:0;"></div>
  `;

  // Preset pills
  const presetWrap = sec.querySelector('#queryPresets');
  Object.keys(QUERY_PRESETS).forEach(q => {
    const tag = el('div','tag hi', q);
    tag.style.cursor = 'pointer';
    tag.addEventListener('click', () => {
      qs('#embedQuery', sec).value = q;
      runSearch();
    });
    presetWrap.appendChild(tag);
  });

  const canvas  = qs('#embedCanvas', sec);
  const resultDiv = qs('#embedResult', sec);
  let queryPos  = QUERY_PRESETS['hotel cancelled flight'];
  let topK = [];

  function dist(a, b) {
    return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
  }

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = 360;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath(); ctx.moveTo(i*(W/10), 0); ctx.lineTo(i*(W/10), H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i*(H/10)); ctx.lineTo(W, i*(H/10)); ctx.stroke();
    }

    // Lines from query to top results
    topK.forEach(d => {
      const qx = queryPos.x * W, qy = (1-queryPos.y) * H;
      const dx = d.x * W,        dy = (1-d.y) * H;
      ctx.beginPath();
      ctx.moveTo(qx, qy); ctx.lineTo(dx, dy);
      ctx.strokeStyle = 'rgba(108,99,255,0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4,4]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Documents
    EMBED_DOCS.forEach(d => {
      const px = d.x * W, py = (1-d.y) * H;
      const isTop = topK.includes(d);
      ctx.beginPath();
      ctx.arc(px, py, isTop ? 9 : 7, 0, Math.PI*2);
      ctx.fillStyle = isTop ? d.color : d.color + '55';
      ctx.fill();
      if (isTop) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.fillStyle = isTop ? '#fff' : 'rgba(255,255,255,0.5)';
      ctx.font = `${isTop ? 700 : 400} 11px Inter, sans-serif`;
      ctx.fillText(d.label, px + 12, py + 4);
    });

    // Query star
    const qx = queryPos.x * W, qy = (1-queryPos.y) * H;
    ctx.beginPath();
    ctx.arc(qx, qy, 10, 0, Math.PI*2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.fillStyle = '#6c63ff';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillText('Q', qx - 4, qy + 5);
    ctx.fillStyle = 'rgba(108,99,255,0.3)';
    ctx.beginPath(); ctx.arc(qx, qy, 18, 0, Math.PI*2); ctx.fill();

    // Axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '11px Inter';
    ctx.fillText('dim₁ →', W - 50, H - 8);
    ctx.save(); ctx.translate(10, H/2); ctx.rotate(-Math.PI/2);
    ctx.fillText('dim₂ →', -20, 0); ctx.restore();
  }

  function runSearch() {
    const q = qs('#embedQuery', sec).value.trim().toLowerCase();
    queryPos = QUERY_PRESETS[q] || {
      x: 0.1 + Math.random()*0.8,
      y: 0.1 + Math.random()*0.8,
    };
    const sorted = [...EMBED_DOCS].sort((a,b) => dist(a,queryPos)-dist(b,queryPos));
    topK = sorted.slice(0,3);
    draw();
    resultDiv.innerHTML = `
      <p style="font-size:13px;color:var(--text-dim);margin-bottom:10px;">
        <strong style="color:var(--accent2)">Top 3 results</strong> for query <em>"${q}"</em>:</p>
      ${topK.map((d,i)=>`
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <div style="width:24px;height:24px;border-radius:50%;background:${d.color};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;">${i+1}</div>
          <div><strong style="color:var(--text)">${d.label}</strong> &nbsp;
            <span style="font-family:var(--mono);font-size:11px;color:var(--text-dim)">sim = ${(1-dist(d,queryPos)).toFixed(3)}</span>
          </div>
        </div>`).join('')}
    `;
  }

  qs('#embedBtn', sec).addEventListener('click', runSearch);
  qs('#embedQuery', sec).addEventListener('keydown', e => { if (e.key==='Enter') runSearch(); });

  // Draw after layout
  setTimeout(() => { draw(); runSearch(); }, 50);
  window.addEventListener('resize', () => { draw(); });
  return sec;
}

// =====================================================================
//  SECTION 4 — Similarity Metrics
// =====================================================================
function buildMetrics() {
  const sec = el('div','section');
  sec.id = 'metric';
  sec.innerHTML = `
    <div class="section-header">
      <div class="section-icon" style="background:${COLORS.metric.light}">📐</div>
      <div>
        <div class="section-num">Section 04</div>
        <h2>How Close Is Close Enough?</h2>
      </div>
    </div>
    <div class="card">
      <p>Selecting the right <strong>similarity metric</strong> is not merely cosmetic — it changes the ranking.
      You must use the metric the embedding model was trained with.</p>
    </div>
    <div class="metric-grid" id="metricCards"></div>
    <div class="metric-viz">
      <canvas id="metricCanvas" height="220"></canvas>
    </div>
    <div class="callout warn" style="margin-top:14px;">
      <strong>Caution:</strong> A similarity score of 0.85 does not mean 85% probability of a correct answer.
      It describes a mathematical relationship between vectors, not answer quality.
    </div>
  `;

  const metrics = [
    {
      name: 'Cosine Similarity',
      formula: 'cos θ = (A·B) / (|A||B|)',
      desc: 'Compares direction, ignores magnitude. Best for text embeddings where vector length varies.',
      color: '#6c63ff',
      draw: (ctx, W, H, v1, v2) => drawVectors(ctx, W, H, v1, v2, 'angle'),
    },
    {
      name: 'Euclidean Distance',
      formula: 'd = √Σ(aᵢ - bᵢ)²',
      desc: 'Straight-line distance between endpoints. Vector length affects the result.',
      color: '#f7971e',
      draw: (ctx, W, H, v1, v2) => drawVectors(ctx, W, H, v1, v2, 'euclidean'),
    },
    {
      name: 'Dot Product',
      formula: 'A·B = Σ aᵢbᵢ',
      desc: 'Reflects both alignment and magnitude. Equals cosine when vectors are normalized to length 1.',
      color: '#43e97b',
      draw: (ctx, W, H, v1, v2) => drawVectors(ctx, W, H, v1, v2, 'dot'),
    },
  ];

  let selectedMetric = 0;

  function drawVectors(ctx, W, H, v1, v2, mode) {
    ctx.clearRect(0, 0, W, H);
    const cx = W/2, cy = H/2;
    const scale = Math.min(W,H)*0.38;
    const p1 = { x: cx + v1.x*scale, y: cy - v1.y*scale };
    const p2 = { x: cx + v2.x*scale, y: cy - v2.y*scale };

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(W,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,H); ctx.stroke();

    if (mode === 'euclidean') {
      ctx.setLineDash([4,4]);
      ctx.strokeStyle = '#f7971e';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#f7971e';
      ctx.font = '12px Inter';
      ctx.fillText(`d = ${Math.sqrt((v1.x-v2.x)**2+(v1.y-v2.y)**2).toFixed(3)}`, cx+4, cy-6);
    } else if (mode === 'angle') {
      const a1 = Math.atan2(v1.y, v1.x);
      const a2 = Math.atan2(v2.y, v2.x);
      ctx.strokeStyle = '#6c63ff44';
      ctx.fillStyle   = '#6c63ff22';
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,40,-a1,-a2); ctx.closePath();
      ctx.fill(); ctx.stroke();
      const dot = v1.x*v2.x + v1.y*v2.y;
      const cos = dot / (Math.sqrt(v1.x**2+v1.y**2)*Math.sqrt(v2.x**2+v2.y**2));
      ctx.fillStyle='#6c63ff'; ctx.font='12px Inter';
      ctx.fillText(`cos = ${cos.toFixed(3)}`, cx+4, cy-6);
    } else {
      const dot = v1.x*v2.x + v1.y*v2.y;
      ctx.fillStyle='#43e97b'; ctx.font='12px Inter';
      ctx.fillText(`A·B = ${dot.toFixed(3)}`, cx+4, cy-6);
    }

    // Vectors
    [[p1,'#fff',v1],[p2,'#00d2ff',v2]].forEach(([p,c,v]) => {
      ctx.strokeStyle = c; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(p.x,p.y); ctx.stroke();
      ctx.beginPath(); ctx.arc(p.x,p.y,5,0,Math.PI*2); ctx.fillStyle=c; ctx.fill();
      ctx.fillStyle=c; ctx.font='11px Inter';
      ctx.fillText(`(${v.x.toFixed(1)}, ${v.y.toFixed(1)})`, p.x+6, p.y);
    });
  }

  const V1 = { x: 0.7, y: 0.7 };
  const V2 = { x: 0.8, y: 0.4 };

  function renderMetricCanvas() {
    const canvas = qs('#metricCanvas', sec);
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth || 480;
    canvas.width  = W * dpr;
    canvas.height = 220 * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    metrics[selectedMetric].draw(ctx, W, 220, V1, V2);
  }

  const cardWrap = qs('#metricCards', sec);
  metrics.forEach((m, i) => {
    const card = el('div','metric-card' + (i===0?' selected':''));
    card.innerHTML = `
      <div class="metric-name" style="color:${m.color}">${m.name}</div>
      <div class="metric-formula">${m.formula}</div>
      <div class="metric-desc">${m.desc}</div>`;
    card.addEventListener('click', () => {
      qsa('.metric-card', sec).forEach(c=>c.classList.remove('selected'));
      card.classList.add('selected');
      selectedMetric = i;
      renderMetricCanvas();
    });
    cardWrap.appendChild(card);
  });

  setTimeout(renderMetricCanvas, 50);
  window.addEventListener('resize', renderMetricCanvas);
  return sec;
}

// =====================================================================
//  SECTION 5 — Index Race (Flat vs IVF vs HNSW cost)
// =====================================================================
function buildIndexRace() {
  const sec = el('div','section');
  sec.id = 'flat';
  sec.innerHTML = `
    <div class="section-header">
      <div class="section-icon" style="background:${COLORS.flat.light}">⚡</div>
      <div>
        <div class="section-num">Section 05</div>
        <h2>Why Searching Every Vector Is Too Expensive</h2>
      </div>
    </div>
    <div class="card">
      <p>A <strong>flat index</strong> compares the query against every stored vector — O(n) work.
      An <strong><span data-tip="Inverted File Index: clusters vectors into groups; searches only nearby groups.">IVF</span></strong> index partitions vectors into clusters and searches only promising ones.
      <strong><span data-tip="Hierarchical Navigable Small World: a graph where multi-layer shortcuts let search jump quickly to the right neighbourhood.">HNSW</span></strong> navigates a graph to find neighbours without a full scan.</p>
    </div>
    <div class="index-race">
      <div class="race-controls">
        <div class="race-slider-wrap">
          <label>Vector count (millions):</label>
          <input type="range" id="vecCount" min="0.1" max="10" step="0.1" value="1">
          <div class="chunk-value" id="vecCountVal">1M</div>
        </div>
        <div class="race-slider-wrap">
          <label>IVF nprobe (groups searched):</label>
          <input type="range" id="nprobe" min="1" max="100" step="1" value="10">
          <div class="chunk-value" id="nprobeVal">10</div>
        </div>
      </div>
      <div class="race-bars" id="raceBars"></div>
    </div>
    <div class="callout" style="margin-top:16px;">
      <strong>IVF approximation:</strong> increasing nprobe improves recall but increases work.
      A useful passage may belong to a skipped cluster — these are <em>mathematical</em> neighbourhoods, not subject folders.
    </div>
  `;

  function updateRace() {
    const n      = parseFloat(qs('#vecCount', sec).value);
    const nprobe = parseInt(qs('#nprobe', sec).value);
    qs('#vecCountVal', sec).textContent = n.toFixed(1) + 'M';
    qs('#nprobeVal', sec).textContent   = nprobe;

    const dim = 1536; // typical embedding
    const N   = n * 1e6;
    const C   = 1000; // clusters
    const flatOps   = N * dim;
    const ivfOps    = (N / C) * nprobe * dim * 1.3; // probe overhead
    const hnswOps   = Math.log2(N) * 32 * dim;      // ~efSearch=32

    const maxOps = flatOps;
    const bars = qs('#raceBars', sec);
    const items = [
      { label:'Flat (Exact)',  ops: flatOps,  color:'#ff6584', note:`${(flatOps/1e9).toFixed(1)}B ops`, recall:'100%' },
      { label:`IVF (nprobe=${nprobe})`, ops: ivfOps, color:'#f7971e', note:`${(ivfOps/1e9).toFixed(1)}B ops`, recall:`~${Math.min(99,Math.round(60+nprobe*0.35))}%` },
      { label:'HNSW',          ops: hnswOps,  color:'#43e97b', note:`${(hnswOps/1e9).toFixed(1)}B ops`, recall:'~95-99%' },
    ];
    bars.innerHTML = '';
    items.forEach(item => {
      const pct = Math.min(100, Math.round((item.ops / maxOps) * 100));
      const row = el('div','race-row');
      row.innerHTML = `
        <div class="race-label">${item.label}</div>
        <div class="race-bar-bg">
          <div class="race-bar-fill" style="background:${item.color};width:0%">
            ${item.note}
          </div>
        </div>
        <div class="race-cost">recall ${item.recall}</div>`;
      bars.appendChild(row);
      // Animate
      setTimeout(() => {
        row.querySelector('.race-bar-fill').style.width = pct + '%';
      }, 30);
    });
  }

  qs('#vecCount', sec).addEventListener('input', updateRace);
  qs('#nprobe',   sec).addEventListener('input', updateRace);
  updateRace();
  return sec;
}

// =====================================================================
//  SECTION 6 — HNSW Navigator
// =====================================================================
function buildHNSW() {
  const sec = el('div','section');
  sec.id = 'hnsw';
  sec.innerHTML = `
    <div class="section-header">
      <div class="section-icon" style="background:${COLORS.hnsw.light}">🗺️</div>
      <div>
        <div class="section-num">Section 06</div>
        <h2>HNSW — Navigating to the Right Neighbourhood</h2>
      </div>
    </div>
    <div class="card">
      <p><strong>HNSW</strong> builds a multi-layer graph. Upper layers have sparse long-range links
      (motorways); lower layers have dense short-range links (local roads). Search starts at the top
      and progressively refines down to the bottom layer where all vectors live.</p>
    </div>
    <div class="hnsw-wrap">
      <div class="hnsw-canvas-wrap">
        <canvas id="hnswCanvas" height="320"></canvas>
      </div>
      <div style="display:flex;gap:10px;padding:12px 20px;border-top:1px solid var(--border);flex-wrap:wrap;">
        <button class="btn" id="hnswRun">▶ Run Search</button>
        <button class="btn btn-outline" id="hnswReset">↺ Reset</button>
        <div style="font-size:12px;color:var(--text-dim);align-self:center;">
          Click <strong>Run Search</strong> to watch HNSW navigate from top layer to bottom.
        </div>
      </div>
      <div class="hnsw-log" id="hnswLog">Press Run Search to begin…</div>
    </div>
    <div class="callout" style="margin-top:14px;">
      <strong>M</strong> controls connectivity (more links = better recall, more memory).
      <strong>ef_search</strong> controls candidate breadth during query — higher = better recall, more latency.
    </div>
  `;

  const canvas = qs('#hnswCanvas', sec);
  const log    = qs('#hnswLog', sec);
  let animTimer = null;

  // Simulated 3-layer graph
  const LAYERS = [
    // Layer 2 (top, sparse)
    [ {id:'A',x:0.5, y:0.5} ],
    // Layer 1
    [ {id:'A',x:0.5,y:0.5},{id:'C',x:0.3,y:0.6},{id:'F',x:0.7,y:0.65} ],
    // Layer 0 (all nodes)
    [
      {id:'A',x:0.50,y:0.50},{id:'B',x:0.35,y:0.40},{id:'C',x:0.30,y:0.60},
      {id:'D',x:0.60,y:0.40},{id:'E',x:0.70,y:0.55},{id:'F',x:0.70,y:0.65},
      {id:'G',x:0.20,y:0.50},{id:'H',x:0.80,y:0.30},{id:'Q*',x:0.65,y:0.58},
    ],
  ];
  // Edges per layer
  const EDGES = [
    [],
    [ ['A','C'],['A','F'],['C','F'] ],
    [ ['A','B'],['A','D'],['B','C'],['B','G'],['C','G'],['D','E'],['D','H'],['E','F'],['E','Q*'],['F','Q*'] ],
  ];
  const QUERY = {x:0.75, y:0.72};
  const RESULT_ID = 'Q*';

  const STEP_SEQUENCE = [
    { layer:2, visited:['A'], current:'A', msg:'Layer 2 (top): Start at entry point A — sparse layer for quick orientation.' },
    { layer:1, visited:['A','C','F'], current:'F', msg:'Layer 1: Descend. Explore A, C, F. F is closest to query.' },
    { layer:0, visited:['F','E','Q*'], current:'Q*', msg:'Layer 0 (all nodes): Local search from F → E → Q*. Found nearest neighbour!' },
  ];

  let step = -1;

  function drawHNSW(layerIdx, visitedSet, currentId) {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth || 600;
    const H = 320;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const layerH = H / 3;
    [0,1,2].forEach(li => {
      const lix = 2 - li; // display top-to-bottom: layer2, layer1, layer0
      const y0 = lix * layerH;
      // Background stripe
      ctx.fillStyle = li===2 ? 'rgba(108,99,255,0.05)' : li===1 ? 'rgba(0,210,255,0.05)' : 'rgba(67,233,123,0.05)';
      ctx.fillRect(0, y0, W, layerH);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = '11px Inter';
      ctx.fillText(`Layer ${li}`, 8, y0 + 16);

      // Edges
      EDGES[li].forEach(([a,b]) => {
        const na = LAYERS[li].find(n=>n.id===a);
        const nb = LAYERS[li].find(n=>n.id===b);
        if (!na||!nb) return;
        const px1=na.x*W, py1=y0+na.y*(layerH*0.8)+layerH*0.1;
        const px2=nb.x*W, py2=y0+nb.y*(layerH*0.8)+layerH*0.1;
        const isActive = li === layerIdx && (visitedSet.has(a)||visitedSet.has(b));
        ctx.strokeStyle = isActive ? 'rgba(108,99,255,0.6)' : 'rgba(255,255,255,0.08)';
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.setLineDash(isActive ? [] : [3,3]);
        ctx.beginPath(); ctx.moveTo(px1,py1); ctx.lineTo(px2,py2); ctx.stroke();
        ctx.setLineDash([]);
      });

      // Nodes
      LAYERS[li].forEach(n => {
        const px = n.x * W;
        const py = y0 + n.y*(layerH*0.8) + layerH*0.1;
        const isVisited = visitedSet.has(n.id);
        const isCurrent = n.id === currentId && li === layerIdx;
        const isResult  = n.id === RESULT_ID && li === 0;
        const isQuery   = n.id === 'Q*';

        let fillColor = 'rgba(255,255,255,0.1)';
        let strokeColor = 'rgba(255,255,255,0.2)';
        if (isResult && li===0) { fillColor='rgba(255,101,132,0.3)'; strokeColor='#ff6584'; }
        if (isVisited && li===layerIdx) { fillColor='rgba(0,210,255,0.2)'; strokeColor='#00d2ff'; }
        if (isCurrent) { fillColor='rgba(67,233,123,0.3)'; strokeColor='#43e97b'; }

        ctx.beginPath(); ctx.arc(px,py,isCurrent?12:9,0,Math.PI*2);
        ctx.fillStyle=fillColor; ctx.fill();
        ctx.strokeStyle=strokeColor; ctx.lineWidth=isCurrent?2.5:1.5; ctx.stroke();
        ctx.fillStyle = isCurrent ? '#43e97b' : (isVisited && li===layerIdx ? '#00d2ff' : 'rgba(255,255,255,0.6)');
        ctx.font = `${isCurrent?700:400} 11px Inter`;
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(n.id, px, py);
        ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      });
    });

    // Query star
    const qx = QUERY.x*W, qy = (2*layerH) + QUERY.y*(layerH*0.8) + layerH*0.1;
    ctx.beginPath(); ctx.arc(qx,qy,7,0,Math.PI*2);
    ctx.fillStyle='rgba(108,99,255,0.5)'; ctx.fill();
    ctx.strokeStyle='#6c63ff'; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='10px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('?',qx,qy); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
  }

  function addLog(msg, cls='') {
    const e = el('div','hnsw-log-entry '+cls, msg);
    log.appendChild(e);
    log.scrollTop = log.scrollHeight;
  }

  function resetHNSW() {
    step = -1;
    if (animTimer) clearTimeout(animTimer);
    log.innerHTML = 'Press <strong>Run Search</strong> to begin…';
    drawHNSW(-1, new Set(), '');
  }

  function runStep() {
    step++;
    if (step >= STEP_SEQUENCE.length) {
      addLog('✓ Search complete. Total vectors compared: ~' + (STEP_SEQUENCE.length * 3) + ' out of ' + LAYERS[0].length, 'done');
      return;
    }
    const s = STEP_SEQUENCE[step];
    const visited = new Set(s.visited);
    drawHNSW(s.layer, visited, s.current);
    addLog(`[Layer ${s.layer}] ${s.msg}`, step===STEP_SEQUENCE.length-1?'done':'current');
    if (step < STEP_SEQUENCE.length - 1) {
      animTimer = setTimeout(runStep, 2000);
    }
  }

  qs('#hnswRun', sec).addEventListener('click', () => { resetHNSW(); setTimeout(runStep, 300); });
  qs('#hnswReset', sec).addEventListener('click', resetHNSW);
  setTimeout(() => { drawHNSW(-1, new Set(), ''); }, 50);
  window.addEventListener('resize', () => { drawHNSW(-1, new Set(), ''); });
  return sec;
}

// =====================================================================
//  SECTION 7 — Recall Tuner
// =====================================================================
function buildRecall() {
  const sec = el('div','section');
  sec.id = 'recall';
  sec.innerHTML = `
    <div class="section-header">
      <div class="section-icon" style="background:${COLORS.recall.light}">🎚️</div>
      <div>
        <div class="section-num">Section 07</div>
        <h2>Tuning the Speed–Recall Tradeoff</h2>
      </div>
    </div>
    <div class="card">
      <p>HNSW exposes three key parameters. Tune them to balance memory, build time, recall, and query latency.
      Use <strong>representative queries + actual measurements</strong> — don't guess.</p>
    </div>
    <div class="recall-grid">
      <div class="recall-panel">
        <h4>HNSW Parameters</h4>
        <div class="param-row">
          <div class="param-label"><span>M — graph connectivity</span><span id="mVal">16</span></div>
          <input type="range" id="mParam" min="4" max="64" value="16" step="4">
        </div>
        <div class="param-row">
          <div class="param-label"><span>ef_construction</span><span id="efcVal">200</span></div>
          <input type="range" id="efcParam" min="50" max="800" value="200" step="50">
        </div>
        <div class="param-row">
          <div class="param-label"><span>ef_search</span><span id="efsVal">64</span></div>
          <input type="range" id="efsParam" min="10" max="512" value="64" step="10">
        </div>
      </div>
      <div class="recall-panel">
        <h4>Estimated Performance</h4>
        <div class="recall-results" id="recallStats"></div>
        <div style="margin-top:14px;">
          <canvas id="recallChart" height="80"></canvas>
        </div>
      </div>
    </div>
    <div class="callout tip">
      <strong>Rule of thumb:</strong> ef_search ≥ k (number of results). Result count and search effort
      are separate decisions. Retrieiving 5 results can require exploring 200+ candidates.
    </div>
  `;

  function clamp(v,lo,hi) { return Math.max(lo,Math.min(hi,v)); }

  function updateRecall() {
    const M   = parseInt(qs('#mParam', sec).value);
    const efc = parseInt(qs('#efcParam', sec).value);
    const efs = parseInt(qs('#efsParam', sec).value);
    qs('#mVal', sec).textContent   = M;
    qs('#efcVal', sec).textContent = efc;
    qs('#efsVal', sec).textContent = efs;

    const recallPct = clamp(Math.round(55 + (M/64)*20 + (efc/800)*10 + (efs/512)*15), 60, 99);
    const latencyMs = clamp(Math.round(2 + (M/64)*8 + (efs/512)*18), 2, 28);
    const memMB     = clamp(Math.round(40 + (M/64)*120 + (efc/800)*30), 40, 190);

    const stats = qs('#recallStats', sec);
    stats.innerHTML = `
      <div class="recall-stat">
        <div class="recall-stat-val" style="color:var(--accent4)">${recallPct}%</div>
        <div class="recall-stat-lbl">Recall@10</div>
      </div>
      <div class="recall-stat">
        <div class="recall-stat-val" style="color:var(--accent2)">${latencyMs}ms</div>
        <div class="recall-stat-lbl">Latency</div>
      </div>
      <div class="recall-stat">
        <div class="recall-stat-val" style="color:var(--accent3)">${memMB}MB</div>
        <div class="recall-stat-lbl">Memory</div>
      </div>
    `;

    // Sparkline-style bar chart
    const chart = qs('#recallChart', sec);
    const dpr = window.devicePixelRatio || 1;
    const W = chart.offsetWidth || 300, H = 80;
    chart.width = W*dpr; chart.height = H*dpr;
    const ctx = chart.getContext('2d');
    ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);
    const bars2 = [
      {val: recallPct, max:100, color:'#43e97b', label:'Recall %'},
      {val: latencyMs, max:30,  color:'#00d2ff', label:'Latency ms'},
      {val: memMB,     max:200, color:'#ff6584', label:'Memory MB'},
    ];
    const bw = W/bars2.length - 8;
    bars2.forEach((b,i) => {
      const x = i*(bw+8) + 4;
      const bh = (b.val/b.max)*(H-20);
      ctx.fillStyle = b.color + '33';
      ctx.fillRect(x, H-20-bh, bw, bh);
      ctx.fillStyle = b.color;
      ctx.fillRect(x, H-22-bh, bw, 3);
      ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='10px Inter'; ctx.textAlign='center';
      ctx.fillText(b.label, x+bw/2, H-4);
      ctx.fillStyle=b.color; ctx.font='bold 11px Inter';
      ctx.fillText(b.val+(i===0?'%':i===1?'ms':'MB'), x+bw/2, H-24-bh);
      ctx.textAlign='left';
    });
  }

  ['#mParam','#efcParam','#efsParam'].forEach(id => {
    qs(id, sec).addEventListener('input', updateRecall);
  });
  setTimeout(updateRecall, 50);
  window.addEventListener('resize', updateRecall);
  return sec;
}

// =====================================================================
//  SECTION 8 — Metadata Filtering
// =====================================================================
const FILTER_DOCS_DATA = [
  { title:'Travel Policy IN', region:'India', unit:'Engineering', date:'2025-01', score:0.91, content:'Accommodation reimbursable; limit ₹7,000/night.' },
  { title:'Travel Policy EU', region:'EU',    unit:'All',         date:'2025-01', score:0.88, content:'Accommodation limit €150/night.' },
  { title:'Travel Policy IN (old)', region:'India', unit:'Engineering', date:'2023-06', score:0.87, content:'Accommodation reimbursable; limit ₹5,000/night.' },
  { title:'NA Travel Addendum', region:'USA',  unit:'Sales',      date:'2025-01', score:0.82, content:'Hotel limit $200/night.' },
  { title:'Meal Allowances IN', region:'India', unit:'All',       date:'2025-01', score:0.74, content:'Daily meal allowance ₹800.' },
  { title:'IT Equipment Policy', region:'Global', unit:'IT',      date:'2024-09', score:0.31, content:'Laptop refresh cycle 3 years.' },
];

function buildFiltering() {
  const sec = el('div','section');
  sec.id = 'filter';
  sec.innerHTML = `
    <div class="section-header">
      <div class="section-icon" style="background:${COLORS.filter.light}">🎯</div>
      <div>
        <div class="section-num">Section 08</div>
        <h2>The Closest Match Might Be the Wrong Policy</h2>
      </div>
    </div>
    <div class="card">
      <p>High similarity is not enough. An EU policy about hotel limits looks semantically close to an India query —
      but it's the <em>wrong region</em>. <strong>Metadata filters</strong> restrict the eligible set before or after
      similarity ranking. Pre- vs post-filtering involves real tradeoffs.</p>
    </div>
    <div class="filter-controls">
      <div>
        <label style="font-size:12px;color:var(--text-dim);display:block;margin-bottom:4px;">Region</label>
        <select class="filter-select" id="fRegion">
          <option value="all">All regions</option>
          <option value="India" selected>India</option>
          <option value="EU">EU</option>
          <option value="USA">USA</option>
        </select>
      </div>
      <div>
        <label style="font-size:12px;color:var(--text-dim);display:block;margin-bottom:4px;">Effective date ≥</label>
        <select class="filter-select" id="fDate">
          <option value="all">Any</option>
          <option value="2024" selected>2024</option>
          <option value="2025">2025</option>
        </select>
      </div>
      <div>
        <label style="font-size:12px;color:var(--text-dim);display:block;margin-bottom:4px;">Mode</label>
        <select class="filter-select" id="fMode">
          <option value="pre" selected>Pre-filter</option>
          <option value="post">Post-filter (top 4)</option>
        </select>
      </div>
      <button class="btn" id="fRun" style="align-self:flex-end;">Apply Filters</button>
    </div>
    <div class="filter-docs" id="filterDocs"></div>
    <div class="filter-result-box" id="filterResult"></div>
  `;

  function runFilter() {
    const region = qs('#fRegion', sec).value;
    const date   = qs('#fDate', sec).value;
    const mode   = qs('#fMode', sec).value;
    const sorted = [...FILTER_DOCS_DATA].sort((a,b)=>b.score-a.score);

    function eligible(d) {
      const regionOk = region==='all' || d.region===region || d.region==='Global';
      const dateOk   = date==='all' || d.date.slice(0,4) >= date;
      return regionOk && dateOk;
    }

    let retrieved;
    if (mode === 'pre') {
      retrieved = sorted.filter(eligible).slice(0,3);
    } else {
      // Post: take top 4 by sim, then filter
      retrieved = sorted.slice(0,4).filter(eligible);
    }
    const best = retrieved[0];

    const docsWrap = qs('#filterDocs', sec);
    docsWrap.innerHTML = '';
    sorted.forEach(d => {
      const isEligible  = eligible(d);
      const isRetrieved = retrieved.includes(d);
      const isBest      = d === best;
      const div = el('div', 'filter-doc' + (isBest?' best':isRetrieved?' retrieved':isEligible?' eligible':' eliminated'));
      div.innerHTML = `
        <div class="filter-doc-title">${d.title}</div>
        <div class="filter-doc-meta">
          📍 ${d.region} &nbsp; 👥 ${d.unit}<br>
          📅 ${d.date} &nbsp; 🔢 sim=${d.score}
        </div>
        ${isBest ? '<div class="filter-badge" style="background:#00d2ff22;color:#00d2ff;">Best</div>' :
          isRetrieved ? '<div class="filter-badge" style="background:#ff658422;color:#ff6584;">Returned</div>' :
          !isEligible ? '<div class="filter-badge" style="background:#ffffff11;color:#7a8499;">Filtered</div>' : ''}
      `;
      docsWrap.appendChild(div);
    });

    const result = qs('#filterResult', sec);
    if (!best) {
      result.innerHTML = `<strong style="color:var(--accent3)">⚠ No eligible documents found.</strong> Try relaxing the filters.`;
    } else {
      result.innerHTML = `
        <strong style="color:var(--accent2)">Answer grounded in:</strong> "${best.title}" (${best.date})<br>
        <em style="color:var(--text)">"${best.content}"</em><br><br>
        <span style="color:var(--text-dim)">Mode: <strong>${mode === 'pre' ? 'Pre-filter' : 'Post-filter'}</strong>.
        ${mode==='post' && retrieved.length < 3 ? '⚠ Post-filter returned only ' + retrieved.length + ' result(s) from top-4 batch — consider increasing candidate set.' : 'Filters applied correctly.'}</span>
      `;
    }
  }

  qs('#fRun', sec).addEventListener('click', runFilter);
  setTimeout(runFilter, 50);
  return sec;
}

// =====================================================================
//  SECTION 9 — Quiz
// =====================================================================
const QUIZ_DATA = [
  {
    q: 'Why might a highly similar document still be the wrong answer?',
    opts: [
      'The embedding model is misconfigured',
      'It may be from the wrong region, business unit, or be outdated',
      'Cosine similarity is always inaccurate',
      'Vector dimensions don\'t match',
    ],
    correct: 1,
    explain: 'Similarity measures mathematical closeness, not policy correctness. A very similar EU hotel policy is useless for an India-based employee. Metadata filters (region, date, unit) restrict the eligible set.',
  },
  {
    q: 'What does ef_search control in HNSW?',
    opts: [
      'The number of nearest neighbours returned',
      'The number of graph layers',
      'The breadth of candidate exploration during a query',
      'The vector normalization method',
    ],
    correct: 2,
    explain: 'ef_search controls how many candidates HNSW explores while navigating the graph. More candidates = higher recall, higher latency. It is NOT the number of results returned.',
  },
  {
    q: 'A cosine similarity score of 0.92 means:',
    opts: [
      '92% probability the passage correctly answers the question',
      'The vectors point in nearly the same direction',
      'The Euclidean distance is 0.08',
      'The passage is from the correct region',
    ],
    correct: 1,
    explain: 'Cosine similarity measures directional alignment of two vectors. It says nothing about factual correctness, regional applicability, or recency of the content.',
  },
  {
    q: 'What is the key tradeoff when increasing IVF nprobe?',
    opts: [
      'Higher nprobe decreases memory usage',
      'Higher nprobe improves recall but increases search work',
      'Higher nprobe reduces the number of clusters',
      'Higher nprobe makes embeddings more accurate',
    ],
    correct: 1,
    explain: 'nprobe controls how many IVF clusters are searched. More clusters = more work but less chance of missing a relevant passage that sits in a skipped cluster.',
  },
];

function buildQuiz() {
  const sec = el('div','section');
  sec.id = 'quiz';
  sec.innerHTML = `
    <div class="section-header">
      <div class="section-icon" style="background:rgba(247,151,30,0.12)">🧠</div>
      <div>
        <div class="section-num">Knowledge Check</div>
        <h2>Test Your Understanding</h2>
      </div>
    </div>
  `;
  let score = 0;
  let answered = 0;

  QUIZ_DATA.forEach((qd, qi) => {
    const wrap = el('div','card');
    wrap.style.marginBottom = '16px';
    const qnum = el('div','');
    qnum.style.cssText = 'font-size:11px;color:var(--text-dim);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;';
    qnum.textContent = `Question ${qi+1} of ${QUIZ_DATA.length}`;
    const qtxt = el('div','quiz-q', qd.q);
    const opts = el('div','quiz-options');
    const fb   = el('div','quiz-feedback');

    qd.opts.forEach((opt, oi) => {
      const btn = el('button','quiz-opt', opt);
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled')) return;
        qsa('.quiz-opt', opts).forEach(b => b.classList.add('disabled'));
        const isCorrect = oi === qd.correct;
        btn.classList.add(isCorrect ? 'correct' : 'wrong');
        qsa('.quiz-opt', opts)[qd.correct].classList.add('correct');
        fb.textContent = (isCorrect ? '✓ Correct! ' : '✗ Not quite. ') + qd.explain;
        fb.className = 'quiz-feedback show ' + (isCorrect ? 'ok' : 'bad');
        if (isCorrect) score++;
        answered++;
        if (answered === QUIZ_DATA.length) {
          const summary = el('div','callout tip');
          summary.style.marginTop = '16px';
          summary.innerHTML = `<strong>Score: ${score}/${QUIZ_DATA.length}</strong> — ${
            score === QUIZ_DATA.length ? '🏆 Perfect! You\'ve mastered RAG internals.' :
            score >= 2 ? '👍 Good understanding. Review the sections you missed.' :
            '📖 Revisit the interactive sections above to reinforce these concepts.'
          }`;
          sec.appendChild(summary);
        }
      });
      opts.appendChild(btn);
    });

    wrap.appendChild(qnum);
    wrap.appendChild(qtxt);
    wrap.appendChild(opts);
    wrap.appendChild(fb);
    sec.appendChild(wrap);
  });
  return sec;
}

// =====================================================================
//  SECTION 10 — Summary Table
// =====================================================================
function buildSummary() {
  const sec = el('div','section');
  sec.id = 'summary';
  sec.innerHTML = `
    <div class="section-header">
      <div class="section-icon" style="background:rgba(18,194,233,0.12)">📋</div>
      <div>
        <div class="section-num">Reference</div>
        <h2>Index & Config Cheat Sheet</h2>
      </div>
    </div>
    <div class="card" style="padding:0;overflow:hidden;">
      <table class="summary-table">
        <thead>
          <tr>
            <th>Concept</th><th>What It Does</th><th>Key Lever</th><th>Tradeoff</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>Chunking</strong></td><td>Splits docs into searchable units</td><td>Chunk size, overlap</td><td>Too small = no context. Too large = noise.</td></tr>
          <tr><td><strong>Embedding</strong></td><td>Converts text to dense vectors</td><td>Model choice</td><td>Query/doc encoders must be compatible.</td></tr>
          <tr><td><strong>Cosine sim</strong></td><td>Directional similarity</td><td>Normalization</td><td>Ignores magnitude; use with normalized vecs.</td></tr>
          <tr><td><strong>Flat index</strong></td><td>Exact nearest neighbours</td><td>—</td><td>O(n) cost. Best for small collections.</td></tr>
          <tr><td><strong>IVF</strong></td><td>Cluster-based ANN</td><td>nprobe</td><td>Higher nprobe = better recall, more work.</td></tr>
          <tr><td><strong>HNSW</strong></td><td>Graph-based ANN</td><td>M, ef_construction, ef_search</td><td>High recall, fast queries, high memory.</td></tr>
          <tr><td><strong>Pre-filtering</strong></td><td>Restricts eligible set before search</td><td>Filter selectivity</td><td>Can miss useful routing nodes in graph.</td></tr>
          <tr><td><strong>Post-filtering</strong></td><td>Removes ineligible results after search</td><td>Candidate batch size</td><td>May not yield enough eligible results.</td></tr>
          <tr><td><strong>Versioning</strong></td><td>Keeps doc collection current</td><td>Effective date metadata</td><td>Stale chunks produce stale answers.</td></tr>
        </tbody>
      </table>
    </div>
  `;
  return sec;
}

// =====================================================================
//  MAIN — Assemble App
// =====================================================================
function buildApp() {
  const app = qs('#app');

  // Hero and nav already live in index.html — skip re-injection.

  // Sections
  const sections = [
    buildRAG(), buildChunking(), buildEmbedding(), buildMetrics(),
    buildIndexRace(), buildHNSW(), buildRecall(), buildFiltering(),
    buildQuiz(), buildSummary(),
  ];
  sections.forEach(s => app.appendChild(s));

  // IntersectionObserver — updates the header nav-pills as user scrolls
  const navPillsEl = document.querySelector('.nav-pills');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && e.target.id) {
        markVisited(e.target.id);
        if (navPillsEl) {
          qsa('.nav-pill', navPillsEl).forEach(p => p.classList.remove('active'));
          const pill = navPillsEl.querySelector(`a[href="#${e.target.id}"]`);
          if (pill) pill.classList.add('active');
        }
      }
    });
  }, { threshold: 0.2 });
  sections.forEach(s => { if (s.id) observer.observe(s); });
}

document.addEventListener('DOMContentLoaded', buildApp);
