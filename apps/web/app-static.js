/**
 * Nursing Layoff Radar - Static Frontend
 *
 * This version works with static JSON files hosted on GitHub Pages.
 * Data is pre-fetched every 6 hours via GitHub Actions.
 *
 * Data URLs:
 * - ./data/notices.json - All notices
 * - ./data/states.json - State summary
 * - ./data/metadata.json - Last update info
 * - ./data/by-state/{STATE}.json - Per-state data
 */

// =============================================================================
// Configuration
// =============================================================================
const DATA_BASE_URL = './data';
const PASSCODE = 'IUH126'; // Simple client-side check (data is public anyway)

// =============================================================================
// DOM Elements
// =============================================================================
const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const passcodeInput = document.getElementById('passcode-input');
const loginError = document.getElementById('login-error');

const apiDot = document.getElementById('api-dot');
const apiStatus = document.getElementById('api-status');
const regionSelect = document.getElementById('filter-region');
const stateSelect = document.getElementById('filter-state');
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

const customNoticeForm = document.getElementById('custom-notice-form');
const customStateSelect = document.getElementById('custom-state');

const projectsList = document.getElementById('projects-list');
const newProjectBtn = document.getElementById('new-project-btn');
const projectModal = document.getElementById('project-modal');
const projectForm = document.getElementById('project-form');
const projectDetailModal = document.getElementById('project-detail-modal');
const projectSearch = document.getElementById('project-search');
const colorPicker = document.getElementById('color-picker');

// =============================================================================
// State
// =============================================================================
let allNotices = []; // All loaded notices
let currentNotices = []; // Filtered notices
let customNotices = [];
let projects = [];
let currentProjectId = null;
let stateData = {};
let metadata = {};
let currentMapView = 'map';
let selectedStates = [];

// =============================================================================
// Authentication (Simple client-side - data is public)
// =============================================================================
const SESSION_KEY = 'lni_authenticated';

const checkAuth = () => sessionStorage.getItem(SESSION_KEY) === 'true';

const handleLogin = (e) => {
  e.preventDefault();
  const entered = passcodeInput.value.trim();

  if (!entered) {
    loginError.textContent = 'Please enter a passcode.';
    return;
  }

  if (entered === PASSCODE) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    loginOverlay.classList.add('hidden');
    passcodeInput.value = '';
    loginError.textContent = '';
    initApp();
  } else {
    loginError.textContent = 'Invalid passcode. Please try again.';
    loginError.classList.remove('shake');
    void loginError.offsetWidth;
    loginError.classList.add('shake');
    passcodeInput.value = '';
    passcodeInput.focus();
  }
};

if (checkAuth()) {
  loginOverlay.classList.add('hidden');
} else {
  passcodeInput.focus();
}

loginForm.addEventListener('submit', handleLogin);

// =============================================================================
// Constants
// =============================================================================
const REGIONS = ['Northeast', 'Midwest', 'South', 'West'];

const REGION_STATES = {
  Northeast: ['CT', 'ME', 'MA', 'NH', 'RI', 'VT', 'NJ', 'NY', 'PA'],
  Midwest: ['IL', 'IN', 'MI', 'OH', 'WI', 'IA', 'KS', 'MN', 'MO', 'NE', 'ND', 'SD'],
  South: ['DE', 'FL', 'GA', 'MD', 'NC', 'SC', 'VA', 'DC', 'WV', 'AL', 'KY', 'MS', 'TN', 'AR', 'LA', 'OK', 'TX'],
  West: ['AZ', 'CO', 'ID', 'MT', 'NV', 'NM', 'UT', 'WY', 'AK', 'CA', 'HI', 'OR', 'WA']
};

const ALL_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
  'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
  'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
  'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'PR',
  'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
  'WI', 'WY'
];

const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'Washington DC', FL: 'Florida',
  GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana',
  IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine',
  MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', PR: 'Puerto Rico',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas',
  UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia',
  WI: 'Wisconsin', WY: 'Wyoming'
};

// =============================================================================
// Utility Functions
// =============================================================================
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

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(dateStr);
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

const setStatus = (status, ok) => {
  apiStatus.textContent = status;
  apiDot.classList.remove('ok', 'bad');
  apiDot.classList.add(ok ? 'ok' : 'bad');
};

// =============================================================================
// Map Initialization
// =============================================================================
const initWeatherMap = async () => {
  if (!usMapContainer) return;
  try {
    const res = await fetch('./us-map.svg');
    if (!res.ok) throw new Error('map fetch failed');
    usMapContainer.innerHTML = await res.text();
  } catch (err) {
    console.error('Failed to load map SVG:', err);
    return;
  }

  const svg = usMapContainer.querySelector('svg');
  if (!svg) return;

  if (!svg.getAttribute('viewBox')) {
    const width = svg.getAttribute('width') || '960';
    const height = svg.getAttribute('height') || '600';
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }

  const shapes = svg.querySelectorAll('path, circle');
  shapes.forEach((shape) => {
    const classList = Array.from(shape.classList || []);
    const stateClass = classList.find((c) => c.length === 2 && /^[a-z]{2}$/i.test(c));
    const rawId = shape.getAttribute('data-state') || shape.getAttribute('id') || '';
    const abbrev = (stateClass || rawId).toUpperCase();
    if (!/^[A-Z]{2}$/.test(abbrev)) return;
    shape.setAttribute('data-state', abbrev);
    shape.addEventListener('click', () => toggleStateSelection(abbrev));
    shape.addEventListener('mouseenter', (e) => showTooltip(e, abbrev));
    shape.addEventListener('mousemove', (e) => moveTooltip(e));
    shape.addEventListener('mouseleave', hideTooltip);
  });
};

const showTooltip = (e, stateAbbrev) => {
  if (!mapTooltip) return;
  const stateName = STATE_NAMES[stateAbbrev] || stateAbbrev;
  const count = stateData[stateAbbrev] || 0;
  mapTooltip.innerHTML = `
    <div class="tooltip-state">${stateName}</div>
    <div class="tooltip-count">${count} notices</div>
  `;
  mapTooltip.classList.add('visible');
  moveTooltip(e);
};

const moveTooltip = (e) => {
  if (!mapTooltip) return;
  const container = usMapContainer?.closest('.weather-map-container');
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const x = e.clientX - rect.left + 15;
  const y = e.clientY - rect.top + 15;
  mapTooltip.style.left = `${x}px`;
  mapTooltip.style.top = `${y}px`;
};

const hideTooltip = () => {
  mapTooltip?.classList.remove('visible');
};

const setLoading = (message) => {
  noticeList.innerHTML = `<div class="empty-state">${message}</div>`;
};

// =============================================================================
// Data Loading (Static JSON)
// =============================================================================
const fetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
};

const loadMetadata = async () => {
  try {
    metadata = await fetchJson(`${DATA_BASE_URL}/metadata.json`);
    setStatus(`Data updated ${formatRelativeTime(metadata.lastUpdated)}`, true);
    statUpdated.textContent = formatRelativeTime(metadata.lastUpdated);
  } catch (err) {
    console.error('Failed to load metadata:', err);
    setStatus('Data unavailable', false);
  }
};

const loadStates = async () => {
  try {
    const data = await fetchJson(`${DATA_BASE_URL}/states.json`);
    stateData = {};
    (data.states ?? []).forEach(({ state, count }) => {
      stateData[state] = count;
    });
    statStates.textContent = Object.keys(stateData).length.toString();
  } catch (err) {
    console.error('Failed to load states:', err);
    statStates.textContent = '0';
  }
};

const loadAllNotices = async () => {
  setLoading('Loading notices...');
  try {
    const data = await fetchJson(`${DATA_BASE_URL}/notices.json`);
    allNotices = data.notices ?? [];
    statTotal.textContent = allNotices.length.toString();
    return allNotices;
  } catch (err) {
    console.error('Failed to load notices:', err);
    setLoading('Failed to load data. Please refresh the page.');
    return [];
  }
};

// =============================================================================
// Filtering (Client-side)
// =============================================================================
const filterNotices = () => {
  let filtered = [...allNotices];

  // Filter by region
  const region = regionSelect.value;
  if (region && REGION_STATES[region]) {
    const regionStates = REGION_STATES[region];
    filtered = filtered.filter(n => regionStates.includes(n.state));
  }

  // Filter by selected states
  if (selectedStates.length > 0) {
    filtered = filtered.filter(n => selectedStates.includes(n.state));
  }

  // Filter by organization
  const org = orgInput.value.trim().toLowerCase();
  if (org) {
    filtered = filtered.filter(n => {
      const text = [
        n.employer_name,
        n.parent_system,
        n.reason,
        n.raw_text
      ].filter(Boolean).join(' ').toLowerCase();
      return text.includes(org);
    });
  }

  // Filter by date
  const since = sinceInput.value;
  if (since) {
    filtered = filtered.filter(n => {
      const noticeDate = n.notice_date || n.retrieved_at;
      return noticeDate && noticeDate >= since;
    });
  }

  // Filter by score
  const minScore = parseInt(scoreInput.value) || 0;
  if (minScore > 0) {
    filtered = filtered.filter(n => (n.nursing_score || 0) >= minScore);
  }

  // Apply limit
  const limit = parseInt(limitInput.value) || 100;
  if (limit > 0 && filtered.length > limit) {
    filtered = filtered.slice(0, limit);
  }

  // Merge custom notices
  if (customNotices.length > 0) {
    filtered = [...customNotices, ...filtered];
  }

  return filtered;
};

const applyFilters = () => {
  currentNotices = filterNotices();
  renderNotices(currentNotices);
  updateStats(currentNotices);
  updateMapHighlights();
};

// =============================================================================
// Rendering
// =============================================================================
const renderNotices = (notices) => {
  if (!notices.length) {
    noticeList.innerHTML = `<div class="empty-state">No notices match these filters.</div>`;
    return;
  }

  noticeList.innerHTML = '';
  notices.forEach((notice, idx) => {
    const card = document.createElement('article');
    card.className = notice.isCustom ? 'notice-card custom-notice' : 'notice-card';
    card.style.animationDelay = `${idx * 35}ms`;
    card.dataset.noticeId = notice.id;

    const label = notice.nursing_label ?? 'Unclear';
    const score = notice.nursing_score ?? 0;
    const employer = notice.employer_name ?? 'Unknown employer';
    const city = notice.city;
    const state = notice.state;
    const location = [city, state].filter(Boolean).join(', ') || state;
    const noticeDate = formatDate(notice.notice_date ?? notice.retrieved_at);
    const affected = notice.employees_affected;

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
  setupSaveDropdowns(notices);
};

const setupSaveDropdowns = (notices) => {
  document.querySelectorAll('.save-to-project-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = btn.dataset.noticeIdx;
      const dropdown = document.getElementById(`dropdown-${idx}`);

      document.querySelectorAll('.save-dropdown.active').forEach(d => {
        if (d !== dropdown) d.classList.remove('active');
      });

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

  document.querySelectorAll('.save-dropdown').forEach((dropdown, idx) => {
    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = e.target.closest('.save-dropdown-item');
      if (item && item.dataset.projectId) {
        const notice = notices[idx];
        saveNoticeToProject(item.dataset.projectId, notice);
        dropdown.classList.remove('active');
      }
    });
  });
};

document.addEventListener('click', () => {
  document.querySelectorAll('.save-dropdown.active').forEach(d => d.classList.remove('active'));
});

const renderDetail = (notice) => {
  if (!notice) {
    detailBody.innerHTML = `<div class="empty-detail">No notice selected.</div>`;
    return;
  }

  const signals = parseMaybeJson(notice.nursing_signals);
  const keywords = parseMaybeJson(notice.nursing_keywords);

  detailBody.innerHTML = `
    <div class="detail-section">
      <h5>${notice.employer_name || 'Unknown employer'}</h5>
      <p>${[notice.address, notice.city, notice.county, notice.state].filter(Boolean).join(', ') || 'Location unknown'}</p>
    </div>
    <div class="detail-section">
      <h5>Impact Summary</h5>
      <p>Score: ${notice.nursing_score ?? 0} (${notice.nursing_label ?? 'Unclear'})</p>
      <p>Employees affected: ${formatNumber(notice.employees_affected)}</p>
      <p>NAICS: ${notice.naics ?? 'Unknown'} - Reason: ${notice.reason ?? 'Not provided'}</p>
    </div>
    <div class="detail-section">
      <h5>Signals & Keywords</h5>
      <p>${signals.length ? signals.join(', ') : 'No signals captured yet.'}</p>
      <p>${keywords.length ? `Keywords: ${keywords.join(', ')}` : 'No keywords logged.'}</p>
    </div>
    <div class="detail-section detail-links">
      <h5>Source</h5>
      <p>Source: ${notice.source_name ?? 'Unknown source'}</p>
      ${notice.source_url ? `<p><a href="${notice.source_url}" target="_blank" rel="noreferrer">Open source page</a></p>` : ''}
    </div>
    <div class="detail-section">
      <h5>Timeline</h5>
      <p>Notice date: ${formatDate(notice.notice_date)}</p>
      <p>Effective date: ${formatDate(notice.effective_date)}</p>
      <p>Retrieved: ${formatDate(notice.retrieved_at)}</p>
    </div>
  `;
};

const updateStats = (notices) => {
  statTotal.textContent = notices.length.toString();
};

noticeList.addEventListener('click', (event) => {
  const card = event.target.closest('.notice-card');
  if (!card) return;
  const notice = currentNotices.find((n) => n.id === card.dataset.noticeId);
  renderDetail(notice);
});

// =============================================================================
// Multi-Select State Dropdown
// =============================================================================
const populateStateDropdown = (regionFilter = '') => {
  stateOptions.innerHTML = '';

  let statesToShow = ALL_STATES;
  if (regionFilter && REGION_STATES[regionFilter]) {
    statesToShow = REGION_STATES[regionFilter];
  }

  statesToShow.forEach(abbrev => {
    const count = stateData[abbrev] || 0;
    const name = STATE_NAMES[abbrev] || abbrev;
    const isSelected = selectedStates.includes(abbrev);

    const option = document.createElement('div');
    option.className = `multi-select-option${isSelected ? ' selected' : ''}`;
    option.dataset.value = abbrev;
    option.innerHTML = `
      <span class="option-checkbox">${isSelected ? '✓' : ''}</span>
      <span class="option-label">${abbrev} - ${name}</span>
      <span class="option-count">${count > 0 ? `(${count})` : ''}</span>
    `;
    stateOptions.appendChild(option);
  });
};

const updateStateDisplay = () => {
  if (selectedStates.length === 0) {
    stateDisplay.innerHTML = '<span class="multi-select-placeholder">All states</span>';
  } else if (selectedStates.length <= 3) {
    stateDisplay.innerHTML = selectedStates
      .map(s => `<span class="state-tag">${s}<button class="remove-state" data-state="${s}">×</button></span>`)
      .join('');
  } else {
    stateDisplay.innerHTML = `
      ${selectedStates.slice(0, 2).map(s => `<span class="state-tag">${s}<button class="remove-state" data-state="${s}">×</button></span>`).join('')}
      <span class="state-tag more">+${selectedStates.length - 2} more</span>
    `;
  }
  stateSelect.value = selectedStates.join(',');
};

const toggleStateSelection = (state) => {
  const idx = selectedStates.indexOf(state);
  if (idx === -1) {
    selectedStates.push(state);
  } else {
    selectedStates.splice(idx, 1);
  }
  populateStateDropdown(regionSelect.value);
  updateStateDisplay();
  applyFilters();
};

const initStateMultiSelect = () => {
  stateMultiSelect.addEventListener('click', (e) => {
    if (e.target.closest('.remove-state')) {
      const state = e.target.closest('.remove-state').dataset.state;
      toggleStateSelection(state);
      return;
    }
    if (e.target.closest('.multi-select-display')) {
      stateDropdown.classList.toggle('open');
    }
  });

  stateOptions.addEventListener('click', (e) => {
    const option = e.target.closest('.multi-select-option');
    if (option) {
      toggleStateSelection(option.dataset.value);
    }
  });

  stateSearch.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.multi-select-option').forEach(opt => {
      const text = opt.textContent.toLowerCase();
      opt.style.display = text.includes(query) ? '' : 'none';
    });
  });

  document.getElementById('select-all-states')?.addEventListener('click', () => {
    const region = regionSelect.value;
    const states = region && REGION_STATES[region] ? REGION_STATES[region] : ALL_STATES;
    selectedStates = [...states];
    populateStateDropdown(region);
    updateStateDisplay();
    applyFilters();
  });

  document.getElementById('clear-all-states')?.addEventListener('click', () => {
    selectedStates = [];
    populateStateDropdown(regionSelect.value);
    updateStateDisplay();
    applyFilters();
  });

  document.addEventListener('click', (e) => {
    if (!stateMultiSelect.contains(e.target)) {
      stateDropdown.classList.remove('open');
    }
  });
};

// =============================================================================
// Region Dropdown
// =============================================================================
const initRegionSelect = () => {
  regionSelect.innerHTML = '<option value="">All regions</option>';
  REGIONS.forEach(region => {
    const opt = document.createElement('option');
    opt.value = region;
    opt.textContent = region;
    regionSelect.appendChild(opt);
  });

  regionSelect.addEventListener('change', () => {
    selectedStates = [];
    populateStateDropdown(regionSelect.value);
    updateStateDisplay();
    applyFilters();
  });
};

// =============================================================================
// Custom State Select (for custom notices)
// =============================================================================
const initCustomStateSelect = () => {
  if (!customStateSelect) return;
  customStateSelect.innerHTML = '<option value="">Select state</option>';
  ALL_STATES.forEach(abbrev => {
    const opt = document.createElement('option');
    opt.value = abbrev;
    opt.textContent = `${abbrev} - ${STATE_NAMES[abbrev] || abbrev}`;
    customStateSelect.appendChild(opt);
  });
};

// =============================================================================
// Filter Controls
// =============================================================================
const initFilters = () => {
  refreshBtn.addEventListener('click', applyFilters);

  clearBtn.addEventListener('click', () => {
    regionSelect.value = '';
    selectedStates = [];
    populateStateDropdown('');
    updateStateDisplay();
    orgInput.value = '';
    sinceInput.value = '';
    scoreInput.value = 0;
    if (scoreReadout) scoreReadout.textContent = '0';
    limitInput.value = 100;
    applyFilters();
  });

  // Disable fetch button (data is static)
  fetchBtn.textContent = 'Data Updated Every 6 Hours';
  fetchBtn.disabled = true;
  fetchBtn.title = 'Data is automatically refreshed every 6 hours via GitHub Actions';

  // Live filter on input changes
  orgInput.addEventListener('input', debounce(applyFilters, 300));
  sinceInput.addEventListener('change', applyFilters);
  scoreInput.addEventListener('input', () => {
    if (scoreReadout) scoreReadout.textContent = scoreInput.value;
    applyFilters();
  });
  limitInput.addEventListener('change', applyFilters);
};

const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

// =============================================================================
// Projects (localStorage)
// =============================================================================
const PROJECTS_KEY = 'lni_projects';
const CUSTOM_NOTICES_KEY = 'lni_custom_notices';

const loadProjects = () => {
  try {
    projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
  } catch {
    projects = [];
  }
};

const saveProjects = () => {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

const loadCustomNotices = () => {
  try {
    customNotices = JSON.parse(localStorage.getItem(CUSTOM_NOTICES_KEY) || '[]');
  } catch {
    customNotices = [];
  }
};

const saveCustomNotices = () => {
  localStorage.setItem(CUSTOM_NOTICES_KEY, JSON.stringify(customNotices));
};

const saveNoticeToProject = (projectId, notice) => {
  const project = projects.find(p => p.id === projectId);
  if (!project) return;

  if (!project.notices) project.notices = [];
  if (project.notices.some(n => n.id === notice.id)) {
    alert('Notice already saved to this project.');
    return;
  }

  project.notices.push(notice);
  saveProjects();
  alert(`Saved to "${project.name}"`);
};

const renderProjects = () => {
  if (!projectsList) return;

  if (projects.length === 0) {
    projectsList.innerHTML = `<div class="empty-state">No projects yet. Create one to start organizing notices.</div>`;
    return;
  }

  projectsList.innerHTML = projects.map(p => `
    <div class="project-card" data-project-id="${p.id}" style="border-left-color: ${p.color}">
      <div class="project-card-header">
        <h4>${p.name}</h4>
        <span class="project-count">${(p.notices || []).length} notices</span>
      </div>
      <p class="project-desc">${p.description || 'No description'}</p>
    </div>
  `).join('');

  projectsList.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => openProjectDetail(card.dataset.projectId));
  });
};

const openProjectDetail = (projectId) => {
  const project = projects.find(p => p.id === projectId);
  if (!project || !projectDetailModal) return;

  currentProjectId = projectId;
  document.getElementById('project-detail-name').textContent = project.name;
  document.getElementById('project-detail-desc').textContent = project.description || 'No description';

  const noticesList = document.getElementById('project-notices-list');
  if ((project.notices || []).length === 0) {
    noticesList.innerHTML = `<div class="empty-state">No notices saved to this project yet.</div>`;
  } else {
    noticesList.innerHTML = project.notices.map(n => `
      <div class="project-notice-item">
        <span class="pill">${n.state}</span>
        <span>${n.employer_name || 'Unknown'}</span>
        <span>${formatDate(n.notice_date)}</span>
        <button class="remove-notice-btn" data-notice-id="${n.id}">Remove</button>
      </div>
    `).join('');
  }

  projectDetailModal.classList.add('active');
};

const initProjects = () => {
  loadProjects();
  renderProjects();

  newProjectBtn?.addEventListener('click', () => {
    currentProjectId = null;
    projectForm?.reset();
    projectModal?.classList.add('active');
  });

  projectForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('project-name')?.value?.trim();
    const description = document.getElementById('project-desc')?.value?.trim();
    const color = document.querySelector('.color-option.selected')?.dataset?.color || '#3b82f6';

    if (!name) return;

    if (currentProjectId) {
      const project = projects.find(p => p.id === currentProjectId);
      if (project) {
        project.name = name;
        project.description = description;
        project.color = color;
      }
    } else {
      projects.push({
        id: Date.now().toString(),
        name,
        description,
        color,
        notices: [],
        createdAt: new Date().toISOString()
      });
    }

    saveProjects();
    renderProjects();
    projectModal?.classList.remove('active');
  });

  document.getElementById('close-project-modal')?.addEventListener('click', () => {
    projectModal?.classList.remove('active');
  });

  document.getElementById('close-project-detail')?.addEventListener('click', () => {
    projectDetailModal?.classList.remove('active');
  });

  document.getElementById('delete-project-btn')?.addEventListener('click', () => {
    if (currentProjectId && confirm('Delete this project?')) {
      projects = projects.filter(p => p.id !== currentProjectId);
      saveProjects();
      renderProjects();
      projectDetailModal?.classList.remove('active');
    }
  });

  // Color picker
  colorPicker?.querySelectorAll('.color-option').forEach(opt => {
    opt.addEventListener('click', () => {
      colorPicker.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  // Project search
  projectSearch?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.project-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(query) ? '' : 'none';
    });
  });
};

// =============================================================================
// Custom Notices
// =============================================================================
const initCustomNotices = () => {
  loadCustomNotices();

  customNoticeForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const employer = document.getElementById('custom-employer')?.value?.trim();
    const state = customStateSelect?.value;
    const affected = parseInt(document.getElementById('custom-affected')?.value) || null;
    const noticeDate = document.getElementById('custom-notice-date')?.value || null;
    const effectiveDate = document.getElementById('custom-effective-date')?.value || null;

    if (!employer || !state) {
      alert('Employer name and state are required.');
      return;
    }

    const notice = {
      id: `custom-${Date.now()}`,
      employer_name: employer,
      state,
      employees_affected: affected,
      notice_date: noticeDate,
      effective_date: effectiveDate,
      nursing_score: 50,
      nursing_label: 'Custom',
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    customNotices.unshift(notice);
    saveCustomNotices();
    customNoticeForm.reset();
    applyFilters();
  });
};

// =============================================================================
// Map Highlighting
// =============================================================================
const updateMapHighlights = () => {
  document.querySelectorAll('.us-map path[data-state], .us-map circle[data-state]').forEach(path => {
    const state = path.dataset.state;
    path.classList.remove('state-selected', 'state-dimmed');

    if (selectedStates.length > 0) {
      if (selectedStates.includes(state)) {
        path.classList.add('state-selected');
      } else {
        path.classList.add('state-dimmed');
      }
    } else if (regionSelect.value && REGION_STATES[regionSelect.value]) {
      if (REGION_STATES[regionSelect.value].includes(state)) {
        path.classList.add('state-selected');
      } else {
        path.classList.add('state-dimmed');
      }
    }
  });
};

// =============================================================================
// Help Section
// =============================================================================
const initHelpSection = () => {
  const helpToggle = document.getElementById('help-toggle');
  const helpContent = document.getElementById('help-content');
  const toggleIcon = helpToggle?.querySelector('.help-toggle-icon');

  helpToggle?.addEventListener('click', () => {
    helpContent?.classList.toggle('open');
    if (toggleIcon) {
      toggleIcon.textContent = helpContent?.classList.contains('open') ? '−' : '+';
    }
  });
};

// =============================================================================
// Export Functions
// =============================================================================
const exportProjectCSV = () => {
  const project = projects.find(p => p.id === currentProjectId);
  if (!project || !project.notices?.length) {
    alert('No notices to export.');
    return;
  }

  const headers = ['ID', 'State', 'Employer', 'City', 'Notice Date', 'Employees Affected', 'Nursing Score'];
  const rows = project.notices.map(n => [
    n.id,
    n.state,
    `"${(n.employer_name || '').replace(/"/g, '""')}"`,
    `"${(n.city || '').replace(/"/g, '""')}"`,
    n.notice_date || '',
    n.employees_affected || '',
    n.nursing_score || 0
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadFile(csv, `${project.name.replace(/\s+/g, '_')}_notices.csv`, 'text/csv');
};

const exportProjectJSON = () => {
  const project = projects.find(p => p.id === currentProjectId);
  if (!project || !project.notices?.length) {
    alert('No notices to export.');
    return;
  }

  const json = JSON.stringify(project.notices, null, 2);
  downloadFile(json, `${project.name.replace(/\s+/g, '_')}_notices.json`, 'application/json');
};

const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

document.getElementById('export-project-csv')?.addEventListener('click', exportProjectCSV);
document.getElementById('export-project-json')?.addEventListener('click', exportProjectJSON);

// =============================================================================
// View Toggle (Map/Chart)
// =============================================================================
const initViewToggle = () => {
  const mapViewBtn = document.getElementById('map-view-btn');
  const chartViewBtn = document.getElementById('chart-view-btn');
  const usMap = document.getElementById('us-map');
  const barChart = document.getElementById('bar-chart');

  mapViewBtn?.addEventListener('click', () => {
    currentMapView = 'map';
    mapViewBtn.classList.add('active');
    chartViewBtn?.classList.remove('active');
    if (usMap) usMap.style.display = '';
    if (barChart) barChart.style.display = 'none';
  });

  chartViewBtn?.addEventListener('click', () => {
    currentMapView = 'chart';
    chartViewBtn.classList.add('active');
    mapViewBtn?.classList.remove('active');
    if (usMap) usMap.style.display = 'none';
    if (barChart) {
      barChart.style.display = '';
      renderBarChart();
    }
  });
};

const renderBarChart = () => {
  const barChart = document.getElementById('bar-chart');
  if (!barChart) return;

  const sortedStates = Object.entries(stateData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  if (sortedStates.length === 0) {
    barChart.innerHTML = '<div class="empty-state">No state data available.</div>';
    return;
  }

  const maxCount = sortedStates[0][1];

  barChart.innerHTML = `
    <div class="bar-chart-title">Top 20 States by Notice Count</div>
    <div class="bar-chart-bars">
      ${sortedStates.map(([state, count]) => `
        <div class="bar-row">
          <span class="bar-label">${state}</span>
          <div class="bar-container">
            <div class="bar" style="width: ${(count / maxCount) * 100}%"></div>
          </div>
          <span class="bar-value">${count}</span>
        </div>
      `).join('')}
    </div>
  `;
};

// =============================================================================
// App Initialization
// =============================================================================
const initApp = async () => {
  if (!checkAuth()) return;

  setLoading('Loading data...');

  // Initialize UI components
  initRegionSelect();
  initStateMultiSelect();
  initCustomStateSelect();
  initFilters();
  initProjects();
  initCustomNotices();
  initHelpSection();
  initViewToggle();
  await initWeatherMap();

  // Load data
  await Promise.all([
    loadMetadata(),
    loadStates()
  ]);

  await loadAllNotices();

  // Populate state dropdown and apply initial filters
  populateStateDropdown('');
  applyFilters();
};

// Start the app if already authenticated
if (checkAuth()) {
  initApp();
}
