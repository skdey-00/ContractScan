// ContractScan AI — Side Panel Logic
(function () {
  const app = document.getElementById('app');

  // ── Render States ──────────────────────────────────────

  function renderEmpty() {
    app.innerHTML = `
      <div class="header">
        <div class="header-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <div class="header-text">
          <h1>ContractScan AI</h1>
          <p>Side Panel</p>
        </div>
      </div>
      <div class="state-empty">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <h3>No contract analyzed yet</h3>
        <p>Select contract text on any webpage, right-click, and choose "Analyze with ContractScan"</p>
      </div>
    `;
  }

  function renderLoading() {
    app.innerHTML = `
      <div class="header">
        <div class="header-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <div class="header-text">
          <h1>ContractScan AI</h1>
          <p>Analyzing...</p>
        </div>
      </div>
      <div class="state-loading">
        <div class="spinner"></div>
        <p>Analyzing your contract</p>
        <p class="sub">Three AI agents are working in parallel...</p>
      </div>
    `;
  }

  function renderError(error) {
    app.innerHTML = `
      <div class="header">
        <div class="header-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <div class="header-text">
          <h1>ContractScan AI</h1>
          <p>Error</p>
        </div>
      </div>
      <div class="state-error">
        <h3>Analysis Failed</h3>
        <p>${escapeHtml(error)}</p>
      </div>
    `;
  }

  function renderResult(data) {
    const scoreClass = data.fairnessScore < 40 ? 'low' : data.fairnessScore < 70 ? 'mid' : 'high';

    // API returns: clauses[] with { title, summary, riskLevel, recommendation, suggestedRewrite, details }
    const clauses = data.clauses || [];
    // API returns: gapAnalysis[] with { clause, importance, suggestion }
    const gaps = data.gapAnalysis || [];

    const redCount = clauses.filter(c => c.riskLevel === 'red').length;
    const amberCount = clauses.filter(c => c.riskLevel === 'amber').length;
    const greenCount = clauses.filter(c => c.riskLevel === 'green').length;

    let clausesHtml = clauses
      .sort((a, b) => {
        const order = { red: 0, amber: 1, green: 2 };
        return (order[a.riskLevel] || 2) - (order[b.riskLevel] || 2);
      })
      .map(c => `
        <div class="clause-card risk-${c.riskLevel}">
          <div class="clause-header">
            <span class="clause-title">${escapeHtml(c.title)}</span>
            <span class="risk-badge ${c.riskLevel}">${c.riskLevel}</span>
          </div>
          <p class="clause-explanation">${escapeHtml(c.summary)}</p>
          ${c.recommendation ? `
            <div class="clause-rewrite">
              <span class="label">Recommendation:</span>
              ${escapeHtml(c.recommendation)}
            </div>
          ` : ''}
          ${c.suggestedRewrite ? `
            <div class="clause-rewrite">
              <span class="label">Suggested Rewrite:</span>
              ${escapeHtml(c.suggestedRewrite)}
            </div>
          ` : ''}
        </div>
      `)
      .join('');

    let gapsHtml = gaps
      .map(g => `
        <div class="gap-card">
          <h4>${escapeHtml(g.clause)}</h4>
          <span class="risk-badge ${g.importance === 'high' ? 'red' : g.importance === 'medium' ? 'amber' : 'green'}">${escapeHtml(g.importance || 'medium')} importance</span>
          <p>${escapeHtml(g.suggestion)}</p>
        </div>
      `)
      .join('');

    const riskLabel = data.overallRisk === 'high' ? 'High Risk' : data.overallRisk === 'medium' ? 'Medium Risk' : 'Low Risk';

    app.innerHTML = `
      <div class="header">
        <div class="header-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <div class="header-text">
          <h1>ContractScan AI</h1>
          <p>Analysis Complete</p>
        </div>
      </div>

      <div class="score-section">
        <div class="score-number ${scoreClass}">${data.fairnessScore != null ? data.fairnessScore : '—'}</div>
        <div class="score-label">Fairness Score</div>
        <div class="doc-type">${escapeHtml(data.documentType || 'Contract')}</div>
        <div style="margin-top:6px;">
          <span class="risk-badge ${data.overallRisk === 'high' ? 'red' : data.overallRisk === 'medium' ? 'amber' : 'green'}">${riskLabel}</span>
        </div>
      </div>

      <div class="stats-bar">
        <div class="stat-card red">
          <div class="num">${redCount}</div>
          <div class="label">High Risk</div>
        </div>
        <div class="stat-card amber">
          <div class="num">${amberCount}</div>
          <div class="label">Caution</div>
        </div>
        <div class="stat-card green">
          <div class="num">${greenCount}</div>
          <div class="label">Fair</div>
        </div>
      </div>

      <div class="section-title">Clause Analysis</div>
      ${clausesHtml || '<p style="font-size:12px;color:var(--text2);">No clauses detected.</p>'}

      ${gaps.length > 0 ? `
        <div class="section-title">Missing Protections (${gaps.length})</div>
        ${gapsHtml}
      ` : ''}

      <div class="panel-footer">
        <a href="https://contractscan-eight.vercel.app" target="_blank">
          Open full analysis at ContractScan AI &rarr;
        </a>
      </div>
    `;
  }

  // ── Helpers ──────────────────────────────────────────────

  function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  // ── State Polling ────────────────────────────────────────

  let lastTimestamp = 0;

  function checkState() {
    chrome.storage.local.get('contractscan_state', (data) => {
      const state = data.contractscan_state;
      if (!state) { renderEmpty(); return; }
      if (state.timestamp <= lastTimestamp) return;
      lastTimestamp = state.timestamp;

      switch (state.status) {
        case 'loading': renderLoading(); break;
        case 'done': renderResult(state.result); break;
        case 'error': renderError(state.error); break;
        default: renderEmpty();
      }
    });
  }

  // Check immediately
  checkState();

  // Poll every 500ms for updates
  setInterval(checkState, 500);
})();
