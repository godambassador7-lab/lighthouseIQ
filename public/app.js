// Login elements
const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
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
const mapTargetModeBtn = document.getElementById('map-target-mode-btn');
const mapTargetStateBtn = document.getElementById('map-target-state-btn');
const mapFactorsBtn = document.getElementById('map-factors-btn');
const mapFactorsPanel = document.getElementById('map-factors-panel');
const mapFactorsClose = document.getElementById('map-factors-close');
const mapFactorsList = document.getElementById('map-factors-list');
const mapFactorsSubtitle = document.getElementById('map-factors-subtitle');
const mapScopeHealthcareBtn = document.getElementById('map-scope-healthcare');
const mapScopeAllBtn = document.getElementById('map-scope-all');
const mapScopeLabel = document.getElementById('map-scope-label');
const alertsList = document.getElementById('alerts-list');
const heatmapList = document.getElementById('heatmap-list');
const talentList = document.getElementById('talent-list');
const employerList = document.getElementById('employer-list');
const specialtySurplusList = document.getElementById('specialty-surplus-list');
const strikeList = document.getElementById('strike-list');
const strikeFooter = document.getElementById('strike-footer');
const strikeCountLabel = document.getElementById('strike-count-label');
const strikeLiveBadge = document.getElementById('strike-live-badge');
const strikeStateFilter = document.getElementById('strike-state-filter');
const strikeDateFilter = document.getElementById('strike-date-filter');
const strikeStatusFilter = document.getElementById('strike-status-filter');
const strikeConfidenceFilter = document.getElementById('strike-confidence-filter');
const strikeModeFilter = document.getElementById('strike-mode-filter');
const strikeSourceNote = document.querySelector('.strike-source-note');
const forecastBeds = document.getElementById('forecast-beds');
const forecastSetting = document.getElementById('forecast-setting');
const forecastHorizon = document.getElementById('forecast-horizon');
const forecastOutput = document.getElementById('forecast-output');
const taWeeklyRhythm = document.getElementById('ta-weekly-rhythm');
const taResetMetricsBtn = document.getElementById('ta-reset-metrics');
const taInputOutreach = document.getElementById('ta-input-outreach');
const taInputResponses = document.getElementById('ta-input-responses');
const taInputScreens = document.getElementById('ta-input-screens');
const taInputOffers = document.getElementById('ta-input-offers');
const taInputAccepted = document.getElementById('ta-input-accepted');
const taInputHires = document.getElementById('ta-input-hires');
const taInputSpend = document.getElementById('ta-input-spend');
const taInputAgencySaved = document.getElementById('ta-input-agency-saved');
const taKpiSla = document.getElementById('ta-kpi-sla');
const taKpiResponse = document.getElementById('ta-kpi-response');
const taKpiScreen = document.getElementById('ta-kpi-screen');
const taKpiAcceptance = document.getElementById('ta-kpi-acceptance');
const taKpiCost = document.getElementById('ta-kpi-cost');
const taKpiAgency = document.getElementById('ta-kpi-agency');
const taOwnerFilter = document.getElementById('ta-owner-filter');
const taSpecialtyFilter = document.getElementById('ta-specialty-filter');
const taActionList = document.getElementById('ta-action-list');
const taCampaignSignal = document.getElementById('ta-campaign-signal');
const taCampaignSpecialty = document.getElementById('ta-campaign-specialty');
const taCampaignTemplate = document.getElementById('ta-campaign-template');
const taRolloutList = document.getElementById('ta-rollout-list');

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
const programsExportCsv = document.getElementById('programs-export-csv');
const programsExportExcel = document.getElementById('programs-export-excel');
const programsExportPdf = document.getElementById('programs-export-pdf');
const programsLoading = document.getElementById('programs-loading');
const programsProgressBar = document.getElementById('programs-progress-bar');
const programsProgressText = document.getElementById('programs-progress-text');
const openStateBeaconBtn = document.getElementById('open-state-beacon');
const stateBeaconModal = document.getElementById('state-beacon-modal');
const stateBeaconCloseBtn = document.getElementById('state-beacon-close');
const stateBeaconCloseFooter = document.getElementById('state-beacon-close-footer');
const stateBeaconHomeSelect = document.getElementById('state-beacon-home');
const stateBeaconStateSelect = document.getElementById('state-beacon-state');
const stateBeaconUseSelection = document.getElementById('state-beacon-use-selection');
const stateBeaconMeta = document.getElementById('state-beacon-meta');
const stateBeaconHospitals = document.getElementById('state-beacon-hospitals');
const stateBeaconHospitalsAll = document.getElementById('state-beacon-hospitals-all');
const stateBeaconClinics = document.getElementById('state-beacon-clinics');
const stateBeaconNews = document.getElementById('state-beacon-news');
const stateBeaconCompetition = document.getElementById('state-beacon-competition');
const stateBeaconScript = document.getElementById('state-beacon-script');
const stateBeaconPipeline = document.getElementById('state-beacon-pipeline');
const stateBeaconCandidates = document.getElementById('state-beacon-candidates');
const stateBeaconCandidateTable = document.getElementById('state-beacon-candidate-table');
const stateBeaconPros = document.getElementById('state-beacon-pros');
const stateBeaconCons = document.getElementById('state-beacon-cons');
const stateBeaconProsTitle = document.getElementById('state-beacon-pros-title');
const stateBeaconConsTitle = document.getElementById('state-beacon-cons-title');
const stateBeaconProsToggleTarget = document.getElementById('state-beacon-pros-toggle-target');
const stateBeaconProsToggleHome = document.getElementById('state-beacon-pros-toggle-home');
const stateBeaconAttractions = document.getElementById('state-beacon-attractions');
const stateBeaconDrawbacks = document.getElementById('state-beacon-drawbacks');
const stateBeaconSave = document.getElementById('state-beacon-save');
const stateBeaconObjections = document.getElementById('state-beacon-objections');
const stateBeaconSpecialty = document.getElementById('state-beacon-specialty');
const stateBeaconExperience = document.getElementById('state-beacon-experience');
const stateBeaconShift = document.getElementById('state-beacon-shift');
const stateBeaconTargetPay = document.getElementById('state-beacon-target-pay');
const stateBeaconTimeline = document.getElementById('state-beacon-timeline');
const stateBeaconLicense = document.getElementById('state-beacon-license');
const stateBeaconExportJson = document.getElementById('state-beacon-export-json');
const stateBeaconExportCsv = document.getElementById('state-beacon-export-csv');
const stateBeaconExportExcel = document.getElementById('state-beacon-export-excel');
const stateBeaconExportPdf = document.getElementById('state-beacon-export-pdf');

const homeStateModal = document.getElementById('home-state-modal');
const homeStateCloseBtn = document.getElementById('home-state-close');
const homeStateCloseFooter = document.getElementById('home-state-close-footer');
const homeStateOpenBeacon = document.getElementById('home-state-open-beacon');
const homeStateExportCsv = document.getElementById('home-state-export-csv');
const homeStateExportExcel = document.getElementById('home-state-export-excel');
const homeStateExportPdf = document.getElementById('home-state-export-pdf');
const homeStateSelected = document.getElementById('home-state-selected');
const homeStateMeta = document.getElementById('home-state-meta');
const homeStateHospitals = document.getElementById('home-state-hospitals');
const homeStateNews = document.getElementById('home-state-news');
const homeStateCompetition = document.getElementById('home-state-competition');
const homeStatePipeline = document.getElementById('home-state-pipeline');
const homeStatePros = document.getElementById('home-state-pros');
const homeStateCons = document.getElementById('home-state-cons');
const openHomeStateBtn = document.getElementById('open-home-state');
const targetStateModal = document.getElementById('target-state-modal');
const targetStateCloseBtn = document.getElementById('target-state-close');
const targetStateCloseFooter = document.getElementById('target-state-close-footer');
const targetStateOpenBeacon = document.getElementById('target-state-open-beacon');
const openTargetStateBtn = document.getElementById('open-target-state');
const targetStateExportToggle = document.getElementById('target-state-export-toggle');
const targetStateExportMenu = document.getElementById('target-state-export-menu');
const targetStateSelect = document.getElementById('target-state-select');
const openMasterExportBtn = document.getElementById('open-master-export');
const masterExportModal = document.getElementById('master-export-modal');
const masterExportCloseBtn = document.getElementById('master-export-close');
const masterExportCloseFooter = document.getElementById('master-export-close-footer');
const masterExportStateSelect = document.getElementById('master-export-state');
const masterExportMetroCount = document.getElementById('master-export-metros');
const masterExportWarnCount = document.getElementById('master-export-warn');
const masterExportRuralCount = document.getElementById('master-export-rural');
const masterExportButtons = document.getElementById('master-export-buttons');
const masterExportToggle = document.getElementById('master-export-toggle');
const masterExportMenu = document.getElementById('master-export-menu');
const masterExportProgressBar = document.getElementById('master-export-progress-bar');
const masterExportProgressLabel = document.getElementById('master-export-progress-label');
const targetStateName = document.getElementById('target-state-name');
const targetStateAbbr = document.getElementById('target-state-abbr');
const targetStateStatHospitals = document.getElementById('target-state-stat-hospitals');
const targetStateStatMetros = document.getElementById('target-state-stat-metros');
const targetStateStatPrograms = document.getElementById('target-state-stat-programs');
const targetStateStatCompact = document.getElementById('target-state-stat-compact');
const targetStateMetroMap = document.getElementById('target-state-metro-map');
const targetStateDetailPlaceholder = document.getElementById('target-state-detail-placeholder');
const targetStatePlaceholderText = document.getElementById('target-state-placeholder-text');
const targetStateDetailContent = document.getElementById('target-state-detail-content');
const targetStateMetroName = document.getElementById('target-state-metro-name');
const targetStateMetroBadge = document.getElementById('target-state-metro-badge');
const targetStateHospitalCount = document.getElementById('target-state-hospital-count');
const targetStateMetroHospitals = document.getElementById('target-state-metro-hospitals');
const targetStateMetroCompetition = document.getElementById('target-state-metro-competition');
const targetStateMetroSalary = document.getElementById('target-state-metro-salary');
const targetStateMetroFactors = document.getElementById('target-state-metro-factors');

let currentTargetStateMetro = null;
const TARGET_STATE_DEFAULT = 'KY';

const getTargetStateSelection = () => {
  const preferred = stateBeaconStateSelect?.value
    || targetStateSelect?.value
    || TARGET_STATE_DEFAULT;
  return ALL_STATES.includes(preferred) ? preferred : TARGET_STATE_DEFAULT;
};

let currentNotices = [];
let customNotices = []; // User-added notices
let projects = []; // User projects
let currentProjectId = null; // For editing
let stateData = {};
let stateDataAll = {};
let stateDataHealthcare = {};
let mapStateData = {};
let apiHasDb = true;
let isFetching = false;
let currentMapView = 'map'; // 'map' or 'chart'
let selectedStates = []; // Multi-select states
let mapScope = 'healthcare'; // 'healthcare' or 'all'
const NOTICE_MAX_COUNT = 100;
const NOTICE_WINDOW_COUNT = 5;
let calibrationStats = { minCount: 0, maxCount: 0 };
let nursingPrograms = [];
let programsMeta = { lastUpdated: null, sources: [] };
let programsLoaded = false;
let programsModuleInitialized = false;
let programsRefreshPrompted = false;
let stateBeaconData = null;
let stateBeaconLoaded = false;
let stateBeaconLoadedAt = 0;
let stateBeaconInputs = null;
let stateNewsData = null;
let stateNewsLoaded = false;
let stateNewsLoadedAt = 0;
const STATE_BEACON_REFRESH_MS = 6 * 60 * 60 * 1000; // refresh every 6 hours
const STATE_BEACON_DEFAULT = 'FL';
const STATE_BEACON_HOME_DEFAULT = 'IN';
const STATE_BEACON_PROS_MODE_TARGET = 'target_vs_home';
const STATE_BEACON_PROS_MODE_HOME = 'home_vs_target';
let stateBeaconProsMode = STATE_BEACON_PROS_MODE_TARGET;
const STATE_BEACON_INPUTS_BASE_KEY = 'lni_state_beacon_inputs';
const STATE_BEACON_NOTES_BASE_KEY = 'lni_state_beacon_notes';
const MAP_HOME_STATE_BASE_KEY = 'lighthouseiq_map_home_state';
const MAP_TARGET_STATE_BASE_KEY = 'lighthouseiq_map_target_state';
let lastNoticeWindowCount = 0;
let noticeWindowRaf = null;
let isMapTargetMode = false;
const TA_METRICS_BASE_KEY = 'lni_ta_metrics_v1';
const TA_ACTIONS_BASE_KEY = 'lni_ta_actions_v1';
const TA_ROLLOUT_BASE_KEY = 'lni_ta_rollout_v1';
let taMetrics = {
  outreach: 0,
  responses: 0,
  screens: 0,
  offers: 0,
  accepted: 0,
  hires: 0,
  spend: 0,
  agencySaved: 0
};
let taActions = [];
let taRolloutState = {};
let latestTalentOpportunities = [];
let specialtySurplusMode = 'unavailable';
let latestTalentUpdatedAt = null;
let strikeAlertsData = [];
let strikeAlertsMeta = { lastUpdated: null, sources: [], sourceHealth: [] };
let recruitmentIntel = null;
let strategicData = null;
let relocationData = null;
let freeMarketSignals = null;
let marketReadinessIntegration = null;
let marketRequiredMetrics = null;
let facilityMarketFeatures = null;

const SPECIALTY_SURPLUS_MAX_STALE_HOURS = 24;
const SPECIALTY_SURPLUS_MIN_BUCKET_SAMPLES = 3;

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
const SESSION_USER_KEY = 'lni_user';
const PROJECTS_BASE_KEY = 'lni_projects';
const CUSTOM_NOTICES_BASE_KEY = 'lni_custom_notices';

const getSessionUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_USER_KEY) || 'null');
  } catch {
    return null;
  }
};

const getUserStorageScope = () => {
  const user = getSessionUser();
  if (user?.id) return String(user.id);
  if (user?.email) return String(user.email).toLowerCase();
  return 'anonymous';
};

const scopedStorageKey = (baseKey) => `${baseKey}:${getUserStorageScope()}`;

const checkAuth = () => sessionStorage.getItem(SESSION_KEY) === 'true';

const clearAuthState = () => {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_USER_KEY);
  loginOverlay.classList.remove('hidden');
};

const getCsrfToken = () => {
  const match = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('csrf_token='));
  return match ? decodeURIComponent(match.split('=')[1]) : '';
};

let refreshPromise = null;
let authApiReachable = true;
const STATIC_PASSCODE = 'IUH126';
const staticPasscodeAllowed = (passcode) => String(passcode || '').trim() === STATIC_PASSCODE;
const API_BASE_STORAGE_KEY = 'lni_api_base';

const refreshSession = async () => {
  if (!authApiReachable) return false;
  if (refreshPromise) return refreshPromise;
  refreshPromise = fetchWithApiBaseFallback('/auth/refresh', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-CSRF-Token': getCsrfToken()
    }
  })
    .then((res) => {
      if (res.status === 404) {
        authApiReachable = false;
        return false;
      }
      return res.ok;
    })
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};

const readFieldValue = (field) => {
  if (!field || typeof field !== 'object' || !('value' in field)) return '';
  const raw = field.value;
  return raw === undefined || raw === null ? '' : String(raw);
};

const setLoginError = (message) => {
  if (!loginError) return;
  loginError.textContent = message || '';
};

const markLoginSuccess = (user) => {
  sessionStorage.setItem(SESSION_KEY, 'true');
  if (user && typeof user === 'object') {
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(SESSION_USER_KEY);
  }
  loginOverlay.classList.add('hidden');
  if (passwordInput) passwordInput.value = '';
  setLoginError('');
  initApp();
};

const handleLogin = async (e) => {
  e.preventDefault();
  const form = e?.currentTarget || loginForm || document.getElementById('login-form');
  const emailField = emailInput
    || form?.querySelector('#email-input')
    || form?.querySelector('input[type="email"]');
  const passwordField = passwordInput
    || form?.querySelector('#password-input')
    || form?.querySelector('input[type="password"]');
  const legacyPasscodeField = form?.querySelector('#passcode-input');
  const email = readFieldValue(emailField).trim().toLowerCase();
  const password = readFieldValue(passwordField) || readFieldValue(legacyPasscodeField);
  const loginBtn = form?.querySelector('button[type="submit"]');

  if (!email || !password) {
    setLoginError('Please enter your work email and passcode.');
    return;
  }

  // Disable button during request
  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.textContent = 'Verifying...';
  }

  try {
    const response = await fetchWithApiBaseFallback('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    if (response.status === 404) {
      authApiReachable = false;
      if (staticPasscodeAllowed(password)) {
        markLoginSuccess({ id: 'static-passcode', email, role: 'admin' });
        return;
      }
      setLoginError('Invalid email or passcode.');
      if (loginError) {
        loginError.classList.remove('shake');
        void loginError.offsetWidth;
        loginError.classList.add('shake');
      }
      if (passwordInput) passwordInput.value = '';
      passwordInput?.focus();
      return;
    }

    authApiReachable = true;
    const data = await response.json().catch(() => ({}));

    if (data.success) {
      markLoginSuccess(data.user);
    } else {
      setLoginError(data.error || 'Invalid email or password.');
      if (loginError) {
        loginError.classList.remove('shake');
        void loginError.offsetWidth; // Trigger reflow for animation
        loginError.classList.add('shake');
      }
      if (passwordInput) passwordInput.value = '';
      passwordInput?.focus();
    }
  } catch (err) {
    authApiReachable = false;
    if (staticPasscodeAllowed(password)) {
      markLoginSuccess({ id: 'static-passcode', email, role: 'admin' });
      return;
    }
    setLoginError('Connection error. Please try again.');
  } finally {
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Access Dashboard';
    }
  }
};

// Initialize login
const bootstrapAuth = async () => {
  try {
    const res = await fetchWithApiBaseFallback('/auth/session', { credentials: 'include' });
    if (res.ok) {
      authApiReachable = true;
      const data = await res.json().catch(() => ({}));
      markLoginSuccess(data.user);
      return;
    }
    if (res.status === 404) {
      authApiReachable = false;
    }
  } catch {
    authApiReachable = false;
  }
  clearAuthState();
  emailInput?.focus();
};

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

const HEALTHCARE_KEYWORDS = [
  'hospital',
  'healthcare',
  'health care',
  'medical',
  'clinic',
  'nursing',
  'rehab',
  'rehabilitation',
  'hospice',
  'dialysis',
  'behavioral health',
  'mental health',
  'urgent care',
  'surgery',
  'surgical',
  'home health',
  'assisted living',
  'skilled nursing',
  'long term care'
];

const isHealthcareNotice = (notice) => {
  if (notice.isCustom) return true;
  const naicsRaw = notice.naics ?? notice.naics_code ?? '';
  const naics = String(naicsRaw).trim();
  if (naics.startsWith('62')) return true;
  const haystack = [
    notice.employer_name,
    notice.employerName,
    notice.facility_name,
    notice.parent_system,
    notice.industry,
    notice.business_name
  ].filter(Boolean).join(' ').toLowerCase();
  return HEALTHCARE_KEYWORDS.some(keyword => haystack.includes(keyword));
};

const filterNoticesByScope = (notices) => {
  let out = mapScope === 'healthcare' ? notices.filter(isHealthcareNotice) : notices;
  // Exclude hotel / hospitality employers (not nursing-relevant)
  out = out.filter(n => {
    const name = (n.employer_name || '').toLowerCase();
    return !name.includes('hotel') && !name.includes('hospitality');
  });
  return out;
};

const getNoticeDateValue = (notice) => {
  const raw = notice.notice_date || notice.noticeDate || notice.retrieved_at || notice.createdAt || notice.retrievedAt;
  if (!raw) return 0;
  const ts = new Date(raw).getTime();
  return Number.isFinite(ts) ? ts : 0;
};

const sortNoticesByNewest = (notices) => (
  notices.slice().sort((a, b) => getNoticeDateValue(b) - getNoticeDateValue(a))
);

const refreshNoticeListWindow = (count = lastNoticeWindowCount) => {
  if (!noticeList) return;
  lastNoticeWindowCount = count;
  if (!count) {
    noticeList.style.maxHeight = '';
    noticeList.classList.remove('windowed');
    return;
  }

  if (noticeWindowRaf) {
    cancelAnimationFrame(noticeWindowRaf);
  }

  noticeWindowRaf = requestAnimationFrame(() => {
    const firstCard = noticeList.querySelector('.notice-card');
    if (!firstCard) {
      noticeWindowRaf = requestAnimationFrame(() => refreshNoticeListWindow(count));
      return;
    }

    const cardHeight = firstCard.getBoundingClientRect().height;
    if (!Number.isFinite(cardHeight) || cardHeight <= 0) {
      noticeWindowRaf = requestAnimationFrame(() => refreshNoticeListWindow(count));
      return;
    }

    const styles = getComputedStyle(noticeList);
    const gapValue = styles.rowGap || styles.gap || '0';
    const gap = Number.parseFloat(gapValue);
    const safeGap = Number.isFinite(gap) ? gap : 0;
    const windowCount = Math.min(NOTICE_WINDOW_COUNT, count);
    const windowHeight = (cardHeight * windowCount) + (safeGap * Math.max(0, windowCount - 1));
    noticeList.style.maxHeight = `${Math.ceil(windowHeight)}px`;
    noticeList.classList.add('windowed');
  });
};

const escapeHtml = (value) => {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const buildCsv = (headers, rows) => (
  [headers.map(csvEscape).join(','), ...rows.map(row => row.map(csvEscape).join(','))].join('\n')
);

const buildExportTableHtml = (headers, rows) => `
  <table>
    <thead>
      <tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${rows.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell ?? '')}</td>`).join('')}</tr>`).join('')}
    </tbody>
  </table>
`;

const buildExportHtml = ({ title, meta = [], headers = [], rows = [] } = {}) => `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(title || 'Export')}</title>
      <style>
        body { font-family: "Segoe UI", Arial, sans-serif; padding: 24px; color: #0f172a; }
        h1 { margin: 0 0 8px; font-size: 22px; }
        .meta { margin: 0 0 16px; font-size: 12px; color: #475569; }
        .meta p { margin: 2px 0; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #cbd5f5; padding: 6px 8px; text-align: left; vertical-align: top; }
        th { background: #eff6ff; text-transform: uppercase; letter-spacing: 0.04em; font-size: 11px; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(title || 'Export')}</h1>
      ${meta.length ? `<div class="meta">${meta.map(item => `<p>${escapeHtml(item)}</p>`).join('')}</div>` : ''}
      ${headers.length ? buildExportTableHtml(headers, rows) : ''}
    </body>
  </html>
`;

const downloadExcel = ({ title, meta, headers, rows, filename }) => {
  const html = buildExportHtml({ title, meta, headers, rows });
  downloadFile(html, filename, 'application/vnd.ms-excel');
};

const openPdfExport = ({ title, meta, headers, rows }) => {
  const pdfWindow = window.open('', '_blank');
  if (!pdfWindow) {
    alert('Pop-up blocked. Please allow pop-ups to export PDF.');
    return;
  }
  pdfWindow.document.write(buildExportHtml({ title, meta, headers, rows }));
  pdfWindow.document.close();
  pdfWindow.focus();
  setTimeout(() => {
    pdfWindow.print();
  }, 250);
};

const showExportToast = (message) => {
  if (typeof showMapToast === 'function') {
    showMapToast(message, 2200);
    return;
  }
  if (!mapToast) return;
  mapToast.textContent = message;
  mapToast.classList.add('visible');
  setTimeout(() => mapToast.classList.remove('visible'), 2200);
};

const getStateBeaconInputs = () => {
  if (stateBeaconInputs) return stateBeaconInputs;
  try {
    const stored = localStorage.getItem(scopedStorageKey(STATE_BEACON_INPUTS_BASE_KEY));
    stateBeaconInputs = stored ? JSON.parse(stored) : null;
  } catch {
    stateBeaconInputs = null;
  }
  return stateBeaconInputs;
};

const saveStateBeaconInputs = (inputs) => {
  stateBeaconInputs = inputs;
  try {
    localStorage.setItem(scopedStorageKey(STATE_BEACON_INPUTS_BASE_KEY), JSON.stringify(inputs));
  } catch {
    // ignore
  }
};

const getStateBeaconNotes = () => {
  try {
    const stored = localStorage.getItem(scopedStorageKey(STATE_BEACON_NOTES_BASE_KEY));
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveStateBeaconNotes = (notes) => {
  try {
    localStorage.setItem(scopedStorageKey(STATE_BEACON_NOTES_BASE_KEY), JSON.stringify(notes));
  } catch {
    // ignore
  }
};

const replaceTokens = (template, tokens) => (
  template.replace(/\{(\w+)\}/g, (_, key) => tokens[key] ?? '')
);

const isMajorSystemNotice = (notice, majorSystems) => {
  if (!majorSystems || !majorSystems.length) return true;
  const employer = String(notice.employer_name || notice.employerName || '').toLowerCase();
  const system = String(notice.parent_system || '').toLowerCase();
  return majorSystems.some((name) => {
    const target = String(name).toLowerCase();
    return employer.includes(target) || system.includes(target);
  });
};

const filterNoticesByMajorSystems = (notices, majorSystems) => (
  majorSystems && majorSystems.length
    ? notices.filter((notice) => isMajorSystemNotice(notice, majorSystems))
    : notices
);

const getStateNotices = (state) => currentNotices.filter((notice) => notice.state === state);

const groupBy = (items, keyFn) => {
  const map = new Map();
  items.forEach((item) => {
    const key = keyFn(item);
    if (!key) return;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return map;
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
  if (mapScope === 'healthcare') params.set('recruiterFocus', '1');
  if (orgInput.value.trim()) params.set('org', orgInput.value.trim());
  if (regionSelect.value) params.set('region', regionSelect.value);
  // Handle multiple selected states
  if (selectedStates.length > 0) {
    params.set('state', selectedStates.join(','));
  }
  if (sinceInput.value) params.set('since', sinceInput.value);
  if (scoreInput.value) params.set('minScore', scoreInput.value);
  params.set('order', 'recent');
  if (!limitInput.value || Number(limitInput.value) <= 0) {
    params.set('limit', 'all');
  } else {
    params.set('limit', limitInput.value);
  }
  return params.toString();
};

let staticDataMode = false;
let staticNoticesCache = null;
let staticStatesCache = null;
const API_ROUTE_PATTERN = /^\/(health|states|notices|fetch)(\?|$)/i;
const API_OR_AUTH_ROUTE_PATTERN = /^\/(auth\/|health|states|notices|fetch|insights\/)(\?|$)/i;

const unique = (values) => Array.from(new Set(values.filter(Boolean)));

const getConfiguredApiBase = () => {
  const host = window.location.hostname;
  const isVercelHost = host.endsWith('vercel.app');
  try {
    const qsBase = new URLSearchParams(window.location.search).get('apiBase');
    if (qsBase) {
      localStorage.setItem(API_BASE_STORAGE_KEY, qsBase);
      return qsBase;
    }
  } catch {
    // ignore query parsing/storage failures
  }
  if (typeof window !== 'undefined' && typeof window.__LNI_API_BASE__ === 'string' && window.__LNI_API_BASE__.trim()) {
    return window.__LNI_API_BASE__.trim();
  }
  try {
    const persisted = localStorage.getItem(API_BASE_STORAGE_KEY);
    if (persisted && persisted.trim()) {
      const normalized = persisted.trim();
      if (isVercelHost && /\/\/api\./i.test(normalized)) {
        localStorage.removeItem(API_BASE_STORAGE_KEY);
        return '';
      }
      return normalized;
    }
  } catch {
    // ignore storage failures
  }
  return '';
};

const getApiBaseCandidates = () => {
  const configured = getConfiguredApiBase();
  const host = window.location.hostname;
  const protocol = window.location.protocol;
  const candidates = [
    '',
    configured
  ];
  if (host && !host.startsWith('api.') && !host.endsWith('vercel.app')) {
    candidates.push(`${protocol}//api.${host}`);
  }
  return unique(candidates.map((v) => String(v || '').trim().replace(/\/$/, '')));
};

const buildRequestUrl = (path, base = '') => {
  const input = String(path || '');
  if (/^https?:\/\//i.test(input)) return input;
  if (!base) return input;
  const normalizedPath = input.startsWith('/') ? input : `/${input}`;
  return `${base}${normalizedPath}`;
};

const fetchWithApiBaseFallback = async (path, options = {}) => {
  const input = String(path || '');
  if (!API_OR_AUTH_ROUTE_PATTERN.test(input) || /^https?:\/\//i.test(input)) {
    return fetch(input, options);
  }

  const bases = getApiBaseCandidates();
  let lastResponse = null;
  let lastError = null;
  for (const base of bases) {
    const url = buildRequestUrl(input, base);
    try {
      const res = await fetch(url, options);
      if (res.status === 404) {
        lastResponse = res;
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
    }
  }
  if (lastResponse) return lastResponse;
  if (lastError) throw lastError;
  return fetch(input, options);
};

const isApiRoute = (path) => API_ROUTE_PATTERN.test(String(path || ''));

const noticeEventDateMs = (notice) => {
  const raw = notice?.notice_date || notice?.effective_date || notice?.retrieved_at || '';
  const ms = Date.parse(raw);
  return Number.isFinite(ms) ? ms : -1;
};

const parseLimit = (rawLimit) => {
  if (!rawLimit || rawLimit === 'all') return null;
  const n = Number(rawLimit);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
};

const loadStaticNotices = async () => {
  if (Array.isArray(staticNoticesCache)) return staticNoticesCache;
  const res = await fetch('/data/notices.json', { credentials: 'omit' });
  if (!res.ok) throw new Error(`Static notices unavailable: ${res.status}`);
  const data = await res.json();
  staticNoticesCache = Array.isArray(data?.notices) ? data.notices : [];
  return staticNoticesCache;
};

const loadStaticStates = async () => {
  if (Array.isArray(staticStatesCache)) return staticStatesCache;
  const res = await fetch('/data/states.json', { credentials: 'omit' });
  if (!res.ok) throw new Error(`Static states unavailable: ${res.status}`);
  const data = await res.json();
  staticStatesCache = Array.isArray(data?.states) ? data.states : [];
  return staticStatesCache;
};

const buildStateCountsFromNotices = (notices) => {
  const counts = new Map();
  notices.forEach((n) => {
    const st = String(n?.state || '').trim().toUpperCase();
    if (!st) return;
    counts.set(st, (counts.get(st) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => a.state.localeCompare(b.state));
};

const applyStaticNoticesQuery = (allNotices, params) => {
  let notices = Array.isArray(allNotices) ? [...allNotices] : [];
  const recruiterFocus = params.get('recruiterFocus');
  const org = String(params.get('org') || '').trim().toLowerCase();
  const region = String(params.get('region') || '').trim();
  const stateParam = String(params.get('state') || '').trim();
  const since = String(params.get('since') || '').trim();
  const minScore = Number(params.get('minScore') || 0);
  const order = String(params.get('order') || '').trim().toLowerCase();
  const limit = parseLimit(params.get('limit'));

  if (recruiterFocus === '1') {
    notices = notices.filter(isHealthcareNotice);
  }
  if (org) {
    notices = notices.filter((n) => String(n?.employer_name || '').toLowerCase().includes(org));
  }
  if (region && REGION_STATES[region]) {
    const allowed = new Set(REGION_STATES[region]);
    notices = notices.filter((n) => allowed.has(String(n?.state || '').toUpperCase()));
  }
  if (stateParam) {
    const selected = new Set(stateParam.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean));
    notices = notices.filter((n) => selected.has(String(n?.state || '').toUpperCase()));
  }
  if (since) {
    const sinceMs = Date.parse(since);
    if (Number.isFinite(sinceMs)) {
      notices = notices.filter((n) => noticeEventDateMs(n) >= sinceMs);
    }
  }
  if (Number.isFinite(minScore) && minScore > 0) {
    notices = notices.filter((n) => Number(n?.nursing_score || 0) >= minScore);
  }
  if (order === 'recent') {
    notices.sort((a, b) => noticeEventDateMs(b) - noticeEventDateMs(a));
  }
  if (limit) notices = notices.slice(0, limit);
  return notices;
};

const fetchStaticFallback = async (path) => {
  const [base, queryString = ''] = String(path || '').split('?');
  const params = new URLSearchParams(queryString);
  if (base === '/health') {
    return { ok: true, db: false, mode: 'static' };
  }
  if (base === '/fetch') {
    return { success: false, error: 'Live fetch unavailable in static mode' };
  }
  if (base === '/notices') {
    const allNotices = await loadStaticNotices();
    return { notices: applyStaticNoticesQuery(allNotices, params) };
  }
  if (base === '/states') {
    if (params.get('recruiterFocus') === '1') {
      const allNotices = await loadStaticNotices();
      return { states: buildStateCountsFromNotices(allNotices.filter(isHealthcareNotice)) };
    }
    try {
      const staticStates = await loadStaticStates();
      if (staticStates.length) return { states: staticStates };
    } catch {
      // fallback to computed state counts from notices below
    }
    const allNotices = await loadStaticNotices();
    return { states: buildStateCountsFromNotices(allNotices) };
  }
  throw new Error(`No static fallback for ${base}`);
};

const fetchJson = async (path, opts = {}) => {
  if (staticDataMode && isApiRoute(path)) {
    return fetchStaticFallback(path);
  }
  const method = (opts.method || 'GET').toUpperCase();
  const headers = {
    ...(opts.headers || {})
  };
  if (method !== 'GET' && method !== 'HEAD') {
    headers['X-CSRF-Token'] = getCsrfToken();
  }
  const res = await fetchWithApiBaseFallback(path, {
    credentials: 'include',
    headers,
    ...opts
  });
  if (res.status === 401) {
    const refreshed = await refreshSession();
    if (refreshed) {
      const retry = await fetchWithApiBaseFallback(path, { credentials: 'include', headers, ...opts });
      if (!retry.ok) throw new Error(`Request failed: ${retry.status}`);
      return retry.json();
    }
    clearAuthState();
    throw new Error('Session expired. Please log in again.');
  }
  if (!res.ok) {
    if (res.status === 404 && isApiRoute(path)) {
      staticDataMode = true;
      return fetchStaticFallback(path);
    }
    throw new Error(`Request failed: ${res.status}`);
  }
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

const scoreFromStateMetric = (state, metricGetter, invert = false, defaultScore = 5) => {
  const allValues = ALL_STATES
    .map((abbr) => Number(metricGetter(abbr)))
    .filter((value) => Number.isFinite(value));
  if (!allValues.length) return defaultScore;
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  if (maxValue <= minValue) return defaultScore;
  const raw = Number(metricGetter(state));
  if (!Number.isFinite(raw)) return defaultScore;
  const ratio = (raw - minValue) / (maxValue - minValue);
  const value = invert ? 1 - ratio : ratio;
  return clampScore(Math.round(value * 100) / 10);
};

const getCalibrationSalaryData = () =>
  recruitmentIntel?.salaryBenchmarks || strategicData?.salaryData || NURSING_SALARY_DATA || {};

const getCalibrationStateProfiles = () => recruitmentIntel?.stateProfiles || {};

const getCalibrationRelocationIndex = () =>
  recruitmentIntel?.relocationIndex || relocationData?.relocationScale || {};

const loadRecruitmentIntel = async () => {
  try {
    recruitmentIntel = await fetchJson(`/data/recruitment-intel.json?ts=${Date.now()}`);
  } catch {
    recruitmentIntel = {};
  }
};

const loadStrategicData = async () => {
  try {
    strategicData = await fetchJson(`/data/strategic.json?ts=${Date.now()}`);
  } catch {
    strategicData = {};
  }
};

const loadRelocationData = async () => {
  try {
    relocationData = await fetchJson(`/data/relocation.json?ts=${Date.now()}`);
  } catch {
    relocationData = {};
  }
};

const buildStateProfile = (state) => {
  const fallbackStaffing = scoreFromCount(state, true);
  const fallbackResources = scoreFromCount(state, false);
  const fallbackGrowth = scoreFromCount(state, false);
  const fetchedProfiles = getCalibrationStateProfiles();
  const salaryData = getCalibrationSalaryData();
  const relocationIndex = getCalibrationRelocationIndex();
  const fetched = fetchedProfiles[state] || {};

  const pay = scoreFromStateMetric(
    state,
    (abbr) => salaryData?.[abbr]?.staffRN,
    false,
    5
  );
  const relocationScore = scoreFromStateMetric(
    state,
    (abbr) => relocationIndex?.[abbr],
    true,
    5
  );

  const staffing = clampScore(Number(fetched.staffing ?? fallbackStaffing));
  const leadership = clampScore(Number(fetched.leadership ?? (staffing * 0.85 + 1.2)));
  const scheduling = clampScore(Number(fetched.scheduling ?? (staffing * 0.8 + 1)));
  const safety = clampScore(Number(fetched.safety ?? (staffing * 0.7 + 2)));
  const resources = clampScore(Number(fetched.resources ?? fallbackResources));
  const growth = clampScore(Number(fetched.growth ?? fallbackGrowth));
  const respect = clampScore(
    Number(
      fetched.respect ??
      (
        (leadership * 0.3) +
        (safety * 0.3) +
        (scheduling * 0.2) +
        (staffing * 0.2) +
        ((relocationScore - 5) * 0.2)
      )
    )
  );

  return {
    staffing,
    leadership,
    scheduling,
    pay,
    safety,
    resources,
    growth,
    respect
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

// =============================================================================
// Lightworker Pool
// =============================================================================
const initLightworker = () => {
  const lwList     = document.getElementById('lightworker-list');
  const lwModal    = document.getElementById('lightworker-modal');
  const lwSearch   = document.getElementById('lightworker-search');
  const addBtn     = document.getElementById('new-lightworker-btn');
  const saveBtn    = document.getElementById('save-lightworker-btn');
  const closeBtn   = document.getElementById('lightworker-modal-close');
  const cancelBtn  = document.getElementById('lightworker-modal-cancel');
  const homeSelect = document.getElementById('lw-home-state');
  const targetGrid = document.getElementById('lw-target-states');

  if (!window.__lw_ready) {
    if (lwList) lwList.innerHTML = `
      <div class="lw-not-configured">
        <strong>Firebase not configured.</strong><br>
        Fill in your Firebase project config in the <code>&lt;script type="module"&gt;</code>
        block at the bottom of <code>index.html</code> to enable the Lightworker Pool.
      </div>`;
    return;
  }

  const db        = window.__lw_db;
  const col       = window.__lw_collection;
  const addDoc    = window.__lw_addDoc;
  const getDocs   = window.__lw_getDocs;
  const deleteDoc = window.__lw_deleteDoc;
  const docRef    = window.__lw_doc;

  const populateStatePickers = () => {
    if (homeSelect) {
      homeSelect.innerHTML = '<option value="">Select home state...</option>';
      ALL_STATES.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = `${s} — ${STATE_NAMES[s] || s}`;
        homeSelect.appendChild(opt);
      });
    }
    if (targetGrid) {
      targetGrid.innerHTML = '';
      ALL_STATES.forEach(s => {
        const lbl = document.createElement('label');
        lbl.className = 'lw-state-checkbox';
        lbl.innerHTML = `<input type="checkbox" value="${s}"> ${s}`;
        targetGrid.appendChild(lbl);
      });
    }
  };
  populateStatePickers();

  const openLwModal = () => {
    document.getElementById('lw-name').value  = '';
    document.getElementById('lw-email').value = '';
    if (homeSelect) homeSelect.value = '';
    targetGrid?.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });
    ['lw-name-error','lw-email-error','lw-state-error'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.textContent = ''; el.style.display = 'none'; }
    });
    lwModal?.classList.add('active');
    document.body.classList.add('modal-open');
  };
  const closeLwModal = () => {
    lwModal?.classList.remove('active');
    document.body.classList.remove('modal-open');
  };

  addBtn?.addEventListener('click', openLwModal);
  closeBtn?.addEventListener('click', closeLwModal);
  cancelBtn?.addEventListener('click', closeLwModal);
  lwModal?.addEventListener('click', e => { if (e.target === lwModal) closeLwModal(); });

  const renderPool = (contacts) => {
    if (!lwList) return;
    if (!contacts.length) {
      lwList.innerHTML = '<div class="empty-state">No contacts in pool yet. Add one to start sending alerts.</div>';
      return;
    }
    lwList.innerHTML = contacts.map(c => `
      <div class="lightworker-card" data-id="${c.id}">
        <button class="lw-remove-btn" data-id="${c.id}">Remove</button>
        <p class="lw-card-name">${c.name}</p>
        <p class="lw-card-email">${c.email}</p>
        <div class="lw-card-states">
          <span class="lw-home-pill">&#127968; ${c.homeState}</span>
          ${(c.targetStates || []).map(s => `<span class="lw-target-pill">${s}</span>`).join('')}
        </div>
      </div>
    `).join('');
    lwList.querySelectorAll('.lw-remove-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Remove this contact from the Lightworker Pool?')) return;
        try { await deleteDoc(docRef(db, 'lightworker_pool', btn.dataset.id)); loadPool(); }
        catch (e) { alert('Could not remove: ' + e.message); }
      });
    });
  };

  let allContacts = [];
  const loadPool = async () => {
    try {
      const snap = await getDocs(col(db, 'lightworker_pool'));
      allContacts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderPool(allContacts);
    } catch (e) {
      if (lwList) lwList.innerHTML = `<div class="empty-state">Could not load pool: ${e.message}</div>`;
    }
  };
  loadPool();

  lwSearch?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    renderPool(allContacts.filter(c =>
      c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.homeState?.toLowerCase().includes(q)
    ));
  });

  saveBtn?.addEventListener('click', async () => {
    const name  = document.getElementById('lw-name')?.value?.trim();
    const email = document.getElementById('lw-email')?.value?.trim();
    const state = homeSelect?.value;
    const nameErr  = document.getElementById('lw-name-error');
    const emailErr = document.getElementById('lw-email-error');
    const stateErr = document.getElementById('lw-state-error');
    let valid = true;
    if (!name)  { if (nameErr)  { nameErr.textContent  = 'Name is required.';       nameErr.style.display  = 'block'; } valid = false; }
    else        { if (nameErr)  { nameErr.textContent  = '';                         nameErr.style.display  = 'none';  } }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                { if (emailErr) { emailErr.textContent = 'Valid email is required.'; emailErr.style.display = 'block'; } valid = false; }
    else        { if (emailErr) { emailErr.textContent = '';                         emailErr.style.display = 'none';  } }
    if (!state) { if (stateErr) { stateErr.textContent = 'Home state is required.'; stateErr.style.display = 'block'; } valid = false; }
    else        { if (stateErr) { stateErr.textContent = '';                         stateErr.style.display = 'none';  } }
    if (!valid) return;
    const targetStates = [];
    targetGrid?.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => targetStates.push(cb.value));
    try {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
      await addDoc(col(db, 'lightworker_pool'), { name, email, homeState: state, targetStates, addedAt: new Date().toISOString() });
      closeLwModal();
      loadPool();
    } catch (e) { alert('Could not save: ' + e.message); }
    finally { saveBtn.disabled = false; saveBtn.textContent = 'Add to Pool'; }
  });
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
  Promise.allSettled([
    loadRecruitmentIntel(),
    loadStrategicData(),
    loadRelocationData()
  ]).then(() => updateStateCalibration());
};

const loadHealth = async () => {
  try {
    const data = await fetchJson('/health');
    apiHasDb = Boolean(data.db);
    if (data.ok) {
      if (data.mode === 'static') {
        setStatus('Static data mode (API offline)', true);
      } else {
        setStatus(data.db ? 'API connected to Postgres' : 'API running without DB', true);
      }
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

  if (!visibleNotices.length) {
    noticeList.innerHTML = `<div class="empty-state">No notices match these filters yet.</div>`;
    refreshNoticeListWindow(0);
    refreshTalentCommandCenter();
  renderSpecialtySurplus();
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

  refreshNoticeListWindow(visibleNotices.length);
  refreshTalentCommandCenter();
  renderSpecialtySurplus();
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
  latestTalentOpportunities = opportunities;
  latestTalentUpdatedAt = data?.lastUpdated || data?.updatedAt || null;
  specialtySurplusMode = 'live_talent';
  const top = opportunities
    .sort((a, b) => b.estimated_nurses_available - a.estimated_nurses_available)
    .slice(0, 8);
  if (!top.length) {
    renderInsightFallback(talentList, 'No talent signals yet.');
    renderSpecialtySurplus();
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

  renderSpecialtySurplus();
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

const SURPLUS_SPECIALTY_MAP = {
  ER: ['ER', 'ED', 'EMERGENCY DEPARTMENT', 'EMERGENCY ROOM'],
  OR: ['OR', 'OPERATING ROOM', 'PERIOPERATIVE'],
  ICU: ['ICU', 'CRITICAL CARE'],
  MED_SURG: ['MED SURG', 'MED-SURG', 'MEDICAL SURGICAL'],
  L_AND_D: ['L&D', 'LABOR AND DELIVERY', 'INPATIENT OB'],
  TELE: ['TELE', 'TELEMETRY'],
  PCU: ['PCU', 'STEPDOWN', 'STEP-DOWN'],
  PEDS: ['PEDS', 'PEDIATRIC', 'PEDIATRICS'],
  BEHAVIORAL: ['BEHAVIORAL HEALTH', 'PSYCH', 'PSYCHIATRIC']
};
const SURPLUS_SPECIALTY_ORDER = ['ER', 'OR', 'ICU', 'MED_SURG', 'L_AND_D', 'TELE', 'PCU', 'PEDS', 'BEHAVIORAL'];
const SURPLUS_SPECIALTY_LABELS = {
  ER: 'ER/ED',
  OR: 'OR',
  ICU: 'ICU',
  MED_SURG: 'Med-Surg',
  L_AND_D: 'L&D',
  TELE: 'Telemetry',
  PCU: 'PCU',
  PEDS: 'Pediatrics',
  BEHAVIORAL: 'Behavioral Health'
};

const normalizeSpecialty = (value) => String(value || '').toUpperCase().replace(/[^A-Z&\s-]/g, ' ').replace(/\s+/g, ' ').trim();
const specialtyTokens = (value) => normalizeSpecialty(value).replace(/-/g, ' ').split(' ').filter(Boolean);
const aliasMatchesSpecialty = (specialtyValue, alias) => {
  const normalizedValue = normalizeSpecialty(specialtyValue);
  const normalizedAlias = normalizeSpecialty(alias);
  if (!normalizedValue || !normalizedAlias) return false;
  if (normalizedAlias.includes(' ')) return normalizedValue.includes(normalizedAlias);
  const tokens = specialtyTokens(normalizedValue);
  return tokens.includes(normalizedAlias);
};

const findSpecialtyBucket = (value) => {
  const normalized = normalizeSpecialty(value);
  if (!normalized) return null;
  for (const [bucket, aliases] of Object.entries(SURPLUS_SPECIALTY_MAP)) {
    if (aliases.some((alias) => aliasMatchesSpecialty(normalized, alias))) return bucket;
  }
  return null;
};

const getSpecialtySurplusAgeHours = () => {
  if (!latestTalentUpdatedAt) return null;
  const timestamp = new Date(latestTalentUpdatedAt).getTime();
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.floor((Date.now() - timestamp) / (1000 * 60 * 60)));
};

const specialtyConfidenceLabel = (score) => {
  if (score >= 80) return 'High';
  if (score >= 60) return 'Medium';
  return 'Low';
};

const computeSpecialtyConfidenceScore = (samples, coverage, ageHours, sourceHealthBonus) => {
  const sampleComponent = Math.min(1, samples / 8) * 0.4;
  const coverageComponent = Math.min(1, coverage / 0.7) * 0.35;
  const freshnessRatio = ageHours === null ? 0.7 : Math.max(0, 1 - (ageHours / SPECIALTY_SURPLUS_MAX_STALE_HOURS));
  const freshnessComponent = freshnessRatio * 0.25;
  const bonus = Math.max(-0.06, Math.min(0.08, sourceHealthBonus || 0));
  return Math.round((sampleComponent + coverageComponent + freshnessComponent + bonus) * 100);
};

const specialtyConfidenceInterval = (count, confidenceScore) => {
  const uncertainty = Math.max(0.1, (100 - confidenceScore) / 100);
  const delta = Math.round(count * uncertainty * 0.35);
  return {
    low: Math.max(0, count - delta),
    high: count + delta
  };
};

const getSurplusDedupeKey = (entry) => {
  const state = String(entry?.state || '').trim().toUpperCase();
  const city = String(entry?.city || '').trim().toUpperCase();
  const est = Number(entry?.estimated_nurses_available || 0);
  const specialties = Array.isArray(entry?.specialties)
    ? entry.specialties.map((s) => normalizeSpecialty(s)).filter(Boolean).sort().join('|')
    : '';
  return `${state}::${city}::${est}::${specialties}`;
};

const getSourceHealthBonus = () => {
  const sources = freeMarketSignals?.sources;
  if (!sources || typeof sources !== 'object') return 0;
  const keys = ['hrsa', 'bls', 'ncsbn', 'cms'];
  let score = 0;
  keys.forEach((key) => {
    const status = String(sources[key] || '').toLowerCase();
    if (status === 'ok') score += 1;
    else if (status === 'error') score -= 1;
  });
  const metricDatasets = marketRequiredMetrics?.datasets || {};
  const metricStatuses = [
    metricDatasets?.hrsaNssrn?.status,
    metricDatasets?.cmsHcris?.status,
    metricDatasets?.blsOes?.status,
    metricDatasets?.warnNotices?.status,
    metricDatasets?.cmsCareCompare?.status,
    metricDatasets?.stateHcaiOshpd?.status,
    metricDatasets?.irs990?.status,
    metricDatasets?.hospitalAnnualReports?.status
  ];
  let metricScore = 0;
  metricStatuses.forEach((statusRaw) => {
    const status = String(statusRaw || '').toLowerCase();
    if (status === 'ok') metricScore += 1;
    else if (status === 'error') metricScore -= 1;
  });
  return (score / (keys.length * 12)) + (metricScore / (Math.max(1, metricStatuses.length) * 18));
};

const getSpecialtyBaselineWeights = () => {
  const baseline = freeMarketSignals?.hrsaSpecialtyBaseline || {};
  const rawWeights = new Map();
  let total = 0;
  SURPLUS_SPECIALTY_ORDER.forEach((bucket) => {
    const value = Number(baseline?.[bucket]);
    if (Number.isFinite(value) && value > 0) {
      rawWeights.set(bucket, value);
      total += value;
    }
  });
  if (total <= 0) {
    const uniform = 1 / SURPLUS_SPECIALTY_ORDER.length;
    return new Map(SURPLUS_SPECIALTY_ORDER.map((bucket) => [bucket, uniform]));
  }
  return new Map(Array.from(rawWeights.entries()).map(([bucket, value]) => [bucket, value / total]));
};

const formatTalentLocation = (entry) => {
  const state = String(entry?.state || '').trim().toUpperCase();
  const cityRaw = String(entry?.city || '').trim();
  const city = cityRaw && cityRaw.toLowerCase() !== 'statewide' ? cityRaw : '';
  if (city && state) return `${city}, ${state}`;
  return state || city || 'Unknown';
};

const addLocationContribution = (bucketLocationTotals, bucket, location, amount) => {
  const locationMap = bucketLocationTotals.get(bucket);
  if (!locationMap || !location || !Number.isFinite(amount) || amount <= 0) return;
  locationMap.set(location, (locationMap.get(location) || 0) + amount);
};

const loadMarketReadinessIntegration = async () => {
  try {
    marketReadinessIntegration = await fetchJson('/data/market-readiness-integration.json');
  } catch {
    marketReadinessIntegration = null;
  }
};

const loadMarketRequiredMetrics = async () => {
  try {
    marketRequiredMetrics = await fetchJson('/data/market-required-metrics.json');
  } catch {
    marketRequiredMetrics = null;
  }
};

const loadFacilityMarketFeatures = async () => {
  try {
    facilityMarketFeatures = await fetchJson('/data/facility-market-features.json');
  } catch {
    facilityMarketFeatures = null;
  }
};

const renderSpecialtySurplus = () => {
  if (!specialtySurplusList) return;
  const ageHours = getSpecialtySurplusAgeHours();
  const isStale = ageHours !== null && ageHours > SPECIALTY_SURPLUS_MAX_STALE_HOURS;
  if (!Array.isArray(latestTalentOpportunities) || !latestTalentOpportunities.length || isStale) {
    specialtySurplusMode = 'unavailable';
    const staleNote = isStale ? ` Last update is ${ageHours}h old.` : '';
    specialtySurplusList.innerHTML = `<div class="empty-state">Live specialty surplus unavailable until fresh talent opportunities load.${staleNote}</div>`;
    return;
  }

  const totals = new Map(SURPLUS_SPECIALTY_ORDER.map((key) => [key, 0]));
  const bucketSampleCounts = new Map(SURPLUS_SPECIALTY_ORDER.map((key) => [key, 0]));
  const bucketModeledWeights = new Map(SURPLUS_SPECIALTY_ORDER.map((key) => [key, 0]));
  const bucketNoticeCounts = new Map(SURPLUS_SPECIALTY_ORDER.map((key) => [key, 0]));
  const bucketLocationTotals = new Map(SURPLUS_SPECIALTY_ORDER.map((key) => [key, new Map()]));
  const baselineWeights = getSpecialtyBaselineWeights();
  const dedupeMap = new Map();
  let duplicateRows = 0;
  let totalRows = 0;
  let mappedRows = 0;
  let modeledRows = 0;
  let modeledEstimate = 0;
  let excludedRows = 0;
  let unmappedRows = 0;

  latestTalentOpportunities.forEach((entry) => {
    const dedupeKey = getSurplusDedupeKey(entry);
    if (dedupeMap.has(dedupeKey)) {
      duplicateRows += 1;
      return;
    }
    dedupeMap.set(dedupeKey, entry);
  });

  dedupeMap.forEach((entry) => {
    const state = String(entry?.state || '').trim().toUpperCase();
    const estBase = Number(entry?.estimated_nurses_available || 0);
    const stateWeight = Number(freeMarketSignals?.stateFactors?.[state]?.combinedWeight || 1);
    const facilityStateWeight = Number(facilityMarketFeatures?.stateFeatures?.[state]?.distressWeight || 1);
    const est = Math.max(0, Math.round(estBase * stateWeight * facilityStateWeight));
    if (est <= 0) return;
    totalRows += 1;
    const location = formatTalentLocation(entry);
    const specialties = Array.isArray(entry?.specialties) ? entry.specialties : [];
    const buckets = [...new Set(specialties.map(findSpecialtyBucket).filter(Boolean))];
    if (!buckets.length) {
      unmappedRows += 1;
      modeledRows += 1;
      modeledEstimate += est;
      const noticeBase = Number(entry?.notices_count || 0);
      baselineWeights.forEach((weight, bucket) => {
        const alloc = Math.max(0, Math.round(est * weight));
        if (alloc <= 0) return;
        totals.set(bucket, (totals.get(bucket) || 0) + alloc);
        bucketModeledWeights.set(bucket, (bucketModeledWeights.get(bucket) || 0) + weight);
        bucketNoticeCounts.set(
          bucket,
          (bucketNoticeCounts.get(bucket) || 0) + Math.max(0, Math.round(noticeBase * weight))
        );
        addLocationContribution(bucketLocationTotals, bucket, location, alloc);
      });
      return;
    }
    if (est < 5) {
      excludedRows += 1;
      return;
    }
    mappedRows += 1;
    const base = Math.floor(est / buckets.length);
    let remainder = est % buckets.length;
    buckets.forEach((bucket) => {
      const plus = remainder > 0 ? 1 : 0;
      if (remainder > 0) remainder -= 1;
      totals.set(bucket, (totals.get(bucket) || 0) + base + plus);
      bucketSampleCounts.set(bucket, (bucketSampleCounts.get(bucket) || 0) + 1);
      bucketNoticeCounts.set(bucket, (bucketNoticeCounts.get(bucket) || 0) + Number(entry?.notices_count || 0));
      addLocationContribution(bucketLocationTotals, bucket, location, base + plus);
    });
  });

  const mappingCoverage = totalRows > 0 ? mappedRows / totalRows : 0;
  const sourceHealthBonus = getSourceHealthBonus();

  const ranked = SURPLUS_SPECIALTY_ORDER
    .map((bucket) => ({
      bucket,
      count: totals.get(bucket) || 0,
      samples: bucketSampleCounts.get(bucket) || 0,
      modeledWeight: bucketModeledWeights.get(bucket) || 0,
      noticeCount: bucketNoticeCounts.get(bucket) || 0,
      topLocations: Array.from((bucketLocationTotals.get(bucket) || new Map()).entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, value]) => `${name} (${Math.round(value).toLocaleString()})`)
    }))
    .map((row) => {
      const modeledSampleEstimate = Math.max(0, Math.round(row.modeledWeight));
      const confidenceBase = computeSpecialtyConfidenceScore(row.samples, mappingCoverage, ageHours, sourceHealthBonus);
      const modeledShare = (row.samples + row.modeledWeight) > 0
        ? row.modeledWeight / (row.samples + row.modeledWeight)
        : 0;
      const confidencePenalty = Math.round(modeledShare * 25);
      return {
        ...row,
        modeledSamples: modeledSampleEstimate,
        confidenceScore: Math.max(0, Math.min(100, confidenceBase - confidencePenalty))
      };
    })
    .filter((row) => row.count > 0 && (row.samples >= SPECIALTY_SURPLUS_MIN_BUCKET_SAMPLES || row.modeledSamples > 0))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  if (!ranked.length) {
    specialtySurplusList.innerHTML = `<div class="empty-state">Insufficient live specialty sample size. Need ${SPECIALTY_SURPLUS_MIN_BUCKET_SAMPLES}+ mapped records per specialty.</div>`;
    return;
  }

  specialtySurplusList.innerHTML = ranked.map((row) => {
    const interval = specialtyConfidenceInterval(row.count, row.confidenceScore);
    const modeledLabel = row.modeledSamples > 0 ? ` + ${row.modeledSamples} modeled` : '';
    const locationLine = row.topLocations.length
      ? `Top locations: ${row.topLocations.join(' • ')}`
      : 'Top locations unavailable';
    return `
      <div class="insight-row">
        <div>
          <div class="insight-title">${SURPLUS_SPECIALTY_LABELS[row.bucket] || row.bucket}</div>
          <div class="specialty-surplus-meta">${row.samples} mapped records${modeledLabel} | ${row.noticeCount} notices | Confidence ${specialtyConfidenceLabel(row.confidenceScore)}</div>
          <div class="specialty-surplus-meta">${locationLine}</div>
        </div>
        <div>
          <div class="insight-pill">${Math.round(row.count).toLocaleString()}</div>
          <div class="specialty-surplus-meta">${interval.low.toLocaleString()}-${interval.high.toLocaleString()}</div>
        </div>
      </div>
    `;
  }).join('');

  const freshnessLabel = ageHours === null ? 'age unknown' : `${ageHours}h old`;
  const sourceLine = freeMarketSignals?.sources
    ? `HRSA ${freeMarketSignals.sources.hrsa || 'unknown'}, BLS ${freeMarketSignals.sources.bls || 'unknown'}, NCSBN ${freeMarketSignals.sources.ncsbn || 'unknown'}, CMS ${freeMarketSignals.sources.cms || 'unknown'}`
    : 'HRSA/BLS/NCSBN/CMS source health unavailable';
  specialtySurplusList.innerHTML += `<div class="specialty-surplus-meta">Source: Live talent opportunities | Coverage ${Math.round(mappingCoverage * 100)}% | Mapped ${mappedRows}/${totalRows || 0} | Unmapped ${unmappedRows} | Duplicates removed ${duplicateRows} | Excluded ${excludedRows} | Freshness ${freshnessLabel}</div>`;
  if (modeledRows > 0) {
    specialtySurplusList.innerHTML += `<div class="specialty-surplus-meta">Modeled backfill: ${modeledRows} unmapped rows allocated across specialties using HRSA baseline (${Math.round(modeledEstimate).toLocaleString()} est. nurses).</div>`;
  }
  specialtySurplusList.innerHTML += `<div class="specialty-surplus-meta">Source health: ${sourceLine}</div>`;
  if (facilityMarketFeatures?.summary) {
    specialtySurplusList.innerHTML += `<div class="specialty-surplus-meta">Facility joins: ${Number(facilityMarketFeatures.summary.matchedFacilities || 0).toLocaleString()}/${Number(facilityMarketFeatures.summary.totalFacilities || 0).toLocaleString()} matched (top facilities indexed)</div>`;
    const providerLikeCoverage = Number(facilityMarketFeatures.summary.healthcareProviderLikeCoveragePct || 0);
    const hospitalActionableCoverage = Number(facilityMarketFeatures.summary.healthcareHospitalActionableCoveragePct || 0);
    specialtySurplusList.innerHTML += `<div class="specialty-surplus-meta">Live healthcare join coverage: ${providerLikeCoverage.toFixed(1)}% provider-like | ${hospitalActionableCoverage.toFixed(1)}% hospital-actionable</div>`;
  }
  if (marketReadinessIntegration?.summary) {
    const req = Array.isArray(marketReadinessIntegration.requiredDatasets) ? marketReadinessIntegration.requiredDatasets : [];
    const pending = req.filter((d) => !d.integrated).map((d) => d.label);
    const completion = Number(marketReadinessIntegration.summary.completenessPct || 0);
    const pendingLine = pending.length ? ` | Pending: ${pending.join(', ')}` : '';
    specialtySurplusList.innerHTML += `<div class="specialty-surplus-meta">Required dataset integration: ${completion}%${pendingLine}</div>`;
  }
};

const loadFreeMarketSignals = async () => {
  try {
    freeMarketSignals = await fetchJson('/data/free-market-signals.json');
  } catch {
    freeMarketSignals = null;
  }
};
const loadInsights = async () => {
  await loadFreeMarketSignals();
  await loadMarketReadinessIntegration();
  await loadMarketRequiredMetrics();
  await loadFacilityMarketFeatures();
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
      specialtySurplusMode = 'unavailable';
      renderInsightFallback(alertsList, 'Insights unavailable.');
      renderInsightFallback(heatmapList, 'Insights unavailable.');
      renderInsightFallback(talentList, 'Insights unavailable.');
      renderInsightFallback(employerList, 'Insights unavailable.');
      renderInsightFallback(specialtySurplusList, 'Insights unavailable.');
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
    notices = filterNoticesByScope(notices);
    notices = sortNoticesByNewest(notices);

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
      currentNotices = sortNoticesByNewest([...customNotices]);
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
    const data = await fetchJson('/fetch', { method: 'POST' });

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
  PR: 'Puerto Rico',
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
      if (isMapTargetMode) {
        const currentTarget = getMapTargetState();
        if (currentTarget === stateId) {
          clearMapTargetState();
        } else {
          setMapTargetState(stateId);
        }
        return;
      }
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

  updateMapTargetStateHighlight();
};

// Show tooltip
const showTooltip = (e, stateAbbrev) => {
  const stateName = STATE_NAMES[stateAbbrev] || stateAbbrev;
  const data = mapStateData[stateAbbrev] || { count: 0 };
  const scopeLabel = mapScope === 'all' ? 'total notices' : 'healthcare notices';

  mapTooltip.innerHTML = `
    <div class="tooltip-state">${stateName}</div>
    <div class="tooltip-count">${data.count} ${scopeLabel}</div>
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

const getMapTargetState = () => {
  try {
    return localStorage.getItem(scopedStorageKey(MAP_TARGET_STATE_BASE_KEY)) || null;
  } catch {
    return null;
  }
};

const updateMapTargetStateHighlight = () => {
  const targetState = getMapTargetState();
  usMapContainer?.querySelectorAll('[data-state]').forEach(shape => {
    shape.classList.remove('target-state-glow');
    if (targetState && shape.getAttribute('data-state') === targetState) {
      shape.classList.add('target-state-glow');
    }
  });
  if (mapTargetStateBtn) {
    mapTargetStateBtn.style.display = targetState ? 'inline-flex' : 'none';
  }
};

const setMapTargetState = (stateAbbrev) => {
  try {
    localStorage.setItem(scopedStorageKey(MAP_TARGET_STATE_BASE_KEY), stateAbbrev);
  } catch {
    // ignore
  }
  updateMapTargetStateHighlight();
  showMapToast(`Target state set to ${STATE_NAMES[stateAbbrev] || stateAbbrev}`);
};

const clearMapTargetState = () => {
  try {
    localStorage.removeItem(scopedStorageKey(MAP_TARGET_STATE_BASE_KEY));
  } catch {
    // ignore
  }
  updateMapTargetStateHighlight();
  showMapToast('Target state cleared');
};

const setMapTargetMode = (nextValue) => {
  isMapTargetMode = nextValue;
  if (mapTargetModeBtn) {
    mapTargetModeBtn.classList.toggle('active', isMapTargetMode);
    mapTargetModeBtn.setAttribute('aria-pressed', String(isMapTargetMode));
    const status = mapTargetModeBtn.querySelector('.map-target-mode-status');
    if (status) status.textContent = isMapTargetMode ? 'On' : 'Off';
  }
};

const ensureMapTargetModeListener = () => {
  if (!mapTargetModeBtn || mapTargetModeBtn.dataset.listenerAttached === 'true') return;
  mapTargetModeBtn.dataset.listenerAttached = 'true';
  const toggle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setMapTargetMode(!isMapTargetMode);
  };
  mapTargetModeBtn.addEventListener('pointerdown', toggle);
  mapTargetModeBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
  });
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
  const counts = Object.values(mapStateData).map(s => s.count || 0);
  const maxCount = Math.max(...counts, 1);

  const shapes = usMapContainer.querySelectorAll('[data-state]');
  shapes.forEach(shape => {
    const stateAbbrev = shape.getAttribute('data-state');
    const count = mapStateData[stateAbbrev]?.count || 0;
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

const normalizeStateCounts = (states) => {
  const normalized = {};
  states.forEach((entry) => {
    const state = entry.state;
    let count = 0;
    if (typeof entry.count === 'number') {
      count = entry.count;
    } else if (entry.count && typeof entry.count.count === 'number') {
      count = entry.count.count;
    }
    normalized[state] = { count };
  });
  return normalized;
};

// Modified loadStates to also update weather map
const originalLoadStates = loadStates;
const loadStatesWithMap = async () => {
  try {
    const allData = await fetchJson('/states');
    let healthcareData = { states: [] };
    try {
      healthcareData = await fetchJson('/states?recruiterFocus=1');
    } catch {
      healthcareData = { states: [] };
    }
    const states = allData.states ?? [];
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

    // Build state data from API responses
    stateDataAll = normalizeStateCounts(states);
    stateDataHealthcare = normalizeStateCounts(healthcareData.states ?? []);
    stateData = stateDataAll;
    mapStateData = mapScope === 'all' || Object.keys(stateDataHealthcare).length === 0
      ? stateDataAll
      : stateDataHealthcare;

    // Populate state dropdown with all states
    populateStateDropdown();

    // Update the weather map colors
    updateWeatherMap();
    if (mapFactorsPanel && mapFactorsPanel.style.display !== 'none') {
      renderMapFactors();
    }
    const counts = Object.values(stateData).map(entry => entry.count ?? 0);
    calibrationStats = {
      minCount: counts.length ? Math.min(...counts) : 0,
      maxCount: counts.length ? Math.max(...counts) : 0
    };
    updateStateCalibration();

    // Run zero protocol to refetch data for states showing 0 notices
    runZeroProtocol();
    setMapScope(mapScope);
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

// All US states + DC + PR for dropdowns
const ALL_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'PR', 'RI', 'SC',
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
    const stored = localStorage.getItem(scopedStorageKey(CUSTOM_NOTICES_BASE_KEY));
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
    localStorage.setItem(scopedStorageKey(CUSTOM_NOTICES_BASE_KEY), JSON.stringify(customNotices));
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

// Load projects from localStorage
const loadProjects = () => {
  try {
    const stored = localStorage.getItem(scopedStorageKey(PROJECTS_BASE_KEY));
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
    localStorage.setItem(scopedStorageKey(PROJECTS_BASE_KEY), JSON.stringify(projects));
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
      ${project.owner ? `<p class="project-owner">Owner: ${project.owner}</p>` : ''}
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
  const ownerInput = document.getElementById('project-owner');
  const descInput = document.getElementById('project-description');
  const nameError = document.getElementById('project-name-error');

  if (projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      modalTitle.textContent = 'Edit Project';
      nameInput.value = project.name;
      if (ownerInput) ownerInput.value = project.owner || '';
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
  if (nameError) { nameError.textContent = ''; nameError.style.display = 'none'; }

  projectModal.classList.add('active');
  document.body.classList.add('modal-open');
};

// Close project modal
const closeProjectModal = () => {
  projectModal.classList.remove('active');
  document.body.classList.remove('modal-open');
  currentProjectId = null;
};

// Handle project form submit
const handleProjectSubmit = () => {
  const name = document.getElementById('project-name').value.trim();
  const owner = document.getElementById('project-owner')?.value?.trim();
  const description = document.getElementById('project-description')?.value?.trim();
  const selectedColor = document.querySelector('.color-option.selected');
  const color = selectedColor ? selectedColor.dataset.color : '#3182ce';
  const nameError = document.getElementById('project-name-error');

  if (!name) {
    if (nameError) { nameError.textContent = 'Project name is required.'; nameError.style.display = 'block'; }
    document.getElementById('project-name')?.focus();
    return;
  }
  if (!owner) {
    if (nameError) { nameError.textContent = 'Owner name is required.'; nameError.style.display = 'block'; }
    document.getElementById('project-owner')?.focus();
    return;
  }

  // Check for duplicate project name (case-insensitive, exclude current project when editing)
  const duplicate = projects.find(p =>
    p.name.toLowerCase() === name.toLowerCase() && p.id !== currentProjectId
  );
  if (duplicate) {
    if (nameError) {
      nameError.textContent = 'A project with this name already exists.';
      nameError.style.display = 'block';
    }
    return;
  }
  if (nameError) { nameError.textContent = ''; nameError.style.display = 'none'; }

  if (currentProjectId) {
    // Update existing project
    const project = projects.find(p => p.id === currentProjectId);
    if (project) {
      project.name = name;
      project.owner = owner;
      project.description = description;
      project.color = color;
      project.updatedAt = new Date().toISOString();
    }
  } else {
    // Create new project
    const newProject = {
      id: `project-${Date.now()}`,
      name,
      owner,
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
  const ownerEl = document.getElementById('project-detail-owner');
  if (ownerEl) ownerEl.textContent = project.owner ? `Owner: ${project.owner}` : '';
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
  document.body.classList.add('modal-open');
};

// Close project detail modal
const closeProjectDetail = () => {
  projectDetailModal.classList.remove('active');
  document.body.classList.remove('modal-open');
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
  // Prevent any accidental form submission from reloading the page
  document.getElementById('project-form')?.addEventListener('submit', (e) => e.preventDefault());

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

  // Save project supports both button click and Enter key form submit.
  if (projectForm && projectForm.dataset.boundProjectSubmit !== 'true') {
    projectForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleProjectSubmit();
    });
    projectForm.dataset.boundProjectSubmit = 'true';
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
  const helpContent = document.getElementById('help-content');
  const toggleIcon = helpToggle?.querySelector('.help-toggle-icon');

  if (!helpToggle || !helpSection) return;

  const setOpen = (open) => {
    helpSection.classList.toggle('open', open);
    if (helpContent) {
      helpContent.style.maxHeight = open ? `${helpContent.scrollHeight}px` : '0px';
    }
    if (toggleIcon) toggleIcon.textContent = open ? '-' : '+';
    helpToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  if (helpToggle.dataset.boundToggle !== 'true') {
    helpToggle.addEventListener('click', () => {
      const isOpen = helpSection.classList.contains('open');
      setOpen(!isOpen);
    });
    helpToggle.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const isOpen = helpSection.classList.contains('open');
        setOpen(!isOpen);
      }
    });
    helpToggle.dataset.boundToggle = 'true';
  }

  setOpen(helpSection.classList.contains('open'));
};

// Bind once at script load so help toggle still works if initApp isn't reached yet.
initHelpSection();

// ==================== COLLAPSIBLE SECTIONS ====================
const initCollapsibleSections = () => {
  const toggleSection = (section, toggle) => {
    if (!section) return;
    section.classList.toggle('collapsed');
    const isCollapsed = section.classList.contains('collapsed');
    if (toggle) {
      const label = toggle.querySelector('.section-toggle-label');
      const icon = toggle.querySelector('.section-toggle-icon');
      toggle.setAttribute('aria-expanded', String(!isCollapsed));
      if (label) label.textContent = isCollapsed ? 'Expand' : 'Collapse';
      if (icon) icon.textContent = isCollapsed ? '+' : '-';
    }
    if (!isCollapsed && section.classList.contains('news-feed-section')) {
      requestAnimationFrame(refreshNewsFeedWindow);
    }
  };

  document.querySelectorAll('section[data-collapsible="true"]').forEach(section => {
    const toggle = section.querySelector('.section-toggle');
    if (!toggle || toggle.dataset.boundToggle === 'true') return;

    toggle.dataset.boundToggle = 'true';
    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleSection(section, toggle);
    });

    const header = section.querySelector('.section-header');
    if (header && header.dataset.boundToggle !== 'true') {
      header.dataset.boundToggle = 'true';
      header.addEventListener('click', (event) => {
        if (event.target.closest('.section-toggle')) return;
        toggleSection(section, toggle);
      });
    }
  });
};
const initStrategicReview = () => {
  const toggleBtn = document.getElementById('strategic-toggle');
  const section = document.querySelector('.strategic-review-section');
  const toggleIcon = section?.querySelector('.strategic-toggle-icon');

  if (!toggleBtn || !section) return;

  toggleBtn.addEventListener('click', () => {
    section.classList.toggle('open');
    const isOpen = section.classList.contains('open');
    if (toggleIcon) toggleIcon.textContent = isOpen ? '-' : '+';
  });
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

const buildProgramsExportData = () => {
  const programs = getFilteredPrograms();
  if (!programs.length) {
    alert('No programs available to export.');
    return null;
  }

  const headers = ['Institution', 'Campus', 'City', 'State', 'Level', 'Accreditor', 'Credential Notes'];
  const rows = programs.map((program) => {
    const entry = normalizeProgram(program);
    return [
      entry.institution,
      entry.campus,
      entry.city,
      entry.state,
      entry.level,
      entry.accreditor,
      entry.credentialNotes
    ];
  });

  const stateFilter = programsStateFilter?.value || 'All';
  const query = programsSearch?.value.trim() || 'All';
  const levels = getSelectedLevels().join(', ') || 'All';
  const updated = programsMeta.lastUpdated ? formatDate(programsMeta.lastUpdated) : 'Unknown';

  return {
    headers,
    rows,
    meta: [
      `Exported: ${new Date().toLocaleString()}`,
      `Last updated: ${updated}`,
      `State filter: ${stateFilter}`,
      `Levels: ${levels}`,
      `Search: ${query}`,
      `Programs: ${programs.length}`
    ]
  };
};

const exportProgramsCsv = () => {
  const data = buildProgramsExportData();
  if (!data) return;
  const csv = buildCsv(data.headers, data.rows);
  downloadFile(csv, 'accredited_nursing_programs.csv', 'text/csv');
  showExportToast('Programs CSV exported.');
};

const exportProgramsExcel = () => {
  const data = buildProgramsExportData();
  if (!data) return;
  downloadExcel({
    title: 'Accredited Nursing Programs',
    meta: data.meta,
    headers: data.headers,
    rows: data.rows,
    filename: 'accredited_nursing_programs.xls'
  });
  showExportToast('Programs Excel exported.');
};

const exportProgramsPdf = () => {
  const data = buildProgramsExportData();
  if (!data) return;
  openPdfExport({
    title: 'Accredited Nursing Programs',
    meta: data.meta,
    headers: data.headers,
    rows: data.rows
  });
  showExportToast('Programs PDF opened.');
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
      setStatus(`Program data partial: missing ${missingAccreditors.join(', ')}`, true);
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
  programsExportCsv?.addEventListener('click', exportProgramsCsv);
  programsExportExcel?.addEventListener('click', exportProgramsExcel);
  programsExportPdf?.addEventListener('click', exportProgramsPdf);
  loadPrograms(true);
};

// ==================== END ACCREDITED PROGRAMS MODULE ====================

// ==================== STATE BEACON MODULE ====================
const loadStateBeaconData = async (forceRefresh = false) => {
  const now = Date.now();
  if (stateBeaconLoaded && !forceRefresh && (now - stateBeaconLoadedAt) < STATE_BEACON_REFRESH_MS) {
    return stateBeaconData;
  }
  try {
    const data = await fetchJson(`/data/state-beacon.json?ts=${now}`);
    stateBeaconData = {
      lastUpdated: data?.lastUpdated || new Date(now).toISOString(),
      states: data?.states || {}
    };
  } catch (err) {
    console.warn('State Beacon baseline unavailable:', err.message);
    stateBeaconData = { lastUpdated: new Date(now).toISOString(), states: {} };
  }
  stateBeaconLoaded = true;
  stateBeaconLoadedAt = now;
  return stateBeaconData;
};

const loadStateNewsData = async (forceRefresh = false) => {
  const now = Date.now();
  if (stateNewsLoaded && !forceRefresh && (now - stateNewsLoadedAt) < STATE_BEACON_REFRESH_MS) {
    return stateNewsData;
  }
  try {
    stateNewsData = await fetchJson(`/data/state-news.json?ts=${now}`);
  } catch (err) {
    stateNewsData = null;
  }
  stateNewsLoaded = true;
  stateNewsLoadedAt = now;
  return stateNewsData;
};

const getStateNewsFeed = (state, entry) => {
  const entryFeed = Array.isArray(entry.newsFeed) ? entry.newsFeed : [];
  if (entryFeed.length) return entryFeed;
  const stateFeed = stateNewsData?.states?.[state] || stateNewsData?.[state] || [];
  return Array.isArray(stateFeed) ? stateFeed : [];
};

const ensureProgramsDataForBeacon = async () => {
  if (nursingPrograms.length) return;
  try {
    const data = await fetchJson(`/data/programs.json?ts=${Date.now()}`);
    nursingPrograms = Array.isArray(data) ? data : (data.programs ?? []);
    programsMeta = {
      lastUpdated: data.lastUpdated ?? null,
      sources: data.sources ?? []
    };
    programsLoaded = true;
  } catch (err) {
    console.warn('Programs data unavailable for State Beacon:', err.message);
    programsLoaded = false;
  }
};

const getBeaconEntry = (state) => {
  const entry = stateBeaconData?.states?.[state] ?? {};
  return {
    name: entry.name || STATE_NAMES[state] || state,
    compact: entry.compact ?? null,
    summary: entry.summary ?? {},
    compensation: entry.compensation ?? {},
    licensing: entry.licensing ?? {},
    market: entry.market ?? {},
    competition: entry.competition ?? {},
    pipeline: entry.pipeline ?? {},
    pros: entry.pros ?? [],
    cons: entry.cons ?? [],
    attractions: entry.attractions ?? [],
    drawbacks: entry.drawbacks ?? [],
    talkingPoints: entry.talkingPoints ?? [],
    objections: entry.objections ?? [],
    warnMajorSystems: entry.warnMajorSystems ?? [],
    hospitalRegistry: entry.hospitalRegistry ?? [],
    clinicRegistry: entry.clinicRegistry ?? [],
    newsFeed: entry.newsFeed ?? [],
    candidateInsights: entry.candidateInsights ?? [],
    candidateMetroTable: entry.candidateMetroTable ?? [],
    candidateModel: entry.candidateModel ?? null,
    newsKeywords: entry.newsKeywords ?? [STATE_NAMES[state], state].filter(Boolean),
    priorityMetros: entry.priorityMetros ?? []
  };
};

const buildFallbackTalkingPoints = () => ([
  '{homeState} teams are hiring {specialty} RNs right now with relocation support from {targetState}.',
  'We can fast-track a move from {targetState} to {homeState} using your {license} status and a {timeline} start window.',
  'We prioritize {homeState} hospitals with strong onboarding and lower WARN risk across {shift} schedules.',
  'We can target pay bands near {targetPay} and match you to the best {metro} fit in {homeState}.'
]);

const buildFallbackObjections = () => ([
  {
    concern: 'I am not sure moving states is worth it',
    response: 'We compare pay, schedule stability, and onboarding support so you can decide with clear numbers.'
  },
  {
    concern: 'I am worried about moving costs',
    response: 'We prioritize systems that offer relocation support, sign-on incentives, and flexible start dates.'
  },
  {
    concern: 'I need schedule flexibility',
    response: 'We can target {shift} openings first and sequence interviews within your {timeline} window.'
  }
]);

const buildFallbackCandidateMetroTable = (notices, state, fallbackMetros = []) => {
  const cityCounts = new Map();
  notices
    .filter((notice) => isHealthcareNotice(notice))
    .forEach((notice) => {
      const city = String(notice.city || '').trim();
      if (!city) return;
      cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
    });

  const fromNotices = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city, count]) => ({
      metro: city,
      estimate: `${Math.max(10, count * 10)}+`,
      feederSchools: `${STATE_NAMES[state] || state} nursing programs`
    }));

  if (fromNotices.length) return fromNotices;
  return fallbackMetros.slice(0, 5).map((metro) => ({
    metro,
    estimate: '25+',
    feederSchools: `${STATE_NAMES[state] || state} nursing programs`
  }));
};

const enrichBeaconEntry = (state, entry, notices, programsInState) => {
  const stateName = entry.name || STATE_NAMES[state] || state;
  const healthcareNotices = notices.filter((notice) => isHealthcareNotice(notice));
  const groupedEmployers = Array.from(
    groupBy(healthcareNotices, (notice) => notice.employer_name || notice.employerName || 'Unknown employer').entries()
  )
    .map(([name, items]) => ({
      name,
      items,
      notices: items.length,
      affected: items.reduce((sum, n) => sum + Number(n.affectedCount || n.employees_affected || 0), 0),
      county: items.find((n) => n.county)?.county || '',
      city: items.find((n) => n.city)?.city || ''
    }))
    .sort((a, b) => b.affected - a.affected || b.notices - a.notices);

  const inferredMetros = Array.from(new Set(groupedEmployers.map((item) => item.city).filter(Boolean))).slice(0, 6);
  const inferredSystems = groupedEmployers.slice(0, 8).map((item) => ({
    name: item.name,
    presence: `${item.notices} WARN notices`,
    notes: `${formatNumber(item.affected)} impacted (derived from WARN)`
  }));
  const rankingFallback = groupedEmployers.slice(0, 10).map((item, idx) => ({
    name: item.name,
    system: item.name,
    metro: item.city || stateName,
    baseScore: Math.max(72, 96 - idx),
    warnWeight: 1,
    match: item.name.toLowerCase()
  }));
  const hospitalRegistryFallback = groupedEmployers.slice(0, 120).map((item, idx) => ({
    name: item.name,
    county: item.county || '',
    flagship: idx < 5
  }));
  const clinicRegistryFallback = hospitalRegistryFallback
    .filter((item) => /clinic|outpatient|ambulatory|rehab|medical group|health center/i.test(item.name))
    .slice(0, 30)
    .map((item) => ({ ...item, metro: inferredMetros[0] || stateName }));

  const majorProgramsFallback = programsInState
    .map((program) => normalizeProgram(program).name)
    .filter(Boolean)
    .slice(0, 8);
  const indianaFeederSchools = getTopInstitutionsForState('IN', 3).map((item) => item.name).filter(Boolean);
  const indianaFeederText = indianaFeederSchools.length
    ? `Indiana feeder schools: ${indianaFeederSchools.join(', ')}`
    : 'Indiana feeder schools: Indiana University, Purdue University, Ivy Tech Community College';
  const candidateMetroFallback = buildFallbackCandidateMetroTable(notices, state, inferredMetros)
    .map((row) => {
      const feederSchools = String(row.feederSchools || '').trim();
      if (!feederSchools) return { ...row, feederSchools: indianaFeederText };
      if (/indiana feeder schools:/i.test(feederSchools)) return row;
      return { ...row, feederSchools: `${feederSchools}; ${indianaFeederText}` };
    });
  const majorProgramsWithIndiana = indianaFeederSchools.length
    ? Array.from(new Set([...majorProgramsFallback, ...indianaFeederSchools])).slice(0, 10)
    : majorProgramsFallback;
  const competitionSystems = entry.competition?.systems?.length ? entry.competition.systems : inferredSystems;
  const candidateInsightsWithIndiana = (
    entry.candidateInsights?.length ? entry.candidateInsights : [
      { title: `${stateName} demand signal`, detail: `${healthcareNotices.length} healthcare notices in current dataset.` },
      { title: 'Pipeline signal', detail: `${programsInState.length} nursing programs currently loaded.` },
      { title: 'Competition signal', detail: `${competitionSystems.length} major systems identified for this market.` }
    ]
  );
  if (indianaFeederSchools.length && !candidateInsightsWithIndiana.some((item) => /indiana feeder schools/i.test(String(item?.title || '')))) {
    candidateInsightsWithIndiana.push({
      title: 'Indiana feeder schools',
      detail: `${indianaFeederSchools.join(', ')} funnel nurses to ${stateName} target metros.`
    });
  }
  const candidateMetroWithIndiana = (entry.candidateMetroTable?.length ? entry.candidateMetroTable : candidateMetroFallback)
    .map((row) => {
      const feederSchools = String(row.feederSchools || '').trim();
      if (!feederSchools) return { ...row, feederSchools: indianaFeederText };
      if (/indiana feeder schools:/i.test(feederSchools)) return row;
      return { ...row, feederSchools: `${feederSchools}; ${indianaFeederText}` };
    });

  const merged = {
    ...entry,
    summary: {
      demand: entry.summary?.demand || `${stateName} shows active healthcare demand and recruitment movement.`,
      unionization: entry.summary?.unionization || 'Varies by market and employer.',
      growth: entry.summary?.growth || 'Driven by hospital and outpatient hiring cycles.',
      seasonality: entry.summary?.seasonality || 'Seasonal demand can vary by metro and service line.'
    },
    market: {
      ...entry.market,
      drivers: entry.market?.drivers?.length ? entry.market.drivers : [
        'Healthcare labor demand remains active in major metros.',
        'System-level staffing shifts create recurring recruitment windows.',
        'Outpatient and post-acute demand supports role diversity.'
      ]
    },
    competition: {
      ...entry.competition,
      systems: competitionSystems
    },
    pipeline: {
      ...entry.pipeline,
      majorPrograms: entry.pipeline?.majorPrograms?.length ? entry.pipeline.majorPrograms : majorProgramsWithIndiana,
      residencies: entry.pipeline?.residencies?.length ? entry.pipeline.residencies : [
        'Nurse residency options vary by major health system.',
        'Onboarding timelines should be validated per facility.'
      ],
      clinicalPartners: entry.pipeline?.clinicalPartners?.length ? entry.pipeline.clinicalPartners : competitionSystems.slice(0, 4).map((s) => s.name)
    },
    pros: entry.pros?.length ? entry.pros : [
      `${stateName} offers multiple metro placement options.`,
      'Programs and health systems provide broad specialty coverage.',
      'Current WARN and market signals can identify focused opportunities.'
    ],
    cons: entry.cons?.length ? entry.cons : [
      'Compensation and staffing ratios vary significantly by facility.',
      'Relocation logistics and licensing timelines should be confirmed.',
      'Competition can be high in major urban markets.'
    ],
    attractions: entry.attractions?.length ? entry.attractions : [
      `${stateName} includes varied metro and community settings.`,
      'Large systems provide multiple internal mobility paths.'
    ],
    drawbacks: entry.drawbacks?.length ? entry.drawbacks : [
      'Cost-of-living and commute burden can differ by metro.',
      'Shift availability and onboarding speed vary by employer.'
    ],
    talkingPoints: entry.talkingPoints?.length ? entry.talkingPoints : buildFallbackTalkingPoints(),
    objections: entry.objections?.length ? entry.objections : buildFallbackObjections(),
    warnMajorSystems: entry.warnMajorSystems?.length ? entry.warnMajorSystems : competitionSystems.map((s) => s.name),
    hospitalRankings: entry.hospitalRankings?.length ? entry.hospitalRankings : rankingFallback,
    hospitalRegistry: entry.hospitalRegistry?.length ? entry.hospitalRegistry : hospitalRegistryFallback,
    clinicRegistry: entry.clinicRegistry?.length ? entry.clinicRegistry : clinicRegistryFallback,
    candidateInsights: candidateInsightsWithIndiana,
    candidateMetroTable: candidateMetroWithIndiana,
    priorityMetros: entry.priorityMetros?.length ? entry.priorityMetros : inferredMetros,
    newsKeywords: entry.newsKeywords?.length ? entry.newsKeywords : [stateName, state, ...inferredMetros].filter(Boolean)
  };

  return merged;
};

const renderBeaconList = (container, items, formatter) => {
  if (!container) return;
  if (!items.length) {
    container.innerHTML = '<div class="empty-state">No data available yet.</div>';
    return;
  }
  container.innerHTML = items.map((item) => formatter(item)).join('');
};

const setStateBeaconProsMode = (mode) => {
  stateBeaconProsMode = mode === STATE_BEACON_PROS_MODE_HOME
    ? STATE_BEACON_PROS_MODE_HOME
    : STATE_BEACON_PROS_MODE_TARGET;
  stateBeaconProsToggleTarget?.classList.toggle('active', stateBeaconProsMode === STATE_BEACON_PROS_MODE_TARGET);
  stateBeaconProsToggleHome?.classList.toggle('active', stateBeaconProsMode === STATE_BEACON_PROS_MODE_HOME);
};

const getStateBeaconProsConsPayload = (targetStateAbbrev, targetEntry, homeStateAbbrev) => {
  const targetName = targetEntry?.name || STATE_NAMES[targetStateAbbrev] || targetStateAbbrev;
  const resolvedHome = homeStateAbbrev || STATE_BEACON_HOME_DEFAULT;
  const homeEntry = getBeaconEntry(resolvedHome);
  const homeName = homeEntry?.name || STATE_NAMES[resolvedHome] || resolvedHome;

  if (stateBeaconProsMode === STATE_BEACON_PROS_MODE_HOME) {
    return {
      pros: Array.isArray(homeEntry?.pros) ? homeEntry.pros : [],
      cons: Array.isArray(homeEntry?.cons) ? homeEntry.cons : [],
      prosTitle: `${homeName} Pros (vs ${targetName})`,
      consTitle: `${homeName} Cons (vs ${targetName})`
    };
  }

  return {
    pros: Array.isArray(targetEntry?.pros) ? targetEntry.pros : [],
    cons: Array.isArray(targetEntry?.cons) ? targetEntry.cons : [],
    prosTitle: `${targetName} Pros (vs ${homeName})`,
    consTitle: `${targetName} Cons (vs ${homeName})`
  };
};

const buildHospitalRank = (notices, majorSystems = []) => {
  const grouped = [];
  const healthcareNotices = filterNoticesByMajorSystems(notices, majorSystems)
    .filter((notice) => isHealthcareNotice(notice));
  groupBy(healthcareNotices, (notice) => notice.employer_name || notice.employerName).forEach((items, employer) => {
    const totalAffected = items.reduce((sum, n) => sum + Number(n.affectedCount || n.employees_affected || 0), 0);
    grouped.push({
      employer,
      notices: items.length,
      affected: totalAffected
    });
  });
  grouped.sort((a, b) => b.affected - a.affected || b.notices - a.notices);
  const worst = grouped.slice(0, 5);
  const best = grouped.slice(-5).reverse();
  return { best, worst };
};

const getWarnCountForHospital = (notices, hospital, majorSystems = []) => {
  const targets = [
    hospital.match,
    hospital.name,
    hospital.system
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  if (!targets.length) return 0;

  return notices.filter((notice) => {
    if (!isHealthcareNotice(notice)) return false;
    if (!isMajorSystemNotice(notice, majorSystems)) return false;
    const employer = String(notice.employer_name || notice.employerName || '').toLowerCase();
    const system = String(notice.parent_system || '').toLowerCase();
    return targets.some((target) => employer.includes(target) || system.includes(target));
  }).length;
};

const renderStateBeacon = async (state) => {
  await loadStateBeaconData();
  await ensureProgramsDataForBeacon();
  await loadStateNewsData();

  const notices = getStateNotices(state);
  const programsInState = nursingPrograms.filter((program) => normalizeProgram(program).state === state);
  const entry = enrichBeaconEntry(state, getBeaconEntry(state), notices, programsInState);
  const majorNotices = filterNoticesByMajorSystems(notices, entry.warnMajorSystems);
  const noticeCount = majorNotices.length;

  const chips = [];
  if (entry.compact !== null) chips.push(`Compact: ${entry.compact ? 'Yes' : 'No'}`);
  if (entry.summary?.demand) chips.push(`Demand: ${entry.summary.demand}`);
  if (entry.summary?.unionization) chips.push(`Union: ${entry.summary.unionization}`);
  if (programsInState.length) chips.push(`Pipeline: ${programsInState.length} programs`);
  if (noticeCount) chips.push(`WARN notices (major systems): ${noticeCount}`);

  if (stateBeaconMeta) {
    stateBeaconMeta.innerHTML = chips.map((chip) => `<span class="state-beacon-chip">${escapeHtml(chip)}</span>`).join('');
  }

  let hospitalItems = [];
  if (entry.hospitalRankings?.length) {
    const scored = entry.hospitalRankings.map((hospital) => {
      const baseScore = Number(hospital.baseScore ?? 50);
      const warnWeight = Number(hospital.warnWeight ?? 1);
      const warnCount = getWarnCountForHospital(majorNotices, hospital, entry.warnMajorSystems);
      const score = baseScore - (warnCount * warnWeight);
      return { ...hospital, warnCount, score };
    }).sort((a, b) => b.score - a.score);

    const best = scored.slice(0, 5);
    const worst = scored.slice(-5).reverse();
    hospitalItems = [
      ...best.map((item) => ({ ...item, label: 'Best (review + news score)' })),
      ...worst.map((item) => ({ ...item, label: 'Watchlist (review + WARN)' }))
    ];

    renderBeaconList(stateBeaconHospitals, hospitalItems, (item) => `
      <div class="state-beacon-item">
        <strong>${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(item.label)} • Score ${item.score.toFixed(1)} • WARN ${item.warnCount}</span>
      </div>
    `);
  } else {
    const { best, worst } = buildHospitalRank(majorNotices, entry.warnMajorSystems);
    hospitalItems = [
      ...best.map((item) => ({ ...item, label: 'Best (low WARN activity)' })),
      ...worst.map((item) => ({ ...item, label: 'Watchlist (high WARN activity)' }))
    ];
    renderBeaconList(stateBeaconHospitals, hospitalItems, (item) => `
      <div class="state-beacon-item">
        <strong>${escapeHtml(item.employer)}</strong>
        <span>${escapeHtml(item.label)} • ${item.notices} notices</span>
      </div>
    `);
  }

  const hospitalRegistry = entry.hospitalRegistry || [];
  renderBeaconList(stateBeaconHospitalsAll, hospitalRegistry, (item) => `
    <div class="state-beacon-item">
      <strong>${escapeHtml(item.name)}</strong>
      <span>
        ${item.flagship ? '<span class="state-beacon-badge">Flagship</span>' : ''}
        ${item.county ? `${escapeHtml(item.county)} County` : ''}
      </span>
    </div>
  `);

  const clinicRegistry = entry.clinicRegistry || [];
  renderBeaconList(stateBeaconClinics, clinicRegistry, (item) => `
    <div class="state-beacon-item">
      <strong>${escapeHtml(item.name)}</strong>
      <span>
        ${item.flagship ? '<span class="state-beacon-badge">Flagship</span>' : ''}
        ${item.metro ? `• ${escapeHtml(item.metro)}` : ''}
      </span>
    </div>
  `);

  const competitionSystems = entry.competition?.systems?.length
    ? entry.competition.systems
    : Array.from(groupBy(majorNotices, (n) => n.parent_system || n.employer_name || n.employerName).entries())
      .map(([name, items]) => ({ name, presence: `${items.length} notices`, notes: 'Derived from WARN activity.' }))
      .slice(0, 6);

  renderBeaconList(stateBeaconCompetition, competitionSystems, (system) => `
    <div class="state-beacon-item">
      <strong>${escapeHtml(system.name)}</strong>
      <span>${escapeHtml(system.presence || '')} ${system.notes ? `• ${escapeHtml(system.notes)}` : ''}</span>
    </div>
  `);

  const programsByLevel = programsInState.reduce((acc, program) => {
    const level = normalizeProgram(program).level || 'Other';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});
  const pipelineItems = [
    ...(entry.pipeline?.majorPrograms || []).map((name) => ({ title: name, detail: 'Major program' })),
    ...Object.entries(programsByLevel).map(([level, count]) => ({ title: level, detail: `${count} programs` })),
    ...(entry.pipeline?.residencies || []).map((name) => ({ title: name, detail: 'Residency pipeline' }))
  ];
  renderBeaconList(stateBeaconPipeline, pipelineItems, (item) => `
    <div class="state-beacon-item">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.detail)}</span>
    </div>
  `);

  renderBeaconList(stateBeaconCandidates, entry.candidateInsights || [], (item) => `
    <div class="state-beacon-item">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.detail || '')}</span>
    </div>
  `);

  if (stateBeaconCandidateTable) {
    if (entry.candidateMetroTable?.length) {
      const rows = entry.candidateMetroTable
        .map((row) => `
          <tr>
            <td>${escapeHtml(row.metro)}</td>
            <td>${escapeHtml(row.estimate)}</td>
            <td>${escapeHtml(row.feederSchools)}</td>
          </tr>
        `)
        .join('');
      stateBeaconCandidateTable.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>${escapeHtml(entry.name)} Metro Area</th>
              <th>Est. Home-State-Educated RNs</th>
              <th>Top Home-State Feeder Schools</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    } else {
      stateBeaconCandidateTable.innerHTML = '';
    }
  }

  const stateFeed = getStateNewsFeed(state, entry);
  let newsMatches = [];
  if (stateFeed.length) {
    newsMatches = stateFeed
      .slice()
      .sort((a, b) => new Date(b.publishedAt || b.date || 0) - new Date(a.publishedAt || a.date || 0))
      .slice(0, 12);
  } else {
    const keywords = (entry.newsKeywords || []).map((word) => word.toLowerCase());
    newsMatches = newsArticles.filter((article) => {
      const haystack = `${article.title} ${article.summary}`.toLowerCase();
      return keywords.some((word) => word && haystack.includes(word));
    }).slice(0, 6);
  }
  renderBeaconList(stateBeaconNews, newsMatches, (article) => `
    <a href="${article.url}" target="_blank" rel="noopener noreferrer">
      <strong>${escapeHtml(article.title)}</strong>
      <div class="state-beacon-subtitle">${escapeHtml(article.source || '')}${article.publishedAt ? ` • ${escapeHtml(article.publishedAt)}` : ''}</div>
    </a>
  `);

  const activeHomeState = stateBeaconHomeSelect?.value || getStateBeaconInputs()?.homeState || STATE_BEACON_HOME_DEFAULT;
  const prosCons = getStateBeaconProsConsPayload(state, entry, activeHomeState);
  if (stateBeaconProsTitle) stateBeaconProsTitle.textContent = prosCons.prosTitle;
  if (stateBeaconConsTitle) stateBeaconConsTitle.textContent = prosCons.consTitle;
  if (stateBeaconPros) {
    stateBeaconPros.innerHTML = prosCons.pros.length
      ? prosCons.pros.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
      : '<li>No pros listed yet.</li>';
  }
  if (stateBeaconCons) {
    stateBeaconCons.innerHTML = prosCons.cons.length
      ? prosCons.cons.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
      : '<li>No cons listed yet.</li>';
  }

  const notes = getStateBeaconNotes();
  const savedNotes = notes[state] || {};
  if (stateBeaconAttractions) {
    stateBeaconAttractions.value = savedNotes.attractions ?? entry.attractions.join('\n');
  }
  if (stateBeaconDrawbacks) {
    stateBeaconDrawbacks.value = savedNotes.drawbacks ?? entry.drawbacks.join('\n');
  }

  const inputs = getStateBeaconInputs() || {
    homeState: STATE_BEACON_HOME_DEFAULT,
    specialty: 'General RN',
    experience: '3-5 years',
    shift: 'Day',
    targetPay: '',
    timeline: '31-60 days',
    license: entry.compact ? 'Compact' : 'No license'
  };

  if (stateBeaconSpecialty) stateBeaconSpecialty.value = inputs.specialty;
  if (stateBeaconExperience) stateBeaconExperience.value = inputs.experience;
  if (stateBeaconShift) stateBeaconShift.value = inputs.shift;
  if (stateBeaconTargetPay) stateBeaconTargetPay.value = inputs.targetPay;
  if (stateBeaconTimeline) stateBeaconTimeline.value = inputs.timeline;
  if (stateBeaconLicense) stateBeaconLicense.value = inputs.license;
  if (stateBeaconHomeSelect) stateBeaconHomeSelect.value = inputs.homeState || STATE_BEACON_HOME_DEFAULT;

  const metro = entry.priorityMetros?.[0] || entry.name;
  const tokens = {
    state: entry.name,
    homeState: STATE_NAMES[inputs.homeState] || inputs.homeState || STATE_BEACON_HOME_DEFAULT,
    homeStateAbbr: inputs.homeState || STATE_BEACON_HOME_DEFAULT,
    targetState: STATE_NAMES[state] || state,
    targetStateAbbr: state,
    specialty: inputs.specialty,
    shift: inputs.shift,
    targetPay: inputs.targetPay ? `$${inputs.targetPay}/hr` : 'competitive rates',
    timeline: inputs.timeline,
    license: inputs.license,
    metro
  };

  renderBeaconList(stateBeaconScript, entry.talkingPoints, (point) => `
    <div class="state-beacon-item">
      <strong>•</strong>
      <span>${escapeHtml(replaceTokens(point, tokens))}</span>
    </div>
  `);

  renderBeaconList(stateBeaconObjections, entry.objections, (item) => `
    <div class="state-beacon-item">
      <strong>${escapeHtml(replaceTokens(item.concern, tokens))}</strong>
      <span>${escapeHtml(replaceTokens(item.response, tokens))}</span>
    </div>
  `);
};

const buildStateBeaconExport = (state) => {
  const notices = getStateNotices(state);
  const programsInState = nursingPrograms.filter((program) => normalizeProgram(program).state === state);
  const entry = enrichBeaconEntry(state, getBeaconEntry(state), notices, programsInState);
  const majorNotices = filterNoticesByMajorSystems(notices, entry.warnMajorSystems);
  const { best, worst } = buildHospitalRank(majorNotices, entry.warnMajorSystems);
  const competitionSystems = entry.competition?.systems?.length
    ? entry.competition.systems
    : Array.from(groupBy(majorNotices, (n) => n.parent_system || n.employer_name || n.employerName).entries())
      .map(([name, items]) => ({ name, presence: `${items.length} notices`, notes: 'Derived from WARN activity.' }))
      .slice(0, 6);
  const programsByLevel = programsInState.reduce((acc, program) => {
    const level = normalizeProgram(program).level || 'Other';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const inputs = getStateBeaconInputs() || {};
  const metro = entry.priorityMetros?.[0] || entry.name;
  const tokens = {
    state: entry.name,
    homeState: STATE_NAMES[inputs.homeState] || inputs.homeState || STATE_BEACON_HOME_DEFAULT,
    homeStateAbbr: inputs.homeState || STATE_BEACON_HOME_DEFAULT,
    targetState: STATE_NAMES[state] || state,
    targetStateAbbr: state,
    specialty: inputs.specialty || 'General RN',
    shift: inputs.shift || 'Day',
    targetPay: inputs.targetPay ? `$${inputs.targetPay}/hr` : 'competitive rates',
    timeline: inputs.timeline || '31-60 days',
    license: inputs.license || (entry.compact ? 'Compact' : 'No license'),
    metro
  };
  const talkingPoints = entry.talkingPoints.map((point) => replaceTokens(point, tokens));
  const objections = entry.objections.map((item) => ({
    concern: replaceTokens(item.concern, tokens),
    response: replaceTokens(item.response, tokens)
  }));
  const newsFeed = getStateNewsFeed(state, entry);
  const notes = getStateBeaconNotes();
  const savedNotes = notes[state] || {};
  const exportNotes = {
    attractions: savedNotes.attractions ?? entry.attractions.join('\n'),
    drawbacks: savedNotes.drawbacks ?? entry.drawbacks.join('\n')
  };

  return {
    generatedAt: new Date().toISOString(),
    state,
    name: entry.name,
    inputs,
    summary: entry.summary,
    compensation: entry.compensation,
    licensing: entry.licensing,
    market: entry.market,
    competition: {
      systems: competitionSystems,
      agencyPresence: entry.competition?.agencyPresence || '',
      privateEquity: entry.competition?.privateEquity || ''
    },
    hospitals: {
      best,
      watchlist: worst
    },
    hospitalRegistry: entry.hospitalRegistry,
    clinicRegistry: entry.clinicRegistry,
    pipeline: {
      programsCount: programsInState.length,
      programsByLevel,
      majorPrograms: entry.pipeline?.majorPrograms || [],
      residencies: entry.pipeline?.residencies || [],
      clinicalPartners: entry.pipeline?.clinicalPartners || []
    },
    candidateInsights: entry.candidateInsights || [],
    candidateMetroTable: entry.candidateMetroTable || [],
    candidateModel: entry.candidateModel || null,
    pros: getStateBeaconProsConsPayload(state, entry, inputs.homeState || STATE_BEACON_HOME_DEFAULT).pros,
    cons: getStateBeaconProsConsPayload(state, entry, inputs.homeState || STATE_BEACON_HOME_DEFAULT).cons,
    attractions: exportNotes.attractions,
    drawbacks: exportNotes.drawbacks,
    talkingPoints,
    objections,
    newsFeed
  };
};

const renderHomeState = async (homeState) => {
  await loadStateBeaconData();
  await ensureProgramsDataForBeacon();
  await loadStateNewsData();

  const entry = getBeaconEntry(homeState);
  const notices = getStateNotices(homeState);
  const majorNotices = filterNoticesByMajorSystems(notices, entry.warnMajorSystems);
  const noticeCount = majorNotices.length;
  const programsInState = nursingPrograms.filter((program) => normalizeProgram(program).state === homeState);

  if (homeStateSelected) {
    homeStateSelected.innerHTML = `<span class="state-beacon-chip">${escapeHtml(entry.name)} (${escapeHtml(homeState)})</span>`;
  }

  const chips = [];
  if (entry.compact !== null) chips.push(`Compact: ${entry.compact ? 'Yes' : 'No'}`);
  if (entry.summary?.demand) chips.push(`Demand: ${entry.summary.demand}`);
  if (entry.summary?.unionization) chips.push(`Union: ${entry.summary.unionization}`);
  if (programsInState.length) chips.push(`Pipeline: ${programsInState.length} programs`);
  if (noticeCount) chips.push(`WARN notices (major systems): ${noticeCount}`);
  if (homeStateMeta) {
    homeStateMeta.innerHTML = chips.map((chip) => `<span class="state-beacon-chip">${escapeHtml(chip)}</span>`).join('');
  }

  let hospitalItems = [];
  if (entry.hospitalRankings?.length) {
    const scored = entry.hospitalRankings.map((hospital) => {
      const baseScore = Number(hospital.baseScore ?? 50);
      const warnWeight = Number(hospital.warnWeight ?? 1);
      const warnCount = getWarnCountForHospital(majorNotices, hospital, entry.warnMajorSystems);
      const score = baseScore - (warnCount * warnWeight);
      return { ...hospital, warnCount, score };
    }).sort((a, b) => b.score - a.score);

    const best = scored.slice(0, 5);
    const worst = scored.slice(-5).reverse();
    hospitalItems = [
      ...best.map((item) => ({ ...item, label: 'Best (review + news score)' })),
      ...worst.map((item) => ({ ...item, label: 'Watchlist (review + WARN)' }))
    ];

    renderBeaconList(homeStateHospitals, hospitalItems, (item) => `
      <div class="state-beacon-item">
        <strong>${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(item.label)} • Score ${item.score.toFixed(1)} • WARN ${item.warnCount}</span>
      </div>
    `);
  } else {
    const { best, worst } = buildHospitalRank(majorNotices, entry.warnMajorSystems);
    hospitalItems = [
      ...best.map((item) => ({ ...item, label: 'Best (low WARN activity)' })),
      ...worst.map((item) => ({ ...item, label: 'Watchlist (high WARN activity)' }))
    ];
    renderBeaconList(homeStateHospitals, hospitalItems, (item) => `
      <div class="state-beacon-item">
        <strong>${escapeHtml(item.employer)}</strong>
        <span>${escapeHtml(item.label)} • ${item.notices} notices</span>
      </div>
    `);
  }

  const competitionSystems = entry.competition?.systems?.length
    ? entry.competition.systems
    : Array.from(groupBy(majorNotices, (n) => n.parent_system || n.employer_name || n.employerName).entries())
      .map(([name, items]) => ({ name, presence: `${items.length} notices`, notes: 'Derived from WARN activity.' }))
      .slice(0, 6);

  renderBeaconList(homeStateCompetition, competitionSystems, (system) => `
    <div class="state-beacon-item">
      <strong>${escapeHtml(system.name)}</strong>
      <span>${escapeHtml(system.presence || '')} ${system.notes ? `• ${escapeHtml(system.notes)}` : ''}</span>
    </div>
  `);

  const programsByLevel = programsInState.reduce((acc, program) => {
    const level = normalizeProgram(program).level || 'Other';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});
  const pipelineItems = [
    ...(entry.pipeline?.majorPrograms || []).map((name) => ({ title: name, detail: 'Major program' })),
    ...Object.entries(programsByLevel).map(([level, count]) => ({ title: level, detail: `${count} programs` })),
    ...(entry.pipeline?.residencies || []).map((name) => ({ title: name, detail: 'Residency pipeline' }))
  ];
  renderBeaconList(homeStatePipeline, pipelineItems, (item) => `
    <div class="state-beacon-item">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.detail)}</span>
    </div>
  `);

  const stateFeed = getStateNewsFeed(homeState, entry);
  let newsMatches = [];
  if (stateFeed.length) {
    newsMatches = stateFeed
      .slice()
      .sort((a, b) => new Date(b.publishedAt || b.date || 0) - new Date(a.publishedAt || a.date || 0))
      .slice(0, 12);
  } else {
    const keywords = (entry.newsKeywords || []).map((word) => word.toLowerCase());
    newsMatches = newsArticles.filter((article) => {
      const haystack = `${article.title} ${article.summary}`.toLowerCase();
      return keywords.some((word) => word && haystack.includes(word));
    }).slice(0, 6);
  }
  renderBeaconList(homeStateNews, newsMatches, (article) => `
    <a href="${article.url}" target="_blank" rel="noopener noreferrer">
      <strong>${escapeHtml(article.title)}</strong>
      <div class="state-beacon-subtitle">${escapeHtml(article.source || '')}${article.publishedAt ? ` • ${escapeHtml(article.publishedAt)}` : ''}</div>
    </a>
  `);

  if (homeStatePros) {
    homeStatePros.innerHTML = entry.pros.length
      ? entry.pros.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
      : '<li>No pros listed yet.</li>';
  }
  if (homeStateCons) {
    homeStateCons.innerHTML = entry.cons.length
      ? entry.cons.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
      : '<li>No cons listed yet.</li>';
  }
};

const openHomeState = async () => {
  const inputs = getStateBeaconInputs() || {};
  const homeState = stateBeaconHomeSelect?.value || inputs.homeState || STATE_BEACON_HOME_DEFAULT;
  if (stateBeaconHomeSelect && stateBeaconHomeSelect.value !== homeState) {
    stateBeaconHomeSelect.value = homeState;
  }
  await renderHomeState(homeState);
  homeStateModal?.classList.add('active');
};

const closeHomeState = () => homeStateModal?.classList.remove('active');

const buildHomeStateExport = (state) => {
  const notices = getStateNotices(state);
  const programsInState = nursingPrograms.filter((program) => normalizeProgram(program).state === state);
  const entry = enrichBeaconEntry(state, getBeaconEntry(state), notices, programsInState);
  const majorNotices = filterNoticesByMajorSystems(notices, entry.warnMajorSystems);
  const programsByLevel = programsInState.reduce((acc, program) => {
    const level = normalizeProgram(program).level || 'Other';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});
  const { best, worst } = buildHospitalRank(majorNotices, entry.warnMajorSystems);
  const competitionSystems = entry.competition?.systems?.length
    ? entry.competition.systems
    : Array.from(groupBy(majorNotices, (n) => n.parent_system || n.employer_name || n.employerName).entries())
      .map(([name, items]) => ({ name, presence: `${items.length} notices`, notes: 'Derived from WARN activity.' }))
      .slice(0, 6);
  const stateFeed = getStateNewsFeed(state, entry);
  let newsMatches = [];
  if (stateFeed.length) {
    newsMatches = stateFeed
      .slice()
      .sort((a, b) => new Date(b.publishedAt || b.date || 0) - new Date(a.publishedAt || a.date || 0))
      .slice(0, 12);
  } else {
    const keywords = (entry.newsKeywords || []).map((word) => word.toLowerCase());
    newsMatches = newsArticles.filter((article) => {
      const haystack = `${article.title} ${article.summary}`.toLowerCase();
      return keywords.some((word) => word && haystack.includes(word));
    }).slice(0, 6);
  }

  return {
    generatedAt: new Date().toISOString(),
    state,
    name: entry.name,
    compact: entry.compact,
    summary: entry.summary,
    noticeCount: majorNotices.length,
    programsCount: programsInState.length,
    programsByLevel,
    hospitals: { best, watchlist: worst },
    competitionSystems,
    pipeline: entry.pipeline || {},
    pros: entry.pros || [],
    cons: entry.cons || [],
    newsFeed: newsMatches
  };
};

const buildHomeStateExportRows = (data) => {
  const rows = [];
  const pushRow = (section, item, detail = '') => rows.push([section, item, detail]);

  pushRow('Overview', 'State', data.name);
  pushRow('Overview', 'Generated At', data.generatedAt);
  if (data.compact !== null && data.compact !== undefined) {
    pushRow('Overview', 'Compact', data.compact ? 'Yes' : 'No');
  }
  pushRow('Overview', 'Programs', data.programsCount);
  pushRow('Overview', 'WARN notices', data.noticeCount);
  Object.entries(data.summary || {}).forEach(([key, value]) => pushRow('Summary', key, value));

  data.hospitals?.best?.forEach((item) => pushRow('Hospitals Best', item.employer, `${item.notices} notices`));
  data.hospitals?.watchlist?.forEach((item) => pushRow('Hospitals Watchlist', item.employer, `${item.notices} notices`));

  data.competitionSystems?.forEach((system) => {
    pushRow('Competition', system.name, [system.presence, system.notes].filter(Boolean).join(' • '));
  });

  pushRow('Pipeline', 'Programs count', data.programsCount);
  Object.entries(data.programsByLevel || {}).forEach(([level, count]) => pushRow('Pipeline', level, count));
  (data.pipeline?.majorPrograms || []).forEach((program) => pushRow('Pipeline Major Programs', program, ''));
  (data.pipeline?.residencies || []).forEach((entry) => pushRow('Pipeline Residencies', entry, ''));

  data.newsFeed?.forEach((article) => {
    const meta = [article.source, article.publishedAt || article.date].filter(Boolean).join(' • ');
    pushRow('News', article.title || 'Untitled', meta);
  });

  data.pros?.forEach((item) => pushRow('Pros', item, ''));
  data.cons?.forEach((item) => pushRow('Cons', item, ''));

  return rows;
};

const targetStateMetroDataCache = {};
const targetStateMetroDataLoadedAt = {};
const TARGET_STATE_REFRESH_MS = STATE_BEACON_REFRESH_MS;
let targetStateMetrosData = null;

const loadTargetStateMetrosData = async () => {
  if (targetStateMetrosData) return targetStateMetrosData;
  try {
    targetStateMetrosData = await fetchJson(`/data/target-state-metros.json?ts=${Date.now()}`);
  } catch (err) {
    targetStateMetrosData = null;
  }
  return targetStateMetrosData;
};

const loadTargetStateNotices = async (stateAbbrev) => {
  try {
    const response = await fetchJson(`/notices?state=${stateAbbrev}&limit=500`);
    return Array.isArray(response?.notices) ? response.notices : [];
  } catch (err) {
    console.warn(`Target state notices unavailable for ${stateAbbrev}:`, err.message);
    return [];
  }
};

const parseHourlyAverageFromRange = (value) => {
  const text = String(value || '');
  const range = text.match(/\$?\s*(\d+(?:\.\d+)?)\s*-\s*\$?\s*(\d+(?:\.\d+)?)\s*\/?\s*hr/i);
  if (range) {
    const low = Number(range[1]);
    const high = Number(range[2]);
    if (Number.isFinite(low) && Number.isFinite(high) && high >= low) {
      return `$${((low + high) / 2).toFixed(2)}/hr`;
    }
  }
  const single = text.match(/\$?\s*(\d+(?:\.\d+)?)\s*\/?\s*hr/i);
  if (single) {
    const hourly = Number(single[1]);
    if (Number.isFinite(hourly)) {
      return `$${hourly.toFixed(2)}/hr`;
    }
  }
  return null;
};

const parseHourlyValue = (value) => {
  const text = String(value || '');
  const m = text.match(/\$?\s*(\d+(?:\.\d+)?)\s*\/?\s*hr/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
};

const deriveStaffRangeFromHourly = (hourly) => {
  const low = Math.max(20, Math.round((hourly - 4) * 100) / 100);
  const high = Math.max(low, Math.round((hourly + 4) * 100) / 100);
  return `$${low.toFixed(2)}-$${high.toFixed(2)}/hr`;
};

const deriveTravelRangeFromHourly = (hourly) => {
  const low = Math.max(1200, Math.round(hourly * 36));
  const high = Math.max(low, Math.round(hourly * 42));
  return `$${low}-${high}/wk`;
};

const parseStateBenchmarkHourly = (stateSalaryMeta = null) => {
  const rows = Array.isArray(stateSalaryMeta?.breakdown) ? stateSalaryMeta.breakdown : [];
  for (const row of rows) {
    const n = parseHourlyValue(row?.value);
    if (Number.isFinite(n)) return n;
    const avgFromRange = parseHourlyAverageFromRange(row?.value);
    const avgN = parseHourlyValue(avgFromRange);
    if (Number.isFinite(avgN)) return avgN;
  }
  return 40;
};

const normalizeTargetMetroSalary = (metro = {}, stateSalaryMeta = null) => {
  const salary = (metro && typeof metro.salary === 'object' && metro.salary !== null) ? metro.salary : {};
  const benchmarkHourly = parseStateBenchmarkHourly(stateSalaryMeta);
  const staffRNRaw = salary.staffRN || '';
  const travelRNRaw = salary.travelRN || '';
  const staffRN = staffRNRaw && !/market-based/i.test(staffRNRaw)
    ? staffRNRaw
    : deriveStaffRangeFromHourly(benchmarkHourly);
  const travelRN = travelRNRaw && !/market-based/i.test(travelRNRaw)
    ? travelRNRaw
    : deriveTravelRangeFromHourly(benchmarkHourly);
  const signOn = salary.signOn || 'Varies by system';
  const averageWage = salary.averageWage
    || parseHourlyAverageFromRange(staffRN)
    || parseHourlyAverageFromRange(stateSalaryMeta?.breakdown?.[0]?.value)
    || `$${benchmarkHourly.toFixed(2)}/hr`;

  const hasConcreteBreakdown = Array.isArray(salary.breakdown) && salary.breakdown.some((item) => {
    const value = String(item?.value || '').trim();
    return value && !/market-based|unavailable|n\/a|--/i.test(value);
  });
  const breakdown = hasConcreteBreakdown
    ? salary.breakdown
    : [
        { label: 'State RN baseline (est.)', value: averageWage, note: 'Derived from state and metro benchmark inputs' },
        { label: 'Staff RN range (metro est.)', value: staffRN, note: 'Estimated metro hiring range' },
        { label: 'Travel RN range (weekly est.)', value: travelRN, note: 'Estimated weekly travel pay band' }
      ];

  const systems = Array.isArray(salary.systems) ? salary.systems : [];
  const sources = Array.isArray(salary.sources) && salary.sources.length
    ? salary.sources
    : (Array.isArray(stateSalaryMeta?.sources) ? stateSalaryMeta.sources : []);

  return {
    ...salary,
    staffRN,
    travelRN,
    signOn,
    averageWage,
    breakdown,
    systems,
    sources,
    updatedAt: salary.updatedAt || stateSalaryMeta?.updatedAt || null,
    updateEveryDays: Number(salary.updateEveryDays || stateSalaryMeta?.updateEveryDays || 7)
  };
};

const normalizeTargetMetro = (metro = {}, stateSalaryMeta = null) => ({
  name: String(metro.name || 'Regional Hub'),
  size: metro.size || 'small',
  population: metro.population || 'N/A',
  competition: metro.competition || 'medium',
  hospitals: Array.isArray(metro.hospitals) ? metro.hospitals : [],
  systems: Array.isArray(metro.systems) ? metro.systems : [],
  salary: normalizeTargetMetroSalary(metro, stateSalaryMeta),
  factors: Array.isArray(metro.factors) && metro.factors.length
    ? metro.factors
    : [{ text: 'Metro detail generated from available data sources.', type: 'neutral' }]
});

const buildTargetStateMetroRows = (stateAbbrev, notices) => {
  const stateName = STATE_NAMES[stateAbbrev] || stateAbbrev;
  const healthcare = (notices || []).filter((notice) => isHealthcareNotice(notice));
  const byCity = groupBy(healthcare, (notice) => String(notice.city || '').trim() || stateName);
  const entries = Array.from(byCity.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 8);

  if (!entries.length) {
    return [{
      name: `${stateName} Regional Hub`,
      size: 'medium',
      population: 'N/A',
      competition: 'medium',
      hospitals: [],
      systems: [],
      salary: {
        staffRN: '--',
        travelRN: '--',
        signOn: '--',
        averageWage: '--',
        breakdown: [{ label: 'Average wage (est.)', value: '--', note: 'No metro wage benchmark available yet.' }]
      },
      factors: [{ text: `No recent healthcare notices found for ${stateName}.`, type: 'neutral' }]
    }];
  }

  return entries.map(([city, items]) => {
    const employerGroups = Array.from(
      groupBy(items, (notice) => notice.employer_name || notice.employerName || 'Unknown employer').entries()
    )
      .map(([name, employerItems]) => ({
        name,
        notices: employerItems.length,
        affected: employerItems.reduce((sum, n) => sum + Number(n.affectedCount || n.employees_affected || 0), 0),
        system: employerItems.find((n) => n.parent_system)?.parent_system || name
      }))
      .sort((a, b) => b.affected - a.affected || b.notices - a.notices);

    const hospitals = employerGroups.slice(0, 10).map((employer) => ({
      name: employer.name,
      system: employer.system,
      score: '--',
      beds: '--',
      reviews: '--'
    }));

    const systems = Array.from(groupBy(employerGroups, (row) => row.system).entries())
      .map(([name, rows]) => ({
        name,
        facilities: rows.length,
        marketShare: `${Math.min(60, Math.max(8, rows.length * 8))}%`
      }))
      .sort((a, b) => b.facilities - a.facilities)
      .slice(0, 6);

    const competition = systems.length >= 4 ? 'high' : systems.length >= 2 ? 'medium' : 'low';
    return {
      name: city,
      size: items.length >= 40 ? 'major' : items.length >= 16 ? 'medium' : 'small',
      population: `${Math.max(120, items.length * 40)}K`,
      competition,
      hospitals,
      systems,
      salary: {
        staffRN: 'Market-based',
        travelRN: 'Market-based',
        signOn: 'Varies by system',
        averageWage: 'Market-based',
        breakdown: [
          { label: 'Average wage (est.)', value: 'Market-based', note: 'Live WARN-derived fallback profile' },
          { label: 'Staff RN range', value: 'Market-based', note: 'Range unavailable in fallback data' }
        ]
      },
      factors: [
        { text: `Derived from live WARN healthcare notices for ${stateName}`, type: 'positive' }
      ]
    };
  });
};

const getTargetStateMetroData = async (stateAbbrev) => {
  const fetchedDataset = await loadTargetStateMetrosData();
  const fetchedState = fetchedDataset?.states?.[stateAbbrev];
  if (fetchedState?.metros?.length) {
    const stateSalaryMeta = fetchedState?.salaryMeta || null;
    return {
      ...fetchedState,
      metros: fetchedState.metros.map((metro) => normalizeTargetMetro(metro, stateSalaryMeta))
    };
  }

  const now = Date.now();
  const cached = targetStateMetroDataCache[stateAbbrev];
  const cachedAt = targetStateMetroDataLoadedAt[stateAbbrev] || 0;
  if (cached && (now - cachedAt) < TARGET_STATE_REFRESH_MS) return cached;

  const notices = await loadTargetStateNotices(stateAbbrev);
  const metros = buildTargetStateMetroRows(stateAbbrev, notices);
  const data = { metros: metros.map((metro) => normalizeTargetMetro(metro, null)) };
  targetStateMetroDataCache[stateAbbrev] = data;
  targetStateMetroDataLoadedAt[stateAbbrev] = now;
  return data;
};

const renderTargetState = async (stateAbbrev = TARGET_STATE_DEFAULT) => {
  await loadStateBeaconData();
  await ensureProgramsDataForBeacon();

  const entry = getBeaconEntry(stateAbbrev);
  const programsInState = nursingPrograms.filter((program) => normalizeProgram(program).state === stateAbbrev);
  const metroData = await getTargetStateMetroData(stateAbbrev);
  const metros = metroData?.metros?.length ? metroData.metros : buildTargetStateMetroRows(stateAbbrev, []);

  if (targetStateName) targetStateName.textContent = entry.name;
  if (targetStateAbbr) targetStateAbbr.textContent = stateAbbrev;

  const totalHospitals = metros.reduce((sum, metro) => sum + (metro.hospitals?.length || 0), 0);
  if (targetStateStatHospitals) targetStateStatHospitals.textContent = totalHospitals || '--';
  if (targetStateStatMetros) targetStateStatMetros.textContent = metros.length || '--';
  if (targetStateStatPrograms) targetStateStatPrograms.textContent = programsInState.length || '--';
  if (targetStateStatCompact) targetStateStatCompact.textContent = entry.compact === null ? '--' : (entry.compact ? 'Yes' : 'No');
  if (targetStatePlaceholderText) {
    targetStatePlaceholderText.textContent = `Click on a city from the map to view detailed healthcare market information including hospitals, competition, and salary data for ${entry.name}.`;
  }

  if (targetStateMetroMap) {
    targetStateMetroMap.innerHTML = metros.map((metro, idx) => `
      <div class="metro-city-card" data-metro-index="${idx}">
        <div class="metro-city-icon ${metro.size || 'small'}"></div>
        <div class="metro-city-info">
          <div class="metro-city-name">${escapeHtml(metro.name)}</div>
          <div class="metro-city-meta">${escapeHtml(metro.population || 'N/A')} | ${metro.hospitals?.length || 0} hospitals</div>
        </div>
        <div class="metro-city-indicator ${metro.competition || 'medium'}"></div>
      </div>
    `).join('');

    targetStateMetroMap.querySelectorAll('.metro-city-card').forEach((card) => {
      card.addEventListener('click', () => {
        const idx = Number(card.dataset.metroIndex || 0);
        const metro = metros[idx];
        if (!metro) return;
        selectTargetStateMetro(metro, stateAbbrev);
        targetStateMetroMap.querySelectorAll('.metro-city-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
      });
    });
  }

  currentTargetStateMetro = null;
  if (targetStateDetailPlaceholder) targetStateDetailPlaceholder.style.display = 'flex';
  if (targetStateDetailContent) targetStateDetailContent.style.display = 'none';
};

const selectTargetStateMetro = (metro, stateAbbrev) => {
  currentTargetStateMetro = metro;
  if (targetStateDetailPlaceholder) targetStateDetailPlaceholder.style.display = 'none';
  if (targetStateDetailContent) targetStateDetailContent.style.display = 'block';

  if (targetStateMetroName) targetStateMetroName.textContent = metro.name;
  if (targetStateMetroBadge) {
    targetStateMetroBadge.textContent = metro.size === 'major' ? 'Major Metro' : (metro.size === 'medium' ? 'Regional Hub' : 'Local Market');
  }

  const hospitals = metro.hospitals || [];
  if (targetStateHospitalCount) targetStateHospitalCount.textContent = `${hospitals.length} facilities`;
  if (targetStateMetroHospitals) {
    targetStateMetroHospitals.innerHTML = hospitals.map((h, idx) => `
      <div class="hospital-card">
        <div class="hospital-rank">${idx + 1}</div>
        <div class="hospital-info">
          <div class="hospital-name">${escapeHtml(h.name)}</div>
          <div class="hospital-details">
            <span>${escapeHtml(h.system || '--')}</span>
            <span>${escapeHtml(String(h.beds ?? '--'))} beds</span>
            <span>* ${escapeHtml(String(h.reviews ?? '--'))}</span>
          </div>
        </div>
        <div class="hospital-score">
          <span class="score-value">${escapeHtml(String(h.score ?? '--'))}</span>
          <span class="score-label">Composite Score</span>
        </div>
      </div>
    `).join('');
  }

  const systems = metro.systems || [];
  if (targetStateMetroCompetition) {
    targetStateMetroCompetition.innerHTML = systems.map((s) => `
      <div class="competition-card">
        <div class="competition-name">${escapeHtml(s.name)}</div>
        <div class="competition-details">${escapeHtml(String(s.facilities || 0))} facilities | ${escapeHtml(s.marketShare || '--')} market share</div>
      </div>
    `).join('');
  }

  const metroData = targetStateMetroDataCache[stateAbbrev] || { salaryMeta: {} };
  const salaryMeta = metroData?.salaryMeta || {};
  const salary = normalizeTargetMetroSalary(metro, salaryMeta);
  const breakdown = Array.isArray(salary.breakdown) ? salary.breakdown : [];
  const salarySystems = Array.isArray(salary.systems) ? salary.systems : [];
  const sources = Array.isArray(salary.sources) ? salary.sources : [];
  if (targetStateMetroSalary) {
    const breakdownHtml = breakdown.length ? `
      <div class="salary-breakdown">
        <div class="salary-breakdown-title">Estimated salary breakdown</div>
        <div class="salary-breakdown-section">
          <div class="salary-breakdown-grid">
            ${breakdown.map((item) => `
              <div class="salary-breakdown-item">
                <div class="salary-breakdown-label">${escapeHtml(item.label || '--')}</div>
                <div class="salary-breakdown-value">${escapeHtml(item.value || '--')}</div>
                ${item.note ? `<div class="salary-breakdown-note">${escapeHtml(item.note)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        ${salarySystems.length ? `
          <div class="salary-breakdown-section">
            <div class="salary-breakdown-subtitle">Major systems (est.)</div>
            <div class="salary-system-grid">
              ${salarySystems.map((item) => `
                <div class="salary-system-item">
                  <div class="salary-system-name">${escapeHtml(item.name || '--')}</div>
                  <div class="salary-system-value">${escapeHtml(item.value || '--')}</div>
                  ${item.source ? `<div class="salary-system-source">${escapeHtml(item.source)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        ${sources.length ? `
          <div class="salary-breakdown-sources">
            <span class="salary-breakdown-sources-label">Sources:</span>
            ${sources.map((src, idx) => `
              <a href="${escapeHtml(src.url || '#')}" target="_blank" rel="noopener noreferrer">${escapeHtml(src.name || 'Source')}</a>${idx < sources.length - 1 ? '<span class="source-sep">|</span>' : ''}
            `).join('')}
          </div>
        ` : ''}
      </div>
    ` : '';

    targetStateMetroSalary.innerHTML = `
      <div class="salary-card">
        <div class="salary-value">${escapeHtml(salary.averageWage || '--')}</div>
        <div class="salary-label">Average Wage</div>
      </div>
      <div class="salary-card">
        <div class="salary-value">${escapeHtml(salary.staffRN || '--')}</div>
        <div class="salary-label">Staff RN</div>
      </div>
      <div class="salary-card">
        <div class="salary-value">${escapeHtml(salary.travelRN || '--')}</div>
        <div class="salary-label">Travel RN</div>
      </div>
      <div class="salary-card">
        <div class="salary-value">${escapeHtml(salary.signOn || '--')}</div>
        <div class="salary-label">Sign-On</div>
      </div>
      ${breakdownHtml}
    `;
  }

  const factors = metro.factors || [];
  if (targetStateMetroFactors) {
    targetStateMetroFactors.innerHTML = factors.map((f) => `
      <span class="factor-tag ${f.type || 'neutral'}">${escapeHtml(f.text)}</span>
    `).join('');
  }
};

const openTargetState = async () => {
  const state = getMapTargetState() || targetStateSelect?.value || TARGET_STATE_DEFAULT;
  if (targetStateSelect) targetStateSelect.value = state;
  await renderTargetState(state);
  targetStateModal?.classList.add('active');
  closeModulesMenu();
};

const closeTargetState = () => targetStateModal?.classList.remove('active');

const buildTargetStateExport = async (stateAbbrev, options = {}) => {
  const { scope = 'all' } = options;
  const entry = getBeaconEntry(stateAbbrev);
  const programsInState = nursingPrograms.filter((program) => normalizeProgram(program).state === stateAbbrev);
  const metroData = await getTargetStateMetroData(stateAbbrev);
  const metros = metroData?.metros || [];
  const totalHospitals = metros.reduce((sum, metro) => sum + (metro.hospitals?.length || 0), 0);
  const selectedMetro = scope === 'selected' ? currentTargetStateMetro : null;
  const metrosForExport = scope === 'selected' && selectedMetro ? [selectedMetro] : metros;

  return {
    generatedAt: new Date().toISOString(),
    state: stateAbbrev,
    name: entry.name,
    compact: entry.compact,
    programsCount: programsInState.length,
    metrosCount: metros.length,
    totalHospitals,
    metros: metrosForExport,
    selectedMetro,
    exportScope: scope
  };
};

const buildTargetStateExportRows = (data) => {
  const rows = [];
  const pushRow = (section, item, detail = '') => rows.push([section, item, detail]);
  const scopeLabel = data.exportScope === 'selected' ? 'Selected Metro' : 'All Metros';

  pushRow('Overview', 'State', data.name);
  pushRow('Overview', 'Generated At', data.generatedAt);
  pushRow('Overview', 'Export Scope', scopeLabel);
  if (data.compact !== null && data.compact !== undefined) {
    pushRow('Overview', 'Compact', data.compact ? 'Yes' : 'No');
  }
  pushRow('Overview', 'Programs', data.programsCount);
  pushRow('Overview', 'Metros', data.metrosCount);
  pushRow('Overview', 'Hospitals', data.totalHospitals);

  if (data.exportScope === 'all') {
    data.metros.forEach((metro) => {
      const detail = [metro.population, `${metro.hospitals?.length || 0} hospitals`, metro.competition].filter(Boolean).join(' | ');
      pushRow('Metro Summary', metro.name, detail);
    });
  }

  if (!data.selectedMetro) {
    if (data.exportScope === 'selected') {
      pushRow('Selected Metro', 'Selection', 'None selected');
    }
    return rows;
  }

  const metro = data.selectedMetro;
  pushRow('Selected Metro', 'Name', metro.name);
  pushRow('Selected Metro', 'Size', metro.size || '');
  if (metro.population) pushRow('Selected Metro', 'Population', metro.population);
  if (metro.competition) pushRow('Selected Metro', 'Competition', metro.competition);

  (metro.hospitals || []).forEach((hospital) => {
    const detail = [hospital.system, `${hospital.beds} beds`, `Rating ${hospital.reviews}`, `Score ${hospital.score}`]
      .filter(Boolean)
      .join(' | ');
    pushRow('Selected Metro Hospitals', hospital.name, detail);
  });

  (metro.systems || []).forEach((system) => {
    const detail = [system.marketShare, `${system.facilities} facilities`].filter(Boolean).join(' | ');
    pushRow('Selected Metro Systems', system.name, detail);
  });

  if (metro.salary) {
    pushRow('Selected Metro Salary', 'Staff RN Hourly', metro.salary.staffRN || '--');
    pushRow('Selected Metro Salary', 'Travel RN Weekly', metro.salary.travelRN || '--');
    pushRow('Selected Metro Salary', 'Sign-On Bonus', metro.salary.signOn || '--');
    (metro.salary.breakdown || []).forEach((item) => {
      const detail = [item.value, item.note].filter(Boolean).join(' | ');
      pushRow('Selected Metro Salary Breakdown', item.label || 'Benchmark', detail);
    });
  }

  (metro.factors || []).forEach((factor) => {
    pushRow('Selected Metro Factors', factor.text, factor.type || '');
  });

  return rows;
};

const exportHomeStateCsv = async () => {
  const inputs = getStateBeaconInputs() || {};
  const homeState = stateBeaconHomeSelect?.value || inputs.homeState || STATE_BEACON_HOME_DEFAULT;
  await loadStateBeaconData();
  await ensureProgramsDataForBeacon();
  await loadStateNewsData();
  const data = buildHomeStateExport(homeState);
  const rows = buildHomeStateExportRows(data);
  const csv = buildCsv(['Section', 'Item', 'Detail'], rows);
  downloadFile(csv, `home-state-${homeState}.csv`, 'text/csv');
  showExportToast('Home State CSV exported.');
};

const exportHomeStateExcel = async () => {
  const inputs = getStateBeaconInputs() || {};
  const homeState = stateBeaconHomeSelect?.value || inputs.homeState || STATE_BEACON_HOME_DEFAULT;
  await loadStateBeaconData();
  await ensureProgramsDataForBeacon();
  await loadStateNewsData();
  const data = buildHomeStateExport(homeState);
  const rows = buildHomeStateExportRows(data);
  downloadExcel({
    title: `Home State - ${data.name}`,
    meta: [`Exported: ${new Date().toLocaleString()}`],
    headers: ['Section', 'Item', 'Detail'],
    rows,
    filename: `home-state-${homeState}.xls`
  });
  showExportToast('Home State Excel exported.');
};

const exportHomeStatePdf = async () => {
  const inputs = getStateBeaconInputs() || {};
  const homeState = stateBeaconHomeSelect?.value || inputs.homeState || STATE_BEACON_HOME_DEFAULT;
  await loadStateBeaconData();
  await ensureProgramsDataForBeacon();
  await loadStateNewsData();
  const data = buildHomeStateExport(homeState);
  const rows = buildHomeStateExportRows(data);
  openPdfExport({
    title: `Home State - ${data.name}`,
    meta: [`Exported: ${new Date().toLocaleString()}`],
    headers: ['Section', 'Item', 'Detail'],
    rows
  });
  showExportToast('Home State PDF opened.');
};

const exportTargetState = async ({ format = 'csv', scope = 'all' } = {}) => {
  const state = targetStateSelect?.value || TARGET_STATE_DEFAULT;
  if (scope === 'selected' && !currentTargetStateMetro) {
    showExportToast('Select a metro to export.');
    return;
  }
  await loadStateBeaconData();
  await ensureProgramsDataForBeacon();
  const data = await buildTargetStateExport(state, { scope });
  const rows = buildTargetStateExportRows(data);
  const scopeLabel = scope === 'selected' ? 'selected-metro' : 'all-metros';
  const metroName = data.selectedMetro?.name
    ? data.selectedMetro.name.replace(/[^a-z0-9]+/gi, '_').toLowerCase()
    : scopeLabel;
  const filenameBase = `target-state-${state}-${metroName}`;

  if (format === 'excel') {
    downloadExcel({
      title: `Target State - ${data.name}`,
      meta: [`Exported: ${new Date().toLocaleString()}`],
      headers: ['Section', 'Item', 'Detail'],
      rows,
      filename: `${filenameBase}.xls`
    });
    showExportToast(`Target State Excel exported (${scope === 'selected' ? 'Selected Metro' : 'All Metros'}).`);
    return;
  }

  if (format === 'pdf') {
    openPdfExport({
      title: `Target State - ${data.name}`,
      meta: [`Exported: ${new Date().toLocaleString()}`],
      headers: ['Section', 'Item', 'Detail'],
      rows
    });
    showExportToast(`Target State PDF opened (${scope === 'selected' ? 'Selected Metro' : 'All Metros'}).`);
    return;
  }

  const csv = buildCsv(['Section', 'Item', 'Detail'], rows);
  downloadFile(csv, `${filenameBase}.csv`, 'text/csv');
  showExportToast(`Target State CSV exported (${scope === 'selected' ? 'Selected Metro' : 'All Metros'}).`);
};

// =============================================================================
// MASTER EXPORT MODULE
// =============================================================================
const MASTER_EXPORT_HOME_STATE = 'IN';
const MASTER_EXPORT_WARN_DAYS = 30;
const MASTER_EXPORT_OUTBOUND_SOURCES = {
  gradOutput: 'https://www.in.gov/pla/nursing-home/nursing-education/',
  migration: 'https://www.census.gov/data/tables/time-series/demo/geographic-mobility/state-to-state-migration.html',
  relocationSurvey: 'https://www.beckershospitalreview.com/quality/nursing/states-where-more-nurses-want-to-relocate/'
};

const buildStateBeaconExportWithHome = (state, homeStateOverride) => {
  const notices = getStateNotices(state);
  const programsInState = nursingPrograms.filter((program) => normalizeProgram(program).state === state);
  const entry = enrichBeaconEntry(state, getBeaconEntry(state), notices, programsInState);
  const majorNotices = filterNoticesByMajorSystems(notices, entry.warnMajorSystems);
  const { best, worst } = buildHospitalRank(majorNotices, entry.warnMajorSystems);
  const competitionSystems = entry.competition?.systems?.length
    ? entry.competition.systems
    : Array.from(groupBy(majorNotices, (n) => n.parent_system || n.employer_name || n.employerName).entries())
      .map(([name, items]) => ({ name, presence: `${items.length} notices`, notes: 'Derived from WARN activity.' }))
      .slice(0, 6);
  const programsByLevel = programsInState.reduce((acc, program) => {
    const level = normalizeProgram(program).level || 'Other';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const rawInputs = getStateBeaconInputs() || {};
  const inputs = {
    ...rawInputs,
    homeState: homeStateOverride
  };
  const metro = entry.priorityMetros?.[0] || entry.name;
  const tokens = {
    state: entry.name,
    homeState: STATE_NAMES[inputs.homeState] || inputs.homeState || STATE_BEACON_HOME_DEFAULT,
    homeStateAbbr: inputs.homeState || STATE_BEACON_HOME_DEFAULT,
    targetState: STATE_NAMES[state] || state,
    targetStateAbbr: state,
    specialty: inputs.specialty || 'General RN',
    shift: inputs.shift || 'Day',
    targetPay: inputs.targetPay ? `$${inputs.targetPay}/hr` : 'competitive rates',
    timeline: inputs.timeline || '31-60 days',
    license: inputs.license || (entry.compact ? 'Compact' : 'No license'),
    metro
  };
  const talkingPoints = entry.talkingPoints.map((point) => replaceTokens(point, tokens));
  const objections = entry.objections.map((item) => ({
    concern: replaceTokens(item.concern, tokens),
    response: replaceTokens(item.response, tokens)
  }));
  const notes = getStateBeaconNotes();
  const savedNotes = notes[state] || {};
  const exportNotes = {
    attractions: savedNotes.attractions ?? entry.attractions.join('\n'),
    drawbacks: savedNotes.drawbacks ?? entry.drawbacks.join('\n')
  };

  return {
    generatedAt: new Date().toISOString(),
    state,
    name: entry.name,
    inputs,
    summary: entry.summary,
    compensation: entry.compensation,
    licensing: entry.licensing,
    market: entry.market,
    competition: {
      systems: competitionSystems,
      agencyPresence: entry.competition?.agencyPresence || '',
      privateEquity: entry.competition?.privateEquity || ''
    },
    hospitals: {
      best,
      watchlist: worst
    },
    hospitalRegistry: entry.hospitalRegistry,
    clinicRegistry: entry.clinicRegistry,
    pipeline: {
      programsCount: programsInState.length,
      programsByLevel,
      majorPrograms: entry.pipeline?.majorPrograms || [],
      residencies: entry.pipeline?.residencies || [],
      clinicalPartners: entry.pipeline?.clinicalPartners || []
    },
    candidateInsights: entry.candidateInsights || [],
    candidateMetroTable: entry.candidateMetroTable || [],
    candidateModel: entry.candidateModel || null,
    pros: entry.pros,
    cons: entry.cons,
    attractions: exportNotes.attractions,
    drawbacks: exportNotes.drawbacks,
    talkingPoints,
    objections
  };
};

const getRecentWarnNoticesForState = async (state, days = MASTER_EXPORT_WARN_DAYS) => {
  let notices = getStateNotices(state);
  if (!notices.length) {
    try {
      const response = await fetchJson(`/notices?state=${state}&limit=500`);
      notices = response.notices ?? [];
    } catch {
      notices = [];
    }
  }
  const since = Date.now() - (days * 24 * 60 * 60 * 1000);
  return notices
    .filter((notice) => isHealthcareNotice(notice))
    .filter((notice) => getNoticeDateValue(notice) >= since);
};

const getRuralDataForMasterExport = (state) => {
  const ruralData = typeof RURAL_HOSPITAL_CLOSURES !== 'undefined'
    ? (RURAL_HOSPITAL_CLOSURES[state] || { count: 0, recent: 0, atRisk: 0 })
    : { count: 0, recent: 0, atRisk: 0 };
  return {
    summary: {
      count: ruralData.count || 0,
      recent: ruralData.recent || 0,
      atRisk: ruralData.atRisk || 0
    },
    atRiskHospitals: Array.isArray(ruralData.atRiskHospitals) ? ruralData.atRiskHospitals : [],
    closedHospitals: Array.isArray(ruralData.closedHospitals) ? ruralData.closedHospitals : [],
    lastUpdated: typeof ruralClosuresLastUpdated !== 'undefined' ? ruralClosuresLastUpdated : null
  };
};

const getTopInstitutionsForState = (state, limit = 12) => {
  const counts = new Map();
  nursingPrograms.forEach((program) => {
    const entry = normalizeProgram(program);
    if (entry.state !== state) return;
    const key = entry.institution || 'Unknown';
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
};

const buildMasterExportData = async (state, progressCb) => {
  await loadStateBeaconData();
  if (progressCb) progressCb(25);
  await ensureProgramsDataForBeacon();
  if (progressCb) progressCb(35);
  if (typeof loadRuralClosuresData === 'function') {
    await loadRuralClosuresData();
  }
  if (progressCb) progressCb(45);

  const entry = getBeaconEntry(state);
  const enrichedEntry = enrichBeaconEntry(state, entry, getStateNotices(state), nursingPrograms.filter((program) => normalizeProgram(program).state === state));
  const metroData = await getTargetStateMetroData(state);
  const metros = metroData?.metros || [];
  const totalHospitals = metros.reduce((sum, metro) => sum + (metro.hospitals?.length || 0), 0);
  const recentWarnNotices = await getRecentWarnNoticesForState(state);
  if (progressCb) progressCb(55);
  const rural = getRuralDataForMasterExport(state);
  const topInstitutions = getTopInstitutionsForState(state);
  const topIndianaInstitutions = getTopInstitutionsForState(MASTER_EXPORT_HOME_STATE);
  const stateBeacon = buildStateBeaconExportWithHome(state, MASTER_EXPORT_HOME_STATE);
  const rawBeaconEntry = stateBeaconData?.states?.[state] ?? {};
  const nursingEducation = rawBeaconEntry.nursingEducation ?? null;
  const indianaEducation = stateBeaconData?.states?.[MASTER_EXPORT_HOME_STATE]?.nursingEducation ?? null;

  return {
    generatedAt: new Date().toISOString(),
    state,
    name: enrichedEntry.name,
    metros,
    metroSummary: {
      count: metros.length,
      totalHospitals
    },
    salaryMeta: metroData.salaryMeta || null,
    recentWarnNotices,
    rural,
    stateBeacon,
    pipeline: enrichedEntry.pipeline || {},
    nursingEducation,
    indianaEducation,
    topInstitutions,
    topIndianaInstitutions,
    outboundSources: MASTER_EXPORT_OUTBOUND_SOURCES
  };
};

const setMasterExportProgress = (value) => {
  const pct = Math.max(0, Math.min(100, value));
  if (masterExportProgressBar) masterExportProgressBar.style.width = `${pct}%`;
  if (masterExportProgressLabel) masterExportProgressLabel.textContent = `${pct}%`;
};
const setMasterExportDisabled = (isDisabled) => {
  if (masterExportToggle) masterExportToggle.disabled = isDisabled;
  if (masterExportModal) {
    masterExportModal.querySelectorAll('button[data-format]').forEach((btn) => {
      btn.disabled = isDisabled;
    });
  }
};


const withTimeout = (promise, ms, label) => (
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  })
);

const buildMasterExportRows = (data) => {
  const rows = [];
  const pushRow = (section, item, detail = '') => rows.push([section, item, detail]);
  let sectionIndex = 0;
  const pushSection = (label) => {
    if (sectionIndex > 0) rows.push(['', '', '']);
    sectionIndex += 1;
    rows.push([label, '', '']);
  };
  const joinDetail = (items) => items.filter(Boolean).join(' | ');

  pushSection('Master Overview');
  pushRow('Master Overview', 'State', data.name);
  pushRow('Master Overview', 'Generated At', data.generatedAt);
  pushRow('Master Overview', 'Home State (Comparison)', STATE_NAMES[MASTER_EXPORT_HOME_STATE] || MASTER_EXPORT_HOME_STATE);
  pushRow('Master Overview', 'Metros', data.metroSummary.count);
  pushRow('Master Overview', 'Hospitals', data.metroSummary.totalHospitals);
  pushRow('Master Overview', 'WARN notices (30d)', data.recentWarnNotices.length);
  pushRow('Master Overview', 'Rural closures (since 2010)', data.rural.summary.count);
  pushRow('Master Overview', 'Rural closures (recent)', data.rural.summary.recent);
  pushRow('Master Overview', 'Rural hospitals at risk', data.rural.summary.atRisk);

  (data.metros || []).forEach((metro) => {
    const metroSection = `Metro: ${metro.name}`;
    pushSection(metroSection);
    const detail = joinDetail([metro.population, `${metro.hospitals?.length || 0} hospitals`, metro.competition]);
    pushRow(metroSection, 'Summary', detail);
    (metro.hospitals || []).forEach((hospital) => {
      const hDetail = joinDetail([hospital.system, `${hospital.beds} beds`, `Rating ${hospital.reviews}`, `Score ${hospital.score}`]);
      pushRow(metroSection, `Hospital: ${hospital.name}`, hDetail);
    });
    (metro.systems || []).forEach((system) => {
      const sDetail = joinDetail([system.marketShare, `${system.facilities} facilities`]);
      pushRow(metroSection, `System: ${system.name}`, sDetail);
    });
    if (metro.salary) {
      pushRow(metroSection, 'Staff RN', metro.salary.staffRN || '--');
      pushRow(metroSection, 'Travel RN', metro.salary.travelRN || '--');
      pushRow(metroSection, 'Sign-On', metro.salary.signOn || '--');
      (metro.salary.breakdown || []).forEach((item) => {
        const detail = joinDetail([item.value, item.note]);
        pushRow(metroSection, `Salary: ${item.label || 'Benchmark'}`, detail);
      });
    }
  });

  if (data.salaryMeta?.breakdown?.length) {
    pushSection('State Salary Benchmarks');
    data.salaryMeta.breakdown.forEach((item) => {
      const detail = joinDetail([item.value, item.note]);
      pushRow('State Salary Benchmarks', item.label || 'Benchmark', detail);
    });
  }

  pushSection('Target State Pipeline');
  if (!data.pipeline?.majorPrograms?.length && !data.pipeline?.residencies?.length && !data.pipeline?.clinicalPartners?.length) {
    pushRow('Target State Pipeline', 'Notes', 'No pipeline notes available yet.');
  }
  (data.pipeline?.majorPrograms || []).forEach((program) => {
    pushRow('Target State Pipeline', 'Major Program', program);
  });
  (data.pipeline?.residencies || []).forEach((item) => {
    pushRow('Target State Pipeline', 'Residencies', item);
  });
  (data.pipeline?.clinicalPartners || []).forEach((item) => {
    pushRow('Target State Pipeline', 'Clinical Partners', item);
  });

  if (data.nursingEducation?.breakdown) {
    pushSection('Target State Nursing Education');
    Object.values(data.nursingEducation.breakdown).forEach((group) => {
      if (!group?.schools) return;
      group.schools.forEach((school) => {
        const detail = joinDetail([school.type, school.graduates ? `${school.graduates} grads` : null]);
        pushRow('Target State Nursing Education', school.name, detail);
      });
    });
  }

  if (data.topInstitutions?.length) {
    pushSection('Target State Nursing Programs (Top)');
    data.topInstitutions.forEach((entry) => {
      pushRow('Target State Nursing Programs (Top)', entry.name, `${entry.count} programs`);
    });
  }

  if (data.stateBeacon?.candidateMetroTable?.length) {
    pushSection('Indiana Feeder Pipeline (Target State)');
    data.stateBeacon.candidateMetroTable.forEach((row) => {
      const detail = joinDetail([row.estimate, row.feederSchools]);
      pushRow('Indiana Feeder Pipeline (Target State)', row.metro || 'Metro', detail);
    });
  } else if (data.indianaEducation?.breakdown) {
    pushSection('Indiana Nursing Education');
    Object.values(data.indianaEducation.breakdown).forEach((group) => {
      if (!group?.schools) return;
      group.schools.forEach((school) => {
        const detail = joinDetail([school.type, school.graduates ? `${school.graduates} grads` : null]);
        pushRow('Indiana Nursing Education', school.name, detail);
      });
    });
  } else if (data.topIndianaInstitutions?.length) {
    pushSection('Indiana Nursing Programs (Top)');
    data.topIndianaInstitutions.forEach((entry) => {
      pushRow('Indiana Nursing Programs (Top)', entry.name, `${entry.count} programs`);
    });
  }



  pushSection('Outbound Insights (Target State)');
  if (data.stateBeacon?.candidateInsights?.length) {
    data.stateBeacon.candidateInsights.forEach((item) => {
      pushRow('Outbound Insights (Target State)', item.title || 'Insight', item.detail || '');
    });
  } else {
    pushRow('Outbound Insights (Target State)', 'Notes', 'No outbound insights available yet.');
  }

  if (data.stateBeacon?.candidateModel) {
    const model = data.stateBeacon.candidateModel;
    pushRow('Outbound Insights (Target State)', 'Grad output', model.gradOutput ?? '--');
    pushRow('Outbound Insights (Target State)', 'Brain drain rate', model.brainDrainRate ?? '--');
    pushRow('Outbound Insights (Target State)', 'Relocation preference', model.relocationPreference ?? '--');
    pushRow('Outbound Insights (Target State)', 'Healthcare ratio', model.healthcareRatio ?? '--');
  }

  pushSection('Outbound Insights Sources');
  Object.entries(data.outboundSources || {}).forEach(([key, value]) => {
    pushRow('Outbound Insights Sources', key, value);
  });

  pushSection('WARN Notices (30d)');
  data.recentWarnNotices.forEach((notice) => {
    const employer = notice.employer_name || notice.employerName || 'Unknown employer';
    const noticeDate = notice.notice_date || notice.noticeDate || notice.retrieved_at || '';
    const detail = joinDetail([
      notice.facility_name,
      notice.parent_system,
      notice.address,
      notice.city,
      notice.state,
      noticeDate ? `Notice ${noticeDate}` : null,
      notice.effective_date ? `Effective ${notice.effective_date}` : null,
      notice.employees_affected || notice.affectedCount ? `Affected ${notice.employees_affected || notice.affectedCount}` : null,
      notice.nursing_label || notice.nursingImpact?.label ? `Impact ${notice.nursing_label || notice.nursingImpact?.label}` : null,
      notice.reason ? `Reason ${notice.reason}` : null,
      notice.naics ? `NAICS ${notice.naics}` : null,
      notice.source_name ? `Source ${notice.source_name}` : null,
      notice.source_url ? `Source URL ${notice.source_url}` : null
    ]);
    pushRow('WARN Notices (30d)', employer, detail);
  });

  pushSection('Rural Summary');
  pushRow('Rural Summary', 'Data updated', data.rural.lastUpdated || 'Unknown');
  pushRow('Rural Summary', 'Total closures since 2010', data.rural.summary.count);
  pushRow('Rural Summary', 'Recent closures (2 years)', data.rural.summary.recent);
  pushRow('Rural Summary', 'Hospitals at risk', data.rural.summary.atRisk);

  if (data.rural.atRiskHospitals.length) {
    pushSection('Rural At-Risk Hospitals');
    data.rural.atRiskHospitals.forEach((hospital) => {
      const detail = joinDetail([
        hospital.city,
        hospital.county ? `${hospital.county} Co.` : null,
        hospital.beds ? `${hospital.beds} beds` : null,
        hospital.operatingMargin !== undefined ? `Margin ${hospital.operatingMargin}%` : null,
        hospital.dailyCensus ? `${hospital.dailyCensus} daily census` : null,
        hospital.risk ? `Risk ${hospital.risk}` : null
      ]);
      pushRow('Rural At-Risk Hospitals', hospital.name || 'Unknown', detail);
    });
  }

  if (data.rural.closedHospitals.length) {
    pushSection('Rural Closures');
    data.rural.closedHospitals.forEach((hospital) => {
      const detail = joinDetail([
        hospital.city,
        hospital.county ? `${hospital.county} Co.` : null,
        hospital.year ? `Year ${hospital.year}` : null,
        hospital.type ? hospital.type : null
      ]);
      pushRow('Rural Closures', hospital.name || 'Unknown', detail);
    });
  }

  const beaconRows = buildStateBeaconExportRows(data.stateBeacon);
  let beaconSection = null;
  beaconRows.forEach(([section, item, detail]) => {
    if (beaconSection !== section) {
      beaconSection = section;
      pushSection(`State Beacon: ${section}`);
    }
    pushRow(`State Beacon: ${section}`, item, detail);
  });

  return rows;
};

const exportMasterExport = async (format = 'csv') => {
  const state = masterExportStateSelect?.value || TARGET_STATE_DEFAULT;
  setMasterExportProgress(5);
  setMasterExportDisabled(true);
  try {
    const data = await withTimeout(
      buildMasterExportData(state, setMasterExportProgress),
      45000,
      'Master export'
    );
    const rows = buildMasterExportRows(data);
    setMasterExportProgress(75);
    const filenameBase = `master-export-${state}`;

    if (format === 'excel') {
      downloadExcel({
        title: `Master Export - ${data.name}`,
        meta: [`Exported: ${new Date().toLocaleString()}`],
        headers: ['Section', 'Item', 'Detail'],
        rows,
        filename: `${filenameBase}.xls`
      });
      setMasterExportProgress(100);
      showExportToast('Master Export Excel exported.');
      return;
    }

    if (format === 'pdf') {
      openPdfExport({
        title: `Master Export - ${data.name}`,
        meta: [`Exported: ${new Date().toLocaleString()}`],
        headers: ['Section', 'Item', 'Detail'],
        rows
      });
      setMasterExportProgress(100);
      showExportToast('Master Export PDF opened.');
      return;
    }

    const csv = buildCsv(['Section', 'Item', 'Detail'], rows);
    downloadFile(csv, `${filenameBase}.csv`, 'text/csv');
    setMasterExportProgress(100);
    showExportToast('Master Export CSV exported.');
  } catch (err) {
    console.error('Master export failed:', err);
    showExportToast('Master Export failed. Please try again.');
    setMasterExportProgress(0);
  } finally {
    setMasterExportDisabled(false);
  }
};

const openMasterExport = () => {
  const preferredState = getMapTargetState?.() || targetStateSelect?.value || TARGET_STATE_DEFAULT;
  if (masterExportStateSelect) masterExportStateSelect.value = preferredState;
  setMasterExportProgress(0);
  masterExportModal?.classList.add('active');
  updateMasterExportSummary();
  closeModulesMenu();
};

const closeMasterExport = () => masterExportModal?.classList.remove('active');

const updateMasterExportSummary = async () => {
  if (!masterExportStateSelect) return;
  const state = masterExportStateSelect.value;
  const metroData = await getTargetStateMetroData(state);
  const metros = metroData?.metros || [];
  if (masterExportMetroCount) masterExportMetroCount.textContent = metros.length || '--';
  if (typeof loadRuralClosuresData === 'function') {
    await loadRuralClosuresData();
  }
  const rural = getRuralDataForMasterExport(state);
  if (masterExportRuralCount) masterExportRuralCount.textContent = rural.summary.atRisk ?? '--';
  const recentNotices = await getRecentWarnNoticesForState(state);
  if (masterExportWarnCount) masterExportWarnCount.textContent = recentNotices.length ?? '--';
};

const initMasterExport = () => {
  if (!masterExportStateSelect) return;
  const options = ALL_STATES.map((state) => (
    `<option value="${state}">${state} - ${STATE_NAMES[state] || ''}</option>`
  )).join('');
  masterExportStateSelect.innerHTML = options;
  masterExportStateSelect.value = TARGET_STATE_DEFAULT;
  masterExportStateSelect.addEventListener('change', updateMasterExportSummary);

  openMasterExportBtn?.addEventListener('click', openMasterExport);
  masterExportCloseBtn?.addEventListener('click', closeMasterExport);
  masterExportCloseFooter?.addEventListener('click', closeMasterExport);
  masterExportModal?.addEventListener('click', (event) => {
    if (event.target === masterExportModal) closeMasterExport();
  });

  masterExportToggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    masterExportMenu?.classList.toggle('active');
  });
  masterExportMenu?.addEventListener('click', (event) => {
    const item = event.target.closest('.save-dropdown-item');
    if (!item) return;
    const format = item.dataset.format || 'csv';
    masterExportMenu.classList.remove('active');
    exportMasterExport(format);
  });
  masterExportButtons?.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-format]');
    if (!btn) return;
    exportMasterExport(btn.dataset.format || 'csv');
  });


};

const exportStateBeaconJson = () => {
  if (!stateBeaconStateSelect) return;
  const data = buildStateBeaconExport(stateBeaconStateSelect.value);
  const content = JSON.stringify(data, null, 2);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
  link.download = `state-beacon-${data.state}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  showExportToast('State Beacon JSON exported.');
};

const buildStateBeaconExportRows = (data) => {
  const rows = [];
  const pushRow = (section, item, detail = '') => {
    rows.push([section, item, detail]);
  };

  pushRow('Overview', 'State', data.name);
  pushRow('Overview', 'Generated At', data.generatedAt);
  Object.entries(data.inputs || {}).forEach(([key, value]) => pushRow('Recruiter Inputs', key, value));

  Object.entries(data.summary || {}).forEach(([key, value]) => pushRow('Summary', key, value));
  Object.entries(data.compensation || {}).forEach(([key, value]) => pushRow('Compensation', key, Array.isArray(value) ? value.join('; ') : value));
  Object.entries(data.licensing || {}).forEach(([key, value]) => pushRow('Licensing', key, Array.isArray(value) ? value.join('; ') : value));
  Object.entries(data.market || {}).forEach(([key, value]) => pushRow('Market', key, Array.isArray(value) ? value.join('; ') : value));

  data.competition?.systems?.forEach((system) => {
    pushRow('Competition', system.name, [system.presence, system.notes].filter(Boolean).join(' • '));
  });

  data.hospitals?.best?.forEach((item) => pushRow('Hospitals Best', item.employer, `${item.notices} notices`));
  data.hospitals?.watchlist?.forEach((item) => pushRow('Hospitals Watchlist', item.employer, `${item.notices} notices`));

  pushRow('Pipeline', 'Programs count', data.pipeline.programsCount);
  Object.entries(data.pipeline.programsByLevel || {}).forEach(([level, count]) => pushRow('Pipeline', level, count));
  data.pipeline.majorPrograms?.forEach((program) => pushRow('Pipeline Major Programs', program, ''));
  data.pipeline.residencies?.forEach((entry) => pushRow('Pipeline Residencies', entry, ''));
  data.pipeline.clinicalPartners?.forEach((entry) => pushRow('Pipeline Clinical Partners', entry, ''));

  data.pros?.forEach((item) => pushRow('Pros', item, ''));
  data.cons?.forEach((item) => pushRow('Cons', item, ''));
  if (data.attractions) pushRow('Attractions', data.attractions, '');
  if (data.drawbacks) pushRow('Drawbacks', data.drawbacks, '');

  data.talkingPoints?.forEach((point) => pushRow('Recruiter Script', point, ''));
  data.objections?.forEach((item) => pushRow('Objections', item.concern, item.response));

  return rows;
};

const exportStateBeaconCsv = () => {
  if (!stateBeaconStateSelect) return;
  const data = buildStateBeaconExport(stateBeaconStateSelect.value);
  const rows = [['Section', 'Item', 'Detail']];
  const pushRow = (section, item, detail = '') => {
    rows.push([section, item, detail].map((value) => `"${String(value).replace(/"/g, '""')}"`));
  };

  pushRow('Overview', 'State', data.name);
  pushRow('Overview', 'Generated At', data.generatedAt);
  Object.entries(data.inputs || {}).forEach(([key, value]) => pushRow('Recruiter Inputs', key, value));

  Object.entries(data.summary || {}).forEach(([key, value]) => pushRow('Summary', key, value));
  Object.entries(data.compensation || {}).forEach(([key, value]) => pushRow('Compensation', key, Array.isArray(value) ? value.join('; ') : value));
  Object.entries(data.licensing || {}).forEach(([key, value]) => pushRow('Licensing', key, Array.isArray(value) ? value.join('; ') : value));
  Object.entries(data.market || {}).forEach(([key, value]) => pushRow('Market', key, Array.isArray(value) ? value.join('; ') : value));

  data.competition?.systems?.forEach((system) => {
    pushRow('Competition', system.name, [system.presence, system.notes].filter(Boolean).join(' • '));
  });

  data.hospitals?.best?.forEach((item) => pushRow('Hospitals Best', item.employer, `${item.notices} notices`));
  data.hospitals?.watchlist?.forEach((item) => pushRow('Hospitals Watchlist', item.employer, `${item.notices} notices`));

  pushRow('Pipeline', 'Programs count', data.pipeline.programsCount);
  Object.entries(data.pipeline.programsByLevel || {}).forEach(([level, count]) => pushRow('Pipeline', level, count));
  data.pipeline.majorPrograms?.forEach((program) => pushRow('Pipeline Major Programs', program, ''));
  data.pipeline.residencies?.forEach((entry) => pushRow('Pipeline Residencies', entry, ''));
  data.pipeline.clinicalPartners?.forEach((entry) => pushRow('Pipeline Clinical Partners', entry, ''));

  data.pros?.forEach((item) => pushRow('Pros', item, ''));
  data.cons?.forEach((item) => pushRow('Cons', item, ''));
  if (data.attractions) pushRow('Attractions', data.attractions, '');
  if (data.drawbacks) pushRow('Drawbacks', data.drawbacks, '');

  data.talkingPoints?.forEach((point) => pushRow('Recruiter Script', point, ''));
  data.objections?.forEach((item) => pushRow('Objections', item.concern, item.response));

  const csv = rows.map((row) => row.join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  link.download = `state-beacon-${data.state}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  showExportToast('State Beacon CSV exported.');
};

const exportStateBeaconExcel = () => {
  if (!stateBeaconStateSelect) return;
  const data = buildStateBeaconExport(stateBeaconStateSelect.value);
  const rows = buildStateBeaconExportRows(data);
  downloadExcel({
    title: `State Beacon - ${data.name}`,
    meta: [`Exported: ${new Date().toLocaleString()}`],
    headers: ['Section', 'Item', 'Detail'],
    rows,
    filename: `state-beacon-${data.state}.xls`
  });
  showExportToast('State Beacon Excel exported.');
};

const exportStateBeaconPdf = () => {
  if (!stateBeaconStateSelect) return;
  const data = buildStateBeaconExport(stateBeaconStateSelect.value);
  const rows = buildStateBeaconExportRows(data);
  openPdfExport({
    title: `State Beacon - ${data.name}`,
    meta: [`Exported: ${new Date().toLocaleString()}`],
    headers: ['Section', 'Item', 'Detail'],
    rows
  });
  showExportToast('State Beacon PDF opened.');
};

const openStateBeacon = async (state) => {
  const defaultState = state || STATE_BEACON_DEFAULT;
  if (stateBeaconStateSelect) stateBeaconStateSelect.value = defaultState;
  await renderStateBeacon(defaultState);
  stateBeaconModal?.classList.add('active');
  closeModulesMenu();
};

const closeStateBeacon = () => {
  stateBeaconModal?.classList.remove('active');
};

const initStateBeacon = () => {
  if (!stateBeaconStateSelect || !stateBeaconHomeSelect) return;
  const options = ALL_STATES.map((state) => (
    `<option value="${state}">${state} - ${STATE_NAMES[state] || ''}</option>`
  )).join('');
  stateBeaconStateSelect.innerHTML = options;
  stateBeaconHomeSelect.innerHTML = options;
  stateBeaconStateSelect.value = STATE_BEACON_DEFAULT;
  stateBeaconHomeSelect.value = STATE_BEACON_HOME_DEFAULT;

  const onInputsChange = () => {
    const inputs = {
      homeState: stateBeaconHomeSelect?.value || STATE_BEACON_HOME_DEFAULT,
      specialty: stateBeaconSpecialty?.value || 'General RN',
      experience: stateBeaconExperience?.value || '3-5 years',
      shift: stateBeaconShift?.value || 'Day',
      targetPay: stateBeaconTargetPay?.value || '',
      timeline: stateBeaconTimeline?.value || '31-60 days',
      license: stateBeaconLicense?.value || 'Compact'
    };
    saveStateBeaconInputs(inputs);
    renderStateBeacon(stateBeaconStateSelect.value);
  };

  [stateBeaconHomeSelect, stateBeaconSpecialty, stateBeaconExperience, stateBeaconShift, stateBeaconTargetPay, stateBeaconTimeline, stateBeaconLicense]
    .filter(Boolean)
    .forEach((el) => el.addEventListener('change', onInputsChange));

  stateBeaconStateSelect.addEventListener('change', () => renderStateBeacon(stateBeaconStateSelect.value));

  stateBeaconUseSelection?.addEventListener('click', () => {
    const preferred = selectedStates.length === 1 ? selectedStates[0] : (stateSelect?.value || STATE_BEACON_DEFAULT);
    stateBeaconStateSelect.value = preferred;
    renderStateBeacon(preferred);
  });

  stateBeaconSave?.addEventListener('click', () => {
    const notes = getStateBeaconNotes();
    const state = stateBeaconStateSelect.value;
    notes[state] = {
      attractions: stateBeaconAttractions?.value || '',
      drawbacks: stateBeaconDrawbacks?.value || ''
    };
    saveStateBeaconNotes(notes);
  });

  stateBeaconProsToggleTarget?.addEventListener('click', () => {
    setStateBeaconProsMode(STATE_BEACON_PROS_MODE_TARGET);
    renderStateBeacon(stateBeaconStateSelect.value);
  });
  stateBeaconProsToggleHome?.addEventListener('click', () => {
    setStateBeaconProsMode(STATE_BEACON_PROS_MODE_HOME);
    renderStateBeacon(stateBeaconStateSelect.value);
  });

  stateBeaconExportJson?.addEventListener('click', exportStateBeaconJson);
  stateBeaconExportCsv?.addEventListener('click', exportStateBeaconCsv);
  stateBeaconExportExcel?.addEventListener('click', exportStateBeaconExcel);
  stateBeaconExportPdf?.addEventListener('click', exportStateBeaconPdf);
  openStateBeaconBtn?.addEventListener('click', () => openStateBeacon(stateBeaconStateSelect.value));
  stateBeaconCloseBtn?.addEventListener('click', closeStateBeacon);
  stateBeaconCloseFooter?.addEventListener('click', closeStateBeacon);
  openHomeStateBtn?.addEventListener('click', openHomeState);
  homeStateExportCsv?.addEventListener('click', exportHomeStateCsv);
  homeStateExportExcel?.addEventListener('click', exportHomeStateExcel);
  homeStateExportPdf?.addEventListener('click', exportHomeStatePdf);
  homeStateCloseBtn?.addEventListener('click', closeHomeState);
  homeStateCloseFooter?.addEventListener('click', closeHomeState);
  homeStateOpenBeacon?.addEventListener('click', () => {
    const homeState = stateBeaconHomeSelect?.value || STATE_BEACON_HOME_DEFAULT;
    stateBeaconHomeSelect.value = homeState;
    closeHomeState();
    openStateBeacon(stateBeaconStateSelect?.value || STATE_BEACON_DEFAULT);
  });
  stateBeaconHomeSelect?.addEventListener('change', () => {
    if (homeStateModal?.classList.contains('active')) {
      renderHomeState(stateBeaconHomeSelect.value || STATE_BEACON_HOME_DEFAULT);
    }
  });

  targetStateExportToggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    targetStateExportMenu?.classList.toggle('active');
  });
  targetStateExportMenu?.addEventListener('click', (event) => {
    const item = event.target.closest('.save-dropdown-item');
    if (!item) return;
    const format = item.dataset.format || 'csv';
    const scope = item.dataset.scope || 'all';
    targetStateExportMenu.classList.remove('active');
    exportTargetState({ format, scope });
  });
  openTargetStateBtn?.addEventListener('click', openTargetState);
  targetStateCloseBtn?.addEventListener('click', closeTargetState);
  targetStateCloseFooter?.addEventListener('click', closeTargetState);
  targetStateSelect?.addEventListener('change', () => {
    renderTargetState(targetStateSelect.value);
  });
  targetStateOpenBeacon?.addEventListener('click', () => {
    const state = targetStateSelect?.value || TARGET_STATE_DEFAULT;
    closeTargetState();
    openStateBeacon(state);
  });

  setStateBeaconProsMode(stateBeaconProsMode);
};

// ==================== END STATE BEACON MODULE ====================

// ==================== MAP/CHART VIEW TOGGLE ====================

// Render bar chart view
const renderBarChart = () => {
  const barChart = document.getElementById('bar-chart');
  if (!barChart) return;

  // Get all states with their counts, sorted by count descending
  const statesWithCounts = ALL_STATES.map(state => {
    const entry = mapStateData[state];
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

const setMapScope = (scope, { reloadNotices = false } = {}) => {
  mapScope = scope === 'all' ? 'all' : 'healthcare';
  mapStateData = mapScope === 'all' ? stateDataAll : stateDataHealthcare;
  if (!mapStateData || Object.keys(mapStateData).length === 0) {
    mapStateData = stateDataAll;
  }

  if (mapScopeHealthcareBtn && mapScopeAllBtn) {
    mapScopeHealthcareBtn.classList.toggle('active', mapScope === 'healthcare');
    mapScopeAllBtn.classList.toggle('active', mapScope === 'all');
  }
  if (mapScopeLabel) {
    mapScopeLabel.textContent = mapScope === 'all' ? 'All notices' : 'Healthcare';
  }

  updateWeatherMap();
  if (currentMapView === 'chart') {
    renderBarChart();
  }
  if (reloadNotices) {
    loadNotices();
  }
};

const initMapScopeToggle = () => {
  mapScopeHealthcareBtn?.addEventListener('click', () => setMapScope('healthcare', { reloadNotices: true }));
  mapScopeAllBtn?.addEventListener('click', () => setMapScope('all', { reloadNotices: true }));
};

const getMapHomeState = () => {
  try {
    return localStorage.getItem(scopedStorageKey(MAP_HOME_STATE_BASE_KEY)) || '';
  } catch {
    return '';
  }
};

const getHomeStateForFactors = () => (
  getMapHomeState()
  || stateBeaconHomeSelect?.value
  || getStateBeaconInputs()?.homeState
  || STATE_BEACON_HOME_DEFAULT
);

const getRegionForState = (state) => {
  const entry = Object.entries(REGION_STATES).find(([, states]) => states.includes(state));
  return entry ? entry[0] : null;
};

const scoreOutOfStateTarget = (homeState, targetState) => {
  const noticeCount = mapStateData?.[targetState]?.count ?? 0;
  const homeRegion = getRegionForState(homeState);
  const targetRegion = getRegionForState(targetState);
  const regionBonus = homeRegion && targetRegion && homeRegion === targetRegion ? 2 : 0;
  const score = noticeCount + regionBonus;
  return { score, noticeCount, targetRegion };
};

const getRecruitingTargets = (homeState, count = 5) => (
  Object.keys(mapStateData || {})
    .filter((state) => state !== homeState)
    .map((state) => ({ state, ...scoreOutOfStateTarget(homeState, state) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
);

const renderMapFactors = () => {
  if (!mapFactorsList) return;
  const homeState = getHomeStateForFactors();
  const entries = getRecruitingTargets(homeState, 5);

  if (mapFactorsSubtitle) {
    mapFactorsSubtitle.textContent = homeState
      ? `Top 5 recruiting targets from ${STATE_NAMES[homeState] || homeState}.`
      : 'Select a Home State to rank recruiting targets.';
  }

  if (!entries.length) {
    mapFactorsList.innerHTML = '<div class="empty-state">No state data available.</div>';
    return;
  }

  mapFactorsList.innerHTML = entries.map((entry, idx) => `
    <div class="map-factor-card">
      <div class="map-factor-title">#${idx + 1} ${STATE_NAMES[entry.state] || entry.state}</div>
      <div class="map-factor-meta">
        Notices: ${entry.noticeCount} | Region: ${entry.targetRegion || 'n/a'}
      </div>
    </div>
  `).join('');
};

const initMapFactors = () => {
  mapFactorsBtn?.addEventListener('click', () => {
    if (!mapFactorsPanel) return;
    const isVisible = mapFactorsPanel.style.display !== 'none';
    mapFactorsPanel.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) renderMapFactors();
  });

  mapFactorsClose?.addEventListener('click', () => {
    if (mapFactorsPanel) mapFactorsPanel.style.display = 'none';
  });
};

// Initialize map/chart toggle
const initMapToggle = () => {
  const mapViewBtn = document.getElementById('map-view-btn');
  const chartViewBtn = document.getElementById('chart-view-btn');

  mapViewBtn?.addEventListener('click', () => toggleMapView('map'));
  chartViewBtn?.addEventListener('click', () => toggleMapView('chart'));

  ensureMapTargetModeListener();
};

// ==================== END MAP/CHART VIEW TOGGLE ====================

// =============================================================================
// Strike Alerts
// =============================================================================
const parseStrikeDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const normalizeStrikeStatus = (value) => {
  const s = String(value || '').trim().toLowerCase();
  if (!s) return 'unknown';
  if (s.includes('active')) return 'active';
  if (s.includes('pending') || s.includes('planned') || s.includes('upcoming')) return 'pending';
  if (s.includes('resolved') || s.includes('ended') || s.includes('closed')) return 'resolved';
  return s;
};

const normalizeStrikeConfidence = (row) => {
  const label = String(row?.confidenceLabel || '').trim().toLowerCase();
  if (label === 'high' || label === 'medium' || label === 'low') return label;
  const score = Number(row?.confidenceScore || 0);
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
};

const STRIKE_ARTICLE_URL_FIELDS = ['articleUrl', 'articleURL', 'url', 'link', 'sourceUrl'];

const extractStrikeUrlFromText = (value) => {
  const text = String(value || '');
  const match = text.match(/https?:\/\/[^\s)]+/i);
  if (!match) return '';
  return match[0].replace(/[.,;]+$/, '');
};

const getStrikeArticleUrl = (row) => {
  for (const field of STRIKE_ARTICLE_URL_FIELDS) {
    const candidate = String(row?.[field] || '').trim();
    if (/^https?:\/\//i.test(candidate)) return candidate;
  }
  return extractStrikeUrlFromText(row?.notes || row?.reason || '');
};

const getStrikeArticleLabel = (row, url) => {
  if (!url) return '';
  const source = String(row?.source || '').toLowerCase();
  if (source.includes('google_news') || source.includes('news') || /news\.google\.com/i.test(url)) {
    return 'Read article';
  }
  return 'View source';
};

const getFilteredStrikeAlerts = () => {
  const state = String(strikeStateFilter?.value || '').trim().toUpperCase();
  const dateFilter = String(strikeDateFilter?.value || '').trim();
  const status = String(strikeStatusFilter?.value || '').trim().toLowerCase();
  const confidence = String(strikeConfidenceFilter?.value || '').trim().toLowerCase();
  const mode = String(strikeModeFilter?.value || 'operational').trim().toLowerCase();
  const now = new Date();

  return strikeAlertsData.filter((row) => {
    const rowState = String(row?.state || '').trim().toUpperCase();
    if (state && rowState !== state) return false;

    const normalizedStatus = normalizeStrikeStatus(row?.status);
    if (status && normalizedStatus !== status) return false;

    const normalizedConfidence = normalizeStrikeConfidence(row);
    if (confidence === 'high' && normalizedConfidence !== 'high') return false;
    if (confidence === 'medium' && !(normalizedConfidence === 'high' || normalizedConfidence === 'medium')) return false;
    if (confidence === 'low' && normalizedConfidence !== 'low') return false;

    const strikeDate = parseStrikeDate(row?.startDate || row?.date || row?.publishedAt);
    if (dateFilter) {
      if (!strikeDate) return false;
      if (dateFilter === '6m') {
        const cutoff = new Date(now);
        cutoff.setMonth(cutoff.getMonth() - 6);
        if (strikeDate < cutoff) return false;
      } else if (dateFilter === '12m') {
        const cutoff = new Date(now);
        cutoff.setFullYear(cutoff.getFullYear() - 1);
        if (strikeDate < cutoff) return false;
      } else if (/^\d{4}$/.test(dateFilter)) {
        if (strikeDate.getUTCFullYear() !== Number(dateFilter)) return false;
      }
    }

    if (mode === 'operational') {
      const travel = Boolean(row?.isTravelOpportunity);
      if (!(travel || normalizedStatus === 'active' || normalizedStatus === 'pending')) return false;
    }
    return true;
  });
};

const renderStrikeAlerts = () => {
  if (!strikeList) return;
  const rows = getFilteredStrikeAlerts()
    .sort((a, b) => {
      const aDate = parseStrikeDate(a?.startDate || a?.date || a?.publishedAt)?.getTime() || 0;
      const bDate = parseStrikeDate(b?.startDate || b?.date || b?.publishedAt)?.getTime() || 0;
      return bDate - aDate;
    })
    .slice(0, 30);

  if (!rows.length) {
    strikeList.innerHTML = '<div class="empty-state">No strike alerts match your filters.</div>';
    if (strikeFooter) strikeFooter.style.display = 'none';
    if (strikeLiveBadge) strikeLiveBadge.style.display = 'none';
    return;
  }

  strikeList.innerHTML = rows.map((row) => {
    const status = normalizeStrikeStatus(row?.status);
    const confidence = normalizeStrikeConfidence(row);
    const workers = Number(row?.workers || 0);
    const city = String(row?.city || '').trim();
    const state = String(row?.state || '').trim().toUpperCase();
    const location = [city, state].filter(Boolean).join(', ') || state || 'Unknown location';
    const date = row?.startDate || row?.date || 'Date unknown';
    const source = String(row?.source || '').replace(/_/g, ' ').trim();
    const articleUrl = getStrikeArticleUrl(row);
    const articleLabel = getStrikeArticleLabel(row, articleUrl);
    return `
      <div class="insight-row">
        <div>
          <div class="insight-title">${escapeHtml(row?.employer || 'Unknown employer')}</div>
          <div class="insight-meta">${escapeHtml(location)} • ${escapeHtml(date)} • ${escapeHtml(status)}</div>
          <div class="insight-meta">${escapeHtml(String(row?.reason || 'No reason provided'))}</div>
          ${articleUrl ? `<div class="insight-meta"><a class="strike-source-link" href="${escapeHtml(articleUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(articleLabel)} (new tab)</a></div>` : ''}
        </div>
        <div>
          <div class="insight-pill">${workers > 0 ? workers.toLocaleString() : '--'}</div>
          <div class="insight-meta">${escapeHtml(confidence)} confidence${source ? ` • ${escapeHtml(source)}` : ''}</div>
        </div>
      </div>
    `;
  }).join('');

  if (strikeCountLabel) {
    strikeCountLabel.textContent = `${rows.length} alert${rows.length === 1 ? '' : 's'} shown`;
  }
  if (strikeFooter) strikeFooter.style.display = 'flex';
  if (strikeLiveBadge) strikeLiveBadge.style.display = 'inline-flex';
};

const hydrateStrikeFilters = () => {
  if (strikeStateFilter) {
    const existing = strikeStateFilter.value;
    const states = Array.from(new Set(
      strikeAlertsData.map((row) => String(row?.state || '').trim().toUpperCase()).filter(Boolean)
    )).sort();
    strikeStateFilter.innerHTML = '<option value="">All States</option>' +
      states.map((state) => `<option value="${state}">${state}</option>`).join('');
    if (states.includes(existing)) strikeStateFilter.value = existing;
  }

  if (strikeSourceNote) {
    const healthy = Array.isArray(strikeAlertsMeta.sourceHealth)
      ? strikeAlertsMeta.sourceHealth.filter((source) => source?.ok).map((source) => String(source.source || '').replace(/_/g, ' '))
      : [];
    if (healthy.length) {
      strikeSourceNote.textContent = `Sources: ${healthy.slice(0, 5).join(' • ')} (validated)`;
    }
  }
};

const loadStrikeAlerts = async () => {
  if (!strikeList) return;
  try {
    const data = await fetchJson(`/data/strikes.json?ts=${Date.now()}`);
    const rows = Array.isArray(data) ? data : (Array.isArray(data?.strikes) ? data.strikes : []);
    strikeAlertsData = rows;
    strikeAlertsMeta = {
      lastUpdated: data?.lastUpdated || null,
      sources: data?.sources || [],
      sourceHealth: data?.sourceHealth || []
    };
    hydrateStrikeFilters();
    renderStrikeAlerts();
  } catch (err) {
    console.warn('Strike alerts unavailable:', err?.message || err);
    strikeAlertsData = [];
    strikeList.innerHTML = '<div class="empty-state">Strike alerts unavailable.</div>';
    if (strikeFooter) strikeFooter.style.display = 'none';
    if (strikeLiveBadge) strikeLiveBadge.style.display = 'none';
  }
};

const initStrikeAlerts = () => {
  [
    strikeStateFilter,
    strikeDateFilter,
    strikeStatusFilter,
    strikeConfidenceFilter,
    strikeModeFilter
  ].forEach((el) => el?.addEventListener('change', renderStrikeAlerts));
  loadStrikeAlerts();
};

// =============================================================================
// Daily News Feed
// =============================================================================
let newsArticles = [];
let newsClosuresOnly = false;
let newsFeedLastUpdated = null;
let newsSourceHealth = [];
let newsCategoryCoverage = {};
const NEWS_WINDOW_COUNT = 5;
const NEWS_MIN_SOURCE_TARGET = 8;
const NEWS_CATEGORY_LABELS = {
  closures_layoffs: 'Closures',
  mergers_mna: 'M&A',
  labor_unions: 'Labor',
  policy_reimbursement: 'Policy',
  quality_safety: 'Quality',
  capacity_expansion: 'Capacity',
  ai_tech: 'AI',
  general_market: 'General'
};

const NEWS_CLOSURE_KEYWORDS = [
  'closure', 'closing', 'shut down', 'shutting down', 'shuttered',
  'bankrupt', 'chapter 11', 'chapter 7', 'insolvency', 'insolvent',
  'layoff', 'lay off', 'laid off', 'layoffs', 'laying off', 'furlough',
  'workforce reduction', 'job cuts', 'job losses', 'downsiz', 'job elimination',
  'at risk', 'at-risk', 'financial distress',
  'wind down', 'winding down', 'liquidat',
  'cease operations', 'ceasing operations',
  'receivership',
];

const matchesClosureKeywords = (article) => {
  const text = ((article.title || '') + ' ' + (article.summary || '')).toLowerCase();
  return NEWS_CLOSURE_KEYWORDS.some(kw => text.includes(kw));
};

const getSourceBadgeClass = (source) => {
  const s = String(source || '').toLowerCase();
  if (s.includes('becker')) return 'beckers';
  if (s.includes('stat')) return 'stat-news';
  if (s.includes('healthcare dive')) return 'healthcare-dive';
  if (s.includes('fierce')) return 'fierce';
  if (s.includes('health affairs')) return 'health-affairs';
  return 'default';
};

const parseNewsDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const numeric = new Date(value);
    return Number.isNaN(numeric.getTime()) ? null : numeric;
  }
  const raw = String(value).trim();
  if (!raw) return null;
  try {
    return raw.includes('T') ? new Date(raw) : new Date(`${raw}T00:00:00`);
  } catch {
    return null;
  }
};

const formatNewsDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = parseNewsDate(dateStr) || new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const getNewsFeedHealth = () => {
  if (!newsArticles.length) {
    return {
      level: 'danger',
      message: 'No news articles loaded yet.'
    };
  }

  const uniqueSources = new Set(
    newsArticles
      .map((article) => String(article?.source || '').trim())
      .filter(Boolean)
  );

  const articleDates = newsArticles
    .map((article) => parseNewsDate(article?.publishedAt || article?.date))
    .filter((d) => d && !Number.isNaN(d.getTime()));
  const latestArticle = articleDates.length
    ? new Date(Math.max(...articleDates.map((d) => d.getTime())))
    : null;

  const referenceDate = parseNewsDate(newsFeedLastUpdated) || latestArticle;
  const ageHours = referenceDate
    ? Math.floor((Date.now() - referenceDate.getTime()) / (1000 * 60 * 60))
    : null;

  const stale = ageHours !== null && ageHours > 24;
  const criticallyStale = ageHours !== null && ageHours > 48;
  const limitedSources = uniqueSources.size < NEWS_MIN_SOURCE_TARGET;
  const level = criticallyStale ? 'danger' : (stale || limitedSources ? 'warning' : 'good');

  const freshnessLabel = ageHours === null
    ? 'refresh age unavailable'
    : `last refreshed ${ageHours}h ago`;

  const detailBits = [
    `${newsArticles.length} articles`,
    `${uniqueSources.size} sources`,
    latestArticle ? `latest article ${formatNewsDate(latestArticle.toISOString())}` : null
  ].filter(Boolean);

  const warningBits = [];
  if (stale) warningBits.push('feed refresh is stale');
  if (limitedSources) warningBits.push(`source diversity is limited (target ${NEWS_MIN_SOURCE_TARGET}+)`);

  const message = warningBits.length
    ? `Feed health: ${warningBits.join(' and ')} (${freshnessLabel}; ${detailBits.join(' | ')}).`
    : `Feed health: good (${freshnessLabel}; ${detailBits.join(' | ')}).`;

  return { level, message };
};

const renderNewsFeedHealth = () => {
  const el = document.getElementById('news-feed-health');
  if (!el) return;
  const { level, message } = getNewsFeedHealth();
  el.classList.remove('is-good', 'is-warning', 'is-danger');
  el.classList.add(level === 'danger' ? 'is-danger' : level === 'warning' ? 'is-warning' : 'is-good');
  el.textContent = message;
};

const getNewsDateFilter = () => {
  const filter = document.getElementById('news-date-filter');
  return filter ? parseInt(filter.value, 10) || 3 : 3;
};

const getNewsCategoryFilter = () => {
  const filter = document.getElementById('news-category-filter');
  return filter ? String(filter.value || 'all') : 'all';
};

const filterNewsByDate = (articles, days) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const cutoff = new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  return articles.filter(article => {
    const articleDate = parseNewsDate(article.publishedAt || article.date);
    if (!articleDate || Number.isNaN(articleDate.getTime())) return true;
    return articleDate >= cutoff;
  });
};

const filterNewsByCategory = (articles, categoryKey) => {
  if (!categoryKey || categoryKey === 'all') return articles;
  return articles.filter((article) => String(article?.category || 'general_market') === categoryKey);
};

const renderNewsCoverageMetrics = () => {
  const categoryEl = document.getElementById('news-category-coverage');
  const sourceEl = document.getElementById('news-source-health');
  if (!categoryEl || !sourceEl) return;

  const coverage = newsCategoryCoverage && typeof newsCategoryCoverage === 'object'
    ? newsCategoryCoverage
    : {};

  const categoryRows = Object.entries(coverage)
    .map(([key, value]) => ({
      key,
      label: value?.label || NEWS_CATEGORY_LABELS[key] || key,
      count: Number(value?.count || 0)
    }))
    .sort((a, b) => b.count - a.count);

  categoryEl.innerHTML = categoryRows.length
    ? categoryRows.slice(0, 8).map((row) => `
      <span class="news-category-chip">${escapeHtml(row.label)}: ${row.count}</span>
    `).join('')
    : '<span class="news-category-chip">No category coverage data</span>';

  const sourceRows = Array.isArray(newsSourceHealth) ? newsSourceHealth : [];
  sourceEl.innerHTML = sourceRows.length
    ? sourceRows.slice(0, 8).map((row) => `
      <div class="news-source-card">
        <div class="news-source-name">${escapeHtml(row.source || 'Unknown')}</div>
        <div class="news-source-meta ${row.status === 'stale' ? 'stale' : ''}">
          ${Number(row.articleCount || 0)} articles${Number.isFinite(Number(row.staleHours)) ? ` | ${Number(row.staleHours)}h` : ''}
        </div>
      </div>
    `).join('')
    : '<div class="news-source-card"><div class="news-source-name">No source health data</div><div class="news-source-meta">Will populate on next export.</div></div>';
};

const renderNewsFeed = () => {
  const list = document.getElementById('news-feed-list');
  if (!list) return;

  const days = getNewsDateFilter();
  const categoryKey = getNewsCategoryFilter();
  let filtered = filterNewsByDate(newsArticles, days);
  filtered = filterNewsByCategory(filtered, categoryKey);
  if (newsClosuresOnly) {
    filtered = filtered.filter(matchesClosureKeywords);
  }

  if (!filtered.length) {
    const label = newsClosuresOnly ? 'closure-related ' : '';
    list.innerHTML = `<div class="empty-state">No ${label}news articles in the last ${days} days.</div>`;
    list.style.maxHeight = '';
    list.classList.remove('news-feed-windowed');
    renderNewsCoverageMetrics();
    renderNewsFeedHealth();
    return;
  }

  list.innerHTML = filtered.map(article => `
    <a class="news-card" href="${article.url}" target="_blank" rel="noopener noreferrer">
      <div class="news-card-body">
        <h4 class="news-card-title">${article.title}</h4>
        <p class="news-card-summary">${article.summary}</p>
      </div>
      <div class="news-card-meta">
        <span class="news-source-badge ${getSourceBadgeClass(article.source)}">${article.source}</span>
        <span class="news-card-date">${formatNewsDate(article.publishedAt)}</span>
      </div>
    </a>
  `).join('');

  // Apply scroll window
  requestAnimationFrame(() => {
    const cards = list.querySelectorAll('.news-card');
    if (cards.length <= NEWS_WINDOW_COUNT) {
      list.style.maxHeight = '';
      list.classList.remove('news-feed-windowed');
      return;
    }
    let height = 0;
    for (let i = 0; i < Math.min(NEWS_WINDOW_COUNT, cards.length); i++) {
      height += cards[i].getBoundingClientRect().height;
    }
    if (height === 0) {
      list.style.maxHeight = '';
      list.classList.remove('news-feed-windowed');
      return;
    }
    height += NEWS_WINDOW_COUNT - 1;
    list.style.maxHeight = `${Math.ceil(height)}px`;
    list.classList.add('news-feed-windowed');
  });

  renderNewsCoverageMetrics();
  renderNewsFeedHealth();
};

const getFilteredNewsArticles = () => {
  const days = getNewsDateFilter();
  const categoryKey = getNewsCategoryFilter();
  let filtered = filterNewsByDate(newsArticles, days);
  filtered = filterNewsByCategory(filtered, categoryKey);
  if (newsClosuresOnly) {
    filtered = filtered.filter(matchesClosureKeywords);
  }
  return filtered;
};

window.exportNewsFeed = async function(btn) {
  const filtered = getFilteredNewsArticles();
  if (!filtered.length) return;
  const lines = filtered.map(a => `${a.title}\n${a.url}`).join('\n\n');
  try {
    await navigator.clipboard.writeText(lines);
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    btn.classList.add('active');
    setTimeout(() => { btn.textContent = original; btn.classList.remove('active'); }, 2000);
  } catch {
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<pre style="font-family:system-ui;white-space:pre-wrap">${lines.replace(/</g, '&lt;')}</pre>`);
      w.document.close();
    }
  }
};

const loadNews = async () => {
  try {
    const data = await fetchJson(`/data/news.json?ts=${Date.now()}`);
    newsArticles = data.articles ?? [];
    newsFeedLastUpdated = data.lastUpdated || null;
    newsSourceHealth = data?.sourceHealth?.sources ?? [];
    newsCategoryCoverage = data?.categoryCoverage ?? {};
    renderNewsFeed();
    refreshTalentCommandCenter();
  renderSpecialtySurplus();
  } catch (err) {
    console.warn('News feed not available:', err.message);
    const list = document.getElementById('news-feed-list');
    if (list) list.innerHTML = '<div class="empty-state">News feed unavailable.</div>';
    newsArticles = [];
    newsSourceHealth = [];
    newsCategoryCoverage = {};
    renderNewsCoverageMetrics();
    renderNewsFeedHealth();
    refreshTalentCommandCenter();
  renderSpecialtySurplus();
  }
};

// Explicit window globals so inline onclick handlers can always find them
window.toggleNewsClosures = function(btn) {
  newsClosuresOnly = !newsClosuresOnly;
  btn.classList.toggle('active', newsClosuresOnly);
  renderNewsFeed();

  // Show toast with closure article count
  if (newsClosuresOnly) {
    const days = getNewsDateFilter();
    const dated = filterNewsByDate(newsArticles, days);
    const count = dated.filter(matchesClosureKeywords).length;
    const msg = count > 0
      ? `${count} closure article${count === 1 ? '' : 's'} found`
      : 'No closure articles listed';
    showNewsToast(msg);
  }
};

function showNewsToast(message) {
  let toast = document.getElementById('news-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'news-toast';
    toast.className = 'news-toast';
    const toolbar = document.querySelector('.news-feed-toolbar');
    if (toolbar) toolbar.parentElement.insertBefore(toast, toolbar.nextSibling);
    else document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
};

const initNewsFeed = () => {
  const dateFilter = document.getElementById('news-date-filter');
  if (dateFilter) {
    dateFilter.addEventListener('change', renderNewsFeed);
  }
  const categoryFilter = document.getElementById('news-category-filter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', renderNewsFeed);
  }
  // Closures & Export buttons use inline onclick handlers (see HTML)
};

// =============================================================================
// Talent Command Center
// =============================================================================
const TA_WEEKLY_RHYTHM = [
  { day: 'Monday', task: 'Prioritize top markets and specialties.' },
  { day: 'Tuesday', task: 'Build outreach campaigns by signal type.' },
  { day: 'Wednesday', task: 'Run outreach sprint + referral pushes.' },
  { day: 'Thursday', task: 'Review pipeline bottlenecks and rebalance.' },
  { day: 'Friday', task: 'Leadership KPI and ROI review.' }
];

const TA_ROLLOUT_PHASES = [
  { id: '30-instrumentation', phase: 'Days 0-30', task: 'Enable action queue ownership and 24h SLA tracking.' },
  { id: '60-conversion', phase: 'Days 31-60', task: 'Tune outreach templates and increase response/screen rates.' },
  { id: '90-automation', phase: 'Days 61-90', task: 'Automate top-priority actions from market signals.' }
];

const TA_CAMPAIGN_TEMPLATES = {
  closure: ({ specialty }) => `Subject: Immediate ${specialty} roles with stable teams and structured onboarding\n\nHi {{first_name}},\nWe saw recent workforce transitions in your market and wanted to share current ${specialty} opportunities with strong onboarding support, schedule flexibility, and transparent compensation.\n\nOpen to a 10-minute call this week?\n\n- {{recruiter_name}}`,
  strike: ({ specialty }) => `Subject: ${specialty} opportunities with continuity-focused teams\n\nHi {{first_name}},\nGiven labor volatility in your market, we are hiring ${specialty} clinicians into teams with protected staffing plans and clear leadership support.\n\nIf timing is right, I can share openings and shift options today.\n\n- {{recruiter_name}}`,
  expansion: ({ specialty }) => `Subject: New care capacity opening - ${specialty} hiring now\n\nHi {{first_name}},\nA major service-line expansion is underway and we are scaling ${specialty} coverage across day/night shifts. This is a strong entry point for long-term growth and advancement.\n\nCan we connect this week?\n\n- {{recruiter_name}}`,
  merger: ({ specialty }) => `Subject: Post-merger ${specialty} hiring with transition support\n\nHi {{first_name}},\nAs local systems consolidate, we are placing ${specialty} clinicians into stable teams with transition coaching and clear role alignment.\n\nHappy to share current openings if you are exploring options.\n\n- {{recruiter_name}}`
};

const parseNum = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

const pct = (num, den) => den > 0 ? `${Math.round((num / den) * 100)}%` : '0%';

const loadTalentCommandState = () => {
  try {
    const m = JSON.parse(localStorage.getItem(scopedStorageKey(TA_METRICS_BASE_KEY)) || 'null');
    if (m && typeof m === 'object') taMetrics = { ...taMetrics, ...m };
  } catch {}
  try {
    const a = JSON.parse(localStorage.getItem(scopedStorageKey(TA_ACTIONS_BASE_KEY)) || '[]');
    if (Array.isArray(a)) taActions = a;
  } catch {}
  try {
    const r = JSON.parse(localStorage.getItem(scopedStorageKey(TA_ROLLOUT_BASE_KEY)) || '{}');
    if (r && typeof r === 'object') taRolloutState = r;
  } catch {}
};

const saveTalentMetrics = () => localStorage.setItem(scopedStorageKey(TA_METRICS_BASE_KEY), JSON.stringify(taMetrics));
const saveTalentActions = () => localStorage.setItem(scopedStorageKey(TA_ACTIONS_BASE_KEY), JSON.stringify(taActions));
const saveTalentRollout = () => localStorage.setItem(scopedStorageKey(TA_ROLLOUT_BASE_KEY), JSON.stringify(taRolloutState));

const getTalentSignals = () => {
  const healthcare = (currentNotices || []).filter((notice) => isHealthcareNotice(notice));
  const byState = Array.from(groupBy(healthcare, (notice) => notice.state || 'NA').entries())
    .map(([state, rows]) => ({
      state,
      count: rows.length,
      affected: rows.reduce((sum, row) => sum + Number(row.affected_workers || row.affected || 0), 0)
    }))
    .sort((a, b) => b.affected - a.affected || b.count - a.count)
    .slice(0, 5);
  return { byState };
};

const seedTalentActions = () => {
  if (taActions.length) return;
  const { byState } = getTalentSignals();
  const seeded = [];
  byState.slice(0, 3).forEach((row, idx) => {
    seeded.push({
      id: `ta-${Date.now()}-${idx}`,
      title: `Launch targeted outreach in ${STATE_NAMES[row.state] || row.state}`,
      detail: `${row.count} healthcare notices and ${row.affected.toLocaleString()} affected workers detected.`,
      priority: idx === 0 ? 'critical' : 'high',
      owner: '',
      specialty: idx % 2 === 0 ? 'ICU' : 'Med-Surg',
      signalType: 'closure',
      status: 'open',
      createdAt: new Date().toISOString(),
      dueAt: new Date(Date.now() + (24 + idx * 12) * 60 * 60 * 1000).toISOString(),
      completedAt: null
    });
  });
  taActions = seeded;
  saveTalentActions();
};

const renderTalentRhythm = () => {
  if (!taWeeklyRhythm) return;
  taWeeklyRhythm.innerHTML = TA_WEEKLY_RHYTHM.map((item) => `
    <div class="talent-rhythm-item">
      <div class="talent-rhythm-day">${item.day}</div>
      <div class="talent-rhythm-task">${item.task}</div>
    </div>
  `).join('');
};

const readTalentMetricInputs = () => {
  taMetrics.outreach = parseNum(taInputOutreach?.value);
  taMetrics.responses = parseNum(taInputResponses?.value);
  taMetrics.screens = parseNum(taInputScreens?.value);
  taMetrics.offers = parseNum(taInputOffers?.value);
  taMetrics.accepted = parseNum(taInputAccepted?.value);
  taMetrics.hires = parseNum(taInputHires?.value);
  taMetrics.spend = parseNum(taInputSpend?.value);
  taMetrics.agencySaved = parseNum(taInputAgencySaved?.value);
  saveTalentMetrics();
};

const syncTalentMetricInputs = () => {
  if (taInputOutreach) taInputOutreach.value = String(taMetrics.outreach || 0);
  if (taInputResponses) taInputResponses.value = String(taMetrics.responses || 0);
  if (taInputScreens) taInputScreens.value = String(taMetrics.screens || 0);
  if (taInputOffers) taInputOffers.value = String(taMetrics.offers || 0);
  if (taInputAccepted) taInputAccepted.value = String(taMetrics.accepted || 0);
  if (taInputHires) taInputHires.value = String(taMetrics.hires || 0);
  if (taInputSpend) taInputSpend.value = String(taMetrics.spend || 0);
  if (taInputAgencySaved) taInputAgencySaved.value = String(taMetrics.agencySaved || 0);
};

const renderTalentKpis = () => {
  const highPriority = taActions.filter((action) => action.priority === 'critical' || action.priority === 'high');
  const completedFast = highPriority.filter((action) => {
    if (!action.completedAt) return false;
    const created = new Date(action.createdAt).getTime();
    const completed = new Date(action.completedAt).getTime();
    if (!Number.isFinite(created) || !Number.isFinite(completed)) return false;
    return (completed - created) <= (24 * 60 * 60 * 1000);
  });

  if (taKpiSla) taKpiSla.textContent = pct(completedFast.length, highPriority.length || 1);
  if (taKpiResponse) taKpiResponse.textContent = pct(taMetrics.responses, taMetrics.outreach || 1);
  if (taKpiScreen) taKpiScreen.textContent = pct(taMetrics.screens, taMetrics.responses || 1);
  if (taKpiAcceptance) taKpiAcceptance.textContent = pct(taMetrics.accepted, taMetrics.offers || 1);
  if (taKpiCost) taKpiCost.textContent = taMetrics.hires > 0 ? `$${Math.round(taMetrics.spend / taMetrics.hires).toLocaleString()}` : '$0';
  if (taKpiAgency) taKpiAgency.textContent = `$${Math.round(taMetrics.agencySaved || 0).toLocaleString()}`;
};

const renderTalentActions = () => {
  if (!taActionList) return;
  const ownerFilter = String(taOwnerFilter?.value || '').trim().toLowerCase();
  const specialtyFilter = String(taSpecialtyFilter?.value || '').trim();
  const filtered = taActions.filter((action) => {
    if (ownerFilter && !String(action.owner || '').toLowerCase().includes(ownerFilter)) return false;
    if (specialtyFilter && String(action.specialty || '') !== specialtyFilter) return false;
    return true;
  });

  if (!filtered.length) {
    taActionList.innerHTML = '<div class="empty-state">No actions match your filters.</div>';
    return;
  }

  taActionList.innerHTML = filtered.map((action) => `
    <div class="ta-action-row">
      <div class="ta-action-top">
        <div class="ta-action-title">${escapeHtml(action.title || 'Untitled action')}</div>
        <span class="ta-priority ${escapeHtml(action.priority || 'medium')}">${escapeHtml(action.priority || 'medium')}</span>
      </div>
      <div class="ta-action-meta">${escapeHtml(action.detail || '')}</div>
      <div class="ta-action-meta">
        Owner: ${escapeHtml(action.owner || 'Unassigned')} | Specialty: ${escapeHtml(action.specialty || '--')} |
        Due: ${escapeHtml(formatDate(action.dueAt))}
      </div>
      <div class="ta-action-buttons">
        <button type="button" data-ta-action="done" data-ta-id="${escapeHtml(action.id)}">Mark Done</button>
        <button type="button" data-ta-action="reopen" data-ta-id="${escapeHtml(action.id)}">Reopen</button>
        <button type="button" data-ta-action="assign-me" data-ta-id="${escapeHtml(action.id)}">Assign Owner Filter</button>
      </div>
    </div>
  `).join('');

  taActionList.querySelectorAll('button[data-ta-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-ta-id');
      const action = btn.getAttribute('data-ta-action');
      const target = taActions.find((row) => row.id === id);
      if (!target) return;
      if (action === 'done') {
        target.status = 'done';
        target.completedAt = new Date().toISOString();
      } else if (action === 'reopen') {
        target.status = 'open';
        target.completedAt = null;
      } else if (action === 'assign-me') {
        const owner = String(taOwnerFilter?.value || '').trim();
        if (owner) target.owner = owner;
      }
      saveTalentActions();
      renderTalentActions();
      renderTalentKpis();
    });
  });
};

const renderTalentCampaignTemplate = () => {
  if (!taCampaignTemplate) return;
  const signalType = String(taCampaignSignal?.value || 'closure');
  const specialty = String(taCampaignSpecialty?.value || 'ICU');
  const builder = TA_CAMPAIGN_TEMPLATES[signalType] || TA_CAMPAIGN_TEMPLATES.closure;
  taCampaignTemplate.value = builder({ specialty });
};

const renderTalentRollout = () => {
  if (!taRolloutList) return;
  taRolloutList.innerHTML = TA_ROLLOUT_PHASES.map((item) => `
    <label class="ta-rollout-item">
      <input type="checkbox" data-ta-rollout="${escapeHtml(item.id)}" ${taRolloutState[item.id] ? 'checked' : ''} />
      <div>
        <div class="ta-rollout-phase">${item.phase}</div>
        <div class="ta-rollout-task">${item.task}</div>
      </div>
    </label>
  `).join('');

  taRolloutList.querySelectorAll('input[data-ta-rollout]').forEach((input) => {
    input.addEventListener('change', () => {
      const id = input.getAttribute('data-ta-rollout');
      taRolloutState[id] = input.checked;
      saveTalentRollout();
    });
  });
};

const refreshTalentCommandCenter = () => {
  if (!taActionList) return;
  seedTalentActions();
  renderTalentKpis();
  renderTalentActions();
  renderTalentCampaignTemplate();
  renderTalentRollout();
};

const initTalentCommandCenter = () => {
  if (!taActionList) return;
  loadTalentCommandState();
  syncTalentMetricInputs();
  renderTalentRhythm();
  renderTalentRollout();
  renderTalentCampaignTemplate();

  [
    taInputOutreach, taInputResponses, taInputScreens, taInputOffers,
    taInputAccepted, taInputHires, taInputSpend, taInputAgencySaved
  ].forEach((input) => {
    input?.addEventListener('input', () => {
      readTalentMetricInputs();
      renderTalentKpis();
    });
  });

  taResetMetricsBtn?.addEventListener('click', () => {
    taMetrics = {
      outreach: 0, responses: 0, screens: 0, offers: 0,
      accepted: 0, hires: 0, spend: 0, agencySaved: 0
    };
    saveTalentMetrics();
    syncTalentMetricInputs();
    renderTalentKpis();
  });

  taOwnerFilter?.addEventListener('input', renderTalentActions);
  taSpecialtyFilter?.addEventListener('change', renderTalentActions);
  taCampaignSignal?.addEventListener('change', renderTalentCampaignTemplate);
  taCampaignSpecialty?.addEventListener('change', renderTalentCampaignTemplate);

  refreshTalentCommandCenter();
  renderSpecialtySurplus();
};

// Initialize app (called after login)
const initApp = () => {
  mapScope = 'healthcare';
  const safeInit = (fn, label) => {
    try { fn(); } catch (err) { console.warn(`Init error [${label}]:`, err); }
  };
  safeInit(initWeatherMap, 'weatherMap');
  safeInit(initHelpSection, 'helpSection');
  safeInit(initCollapsibleSections, 'collapsibleSections');
  safeInit(initStrategicReview, 'strategicReview');
  safeInit(initMapToggle, 'mapToggle');
  safeInit(initMapScopeToggle, 'mapScopeToggle');
  safeInit(initMapFactors, 'mapFactors');
  safeInit(initStateMultiSelect, 'stateMultiSelect');
  safeInit(initForecast, 'forecast');
  safeInit(initProgramsModule, 'programsModule');
  safeInit(initStateBeacon, 'stateBeacon');
  safeInit(initMasterExport, 'masterExport');
  safeInit(initStrikeAlerts, 'strikeAlerts');
  safeInit(initNewsFeed, 'newsFeed');
  safeInit(initTalentCommandCenter, 'talentCommandCenter');
  loadHealth();
  loadStatesWithMap();
  loadInsights();
  loadNews();
  loadCustomNotices();
  loadProjects();
  populateCustomStateDropdown();
  initProjectEvents();
  initLightworker();
  initStateCalibration();
  renderProjects();
  loadNotices();
};

window.addEventListener('resize', () => refreshNoticeListWindow());
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => refreshNoticeListWindow());
}

// Auto-init if already authenticated
bootstrapAuth();

