// Login elements
const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const passcodeInput = document.getElementById('passcode-input');
const loginError = document.getElementById('login-error');

// App elements
const apiDot = document.getElementById('api-dot');
const apiStatus = document.getElementById('api-status');
const regionSelect = document.getElementById('filter-region');
const stateSelect = document.getElementById('filter-state'); // Hidden input for state values
const stateMultiSelect = document.getElementById('state-multi-select');
const stateDisplay = document.getElementById('state-display');
const stateDropdown = document.getElementById('state-dropdown');
const stateOptions = document.getElementById('state-options');
const stateSearch = document.getElementById('state-search');
const orgInput = document.getElementById('filter-org');
const sinceInput = document.getElementById('filter-since');
const scoreInput = document.getElementById('filter-score');
const scoreReadout = document.getElementById('score-readout');
const limitInput = document.getElementById('filter-limit');
const fetchBtn = document.getElementById('fetch-btn');
const refreshBtn = document.getElementById('refresh-btn');
const clearBtn = document.getElementById('clear-btn');
const noticeList = document.getElementById('notice-list');
const detailBody = document.getElementById('detail-body');
const statTotal = document.getElementById('stat-total');
const statStates = document.getElementById('stat-states');
const statUpdated = document.getElementById('stat-updated');
const usMapContainer = document.getElementById('us-map');
const mapTooltip = document.getElementById('map-tooltip');
const mapToast = document.getElementById('map-toast');
const alertsList = document.getElementById('alerts-list');
const heatmapList = document.getElementById('heatmap-list');
const talentList = document.getElementById('talent-list');
const employerList = document.getElementById('employer-list');
const forecastBeds = document.getElementById('forecast-beds');
const forecastSetting = document.getElementById('forecast-setting');
const forecastHorizon = document.getElementById('forecast-horizon');
const forecastOutput = document.getElementById('forecast-output');

// Custom notice form elements
const customNoticeForm = document.getElementById('custom-notice-form');
const customStateSelect = document.getElementById('custom-state');

// Project elements
const projectsList = document.getElementById('projects-list');
const newProjectBtn = document.getElementById('new-project-btn');
const projectModal = document.getElementById('project-modal');
const projectForm = document.getElementById('project-form');
const projectDetailModal = document.getElementById('project-detail-modal');
const projectSearch = document.getElementById('project-search');
const colorPicker = document.getElementById('color-picker');
const calibrationHome = document.getElementById('calibration-home');
const calibrationTarget = document.getElementById('calibration-target');
const calibrationScore = document.getElementById('calibration-score');
const calibrationTier = document.getElementById('calibration-tier');
const calibrationTop = document.getElementById('calibration-top');
const calibrationAvoid = document.getElementById('calibration-avoid');
const calibrationRows = document.getElementById('calibration-rows');
const calibrationScript = document.getElementById('calibration-script');
const modulesMenuBtn = document.getElementById('modules-menu-btn');
const modulesMenu = document.getElementById('modules-menu');
const openProgramsModuleBtn = document.getElementById('open-programs-module');
const programsModal = document.getElementById('programs-modal');
const programsModalClose = document.getElementById('programs-modal-close');
const programsCloseBtn = document.getElementById('programs-close');
const programsList = document.getElementById('programs-list');
const programsCount = document.getElementById('programs-count');
const programsUpdated = document.getElementById('programs-updated');
const programsSearch = document.getElementById('programs-search');
const programsStateFilter = document.getElementById('programs-state-filter');
const programsLevelFilter = document.getElementById('programs-level-filter');
const programsSourceNote = document.getElementById('programs-source-note');
const programsDownload = document.getElementById('programs-download');
const programsLoading = document.getElementById('programs-loading');
const programsProgressBar = document.getElementById('programs-progress-bar');
const programsProgressText = document.getElementById('programs-progress-text');

let currentNotices = [];
let customNotices = []; // User-added notices
let projects = []; // User projects
let currentProjectId = null; // For editing
let stateData = {};
let apiHasDb = true;
let isFetching = false;
let currentMapView = 'map'; // 'map' or 'chart'
let selectedStates = []; // Multi-select states
const NOTICE_MAX_COUNT = 100;
const NOTICE_WINDOW_COUNT = 25;
let calibrationStats = { minCount: 0, maxCount: 0 };
let nursingPrograms = [];
let programsMeta = { lastUpdated: null, sources: [] };
let programsLoaded = false;
let programsModuleInitialized = false;
let programsRefreshPrompted = false;

const REQUIRED_PROGRAM_ACCREDITORS = ['CCNE', 'ACEN', 'CNEA'];

const getLoadedAccreditors = (programs) => {
  const accreditors = new Set();
  programs.forEach((program) => {
    const normalized = normalizeProgram(program);
    const accreditor = normalized.accreditor.trim().toUpperCase();
    if (accreditor) accreditors.add(accreditor);
  });
  return accreditors;
};

// Login handling - server-side validation
const SESSION_KEY = 'lni_authenticated';
const PASSCODE_KEY = 'lni_passcode';

const checkAuth = () => {
  return sessionStorage.getItem(SESSION_KEY) === 'true' && sessionStorage.getItem(PASSCODE_KEY);
};

const getAuthHeaders = () => {
  const passcode = sessionStorage.getItem(PASSCODE_KEY);
  if (!passcode) return {};
  return { 'Authorization': `Bearer ${passcode}` };
};

const handleLogin = async (e) => {
  e.preventDefault();
  const entered = passcodeInput.value.trim();
  const loginBtn = loginForm.querySelector('button[type="submit"]');

  if (!entered) {
    loginError.textContent = 'Please enter a passcode.';
    return;
  }

  // Disable button during request
  loginBtn.disabled = true;
  loginBtn.textContent = 'Verifying...';

  try {
    const response = await fetch('/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: entered })
    });

    const data = await response.json();

    if (data.success) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      sessionStorage.setItem(PASSCODE_KEY, entered);
      loginOverlay.classList.add('hidden');
      passcodeInput.value = '';
      loginError.textContent = '';
      initApp();
    } else {
      loginError.textContent = 'Invalid passcode. Please try again.';
      loginError.classList.remove('shake');
      void loginError.offsetWidth; // Trigger reflow for animation
      loginError.classList.add('shake');
      passcodeInput.value = '';
      passcodeInput.focus();
    }
  } catch (err) {
    loginError.textContent = 'Connection error. Please try again.';
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Access Dashboard';
  }
};

// Initialize login
if (checkAuth()) {
  loginOverlay.classList.add('hidden');
} else {
  passcodeInput.focus();
}

loginForm.addEventListener('submit', handleLogin);

const REGIONS = ['Northeast', 'Midwest', 'South', 'West'];

// Region to states mapping (matches backend)
const REGION_STATES = {
  Northeast: ['CT', 'ME', 'MA', 'NH', 'RI', 'VT', 'NJ', 'NY', 'PA'],
  Midwest: ['IL', 'IN', 'MI', 'OH', 'WI', 'IA', 'KS', 'MN', 'MO', 'NE', 'ND', 'SD'],
  South: ['DE', 'FL', 'GA', 'MD', 'NC', 'SC', 'VA', 'DC', 'WV', 'AL', 'KY', 'MS', 'TN', 'AR', 'LA', 'OK', 'TX'],
  West: ['AZ', 'CO', 'ID', 'MT', 'NV', 'NM', 'UT', 'WY', 'AK', 'CA', 'HI', 'OR', 'WA']
};

const formatDate = (value) => {
  if (!value) return 'Unknown';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return 'Unknown';
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString();
};

const parseMaybeJson = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [value];
    }
  }
  return [String(value)];
};

const escapeHtml = (value) => {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const setStatus = (status, ok) => {
  apiStatus.textContent = status;
  apiDot.classList.remove('ok', 'bad');
  apiDot.classList.add(ok ? 'ok' : 'bad');
};

const setLoading = (message) => {
  noticeList.innerHTML = `<div class="empty-state">${message}</div>`;
};

const buildQuery = () => {
  const params = new URLSearchParams();
  params.set('recruiterFocus', '1');
  if (orgInput.value.trim()) params.set('org', orgInput.value.trim());
  if (regionSelect.value) params.set('region', regionSelect.value);
  // Handle multiple selected states
  if (selectedStates.length > 0) {
    params.set('state', selectedStates.join(','));
  }
  if (sinceInput.value) params.set('since', sinceInput.value);
  if (scoreInput.value) params.set('minScore', scoreInput.value);
  if (!limitInput.value || Number(limitInput.value) <= 0) {
    params.set('limit', 'all');
  } else {
    params.set('limit', limitInput.value);
  }
  return params.toString();
};

const fetchJson = async (path) => {
  const res = await fetch(path, {
    headers: getAuthHeaders()
  });
  if (res.status === 401) {
    // Session expired or invalid - force re-login
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(PASSCODE_KEY);
    loginOverlay.classList.remove('hidden');
    throw new Error('Session expired. Please log in again.');
  }
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};

const STATE_CALIBRATION_FACTORS = [
  { key: 'staffing', label: 'Staffing Safety', pitch: 'staffing stability and coverage' },
  { key: 'leadership', label: 'Leadership Support', pitch: 'leader support and team advocacy' },
  { key: 'scheduling', label: 'Scheduling Balance', pitch: 'predictable scheduling and less mandatory overtime' },
  { key: 'pay', label: 'Pay & Differentials', pitch: 'competitive pay and shift differentials' },
  { key: 'safety', label: 'Psychological Safety', pitch: 'lower burnout risk and safer care environments' },
  { key: 'resources', label: 'Resources & Equipment', pitch: 'better resourcing and modern equipment' },
  { key: 'growth', label: 'Growth Opportunities', pitch: 'specialty growth and career pathways' },
  { key: 'respect', label: 'Professional Respect', pitch: 'stronger voice in shared governance' }
];

const clampScore = (value) => Math.max(0, Math.min(10, value));

const scoreFromCount = (state, invert = false) => {
  const count = stateData[state]?.count ?? 0;
  const range = calibrationStats.maxCount - calibrationStats.minCount;
  if (range <= 0) return 5;
  const ratio = (count - calibrationStats.minCount) / range;
  const value = invert ? 1 - ratio : ratio;
  return clampScore(Math.round(value * 100) / 10);
};

const buildStateProfile = (state) => {
  const staffing = scoreFromCount(state, true);
  const resources = scoreFromCount(state, false);
  const growth = scoreFromCount(state, false);

  return {
    staffing,
    leadership: clampScore(staffing * 0.85 + 1.2),
    scheduling: clampScore(staffing * 0.8 + 1),
    pay: 5,
    safety: clampScore(staffing * 0.7 + 2),
    resources,
    growth,
    respect: 5
  };
};

const formatDelta = (delta) => {
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}`;
};

const updateStateCalibration = () => {
  if (!calibrationHome || !calibrationTarget || !calibrationRows) return;
  const homeState = calibrationHome.value;
  const targetState = calibrationTarget.value;
  if (!homeState || !targetState || homeState === targetState) {
    calibrationScore.textContent = '--';
    calibrationTier.textContent = 'Select two different states to compare.';
    calibrationRows.innerHTML = '';
    calibrationTop.innerHTML = '<li>Select two different states.</li>';
    calibrationAvoid.innerHTML = '<li>Select two different states.</li>';
    calibrationScript.textContent = '';
    return;
  }

  const homeProfile = buildStateProfile(homeState);
  const targetProfile = buildStateProfile(targetState);

  const deltas = STATE_CALIBRATION_FACTORS.map(factor => {
    const homeValue = homeProfile[factor.key];
    const targetValue = targetProfile[factor.key];
    const delta = homeValue - targetValue;
    return { ...factor, homeValue, targetValue, delta };
  });

  const positiveDeltas = deltas.filter(entry => entry.delta > 0);
  const avgPositive = positiveDeltas.length
    ? positiveDeltas.reduce((sum, entry) => sum + entry.delta, 0) / positiveDeltas.length
    : 0;
  const rsas = Math.round(clampScore(avgPositive) * 10);

  calibrationScore.textContent = rsas ? `${rsas}` : '0';
  if (rsas >= 80) calibrationTier.textContent = 'Very strong relocation pitch.';
  else if (rsas >= 60) calibrationTier.textContent = 'Solid opportunity. Emphasize strengths.';
  else if (rsas >= 40) calibrationTier.textContent = 'Selective pitch. Focus on unit-specific needs.';
  else calibrationTier.textContent = 'Use caution. Avoid leading with relocation.';

  const leadFactors = deltas.filter(entry => entry.delta >= 0.4).slice(0, 3);
  const avoidFactors = deltas.filter(entry => entry.delta <= -0.5).slice(0, 3);

  calibrationTop.innerHTML = leadFactors.length
    ? leadFactors.map(entry => `<li>${entry.label}</li>`).join('')
    : '<li>No strong advantages detected.</li>';
  calibrationAvoid.innerHTML = avoidFactors.length
    ? avoidFactors.map(entry => `<li>${entry.label}</li>`).join('')
    : '<li>No clear weaknesses to avoid.</li>';

  const scriptFactors = leadFactors.length ? leadFactors : deltas.sort((a, b) => b.delta - a.delta).slice(0, 2);
  const scriptLine = scriptFactors.length
    ? `Nurses from ${targetState} tell us the biggest difference here is ${scriptFactors.map(f => f.pitch).join(' and ')}.`
    : `We tailor outreach to what nurses in ${targetState} care about most.`;
  calibrationScript.textContent = scriptLine;

  calibrationRows.innerHTML = deltas.map(entry => {
    const deltaClass = entry.delta >= 0.5 ? 'positive' : entry.delta <= -0.5 ? 'negative' : '';
    return `
      <tr>
        <td>${entry.label}</td>
        <td>${entry.homeValue.toFixed(1)}</td>
        <td>${entry.targetValue.toFixed(1)}</td>
        <td class="calibration-delta ${deltaClass}">${formatDelta(entry.delta)}</td>
      </tr>
    `;
  }).join('');
};

const initStateCalibration = () => {
  if (!calibrationHome || !calibrationTarget) return;
  const options = ALL_STATES.map(state => `<option value="${state}">${state}</option>`).join('');
  calibrationHome.innerHTML = `<option value="">Select state</option>${options}`;
  calibrationTarget.innerHTML = `<option value="">Select state</option>${options}`;
  calibrationHome.value = ALL_STATES.includes('IN') ? 'IN' : ALL_STATES[0];
  calibrationTarget.value = ALL_STATES.includes('FL') ? 'FL' : ALL_STATES[1];

  calibrationHome.addEventListener('change', updateStateCalibration);
  calibrationTarget.addEventListener('change', updateStateCalibration);
  updateStateCalibration();
};

const loadHealth = async () => {
  try {
    const data = await fetchJson('/health');
    apiHasDb = Boolean(data.db);
    if (data.ok) {
      setStatus(data.db ? 'API connected to Postgres' : 'API running without DB', true);
    } else {
      setStatus('API error', false);
    }
  } catch {
    apiHasDb = false;
    setStatus('API offline', false);
  }
};

const loadStates = async () => {
  try {
    const data = await fetchJson('/states');
    const states = data.states ?? [];
    statStates.textContent = states.length.toString();
    states.forEach(({ state }) => {
      const opt = document.createElement('option');
      opt.value = state;
      opt.textContent = state;
      stateSelect.appendChild(opt);
    });
  } catch {
    statStates.textContent = '0';
  }
};

const renderNotices = (notices) => {
  const visibleNotices = notices.slice(0, NOTICE_MAX_COUNT);
  const applyNoticeListWindow = (count) => {
    if (!noticeList) return;
    if (!count) {
      noticeList.style.maxHeight = '';
      noticeList.classList.remove('windowed');
      return;
    }
    const firstCard = noticeList.querySelector('.notice-card');
    if (!firstCard) return;
    const cardHeight = firstCard.getBoundingClientRect().height;
    const styles = getComputedStyle(noticeList);
    const gap = parseFloat(styles.rowGap || styles.gap || '0');
    const windowCount = Math.min(NOTICE_WINDOW_COUNT, count);
    const windowHeight = (cardHeight * windowCount) + (gap * Math.max(0, windowCount - 1));
    noticeList.style.maxHeight = `${Math.ceil(windowHeight)}px`;
    noticeList.classList.toggle('windowed', count > NOTICE_WINDOW_COUNT);
  };

  if (!visibleNotices.length) {
    noticeList.innerHTML = `<div class="empty-state">No notices match these filters yet.</div>`;
    applyNoticeListWindow(0);
    return;
  }

  noticeList.innerHTML = '';
  visibleNotices.forEach((notice, idx) => {
    const card = document.createElement('article');
    card.className = notice.isCustom ? 'notice-card custom-notice' : 'notice-card';
    card.style.animationDelay = `${idx * 35}ms`;
    card.dataset.noticeId = notice.id;

    // Handle both API format and custom notice format
    const label = notice.nursing_label ?? notice.nursingImpact?.label ?? 'Unclear';
    const score = notice.nursing_score ?? notice.nursingImpact?.score ?? 0;
    const employer = notice.employer_name ?? notice.employerName ?? 'Unknown employer';
    const city = notice.city;
    const state = notice.state;
    const location = [city, state].filter(Boolean).join(', ') || state;
    const noticeDate = formatDate(notice.notice_date ?? notice.noticeDate ?? notice.retrieved_at ?? notice.createdAt);
    const affected = notice.employees_affected ?? notice.affectedCount;

    const customBadge = notice.isCustom ? '<span class="custom-badge">Custom</span>' : '';

    card.innerHTML = `
      <div class="notice-top">
        <span class="pill">${state}</span>
        ${customBadge}
        <span class="score">${label} - ${score}</span>
        <div class="save-to-project">
          <button class="save-to-project-btn" data-notice-idx="${idx}">+ Save</button>
          <div class="save-dropdown" id="dropdown-${idx}"></div>
        </div>
      </div>
      <h4>${employer}</h4>
      <div class="notice-meta">
        <span>${location}</span>
        <span>${noticeDate}</span>
        <span>${formatNumber(affected)} impacted</span>
      </div>
    `;

    noticeList.appendChild(card);
  });

  // Add save-to-project dropdown handlers
  document.querySelectorAll('.save-to-project-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = btn.dataset.noticeIdx;
      const dropdown = document.getElementById(`dropdown-${idx}`);

      // Close all other dropdowns
      document.querySelectorAll('.save-dropdown.active').forEach(d => {
        if (d !== dropdown) d.classList.remove('active');
      });

      // Build dropdown content
      if (projects.length === 0) {
        dropdown.innerHTML = `<div class="save-dropdown-item" style="color: var(--muted);">No projects yet. Create one first.</div>`;
      } else {
        dropdown.innerHTML = projects.map(p => `
          <div class="save-dropdown-item" data-project-id="${p.id}" style="border-left-color: ${p.color}">
            ${p.name}
          </div>
        `).join('');
      }

      dropdown.classList.toggle('active');
    });
  });

  // Handle dropdown item clicks
  document.querySelectorAll('.save-dropdown').forEach((dropdown, idx) => {
    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = e.target.closest('.save-dropdown-item');
      if (item && item.dataset.projectId) {
        const notice = visibleNotices[idx];
        saveNoticeToProject(item.dataset.projectId, notice);
        dropdown.classList.remove('active');
      }
    });
  });

  applyNoticeListWindow(visibleNotices.length);
};

// Close dropdowns when clicking elsewhere
document.addEventListener('click', (event) => {
  document.querySelectorAll('.save-dropdown.active').forEach(d => d.classList.remove('active'));
  if (modulesMenu && !modulesMenu.contains(event.target) && event.target !== modulesMenuBtn) {
    closeModulesMenu();
  }
});

const renderDetail = (notice) => {
  if (!notice) {
    detailBody.innerHTML = `<div class="empty-detail">No notice selected.</div>`;
    return;
  }

  const signals = parseMaybeJson(notice.nursing_signals);
  const keywords = parseMaybeJson(notice.nursing_keywords);
  const specialties = parseMaybeJson(notice.nursing_specialties);
  const roleMix = notice.nursing_role_mix || null;
  const careSetting = notice.nursing_care_setting || 'unknown';
  const leadTime = notice.lead_time_days;

  detailBody.innerHTML = `
    <div class="detail-section">
      <h5>${notice.employer_name || 'Unknown employer'}</h5>
      <p>${[notice.facility_name, notice.parent_system].filter(Boolean).join(' • ') || 'System unknown'}</p>
      <p>${[notice.address, notice.city, notice.county, notice.state].filter(Boolean).join(', ') || 'Location unknown'}</p>
    </div>
    <div class="detail-section">
      <h5>Impact Summary</h5>
      <p>Score: ${notice.nursing_score ?? 0} (${notice.nursing_label ?? 'Unclear'})</p>
      <p>Employees affected: ${formatNumber(notice.employees_affected)}</p>
      <p>NAICS: ${notice.naics ?? 'Unknown'} - Reason: ${notice.reason ?? 'Not provided'}</p>
    </div>
    <div class="detail-section">
      <h5>Nursing Impact Breakdown</h5>
      <p>Care setting: ${careSetting}</p>
      <p>Lead time: ${leadTime !== null && leadTime !== undefined ? `${leadTime} days` : 'Unknown'}</p>
      <p>Role mix: ${roleMix ? `RN ${roleMix.rn}% • LPN ${roleMix.lpn}% • CNA ${roleMix.cna}%` : 'Unavailable'}</p>
      <p>Specialties: ${specialties.length ? specialties.join(', ') : 'None detected'}</p>
    </div>
    <div class="detail-section">
      <h5>Signals & Keywords</h5>
      <p>${signals.length ? signals.join(', ') : 'No signals captured yet.'}</p>
      <p>${keywords.length ? `Keywords: ${keywords.join(', ')}` : 'No keywords logged.'}</p>
    </div>
    <div class="detail-section detail-links">
      <h5>Source</h5>
      <p>Source: ${notice.source_name ?? 'Unknown source'}</p>
      <p><a href="${notice.source_url}" target="_blank" rel="noreferrer">Open source page</a></p>
    </div>
    <div class="detail-section">
      <h5>Timeline</h5>
      <p>Notice date: ${formatDate(notice.notice_date)}</p>
      <p>Effective date: ${formatDate(notice.effective_date)}</p>
      <p>Retrieved: ${formatDate(notice.retrieved_at)}</p>
    </div>
  `;
};

// =============================================================================
// Premium Insights (API mode fallback to /data files when available)
// =============================================================================
const renderInsightFallback = (element, message) => {
  if (!element) return;
  element.innerHTML = `<div class="empty-state">${message}</div>`;
};

const renderAlerts = (data) => {
  if (!alertsList) return;
  const alerts = data?.alerts ?? [];
  if (!alerts.length) {
    renderInsightFallback(alertsList, 'No recent alerts.');
    return;
  }
  const top = alerts
    .sort((a, b) => (b.early_warning === true) - (a.early_warning === true))
    .slice(0, 8);
  alertsList.innerHTML = top.map(alert => `
    <div class="insight-row">
      <div>
        <div class="insight-title">${alert.employer_name || 'Unknown employer'}</div>
        <div class="insight-meta">${[alert.state, alert.facility_name || alert.parent_system].filter(Boolean).join(' • ')}</div>
      </div>
      <div>
        <div class="insight-pill ${alert.early_warning ? 'yellow' : ''}">${alert.early_warning ? 'Early' : 'Signal'}</div>
        <div class="insight-meta">${alert.lead_time_days ?? 'n/a'}d lead</div>
      </div>
    </div>
  `).join('');
};

const renderHeatmap = (data) => {
  if (!heatmapList) return;
  const locations = data?.locations ?? [];
  const ranked = locations
    .filter(loc => loc.risk_level === 'red' || loc.risk_level === 'yellow')
    .sort((a, b) => b.notices_last_90_days - a.notices_last_90_days)
    .slice(0, 8);
  if (!ranked.length) {
    renderInsightFallback(heatmapList, 'No hotspots detected.');
    return;
  }
  heatmapList.innerHTML = ranked.map(loc => {
    const cityDisplay = loc.city && loc.city !== 'unknown' ? loc.city : `${loc.state} Statewide`;
    return `
    <div class="insight-row">
      <div>
        <div class="insight-title">${cityDisplay}</div>
        <div class="insight-meta">${loc.state} • ${loc.notices_last_90_days} in 90d</div>
      </div>
      <div class="insight-pill ${loc.risk_level === 'red' ? 'red' : 'yellow'}">${loc.risk_level.toUpperCase()}</div>
    </div>
  `;
  }).join('');
};

const renderTalent = (data) => {
  if (!talentList) return;
  const opportunities = data?.opportunities ?? [];
  const top = opportunities
    .sort((a, b) => b.estimated_nurses_available - a.estimated_nurses_available)
    .slice(0, 8);
  if (!top.length) {
    renderInsightFallback(talentList, 'No talent signals yet.');
    return;
  }
  talentList.innerHTML = top.map(entry => {
    const cityDisplay = entry.city && entry.city !== 'unknown' ? entry.city : `${entry.state} Statewide`;
    return `
    <div class="insight-row">
      <div>
        <div class="insight-title">${cityDisplay}</div>
        <div class="insight-meta">${entry.state} • ${entry.notices_count} notices</div>
      </div>
      <div>
        <div class="insight-pill">${entry.estimated_nurses_available}</div>
        <div class="insight-meta">${entry.specialties?.slice(0, 2).join(', ') || 'General'}</div>
      </div>
    </div>
  `;
  }).join('');
};

const renderEmployers = (data) => {
  if (!employerList) return;
  const employers = data?.employers ?? [];
  const top = employers
    .sort((a, b) => b.total_notices - a.total_notices)
    .slice(0, 8);
  if (!top.length) {
    renderInsightFallback(employerList, 'No employer profiles yet.');
    return;
  }
  employerList.innerHTML = top.map(entry => `
    <div class="insight-row">
      <div>
        <div class="insight-title">${entry.employer_name || 'Unknown employer'}</div>
        <div class="insight-meta">${entry.parent_system || entry.state} • ${entry.total_notices} notices</div>
      </div>
      <div class="insight-meta">${entry.avg_lead_time_days ?? 'n/a'}d avg lead</div>
    </div>
  `).join('');
};

const loadInsights = async () => {
  try {
    const [alerts, geo, talent, employers] = await Promise.all([
      fetchJson('/insights/alerts'),
      fetchJson('/insights/geo'),
      fetchJson('/insights/talent'),
      fetchJson('/insights/employers')
    ]);
    renderAlerts(alerts);
    renderHeatmap(geo);
    renderTalent(talent);
    renderEmployers(employers);
  } catch (err) {
    try {
      const [alerts, geo, talent, employers] = await Promise.all([
        fetchJson('/data/alerts.json'),
        fetchJson('/data/geo.json'),
        fetchJson('/data/talent.json'),
        fetchJson('/data/employers.json')
      ]);
      renderAlerts(alerts);
      renderHeatmap(geo);
      renderTalent(talent);
      renderEmployers(employers);
    } catch (fallbackErr) {
      console.warn('Insights unavailable in API mode:', fallbackErr);
      renderInsightFallback(alertsList, 'Insights unavailable.');
      renderInsightFallback(heatmapList, 'Insights unavailable.');
      renderInsightFallback(talentList, 'Insights unavailable.');
      renderInsightFallback(employerList, 'Insights unavailable.');
    }
  }
};

const initForecast = () => {
  if (!forecastBeds || !forecastSetting || !forecastHorizon || !forecastOutput) return;
  const roleMixBySetting = {
    acute: { rn: 70, lpn: 20, cna: 10 },
    snf: { rn: 35, lpn: 25, cna: 40 },
    outpatient: { rn: 60, lpn: 25, cna: 15 },
    home: { rn: 55, lpn: 25, cna: 20 },
    behavioral: { rn: 60, lpn: 20, cna: 20 }
  };
  const multiplierBySetting = {
    acute: 0.65,
    snf: 0.45,
    outpatient: 0.2,
    home: 0.15,
    behavioral: 0.35
  };

  const updateForecast = () => {
    const beds = Number.parseInt(forecastBeds.value || '0', 10) || 0;
    const setting = forecastSetting.value || 'acute';
    const horizon = Number.parseInt(forecastHorizon.value || '0', 10) || 0;
    const multiplier = multiplierBySetting[setting] ?? 0.4;
    const totalNurses = Math.max(0, Math.round(beds * multiplier));
    const mix = roleMixBySetting[setting] ?? roleMixBySetting.acute;
    const rn = Math.round((totalNurses * mix.rn) / 100);
    const lpn = Math.round((totalNurses * mix.lpn) / 100);
    const cna = Math.round((totalNurses * mix.cna) / 100);

    forecastOutput.innerHTML = `
      Estimated displacement over ${horizon || 60} days:
      <strong>${totalNurses}</strong> total nurses
      (RN ${rn} • LPN ${lpn} • CNA ${cna}).
    `;
  };

  forecastBeds.addEventListener('input', updateForecast);
  forecastSetting.addEventListener('change', updateForecast);
  forecastHorizon.addEventListener('input', updateForecast);
  updateForecast();
};

const loadNotices = async () => {
  setLoading('Loading notices...');
  const query = buildQuery();
  try {
    const data = await fetchJson(`/notices?${query}`);
    let notices = data.notices ?? [];

    // Merge in custom notices from localStorage
    if (customNotices.length > 0) {
      notices = [...customNotices, ...notices];
    }

    currentNotices = notices;
    renderNotices(currentNotices);
    updateStats(currentNotices);
    if (!currentNotices.length) {
      if (!apiHasDb) {
        noticeList.innerHTML = `<div class="empty-state">No database connected. Start Postgres and run the worker to load notices.</div>`;
      }
      renderDetail(null);
    }
  } catch (err) {
    // Still show custom notices even if API fails
    if (customNotices.length > 0) {
      currentNotices = [...customNotices];
      renderNotices(currentNotices);
      updateStats(currentNotices);
    } else {
      setLoading('Unable to load notices. Is the API running?');
      statTotal.textContent = '0';
    }
    renderDetail(null);
  }
};

// Update stats display
const updateStats = (notices) => {
  statTotal.textContent = notices.length.toString();
  statUpdated.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

noticeList.addEventListener('click', (event) => {
  const card = event.target.closest('.notice-card');
  if (!card) return;
  const notice = currentNotices.find((n) => n.id === card.dataset.noticeId);
  renderDetail(notice);
});

scoreInput.addEventListener('input', () => {
  scoreReadout.textContent = `${scoreInput.value}+`;
});

refreshBtn.addEventListener('click', loadNotices);

// Fetch live data from state adapters
const fetchLiveData = async () => {
  if (isFetching) return;
  isFetching = true;
  fetchBtn.disabled = true;
  fetchBtn.classList.add('fetching');
  fetchBtn.textContent = 'Fetching...';
  setLoading('Fetching live data from state WARN sources... This may take a minute.');

  try {
    const res = await fetch('/fetch', {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (res.status === 401) {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(PASSCODE_KEY);
      loginOverlay.classList.remove('hidden');
      throw new Error('Session expired. Please log in again.');
    }

    const data = await res.json();

    if (data.success) {
      fetchBtn.textContent = `Fetched ${data.count} notices`;
      setStatus(`Fetched ${data.count} from ${data.states?.length || 0} states`, true);
      // Reload notices and states
      await loadStates();
      await loadNotices();
    } else {
      fetchBtn.textContent = 'Fetch Failed';
      setStatus('Fetch error: ' + (data.error || 'Unknown'), false);
    }
  } catch (err) {
    fetchBtn.textContent = 'Fetch Failed';
    setStatus('Fetch error: ' + err.message, false);
  } finally {
    isFetching = false;
    fetchBtn.disabled = false;
    fetchBtn.classList.remove('fetching');
    setTimeout(() => {
      fetchBtn.textContent = 'Fetch Live Data';
    }, 3000);
  }
};

fetchBtn.addEventListener('click', fetchLiveData);

clearBtn.addEventListener('click', () => {
  regionSelect.value = '';
  // Clear multi-select states
  selectedStates = [];
  stateSelect.value = '';
  populateStateDropdown('');
  updateStateDisplay();
  // Clear other filters
  orgInput.value = '';
  sinceInput.value = '';
  scoreInput.value = 0;
  scoreReadout.textContent = '0+';
  limitInput.value = '';
  // Update map highlights and reload
  if (currentMapView === 'map') {
    updateMapHighlights();
  } else {
    renderBarChart();
  }
  loadNotices();
});

regionSelect.addEventListener('change', () => {
  // Update state dropdown to show only states in the selected region
  populateStateDropdown(regionSelect.value);
  // Update map/chart highlights
  if (currentMapView === 'map') {
    updateMapHighlights();
  } else {
    renderBarChart();
  }
  // Trigger data reload
  loadNotices();
});

// State selection is now handled by the multi-select component via onStateSelectionChange()

orgInput.addEventListener('input', () => {
  if (!orgInput.value.trim()) {
    loadNotices();
  }
});

// US State abbreviation to full name mapping
const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia'
};

// US state SVG - using standard Albers USA projection
const US_STATES_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600" preserveAspectRatio="xMidYMid meet" style="background:#f8f8f8">
  <path id="AL" d="M628.5,405.6l-1.8-16.1l-2.7-19.9l-1.9-15.7l1.6-4.1l2.7-7.1l4.5-8.7l0.4-6l4.2-9.8l0.8-4.7l-1.4-5.7l0.2-2.9l34.4-3.5l11.3-1.1l0.5,1.7l2.9,12.6l3.5,16.9l1.9,10.5l0.4,23.9l-0.7,5.4l1.9,5.3l0.5,5.9l1.9,4.5l-1.5,5l-0.1,3.9l1.8,3.7l3.3,4.9l-1.9,4.7l-15.8,1.8l-5.8,0.2l-1.5,6l-4.6,13.2l-2.6,5.5l3.2,5.6l-2.3,3.6l-26.7,3.3l-2.4-12.9l0.5-6.3l-2.1-6.2l0.1-5.6l-3.9-10.9z"/>
  <path id="AK" d="M158.1,573.7l-0.3-0.6l0.8-2.1l2.1-1l2.4-0.1l1,0.6l-0.3,1l-2.2,1.2l-2.2,0.9l-0.9,0.2zM162.9,571.2l0.8-1.3l1.9,0.1l0,0.9l-1.3,0.8l-1.1,0z"/>
  <path id="AZ" d="M214.9,404l-0.5-1.1l-1.7-1.1l-0.6-1.6l0.5-1.1l-0.3-0.7l-2.2-0.7l-0.5-2l1.2-2.6l0.8-1l0-1.9l-1.8-2.4l-3.9-5.8l-3.4-3.6l-1.5-5l-2.7-2.7l-1-3.6l-2.9-2.1l0.6-2.7l1.9-4.7l0.2-11.5l-0.7-3.6l0.6-5.3l-0.2-5.3l-2.9-7.8l-0.7-5.8l-2-3.2l0-1.9l12.1-70.3l38.4,7.2l38.6,6.2l-14.9,100.6l-21.6-3l-30.9-4.7l-0.6,6.5l0.5,1.1l-1.5,2.4l-0.6,4.7l1.7,5.6l0.9,4.9l0.4,2.4l2.4,2.3l0.1,1.9l-2.3,0.1l-1.9,2.5l-1.4,4.3l0.3,2.4l-1.2,0.3z"/>
  <path id="AR" d="M583.7,340.7l-5.4,0.5l-2.9-3.2l0.5-3.7l-1.9-4l1.9-2.5l-1.6-4.1l2.1-5.3l-2.7-4.3l2-1.2l-0.9-4.5l-40.6,1.5l-35.4,1l0.7,5.4l0,8.4l1.9,7.1l-0.2,4.1l2.1,5.3l0.3,3l-1.2,5.1l0.5,3.5l2.9,4l-0.6,2.7l3.3,0.9l0.9,3.7l1.9-1.7l2.6,1l0.4,29.3l23.5-0.4l24.5-0.8l12.8-0.8l5.4-0.5l1.8-5.7l3.6-3.6l-0.2-3.9l3.6-6.2l3.7-2.2l-0.2-7.9l-2.7-2.9l2.7-1.9l-0.6-5.9l2.9-5.9l2-0.2l-1.1-5.3z"/>
  <path id="CA" d="M122.7,374.3l-0.7-2.5l-1.5-1.2l-0.8-2.9l1.2-2.4l-1-2.9l0.7-2.2l-1.3-2l0.1-1.8l1.8-2.3l1.8,0.5l1.4-1.6l-2.6-2.9l-1.9-2.6l-1.9-3.4l0.3-2.6l-0.9-4.1l-2.5-4.9l-0.1-3.3l-1.9-3.5l0.3-1.6l-1.4-2.7l-1.7-1l-0.1-2.4l-3.9-5.5l-1.6-5.2l-0.3-2.6l-1.9-3.5l-1.9-4.3l-0.2-2.9l-1.3-2.5l-3.2-2.4l-0.2-1.2l-2.4-2.9l-0.3-2.9l-3.4-3.6l-0.9-2.8l0.3-5.7l-1-1.9l-0.4-3.7l-0.3-3.9l0.7-2.9l-1.9-2l-0.2-0.6l1.6-5.9l3.5-5.9l0.2-3.1l1.7-3.9l2.9-1.6l1.7-3.9l-0.1-3.1l1.4-2.7l0-2.9l-0.4-2.5l4.4-6.6l3.9-4.7l0.9-3l3.9-4.9l0.6-2.9l-0.4-1.5l2.2-4.2l1.5-4l2.4-3.9l-0.9-1l0.7-1.2l6.5-0.9l2.9-1.7l2.6-2.3l0.7-4.6l-1.6-1.7l2.5-5.9l36.2,8.7l33.7,7.5l-10.9,49.6l12.8,16.6l27.5,36.9l18.8,24l-0.9,3.4l0.5,4.5l-0.2,11.5l-1.9,4.7l-0.6,2.7l-22.9-3l-51.9-9.1l1.3,7.4l4.2,12.7l5.1,9.1l0.6,2.3l2.9,3.6l-0.1,4.6l2.2,3.8l-0.1,2.3l4.7,6.3l-0.7,2.9l-4.9-0.2l-6.6-1l-5.5-3.7l-3.5,0.2l-5.3-2.1l-4.2-1.3l-1.9,0.4l-6.5-1.4l-5.6-3.7l-4.7-1.9z"/>
  <path id="CO" d="M380.6,254l-1.7-14.9l-1.9-13.9l-2.8-18.9l-1.9-16.6l-44.3,3.3l-45.5,2.3l-42.6,0.7l3.5,23.7l3.7,26.1l3.7,23l3.5,25.2l41.9-2.9l42.5-4.1l42.5-5.3z"/>
  <path id="CT" d="M852.1,175l-4.6-17.9l-0.6-3.5l-6.1,1.4l-22.3,5.1l0.9,5l1.9,8.3l-0.6,6.7l-1.5,2.1l1.4,2.2l5.9-3.9l3.5-3.5l1.3,0.8l3.5-1l5.9-1.2l8.7-1.8z"/>
  <path id="DE" d="M820.8,228.1l0.4-3.4l0.6-1.9l-1-1.6l-1.5-0.3l0.1-2.7l-2.6-0.6l-1.8-3.3l-0.4-4.7l-4.9-2.6l-1.9-3.3l4.7-0.7l3.8-0.2l1.8,0.3l3,10.7l2.2,7.9l-0.4,3.5l-1.3,0.6z"/>
  <path id="FL" d="M752.7,488.5l-2.6-3.9l-2.3-5.7l-2.8-4.9l-2.9-7.6l-2.5-3.8l-1.7-5.4l-3.7-5.8l-1.1-2l0.2-2.3l-3-4.9l-4.5-3.9l-3.7-6.2l-3.9-3.9l-2.7-4.7l-0.5-4.5l-1.6,0.7l-1.9,3.5l2.1,4.9l4.7,5.3l3.4,5.7l4.9,5.7l2.2,4.9l3.6,5.2l2.9,3.5l2.3,6.4l3,4.9l0.4,2.6l-2.3,0.9l-0.9,2.5l0.5,3.7l-1.3,1l-3.5,0.1l0.4,3.4l0.9,1.9l-1.7,4.1l-3.9,1.6l-1.3,3.5l-3.3,0.3l-2.7,1.7l-4.9,1.2l-2.3,1.5l-5,1.7l-0.3,2.4l-3.7,0.7l-5.6,2.4l-3.7,0.7l-3.1,2.2l-4.9,1.3l-0.8,1.8l-5.7,2.4l-4.5,0.6l-1.7-1l-2.5,1.7l-4.5-0.8l-3.9,1.6l-2.8-0.9l-1.9,0.9l-3.2-1.9l0.5-2l-3.3-2.5l-4-0.9l-0.9,0.9l-2.9-2.1l-4.9-0.7l-2.5-2l-4.2-0.7l-2.7-2.9l-0.2-2.1l-3.5-0.7l-4.5-3l-5.9-2.6l-2-3.9l-0.9-5.1l-3.2-3.8l1-1.9l-3.3-3.7l-1.6-4.9l0.2-3.5l1.2-0.5l-0.9-3.5l3.9-1.8l6.9-2l5.9-0.9l4.9,1l4.3,1.7l3.3-0.7l4.5,1l4.8,3.9l2.5,1l4.9,0.3l6,1.7l3.9-1.6l1.2-2.9l3.3-2.4l1.5-3.3l-0.7-1.9l2.3-0.6l-0.2-2.2l26.9-3.3l5.7-0.1l15.9-1.9l1.9-4.4l-3.3-5.1l-1.8-3.9l0.9-5.9l-0.5-6l-2.1-6.3l0.4-2.9l2.1,0.4l1.3-2.2l21.5-2.5l19.9-0.6l2.6,2.5l3.7,5l2.7,3.3l0.9,2.7l3.7,4.9l0.5,2.9l1.9,4l6.9,8.3l4.9,3.3l0.4,4.6l4.3,0.5l0.1,3.2l2.5,5.7l-0.3,5.5l-1.1,5.9l0.8,3l-0.8,4.6l-3.1,4.2l0.7,5.5l-1.8,4.1l-0.6,4.4l2.2,3.2l-2.9,4.5l-2.9,1l-1.9,3.8l-0.1,4.3l-1.3,1.5z"/>
  <path id="GA" d="M699.6,413.9l-7.5,1.1l-7.6,0.9l-4.6,0.1l-2.5-2.5l-1.6-4.1l-4.8-5.5l-3.7-5.8l-4.8-4.1l-1.7-4.7l-3.1-4.7l-4.9-3.9l-0.5-2.9l-3.1-5.7l-0.7-2.9l-2.1-2.7l-3.3-4.7l-2.3-5.9l1.5-4.9l-1.9-4.5l-0.5-5.9l-1.9-5.3l0.7-5.4l-0.4-23.9l-1.9-10.5l-3.5-16.9l-2.9-12.6l-0.5-1.7l21.9-2.6l29.8-3.3l7.9,0.4l2.2,4.2l3.1,5.7l1.2,2.9l4.3,5.6l2.6,3.9l3.9,3.8l1.7,2.9l3.2,2.9l1,3.4l-3.9,5.9l1.3,2.2l0.4,4.7l2.9,4.3l0.7,2.2l-0.7,5.7l2.1,4.9l1.9,2.2l-1.2,5.9l2.9,5l0.9,3.3l2.5,3.7l-0.9,2.8l2.6,2.9l1.9,4.1l4.2,2.2l0.9,3.3l3.1,4.7l-1.9,5l-2.1,2.1l0.2,3l-3.9,5.6l-0.7,2.9l-1.7,0.5l-0.3,3.5l-2.9,5.8l-4.3,0.9l-1.1,2.3l-3.9,2.9l-3.1,0.5l-2.4,5.4z"/>
  <path id="HI" d="M233.1,519.3l1.9-3.6l2.3-0.9l0.3-0.8l-0.3-2.3l-2.7-0.1l-1.8,1.4l-1.3,2.7l0.1,2.1l1.5,1.5zM243.1,515.6l3.5-2.2l0.6-0.1l1.1,1.5l-0.1,1.3l-1.9,1.5l-2.5,0.4l-1.1-1.3l0.4-1.1zM244.4,525.1l1.2-1.7l3-0.1l1.4-0.8l1.8,0l0.5,1.4l-2,2.4l-2.6,0.3l-1.7-0.1l-1.6-1.4zM262.4,527.6l2.6-1l1.4,0.4l2.1-0.9l1.4,1.2l-0.5,1.4l-2.8,0.6l-1.8,1.1l-2.2-0.3l-0.3-1.5l0.1-1zM274.9,530.6l0.8,2.1l1.5,0.7l0.2,0.8l-0.9,1.7l-2.9,1.1l-2.5-0.3l-0.5-1l0.2-1.7l1.7-2.2l2.4-1.2zM281.9,542.6l-0.5,2.5l-0.4,1.9l0.8,1.8l2.6,0.9l2.2-0.5l3.7-2.3l0.2-1.4l-1.4-2.3l-3.2-1.5l-1.6,0.3l-2.4,0.6z"/>
  <path id="ID" d="M173.4,188.9l-4.4-0.8l-1.7-2.6l0.2-2.2l-2.2-2.9l-1.9-1.3l-3.5-4l-0.2-2.9l2.3-3.4l0-3.9l0.9-0.5l-0.7-2.5l0.9-3.5l2-1.7l0-1.1l-3-3.2l-0.9-0.2l-2.9-4.4l0.1-3.5l-3.1-3.9l0.9-4.8l2.5-3.9l-0.1-1.2l-1.1-1.3l0.7-4.1l-0.4-4.4l2.7-3.5l0.2-5.9l0.9-5.7l-1.1-2.3l0.5-2.5l-0.9-4.5l-2.5-4.1l0.1-1l3.7-6l1.1-2.9l-0.9-2.9l1.3-1.7l-0.5-2.1l11.5,2.6l-3.3,15.2l2.2,4.8l-0.7,3.2l2.5,3.1l3,2.9l1.2,4.7l1.3,1.1l0.1,2.9l2.8,3.2l0.1,3.7l0.8,1l-0.6,2.7l5.5,7.7l3.7,2.2l0.6,1.8l4.9,3.5l0.4,1.9l2.6,1.8l1.3,2.7l0.2,0.9l-2.2,6.5l1.9,3.6l-0.7,3.5l0.6,2.8l-11.7,53.7l-15.5-3.5z"/>
  <path id="IL" d="M585.4,259.9l0.6-1.9l-0.2-3.5l-1.9-3.3l-0.9-4.2l1.1-4.1l2.7-3.6l0.9-4.9l-0.6-5.8l-2.1-3.4l-1.2-5.9l0.5-6.7l1.5-3.1l-1.4-1.8l-2.7-0.4l-1.2-2.9l-3.2-3.5l0.7-2.6l0.1-3.2l-1.7-3.3l-2.1-6.3l-2.7-3.3l-0.4-3.5l4-4.2l-0.1-3.6l-2.9-0.7l-0.9-3.3l-3.9-1l-0.1-1.9l-14.7,1.3l-6.8,0.1l-6.8,0.3l0,4.2l-2.2,2.9l-0.6,2.9l2.6,3.7l0.1,6.3l-1.7,4.2l0.1,5.5l-0.3,3.9l1.7,5l7.7,8.6l0.5,5l-1.9,7.3l-0.5,5.7l1.5,4.3l5.9,6.6l0.7,3.1l-1.5,3.9l-4.1,4.1l-1,3.3l0.5,2.7l3.7,2.5l4.7,5.5l4.5,0.2l3,2.7l4.3-0.4l1.8-3.9l4.5-2.3l2.4-3.6l2.9,0.6l3.1,3.7l2.7-0.2l1.2-1.2l5.7,1.1z"/>
  <path id="IN" d="M612,271.3l0.8-4.5l3-4.5l1.8-6.4l-0.4-5.7l-1.2-3.6l1.7-3.9l-0.3-10.6l-0.8-18.2l-0.6-17.9l-1.9-0.8l-3.7,0.5l-2.9-2.9l-6.5,0.6l-21.9,1.8l0.1,1.9l3.9,1l0.9,3.3l2.9,0.7l0.1,3.6l-4,4.2l0.4,3.5l2.7,3.3l2.1,6.3l1.7,3.3l-0.1,3.2l-0.7,2.6l3.2,3.5l1.2,2.9l2.7,0.4l1.4,1.8l-1.5,3.1l-0.5,6.7l1.2,5.9l2.1,3.4l0.6,5.8l-0.9,4.9l-2.7,3.6l-1.1,4.1l0.9,4.2l1.9,3.3l0.2,3.5l2.9,2.8l2.2-1.9l3.6-5.9l3.6,0.2l2.2-1.6l0.6-4z"/>
  <path id="IA" d="M543.1,199.1l0.9-4.5l-0.6-3.3l-2.6-2.8l-0.7-3.2l0.9-3.9l-2.1-4.9l-2.5-5.3l-0.1-3l-4.3-4.1l-0.5-3.4l2.1-4.1l1.7-5l-1.5-2.9l-0.3-2.1l-47.1,1.9l-42.7,0.6l-0.9,4.1l1.9,4.1l2.6,2.3l0.2,2.9l3.7,3.9l3.5,1.4l4.9,6.9l6.1,1.1l1.5,1.9l-2.3,4.7l-0.7,3.9l2,2.1l-0.1,4.4l-2.3,1.8l-0.9,2.1l0.9,2.9l2.3,1.5l4.1,1.1l1.3,1.9l5.5-2.7l4.6-1l1.7,1.6l2.7,0.3l1.7-2.3l3.2-0.9l1.5,0.7l2.9-2.2l2.9,1.7l1.5,2.8l2.7,1.6l2.5-0.8l4.6,0.8l4.1,0.1l2.5-1.7l0.8-2.7l2.2-1l3.7,0.6l3.2-1.2l1.5,0.7l3.2,0.1l3.1-4.7l2.7-1.2l-0.9-4.6l3.1-1.6z"/>
  <path id="KS" d="M498.3,276.6l-48.3,0.7l-50.7-0.3l-44.1-1.3l-17.9-0.5l1.5,29.8l2.8,44.9l23.7,0.9l48.3,1.1l45.9-0.3l40.2-1.6l-0.2-11l-1.3-34.9l0-27.4z"/>
  <path id="KY" d="M683.3,296.2l-4.9,4.1l-5.5,5.7l-2.5,4.1l-4.1,2.1l-0.5,4.4l-3.6,3.2l-0.9,2.1l-2.9-0.9l-3.5,2l-4.9,5.9l-4.5,0.1l-1.5-2.3l-4.1-0.1l-1.9,2.5l-5.2,0.2l-1.5,3.7l-2.3,0.7l-2.7-0.9l-3.1,2.3l-5.2-1.2l-4.9,3.2l-2.2,3.6l-5.7,2.2l-1.9,3.5l-4.3,2.7l-3.9-3.2l-5.9-0.5l0.3-2.3l-1.5-2.3l2.6-4.1l0.9-4.9l-2.1-2.7l3.1-2.4l3.5-1.7l0.4-4.9l5.3-0.8l1.9-2.4l2.7,0.5l2.5-4.5l4.9-3.5l4.1-1.4l0.5-2.9l2.9-0.3l1.5-2.5l-2.9-2.8l-0.2-3.5l-0.6,1.9l-5.7-1.1l-1.2,1.2l-2.7,0.2l-3.1-3.7l-2.9-0.6l-2.4,3.6l-4.5,2.3l-1.8,3.9l-4.3,0.4l-3-2.7l-4.5-0.2l-4.7-5.5l-3.7-2.5l-0.5-2.7l1-3.3l4.1-4.1l1.5-3.9l-0.7-3.1l11.9-1l13.7-1.2l8.8-0.9l5-0.6l6-0.7l14.9-1.3l15.9-1.7l13.1-1.9l11-0.7l0.9,4.2l4.4,0.9l1.9,2.1l3.4-0.1l3.9,2.3l0.6,2.9l3.2,0.5z"/>
  <path id="LA" d="M586.4,449.9l-2.2-7.7l-2.3-6.2l-0.2-3.9l-2.7-0.2l-6.6,0.4l-29.3,0.2l0.3,5.6l1.3,5.8l2.1,6.7l3.2,5.5l6.2,7.2l-1.3,4.5l3,1.9l-0.5,1.6l-2.5,0.9l0.9,2l-2.1,1.5l0.8,3.7l5.9,4.1l-0.1,4.9l-2.8,4.2l1.4,2.1l-0.9,3.7l5.7,0.6l6.7,1.7l5.9,0.3l2.9,2l3.8,0.5l3.7,1.8l0.9-2.9l-2.9-1.3l2.2-3.9l0.3-4.9l3.9-1.9l1.7,1.7l1.6-0.7l3.3,1.7l0-2l2.4-3l-1.2-1.5l2.3-2.2l3.9-0.3l4.7,1.5l4.5-2l0.9-4.1l3.7-0.9l1.9-2.6l-1.9-1.8l2.6-5.5l-2-2.8l0.9-2.2l-2.9-2.3l-4.9,2l-3.9-1.9l-1.1,1.1l-1.2-2l2.9-2.5l0.3-3.4l-1.4-2.2l-0.5-5.9z"/>
  <path id="ME" d="M891.9,96.3l1.9-2.5l1.8-3.4l-1.6-4.3l2.2-4.2l-1.9-4.7l-1.5-5.7l-1.5-1.2l-0.8-3.3l-2.2-1.9l0.7-0.9l0.4-3.9l-2.9-6.1l-2.4-5.3l-0.6-3l-3.3-0.4l-1,3.1l0.2,2.9l-1.8-0.9l-1.2,0.7l0.7,4.2l-0.7,4l-1.6,3l-1.3-1.4l-0.3-3.9l-1.2-0.2l-1,2.6l0.6,3.4l-3.2,4.7l-3.6,1.3l-4.9,9.6l-4.1,3.6l-0.9,1.4l0.3,5.3l-5.4,4.9l-0.5,2.6l0.9,0.8l-0.7,1.9l-7.9,4.3l-1.7,0.4l-3.7,2.3l-0.5,1.9l-1.7-0.7l-3.3,3l0.9,3.9l-0.9,2.6l-0.5,3l-2.5,2.9l1,5.7l3.4,2.8l0.7-1l2.9,2.1l9.5,30.8l2.2,0.2l1.3-1.4l1.9-1.9l0.8,1.2l2.4,0l2.8-3l0.9-2.7l-0.5-4.6l2.7-3.9l-0.9-3l-2.2-0.9l-0.3-1.8l-0.5-2.1l1.5-2.9l0.9-3l1.3,0.1l0.9-3.6l-1.1-2.2l1.1-1.3l0.3-0.4l2.2-4.4l0.9,0.6l1.7-0.4l1.4-3.8l3.3-4l0.4-2.3l-1.4-2.9l2.3-3.7l0.9-4.5l-0.5-1.9l0.9-0.5l-0.2-1.9l2.7,0.1l1.4-4.3l1.6-3l-0.3-1.5l0.8-0.9l2.4,1.9l0.6,2.4l2.8-0.9l1.2-1.6l1.1-6.9l3.8-3l0.9-3.9l0.9,0.9l1.9-1.6z"/>
  <path id="MD" d="M789.8,236l-1.9-1.9l-1.3,0.7l-0.5-1.7l-2-0.6l-0.8-1.9l-2.1,0.7l-1.1-0.5l-0.3-2.9l-2.3-1.7l-1.7-2.7l-2.1-1l-2.7-1.3l-1.7-0.9l0.9-2.7l-2.5-0.4l-3.4,0.7l-2.7-0.7l-2.4,0.7l-2.6-0.7l-3.7,1l-5.9,0.2l-4.7,0.2l-17.9,2.9l-16.7,2.4l-2.9,0.3l1.3,7.7l18.3-3l3.9,0.3l-0.5,2.9l2.2,1.5l2.5,2l1.9-3.5l2.9,1.9l-0.7,3.7l4.5,0.7l2.5-1.9l2,3.7l-0.5,1.9l3.5,2.1l2.5,0.9l-0.1,5l2.1,2.2l0.2,2l-1.3,2.1l0.5,2.9l0.8,2.2l1.7-0.1l0.2-2.2l-1.9-1l-0.3-3.8l1.5-1.9l0.8-3.8l-2.1-3.3l0.2-1.3l1.7,0.1l2.2,2.5l1.1-0.5l1.5,1.7l-2.1,0.3l-0.2,4.2l1.1,0.7l2.2-3.1l0.8,5.7l4.5,0.6l-2.2,3.5l0.7,2.5l3.2,0.6l1.7,2.1l2.9,1.1l3-0.9l0.9-4.7l1.8-4.9l1.5-5.2l-0.9-2.1l0.6-1.9l-0.4-3.4l11.7-2.5z"/>
  <path id="MA" d="M879.5,160.5l0.7-2.2l-1.1-2.6l2.9-0.6l1.1-2.2l-4.5,0.8l-7.2,0.3l-0.3,1.7l2.5,0.4l0.1,1.6l-2.6,0.8l-1.2,0l0.9,2.5l2.5-0.5l3.2-0.6l1.7,1.6zM864.1,155.4l2.8-2.4l0.5,1.2l2.3-1.5l-1.1-1.7l-2.3,0.4l-1.6,1.9l-2.2,0.9l0.3,1.5zM852.5,152.4l-2.6-0.3l-0.7-1.1l-2.5,0.3l-4.9-0.4l-2.2,2.4l2.7,1.9l2.2-1.7l1.9,0.4l0.2,3.9l1.2,1.9l2.4-1.6l-0.7-3.5l2.5-0.5l0.8,1.7l2.9-0.3l-0.2-1.9l-3-1.2zM847.7,160.7l4.9-0.6l0.5,0.9l3.7,0.9l5.6-3.4l2.5-4l-2.1-5.8l-5.2-0.8l-2.3,0.2l0.2,1.8l-1.5,0.1l-2.3,4.1l1.6,1.7l-2.6,1l0,1.7l-3.1-0.4l-0.5,2.4z"/>
  <path id="MI" d="M612.8,162.9l2.1-3.8l2.8-3.9l2.6-3.9l0.1-4.9l1.7-2.9l-0.6-9.7l-1.5-3.9l-1.8-1.5l-3.9-0.1l-0.5-4.4l3.9-2l-0.1-3.2l1.7-3.2l-0.9-1.9l-3.9-0.3l-4.6-1.9l-3.5-4.5l-3-2.3l-0.2-2.9l1-1.7l-0.8-1.9l-3.2,0.1l-1.9,1.7l-1.9-1.1l-4.1-0.4l-1.8-3.2l-1.3-3.5l-3.4-5.7l-3.2,0.9l-3.8,1.3l-0.4,7.5l-0.9,3.9l0.8,4l1.5,2.7l-0.2,4.7l-1.9,4.6l1.3,1.5l2.2,0.9l-0.6,2.7l-2.3,4.1l-0.9,4.9l1.2,2l0.9,4.7l-1.9,3.2l-2.9,3.2l-2.9,0.5l-1.3,3.9l0.5,1.9l-2.9,1.5l-2.1-0.2l-1.7,1.1l-0.5,2.3l-3.5,0.5l0.3,2l0.7,2.9l2.9,1.4l1.4,1.5l-0.3,1.9l0.9,1.1l-0.9,4.5l-1.9,4.7l1.1,5.9l2.3,4.8l0.1,1.9l2.9-0.4l2.5-0.9l3.9-2.5l2.5,2l5,1.1l4.9-1.8l1.3-2.5l0.9-4.3l2.5-1.3l-0.5-1.5l2.1-1.2l2.5,0.9l1.5-0.2l0.9-0.6l-0.1-2l2.3-0.4l5.3-1.1l1.9-1.7l0.5-5.9l1.5-3.8l-0.9-4.9zM545.6,113.9l1.5-1.9l0.6-2.7l3.8-5.9l0.9-2.9l-1.1-2.5l-3,0.9l-1.7,3.1l-1.7,0.7l-2.9,4.2l-0.6,3.4l-0.7,2.9l0.6,2.2l-0.6,3.2l2.7-2l2.2-2.7z"/>
  <path id="MN" d="M525.5,89.9l-0.8-5.9l-2.2-4.1l-0.4-6.7l-1.8-3.5l-0.3-5.7l0.1-4l-0.8-3.7l-0.9-6.9l-1.5-2.9l-1.9-7.7l0.3-3l1.1-0.5l6.9-0.3l0.2-7.9l0.3-0.9l43.2-0.4l0.1,4.7l2.1,3.7l3.5,1.7l2.1,0.1l2.7,4.8l4.5,4.9l0.4,5.9l1.4,2.3l0.9,6.9l1.4,1.2l3.5,0.4l0.6,0.9l5.3-0.3l1.1-2.3l0.3-3l3.3-1.2l1.5-2.8l0.1-3.6l0.7-2.9l4.2-0.9l3.2,0.7l4.9,3.1l0.2,12.9l-1.9,3.2l-2.7,1.8l-0.3,10.7l1.1,1.4l-0.3,11.2l-0.7,1.5l0.4,3.9l-3.4,4.6l-2,1.9l-0.3,3.9l0.9,4.4l-2.5,2.5l-1.1,1.5l-0.4,2.1l-4.9,0.2l-1.9,2.9l-2.2,1l-7.9,0.6l-11.3,0.3l-10.2,0.2l-23.1,0.3l-0.8-4.7l-2.5-3.7l-0.6-4.1l-0.8-2l-5.2-4.5l-1.1-3.2l-0.3-4.7z"/>
  <path id="MS" d="M614.5,431.9l-5.6,0.5l-21.9,1.7l-15.1,0.8l-0.1,9.6l-2,5l2.5,5.9l0.5,5.9l1.4,2.2l-0.3,3.4l-2.9,2.5l1.2,2l1.1-1.1l3.9,1.9l4.9-2l2.9,2.3l-0.9,2.2l2,2.8l-2.6,5.5l1.9,1.8l-1.9,2.6l-3.7,0.9l-0.9,4.1l-4.5,2l-4.7-1.5l-3.9,0.3l-2.3,2.2l1.2,1.5l-2.4,3l0,2l30.5-0.2l4.9-0.4l-0.3-3.5l3.3-5.3l1.4-5.9l3.4-5.1l0.3-3.1l-2.1-2.2l1.2-5.6l1.4-9.1l-0.4-11l1.1-7l0.9-8.9l1.8-6.7l1.9-5.4l-3,0z"/>
  <path id="MO" d="M583.7,340.7l1.1,5.3l-2,0.2l-2.9,5.9l0.6,5.9l-2.7,1.9l2.7,2.9l0.2,7.9l-3.7,2.2l-3.6,6.2l0.2,3.9l-3.6,3.6l-1.8,5.7l-5.4,0.5l-12.8,0.8l-24.5,0.8l-23.5,0.4l-0.4-29.3l-2.6-1l-1.9,1.7l-0.9-3.7l-3.3-0.9l0.6-2.7l-2.9-4l-0.5-3.5l1.2-5.1l-0.3-3l-2.1-5.3l0.2-4.1l-1.9-7.1l0-8.4l-0.7-5.4l0.2-27.4l43.7,0.8l36.1-0.4l9.9-0.4l0.9,4.5l-2,1.2l2.7,4.3l-2.1,5.3l1.6,4.1l-1.9,2.5l1.9,4l-0.5,3.7l2.9,3.2l5.4-0.5l0.1,5.3l2.7,2.2l0,2.1l-3.1,2.6l-0.4,1.3l4,5.4l4.9,1.7l3.2,3.2z"/>
  <path id="MT" d="M312.9,58.5l-0.4-5.1l1.5-7.5l0.3-4.5l1.7-7.2l1.9-4.7l0.2-3.9l-1.5-3.9l-57.7,5.2l-58.2,3.1l-48.9,1.1l5.7,37.2l5.2,34.2l3.9,22.7l3,18.5l-0.5,2.1l1.3,1.7l-1.3,1.7l0.9,2.9l-1.1,2.9l-3.7,6l-0.1,1l2.5,4.1l0.9,4.5l-0.5,2.5l1.1,2.3l-0.9,5.7l-0.2,5.9l-2.7,3.5l0.4,4.4l-0.7,4.1l15.5,3.5l11.7-53.7l41.2,8.5l41.4,7l37.5,5.5l1.3-7.6l-2.9-5l-0.2-4.6l1.3-0.3l0.9-3.7l2-0.3l1.9-2.9l0-1.1l-3.7-4.1l-0.3-1.9l3.1-5.5l0.2-3.8l-2.9-2.5l-1.7-2.2l-0.8-3.9l-1.2-1.9l-0.3-2.7l-4.7-7.5l1.9-6.7l-1.7-3l-1.9-1.9l0.2-5.9l1-0.9l-0.1-4.5z"/>
  <path id="NE" d="M451.3,183.6l-50.3,2.5l-51.6,1.1l-0.9-8.7l-17.7,0.8l-2.9,0l2.9,19.9l2.5,18.6l2.4,21.2l2.7,25.3l17.9,0.5l44.1,1.3l50.7,0.3l48.3-0.7l-0.7-17.5l-2.9-2.2l-3.3-0.4l0-2.5l-3.5-4.6l-4.3-2.1l-3.7-0.4l-4.5-2.7l-5.7-1.1l-2.3-2.3l-3.2-0.3l-2.4-1.9l-8.4,0.5l-3.9-4.7l-4.9-1.4l-0.4-3.5l-2.7-3.9l-0.4-7.9l-1.1-2.5z"/>
  <path id="NV" d="M167.9,314.4l20.9-96.6l-29.1-6.4l-28.3-6.6l-17.1-4.3l-7.6,35.7l-8.5,41.6l-9.9,48.2l30.9,4.7l21.6,3l0.6-6.5l1.7-1.8l-1.2-2.4l0.8-2.9l4.9-3.4l1.7-3l1-0.3l1.2,1.5l2.2-1l3.5-4.6l3.5-1.9l3.2,2.3z"/>
  <path id="NH" d="M857.3,139.5l-3.4-13l-3.1-14.2l-1.2-2.8l0.6-2l-1.7-3.7l-3.1-1.7l-0.3-5l1.1-3.5l-0.6-2.3l0.2-6.6l-0.9-2.5l0.5-3l-2.5-0.5l-1.2,2.8l-0.7,4.7l-2.9,2l-1.1,2l0.6,5.3l-3.1,1.5l-0.9,1.3l-0.4,5.9l-1,1.8l0.3,0.9l0.7,4.3l-2.5,3.8l-0.8,3.4l0.9,3.5l-1.1,3.2l1.7,4.5l0.1,3.6l-2.9,2l0.5,1.1l3.5,0.5l5.1,19.5l6.1-1.4l0.6,3.5l4.6,17.9l2.6-0.7l0.9-1.7l-0.3-3.9l1.3-2.7l-0.8-3.7l1.6-3.2l-0.6-3.7l1.5-3.7l0.4-3.4l0.1-5.7z"/>
  <path id="NJ" d="M822.2,211.9l-0.2-4.7l-2.5-1.5l-1.3-0.1l-2.9-4.5l-1.4,0.7l-1.7,2.4l1.3,2l0.3,3.9l-2.7,2.2l0.5,2.3l2.6,0.6l-0.1,2.7l1.5,0.3l1,1.6l-0.6,1.9l-0.4,3.4l1.9,3.3l4.9,2.6l0.4,4.7l1.8,3.3l4.9,4.9l3.6,1.7l3.5-0.5l1.9-2.1l-0.5-2.9l-2.1-0.7l-3.7-0.2l-2.1-2.3l0.4-2.1l2.1-1.1l0.5-2.7l-0.9-2.3l-0.3-3.5l-2.3-2.5l-1.7-5.5l0.8-2.5l-2.3-1.9z"/>
  <path id="NM" d="M299,406.9l3.3-30.5l7.5-73.2l-40.1-4.3l-37.5-5.3l-13.3,97.7l3.2,0.3l0.3,4.2l7.3,0.9l0.2,6.4l30.4,3.1l38.7,3.5z"/>
  <path id="NY" d="M826.9,190.9l-1.9-1.4l-3,0.9l-4.1,1.7l-6.3,2.1l-2.4,1.3l-2.5,0.1l-4.9,1.5l-5.6,1.6l-0.6-3.6l1.4-0.9l2.5-2.7l2.2-3.9l-2.7-0.8l-4.6,0.9l-4.4,0.1l-3.5-2.1l-6.1,0.2l-7.3,0.9l-7.6,0.5l-7.3-22.8l-3.1-11.3l-2.2-5.6l-5.7,1.1l-27.9,5.8l-5.2,0.9l0.7,4l3.4,2.2l-0.9,3.3l-2.6,6.9l-3.1,5.7l-2.1,3.7l1.5,1.9l-0.2,3.9l-3.2,3.4l-2.9,0.6l-3.7,3.9l-2.2,0.6l-2.2,1.7l-2.4,0.5l-0.8,1.8l3.6,3.6l3.9,0.8l3.7-1.5l2.7-2.6l1-2.4l3.2-2l2-0.3l3.4,1.6l3.9,0.5l1.9-1.1l2.4,1.1l-2,3.9l-0.4,3.5l1.6,1.2l-0.7,4.9l-1.1,5l0.7,2.6l-0.9,2.7l-5,6l2.3,1.9l-0.8,2.5l1.7,5.5l2.3,2.5l0.3,3.5l0.9,2.3l-0.5,2.7l-2.1,1.1l-0.4,2.1l2.1,2.3l3.7,0.2l2.1,0.7l0.5,2.9l3.9-3.7l1.5-2.5l1.2-3.3l2.2-2.8l2.3-1.6l4.9-1.3l4.3,0.1l3.1-2.7l5.1-7.9l3.6-4.2l3.3-2.7l2.5-1.7l4.7-4.1l3.9-5.5l1.7-3.7l0.4-4.5l-0.7-1.4l2.3-2.5l1.6-0.9l0.2,4.7l1.9,1.4l2.6-0.5l3.7-2.3l1-4.9l4.8-7.9l1.5-1l0.7-3.3l-1.9-3.7l1.1-1.2z"/>
  <path id="NC" d="M824.4,298l-3.8,3.1l-4.6,4.7l-1.7,3.2l0.1,2.4l-3.6,4.4l-5.3,0.5l-3.1,1.5l-4.5,5.9l-5.7,3.6l-2.2,0.7l-2.1,3.1l-3.9,3.4l-0.7,1.6l-4.9-0.1l-2.9,3.5l-3.2,1.2l-2.7,2.3l-3.9-0.4l-5.7,3.6l-4.3,1.2l-3.5,3.6l-3.7,0.7l-0.5-1.9l-5.6,4l-4,0.5l-1.9,1.5l-2.1-0.8l-3.4,2.4l-8.5,0.8l-9.1,1.4l-25.5,2.8l-19.3,1.5l-17.9,0.8l-3.7-0.3l2.4-5.4l3.1-0.5l3.9-2.9l1.1-2.3l4.3-0.9l2.9-5.8l0.3-3.5l1.7-0.5l0.7-2.9l3.9-5.6l-0.2-3l2.1-2.1l1.9-5l9.5-0.9l17.3-1.9l24.7-3.3l19.3-2.9l23.2-4.9l23.9-5.3l12.8-1.3l6.9-3.7l5.3-2.1l2.1,0l1.2-1.7l4.9,0.2l-0.4,4.5l0.2,1.5z"/>
  <path id="ND" d="M454.2,75.5l-0.5-5.1l-2.2-6.9l0.5-4.3l-0.9-7.1l-0.5-9.9l-1.9-7.8l-0.3-5.2l-0.5-3.6l-46.2,0.9l-46.6,0l-42.3-0.9l0.4,5.1l1.2,1.9l0.3,2.7l1.2,1.9l0.8,3.9l1.7,2.2l2.9,2.5l-0.2,3.8l-3.1,5.5l0.3,1.9l3.7,4.1l0,1.1l-1.9,2.9l-2,0.3l-0.9,3.7l-1.3,0.3l0.2,4.6l2.9,5l-1.3,7.6l50.5-0.7l50.5-1.9l34.6-2.4z"/>
  <path id="OH" d="M684.9,209.7l-4.3,3.5l-4.7,2.2l-2.5,2.9l-4.1,2.3l-1.1,3.6l-4.4,3l-2.6,0.5l-1.9,2.8l-2,0.7l-1.7,2.2l-1.5,4.2l-3.2,3.2l1,5.7l4.2,4.9l2,4.3l4.7,5.5l0.2,3.9l-3.4,6.3l1.9,3.5l5.7,1.9l3.9,0.2l2.9-2l2.1,1.8l3.1-0.6l5.7-3.9l4.6-1.9l2.5,1l3.2,0.5l-0.6-2.9l-3.9-2.3l-3.4,0.1l-1.9-2.1l-4.4-0.9l-0.9-4.2l-11,0.7l-13.1,1.9l1.8-6.4l-0.4-5.7l-1.2-3.6l1.7-3.9l-0.3-10.6l-0.8-18.2l-0.6-17.9l5-4.1l17.6-1.7l18.9-2l6.6-0.9l3.9,3.5l2.9,3.4l1.5,3.5l3.7,2.9l0.3,2.9l-2.9,1.1l-2.3,1.9l-1.3,3.4l-2.9,3.9l0.5,2.3l-3.3,2.9l-2.6-1.5l-2.5,2.5l-2.9,0.7l-0.6,4z"/>
  <path id="OK" d="M423.9,360.9l-0.1-16.7l-29.2-0.3l-29.7-1.1l-3.1,0.5l-1.5,3.1l-5.2-3.9l-1.9,0.7l1.7,5.7l0.2,7.7l-2.7,3.2l-0.2,3.1l2.4,3.7l-0.7,3l-1.9,1.6l2.3,4.2l-0.1,3.7l3.6,0.3l0.3,10l-2.3,6.7l1.4,5.2l2,1.3l1.3-2.1l2.9,1.5l1.9,1.8l2.6-3.6l3.9,1.5l2.7-3.3l2.1,1.9l2.2-0.9l1.9,2.6l4.3,0.5l3.3,1.6l3.3-0.7l3.3,1.7l2.7-2.4l3.2,1l2.7-1.1l2.3,0.5l2.3-2.7l2.9,0.7l4.2,1.6l2-0.7l0.7-3l3.7-0.9l1.5-3.7l3.5-1.3l1.9-0.5l0.8-3.2l4.1-1.5l3.7-0.1l2.4-1.3l0.3-3.9l4.4-1.2l0.4-0.9l-0.6-2.6l-2-1.7l0.8-4.4l-2.2-2.9l1.2-4.2l-2.4-2.5l3.1-6.8l-2.5-1.8z"/>
  <path id="OR" d="M149.1,195.9l-2.7-1.8l-2.6-1.8l-0.4-1.9l-4.9-3.5l-0.6-1.8l-3.7-2.2l-5.5-7.7l0.6-2.7l-0.8-1l-0.1-3.7l-2.8-3.2l-0.1-2.9l-1.3-1.1l-1.2-4.7l-3-2.9l-2.5-3.1l0.7-3.2l-2.2-4.8l3.3-15.2l-11.5-2.6l-9.2-2.5l-22.9-6.1l-22-5.9l-17.6-5.1l-0.5,2.6l0.4,3.5l-2.7,3.9l-0.3,3.1l-1.8,0.4l-1.1,4.5l0.3,5.7l1.2,3.7l0.3,4.6l-0.6,4l2.4,4.9l1.9,1.7l1.5,3l0.6,4.9l-1,5.2l0.7,4.2l0.3,7.2l-0.9,2.1l1.4,3.9l3.9,1.2l2.3,2.6l6,2.5l1.6,1.3l3.6,1l1.9,1.3l5.9,1.5l4.1-0.5l5.7,1.3l2.9-0.1l0.9-1.9l2.6,0.5l3.6,2.6l4.2,1.5l4.4-0.7l1.1,1l2.2-2.7l4.2-0.6l0.9-0.7l-1-3.9l0.7-3.2l1.7-0.3l0.5-3.9l2.5-0.9l3.4-6.6l5.9-6.7l1.8-0.8l0.3-3.5l3.8-4.2l1.1,0.7l3.2,0.1l1.7,1.5l6.7,1.2l17.1,4.3z"/>
  <path id="PA" d="M789.3,195.5l0.2,4.7l-3.9,3.7l-3.3,1.2l-2.2,2.7l-2.1,1.6l2.2,4.6l2.6,1.7l2.7,3.4l3.5,4l1.2,3.2l0.2,4.7l-1.8,0.2l-3-0.7l-3.4,1.4l-7.7,3.1l-4.7,0.2l-5.9,1.8l-4.1,2.2l-2.1,0.7l-1.3-7.7l2.9-0.3l16.7-2.4l17.9-2.9l4.7-0.2l5.9-0.2l3.7-1l2.6,0.7l2.4-0.7l2.7,0.7l3.4-0.7l2.5,0.4l-0.9,2.7l-13.9,3l-35.9,7.3l-11.9,2.4l2.7-3.3l0.4-3.5l0.7-4.9l-1.6-1.2l0.4-3.5l2-3.9l-2.4-1.1l-1.9,1.1l-3.9-0.5l-3.4-1.6l-2,0.3l-3.2,2l-1,2.4l-2.7,2.6l-3.7,1.5l-3.9-0.8l-3.6-3.6l0.8-1.8l2.4-0.5l2.2-1.7l2.2-0.6l3.7-3.9l2.9-0.6l3.2-3.4l0.2-3.9l-1.5-1.9l2.1-3.7l3.1-5.7l2.6-6.9l0.9-3.3l-3.4-2.2l-0.7-4l5.2-0.9l27.9-5.8l5.7-1.1l20.2-4.7l2.9,15.6z"/>
  <path id="RI" d="M867,175.7l-1.9-8.3l-0.9-5l5.3-1.4l1.6,2.9l2.7,3.3l2.9,4.1l-1.2,0.9l-2.5-0.4l-1.5,3.2l-2.5,0.9l-1.3-0.5z"/>
  <path id="SC" d="M699.6,413.9l2.4-5.4l3.1-0.5l3.9-2.9l1.1-2.3l4.3-0.9l2.9-5.8l0.3-3.5l1.7-0.5l0.7-2.9l3.9-5.6l-0.2-3l2.1-2.1l1.9-5l-3.1-4.7l-0.9-3.3l-4.2-2.2l-1.9-4.1l-2.6-2.9l0.9-2.8l-2.5-3.7l-0.9-3.3l-2.9-5l1.2-5.9l-1.9-2.2l-2.1-4.9l0.7-5.7l-0.7-2.2l-2.9-4.3l-0.4-4.7l-1.3-2.2l3.9-5.9l25.5-2.8l9.1-1.4l8.5-0.8l2.1,3.3l3.4,5.9l6.6,8l3.9,7.5l5,10.9l-1.5,4.3l-3.7,2.5l0.9,3.9l-4.6,2.5l-3.8,4.6l-2.8,4.2l-4.7,3.9l-2.3,4.1l-1.3,0.6l-1.5,3.5l-6.7,4.9l-4.9,1.8l-3.7,5.2l-4.3,1.5l-2.5,1.9l-5.9,0.1l-2.6,1.5l-3,4.3l-3.9,1.9l-1.5,2l0.5,3.2l-4.3,2.5l-3.2,0.1l-1.9,2l-2.2,0.1z"/>
  <path id="SD" d="M454.2,75.5l-34.6,2.4l-50.5,1.9l-50.5,0.7l-37.5-5.5l1.1-2.5l-0.2-4.9l4.3-5.9l3.3-0.3l2.1-3.5l-0.3-5.5l2.2-7.9l1.6-10.3l-1.5-3.9l1.5-4.9l-2.2-2.1l0.8-5.9l42.3,0.9l46.6,0l46.2-0.9l0.5,3.6l0.3,5.2l1.9,7.8l0.5,9.9l0.9,7.1l-0.5,4.3l2.2,6.9l0.5,5.1l2.1,5.8l2.8,3.7l0,3.5l3.9,6l0.2,3.1l-4.5,0.7l-4.2-0.3l-1.4,1.9l-9.9,0.5l-1.4-2.1l-4.6,0.2l-4.1-0.3l-6.8-0.9l0.1-4.9l-2.1-4.8l-3.9-1.8l-2.9-0.4z"/>
  <path id="TN" d="M682,305.9l-5.7,0.4l-5.3,0.4l-7.1,0.8l-26.5,2.3l-4.9,0.2l-9.9,0.7l-20.3,1.4l-3.2,3.2l-4.9,1.7l-0.1,5.3l-2.7,2.2l-0.1,2.1l7.1-0.4l42.8-3.2l6.5-0.6l0.4-2.5l3.2-1.7l1.9,0.7l1.7-3.4l5.4-0.2l1.9-2.5l4.1,0.1l1.5,2.3l4.5-0.1l4.9-5.9l3.5-2l2.9,0.9l0.9-2.1l3.6-3.2l0.5-4.4l4.1-2.1l2.5-4.1l5.5-5.7l4.9-4.1l-3.2-0.5l-0.6-2.9l-3.9-2.3l-3.4,0.1l-1.9-2.1l-4.4-0.9l-0.9-4.2l-13.1,1.9l-15.9,1.7l-14.9,1.3l-6,0.7l0.3,2.9l-5.3,0.8l-0.4,4.9l-3.5,1.7l-3.1,2.4l2.1,2.7l-0.9,4.9l-2.6,4.1l1.5,2.3l-0.3,2.3l5.9,0.5l3.9,3.2l4.3-2.7l1.9-3.5l5.7-2.2l2.2-3.6l4.9-3.2l5.2,1.2l3.1-2.3l2.7,0.9l2.3-0.7l1.5-3.7l5.2-0.2z"/>
  <path id="TX" d="M423.9,360.9l2.5,1.8l-3.1,6.8l2.4,2.5l-1.2,4.2l2.2,2.9l-0.8,4.4l2,1.7l0.6,2.6l-0.4,0.9l-4.4,1.2l-0.3,3.9l-2.4,1.3l-3.7,0.1l-4.1,1.5l-0.8,3.2l-1.9,0.5l-3.5,1.3l-1.5,3.7l-3.7,0.9l-0.7,3l-2,0.7l-4.2-1.6l-2.9-0.7l-2.3,2.7l-2.3-0.5l-2.7,1.1l-3.2-1l-2.7,2.4l-3.3-1.7l-3.3,0.7l-3.3-1.6l-4.3-0.5l-1.9-2.6l-2.2,0.9l-2.1-1.9l-2.7,3.3l-3.9-1.5l-2.6,3.6l-1.9-1.8l-2.9-1.5l-1.3,2.1l-2-1.3l-1.4-5.2l2.3-6.7l-0.3-10l-3.6-0.3l0.1-3.7l-2.3-4.2l1.9-1.6l0.7-3l-2.4-3.7l0.2-3.1l2.7-3.2l-0.2-7.7l-1.7-5.7l1.9-0.7l5.2,3.9l1.5-3.1l3.1-0.5l-1.9-54.4l-0.9-27.4l35.6,1.8l35.5,1.1l0.1,16.7l1.6,29l0,21.3l0.9,5.9l1.4,3.5l-1.1,2.5l1.5,2l-0.5,4.9l1.1,5.5l2.7,3.2l0.9,2.9l3.6,4.2l1.5,3.2l2.3,1.3l0.8,2.2l-0.1,4.2l-0.6,4.4l3.6,3.5l1.3,4l2.9,1.9l-0.7,2.9l1.7,4.9l1.5,1.9l-0.7,1.8l1.2,2.7l0.3,4.2l1.1,1.5l-0.7,5.2l2.2,3.6l0.6,3.2l4.7,5.2l1.9,0.7l2.2,3l2.6,0.3l3.2,1.6l3.9,1.8l1.9,2.6l3.1,1.3l2.6,2.1l3.1,0.4l2.1-2.1l1.3-3.5l3.4-4.4l0.1-2.7l1.2-3.5l-0.7-2.4l-2.6-0.9l1.5-6.5l2.3-4.1l0.1-2.8l1.1-4l-0.9-1.7l2-6.1l-1-1.7l0.9-2.7l-1.7-5.9l2.4-0.6l0.7-2.5l0.9-2.4l-0.5-1.9l0.7-4.6l2.4-3.1l-0.9-1.7l0.9-3.2l1.9-2.5l2.2-2.3l1.4-4.2l3.5-5l1.7-7.7l3.9-6.9l0.5-3.9l1.5-0.9l0.7-2.7l1.5-0.7l0.7-3.2l1.9-2.7l-0.9-1.4l2.9-5.2l2.9-1.7l-0.5-1.9l-1.1-1.4l0.2-2.4l2.3-0.7l0.2-3.5l1.2-2.2l0.1-2.2l-2.4-3.4l-1.2-3.9l-2.2-1.7l0.5-5.5l-3-2.9l-0.7-4l-40.2,1.6l-45.9,0.3z"/>
  <path id="UT" d="M243.9,288.5l-42-6.5l-13.8-2.6l13.3-72.3l-20.9,96.6l-3.2-2.3l-3.5,1.9l-3.5,4.6l-2.2,1l-1.2-1.5l-1,0.3l-1.7,3l-4.9,3.4l-0.8,2.9l1.2,2.4l-1.7,1.8l14.9,100.6l54.6-8z"/>
  <path id="VT" d="M828.3,125.9l2.2,5.6l3.1,11.3l0.2,4.7l-1.7,3.6l2.1,4.1l-0.2,2.9l-0.9,2l-23.9,5.6l-0.5-1.1l2.9-2l-0.1-3.6l-1.7-4.5l1.1-3.2l-0.9-3.5l0.8-3.4l2.5-3.8l-0.7-4.3l-0.3-0.9l1-1.8l0.4-5.9l0.9-1.3l3.1-1.5l-0.6-5.3l1.1-2l2.9-2l0.7-4.7l1.2-2.8l2.5,0.5l5.1,19.2z"/>
  <path id="VA" d="M795.7,288.7l-2.5,4.2l-1.1,1.7l1.7,1.6l-0.9,3.5l-4.9,0.1l0.7,1.6l-3.5-0.7l-0.5,1.9l3.7-0.7l3.5-3.6l4.3-1.2l5.7-3.6l3.9,0.4l2.7-2.3l3.2-1.2l2.9-3.5l4.9,0.1l0.7-1.6l3.9-3.4l2.1-3.1l2.2-0.7l5.7-3.6l4.5-5.9l3.1-1.5l5.3-0.5l-1.7-1.8l0.2-2l-1.5-2.6l-1.2-1.6l-1.9,1.6l-0.9-1.2l0.4-2l-2.6-0.3l-1.5-2.6l0.7-0.7l-0.9-3.3l-2.7-2.2l-0.9,1.7l-0.5-1.2l0.8-2.3l-1.7-1.3l0.7-5l-0.5-3.7l0.5-0.3l1.1,0.9l1.5-1.1l-0.3-1.1l-2.9-1.1l-1.7-2.1l-3.2-0.6l-0.7-2.5l2.2-3.5l-4.5-0.6l-0.8-5.7l-2.2,3.1l-1.1-0.7l0.2-4.2l2.1-0.3l-1.5-1.7l-1.1,0.5l-2.2-2.5l-1.7-0.1l-0.2,1.3l2.1,3.3l-0.8,3.8l-1.5,1.9l0.3,3.8l1.9,1l-0.2,2.2l-1.7,0.1l-0.8-2.2l-0.5-2.9l1.3-2.1l-0.2-2l-2.1-2.2l0.1-5l-2.5-0.9l-3.5-2.1l0.5-1.9l-2-3.7l-2.9-1.9l0.7-3.7l-2.5,1.9l-4.5-0.7l-0.7-4.8l-1.9,0.7l-3.3-0.3l-1.9-1.2l-2.5,3.9l-2.7,1.6l1.3,6.9l-3.4,0.1l-3.3,1.5l-5.9,0.9l-6.5,0.8l-0.4,2.5l2.3,2.5l-2.9,5.9l0.9,4.9l2.9,3.6l3.5,2.3l3.4,5.5l-0.1,3.9l4.5,4.7l-0.9,3.5l0.7,2.5l-0.5,3l-2.7,5.6l2.4,3.6l2.7-3.9l1.7,2l-2.3,4.7l0.9,1.2l-1.5,4.5z"/>
  <path id="WA" d="M172.1,23l-7.7-2.2l-6.7-1l-5.7-2.3l-5.9-0.8l-1.7-2l-5.3-0.4l-3.3,0.5l-5.4-1.5l-3.9,0.1l-6.1-1.5l1.1,0l-3.7-0.6l1.9,3.2l1.1,3.2l0.5,3.7l2.1,4l2.5,4.2l1.1,4.7l0,4.9l-0.5,2.2l1.9,3.9l0.5,3.7l1.4,1.6l0.5,2.9l-0.3,3.7l0.5,3.6l-0.3,3.7l1.6,2.7l-1.7,0.7l0.7,3l-2.2,0.5l0.5,2.6l17.6,5.1l22,5.9l22.9,6.1l9.2,2.5l-3.3-15.2l-0.9-4.8l-1.8-5.5l0.4-20.9l-2.7-2.9l-1.2-2.9l0.5-4.7l-2.5-0.3l-1.8-3.4l-0.6-5.5l-3.3-5.3l-0.9-3.5l-6.2-0.8z"/>
  <path id="WV" d="M732.9,237.4l3.3,1.5l1.9,1.2l3.3,0.3l1.9-0.7l0.7,4.8l4.5,0.7l2.5-1.9l-0.7,3.7l2.9,1.9l2,3.7l-0.5,1.9l3.5,2.1l2.5,0.9l-0.1,5l2.1,2.2l0.2,2l-1.3,2.1l0.5,2.9l0.8,2.2l1.7,0.1l0.2-2.2l-1.9-1l-0.3-3.8l1.5-1.9l0.8-3.8l-2.1-3.3l0.2-1.3l1.7,0.1l2.2,2.5l1.1-0.5l1.5,1.7l-2.1,0.3l-0.2,4.2l1.1,0.7l2.2-3.1l0.8,5.7l4.5,0.6l-0.7-2.5l0.7-2.5l2.2-3.5l-4.5-0.6l-0.7-2.6l1.1-5l0.7-4.9l1.6-1.2l-0.4-3.5l-2-3.9l-0.2-1.5l0.4-4.5l-4.9-0.2l-1.2,1.7l-2.1,0l-5.3,2.1l-6.9,3.7l-12.8,1.3l0.2,1.5l-2.7-0.5l-2.5,4.5l-2.7-0.5l-1.9,2.4l-5.3,0.8l-2.9,0.3l-0.5,2.9l-4.1,1.4l-4.9,3.5l4.3-0.1l1.9-2.5l5.2-0.2l1.5-3.7l2.3-0.7l2.7,0.9l3.1-2.3l5.2,1.2z"/>
  <path id="WI" d="M579.5,108.4l-1.3-2.5l0.2-2.7l1.5-3.1l-0.8-2.7l0.2-2l-1.6-2.6l-1.5-4.6l-1.9-2.7l0.1-2l-4.5-3.4l-3.2-0.2l-0.9-4.7l-2.4-1.3l-0.1-2.2l0.8-2.7l-0.6-1.8l-0.1-3.2l-1.4-0.5l-1.4-3l-3.7-1.5l-0.1-2.6l-1.9-0.5l-0.9,1.8l-0.4,4.3l-3.5,5.7l-2.3,0.5l-0.6,2.5l1.3,2.4l-0.3,3.8l-1.1,4.1l0.9,1.9l-1.7,3.2l0.1,3.2l-3.9,2l0.5,4.4l3.9,0.1l1.8,1.5l1.5,3.9l0.6,9.7l-1.7,2.9l-0.1,4.9l-2.6,3.9l-2.8,3.9l-2.1,3.8l0.2,3.1l3.9,1.1l2.2,0.3l0.5-2.5l2.1-2.6l1.9-0.4l2.2-2.5l2.9,1.3l3.9,3.5l4.7,0.2l0.8-1.5l1.5-0.3l0.5,1.7l-1.1,2.7l0.1,1.9l2.9,0.9l2.7-0.9l0.7-3l2.6-1.1l0.5-2l1.5-0.6l0.2-2.9l-0.1-3.1l-2.8-1.2l1.2-1.1l2.9-0.6l0.5-4.2l2.7-4.8l0.4-4.2l-0.3-4.1l0.9-4.1l-0.6-3.3l-2.6-2.8l-0.7-3.2z"/>
  <path id="WY" d="M335.9,194.7l-3.7-23l-3.7-26.1l-3.5-23.7l-42.9,4.3l-39.5,2.8l-41.9,1.9l3.8,36l4.6,43.5l41.9-2.9l42.5-4.1l42.5-5.3z"/>
</svg>
`;

const MAP_PALETTE = [
  '#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#f8961e',
  '#8ecae6', '#fb8500', '#9b5de5', '#f15bb5', '#00bbf9',
  '#90be6d', '#f3722c'
];

const getStateColor = (abbrev) => {
  let hash = 0;
  for (let i = 0; i < abbrev.length; i++) {
    hash = (hash * 31 + abbrev.charCodeAt(i)) % MAP_PALETTE.length;
  }
  return MAP_PALETTE[hash];
};

// Get fog level (0-7) based on notice count
const getFogLevel = (count, maxCount) => {
  if (count === 0) return 0;
  if (maxCount === 0) return 0;
  const ratio = count / maxCount;
  if (ratio <= 0.05) return 1;
  if (ratio <= 0.15) return 2;
  if (ratio <= 0.25) return 3;
  if (ratio <= 0.4) return 4;
  if (ratio <= 0.6) return 5;
  if (ratio <= 0.8) return 6;
  return 7;
};

// Initialize the weather map
const initWeatherMap = async () => {
  try {
    const res = await fetch('/us-map.svg');
    if (!res.ok) throw new Error('map fetch failed');
    usMapContainer.innerHTML = await res.text();
  } catch {
    usMapContainer.innerHTML = US_STATES_SVG;
  }

  const svg = usMapContainer.querySelector('svg');
  if (!svg) return;

  if (!svg.getAttribute('viewBox')) {
    const width = svg.getAttribute('width') || '960';
    const height = svg.getAttribute('height') || '600';
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }

  const shapes = svg.querySelectorAll('path, circle');
  const stateShapes = [];

  shapes.forEach((shape) => {
    const classList = Array.from(shape.classList || []);
    const stateClass = classList.find((c) => c.length === 2 && /^[a-z]{2}$/i.test(c));
    const rawId = shape.getAttribute('data-state') || shape.getAttribute('id') || '';
    const abbrev = (stateClass || rawId).toUpperCase();
    if (!/^[A-Z]{2}$/.test(abbrev)) return;
    shape.setAttribute('data-state', abbrev);
    stateShapes.push(shape);
  });

  stateShapes.forEach((shape) => {
    const stateId = shape.getAttribute('data-state');
    const baseColor = getStateColor(stateId);
    shape.style.fill = baseColor;
    shape.style.fillOpacity = '0.28';
    shape.setAttribute('data-base-fill', baseColor);
    shape.addEventListener('mouseenter', (e) => showTooltip(e, stateId));
    shape.addEventListener('mousemove', (e) => moveTooltip(e));
    shape.addEventListener('mouseleave', hideTooltip);
    shape.addEventListener('click', () => {
      stateSelect.value = stateId;
      loadNotices();
    });
  });

  const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  labelGroup.setAttribute('class', 'state-labels');
  stateShapes.forEach((shape) => {
    const bbox = shape.getBBox();
    if (bbox.width < 22 || bbox.height < 12) return;
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.textContent = shape.getAttribute('data-state');
    label.setAttribute('x', String(bbox.x + bbox.width / 2));
    label.setAttribute('y', String(bbox.y + bbox.height / 2));
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('dominant-baseline', 'middle');
    labelGroup.appendChild(label);
  });
  svg.appendChild(labelGroup);
};

// Show tooltip
const showTooltip = (e, stateAbbrev) => {
  const stateName = STATE_NAMES[stateAbbrev] || stateAbbrev;
  const data = stateData[stateAbbrev] || { count: 0 };

  mapTooltip.innerHTML = `
    <div class="tooltip-state">${stateName}</div>
    <div class="tooltip-count">${data.count} nursing-related notices</div>
  `;
  mapTooltip.classList.add('visible');
  moveTooltip(e);
};

// Move tooltip to follow mouse
const moveTooltip = (e) => {
  const container = usMapContainer.closest('.weather-map-container');
  const rect = container.getBoundingClientRect();
  const x = e.clientX - rect.left + 15;
  const y = e.clientY - rect.top + 15;

  mapTooltip.style.left = `${x}px`;
  mapTooltip.style.top = `${y}px`;
};

// Hide tooltip
const hideTooltip = () => {
  mapTooltip.classList.remove('visible');
};

// =============================================================================
// Zero Protocol - Auto-refetch states with 0 notices
// =============================================================================
let zeroProtocolInProgress = false;

const showMapToast = (message, duration = 3000) => {
  if (!mapToast) return;
  mapToast.textContent = message;
  mapToast.classList.remove('hidden');
  mapToast.classList.add('visible');

  setTimeout(() => {
    mapToast.classList.remove('visible');
    mapToast.classList.add('hidden');
  }, duration);
};

const refetchStateNotices = async (stateAbbrev) => {
  try {
    // Fetch fresh notices for this specific state
    const response = await fetchJson(`/notices?state=${stateAbbrev}&limit=500`);
    const notices = response.notices ?? [];
    return notices.length;
  } catch (err) {
    console.error(`Failed to refetch notices for ${stateAbbrev}:`, err);
    return 0;
  }
};

const runZeroProtocol = async () => {
  // Only run if no state filters are selected
  if (selectedStates.length > 0) return;
  if (zeroProtocolInProgress) return;

  // Find states in stateData with 0 notices
  const zeroStates = Object.keys(stateData).filter(state => {
    const count = stateData[state]?.count ?? 0;
    return count === 0;
  });

  if (zeroStates.length === 0) return;

  zeroProtocolInProgress = true;

  for (const stateAbbrev of zeroStates) {
    const stateName = STATE_NAMES[stateAbbrev] || stateAbbrev;
    showMapToast(`Refetching for ${stateName}...`, 2500);

    const newCount = await refetchStateNotices(stateAbbrev);

    if (newCount > 0) {
      stateData[stateAbbrev] = { count: newCount };
    }

    // Small delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Update the map with new data
  updateWeatherMap();

  // Recalculate calibration stats
  const counts = Object.values(stateData).map(entry => entry.count ?? 0);
  calibrationStats = {
    minCount: counts.length ? Math.min(...counts) : 0,
    maxCount: counts.length ? Math.max(...counts) : 0
  };
  updateStateCalibration();

  zeroProtocolInProgress = false;
};

// Update weather map colors based on state data
const updateWeatherMap = () => {
  const counts = Object.values(stateData).map(s => s.count || 0);
  const maxCount = Math.max(...counts, 1);

  const shapes = usMapContainer.querySelectorAll('[data-state]');
  shapes.forEach(shape => {
    const stateAbbrev = shape.getAttribute('data-state');
    const count = stateData[stateAbbrev]?.count || 0;
    const fogLevel = getFogLevel(count, maxCount);
    const baseFill = shape.getAttribute('data-base-fill');
    shape.style.fill = baseFill || getStateColor(stateAbbrev);
    shape.style.fillOpacity = `${0.22 + fogLevel * 0.08}`;

    // Remove all fog classes
    for (let i = 0; i <= 7; i++) {
      shape.classList.remove(`fog-${i}`);
    }
    // Add the appropriate fog class
    shape.classList.add(`fog-${fogLevel}`);
  });
};

// Modified loadStates to also update weather map
const originalLoadStates = loadStates;
const loadStatesWithMap = async () => {
  try {
    const data = await fetchJson('/states');
    const states = data.states ?? [];
    statStates.textContent = states.length.toString();

    regionSelect.innerHTML = '';
    const regionDefault = document.createElement('option');
    regionDefault.value = '';
    regionDefault.textContent = 'All regions';
    regionSelect.appendChild(regionDefault);
    REGIONS.forEach((region) => {
      const opt = document.createElement('option');
      opt.value = region;
      opt.textContent = region;
      regionSelect.appendChild(opt);
    });

    // Build state data from API response
    stateData = {};
    states.forEach((entry) => {
      const state = entry.state;
      // Handle both { state, count: X } and { state, count: { count: X } } formats
      let count = 0;
      if (typeof entry.count === 'number') {
        count = entry.count;
      } else if (entry.count && typeof entry.count.count === 'number') {
        count = entry.count.count;
      }
      stateData[state] = { count };
    });

    // Populate state dropdown with all states
    populateStateDropdown();

    // Update the weather map colors
    updateWeatherMap();
    const counts = Object.values(stateData).map(entry => entry.count ?? 0);
    calibrationStats = {
      minCount: counts.length ? Math.min(...counts) : 0,
      maxCount: counts.length ? Math.max(...counts) : 0
    };
    updateStateCalibration();

    // Run zero protocol to refetch data for states showing 0 notices
    runZeroProtocol();
  } catch {
    statStates.textContent = '0';
  }
};

// Populate the multi-select state dropdown
const populateStateDropdown = (selectedRegion = '') => {
  if (!stateOptions) return;

  // Determine which states to show
  let statesToShow = ALL_STATES;
  if (selectedRegion && REGION_STATES[selectedRegion]) {
    statesToShow = REGION_STATES[selectedRegion].slice().sort();
  }

  // Clear existing options
  stateOptions.innerHTML = '';

  // Add state options with counts where available
  statesToShow.forEach(state => {
    const count = stateData[state]?.count || 0;
    const isSelected = selectedStates.includes(state);
    const option = document.createElement('div');
    option.className = `multi-select-option${isSelected ? ' selected' : ''}`;
    option.dataset.state = state;
    option.innerHTML = `
      <div class="multi-select-checkbox"></div>
      <span class="multi-select-label">${state}</span>
      ${count > 0 ? `<span class="multi-select-count">${count}</span>` : ''}
    `;
    stateOptions.appendChild(option);
  });

  // Filter out selected states that are no longer in the visible list
  if (selectedRegion) {
    selectedStates = selectedStates.filter(s => statesToShow.includes(s));
  }

  // Update the display
  updateStateDisplay();
};

// Update the state display to show selected tags
const updateStateDisplay = () => {
  if (!stateDisplay) return;

  if (selectedStates.length === 0) {
    stateDisplay.innerHTML = '<span class="multi-select-placeholder">All states</span>';
  } else if (selectedStates.length <= 3) {
    stateDisplay.innerHTML = selectedStates.map(state => `
      <span class="multi-select-tag" data-state="${state}">
        ${state}
        <span class="multi-select-tag-remove" data-state="${state}">&times;</span>
      </span>
    `).join('');
  } else {
    const visibleStates = selectedStates.slice(0, 2);
    stateDisplay.innerHTML = visibleStates.map(state => `
      <span class="multi-select-tag" data-state="${state}">
        ${state}
        <span class="multi-select-tag-remove" data-state="${state}">&times;</span>
      </span>
    `).join('') + `<span class="multi-select-more">+${selectedStates.length - 2} more</span>`;
  }

  // Update hidden input
  stateSelect.value = selectedStates.join(',');
};

// Toggle state selection
const toggleStateSelection = (state) => {
  const index = selectedStates.indexOf(state);
  if (index === -1) {
    selectedStates.push(state);
  } else {
    selectedStates.splice(index, 1);
  }

  // Update option visual
  const option = stateOptions?.querySelector(`[data-state="${state}"]`);
  if (option) {
    option.classList.toggle('selected', selectedStates.includes(state));
  }

  updateStateDisplay();
  onStateSelectionChange();
};

// Handle state selection change - update map/chart and reload data
const onStateSelectionChange = () => {
  if (currentMapView === 'map') {
    updateMapHighlights();
  } else {
    renderBarChart();
  }
  loadNotices();
};

// Initialize multi-select dropdown
const initStateMultiSelect = () => {
  if (!stateMultiSelect) return;

  // Toggle dropdown on display click
  stateDisplay?.addEventListener('click', (e) => {
    // Don't toggle if clicking remove button
    if (e.target.classList.contains('multi-select-tag-remove')) {
      const state = e.target.dataset.state;
      if (state) toggleStateSelection(state);
      return;
    }
    stateMultiSelect.classList.toggle('open');
  });

  // Handle option clicks
  stateOptions?.addEventListener('click', (e) => {
    const option = e.target.closest('.multi-select-option');
    if (option) {
      const state = option.dataset.state;
      if (state) toggleStateSelection(state);
    }
  });

  // Search functionality
  stateSearch?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const options = stateOptions?.querySelectorAll('.multi-select-option');
    options?.forEach(option => {
      const state = option.dataset.state;
      const stateName = STATE_NAMES[state] || state;
      const matches = state.toLowerCase().includes(searchTerm) ||
                      stateName.toLowerCase().includes(searchTerm);
      option.classList.toggle('hidden', !matches);
    });
  });

  // Select all button
  document.getElementById('select-all-states')?.addEventListener('click', () => {
    const visibleOptions = stateOptions?.querySelectorAll('.multi-select-option:not(.hidden)');
    visibleOptions?.forEach(option => {
      const state = option.dataset.state;
      if (state && !selectedStates.includes(state)) {
        selectedStates.push(state);
        option.classList.add('selected');
      }
    });
    updateStateDisplay();
    onStateSelectionChange();
  });

  // Clear all button
  document.getElementById('clear-all-states')?.addEventListener('click', () => {
    selectedStates = [];
    stateOptions?.querySelectorAll('.multi-select-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    updateStateDisplay();
    onStateSelectionChange();
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!stateMultiSelect.contains(e.target)) {
      stateMultiSelect.classList.remove('open');
    }
  });
};

// All US states + DC for dropdowns
const ALL_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// Populate custom state dropdown
const populateCustomStateDropdown = () => {
  ALL_STATES.forEach(state => {
    const opt = document.createElement('option');
    opt.value = state;
    opt.textContent = state;
    customStateSelect.appendChild(opt);
  });
};

// Load custom notices from localStorage
const loadCustomNotices = () => {
  try {
    const stored = localStorage.getItem('lni_custom_notices');
    if (stored) {
      customNotices = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load custom notices:', e);
    customNotices = [];
  }
};

// Save custom notices to localStorage
const saveCustomNotices = () => {
  try {
    localStorage.setItem('lni_custom_notices', JSON.stringify(customNotices));
  } catch (e) {
    console.error('Failed to save custom notices:', e);
  }
};

// Handle custom notice form submission
const handleCustomNoticeSubmit = (e) => {
  e.preventDefault();

  const employer = document.getElementById('custom-employer').value.trim();
  const state = document.getElementById('custom-state').value;
  const affected = document.getElementById('custom-affected').value;
  const noticeDate = document.getElementById('custom-date').value;
  const layoffDate = document.getElementById('custom-layoff-date').value;
  const location = document.getElementById('custom-location').value.trim();
  const notes = document.getElementById('custom-notes').value.trim();

  if (!employer || !state) {
    alert('Please fill in the required fields (Employer Name and State).');
    return;
  }

  const customNotice = {
    id: `custom-${Date.now()}`,
    employerName: employer,
    state: state,
    affectedCount: affected ? parseInt(affected, 10) : null,
    noticeDate: noticeDate || new Date().toISOString().split('T')[0],
    layoffDate: layoffDate || null,
    city: location || null,
    rawText: notes || null,
    isCustom: true,
    nursingImpact: { score: 50, label: 'Custom' },
    createdAt: new Date().toISOString()
  };

  customNotices.unshift(customNotice);
  saveCustomNotices();

  // Add to current notices and re-render
  currentNotices.unshift(customNotice);
  renderNotices(currentNotices);
  updateStats(currentNotices);

  // Reset form
  customNoticeForm.reset();

  alert(`Custom notice for "${employer}" has been added!`);
};

// Initialize custom notice form
if (customNoticeForm) {
  customNoticeForm.addEventListener('submit', handleCustomNoticeSubmit);
}

// ==================== PROJECTS FUNCTIONALITY ====================

const PROJECTS_KEY = 'lni_projects';

// Load projects from localStorage
const loadProjects = () => {
  try {
    const stored = localStorage.getItem(PROJECTS_KEY);
    if (stored) {
      projects = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load projects:', e);
    projects = [];
  }
};

// Save projects to localStorage
const saveProjects = () => {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects:', e);
  }
};

// Render projects list
const renderProjects = (searchTerm = '') => {
  const filtered = searchTerm
    ? projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : projects;

  if (!filtered.length) {
    projectsList.innerHTML = `<div class="empty-state">${
      searchTerm ? 'No projects match your search.' : 'No projects yet. Create one to start organizing notices.'
    }</div>`;
    return;
  }

  projectsList.innerHTML = filtered.map(project => `
    <div class="project-card" data-project-id="${project.id}" style="border-left-color: ${project.color}">
      <div class="project-card-header">
        <h4>${project.name}</h4>
        <span class="project-card-count">${project.notices?.length || 0} notices</span>
      </div>
      <p>${project.description || 'No description'}</p>
      <div class="project-card-meta">Created ${formatDate(project.createdAt)}</div>
    </div>
  `).join('');
};

// Open project modal
const openProjectModal = (projectId = null) => {
  currentProjectId = projectId;
  const modalTitle = document.getElementById('modal-title');
  const nameInput = document.getElementById('project-name');
  const descInput = document.getElementById('project-description');

  if (projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      modalTitle.textContent = 'Edit Project';
      nameInput.value = project.name;
      descInput.value = project.description || '';
      // Select the color
      document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.color === project.color);
      });
    }
  } else {
    modalTitle.textContent = 'Create New Project';
    projectForm.reset();
    document.querySelectorAll('.color-option').forEach((opt, i) => {
      opt.classList.toggle('selected', i === 0);
    });
  }

  projectModal.classList.add('active');
};

// Close project modal
const closeProjectModal = () => {
  projectModal.classList.remove('active');
  currentProjectId = null;
};

// Handle project form submit
const handleProjectSubmit = (e) => {
  e.preventDefault();

  const name = document.getElementById('project-name').value.trim();
  const description = document.getElementById('project-description').value.trim();
  const selectedColor = document.querySelector('.color-option.selected');
  const color = selectedColor ? selectedColor.dataset.color : '#3182ce';

  if (!name) {
    alert('Please enter a project name.');
    return;
  }

  if (currentProjectId) {
    // Update existing project
    const project = projects.find(p => p.id === currentProjectId);
    if (project) {
      project.name = name;
      project.description = description;
      project.color = color;
      project.updatedAt = new Date().toISOString();
    }
  } else {
    // Create new project
    const newProject = {
      id: `project-${Date.now()}`,
      name,
      description,
      color,
      notices: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projects.unshift(newProject);
  }

  saveProjects();
  renderProjects();
  closeProjectModal();
};

// Open project detail modal
const openProjectDetail = (projectId) => {
  const project = projects.find(p => p.id === projectId);
  if (!project) return;

  currentProjectId = projectId;
  document.getElementById('project-detail-title').textContent = project.name;
  document.getElementById('project-detail-desc').textContent = project.description || 'No description';

  const noticesList = document.getElementById('project-notices-list');
  if (!project.notices?.length) {
    noticesList.innerHTML = `<div class="empty-state">No notices saved to this project yet. Click "Save to Project" on any notice card.</div>`;
  } else {
    noticesList.innerHTML = project.notices.map(notice => `
      <div class="project-notice-item" data-notice-id="${notice.id}">
        <div class="project-notice-item-info">
          <h5>${notice.employerName || notice.employer_name || 'Unknown'}</h5>
          <span>${notice.state} • ${formatDate(notice.noticeDate || notice.notice_date)} • ${formatNumber(notice.affectedCount || notice.employees_affected)} affected</span>
        </div>
        <button onclick="removeNoticeFromProject('${projectId}', '${notice.id}')" title="Remove from project">&times;</button>
      </div>
    `).join('');
  }

  projectDetailModal.classList.add('active');
};

// Close project detail modal
const closeProjectDetail = () => {
  projectDetailModal.classList.remove('active');
  currentProjectId = null;
};

// Delete project
const deleteProject = () => {
  if (!currentProjectId) return;

  const project = projects.find(p => p.id === currentProjectId);
  if (!project) return;

  if (confirm(`Are you sure you want to delete "${project.name}"? This cannot be undone.`)) {
    projects = projects.filter(p => p.id !== currentProjectId);
    saveProjects();
    renderProjects();
    closeProjectDetail();
  }
};

// Save notice to project
const saveNoticeToProject = (projectId, notice) => {
  const project = projects.find(p => p.id === projectId);
  if (!project) return;

  // Check if already saved
  const exists = project.notices?.some(n => n.id === notice.id);
  if (exists) {
    alert('This notice is already saved to this project.');
    return;
  }

  if (!project.notices) project.notices = [];

  // Save a simplified copy of the notice
  project.notices.push({
    id: notice.id,
    employerName: notice.employer_name || notice.employerName,
    state: notice.state,
    noticeDate: notice.notice_date || notice.noticeDate,
    affectedCount: notice.employees_affected || notice.affectedCount,
    city: notice.city,
    savedAt: new Date().toISOString()
  });

  project.updatedAt = new Date().toISOString();
  saveProjects();
  renderProjects();
  alert(`Notice saved to "${project.name}"`);
};

// Remove notice from project
const removeNoticeFromProject = (projectId, noticeId) => {
  const project = projects.find(p => p.id === projectId);
  if (!project) return;

  project.notices = project.notices.filter(n => n.id !== noticeId);
  project.updatedAt = new Date().toISOString();
  saveProjects();

  // Re-render the detail modal
  openProjectDetail(projectId);
};

// Make this function global for onclick handlers
window.removeNoticeFromProject = removeNoticeFromProject;

// Export project to CSV
const exportProjectCSV = () => {
  if (!currentProjectId) return;
  const project = projects.find(p => p.id === currentProjectId);
  if (!project || !project.notices?.length) {
    alert('No notices to export in this project.');
    return;
  }

  const headers = ['Employer Name', 'State', 'City', 'Notice Date', 'Layoff Date', 'Affected Employees', 'Impact Score'];
  const rows = project.notices.map(notice => [
    `"${(notice.employerName || notice.employer_name || 'Unknown').replace(/"/g, '""')}"`,
    notice.state || '',
    `"${(notice.city || '').replace(/"/g, '""')}"`,
    notice.noticeDate || notice.notice_date || '',
    notice.layoffDate || notice.layoff_date || '',
    notice.affectedCount || notice.employees_affected || '',
    notice.nursingImpact?.score || ''
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}_export.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// Export project to JSON
const exportProjectJSON = () => {
  if (!currentProjectId) return;
  const project = projects.find(p => p.id === currentProjectId);
  if (!project || !project.notices?.length) {
    alert('No notices to export in this project.');
    return;
  }

  const exportData = {
    projectName: project.name,
    description: project.description || '',
    exportedAt: new Date().toISOString(),
    noticeCount: project.notices.length,
    notices: project.notices.map(notice => ({
      employerName: notice.employerName || notice.employer_name || 'Unknown',
      state: notice.state || '',
      city: notice.city || '',
      noticeDate: notice.noticeDate || notice.notice_date || '',
      layoffDate: notice.layoffDate || notice.layoff_date || '',
      affectedEmployees: notice.affectedCount || notice.employees_affected || null,
      impactScore: notice.nursingImpact?.score || null,
      impactLabel: notice.nursingImpact?.label || ''
    }))
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}_export.json`;
  link.click();
  URL.revokeObjectURL(url);
};

// Initialize project event listeners
const initProjectEvents = () => {
  // New project button
  if (newProjectBtn) {
    newProjectBtn.addEventListener('click', () => openProjectModal());
  }

  // Modal close buttons
  document.getElementById('modal-close')?.addEventListener('click', closeProjectModal);
  document.getElementById('modal-cancel')?.addEventListener('click', closeProjectModal);
  document.getElementById('project-detail-close')?.addEventListener('click', closeProjectDetail);
  document.getElementById('close-project-detail')?.addEventListener('click', closeProjectDetail);
  document.getElementById('delete-project-btn')?.addEventListener('click', deleteProject);

  // Export buttons
  document.getElementById('export-project-csv')?.addEventListener('click', exportProjectCSV);
  document.getElementById('export-project-json')?.addEventListener('click', exportProjectJSON);

  // Project form submit
  if (projectForm) {
    projectForm.addEventListener('submit', handleProjectSubmit);
  }

  // Color picker
  if (colorPicker) {
    colorPicker.addEventListener('click', (e) => {
      if (e.target.classList.contains('color-option')) {
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        e.target.classList.add('selected');
      }
    });
  }

  // Project search
  if (projectSearch) {
    projectSearch.addEventListener('input', (e) => {
      renderProjects(e.target.value);
    });
  }

  // Project card clicks
  if (projectsList) {
    projectsList.addEventListener('click', (e) => {
      const card = e.target.closest('.project-card');
      if (card) {
        openProjectDetail(card.dataset.projectId);
      }
    });
  }

  // Close modals on overlay click
  projectModal?.addEventListener('click', (e) => {
    if (e.target === projectModal) closeProjectModal();
  });
  projectDetailModal?.addEventListener('click', (e) => {
    if (e.target === projectDetailModal) closeProjectDetail();
  });
};

// ==================== END PROJECTS FUNCTIONALITY ====================

// ==================== HELP SECTION ====================

// Help section toggle
const initHelpSection = () => {
  const helpSection = document.querySelector('.help-section');
  const helpToggle = document.getElementById('help-toggle');

  if (helpToggle && helpSection) {
    helpToggle.addEventListener('click', () => {
      helpSection.classList.toggle('open');
    });
  }
};

// ==================== END HELP SECTION ====================

// ==================== ACCREDITED PROGRAMS MODULE ====================

const updateProgramsCount = (count) => {
  if (!programsCount) return;
  const label = count === 1 ? 'program' : 'programs';
  programsCount.textContent = `${count} ${label}`;
};

const updateProgramsLoading = (loaded, total) => {
  if (!programsProgressBar || !programsProgressText) return;
  const percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
  programsProgressBar.style.width = `${percent}%`;
  programsProgressText.textContent = `Loading programs... ${percent}%`;
};

const normalizeProgram = (program) => {
  return {
    institution: program.institution ?? program.institution_name ?? program.school ?? 'Unknown',
    campus: program.campus ?? program.campus_name ?? '-',
    city: program.city ?? '',
    state: program.state ?? '',
    level: program.level ?? program.program_level ?? '',
    accreditor: program.accreditor ?? program.accreditation ?? '',
    credentialNotes: program.credential_notes ?? program.credentialNotes ?? ''
  };
};

const buildProgramRow = (program) => {
  const entry = normalizeProgram(program);
  const credential = entry.credentialNotes
    ? `<span class="programs-credential">${escapeHtml(entry.credentialNotes)}</span>`
    : '';

  return `
    <tr>
      <td><strong>${escapeHtml(entry.institution)}</strong>${credential}</td>
      <td>${escapeHtml(entry.campus || '-')}</td>
      <td>${escapeHtml(entry.city || '-')}</td>
      <td>${escapeHtml(entry.state || '-')}</td>
      <td>${escapeHtml(entry.level || '-')}</td>
      <td>${escapeHtml(entry.accreditor || '-')}</td>
    </tr>
  `;
};

const DEFAULT_PROGRAM_LEVELS = ['ASN', 'BSN', 'MSN'];

const getSelectedLevels = () => {
  if (!programsLevelFilter) return DEFAULT_PROGRAM_LEVELS;
  const checkboxes = programsLevelFilter.querySelectorAll('input[type="checkbox"]:checked');
  const levels = Array.from(checkboxes).map(cb => cb.value);
  // If no checkboxes found or none checked, return defaults
  return levels.length > 0 ? levels : DEFAULT_PROGRAM_LEVELS;
};

const getFilteredPrograms = () => {
  const query = programsSearch?.value.trim().toLowerCase() ?? '';
  const stateFilter = programsStateFilter?.value ?? '';
  const selectedLevels = getSelectedLevels();

  return nursingPrograms.filter((program) => {
    const entry = normalizeProgram(program);
    if (stateFilter && entry.state !== stateFilter) return false;
    if (selectedLevels.length > 0 && !selectedLevels.includes(entry.level)) return false;
    if (!query) return true;
    const haystack = [
      entry.institution,
      entry.campus,
      entry.city,
      entry.state,
      entry.level,
      entry.accreditor,
      entry.credentialNotes
    ].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(query);
  });
};

const renderProgramsTable = (programs) => {
  if (!programsList) return;

  if (!programs.length) {
    programsList.innerHTML = '<tr><td colspan="6">No programs match these filters.</td></tr>';
    updateProgramsCount(0);
    return;
  }

  programsList.innerHTML = programs.map(buildProgramRow).join('');
  updateProgramsCount(programs.length);
};

const renderProgramsWithProgress = (programs) => {
  if (!programsList) return;
  programsList.innerHTML = '';

  if (!programs.length) {
    programsList.innerHTML = '<tr><td colspan="6">No programs available.</td></tr>';
    updateProgramsCount(0);
    programsLoading?.classList.remove('active');
    return;
  }

  let rendered = 0;
  const total = programs.length;
  const batchSize = 50;
  programsLoading?.classList.add('active');
  updateProgramsLoading(0, total);
  updateProgramsCount(total);

  const appendBatch = () => {
    const batch = programs.slice(rendered, rendered + batchSize);
    if (!batch.length) {
      programsLoading?.classList.remove('active');
      updateProgramsLoading(total, total);
      return;
    }

    programsList.insertAdjacentHTML('beforeend', batch.map(buildProgramRow).join(''));
    rendered += batch.length;
    updateProgramsLoading(rendered, total);

    if (rendered < total) {
      requestAnimationFrame(appendBatch);
    } else {
      programsLoading?.classList.remove('active');
    }
  };

  requestAnimationFrame(appendBatch);
};

const populateProgramFilters = (programs) => {
  if (!programsStateFilter) return;
  // Filter to only valid US state codes
  const states = Array.from(new Set(programs.map(p => normalizeProgram(p).state).filter(s => s && ALL_STATES.includes(s)))).sort();

  programsStateFilter.innerHTML = '<option value="">All states</option>' +
    states.map(state => `<option value="${state}">${state}</option>`).join('');
  // Level checkboxes are now static in HTML with ASN, BSN, MSN checked by default
};

const downloadProgramsCsv = () => {
  const programs = getFilteredPrograms();
  if (!programs.length) {
    alert('No programs available to export.');
    return;
  }

  const headers = ['Institution', 'Campus', 'City', 'State', 'Level', 'Accreditor', 'Credential Notes'];
  const rows = programs.map((program) => {
    const entry = normalizeProgram(program);
    return [
      `"${entry.institution.replace(/"/g, '""')}"`,
      `"${entry.campus.replace(/"/g, '""')}"`,
      `"${entry.city.replace(/"/g, '""')}"`,
      `"${entry.state.replace(/"/g, '""')}"`,
      `"${entry.level.replace(/"/g, '""')}"`,
      `"${entry.accreditor.replace(/"/g, '""')}"`,
      `"${entry.credentialNotes.replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'accredited_nursing_programs.csv';
  link.click();
  URL.revokeObjectURL(url);
};

const loadPrograms = async (force = false) => {
  if (programsLoaded && !force) return;
  programsLoaded = true;

  try {
    programsLoading?.classList.add('active');
    updateProgramsLoading(0, 1);
    const data = await fetchJson(`/data/programs.json?ts=${Date.now()}`);

    nursingPrograms = Array.isArray(data) ? data : (data.programs ?? []);
    programsMeta = {
      lastUpdated: data.lastUpdated ?? null,
      sources: data.sources ?? []
    };

    if (programsUpdated) {
      programsUpdated.textContent = programsMeta.lastUpdated
        ? `Last updated ${formatDate(programsMeta.lastUpdated)}`
        : 'Last updated --';
    }

    if (programsSourceNote) {
      const sourceNames = programsMeta.sources.map(s => typeof s === 'string' ? s : s.name).filter(Boolean);
      programsSourceNote.textContent = sourceNames.length
        ? `Sources: ${sourceNames.join(' + ')}`
        : '';
    }

    const accreditorSet = getLoadedAccreditors(nursingPrograms);
    const missingAccreditors = REQUIRED_PROGRAM_ACCREDITORS.filter(
      (accreditor) => !accreditorSet.has(accreditor)
    );
    if (missingAccreditors.length && !programsRefreshPrompted) {
      programsRefreshPrompted = true;
      const shouldReload = window.confirm(
        `Some accreditor data did not load (${missingAccreditors.join(', ')}). Refresh now?`
      );
      if (shouldReload) {
        window.location.reload();
        return;
      }
    }

    populateProgramFilters(nursingPrograms);
    renderProgramsWithProgress(getFilteredPrograms());
  } catch (err) {
    programsLoaded = false;
    if (programsList) {
      programsList.innerHTML = '<tr><td colspan="6">Unable to load programs.</td></tr>';
    }
    programsLoading?.classList.remove('active');
    console.error(err);
  }
};

const closeModulesMenu = () => {
  modulesMenu?.classList.remove('open');
};

const openProgramsModal = () => {
  programsModal?.classList.add('active');
  closeModulesMenu();
  loadPrograms();
  programsSearch?.focus();
};

const closeProgramsModal = () => {
  programsModal?.classList.remove('active');
};

const initProgramsModule = () => {
  if (programsModuleInitialized) return;
  programsModuleInitialized = true;

  modulesMenuBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    modulesMenu?.classList.toggle('open');
  });

  openProgramsModuleBtn?.addEventListener('click', openProgramsModal);
  programsModalClose?.addEventListener('click', closeProgramsModal);
  programsCloseBtn?.addEventListener('click', closeProgramsModal);
  programsModal?.addEventListener('click', (event) => {
    if (event.target === programsModal) closeProgramsModal();
  });

  programsSearch?.addEventListener('input', () => renderProgramsTable(getFilteredPrograms()));
  programsStateFilter?.addEventListener('change', () => renderProgramsTable(getFilteredPrograms()));
  // Add change listeners to all level checkboxes
  programsLevelFilter?.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => renderProgramsTable(getFilteredPrograms()));
  });
  programsDownload?.addEventListener('click', downloadProgramsCsv);
  loadPrograms(true);
};

// ==================== END ACCREDITED PROGRAMS MODULE ====================

// ==================== MAP/CHART VIEW TOGGLE ====================

// Render bar chart view
const renderBarChart = () => {
  const barChart = document.getElementById('bar-chart');
  if (!barChart) return;

  // Get all states with their counts, sorted by count descending
  const statesWithCounts = ALL_STATES.map(state => {
    const entry = stateData[state];
    // Handle both { count: X } and just X formats
    let count = 0;
    if (typeof entry === 'number') {
      count = entry;
    } else if (entry && typeof entry.count === 'number') {
      count = entry.count;
    } else if (entry && typeof entry.count === 'object' && entry.count?.count) {
      // Handle nested { count: { count: X } } case
      count = entry.count.count;
    }
    return { state, count };
  }).sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...statesWithCounts.map(s => s.count), 1);

  // Determine which states to highlight
  const selectedRegion = regionSelect.value;
  let statesToHighlight = [];

  if (selectedStates.length > 0) {
    // Use the multi-select selected states
    statesToHighlight = selectedStates;
  } else if (selectedRegion && REGION_STATES[selectedRegion]) {
    // Fall back to region states if no specific states selected
    statesToHighlight = REGION_STATES[selectedRegion];
  }

  barChart.innerHTML = statesWithCounts.map(({ state, count }) => {
    const percentage = (count / maxCount) * 100;
    const isSelected = statesToHighlight.length === 0 || statesToHighlight.includes(state);
    const selectedClass = statesToHighlight.length > 0 && statesToHighlight.includes(state) ? 'selected' : '';

    return `
      <div class="bar-chart-row ${selectedClass}" data-state="${state}" style="${!isSelected && statesToHighlight.length > 0 ? 'opacity: 0.4;' : ''}">
        <span class="bar-chart-label">${state}</span>
        <div class="bar-chart-bar">
          <div class="bar-chart-fill" style="width: ${percentage}%"></div>
        </div>
        <span class="bar-chart-count">${count.toLocaleString()}</span>
      </div>
    `;
  }).join('');
};

// Toggle between map and chart view
const toggleMapView = (view) => {
  currentMapView = view;
  const mapContainer = document.getElementById('us-map');
  const barChart = document.getElementById('bar-chart');
  const mapLegend = document.getElementById('map-legend');
  const mapViewBtn = document.getElementById('map-view-btn');
  const chartViewBtn = document.getElementById('chart-view-btn');

  if (view === 'map') {
    mapContainer.style.display = 'block';
    barChart.style.display = 'none';
    mapLegend.style.display = 'flex';
    mapViewBtn.classList.add('active');
    chartViewBtn.classList.remove('active');
    updateMapHighlights();
  } else {
    mapContainer.style.display = 'none';
    barChart.style.display = 'block';
    mapLegend.style.display = 'none';
    mapViewBtn.classList.remove('active');
    chartViewBtn.classList.add('active');
    renderBarChart();
  }
};

// Update map highlights based on selected region/state
const updateMapHighlights = () => {
  const shapes = usMapContainer.querySelectorAll('[data-state]');
  const selectedRegion = regionSelect.value;

  // Determine which states to highlight
  let statesToHighlight = [];

  if (selectedStates.length > 0) {
    // Use the multi-select selected states
    statesToHighlight = selectedStates;
  } else if (selectedRegion && REGION_STATES[selectedRegion]) {
    // Fall back to region states if no specific states selected
    statesToHighlight = REGION_STATES[selectedRegion];
  }

  shapes.forEach(shape => {
    const stateAbbrev = shape.getAttribute('data-state');
    shape.classList.remove('state-selected', 'state-dimmed');

    if (statesToHighlight.length > 0) {
      if (statesToHighlight.includes(stateAbbrev)) {
        shape.classList.add('state-selected');
      } else {
        shape.classList.add('state-dimmed');
      }
    }
  });
};

// Initialize map/chart toggle
const initMapToggle = () => {
  const mapViewBtn = document.getElementById('map-view-btn');
  const chartViewBtn = document.getElementById('chart-view-btn');

  mapViewBtn?.addEventListener('click', () => toggleMapView('map'));
  chartViewBtn?.addEventListener('click', () => toggleMapView('chart'));
};

// ==================== END MAP/CHART VIEW TOGGLE ====================

// Initialize app (called after login)
const initApp = () => {
  initWeatherMap();
  initHelpSection();
  initMapToggle();
  initStateMultiSelect();
  initForecast();
  initProgramsModule();
  loadHealth();
  loadStatesWithMap();
  loadInsights();
  loadCustomNotices();
  loadProjects();
  populateCustomStateDropdown();
  initProjectEvents();
  initStateCalibration();
  renderProjects();
  loadNotices();
};

// Auto-init if already authenticated
if (checkAuth()) {
  initApp();
}
