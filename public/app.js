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
const DATA_BASE_URL = (() => {
  const path = window.location.pathname;
  const basePath = path.endsWith('/') ? path : path.replace(/\/[^/]*$/, '/');
  return `${basePath}data`;
})();
const PASSCODE = 'IUH126';

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
const dataRefreshBadge = document.getElementById('data-refresh-badge');
const usMapContainer = document.getElementById('us-map');
const mapTooltip = document.getElementById('map-tooltip');
const mapToast = document.getElementById('map-toast');
const mapScopeHealthcareBtn = document.getElementById('map-scope-healthcare');
const mapScopeAllBtn = document.getElementById('map-scope-all');
const mapScopeLabel = document.getElementById('map-scope-label');
const mapHomeStateBtn = document.getElementById('map-home-state-btn');
const mapTargetModeBtn = document.getElementById('map-target-mode-btn');
const mapTargetStateBtn = document.getElementById('map-target-state-btn');
const mapFactorsBtn = document.getElementById('map-factors-btn');
const mapFactorsPanel = document.getElementById('map-factors-panel');
const mapFactorsClose = document.getElementById('map-factors-close');
const mapFactorsList = document.getElementById('map-factors-list');
const mapFactorsSubtitle = document.getElementById('map-factors-subtitle');
const mapTabLayoffs = document.getElementById('map-tab-layoffs');
const mapTabRural = document.getElementById('map-tab-rural');
const mapSectionTitle = document.getElementById('map-section-title');
const mapSectionDesc = document.getElementById('map-section-desc');
const ruralClosuresPanel = document.getElementById('rural-closures-panel');
const ruralClosuresTitle = document.getElementById('rural-closures-title');
const ruralClosuresSubtitle = document.getElementById('rural-closures-subtitle');
const ruralClosuresList = document.getElementById('rural-closures-list');
const ruralClosuresClose = document.getElementById('rural-closures-close');
const alertsList = document.getElementById('alerts-list');
const heatmapList = document.getElementById('heatmap-list');
const talentList = document.getElementById('talent-list');
const employerList = document.getElementById('employer-list');
const forecastBeds = document.getElementById('forecast-beds');
const forecastSetting = document.getElementById('forecast-setting');
const forecastHorizon = document.getElementById('forecast-horizon');
const forecastOutput = document.getElementById('forecast-output');

const customNoticeForm = document.getElementById('custom-notice-form');
const customStateSelect = document.getElementById('custom-state');

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
const stateBeaconHospitalsTop = document.getElementById('state-beacon-hospitals-top');
const stateBeaconHospitalsWorst = document.getElementById('state-beacon-hospitals-worst');
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
const openHomeStateBtn = document.getElementById('open-home-state');
// New Home State module elements
const homeStateName = document.getElementById('home-state-name');
const homeStateAbbr = document.getElementById('home-state-abbr');
const homeStateStatHospitals = document.getElementById('home-state-stat-hospitals');
const homeStateStatMetros = document.getElementById('home-state-stat-metros');
const homeStateStatPrograms = document.getElementById('home-state-stat-programs');
const homeStateStatCompact = document.getElementById('home-state-stat-compact');
const homeStateMetroMap = document.getElementById('home-state-metro-map');
const homeStateDetailPlaceholder = document.getElementById('home-state-detail-placeholder');
const homeStateDetailContent = document.getElementById('home-state-detail-content');
const homeStateMetroName = document.getElementById('home-state-metro-name');
const homeStateMetroBadge = document.getElementById('home-state-metro-badge');
const homeStateHospitalCount = document.getElementById('home-state-hospital-count');
const homeStateMetroHospitals = document.getElementById('home-state-metro-hospitals');
const homeStateMetroCompetition = document.getElementById('home-state-metro-competition');
const homeStateMetroSalary = document.getElementById('home-state-metro-salary');
const homeStateMetroFactors = document.getElementById('home-state-metro-factors');

// =============================================================================
// State
// =============================================================================
let allNotices = []; // All loaded notices
let allNoticesLoaded = false;
let allNoticesLoading = false;
let currentNotices = []; // Filtered notices
const stateNoticesCache = new Map();
const stateNoticesLoading = new Set();
let customNotices = [];
let projects = [];
let currentProjectId = null;
let stateData = {};
let stateDataAll = {};
let stateDataHealthcare = {};
let mapStateData = {};
let metadata = {};
let currentMapView = 'map';
let selectedStates = [];
let selectedSpecialties = [];
let mapScope = 'healthcare';
let isMapTargetMode = false;
let activeMapTab = 'layoffs'; // 'layoffs' or 'rural'
let currentPage = 1;
let searchQuery = '';
let applyFiltersToken = 0;
const NOTICE_MAX_COUNT = 100;
const NOTICE_WINDOW_COUNT = 5;
const NOTICES_PER_PAGE = NOTICE_MAX_COUNT;
let lastNoticeWindowCount = 0;
let noticeWindowRaf = null;
let calibrationStats = { minCount: 0, maxCount: 0 };
let nursingPrograms = [];
let programsSearchCache = []; // Pre-computed search haystacks
let programsMeta = { lastUpdated: null, sources: [] };
let programsLoaded = false;
let programsModuleInitialized = false;
let programsRefreshPrompted = false;
let stateBeaconData = null;
let stateBeaconLoaded = false;
let stateBeaconLoadedAt = 0;
const STATE_BEACON_REFRESH_MS = 30 * 60 * 1000; // refresh beacon data every 30 minutes
let stateBeaconInputs = null;
let stateNewsData = null;
let stateNewsLoaded = false;
let stateNewsLoadedAt = 0;
let ruralClosuresData = null;
let ruralClosuresLoaded = false;
let ruralClosuresLoadedAt = 0;
const RURAL_CLOSURES_REFRESH_MS = 30 * 60 * 1000;
const STATE_BEACON_DEFAULT = 'FL';
const STATE_BEACON_HOME_DEFAULT = 'IN';
const STATE_BEACON_INPUTS_KEY = 'lni_state_beacon_inputs';
const STATE_BEACON_NOTES_KEY = 'lni_state_beacon_notes';
const MAP_LONG_PRESS_MS = 2000;
const MAP_RECRUIT_TARGET_COUNT = 5;
let mapLongPressTimer = null;
let mapLongPressSuppressUntil = 0;
let mapRecruitTargetsInfo = [];

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
let strategicData = null; // Will be loaded from strategic.json
let strategicDataLoaded = false;
let relocationData = null; // Will be loaded from relocation.json
let relocationDataLoaded = false;
let recruitmentIntel = null; // Pre-computed recruitment scores from private repo
let recruitmentIntelLoaded = false;

const computeSignalConfidence = (noticeCount = 0, newsCount = 0, majorSystemsCount = 0) => {
  let score = 0;
  if (noticeCount >= 5) score += 2;
  else if (noticeCount >= 1) score += 1;
  if (newsCount >= 4) score += 2;
  else if (newsCount >= 1) score += 1;
  if (majorSystemsCount >= 4) score += 1;
  if (score >= 4) return { label: 'High', score };
  if (score >= 2) return { label: 'Medium', score };
  return { label: 'Low', score };
};

// =============================================================================
// Authentication (Simple client-side - data is public)
// =============================================================================
const SESSION_KEY = 'lni_authenticated';

const checkAuth = () => {
  if (!PASSCODE) return true;
  return sessionStorage.getItem(SESSION_KEY) === 'true';
};

const handleLogin = (e) => {
  e.preventDefault();
  const entered = passcodeInput.value.trim();

  if (!PASSCODE || entered === PASSCODE) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    loginOverlay.classList.add('hidden');
    passcodeInput.value = '';
    loginError.textContent = '';
    initApp().then(() => {
      initStrategicReview();
    });
  } else {
    loginError.textContent = 'Invalid passcode. Please try again.';
    loginError.classList.remove('shake');
    void loginError.offsetWidth;
    loginError.classList.add('shake');
    passcodeInput.value = '';
    passcodeInput.focus();
  }
};

loginForm?.addEventListener('submit', handleLogin);

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

// Exhaustive list of nursing specialties for recruiter search
const NURSE_SPECIALTIES = {
  // Critical Care & Emergency
  'ICU': { name: 'Intensive Care Unit (ICU)', keywords: ['icu', 'intensive care', 'critical care', 'ccu', 'coronary care'] },
  'MICU': { name: 'Medical ICU', keywords: ['micu', 'medical icu', 'medical intensive'] },
  'SICU': { name: 'Surgical ICU', keywords: ['sicu', 'surgical icu', 'surgical intensive'] },
  'CVICU': { name: 'Cardiovascular ICU', keywords: ['cvicu', 'cardiovascular icu', 'cardiac icu', 'heart'] },
  'NICU': { name: 'Neonatal ICU', keywords: ['nicu', 'neonatal', 'newborn intensive', 'neonate'] },
  'PICU': { name: 'Pediatric ICU', keywords: ['picu', 'pediatric icu', 'pediatric intensive'] },
  'ER': { name: 'Emergency Room / ED', keywords: ['emergency', 'er ', 'e.r.', 'ed ', 'emergency department', 'trauma', 'urgent'] },
  'Trauma': { name: 'Trauma Nursing', keywords: ['trauma', 'level i', 'level ii', 'trauma center'] },

  // Surgical & Perioperative
  'OR': { name: 'Operating Room', keywords: ['operating room', 'or ', 'o.r.', 'surgical', 'surgery', 'operative'] },
  'Perioperative': { name: 'Perioperative', keywords: ['perioperative', 'periop', 'pre-op', 'post-op', 'preoperative', 'postoperative'] },
  'PACU': { name: 'Post-Anesthesia Care Unit', keywords: ['pacu', 'post-anesthesia', 'recovery room', 'post anesthesia'] },
  'Circulating': { name: 'Circulating Nurse', keywords: ['circulating', 'circulator'] },
  'Scrub': { name: 'Scrub Nurse', keywords: ['scrub nurse', 'scrub tech'] },
  'First Assist': { name: 'First Assist (RNFA)', keywords: ['first assist', 'rnfa', 'surgical assist'] },

  // Medical-Surgical
  'Med-Surg': { name: 'Medical-Surgical', keywords: ['med-surg', 'med surg', 'medical surgical', 'medsurg', 'general medical'] },
  'Telemetry': { name: 'Telemetry / Step-Down', keywords: ['telemetry', 'tele', 'step-down', 'stepdown', 'progressive care', 'pcu'] },
  'Orthopedic': { name: 'Orthopedic', keywords: ['orthopedic', 'ortho', 'musculoskeletal', 'joint replacement', 'spine'] },
  'Neurology': { name: 'Neurology / Neuro', keywords: ['neurology', 'neuro', 'neurological', 'stroke', 'brain', 'neuroscience'] },
  'Oncology': { name: 'Oncology', keywords: ['oncology', 'onc', 'cancer', 'tumor', 'chemotherapy', 'radiation'] },
  'Cardiology': { name: 'Cardiology', keywords: ['cardiology', 'cardiac', 'heart', 'cardiovascular', 'cath lab', 'catheterization'] },
  'Pulmonary': { name: 'Pulmonary / Respiratory', keywords: ['pulmonary', 'respiratory', 'lung', 'pulmonology'] },
  'Renal': { name: 'Renal / Nephrology', keywords: ['renal', 'nephrology', 'kidney', 'dialysis', 'hemodialysis'] },
  'GI': { name: 'Gastroenterology', keywords: ['gastroenterology', 'gi ', 'gastrointestinal', 'endoscopy', 'digestive'] },
  'Urology': { name: 'Urology', keywords: ['urology', 'urological', 'bladder', 'prostate'] },

  // Women's Health & Pediatrics
  'OB': { name: 'Obstetrics / OB', keywords: ['obstetrics', 'ob ', 'o.b.', 'obstetric', 'prenatal'] },
  'L&D': { name: 'Labor & Delivery', keywords: ['labor and delivery', 'l&d', 'labor & delivery', 'delivery', 'birthing', 'birth'] },
  'Postpartum': { name: 'Postpartum / Mother-Baby', keywords: ['postpartum', 'mother-baby', 'mother baby', 'postnatal', 'maternity'] },
  'LDRP': { name: 'LDRP (Labor/Delivery/Recovery/Postpartum)', keywords: ['ldrp', 'labor delivery recovery'] },
  'Antepartum': { name: 'Antepartum / High-Risk OB', keywords: ['antepartum', 'high-risk ob', 'high risk pregnancy', 'perinatal'] },
  'Gynecology': { name: 'Gynecology', keywords: ['gynecology', 'gyn', 'women\'s health', 'womens health'] },
  'Pediatrics': { name: 'Pediatrics', keywords: ['pediatric', 'peds', 'children', 'child', 'kids', 'pediatric unit'] },
  'Pediatric ER': { name: 'Pediatric Emergency', keywords: ['pediatric emergency', 'pediatric er', 'peds er', 'children\'s emergency'] },
  'Pediatric Oncology': { name: 'Pediatric Oncology', keywords: ['pediatric oncology', 'pediatric cancer', 'childhood cancer'] },

  // Mental Health & Behavioral
  'Psych': { name: 'Psychiatric / Mental Health', keywords: ['psychiatric', 'psych', 'mental health', 'behavioral health', 'psychiatry'] },
  'Substance Abuse': { name: 'Substance Abuse / Addiction', keywords: ['substance abuse', 'addiction', 'detox', 'rehab', 'recovery', 'chemical dependency'] },
  'Geriatric Psych': { name: 'Geriatric Psychiatry', keywords: ['geriatric psych', 'geropsych', 'elderly mental health'] },
  'Child Psych': { name: 'Child/Adolescent Psychiatry', keywords: ['child psych', 'adolescent psych', 'pediatric psych', 'youth mental health'] },

  // Long-Term Care & Geriatrics
  'LTC': { name: 'Long-Term Care', keywords: ['long-term care', 'ltc', 'long term care', 'nursing home', 'extended care'] },
  'SNF': { name: 'Skilled Nursing Facility', keywords: ['skilled nursing', 'snf', 'skilled nursing facility'] },
  'Geriatrics': { name: 'Geriatrics', keywords: ['geriatric', 'elderly', 'senior', 'aging', 'gerontology'] },
  'Memory Care': { name: 'Memory Care / Dementia', keywords: ['memory care', 'dementia', 'alzheimer', 'cognitive'] },
  'Rehab': { name: 'Rehabilitation', keywords: ['rehabilitation', 'rehab', 'physical therapy', 'occupational therapy', 'acute rehab'] },

  // Community & Outpatient
  'Home Health': { name: 'Home Health', keywords: ['home health', 'home care', 'home nursing', 'visiting nurse', 'in-home'] },
  'Hospice': { name: 'Hospice / Palliative', keywords: ['hospice', 'palliative', 'end of life', 'comfort care', 'terminal'] },
  'Public Health': { name: 'Public Health', keywords: ['public health', 'community health', 'population health'] },
  'School Nurse': { name: 'School Nursing', keywords: ['school nurse', 'school nursing', 'student health'] },
  'Occupational Health': { name: 'Occupational Health', keywords: ['occupational health', 'employee health', 'workplace health', 'industrial'] },
  'Outpatient': { name: 'Outpatient / Ambulatory', keywords: ['outpatient', 'ambulatory', 'clinic', 'day surgery', 'same day'] },
  'Infusion': { name: 'Infusion / IV Therapy', keywords: ['infusion', 'iv therapy', 'infusion center', 'chemo infusion'] },
  'Wound Care': { name: 'Wound Care', keywords: ['wound care', 'wound ostomy', 'wocn', 'wound nurse', 'ostomy'] },

  // Specialty Units
  'Burn': { name: 'Burn Unit', keywords: ['burn', 'burn unit', 'burn center', 'burn icu'] },
  'Transplant': { name: 'Transplant', keywords: ['transplant', 'organ transplant', 'bone marrow', 'stem cell'] },
  'Dialysis': { name: 'Dialysis', keywords: ['dialysis', 'hemodialysis', 'peritoneal dialysis', 'renal replacement'] },
  'Endoscopy': { name: 'Endoscopy / GI Lab', keywords: ['endoscopy', 'gi lab', 'colonoscopy', 'upper gi'] },
  'Cath Lab': { name: 'Cardiac Cath Lab', keywords: ['cath lab', 'catheterization', 'cardiac cath', 'interventional cardiology'] },
  'Electrophysiology': { name: 'Electrophysiology (EP)', keywords: ['electrophysiology', 'ep lab', 'arrhythmia', 'pacemaker'] },
  'Interventional Radiology': { name: 'Interventional Radiology', keywords: ['interventional radiology', 'ir ', 'i.r.', 'vascular interventional'] },
  'Pain Management': { name: 'Pain Management', keywords: ['pain management', 'pain clinic', 'chronic pain', 'pain medicine'] },
  'Sleep Lab': { name: 'Sleep Lab', keywords: ['sleep lab', 'sleep study', 'sleep medicine', 'polysomnography'] },

  // Other Specialties
  'Float Pool': { name: 'Float Pool / Resource', keywords: ['float pool', 'float nurse', 'resource pool', 'prn', 'per diem'] },
  'Travel': { name: 'Travel Nurse', keywords: ['travel nurse', 'travel nursing', 'traveler', 'agency'] },
  'Triage': { name: 'Triage', keywords: ['triage', 'phone triage', 'nurse line', 'advice nurse'] },
  'Flight Nurse': { name: 'Flight / Transport Nurse', keywords: ['flight nurse', 'transport', 'air ambulance', 'critical care transport', 'ccrn'] },
  'Correctional': { name: 'Correctional Nursing', keywords: ['correctional', 'prison', 'jail', 'detention', 'forensic'] },
  'Military': { name: 'Military / VA', keywords: ['military', 'va ', 'veterans', 'army', 'navy', 'air force'] },
  'Parish': { name: 'Parish / Faith Community', keywords: ['parish', 'faith community', 'church', 'faith-based'] },
  'Legal Nurse': { name: 'Legal Nurse Consultant', keywords: ['legal nurse', 'lnc', 'forensic', 'legal consulting'] },
  'Aesthetic': { name: 'Aesthetic / Cosmetic', keywords: ['aesthetic', 'cosmetic', 'plastic surgery', 'dermatology', 'med spa'] },
  'Bariatric': { name: 'Bariatric', keywords: ['bariatric', 'weight loss surgery', 'obesity', 'gastric bypass'] },
  'Diabetes': { name: 'Diabetes Education', keywords: ['diabetes', 'diabetic', 'endocrine', 'glucose'] },
  'Allergy': { name: 'Allergy / Immunology', keywords: ['allergy', 'immunology', 'allergist'] },
  'ENT': { name: 'ENT / Otolaryngology', keywords: ['ent', 'otolaryngology', 'ear nose throat', 'audiology'] },
  'Ophthalmology': { name: 'Ophthalmology / Eye', keywords: ['ophthalmology', 'eye', 'vision', 'optometry', 'retina'] },
  'Dermatology': { name: 'Dermatology', keywords: ['dermatology', 'skin', 'dermatologic'] },
  'Vascular': { name: 'Vascular', keywords: ['vascular', 'vein', 'arterial', 'peripheral vascular'] }
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

const escapeHtml = (value) => {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const getStateBeaconInputs = () => {
  if (stateBeaconInputs) return stateBeaconInputs;
  try {
    const stored = localStorage.getItem(STATE_BEACON_INPUTS_KEY);
    stateBeaconInputs = stored ? JSON.parse(stored) : null;
  } catch {
    stateBeaconInputs = null;
  }
  return stateBeaconInputs;
};

const saveStateBeaconInputs = (inputs) => {
  stateBeaconInputs = inputs;
  try {
    localStorage.setItem(STATE_BEACON_INPUTS_KEY, JSON.stringify(inputs));
  } catch {
    // ignore
  }
};

const getStateBeaconNotes = () => {
  try {
    const stored = localStorage.getItem(STATE_BEACON_NOTES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveStateBeaconNotes = (notes) => {
  try {
    localStorage.setItem(STATE_BEACON_NOTES_KEY, JSON.stringify(notes));
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

const getStateNotices = (state) => {
  if (stateNoticesCache.has(state)) return stateNoticesCache.get(state);
  if (Array.isArray(allNotices) && allNoticesLoaded) {
    return allNotices.filter((notice) => notice.state === state);
  }
  return [];
};

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

const getNoticeDateValue = (notice) => {
  const raw = notice.notice_date || notice.noticeDate || notice.retrieved_at || notice.createdAt || notice.retrievedAt;
  if (!raw) return 0;
  const ts = new Date(raw).getTime();
  return Number.isFinite(ts) ? ts : 0;
};

const sortNoticesByNewest = (notices) => (
  notices.slice().sort((a, b) => getNoticeDateValue(b) - getNoticeDateValue(a))
);

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

const buildHealthcareStateCounts = (notices) => {
  const counts = {};
  notices.forEach((notice) => {
    if (!isHealthcareNotice(notice)) return;
    const state = notice.state;
    if (!state) return;
    counts[state] = (counts[state] || 0) + 1;
  });
  return Object.entries(counts).reduce((acc, [state, count]) => {
    acc[state] = { count };
    return acc;
  }, {});
};

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
    const candidates = ['./us-map.svg', '/us-map.svg', './apps/web/us-map.svg', 'us-map.svg'];
    let svgText = '';
    for (const url of candidates) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        svgText = await res.text();
        if (svgText.includes('<svg')) break;
      } catch {
        // Try next candidate
      }
    }
    if (!svgText) throw new Error('map fetch failed');
    usMapContainer.innerHTML = svgText;
  } catch (err) {
    console.error('Failed to load map SVG:', err);
    usMapContainer.innerHTML = '<div class="empty-state">Map unavailable.</div>';
    return;
  }

  const svg = usMapContainer.querySelector('svg');
  if (!svg) return;

  if (!svg.getAttribute('viewBox')) {
    const width = svg.getAttribute('width') || '960';
    const height = svg.getAttribute('height') || '600';
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }

  // Inject vibrant flame gradient for home state (yellow-orange to red-orange)
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <!-- Vibrant flame gradient with animated color stops -->
    <linearGradient id="home-state-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffe135">
        <animate attributeName="stop-color" values="#ffe135;#ffcc00;#ffe135" dur="2.5s" repeatCount="indefinite"/>
      </stop>
      <stop offset="25%" stop-color="#ffb300">
        <animate attributeName="stop-color" values="#ffb300;#ffc400;#ffb300" dur="3s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%" stop-color="#ff8c00">
        <animate attributeName="stop-color" values="#ff8c00;#ffa500;#ff8c00" dur="2s" repeatCount="indefinite"/>
      </stop>
      <stop offset="75%" stop-color="#ff6600">
        <animate attributeName="stop-color" values="#ff6600;#ff7700;#ff6600" dur="3.5s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" stop-color="#ff4500">
        <animate attributeName="stop-color" values="#ff4500;#ff5722;#ff4500" dur="2.8s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>
  `;
  svg.insertBefore(defs, svg.firstChild);

  const shapes = svg.querySelectorAll('path, circle');
    shapes.forEach((shape) => {
      const classList = Array.from(shape.classList || []);
      const stateClass = classList.find((c) => c.length === 2 && /^[a-z]{2}$/i.test(c));
      const rawId = shape.getAttribute('data-state') || shape.getAttribute('id') || '';
      const abbrev = (stateClass || rawId).toUpperCase();
      if (!/^[A-Z]{2}$/.test(abbrev)) return;
      shape.setAttribute('data-state', abbrev);
      shape.addEventListener('click', () => {
        if (Date.now() < mapLongPressSuppressUntil) return;
        // In rural mode, open the rural closures detail panel
        if (activeMapTab === 'rural') {
          showRuralClosuresPanel(abbrev);
          return;
        }
        // If target mode is active, set/clear target state instead of toggling selection
        if (isMapTargetMode) {
          const currentTarget = getMapTargetState();
          if (currentTarget === abbrev) {
            clearMapTargetState();
          } else {
            setMapTargetState(abbrev);
          }
          return;
        }
        toggleStateSelection(abbrev);
      });
      shape.addEventListener('mouseenter', (e) => showTooltip(e, abbrev));
      shape.addEventListener('mousemove', (e) => moveTooltip(e));
      shape.addEventListener('mouseleave', hideTooltip);
      shape.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        const homeState = getMapHomeState();
        if (!homeState || homeState !== abbrev) return;
        mapLongPressTimer = window.setTimeout(() => {
          mapLongPressSuppressUntil = Date.now() + 500;
          applyMapRecruitTargets(homeState);
          showMapToast(`Top recruiting targets highlighted for ${STATE_NAMES[homeState] || homeState}`);
        }, MAP_LONG_PRESS_MS);
      });
      const clearLongPress = () => {
        if (mapLongPressTimer) {
          clearTimeout(mapLongPressTimer);
          mapLongPressTimer = null;
        }
      };
      shape.addEventListener('pointerup', clearLongPress);
      shape.addEventListener('pointerleave', clearLongPress);
      shape.addEventListener('pointercancel', clearLongPress);
      // Right-click to set/clear home state
      shape.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const currentHome = getMapHomeState();
        if (currentHome === abbrev) {
          clearMapHomeState();
      } else {
        setMapHomeState(abbrev);
      }
    });
    // Double-click to open State Beacon for that state
    shape.addEventListener('dblclick', (e) => {
      e.preventDefault();
      openStateBeaconFromMap(abbrev);
    });
  });

  // Apply home state highlight if one is saved
  updateMapHomeStateHighlight();
  // Apply target state highlight if one is saved
  updateMapTargetStateHighlight();
};

  const showTooltip = (e, stateAbbrev) => {
    if (!mapTooltip) return;
    const stateName = STATE_NAMES[stateAbbrev] || stateAbbrev;

    // Show different tooltip based on active tab
    if (activeMapTab === 'rural') {
      const data = RURAL_HOSPITAL_CLOSURES[stateAbbrev] || { count: 0, recent: 0, atRisk: 0 };
      const riskLevel = data.atRisk > 5 ? 'High' : data.atRisk > 2 ? 'Medium' : 'Low';
      mapTooltip.innerHTML = `
        <div class="tooltip-state">${stateName}</div>
        <div class="tooltip-count">${data.count} closures since 2010 (${data.recent} recent)</div>
        <div class="tooltip-confidence">Hospitals at risk: ${data.atRisk}</div>
        <div class="tooltip-confidence">Risk level: ${riskLevel}</div>
      `;
    } else {
      const count = mapStateData[stateAbbrev]?.count || 0;
      const scopeLabel = mapScope === 'all' ? 'total notices' : 'healthcare notices';
      const confidence = count >= 8 ? 'High' : count >= 3 ? 'Medium' : 'Low';
      mapTooltip.innerHTML = `
        <div class="tooltip-state">${stateName}</div>
        <div class="tooltip-count">${count} ${scopeLabel}</div>
        <div class="tooltip-confidence">Signal confidence: ${confidence}</div>
      `;
    }
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

const KY_DETAILS = {
  KY: {
    nursingEducation: {
      ukSystemPercentage: 32,
      kctcsPercentage: 26,
      otherSchoolsPercentage: 42,
      totalGraduatesAnnual: 3800,
      retentionRate: 58
    },
    salaryMeta: {
      updatedAt: '2026-02-01',
      updateEveryDays: 7,
      breakdown: [
        { label: 'BLS Kentucky RN mean (May 2023)', value: '$38-40/hr range', note: 'Statewide OEWS data' },
        { label: 'BLS Louisville/Jefferson County RN mean (May 2023)', value: '$40-43/hr range', note: 'Metro OEWS data' },
        { label: 'BLS Lexington-Fayette RN mean (May 2023)', value: '$37-40/hr range', note: 'Metro OEWS data' },
        { label: 'Job board ranges (KY/metro)', value: '$30-43/hr typical', note: 'Company salary pages by system' },
        { label: 'Travel RN weekly ranges (KY)', value: '$1,800-2,700/wk', note: 'Regional travel assignments' }
      ],
      sources: [
        { name: 'BLS OEWS Kentucky RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_ky.htm' },
        { name: 'BLS OEWS Louisville MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_31140.htm' },
        { name: 'BLS OEWS Lexington MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_30460.htm' }
      ]
    },
    metros: [
      {
        name: 'Louisville',
        size: 'major',
        population: '1.3M',
        competition: 'high',
        hospitals: [
          { name: 'Norton Hospital', system: 'Norton Healthcare', score: 93, beds: 600, reviews: 4.2 },
          { name: 'Norton Womens and Childrens Hospital', system: 'Norton Healthcare', score: 92, beds: 300, reviews: 4.3 },
          { name: 'Norton Audubon Hospital', system: 'Norton Healthcare', score: 88, beds: 287, reviews: 4.0 },
          { name: 'Norton Brownsboro Hospital', system: 'Norton Healthcare', score: 86, beds: 190, reviews: 4.1 },
          { name: 'UofL Health - Jewish Hospital', system: 'UofL Health', score: 90, beds: 462, reviews: 4.0 },
          { name: 'UofL Health - University Hospital', system: 'UofL Health', score: 89, beds: 404, reviews: 4.0 },
          { name: 'Baptist Health Louisville', system: 'Baptist Health', score: 87, beds: 519, reviews: 3.9 },
          { name: 'UofL Health - Frazier Rehab', system: 'UofL Health', score: 84, beds: 157, reviews: 4.1 }
        ],
        systems: [
          { name: 'Norton Healthcare', facilities: 6, marketShare: '45%' },
          { name: 'UofL Health', facilities: 3, marketShare: '20%' },
          { name: 'Baptist Health', facilities: 2, marketShare: '15%' },
          { name: 'Independent', facilities: 3, marketShare: '20%' }
        ],
        salary: {
          staffRN: '$30-43/hr',
          travelRN: '$2,100-2,700/wk',
          signOn: '$8-22K',
          systems: [
            { name: 'Norton Healthcare', value: '$38-42/hr est', source: 'Job boards' },
            { name: 'UofL Health', value: '$37-41/hr est', source: 'Job boards' },
            { name: 'Baptist Health', value: '$35-40/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Large tertiary referral market', type: 'positive' },
          { text: 'Multiple competing systems', type: 'positive' },
          { text: 'High ICU and OR demand', type: 'positive' },
          { text: 'Above-average competition for experienced RNs', type: 'neutral' },
          { text: 'Traffic and commute variability', type: 'neutral' }
        ]
      },
      {
        name: 'Lexington',
        size: 'medium',
        population: '530K',
        competition: 'medium',
        hospitals: [
          { name: 'UK Albert B. Chandler Hospital', system: 'UK HealthCare', score: 92, beds: 945, reviews: 4.3 },
          { name: 'UK Good Samaritan Hospital', system: 'UK HealthCare', score: 85, beds: 208, reviews: 4.0 },
          { name: 'Baptist Health Lexington', system: 'Baptist Health', score: 87, beds: 434, reviews: 3.9 },
          { name: 'Saint Joseph Hospital', system: 'CHI Saint Joseph', score: 84, beds: 433, reviews: 3.8 },
          { name: 'Saint Joseph East', system: 'CHI Saint Joseph', score: 82, beds: 217, reviews: 3.8 }
        ],
        systems: [
          { name: 'UK HealthCare', facilities: 2, marketShare: '45%' },
          { name: 'CHI Saint Joseph', facilities: 2, marketShare: '30%' },
          { name: 'Baptist Health', facilities: 1, marketShare: '20%' },
          { name: 'Independent', facilities: 1, marketShare: '5%' }
        ],
        salary: {
          staffRN: '$29-41/hr',
          travelRN: '$1,950-2,500/wk',
          signOn: '$7-18K',
          systems: [
            { name: 'UK HealthCare', value: '$36-41/hr est', source: 'Job boards' },
            { name: 'CHI Saint Joseph', value: '$34-39/hr est', source: 'Job boards' },
            { name: 'Baptist Health', value: '$33-38/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Academic medical center pipeline', type: 'positive' },
          { text: 'Strong residency programs', type: 'positive' },
          { text: 'Growing outpatient demand', type: 'neutral' },
          { text: 'Moderate competition for specialty roles', type: 'neutral' }
        ]
      },
      {
        name: 'Northern Kentucky',
        size: 'medium',
        population: '450K',
        competition: 'medium',
        hospitals: [
          { name: 'St Elizabeth Edgewood', system: 'St Elizabeth Healthcare', score: 88, beds: 491, reviews: 4.0 },
          { name: 'St Elizabeth Florence', system: 'St Elizabeth Healthcare', score: 84, beds: 401, reviews: 3.9 },
          { name: 'St Elizabeth Ft Thomas', system: 'St Elizabeth Healthcare', score: 82, beds: 236, reviews: 3.8 },
          { name: 'St Elizabeth Grant', system: 'St Elizabeth Healthcare', score: 80, beds: 109, reviews: 3.7 }
        ],
        systems: [
          { name: 'St Elizabeth Healthcare', facilities: 4, marketShare: '65%' },
          { name: 'Cincinnati systems (OH)', facilities: 2, marketShare: '25%' },
          { name: 'Independent', facilities: 1, marketShare: '10%' }
        ],
        salary: {
          staffRN: '$30-42/hr',
          travelRN: '$2,000-2,600/wk',
          signOn: '$7-16K',
          systems: [
            { name: 'St Elizabeth Healthcare', value: '$34-40/hr est', source: 'Job boards' },
            { name: 'Cincinnati systems (OH)', value: '$36-42/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Cincinnati metro spillover demand', type: 'positive' },
          { text: 'Commuter-friendly market', type: 'positive' },
          { text: 'Cross-border competition for nurses', type: 'neutral' }
        ]
      },
      {
        name: 'Bowling Green',
        size: 'small',
        population: '180K',
        competition: 'low',
        hospitals: [
          { name: 'The Medical Center at Bowling Green', system: 'Med Center Health', score: 84, beds: 477, reviews: 3.9 },
          { name: 'TriStar Greenview Regional', system: 'HCA TriStar', score: 80, beds: 211, reviews: 3.7 }
        ],
        systems: [
          { name: 'Med Center Health', facilities: 1, marketShare: '60%' },
          { name: 'HCA TriStar', facilities: 1, marketShare: '40%' }
        ],
        salary: {
          staffRN: '$27-36/hr',
          travelRN: '$1,700-2,200/wk',
          signOn: '$5-12K',
          systems: [
            { name: 'Med Center Health', value: '$30-36/hr est', source: 'Job boards' },
            { name: 'HCA TriStar', value: '$29-35/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Regional hub for south-central KY', type: 'positive' },
          { text: 'Lower cost of living', type: 'positive' },
          { text: 'Limited specialty roles', type: 'neutral' }
        ]
      },
      {
        name: 'Owensboro',
        size: 'small',
        population: '120K',
        competition: 'low',
        hospitals: [
          { name: 'Owensboro Health Regional', system: 'Owensboro Health', score: 83, beds: 477, reviews: 3.9 },
          { name: 'Owensboro Health Twin Lakes', system: 'Owensboro Health', score: 78, beds: 74, reviews: 3.7 }
        ],
        systems: [
          { name: 'Owensboro Health', facilities: 2, marketShare: '80%' },
          { name: 'Independent', facilities: 1, marketShare: '20%' }
        ],
        salary: {
          staffRN: '$26-35/hr',
          travelRN: '$1,650-2,150/wk',
          signOn: '$5-10K',
          systems: [
            { name: 'Owensboro Health', value: '$29-35/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Strong community hospital reputation', type: 'positive' },
          { text: 'Affordable housing market', type: 'positive' },
          { text: 'Smaller specialty mix', type: 'neutral' }
        ]
      },
      {
        name: 'Paducah',
        size: 'small',
        population: '100K',
        competition: 'low',
        hospitals: [
          { name: 'Baptist Health Paducah', system: 'Baptist Health', score: 82, beds: 344, reviews: 3.8 },
          { name: 'Mercy Health Lourdes', system: 'Mercy Health', score: 80, beds: 197, reviews: 3.7 }
        ],
        systems: [
          { name: 'Baptist Health', facilities: 1, marketShare: '55%' },
          { name: 'Mercy Health', facilities: 1, marketShare: '40%' },
          { name: 'Independent', facilities: 1, marketShare: '5%' }
        ],
        salary: {
          staffRN: '$26-34/hr',
          travelRN: '$1,600-2,050/wk',
          signOn: '$5-10K',
          systems: [
            { name: 'Baptist Health', value: '$29-34/hr est', source: 'Job boards' },
            { name: 'Mercy Health', value: '$28-33/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Regional draw for western KY', type: 'positive' },
          { text: 'Lower cost of living', type: 'positive' },
          { text: 'Limited critical care volume', type: 'neutral' }
        ]
      }
    ]
  }
};


// =============================================================================
// Map Home State (right-click to set, double-click to clear)
// =============================================================================
const MAP_HOME_STATE_KEY = 'lighthouseiq_map_home_state';

const getMapHomeState = () => {
  try {
    return localStorage.getItem(MAP_HOME_STATE_KEY) || null;
  } catch {
    return null;
  }
};

const setMapHomeState = (stateAbbrev) => {
  try {
    localStorage.setItem(MAP_HOME_STATE_KEY, stateAbbrev);
    // Also sync with the State Beacon home select if it exists
    if (stateBeaconHomeSelect) {
      stateBeaconHomeSelect.value = stateAbbrev;
      // Persist to State Beacon inputs
      const inputs = getStateBeaconInputs() || {};
      inputs.homeState = stateAbbrev;
      saveStateBeaconInputs(inputs);
    }
  } catch {
    // ignore
  }
  clearMapRecruitTargets();
  updateMapHomeStateHighlight();
  showMapToast(`Home state set to ${STATE_NAMES[stateAbbrev] || stateAbbrev}`);
};

const clearMapHomeState = () => {
  try {
    localStorage.removeItem(MAP_HOME_STATE_KEY);
  } catch {
    // ignore
  }
  clearMapRecruitTargets();
  updateMapHomeStateHighlight();
  showMapToast('Home state cleared');
};

const updateMapHomeStateHighlight = () => {
  const homeState = getMapHomeState();
  document.querySelectorAll('.us-map path[data-state], .us-map circle[data-state]').forEach(shape => {
    shape.classList.remove('home-state-glow');
    if (homeState && shape.dataset.state === homeState) {
      shape.classList.add('home-state-glow');
    }
  });
  if (mapHomeStateBtn) {
    mapHomeStateBtn.style.display = homeState ? 'inline-flex' : 'none';
  }
};

// =============================================================================
// Map Target State (target mode + highlight)
// =============================================================================
const MAP_TARGET_STATE_KEY = 'lighthouseiq_map_target_state';

const getMapTargetState = () => {
  try {
    return localStorage.getItem(MAP_TARGET_STATE_KEY) || null;
  } catch {
    return null;
  }
};

const setMapTargetState = (stateAbbrev) => {
  try {
    localStorage.setItem(MAP_TARGET_STATE_KEY, stateAbbrev);
  } catch {
    // ignore
  }
  updateMapTargetStateHighlight();
  showMapToast(`Target state set to ${STATE_NAMES[stateAbbrev] || stateAbbrev}`);
};

const clearMapTargetState = () => {
  try {
    localStorage.removeItem(MAP_TARGET_STATE_KEY);
  } catch {
    // ignore
  }
  updateMapTargetStateHighlight();
  showMapToast('Target state cleared');
};

const updateMapTargetStateHighlight = () => {
  const targetState = getMapTargetState();
  document.querySelectorAll('.us-map path[data-state], .us-map circle[data-state]').forEach(shape => {
    shape.classList.remove('target-state-glow');
    if (targetState && shape.dataset.state === targetState) {
      shape.classList.add('target-state-glow');
    }
  });
  if (mapTargetStateBtn) {
    mapTargetStateBtn.style.display = targetState ? 'inline-flex' : 'none';
  }
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

const getRegionForState = (state) => {
  const entry = Object.entries(REGION_STATES).find(([, states]) => states.includes(state));
  return entry ? entry[0] : null;
};

const scoreOutOfStateTarget = (homeState, targetState) => {
  // Use pre-computed data from private repo when available
  const precomputedScore = recruitmentIntel?.recruitmentScores?.[homeState]?.[targetState];
  const salaryBenchmarks = recruitmentIntel?.salaryBenchmarks;
  const relocationIndex = recruitmentIntel?.relocationIndex;

  // Get display factors (safe to expose - just data, not algorithms)
  const salaryData = salaryBenchmarks || strategicData?.salaryData || NURSING_SALARY_DATA;
  const shortage = salaryData[targetState]?.shortage ?? 'balanced';
  const homeSalary = Number(salaryData[homeState]?.staffRN ?? 0);
  const targetSalary = Number(salaryData[targetState]?.staffRN ?? 0);
  const salaryDelta = homeSalary && targetSalary ? homeSalary - targetSalary : 0;
  const projectedGap = Number(salaryData[targetState]?.projectedGap ?? 0);
  const travelWeekly = Number(salaryData[targetState]?.travelWeekly ?? 0);
  const noticeCount = mapStateData?.[targetState]?.count ?? 0;
  const relocationScale = relocationIndex?.[targetState] ?? relocationData?.relocationScale?.[targetState];
  const relocationSource = relocationData?.relocationSource?.[targetState] ?? null;
  const relocationUpdated = recruitmentIntel?.lastUpdated ?? relocationData?.lastUpdated ?? null;
  const targetRegion = salaryData[targetState]?.region ?? getRegionForState(targetState);

  // Cost of living data
  const homeCOL = COST_OF_LIVING_INDEX[homeState] ?? 100;
  const targetCOL = COST_OF_LIVING_INDEX[targetState] ?? 100;
  const colDelta = homeCOL - targetCOL; // Positive means target is cheaper
  const colAdjustedSalary = targetSalary * (100 / targetCOL); // Purchasing power adjusted

  // Rural hospital closure data
  const ruralClosures = RURAL_HOSPITAL_CLOSURES[targetState] ?? { count: 0, recent: 0, atRisk: 0 };
  const closureRisk = ruralClosures.atRisk > 5 ? 'high' : ruralClosures.atRisk > 2 ? 'medium' : 'low';

  // Use pre-computed score if available, otherwise fall back to simplified display score
  let score;
  if (typeof precomputedScore === 'number') {
    score = precomputedScore;
  } else {
    // Simplified fallback (non-proprietary) - just for display ordering
    const homeRegion = getRegionForState(homeState);
    const regionFactor = homeRegion && targetRegion && homeRegion === targetRegion ? 0.5 : 0;
    const shortageFactor = shortage === 'surplus' ? 1 : shortage === 'balanced' ? 0.5 : 0;
    // Add cost of living factor (lower COL = better for recruiting)
    const colFactor = colDelta > 10 ? 0.3 : colDelta > 0 ? 0.15 : 0;
    // Add rural closure factor (more closures = more available nurses)
    const closureFactor = ruralClosures.recent > 0 ? 0.2 : 0;
    score = regionFactor + shortageFactor + colFactor + closureFactor + Math.min(noticeCount / 10, 1);
  }

  return {
    score,
    factors: {
      shortage,
      projectedGap,
      noticeCount,
      region: targetRegion,
      travelWeekly,
      salaryDelta,
      targetSalary,
      homeSalary,
      relocationScale,
      relocationSource,
      relocationUpdated,
      // Cost of living factors
      homeCOL,
      targetCOL,
      colDelta,
      colAdjustedSalary,
      // Rural hospital factors
      ruralClosures: ruralClosures.count,
      recentClosures: ruralClosures.recent,
      hospitalsAtRisk: ruralClosures.atRisk,
      closureRisk
    }
  };
};

const getRecruitingTargets = (homeState, count = MAP_RECRUIT_TARGET_COUNT) => {
  // Use pre-computed top targets from private repo when available
  const precomputedTargets = recruitmentIntel?.topTargets?.[homeState];
  if (Array.isArray(precomputedTargets) && precomputedTargets.length >= count) {
    return precomputedTargets.slice(0, count).map(state => ({
      state,
      ...scoreOutOfStateTarget(homeState, state)
    }));
  }

  // Fallback to dynamic calculation
  const salaryData = recruitmentIntel?.salaryBenchmarks || strategicData?.salaryData || NURSING_SALARY_DATA;
  return Object.keys(salaryData)
    .filter((state) => state !== homeState)
    .map((state) => ({ state, ...scoreOutOfStateTarget(homeState, state) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
};

const clearMapRecruitTargets = () => {
  const svg = usMapContainer?.querySelector('svg');
  if (!svg) return;
  svg.querySelectorAll('.state-rank-label').forEach((node) => node.remove());
  svg.querySelectorAll('[data-state].recruit-target').forEach((shape) => {
    shape.classList.remove('recruit-target');
  });
  mapRecruitTargetsInfo = [];
  if (mapFactorsPanel && mapFactorsPanel.style.display !== 'none') {
    renderMapFactors();
  }
};

const applyMapRecruitTargets = (homeState) => {
  if (!homeState) return;
  const svg = usMapContainer?.querySelector('svg');
  if (!svg) return;
  clearMapRecruitTargets();
  const targets = getRecruitingTargets(homeState);
  mapRecruitTargetsInfo = targets;
  if (!targets.length) return;
  let layer = svg.querySelector('.state-rank-layer');
  if (!layer) {
    layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    layer.setAttribute('class', 'state-rank-layer');
    svg.appendChild(layer);
  }
  targets.forEach((entry, index) => {
    const state = entry.state;
    const rank = index + 1;
    const shapes = svg.querySelectorAll(`[data-state="${state}"]`);
    shapes.forEach((shape) => shape.classList.add('recruit-target'));
    const primary = shapes[0];
    if (!primary) return;
    const bbox = primary.getBBox();
    const x = bbox.x + bbox.width / 2;
    const y = bbox.y + bbox.height / 2;
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'state-rank-label');
    group.setAttribute('data-state', state);
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 8);
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y + 3);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'state-rank-text');
    text.textContent = `${rank}`;
    group.appendChild(circle);
    group.appendChild(text);
    layer.appendChild(group);
  });
  if (mapFactorsPanel && mapFactorsPanel.style.display !== 'none') {
    renderMapFactors();
  }
};

const renderMapFactors = () => {
  if (!mapFactorsList || !mapFactorsSubtitle) return;
  const homeState = getMapHomeState();
  if (!homeState) {
    mapFactorsSubtitle.textContent = 'Set a Home State and long-press it to rank targets.';
    mapFactorsList.innerHTML = '';
    return;
  }
  if (!mapRecruitTargetsInfo.length) {
    mapFactorsSubtitle.textContent = 'Long-press your Home State to generate top out-of-state targets.';
    mapFactorsList.innerHTML = '';
    return;
  }
  const homeName = STATE_NAMES[homeState] || homeState;
  const relocationRefresh = relocationData?.lastUpdated
    ? ` Relocation data refresh: ${formatRelativeTime(relocationData.lastUpdated)}.`
    : '';
  mapFactorsSubtitle.textContent = `Ranked for recruiting into ${homeName}. Factors: cost-of-living index, salary purchasing power, relocation friction, shortage status, WARN activity, rural hospital closures, and RN relocation scale.${relocationRefresh}`;
  mapFactorsList.innerHTML = mapRecruitTargetsInfo.map((entry, idx) => {
    const targetName = STATE_NAMES[entry.state] || entry.state;
    const f = entry.factors;

    // Salary and pay delta
    const salaryNote = f.salaryDelta
      ? `${f.salaryDelta >= 0 ? 'Lower' : 'Higher'} pay vs ${homeState}: $${Math.abs(f.salaryDelta).toLocaleString()}`
      : `Pay delta vs ${homeState}: n/a`;

    // Cost of living
    const colNote = f.colDelta !== undefined
      ? `COL Index: ${f.targetCOL} (${f.colDelta > 0 ? f.colDelta.toFixed(1) + ' cheaper' : Math.abs(f.colDelta).toFixed(1) + ' more expensive'} than ${homeState})`
      : 'COL: n/a';
    const adjustedSalaryNote = f.colAdjustedSalary
      ? `Adjusted salary (PPP): $${Math.round(f.colAdjustedSalary).toLocaleString()}`
      : '';

    // Gap and travel
    const gapNote = Number.isFinite(f.projectedGap)
      ? `Projected gap: ${f.projectedGap.toLocaleString()}`
      : 'Projected gap: n/a';
    const travelNote = f.travelWeekly
      ? `Travel weekly: ${Number(f.travelWeekly).toLocaleString()}`
      : 'Travel weekly: n/a';

    // Relocation
    const relocationScale = typeof f.relocationScale === 'number'
      ? Math.round(f.relocationScale)
      : null;
    const relocationSourceMap = { rn: 'RN', clinical: 'Clinical', general: 'General' };
    const relocationSource = relocationSourceMap[f.relocationSource] || 'n/a';
    const relocationNote = relocationScale !== null
      ? `Relocation scale: ${relocationScale} (${relocationSource})`
      : 'Relocation scale: n/a';

    // Rural hospital closures
    const closureNote = f.ruralClosures !== undefined
      ? `Rural closures: ${f.ruralClosures} total (${f.recentClosures} recent)`
      : 'Rural closures: n/a';
    const riskClass = f.closureRisk === 'high' ? 'risk-high' : f.closureRisk === 'medium' ? 'risk-medium' : 'risk-low';
    const atRiskNote = f.hospitalsAtRisk !== undefined
      ? `<span class="${riskClass}">Hospitals at risk: ${f.hospitalsAtRisk}</span>`
      : '';

    return `
        <div class="map-factor-card">
          <div class="map-factor-title">#${idx + 1} ${targetName} (${entry.state})</div>
          <div class="map-factor-meta">
            <div class="factor-row"><strong>Market:</strong> Shortage: ${f.shortage} | WARN notices: ${f.noticeCount} | Region: ${f.region || 'n/a'}</div>
            <div class="factor-row"><strong>Salary:</strong> ${salaryNote} | ${adjustedSalaryNote}</div>
            <div class="factor-row"><strong>Cost of Living:</strong> ${colNote}</div>
            <div class="factor-row"><strong>Rural Hospitals:</strong> ${closureNote} | ${atRiskNote}</div>
            <div class="factor-row"><strong>Mobility:</strong> ${gapNote} | ${travelNote} | ${relocationNote}</div>
          </div>
        </div>
      `;
  }).join('');
};

const showMapToast = (message) => {
  const toast = document.getElementById('map-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2000);
};

const openStateBeaconFromMap = (targetState) => {
  // Get saved home state from map
  const homeState = getMapHomeState();

  // Set home state in State Beacon if one is saved
  if (homeState && stateBeaconHomeSelect) {
    stateBeaconHomeSelect.value = homeState;
  }

  // Set target state and open State Beacon
  if (stateBeaconStateSelect) {
    stateBeaconStateSelect.value = targetState;
  }

  // Open the State Beacon module
  openStateBeacon(targetState);
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
    const refreshedLabel = formatRelativeTime(metadata.lastUpdated);
    statUpdated.textContent = refreshedLabel;
    if (dataRefreshBadge) {
      dataRefreshBadge.textContent = `Data refresh: ${refreshedLabel}`;
    }
    if (statTotal && metadata.totalNotices && !allNoticesLoaded) {
      statTotal.textContent = metadata.totalNotices.toString();
    }
  } catch (err) {
    console.error('Failed to load metadata:', err);
    setStatus('Data unavailable', false);
  }
};

const loadStates = async () => {
  try {
    const data = await fetchJson(`${DATA_BASE_URL}/states.json`);
    stateDataAll = normalizeStateCounts(data.states ?? []);
    stateData = stateDataAll;
    if (!Object.keys(stateDataHealthcare).length) {
      stateDataHealthcare = stateDataAll;
    }
    mapStateData = mapScope === 'all' ? stateDataAll : stateDataHealthcare;
    if (!mapStateData || Object.keys(mapStateData).length === 0) {
      mapStateData = stateDataAll;
    }
    statStates.textContent = Object.keys(stateDataAll).length.toString();
    const counts = Object.values(stateData).map(entry => entry.count ?? 0);
    calibrationStats = {
      minCount: counts.length ? Math.min(...counts) : 0,
      maxCount: counts.length ? Math.max(...counts) : 0
    };
    updateStateCalibration();
    updateMapColors(); // Color states based on layoff count
    await setMapScope(mapScope);
  } catch (err) {
    console.error('Failed to load states:', err);
    statStates.textContent = '0';
  }
};

// Color each state based on layoff count (green = low, red = high)
const updateMapColors = () => {
  const counts = Object.values(mapStateData).map(entry => entry.count ?? 0);
  const maxCount = Math.max(...counts, 1); // Avoid division by zero

  document.querySelectorAll('.us-map path[data-state], .us-map circle[data-state]').forEach(shape => {
    const state = shape.dataset.state;
    const count = mapStateData[state]?.count ?? 0;

    // Remove all existing layoff and rural classes
    for (let i = 0; i <= 9; i++) {
      shape.classList.remove(`layoff-${i}`);
    }
    shape.classList.remove('rural-critical', 'rural-warning', 'rural-stable');

    // Calculate intensity level (0-9) based on count relative to max
    let level = 0;
    if (count === 0) {
      level = 0;
    } else if (count <= maxCount * 0.05) {
      level = 1;
    } else if (count <= maxCount * 0.1) {
      level = 2;
    } else if (count <= maxCount * 0.2) {
      level = 3;
    } else if (count <= maxCount * 0.3) {
      level = 4;
    } else if (count <= maxCount * 0.4) {
      level = 5;
    } else if (count <= maxCount * 0.55) {
      level = 6;
    } else if (count <= maxCount * 0.7) {
      level = 7;
    } else if (count <= maxCount * 0.85) {
      level = 8;
    } else {
      level = 9;
    }

    shape.classList.add(`layoff-${level}`);
  });
};

// Color each state based on rural hospital closures/at-risk status
const updateRuralMapColors = () => {
  const maxAtRisk = Math.max(...Object.values(RURAL_HOSPITAL_CLOSURES).map(d => d.atRisk), 1);
  const maxClosures = Math.max(...Object.values(RURAL_HOSPITAL_CLOSURES).map(d => d.count), 1);

  document.querySelectorAll('.us-map path[data-state], .us-map circle[data-state]').forEach(shape => {
    const state = shape.dataset.state;
    const data = RURAL_HOSPITAL_CLOSURES[state] || { count: 0, recent: 0, atRisk: 0 };

    // Remove all existing layoff classes
    for (let i = 0; i <= 9; i++) {
      shape.classList.remove(`layoff-${i}`);
    }
    shape.classList.remove('rural-critical', 'rural-warning', 'rural-stable');

    // Color based on closures + at-risk (combined risk score)
    const riskScore = data.count + data.atRisk * 1.5;
    const maxRisk = maxClosures + maxAtRisk * 1.5;

    if (riskScore === 0) {
      shape.classList.add('rural-stable');
    } else if (riskScore >= maxRisk * 0.6 || data.atRisk >= 8) {
      shape.classList.add('rural-critical');
    } else if (riskScore >= maxRisk * 0.3 || data.atRisk >= 4) {
      shape.classList.add('rural-warning');
    } else {
      shape.classList.add('rural-stable');
    }
  });
};

// Show rural closures detail panel for a selected state
const showRuralClosuresPanel = (stateAbbrev) => {
  if (!ruralClosuresPanel) return;
  const stateName = STATE_NAMES[stateAbbrev] || stateAbbrev;
  const data = RURAL_HOSPITAL_CLOSURES[stateAbbrev] || { count: 0, recent: 0, atRisk: 0 };
  const riskLevel = data.atRisk > 5 ? 'High' : data.atRisk > 2 ? 'Medium' : 'Low';
  const riskClass = data.atRisk > 5 ? 'risk-high' : data.atRisk > 2 ? 'risk-medium' : 'risk-low';

  const closedHospitals = Array.isArray(data.closedHospitals) ? data.closedHospitals : [];
  const atRiskHospitals = Array.isArray(data.atRiskHospitals) ? data.atRiskHospitals : [];
  // Sort at-risk: high risk first, then by beds descending
  const sortedAtRisk = [...atRiskHospitals].sort((a, b) => {
    if (a.risk === 'high' && b.risk !== 'high') return -1;
    if (a.risk !== 'high' && b.risk === 'high') return 1;
    return (b.beds || 0) - (a.beds || 0);
  });
  // Sort closed: most recent first
  const sortedClosed = [...closedHospitals].sort((a, b) => (b.year || 0) - (a.year || 0));

  if (ruralClosuresTitle) ruralClosuresTitle.textContent = `${stateName} Rural Hospitals`;
  if (ruralClosuresSubtitle) {
    ruralClosuresSubtitle.textContent = 'Source: CHQPR / Sheps Center for Health Services Research';
  }

  if (ruralClosuresList) {
    const freshness = ruralClosuresLastUpdated
      ? `Data updated ${formatRelativeTime(ruralClosuresLastUpdated)}`
      : 'Using cached data';

    // Build at-risk hospital rows
    const atRiskHtml = sortedAtRisk.length > 0
      ? sortedAtRisk.map(h => {
        const rc = h.risk === 'high' ? 'risk-high' : 'risk-moderate';
        const riskLabel = h.risk === 'high' ? 'High Risk' : 'At Risk';
        const marginClass = h.operatingMargin <= -10 ? 'risk-high' : h.operatingMargin < 0 ? 'risk-medium' : 'risk-low';
        const factors = (h.riskFactors || []).map(f => `<li>${escapeHtml(f)}</li>`).join('');
        return `
          <div class="rural-hospital-card">
            <div class="rural-hospital-header">
              <span class="rural-hospital-name">${escapeHtml(h.name)}</span>
              <span class="rural-risk-badge ${rc}">${riskLabel}</span>
            </div>
            <div class="rural-hospital-location">${escapeHtml(h.city)}${h.county ? ', ' + escapeHtml(h.county) + ' Co.' : ''}${h.beds ? ' &middot; ' + h.beds + ' beds' : ''}</div>
            <div class="rural-hospital-financials">
              <div class="rural-financial-item">
                <span class="rural-financial-label">Operating Margin</span>
                <span class="rural-financial-value ${marginClass}">${h.operatingMargin > 0 ? '+' : ''}${h.operatingMargin}%</span>
              </div>
              <div class="rural-financial-item">
                <span class="rural-financial-label">Daily Census</span>
                <span class="rural-financial-value">${h.dailyCensus} patients</span>
              </div>
            </div>
            ${factors ? `<ul class="rural-risk-factors">${factors}</ul>` : ''}
          </div>`;
      }).join('')
      : '<div class="rural-empty">No hospitals currently flagged at risk.</div>';

    // Build closed hospital rows
    const closedHtml = sortedClosed.length > 0
      ? sortedClosed.map(h => {
        const typeLabel = h.type === 'converted' ? 'Converted' : 'Closed';
        const typeClass = h.type === 'converted' ? 'type-converted' : 'type-closed';
        return `
          <div class="rural-hospital-row">
            <div class="rural-hospital-info">
              <div class="rural-hospital-name">${escapeHtml(h.name)}</div>
              <div class="rural-hospital-location">${escapeHtml(h.city)}${h.county ? ', ' + escapeHtml(h.county) + ' Co.' : ''}${h.year ? ' &middot; ' + h.year : ''}</div>
            </div>
            <span class="rural-hospital-badge ${typeClass}">${typeLabel}</span>
          </div>`;
      }).join('')
      : '<div class="rural-empty">No recorded closures since 2010.</div>';

    ruralClosuresList.innerHTML = `
      <div class="rural-closures-stat">
        <span class="rural-closures-stat-label">Total closures since 2010</span>
        <span class="rural-closures-stat-value">${data.count}</span>
      </div>
      <div class="rural-closures-stat">
        <span class="rural-closures-stat-label">Recent closures (last 2 years)</span>
        <span class="rural-closures-stat-value ${data.recent > 0 ? 'risk-high' : ''}">${data.recent}</span>
      </div>
      <div class="rural-closures-stat">
        <span class="rural-closures-stat-label">Hospitals currently at risk</span>
        <span class="rural-closures-stat-value ${riskClass}">${data.atRisk}</span>
      </div>
      <div class="rural-closures-stat">
        <span class="rural-closures-stat-label">Overall risk level</span>
        <span class="rural-closures-stat-value ${riskClass}">${riskLevel}</span>
      </div>

      <div class="rural-section-header">
        <span class="rural-section-icon">&#9888;</span> At-Risk Hospitals (${sortedAtRisk.length})
      </div>
      <div class="rural-hospital-list">${atRiskHtml}</div>

      <div class="rural-section-header">
        <span class="rural-section-icon">&#10006;</span> Closed Since 2010 (${sortedClosed.length})
      </div>
      <div class="rural-hospital-list">${closedHtml}</div>

      <div class="rural-closures-beacon-link">
        <button type="button" id="rural-open-beacon" data-state="${stateAbbrev}">Open ${stateName} State Beacon</button>
      </div>
      <div class="rural-data-freshness">${freshness}</div>
    `;

    // Attach beacon link handler
    const beaconBtn = document.getElementById('rural-open-beacon');
    if (beaconBtn) {
      beaconBtn.addEventListener('click', () => {
        hideRuralClosuresPanel();
        openStateBeaconFromMap(stateAbbrev);
      });
    }
  }

  ruralClosuresPanel.style.display = '';
};

const hideRuralClosuresPanel = () => {
  if (ruralClosuresPanel) ruralClosuresPanel.style.display = 'none';
};

// Switch between layoffs and rural hospital tabs
const switchMapTab = async (tab) => {
  if (tab === activeMapTab) return;
  activeMapTab = tab;

  // Update tab button states
  mapTabLayoffs?.classList.toggle('active', tab === 'layoffs');
  mapTabRural?.classList.toggle('active', tab === 'rural');

  // Update section title and description
  if (tab === 'layoffs') {
    hideRuralClosuresPanel();
    if (mapSectionTitle) mapSectionTitle.textContent = 'Interactive Layoff Weather Map';
    if (mapSectionDesc) {
      mapSectionDesc.innerHTML = `Fog intensity shows layoff activity by state. Darker = more layoffs in the current scope. <span class="map-scope-note">Scope: <strong id="map-scope-label">${mapScope === 'all' ? 'All' : 'Healthcare'}</strong></span>`;
    }
    // Show layoff-specific controls
    document.querySelector('.scope-toggle')?.style.setProperty('display', '');
    document.getElementById('map-legend')?.style.setProperty('display', '');
    // Update map colors for layoffs
    updateMapColors();
  } else if (tab === 'rural') {
    if (mapSectionTitle) mapSectionTitle.textContent = 'Rural Hospital Vulnerability Map';
    if (mapSectionDesc) {
      mapSectionDesc.innerHTML = `Loading rural hospital data...`;
    }
    // Fetch fresh rural closures data
    await loadRuralClosuresData();
    if (mapSectionDesc) {
      const freshness = ruralClosuresLastUpdated ? ` Updated ${formatRelativeTime(ruralClosuresLastUpdated)}.` : '';
      mapSectionDesc.innerHTML = `Shows rural hospital closures since 2010 and hospitals currently at financial risk. Data from CHQPR/Sheps Center.${freshness}`;
    }
    // Hide layoff-specific controls, show rural legend
    document.querySelector('.scope-toggle')?.style.setProperty('display', 'none');
    const legend = document.getElementById('map-legend');
    if (legend) {
      legend.innerHTML = `
        <div class="rural-map-legend">
          <div class="rural-legend-item"><span class="rural-legend-dot closures"></span> High closure risk</div>
          <div class="rural-legend-item"><span class="rural-legend-dot at-risk"></span> Moderate risk</div>
          <div class="rural-legend-item"><span class="rural-legend-dot stable"></span> Low/No risk</div>
        </div>
      `;
      legend.style.display = '';
    }
    // Update map colors for rural hospitals
    updateRuralMapColors();
  }
};

const loadAllNotices = async () => {
  if (allNoticesLoaded || allNoticesLoading) return allNotices;
  allNoticesLoading = true;
  setLoading('Loading notices...');
  try {
    const data = await fetchJson(`${DATA_BASE_URL}/notices.json`);
    allNotices = data.notices ?? [];
    statTotal.textContent = allNotices.length.toString();
    stateDataHealthcare = buildHealthcareStateCounts(allNotices);
    allNoticesLoaded = true;
    allNoticesLoading = false;
    await setMapScope(mapScope);
    return allNotices;
  } catch (err) {
    console.error('Failed to load notices:', err);
    allNoticesLoading = false;
    setLoading('Failed to load data. Please refresh the page.');
    return [];
  }
};

const loadStateNotices = async (state) => {
  if (!state || stateNoticesCache.has(state) || stateNoticesLoading.has(state)) {
    return stateNoticesCache.get(state) || [];
  }
  stateNoticesLoading.add(state);
  try {
    const data = await fetchJson(`${DATA_BASE_URL}/by-state/${state}.json`);
    const notices = data?.notices ?? [];
    stateNoticesCache.set(state, notices);
    return notices;
  } catch (err) {
    console.warn(`Failed to load notices for ${state}:`, err);
    stateNoticesCache.set(state, []);
    return [];
  } finally {
    stateNoticesLoading.delete(state);
  }
};

// =============================================================================
// Premium Insights (Static JSON)
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
      fetchJson(`${DATA_BASE_URL}/alerts.json`),
      fetchJson(`${DATA_BASE_URL}/geo.json`),
      fetchJson(`${DATA_BASE_URL}/talent.json`),
      fetchJson(`${DATA_BASE_URL}/employers.json`)
    ]);
    renderAlerts(alerts);
    renderHeatmap(geo);
    renderTalent(talent);
    renderEmployers(employers);
  } catch (err) {
    console.error('Failed to load insights:', err);
    renderInsightFallback(alertsList, 'Insights unavailable.');
    renderInsightFallback(heatmapList, 'Insights unavailable.');
    renderInsightFallback(talentList, 'Insights unavailable.');
    renderInsightFallback(employerList, 'Insights unavailable.');
  }
};

// Load strategic market data from JSON
const loadStrategicData = async () => {
  if (strategicDataLoaded) return strategicData;
  try {
    strategicData = await fetchJson(`${DATA_BASE_URL}/strategic.json`);
    strategicDataLoaded = true;
    console.log('Strategic data loaded:', strategicData?.lastUpdated);
    return strategicData;
  } catch (err) {
    console.warn('Strategic data not available, using fallback:', err);
    strategicDataLoaded = true;
    return null;
  }
};

const loadRelocationData = async () => {
  if (relocationDataLoaded) return relocationData;
  try {
    relocationData = await fetchJson(`${DATA_BASE_URL}/relocation.json`);
    relocationDataLoaded = true;
    console.log('Relocation data loaded:', relocationData?.lastUpdated);
    return relocationData;
  } catch (err) {
    console.warn('Relocation data not available:', err);
    relocationDataLoaded = true;
    relocationData = null;
    return null;
  }
};

// Load pre-computed recruitment intelligence from private repo
const loadRecruitmentIntel = async () => {
  if (recruitmentIntelLoaded) return recruitmentIntel;
  try {
    recruitmentIntel = await fetchJson(`${DATA_BASE_URL}/recruitment-intel.json`);
    recruitmentIntelLoaded = true;
    console.log('Recruitment intel loaded:', recruitmentIntel?.lastUpdated);
    return recruitmentIntel;
  } catch (err) {
    console.warn('Recruitment intel not available, using fallback algorithms:', err);
    recruitmentIntelLoaded = true;
    recruitmentIntel = null;
    return null;
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

// =============================================================================
// Filtering (Client-side)
// =============================================================================

// Check if a notice matches any of the selected specialties
const matchesSpecialty = (notice, specialtyKeys) => {
  if (!specialtyKeys || specialtyKeys.length === 0) return true;

  // Build searchable text from notice fields
  const searchText = [
    notice.employer_name,
    notice.parent_system,
    notice.reason,
    notice.raw_text,
    notice.nursing_care_setting,
    ...(parseMaybeJson(notice.nursing_specialties) || []),
    ...(parseMaybeJson(notice.nursing_keywords) || []),
    ...(parseMaybeJson(notice.nursing_signals) || [])
  ].filter(Boolean).join(' ').toLowerCase();

  // Check if any selected specialty matches
  return specialtyKeys.some(key => {
    const specialty = NURSE_SPECIALTIES[key];
    if (!specialty) return false;
    return specialty.keywords.some(keyword => searchText.includes(keyword));
  });
};

const filterNotices = () => {
  const baseNotices = allNoticesLoaded
    ? allNotices
    : selectedStates.length > 0
      ? selectedStates.flatMap((state) => stateNoticesCache.get(state) || [])
      : [];
  let filtered = [...baseNotices];

  filtered = filtered.filter(isHealthcareNotice);

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

  // Filter by nursing specialty
  if (selectedSpecialties.length > 0) {
    filtered = filtered.filter(n => matchesSpecialty(n, selectedSpecialties));
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

  // Apply limit only when explicitly set
  const limitValue = parseInt(limitInput.value, 10);
  if (Number.isFinite(limitValue) && limitValue > 0 && filtered.length > limitValue) {
    filtered = filtered.slice(0, limitValue);
  }

  // Merge custom notices
  if (customNotices.length > 0) {
    filtered = [...customNotices, ...filtered];
  }

  return sortNoticesByNewest(filtered);
};

const applyFilters = (resetPage = true) => {
  const token = ++applyFiltersToken;
  if (resetPage) currentPage = 1;
  if (!allNoticesLoaded && selectedStates.length > 0) {
    const missing = selectedStates.filter((state) => !stateNoticesCache.has(state));
    if (missing.length) {
      setLoading('Loading state notices...');
      Promise.all(missing.map(loadStateNotices)).then(() => {
        if (token === applyFiltersToken) applyFilters(false);
      });
      return;
    }
  }

  let filtered = filterNotices();

  // Apply search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(n => {
      const employerName = (n.employer_name || '').toLowerCase();
      const parentSystem = (n.parent_system || '').toLowerCase();
      const city = (n.city || '').toLowerCase();
      return employerName.includes(query) || parentSystem.includes(query) || city.includes(query);
    });
  }

  currentNotices = filtered;
  renderNotices(currentNotices);
  updateStats(currentNotices);
  updateMapHighlights();
};

// =============================================================================
// Rendering
// =============================================================================
const renderNotices = (notices) => {
  const paginationContainer = document.getElementById('pagination');

  if (!notices.length) {
    if (!allNoticesLoaded && selectedStates.length === 0) {
      noticeList.innerHTML = `
        <div class="empty-state">
          Select a state to load notices, or load the national dataset.
          <button class="btn secondary" id="load-national-notices">Load national notices</button>
        </div>
      `;
      document.getElementById('load-national-notices')?.addEventListener('click', async () => {
        await loadAllNotices();
        applyFilters(false);
      });
    } else {
      noticeList.innerHTML = `<div class="empty-state">No notices match these filters.</div>`;
    }
    if (paginationContainer) paginationContainer.innerHTML = '';
    refreshNoticeListWindow(0);
    return;
  }

  // Calculate pagination
  const totalPages = Math.ceil(notices.length / NOTICES_PER_PAGE);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIdx = (currentPage - 1) * NOTICES_PER_PAGE;
  const endIdx = startIdx + NOTICES_PER_PAGE;
  const paginatedNotices = notices.slice(startIdx, endIdx);

  noticeList.innerHTML = '';
  paginatedNotices.forEach((notice, idx) => {
    const globalIdx = startIdx + idx;
    const card = document.createElement('article');
    const careSetting = notice.nursing_care_setting || 'unknown';
    const isManufacturing = careSetting === 'occupational';
    let cardClasses = 'notice-card';
    if (notice.isCustom) cardClasses += ' custom-notice';
    if (isManufacturing) cardClasses += ' manufacturing-notice';
    card.className = cardClasses;
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
    const manufacturingBadge = isManufacturing ? '<span class="manufacturing-badge">Industrial</span>' : '';

    card.innerHTML = `
      <div class="notice-top">
        <span class="pill">${state}</span>
        ${customBadge}
        ${manufacturingBadge}
        <span class="score">${label} - ${score}</span>
        <div class="save-to-project">
          <button class="save-to-project-btn" data-notice-idx="${globalIdx}">+ Save</button>
          <div class="save-dropdown" id="dropdown-${globalIdx}"></div>
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

  // Render pagination controls
  renderPagination(totalPages, notices.length);

  // Update quick navigation
  updateQuickNav(totalPages);

  // Add save-to-project dropdown handlers
  setupSaveDropdowns(notices);

  refreshNoticeListWindow(paginatedNotices.length);
};

const renderPagination = (totalPages, totalNotices) => {
  const paginationContainer = document.getElementById('pagination');
  if (!paginationContainer) return;

  if (totalPages <= 1) {
    paginationContainer.innerHTML = `<div class="pagination-info">Showing all ${totalNotices} notices</div>`;
    return;
  }

  const startIdx = (currentPage - 1) * NOTICES_PER_PAGE + 1;
  const endIdx = Math.min(currentPage * NOTICES_PER_PAGE, totalNotices);

  // Generate page numbers (show max 7 pages with ellipsis)
  let pageNumbers = [];
  if (totalPages <= 7) {
    pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    if (currentPage <= 4) {
      pageNumbers = [1, 2, 3, 4, 5, '...', totalPages];
    } else if (currentPage >= totalPages - 3) {
      pageNumbers = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      pageNumbers = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }
  }

  paginationContainer.innerHTML = `
    <div class="pagination-info">
      Showing ${startIdx.toLocaleString()}-${endIdx.toLocaleString()} of ${totalNotices.toLocaleString()} notices
    </div>
    <div class="pagination-controls">
      <button class="pagination-btn" id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>
        &laquo; Prev
      </button>
      <div class="pagination-pages">
        ${pageNumbers.map(p => {
          if (p === '...') {
            return '<span class="pagination-ellipsis">...</span>';
          }
          return `<button class="pagination-page ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
        }).join('')}
      </div>
      <button class="pagination-btn" id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>
        Next &raquo;
      </button>
    </div>
  `;

  // Add pagination event listeners
  document.getElementById('prev-page')?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      applyFilters(false);
      scrollToResults();
    }
  });

  document.getElementById('next-page')?.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      applyFilters(false);
      scrollToResults();
    }
  });

  paginationContainer.querySelectorAll('.pagination-page').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      applyFilters(false);
      scrollToResults();
    });
  });
};

const scrollToResults = () => {
  const resultsSection = document.querySelector('.results');
  if (resultsSection) {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const updateQuickNav = (totalPages) => {
  const quickPrev = document.getElementById('quick-prev');
  const quickNext = document.getElementById('quick-next');
  const quickNavInfo = document.getElementById('quick-nav-info');

  if (quickPrev) {
    quickPrev.disabled = currentPage <= 1;
  }
  if (quickNext) {
    quickNext.disabled = currentPage >= totalPages || totalPages <= 1;
  }
  if (quickNavInfo) {
    if (totalPages <= 1) {
      quickNavInfo.textContent = 'Page 1';
    } else {
      quickNavInfo.textContent = `${currentPage} / ${totalPages}`;
    }
  }
};

const initQuickNav = () => {
  const quickPrev = document.getElementById('quick-prev');
  const quickNext = document.getElementById('quick-next');

  quickPrev?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      applyFilters(false);
      scrollToResults();
    }
  });

  quickNext?.addEventListener('click', () => {
    const totalPages = Math.ceil(currentNotices.length / NOTICES_PER_PAGE);
    if (currentPage < totalPages) {
      currentPage++;
      applyFilters(false);
      scrollToResults();
    }
  });
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
  if (allNoticesLoaded) {
    statTotal.textContent = notices.length.toString();
    return;
  }
  if (metadata?.totalNotices) {
    statTotal.textContent = metadata.totalNotices.toString();
    return;
  }
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
    const count = stateData[abbrev]?.count || 0;
    const name = STATE_NAMES[abbrev] || abbrev;
    const isSelected = selectedStates.includes(abbrev);

    const option = document.createElement('div');
    option.className = `multi-select-option${isSelected ? ' selected' : ''}`;
    option.dataset.value = abbrev;
    option.innerHTML = `
      <span class="multi-select-checkbox">${isSelected ? '&#10003;' : ''}</span>
      <span class="multi-select-label">${abbrev} - ${name}</span>
      <span class="multi-select-count">${count > 0 ? `(${count})` : ''}</span>
    `;
    stateOptions.appendChild(option);
  });
};

const updateStateDisplay = () => {
  if (selectedStates.length === 0) {
    stateDisplay.innerHTML = '<span class="multi-select-placeholder">All states</span>';
  } else if (selectedStates.length <= 3) {
    stateDisplay.innerHTML = selectedStates
      .map(s => `<span class="multi-select-tag">${s}<button class="multi-select-tag-remove" data-state="${s}">&times;</button></span>`)
      .join('');
  } else {
    stateDisplay.innerHTML = `
      ${selectedStates.slice(0, 2).map(s => `<span class="multi-select-tag">${s}<button class="multi-select-tag-remove" data-state="${s}">&times;</button></span>`).join('')}
      <span class="multi-select-more">+${selectedStates.length - 2} more</span>
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
    if (e.target.closest('.multi-select-tag-remove')) {
      const state = e.target.closest('.multi-select-tag-remove').dataset.state;
      toggleStateSelection(state);
      return;
    }
    if (e.target.closest('.multi-select-display')) {
      stateMultiSelect.classList.toggle('open');
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
      opt.classList.toggle('hidden', !text.includes(query));
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
      stateMultiSelect.classList.remove('open');
    }
  });
};

// =============================================================================
// Specialty Multi-Select
// =============================================================================
const specialtyMultiSelect = document.getElementById('specialty-multi-select');
const specialtyDisplay = document.getElementById('specialty-display');
const specialtyOptions = document.getElementById('specialty-options');
const specialtySearch = document.getElementById('specialty-search');

// Organize specialties by category for dropdown display
const SPECIALTY_CATEGORIES = {
  'Critical Care & Emergency': ['ICU', 'MICU', 'SICU', 'CVICU', 'NICU', 'PICU', 'ER', 'Trauma'],
  'Surgical & Perioperative': ['OR', 'Perioperative', 'PACU', 'Circulating', 'Scrub', 'First Assist'],
  'Medical-Surgical': ['Med-Surg', 'Telemetry', 'Orthopedic', 'Neurology', 'Oncology', 'Cardiology', 'Pulmonary', 'Renal', 'GI', 'Urology'],
  'Women\'s Health & Pediatrics': ['OB', 'L&D', 'Postpartum', 'LDRP', 'Antepartum', 'Gynecology', 'Pediatrics', 'Pediatric ER', 'Pediatric Oncology'],
  'Mental Health & Behavioral': ['Psych', 'Substance Abuse', 'Geriatric Psych', 'Child Psych'],
  'Long-Term Care & Geriatrics': ['LTC', 'SNF', 'Geriatrics', 'Memory Care', 'Rehab'],
  'Community & Outpatient': ['Home Health', 'Hospice', 'Public Health', 'School Nurse', 'Occupational Health', 'Outpatient', 'Infusion', 'Wound Care'],
  'Specialty Units': ['Burn', 'Transplant', 'Dialysis', 'Endoscopy', 'Cath Lab', 'Electrophysiology', 'Interventional Radiology', 'Pain Management', 'Sleep Lab'],
  'Other Specialties': ['Float Pool', 'Travel', 'Triage', 'Flight Nurse', 'Correctional', 'Military', 'Parish', 'Legal Nurse', 'Aesthetic', 'Bariatric', 'Diabetes', 'Allergy', 'ENT', 'Ophthalmology', 'Dermatology', 'Vascular']
};

const populateSpecialtyDropdown = () => {
  if (!specialtyOptions) return;
  specialtyOptions.innerHTML = '';

  Object.entries(SPECIALTY_CATEGORIES).forEach(([category, specialties]) => {
    // Add category header
    const header = document.createElement('div');
    header.className = 'multi-select-category';
    header.textContent = category;
    specialtyOptions.appendChild(header);

    // Add specialty options
    specialties.forEach(key => {
      const spec = NURSE_SPECIALTIES[key];
      if (!spec) return;

      const isSelected = selectedSpecialties.includes(key);
      const option = document.createElement('div');
      option.className = `multi-select-option${isSelected ? ' selected' : ''}`;
      option.dataset.value = key;
      option.innerHTML = `
        <span class="multi-select-checkbox">${isSelected ? '&#10003;' : ''}</span>
        <span class="multi-select-label">${key}</span>
        <span class="multi-select-sublabel">${spec.name}</span>
      `;
      specialtyOptions.appendChild(option);
    });
  });
};

const updateSpecialtyDisplay = () => {
  if (!specialtyDisplay) return;

  if (selectedSpecialties.length === 0) {
    specialtyDisplay.innerHTML = '<span class="multi-select-placeholder">All specialties</span>';
  } else if (selectedSpecialties.length <= 2) {
    specialtyDisplay.innerHTML = selectedSpecialties
      .map(s => `<span class="multi-select-tag">${s}<button class="multi-select-tag-remove" data-specialty="${s}">&times;</button></span>`)
      .join('');
  } else {
    specialtyDisplay.innerHTML = `
      ${selectedSpecialties.slice(0, 2).map(s => `<span class="multi-select-tag">${s}<button class="multi-select-tag-remove" data-specialty="${s}">&times;</button></span>`).join('')}
      <span class="multi-select-more">+${selectedSpecialties.length - 2} more</span>
    `;
  }
};

const toggleSpecialtySelection = (specialty) => {
  const idx = selectedSpecialties.indexOf(specialty);
  if (idx === -1) {
    selectedSpecialties.push(specialty);
  } else {
    selectedSpecialties.splice(idx, 1);
  }
  populateSpecialtyDropdown();
  updateSpecialtyDisplay();
  applyFilters();
};

const initSpecialtyMultiSelect = () => {
  if (!specialtyMultiSelect) return;

  populateSpecialtyDropdown();
  updateSpecialtyDisplay();

  specialtyMultiSelect.addEventListener('click', (e) => {
    if (e.target.closest('.multi-select-tag-remove')) {
      const specialty = e.target.closest('.multi-select-tag-remove').dataset.specialty;
      toggleSpecialtySelection(specialty);
      return;
    }
    if (e.target.closest('.multi-select-display')) {
      specialtyMultiSelect.classList.toggle('open');
    }
  });

  specialtyOptions?.addEventListener('click', (e) => {
    const option = e.target.closest('.multi-select-option');
    if (option) {
      toggleSpecialtySelection(option.dataset.value);
    }
  });

  specialtySearch?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    specialtyOptions?.querySelectorAll('.multi-select-option').forEach(opt => {
      const text = opt.textContent.toLowerCase();
      opt.classList.toggle('hidden', !text.includes(query));
    });
    // Also show/hide categories based on if they have visible options
    specialtyOptions?.querySelectorAll('.multi-select-category').forEach(cat => {
      let nextEl = cat.nextElementSibling;
      let hasVisibleOption = false;
      while (nextEl && !nextEl.classList.contains('multi-select-category')) {
        if (nextEl.classList.contains('multi-select-option') && !nextEl.classList.contains('hidden')) {
          hasVisibleOption = true;
          break;
        }
        nextEl = nextEl.nextElementSibling;
      }
      cat.classList.toggle('hidden', !hasVisibleOption);
    });
  });

  document.getElementById('select-all-specialties')?.addEventListener('click', () => {
    selectedSpecialties = Object.keys(NURSE_SPECIALTIES);
    populateSpecialtyDropdown();
    updateSpecialtyDisplay();
    applyFilters();
  });

  document.getElementById('clear-all-specialties')?.addEventListener('click', () => {
    selectedSpecialties = [];
    populateSpecialtyDropdown();
    updateSpecialtyDisplay();
    applyFilters();
  });

  document.addEventListener('click', (e) => {
    if (!specialtyMultiSelect?.contains(e.target)) {
      specialtyMultiSelect?.classList.remove('open');
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
    selectedSpecialties = [];
    populateStateDropdown('');
    updateStateDisplay();
    populateSpecialtyDropdown();
    updateSpecialtyDisplay();
    orgInput.value = '';
    sinceInput.value = '';
    scoreInput.value = 0;
    if (scoreReadout) scoreReadout.textContent = '0';
    limitInput.value = '';
    searchQuery = '';
    const searchInput = document.getElementById('notice-search');
    const clearSearchBtn = document.getElementById('clear-search');
    if (searchInput) searchInput.value = '';
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';
    const specialtySearchInput = document.getElementById('specialty-search');
    if (specialtySearchInput) specialtySearchInput.value = '';
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

  // Search by employer name
  const searchInput = document.getElementById('notice-search');
  const clearSearchBtn = document.getElementById('clear-search');

  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      searchQuery = searchInput.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
      }
      applyFilters();
    }, 300));
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      applyFilters();
    });
  }
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
  const helpSection = document.querySelector('.help-section');
  const helpToggle = document.getElementById('help-toggle');
  const toggleIcon = helpToggle?.querySelector('.help-toggle-icon');

  helpToggle?.addEventListener('click', () => {
    helpSection?.classList.toggle('open');
    if (toggleIcon) {
      toggleIcon.textContent = helpSection?.classList.contains('open') ? '−' : '+';
    }
  });
};

// =============================================================================
// Collapsible Sections
// =============================================================================
const initCollapsibleSections = () => {
  document.querySelectorAll('section[data-collapsible="true"]').forEach(section => {
    const toggle = section.querySelector('.section-toggle');
    if (!toggle) return;
    const label = toggle.querySelector('.section-toggle-label');
    const icon = toggle.querySelector('.section-toggle-icon');

    toggle.addEventListener('click', () => {
      section.classList.toggle('collapsed');
      const isCollapsed = section.classList.contains('collapsed');
      toggle.setAttribute('aria-expanded', String(!isCollapsed));
      if (label) label.textContent = isCollapsed ? 'Expand' : 'Collapse';
      if (icon) icon.textContent = isCollapsed ? '+' : '–';
    });
  });

  // Initialize footer legal section toggles (collapsed by default)
  document.querySelectorAll('.legal-section h4').forEach(header => {
    header.addEventListener('click', () => {
      const section = header.parentElement;
      // Close other expanded sections
      document.querySelectorAll('.legal-section.expanded').forEach(s => {
        if (s !== section) s.classList.remove('expanded');
      });
      section.classList.toggle('expanded');
    });
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
    showMapToast(message);
    return;
  }
  const toast = document.getElementById('map-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2000);
};

document.getElementById('export-project-csv')?.addEventListener('click', exportProjectCSV);
document.getElementById('export-project-json')?.addEventListener('click', exportProjectJSON);

// =============================================================================
// View Toggle (Map/Chart)
// =============================================================================
const initViewToggle = () => {
  const mapViewBtn = document.getElementById('map-view-btn');
  const chartViewBtn = document.getElementById('chart-view-btn');
  const mapClearBtn = document.getElementById('map-clear-btn');
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

  mapClearBtn?.addEventListener('click', () => {
    selectedStates = [];
    populateStateDropdown(regionSelect.value);
    updateStateDisplay();
    updateMapHighlights();
    applyFilters();
    if (currentMapView === 'chart') {
      renderBarChart();
    }
  });

  mapHomeStateBtn?.addEventListener('click', () => {
    const homeState = getMapHomeState();
    if (!homeState) return;
    openHomeState();
  });

  // Target mode button - toggles target selection mode
  ensureMapTargetModeListener();

  // Target state button - opens target state module
  mapTargetStateBtn?.addEventListener('click', () => {
    const targetState = getMapTargetState();
    if (!targetState) return;
    openTargetState();
  });

  mapFactorsBtn?.addEventListener('click', () => {
    if (!mapFactorsPanel) return;
    const isVisible = mapFactorsPanel.style.display !== 'none';
    mapFactorsPanel.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) renderMapFactors();
  });

  mapFactorsClose?.addEventListener('click', () => {
    if (mapFactorsPanel) mapFactorsPanel.style.display = 'none';
  });

  ruralClosuresClose?.addEventListener('click', () => {
    hideRuralClosuresPanel();
  });

};

const renderBarChart = () => {
  const barChart = document.getElementById('bar-chart');
  if (!barChart) return;

  const sortedStates = Object.entries(mapStateData)
    .map(([state, entry]) => {
      const count = typeof entry === 'number' ? entry : (entry?.count ?? 0);
      return [state, count];
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  if (sortedStates.length === 0) {
    barChart.innerHTML = '<div class="empty-state">No state data available.</div>';
    return;
  }

  const maxCount = sortedStates[0][1] || 1;
  const scopeTitle = mapScope === 'all' ? 'All' : 'Healthcare';

  // Generate dynamic color based on intensity (green to yellow to red)
  const getBarColor = (count, max) => {
    const intensity = count / max;
    // Hue: 120 (green) -> 60 (yellow) -> 0 (red)
    const hue = 120 - (intensity * 120);
    return `hsl(${hue}, 75%, 50%)`;
  };

  barChart.innerHTML = `
    <div class="bar-chart-title" style="font-size: 16px; font-weight: 600; color: var(--navy); padding: 0 16px 12px; border-bottom: 1px solid rgba(26, 54, 93, 0.1); margin-bottom: 8px;">
      Top 20 States by Notice Count (${scopeTitle})
    </div>
    <div class="bar-chart-container">
      ${sortedStates.map(([state, count], index) => {
        const percentage = (count / maxCount) * 100;
        const color = getBarColor(count, maxCount);
        const isSelected = selectedStates.includes(state);
        return `
          <div class="bar-chart-row${isSelected ? ' selected' : ''}" data-state="${state}" style="cursor: pointer;">
            <span class="bar-chart-label">${state}</span>
            <div class="bar-chart-bar">
              <div class="bar-chart-fill" style="width: ${percentage}%; background: linear-gradient(90deg, ${color}, ${color}dd);"></div>
            </div>
            <span class="bar-chart-count">${count.toLocaleString()}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Add click handlers to bar chart rows
  barChart.querySelectorAll('.bar-chart-row').forEach(row => {
    row.addEventListener('click', () => {
      const state = row.dataset.state;
      toggleStateSelection(state);
      renderBarChart(); // Re-render to update selected state
    });
  });
};

const setMapScope = async (scope) => {
  mapScope = scope === 'all' ? 'all' : 'healthcare';
  if (mapScope === 'healthcare' && !allNoticesLoaded) {
    await loadAllNotices();
  }
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

  updateMapColors();
  if (currentMapView === 'chart') {
    renderBarChart();
  }
};

const initMapScopeToggle = () => {
  mapScopeHealthcareBtn?.addEventListener('click', () => {
    setMapScope('healthcare').catch((err) => console.warn(err));
  });
  mapScopeAllBtn?.addEventListener('click', () => {
    setMapScope('all').catch((err) => console.warn(err));
  });
};

const initMapTabSwitcher = () => {
  mapTabLayoffs?.addEventListener('click', () => switchMapTab('layoffs'));
  mapTabRural?.addEventListener('click', () => switchMapTab('rural'));
};

// =============================================================================
// App Initialization
// =============================================================================
const initApp = async () => {
  if (!checkAuth()) return;

  setLoading('Loading data...');

  // Initialize UI components (each wrapped individually so one failure doesn't block others)
  const safeInit = (fn, label) => {
    try { fn(); } catch (err) { console.warn(`Init error [${label}]:`, err); }
  };
  safeInit(initRegionSelect, 'regionSelect');
  safeInit(initStateMultiSelect, 'stateMultiSelect');
  safeInit(initSpecialtyMultiSelect, 'specialtyMultiSelect');
  safeInit(initCustomStateSelect, 'customStateSelect');
  safeInit(initFilters, 'filters');
  safeInit(initQuickNav, 'quickNav');
  safeInit(initProjects, 'projects');
  safeInit(initStateCalibration, 'stateCalibration');
  safeInit(initCustomNotices, 'customNotices');
  safeInit(initHelpSection, 'helpSection');
  safeInit(initCollapsibleSections, 'collapsibleSections');
  safeInit(initViewToggle, 'viewToggle');
  safeInit(initMapScopeToggle, 'mapScopeToggle');
  safeInit(initMapTabSwitcher, 'mapTabSwitcher');
  safeInit(initForecast, 'forecast');
  safeInit(initProgramsModule, 'programsModule');
  safeInit(initStateBeacon, 'stateBeacon');
  safeInit(initMasterExport, 'masterExport');
  safeInit(initNewsFeed, 'newsFeed');
  try { await initWeatherMap(); } catch (err) { console.warn('Init error [weatherMap]:', err); }

  // Load data
  await Promise.all([
    loadMetadata(),
    loadStates(),
    loadRelocationData(),
    loadRecruitmentIntel(),
    loadRuralClosuresData()
  ]);

  await loadAllNotices();
  await loadInsights();
  loadNews(); // Load in background, no await needed

  // Populate state dropdown and apply initial filters
  populateStateDropdown('');
  applyFilters();
};

// =============================================================================
// Daily News Feed
// =============================================================================
let newsArticles = [];
const NEWS_WINDOW_COUNT = 5;

const getSourceBadgeClass = (source) => {
  const s = source.toLowerCase();
  if (s.includes('becker')) return 'beckers';
  if (s.includes('stat')) return 'stat-news';
  if (s.includes('healthcare dive')) return 'healthcare-dive';
  if (s.includes('fierce')) return 'fierce';
  if (s.includes('health affairs')) return 'health-affairs';
  return 'default';
};

const formatNewsDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const getNewsDateFilter = () => {
  const filter = document.getElementById('news-date-filter');
  return filter ? parseInt(filter.value, 10) || 3 : 3;
};

const filterNewsByDate = (articles, days) => {
  // Use date-only comparison to avoid timezone issues
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today
  const cutoff = new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  return articles.filter(article => {
    if (!article.publishedAt) return true;
    try {
      const articleDate = new Date(article.publishedAt + 'T00:00:00');
      return articleDate >= cutoff;
    } catch {
      return true;
    }
  });
};

const renderNewsFeed = () => {
  const list = document.getElementById('news-feed-list');
  if (!list) return;

  const days = getNewsDateFilter();
  const filtered = filterNewsByDate(newsArticles, days);

  if (!filtered.length) {
    list.innerHTML = `<div class="empty-state">No news articles in the last ${days} days.</div>`;
    list.style.maxHeight = '';
    list.classList.remove('news-feed-windowed');
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

  // Apply 15-item scroll window
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
    // Add 1px per card for the border-bottom
    height += NEWS_WINDOW_COUNT - 1;
    list.style.maxHeight = `${Math.ceil(height)}px`;
    list.classList.add('news-feed-windowed');
  });
};

const loadNews = async () => {
  try {
    const response = await fetch(`${DATA_BASE_URL}/news.json?ts=${Date.now()}`);
    if (!response.ok) throw new Error(`Failed to load news: ${response.status}`);
    const data = await response.json();
    newsArticles = data.articles ?? [];
    renderNewsFeed();
  } catch (err) {
    console.warn('News feed not available:', err.message);
    const list = document.getElementById('news-feed-list');
    if (list) list.innerHTML = '<div class="empty-state">News feed unavailable.</div>';
  }
};

const initNewsFeed = () => {
  const filter = document.getElementById('news-date-filter');
  if (filter) {
    filter.addEventListener('change', renderNewsFeed);
  }
};

// =============================================================================
// Strategic Review Module - Nursing Market Intelligence
// =============================================================================

// Comprehensive salary data by state (from BLS, Nurse.org, Vivian 2024-2026)
const NURSING_SALARY_DATA = {
  // State: { staffRN: annual, staffHourly, travelWeekly, travelAnnual, shortage: 'surplus'|'shortage'|'balanced', projectedGap: number }
  AL: { staffRN: 74970, staffHourly: 36, travelWeekly: 1850, travelAnnual: 96200, shortage: 'shortage', projectedGap: -5200 },
  AK: { staffRN: 112040, staffHourly: 54, travelWeekly: 2564, travelAnnual: 133328, shortage: 'shortage', projectedGap: -1800 },
  AZ: { staffRN: 89850, staffHourly: 43, travelWeekly: 2150, travelAnnual: 111800, shortage: 'shortage', projectedGap: -8500 },
  AR: { staffRN: 76890, staffHourly: 37, travelWeekly: 1920, travelAnnual: 99840, shortage: 'shortage', projectedGap: -3200 },
  CA: { staffRN: 148330, staffHourly: 71, travelWeekly: 2643, travelAnnual: 137436, shortage: 'shortage', projectedGap: -44500 },
  CO: { staffRN: 106342, staffHourly: 51, travelWeekly: 2280, travelAnnual: 118560, shortage: 'balanced', projectedGap: -2100 },
  CT: { staffRN: 98760, staffHourly: 47, travelWeekly: 2320, travelAnnual: 120640, shortage: 'balanced', projectedGap: 1200 },
  DE: { staffRN: 87450, staffHourly: 42, travelWeekly: 2180, travelAnnual: 113360, shortage: 'balanced', projectedGap: -800 },
  DC: { staffRN: 114282, staffHourly: 55, travelWeekly: 2450, travelAnnual: 127400, shortage: 'balanced', projectedGap: 500 },
  FL: { staffRN: 84850, staffHourly: 41, travelWeekly: 2050, travelAnnual: 106600, shortage: 'shortage', projectedGap: -18900 },
  GA: { staffRN: 86240, staffHourly: 41, travelWeekly: 2100, travelAnnual: 109200, shortage: 'shortage', projectedGap: -9800 },
  HI: { staffRN: 123720, staffHourly: 59, travelWeekly: 2380, travelAnnual: 123760, shortage: 'shortage', projectedGap: -2400 },
  ID: { staffRN: 82670, staffHourly: 40, travelWeekly: 2050, travelAnnual: 106600, shortage: 'shortage', projectedGap: -1900 },
  IL: { staffRN: 88760, staffHourly: 43, travelWeekly: 2200, travelAnnual: 114400, shortage: 'shortage', projectedGap: -12300 },
  IN: { staffRN: 80250, staffHourly: 39, travelWeekly: 2000, travelAnnual: 104000, shortage: 'shortage', projectedGap: -6400 },
  IA: { staffRN: 77780, staffHourly: 37, travelWeekly: 1950, travelAnnual: 101400, shortage: 'surplus', projectedGap: 2800 },
  KS: { staffRN: 79180, staffHourly: 38, travelWeekly: 1980, travelAnnual: 102960, shortage: 'balanced', projectedGap: -1100 },
  KY: { staffRN: 78650, staffHourly: 38, travelWeekly: 1970, travelAnnual: 102440, shortage: 'shortage', projectedGap: -4500 },
  LA: { staffRN: 79450, staffHourly: 38, travelWeekly: 2020, travelAnnual: 105040, shortage: 'shortage', projectedGap: -5600 },
  ME: { staffRN: 86780, staffHourly: 42, travelWeekly: 2150, travelAnnual: 111800, shortage: 'shortage', projectedGap: -1400 },
  MD: { staffRN: 95280, staffHourly: 46, travelWeekly: 2350, travelAnnual: 122200, shortage: 'balanced', projectedGap: -800 },
  MA: { staffRN: 110449, staffHourly: 53, travelWeekly: 2420, travelAnnual: 125840, shortage: 'balanced', projectedGap: 1500 },
  MI: { staffRN: 85760, staffHourly: 41, travelWeekly: 2100, travelAnnual: 109200, shortage: 'shortage', projectedGap: -7200 },
  MN: { staffRN: 96580, staffHourly: 46, travelWeekly: 2280, travelAnnual: 118560, shortage: 'surplus', projectedGap: 3200 },
  MS: { staffRN: 79470, staffHourly: 38, travelWeekly: 1900, travelAnnual: 98800, shortage: 'shortage', projectedGap: -3800 },
  MO: { staffRN: 79890, staffHourly: 38, travelWeekly: 2000, travelAnnual: 104000, shortage: 'shortage', projectedGap: -5100 },
  MT: { staffRN: 83450, staffHourly: 40, travelWeekly: 2100, travelAnnual: 109200, shortage: 'shortage', projectedGap: -1200 },
  NE: { staffRN: 80120, staffHourly: 39, travelWeekly: 2000, travelAnnual: 104000, shortage: 'balanced', projectedGap: -600 },
  NV: { staffRN: 102580, staffHourly: 49, travelWeekly: 2350, travelAnnual: 122200, shortage: 'shortage', projectedGap: -4200 },
  NH: { staffRN: 89760, staffHourly: 43, travelWeekly: 2200, travelAnnual: 114400, shortage: 'balanced', projectedGap: 400 },
  NJ: { staffRN: 102340, staffHourly: 49, travelWeekly: 2464, travelAnnual: 128128, shortage: 'shortage', projectedGap: -6800 },
  NM: { staffRN: 88450, staffHourly: 43, travelWeekly: 2150, travelAnnual: 111800, shortage: 'shortage', projectedGap: -2100 },
  NY: { staffRN: 110642, staffHourly: 53, travelWeekly: 2380, travelAnnual: 123760, shortage: 'shortage', projectedGap: -18200 },
  NC: { staffRN: 84670, staffHourly: 41, travelWeekly: 2080, travelAnnual: 108160, shortage: 'shortage', projectedGap: -12500 },
  ND: { staffRN: 107006, staffHourly: 51, travelWeekly: 2200, travelAnnual: 114400, shortage: 'surplus', projectedGap: 1100 },
  OH: { staffRN: 82340, staffHourly: 40, travelWeekly: 2050, travelAnnual: 106600, shortage: 'shortage', projectedGap: -9400 },
  OK: { staffRN: 78920, staffHourly: 38, travelWeekly: 1980, travelAnnual: 102960, shortage: 'shortage', projectedGap: -3600 },
  OR: { staffRN: 120470, staffHourly: 58, travelWeekly: 2380, travelAnnual: 123760, shortage: 'balanced', projectedGap: -1800 },
  PA: { staffRN: 88450, staffHourly: 43, travelWeekly: 2180, travelAnnual: 113360, shortage: 'shortage', projectedGap: -11200 },
  PR: { staffRN: 41470, staffHourly: 20, travelWeekly: 1600, travelAnnual: 83200, shortage: 'shortage', projectedGap: -2800 },
  RI: { staffRN: 95680, staffHourly: 46, travelWeekly: 2490, travelAnnual: 129480, shortage: 'balanced', projectedGap: 200 },
  SC: { staffRN: 82450, staffHourly: 40, travelWeekly: 2050, travelAnnual: 106600, shortage: 'shortage', projectedGap: -5400 },
  SD: { staffRN: 72210, staffHourly: 35, travelWeekly: 2481, travelAnnual: 129012, shortage: 'surplus', projectedGap: 800 },
  TN: { staffRN: 79680, staffHourly: 38, travelWeekly: 2020, travelAnnual: 105040, shortage: 'shortage', projectedGap: -7800 },
  TX: { staffRN: 91450, staffHourly: 44, travelWeekly: 2180, travelAnnual: 113360, shortage: 'shortage', projectedGap: -28500 },
  UT: { staffRN: 85670, staffHourly: 41, travelWeekly: 2100, travelAnnual: 109200, shortage: 'shortage', projectedGap: -3400 },
  VT: { staffRN: 107529, staffHourly: 52, travelWeekly: 2200, travelAnnual: 114400, shortage: 'balanced', projectedGap: -300 },
  VA: { staffRN: 89450, staffHourly: 43, travelWeekly: 2150, travelAnnual: 111800, shortage: 'shortage', projectedGap: -7600 },
  WA: { staffRN: 115740, staffHourly: 56, travelWeekly: 2420, travelAnnual: 125840, shortage: 'balanced', projectedGap: -2400 },
  WV: { staffRN: 78340, staffHourly: 38, travelWeekly: 1950, travelAnnual: 101400, shortage: 'shortage', projectedGap: -2200 },
  WI: { staffRN: 87650, staffHourly: 42, travelWeekly: 2100, travelAnnual: 109200, shortage: 'balanced', projectedGap: 600 },
  WY: { staffRN: 84760, staffHourly: 41, travelWeekly: 2080, travelAnnual: 108160, shortage: 'shortage', projectedGap: -700 }
};

// Cost of Living Index by state (100 = national average, data from Missouri Economic Research 2024-2026)
const COST_OF_LIVING_INDEX = {
  AL: 89.3, AK: 127.1, AZ: 102.2, AR: 89.8, CA: 142.2,
  CO: 105.4, CT: 112.8, DE: 102.4, DC: 148.7, FL: 102.8,
  GA: 93.4, HI: 192.9, ID: 98.2, IL: 93.4, IN: 90.6,
  IA: 90.1, KS: 86.5, KY: 92.8, LA: 91.0, ME: 113.5,
  MD: 118.2, MA: 131.6, MI: 89.6, MN: 98.8, MS: 84.8,
  MO: 89.8, MT: 104.2, NE: 92.8, NV: 104.0, NH: 112.4,
  NJ: 115.2, NM: 93.4, NY: 123.1, NC: 95.8, ND: 94.5,
  OH: 90.8, OK: 86.2, OR: 113.1, PA: 97.3, PR: 98.0,
  RI: 105.2, SC: 94.2, SD: 96.5, TN: 90.5, TX: 92.1,
  UT: 101.2, VT: 115.9, VA: 103.7, WA: 118.8, WV: 88.6,
  WI: 95.2, WY: 96.8
};

// Rural Hospital Closures by State (fallback data from CHQPR/Sheps Center)
// Live data fetched from rural-closures.json; this object is the offline fallback.
// Structure: { count: number of closures since 2010, recent: closures in last 2 years, atRisk: hospitals at financial risk }
let RURAL_HOSPITAL_CLOSURES = {
  AL: { count: 6, recent: 1, atRisk: 8 },
  AK: { count: 0, recent: 0, atRisk: 2 },
  AZ: { count: 3, recent: 0, atRisk: 4 },
  AR: { count: 3, recent: 0, atRisk: 5 },
  CA: { count: 5, recent: 1, atRisk: 6 },
  CO: { count: 2, recent: 0, atRisk: 3 },
  CT: { count: 1, recent: 0, atRisk: 1 },
  DE: { count: 0, recent: 0, atRisk: 0 },
  DC: { count: 0, recent: 0, atRisk: 0 },
  FL: { count: 4, recent: 1, atRisk: 5 },
  GA: { count: 9, recent: 2, atRisk: 12 },
  HI: { count: 0, recent: 0, atRisk: 1 },
  ID: { count: 1, recent: 0, atRisk: 2 },
  IL: { count: 5, recent: 1, atRisk: 7 },
  IN: { count: 2, recent: 0, atRisk: 4 },
  IA: { count: 1, recent: 0, atRisk: 3 },
  KS: { count: 5, recent: 1, atRisk: 6 },
  KY: { count: 3, recent: 1, atRisk: 5 },
  LA: { count: 4, recent: 0, atRisk: 6 },
  ME: { count: 1, recent: 0, atRisk: 2 },
  MD: { count: 1, recent: 0, atRisk: 1 },
  MA: { count: 1, recent: 0, atRisk: 1 },
  MI: { count: 3, recent: 0, atRisk: 5 },
  MN: { count: 2, recent: 0, atRisk: 3 },
  MS: { count: 6, recent: 1, atRisk: 9 },
  MO: { count: 4, recent: 1, atRisk: 6 },
  MT: { count: 1, recent: 0, atRisk: 2 },
  NE: { count: 2, recent: 0, atRisk: 3 },
  NV: { count: 1, recent: 0, atRisk: 2 },
  NH: { count: 0, recent: 0, atRisk: 1 },
  NJ: { count: 2, recent: 0, atRisk: 2 },
  NM: { count: 2, recent: 0, atRisk: 3 },
  NY: { count: 4, recent: 1, atRisk: 6 },
  NC: { count: 5, recent: 1, atRisk: 7 },
  ND: { count: 0, recent: 0, atRisk: 1 },
  OH: { count: 4, recent: 0, atRisk: 6 },
  OK: { count: 7, recent: 2, atRisk: 9 },
  OR: { count: 1, recent: 0, atRisk: 2 },
  PA: { count: 3, recent: 0, atRisk: 5 },
  PR: { count: 2, recent: 0, atRisk: 3 },
  RI: { count: 0, recent: 0, atRisk: 0 },
  SC: { count: 3, recent: 0, atRisk: 4 },
  SD: { count: 1, recent: 0, atRisk: 2 },
  TN: { count: 8, recent: 2, atRisk: 10 },
  TX: { count: 26, recent: 4, atRisk: 22 },
  UT: { count: 1, recent: 0, atRisk: 2 },
  VT: { count: 0, recent: 0, atRisk: 1 },
  VA: { count: 3, recent: 0, atRisk: 4 },
  WA: { count: 2, recent: 0, atRisk: 3 },
  WV: { count: 3, recent: 1, atRisk: 5 },
  WI: { count: 2, recent: 0, atRisk: 3 },
  WY: { count: 1, recent: 0, atRisk: 2 }
};

let ruralClosuresLastUpdated = null;

const loadRuralClosuresData = async (forceRefresh = false) => {
  const now = Date.now();
  if (ruralClosuresLoaded && !forceRefresh && (now - ruralClosuresLoadedAt) < RURAL_CLOSURES_REFRESH_MS) {
    return ruralClosuresData;
  }
  try {
    const response = await fetch(`${DATA_BASE_URL}/rural-closures.json?ts=${now}`);
    if (!response.ok) throw new Error(`Failed to load rural closures: ${response.status}`);
    ruralClosuresData = await response.json();
    if (ruralClosuresData?.states) {
      RURAL_HOSPITAL_CLOSURES = ruralClosuresData.states;
      ruralClosuresLastUpdated = ruralClosuresData.lastUpdated || null;
    }
    ruralClosuresLoaded = true;
    ruralClosuresLoadedAt = now;
    return ruralClosuresData;
  } catch (err) {
    console.warn('Rural closures data unavailable, using fallback:', err.message);
    ruralClosuresLoaded = true;
    ruralClosuresLoadedAt = now;
    return null;
  }
};

// Travel nurse specialty pay (weekly rates)
const SPECIALTY_PAY = {
  'Cath Lab': { weekly: 4341, annual: 225732, demand: 'very high' },
  'NICU': { weekly: 2449, annual: 127391, demand: 'high' },
  'ICU': { weekly: 2426, annual: 126164, demand: 'very high' },
  'Telemetry': { weekly: 2321, annual: 120690, demand: 'high' },
  'L&D': { weekly: 2400, annual: 124800, demand: 'high' },
  'Oncology': { weekly: 2300, annual: 119600, demand: 'high' },
  'Med-Surg': { weekly: 2118, annual: 110165, demand: 'moderate' },
  'OR': { weekly: 1818, annual: 94573, demand: 'high' },
  'ER': { weekly: 1668, annual: 86737, demand: 'very high' },
  'Psych': { weekly: 1950, annual: 101400, demand: 'high' },
  'Home Health': { weekly: 1700, annual: 88400, demand: 'moderate' },
  'Rehab': { weekly: 1800, annual: 93600, demand: 'moderate' }
};

// National workforce projections (HRSA/BLS data)
const WORKFORCE_PROJECTIONS = {
  currentYear: 2026,
  nationalSupply: 3150000,
  nationalDemand: 3450000,
  projectedGap2030: -350000,
  projectedGap2035: -500000,
  growthRate: 6, // percent through 2032
  retirementRate: 4.5, // percent annually
  avgAge: 52,
  medianTenure: 8.5
};

  const renderStrategicReview = async () => {
    const container = document.getElementById('strategic-review-content');
    if (!container) return;

    // Load strategic data from JSON (with fallback to hardcoded)
    await loadStrategicData();
    await loadRecruitmentIntel();
    await loadStateBeaconData();
    await loadStateNewsData();
    await ensureProgramsDataForBeacon();
  const salaryData = strategicData?.salaryData || NURSING_SALARY_DATA;
  const specialtyPay = strategicData?.specialtyPay || SPECIALTY_PAY;
  const projections = strategicData?.workforceProjections || WORKFORCE_PROJECTIONS;
  const specialtySignals = strategicData?.specialtySignals || null;
  const specialtySignalCards = Array.isArray(specialtySignals?.cards) ? specialtySignals.cards : [];
  const specialtySignalSources = Array.isArray(specialtySignals?.sources) ? specialtySignals.sources : [];
  const specialtySignalStatusRaw = specialtySignals?.status || 'pending';
  const specialtySourceText = specialtySignalSources.map(source => source.name).filter(Boolean).join(' + ');
  const homeStateForSignals = (getStateBeaconInputs()?.homeState) || STATE_BEACON_HOME_DEFAULT;

  const computeBestTargets = (homeState) => {
    return Object.entries(salaryData)
      .filter(([state, data]) => state !== homeState && data.shortage === 'shortage')
      .sort((a, b) => {
        const gapA = Number(a[1].projectedGap ?? 0);
        const gapB = Number(b[1].projectedGap ?? 0);
        if (gapA !== gapB) return gapA - gapB;
        return Number(b[1].travelWeekly ?? 0) - Number(a[1].travelWeekly ?? 0);
      })
      .slice(0, 3)
      .map(([state]) => STATE_NAMES[state] || state);
  };

  const bestTargets = computeBestTargets(homeStateForSignals);
  const bestTargetsText = bestTargets.length ? bestTargets.join(', ') : '--';
  const isRNOnlySpecialty = (name) => {
    const lowered = String(name || '').toLowerCase();
    return !(
      lowered.includes('nurse practitioner') ||
      lowered.includes('clinical nurse specialist') ||
      lowered.includes('crna') ||
      lowered.includes('nurse anesthetist') ||
      lowered.includes('midwife')
    );
  };

  const rnSignalCards = specialtySignalCards
    .filter((card) => isRNOnlySpecialty(card.specialty || card.name || ''));
  const specialtySignalStatus = rnSignalCards.length ? specialtySignalStatusRaw : 'pending';

  const formatSignalValue = (entry, isProxy) => {
    if (!entry || !entry.state) return '--';
    const stateName = STATE_NAMES[entry.state] || entry.state;
    if (isProxy) return stateName;
    const value = entry.value ?? entry.count ?? entry.score ?? null;
    if (value !== null && value !== undefined) {
      const formatted = value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toLocaleString();
      return `${stateName} • ${formatted}`;
    }
    return stateName;
  };

  const pickProxyMetric = (name) => {
    const lowered = String(name || '').toLowerCase();
    const matches = (terms) => terms.some(term => lowered.includes(term));
    if (matches(['icu', 'er', 'emergency', 'trauma', 'nicu', 'picu', 'labor', 'delivery', 'ob', 'cvicu', 'micu', 'sicu'])) {
      return 'demand';
    }
    if (matches(['or', 'periop', 'perioperative', 'pacu', 'cath', 'electrophysiology', 'interventional', 'endoscopy'])) {
      return 'pay';
    }
    if (matches(['home health', 'hospice', 'ltc', 'snf', 'geriatric', 'rehab', 'outpatient', 'ambulatory', 'clinic', 'school', 'public health', 'occupational', 'correctional'])) {
      return 'supply';
    }
    return 'demand';
  };

  const getProxyStatesForSpecialty = (name) => {
    const metric = pickProxyMetric(name);
    const entries = Object.entries(salaryData);

    // Create specialty-specific offset using simple hash
    const hash = String(name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const topOffset = hash % 5; // Pick from top 5 states
    const bottomOffset = (hash * 7) % 5; // Pick from bottom 5 states

    const metricValue = (data) => {
      if (metric === 'supply') return Number(data.staffRN ?? 0);
      if (metric === 'pay') return Number(data.travelWeekly ?? 0);
      return -Number(data.projectedGap ?? 0);
    };

    const sorted = entries
      .slice()
      .sort((a, b) => metricValue(b[1]) - metricValue(a[1]));

    // Pick from top and bottom ranges with specialty-specific offsets
    const topState = sorted[topOffset]?.[0] || sorted[0]?.[0] || null;
    const bottomIdx = Math.max(0, sorted.length - 1 - bottomOffset);
    const leastState = sorted[bottomIdx]?.[0] || sorted[sorted.length - 1]?.[0] || null;

    return { topState, leastState, metric };
  };

  const formatProxyState = (state) => {
    if (!state) return '--';
    return STATE_NAMES[state] || state;
  };

  const proxyMetricLabel = {
    demand: 'Demand proxy',
    supply: 'Supply proxy',
    pay: 'Pay proxy'
  };

  const renderSpecialtySignals = () => {
    if (rnSignalCards.length) {
      return rnSignalCards.map((card) => {
        const top = card.topState || card.most || card.highest || null;
        const low = card.bottomState || card.least || card.lowest || null;
        const tip = card.tip || card.tips || card.notes || 'Target top states for near-term outreach.';
        const isProxy = (tip && tip.includes('not specialty-specific')) || (card.source && card.source.includes('proxy'));
        return `
          <div class="specialty-signal-card">
            <div class="specialty-signal-title">${card.specialty || card.name || 'Specialty'}</div>
            <div class="specialty-signal-rows">
              <div><span class="label">Highest supply</span><span class="value">${formatSignalValue(top, isProxy)}</span></div>
              <div><span class="label">Lowest supply</span><span class="value">${formatSignalValue(low, isProxy)}</span></div>
              <div><span class="label">Best outbound targets</span><span class="value">${bestTargetsText}</span></div>
            </div>
            <div class="specialty-signal-tip">${isProxy ? 'Based on total RN employment. Specialty-specific data coming soon.' : tip}</div>
          </div>
        `;
      }).join('');
    }

    return Object.values(NURSE_SPECIALTIES)
      .filter((spec) => isRNOnlySpecialty(spec.name))
      .map((spec) => {
        const proxy = getProxyStatesForSpecialty(spec.name);
        const proxyLabel = proxyMetricLabel[proxy.metric] || 'Proxy';
        return `
      <div class="specialty-signal-card pending">
        <div class="specialty-signal-title">${spec.name}</div>
        <div class="specialty-signal-rows">
          <div><span class="label">Top</span><span class="value">${formatProxyState(proxy.topState)}</span></div>
          <div><span class="label">Least</span><span class="value">${formatProxyState(proxy.leastState)}</span></div>
          <div><span class="label">Best outbound targets</span><span class="value">${bestTargetsText}</span></div>
        </div>
        <div class="specialty-signal-tip">${proxyLabel} from statewide RN data.</div>
      </div>
    `;
      }).join('');
  };

  // Calculate market metrics from loaded notices
  const totalLayoffs = currentNotices.reduce((sum, n) => sum + (n.employees_affected || 0), 0);
  const avgNursingScore = currentNotices.length > 0
    ? Math.round(currentNotices.reduce((sum, n) => sum + (n.nursing_score || 0), 0) / currentNotices.length)
    : 0;

  // Group notices by state for analysis
  const stateLayoffs = {};
  currentNotices.forEach(n => {
    if (!stateLayoffs[n.state]) stateLayoffs[n.state] = { count: 0, affected: 0 };
    stateLayoffs[n.state].count++;
    stateLayoffs[n.state].affected += n.employees_affected || 0;
  });

  const homeStateName = STATE_NAMES[homeStateForSignals] || homeStateForSignals;
  const homeStateEntry = getBeaconEntry(homeStateForSignals);
  const homeStateNews = getStateNewsFeed(homeStateForSignals, homeStateEntry);
  const homeStateNoticeCount = stateLayoffs[homeStateForSignals]?.count ?? 0;
  const homeConfidence = computeSignalConfidence(
    homeStateNoticeCount,
    Array.isArray(homeStateNews) ? homeStateNews.length : 0,
    homeStateEntry.warnMajorSystems?.length || 0
  );

  // Calculate strategic opportunities
  const opportunities = [];
  const risks = [];

  Object.entries(stateLayoffs).forEach(([state, data]) => {
    const stateInfo = salaryData[state];
    if (!stateInfo) return;

    const travelPremium = stateInfo.travelAnnual - stateInfo.staffRN;
    const estimatedNurses = Math.round(data.affected * 0.35); // ~35% nursing in healthcare layoffs

    if (stateInfo.shortage === 'shortage' && estimatedNurses > 50) {
      opportunities.push({
        state,
        estimatedNurses,
        travelPremium,
        avgSalary: stateInfo.staffRN,
        travelRate: stateInfo.travelWeekly,
        projectedGap: stateInfo.projectedGap,
        priority: Math.abs(stateInfo.projectedGap) + estimatedNurses
      });
    }

    if (data.count >= 3 || data.affected >= 200) {
      risks.push({
        state,
        noticeCount: data.count,
        totalAffected: data.affected,
        shortage: stateInfo.shortage,
        projectedGap: stateInfo.projectedGap
      });
    }
  });

  opportunities.sort((a, b) => b.priority - a.priority);
  risks.sort((a, b) => b.totalAffected - a.totalAffected);

  // Generate executive summary
  const shortageStatesList = Object.entries(salaryData).filter(([_, d]) => d.shortage === 'shortage').map(([s]) => s).sort();
  const surplusStatesList = Object.entries(salaryData).filter(([_, d]) => d.shortage === 'surplus').map(([s]) => s).sort();
  const totalProjectedGap = Object.values(salaryData).reduce((sum, d) => sum + d.projectedGap, 0);
  const avgStaffSalary = Math.round(Object.values(salaryData).reduce((sum, d) => sum + d.staffRN, 0) /
    Math.max(Object.keys(salaryData).length, 1));
  const homeStaffSalary = salaryData[homeStateForSignals]?.staffRN ?? null;
  const payPositionLabel = homeStaffSalary
    ? (homeStaffSalary >= avgStaffSalary * 1.05 ? 'Above market'
      : homeStaffSalary <= avgStaffSalary * 0.95 ? 'Below market'
        : 'At market')
    : 'Market data pending';
  const payPositionDelta = homeStaffSalary !== null ? homeStaffSalary - avgStaffSalary : null;

  const programsByState = nursingPrograms.reduce((acc, program) => {
    const state = normalizeProgram(program).state;
    if (!state) return acc;
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {});
  const programCounts = Object.values(programsByState);
  const homePrograms = programsByState[homeStateForSignals] || 0;
  const homeProgramPercentile = programCounts.length
    ? Math.round((programCounts.filter((count) => count <= homePrograms).length / programCounts.length) * 100)
    : null;
  const supplyLabel = homeProgramPercentile === null
    ? 'Pipeline data pending'
    : homeProgramPercentile >= 67 ? 'High supply' : homeProgramPercentile >= 34 ? 'Moderate supply' : 'Low supply';

  const demandScoreMap = { 'very high': 3, 'high': 2, 'moderate': 1, 'low': 0.5 };
  const specialtyHeat = Object.entries(specialtyPay)
    .map(([specialty, data]) => {
      const demandScore = demandScoreMap[String(data.demand || '').toLowerCase()] || 1;
      const heatScore = (data.weekly / 1000) + demandScore;
      return { specialty, weekly: data.weekly, demand: data.demand, heatScore };
    })
    .sort((a, b) => b.heatScore - a.heatScore)
    .slice(0, 5);
  const topRisks = risks.slice(0, 3);

    container.innerHTML = `
      <div class="strategic-grid">
        <!-- Executive Dashboard Card -->
        <div class="strategic-card exec-dashboard full-width">
          <div class="strategic-card-header">
            <h4><span class="card-icon">🧭</span> Executive Dashboard</h4>
            <span class="strategic-badge">Live snapshot</span>
          </div>
          <div class="exec-dashboard-grid">
            <div class="exec-dashboard-item">
              <div class="exec-dashboard-label">Home state focus</div>
              <div class="exec-dashboard-value">${escapeHtml(homeStateName)} (${escapeHtml(homeStateForSignals)})</div>
              <div class="exec-dashboard-sub">Signal confidence: ${homeConfidence.label}</div>
            </div>
            <div class="exec-dashboard-item">
              <div class="exec-dashboard-label">Best outbound targets</div>
              <div class="exec-dashboard-value">${bestTargetsText}</div>
              <div class="exec-dashboard-sub">Based on shortages + projected gaps</div>
            </div>
            <div class="exec-dashboard-item">
              <div class="exec-dashboard-label">Top inbound risk states</div>
              <div class="exec-dashboard-value">
                ${topRisks.length ? topRisks.map((risk) => `${risk.state} (${risk.noticeCount})`).join(', ') : '--'}
              </div>
              <div class="exec-dashboard-sub">WARN volume in shortage markets</div>
            </div>
            <div class="exec-dashboard-item">
              <div class="exec-dashboard-label">Pay positioning</div>
              <div class="exec-dashboard-value">${payPositionLabel}</div>
              <div class="exec-dashboard-sub">
                ${homeStaffSalary ? `$${homeStaffSalary.toLocaleString()} vs avg $${avgStaffSalary.toLocaleString()}` : 'Awaiting state benchmarks'}
              </div>
            </div>
          </div>
        </div>

        <!-- Executive Summary Card -->
        <div class="strategic-card executive-summary full-width">
          <div class="strategic-card-header">
            <h4><span class="card-icon">📊</span> Executive Summary</h4>
            <span class="strategic-badge critical">Q1 2026</span>
          </div>

        <div class="exec-metrics-row">
          <div class="exec-metric-card">
            <div class="exec-metric-value negative">${Math.abs(totalProjectedGap).toLocaleString()}</div>
            <div class="exec-metric-label">Projected RN Shortage by 2030</div>
          </div>
          <div class="exec-metric-card">
            <div class="exec-metric-value">${shortageStatesList.length}</div>
            <div class="exec-metric-label">States with Shortages</div>
          </div>
          <div class="exec-metric-card">
            <div class="exec-metric-value positive">${surplusStatesList.length}</div>
            <div class="exec-metric-label">States with Surplus</div>
          </div>
          <div class="exec-metric-card">
            <div class="exec-metric-value">${projections.growthRate}%</div>
            <div class="exec-metric-label">Job Growth (2022-2032)</div>
          </div>
        </div>

        <div class="state-lists-container">
          <div class="state-list-section shortage">
            <div class="state-list-header">
              <span class="state-list-icon">⚠️</span>
              <span class="state-list-title">Shortage States (${shortageStatesList.length})</span>
            </div>
            <div class="state-pills">
              ${shortageStatesList.map(s => `<span class="state-pill shortage">${s}</span>`).join('')}
            </div>
          </div>
          <div class="state-list-section surplus">
            <div class="state-list-header">
              <span class="state-list-icon">✓</span>
              <span class="state-list-title">Surplus States (${surplusStatesList.length})</span>
            </div>
            <div class="state-pills">
              ${surplusStatesList.map(s => `<span class="state-pill surplus">${s}</span>`).join('')}
            </div>
          </div>
        </div>

        <div class="strategic-insight">
          <div class="insight-icon">💡</div>
          <div class="insight-content">
            <strong>Key Insight:</strong> The nursing workforce faces a critical shortage of approximately
            ${Math.abs(projections.projectedGap2030).toLocaleString()} RNs by 2030, driven by
            an aging workforce (median age ${projections.avgAge}) and ${projections.retirementRate}%
            annual retirement rate. Recent layoff activity in ${Object.keys(stateLayoffs).length} states presents
            strategic recruitment opportunities.
          </div>
        </div>
        </div>

        <!-- Signal Confidence Card -->
        <div class="strategic-card signal-confidence">
          <div class="strategic-card-header">
            <h4><span class="card-icon">🛰️</span> Signal Confidence</h4>
            <span class="strategic-badge ${homeConfidence.label.toLowerCase()}">${homeConfidence.label}</span>
          </div>
          <div class="confidence-grid">
            <div>
              <div class="confidence-value">${homeStateNoticeCount}</div>
              <div class="confidence-label">WARN notices</div>
            </div>
            <div>
              <div class="confidence-value">${Array.isArray(homeStateNews) ? homeStateNews.length : 0}</div>
              <div class="confidence-label">News hits</div>
            </div>
            <div>
              <div class="confidence-value">${homeStateEntry.warnMajorSystems?.length || 0}</div>
              <div class="confidence-label">Major systems tracked</div>
            </div>
          </div>
          <p class="card-description">Confidence blends WARN activity, news volume, and major system coverage.</p>
        </div>

        <!-- Competitive Pay Position Card -->
        <div class="strategic-card pay-positioning">
          <div class="strategic-card-header">
            <h4><span class="card-icon">💵</span> Competitive Pay Position</h4>
            <span class="strategic-badge">${payPositionLabel}</span>
          </div>
          <div class="pay-position-grid">
            <div>
              <div class="pay-position-value">${homeStaffSalary ? `$${homeStaffSalary.toLocaleString()}` : '--'}</div>
              <div class="pay-position-label">${homeStateName} avg staff RN</div>
            </div>
            <div>
              <div class="pay-position-value">${avgStaffSalary ? `$${avgStaffSalary.toLocaleString()}` : '--'}</div>
              <div class="pay-position-label">National avg staff RN</div>
            </div>
            <div>
              <div class="pay-position-value ${payPositionDelta >= 0 ? 'positive' : 'negative'}">
                ${payPositionDelta === null ? '--' : `${payPositionDelta >= 0 ? '+' : '-'}$${Math.abs(payPositionDelta).toLocaleString()}`}
              </div>
              <div class="pay-position-label">Gap vs national avg</div>
            </div>
          </div>
        </div>

        <!-- Talent Supply Proxy Card -->
        <div class="strategic-card supply-proxy">
          <div class="strategic-card-header">
            <h4><span class="card-icon">🎓</span> Talent Supply Proxy</h4>
            <span class="strategic-badge">${supplyLabel}</span>
          </div>
          <div class="supply-grid">
            <div>
              <div class="supply-value">${homePrograms}</div>
              <div class="supply-label">Programs in ${homeStateName}</div>
            </div>
            <div>
              <div class="supply-value">${homeProgramPercentile !== null ? `${homeProgramPercentile}th` : '--'}</div>
              <div class="supply-label">Program density percentile</div>
            </div>
          </div>
          <p class="card-description">Uses accredited program counts as a proxy for long-term RN supply.</p>
        </div>

        <div class="strategic-footnote">
          <span>Signal confidence = WARN notices + local news volume + major system coverage.</span>
          <span>Supply proxy = accredited nursing program count percentile for the selected home state.</span>
        </div>

        <!-- Specialty Heat Score Card -->
        <div class="strategic-card specialty-heat">
          <div class="strategic-card-header">
            <h4><span class="card-icon">🔥</span> Specialty Heat Scores</h4>
            <span class="strategic-badge">Demand x Pay</span>
          </div>
          <ul class="heat-score-list">
            ${specialtyHeat.map((entry) => `
              <li>
                <span class="heat-score-name">${entry.specialty}</span>
                <span class="heat-score-meta">$${entry.weekly.toLocaleString()}/wk • ${entry.demand}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Salary Comparison Card -->
        <div class="strategic-card salary-comparison">
        <div class="strategic-card-header">
          <h4><span class="card-icon">💰</span> Compensation Comparison</h4>
          <span class="strategic-badge">Top 15 States</span>
        </div>
        <p class="card-description">Staff RN vs Travel Nurse annual compensation by state</p>
        <div class="salary-table-wrapper">
          <table class="salary-table">
            <thead>
              <tr>
                <th>State</th>
                <th>Staff RN</th>
                <th>Travel/Wk</th>
                <th>Travel/Yr</th>
                <th>Premium</th>
                <th>Market</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(salaryData)
                .sort((a, b) => b[1].staffRN - a[1].staffRN)
                .slice(0, 15)
                .map(([state, data]) => `
                  <tr class="${data.shortage === 'shortage' ? 'shortage-row' : data.shortage === 'surplus' ? 'surplus-row' : ''}">
                    <td><strong>${state}</strong></td>
                    <td class="salary-cell">$${data.staffRN.toLocaleString()}</td>
                    <td class="salary-cell travel">$${data.travelWeekly.toLocaleString()}</td>
                    <td class="salary-cell travel">$${data.travelAnnual.toLocaleString()}</td>
                    <td class="premium-cell ${data.travelAnnual - data.staffRN > 25000 ? 'high' : data.travelAnnual - data.staffRN > 15000 ? 'medium' : data.travelAnnual - data.staffRN < 0 ? 'negative' : 'low'}">
                      ${data.travelAnnual - data.staffRN >= 0 ? '+' : '-'}$${Math.abs(data.travelAnnual - data.staffRN).toLocaleString()}
                    </td>
                    <td>
                      <span class="market-badge ${data.shortage}">${data.shortage}</span>
                    </td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
        <div class="salary-legend">
          <span class="legend-item"><span class="dot shortage"></span> Shortage</span>
          <span class="legend-item"><span class="dot surplus"></span> Surplus</span>
          <span class="legend-item"><span class="dot balanced"></span> Balanced</span>
        </div>
      </div>

      <!-- Specialty Pay Card -->
      <div class="strategic-card specialty-pay">
        <div class="strategic-card-header">
          <h4><span class="card-icon">🏥</span> Specialty Pay Rates</h4>
          <span class="strategic-badge">2026 Rates</span>
        </div>
        <p class="card-description">Travel nurse compensation by specialty area</p>
        <div class="specialty-grid">
          ${Object.entries(specialtyPay)
            .sort((a, b) => b[1].weekly - a[1].weekly)
            .map(([specialty, data]) => `
              <div class="specialty-card">
                <div class="specialty-name">${specialty}</div>
                <div class="specialty-weekly">$${data.weekly.toLocaleString()}<span>/wk</span></div>
                <div class="specialty-annual">$${data.annual.toLocaleString()}/yr</div>
                <div class="demand-badge ${data.demand.replace(' ', '-').toLowerCase()}">${data.demand}</div>
              </div>
            `).join('')}
        </div>
      </div>

      <!-- Specialty Targeting Card -->
      <div class="strategic-card specialty-signals">
        <div class="strategic-card-header">
          <h4><span class="card-icon">🧭</span> Specialty Targeting Signals</h4>
          <span class="strategic-badge">${specialtySignalStatus === 'ready' ? 'Live' : 'Auto refresh'}</span>
        </div>
        <p class="card-description">State-by-state supply and demand signals per specialty.</p>
        <div class="specialty-signal-grid">
          ${renderSpecialtySignals()}
        </div>
        <p class="specialty-signal-note">
          ${specialtySourceText ? `Sources: ${specialtySourceText}` : 'Sources queued for ingestion.'}
        </p>
      </div>

      <!-- Recruitment Opportunities Card -->
      <div class="strategic-card opportunities">
        <div class="strategic-card-header">
          <h4><span class="card-icon">🎯</span> Recruitment Opportunities</h4>
          <span class="strategic-badge opportunity">WARN Data</span>
        </div>
        <p class="card-description">States with layoffs in shortage markets</p>
        ${opportunities.length > 0 ? `
          <div class="opportunity-list">
            ${opportunities.slice(0, 6).map((opp, i) => `
              <div class="opportunity-item">
                <div class="opp-rank">${i + 1}</div>
                <div class="opp-info">
                  <div class="opp-state-name">${STATE_NAMES[opp.state] || opp.state}</div>
                  <div class="opp-state-code">${opp.state}</div>
                </div>
                <div class="opp-stats">
                  <div class="opp-stat">
                    <span class="stat-value">${opp.estimatedNurses}</span>
                    <span class="stat-label">Nurses</span>
                  </div>
                  <div class="opp-stat">
                    <span class="stat-value">$${opp.travelRate.toLocaleString()}</span>
                    <span class="stat-label">Weekly</span>
                  </div>
                  <div class="opp-stat">
                    <span class="stat-value">${Math.abs(opp.projectedGap).toLocaleString()}</span>
                    <span class="stat-label">Gap</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state">Apply filters to identify recruitment opportunities from layoff data.</div>
        `}
      </div>

      <!-- Risk Assessment Card -->
      <div class="strategic-card risk-assessment">
        <div class="strategic-card-header">
          <h4><span class="card-icon">⚡</span> Market Risk Assessment</h4>
          <span class="strategic-badge warning">Monitor</span>
        </div>
        <p class="card-description">States with high layoff activity</p>
        ${risks.length > 0 ? `
          <div class="risk-list">
            ${risks.slice(0, 5).map(risk => `
              <div class="risk-item">
                <div class="risk-header">
                  <span class="risk-state">${risk.state}</span>
                  <span class="risk-badge ${risk.noticeCount >= 5 ? 'high' : risk.noticeCount >= 3 ? 'medium' : 'low'}">
                    ${risk.noticeCount >= 5 ? 'High' : risk.noticeCount >= 3 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div class="risk-stats">
                  <span>${risk.noticeCount} notices</span>
                  <span>•</span>
                  <span>${risk.totalAffected.toLocaleString()} affected</span>
                  <span>•</span>
                  <span class="${risk.projectedGap > 0 ? 'surplus-text' : 'shortage-text'}">
                    ${risk.projectedGap > 0 ? 'Surplus' : 'Shortage'}: ${Math.abs(risk.projectedGap).toLocaleString()}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state">No significant risk patterns detected.</div>
        `}
      </div>

      <!-- Workforce Projections Card -->
      <div class="strategic-card projections full-width">
        <div class="strategic-card-header">
          <h4><span class="card-icon">📈</span> Workforce Supply vs Demand</h4>
          <span class="strategic-badge">HRSA/BLS Data</span>
        </div>
        <div class="projection-grid">
          <div class="projection-card">
            <div class="projection-year">2026</div>
            <div class="projection-bars">
              <div class="bar-group">
                <div class="bar-label">Supply</div>
                <div class="bar supply" style="width: 91%;"><span>3.15M</span></div>
              </div>
              <div class="bar-group">
                <div class="bar-label">Demand</div>
                <div class="bar demand" style="width: 100%;"><span>3.45M</span></div>
              </div>
            </div>
            <div class="projection-gap negative">Gap: -300K</div>
          </div>
          <div class="projection-card">
            <div class="projection-year">2030</div>
            <div class="projection-bars">
              <div class="bar-group">
                <div class="bar-label">Supply</div>
                <div class="bar supply" style="width: 90%;"><span>3.30M</span></div>
              </div>
              <div class="bar-group">
                <div class="bar-label">Demand</div>
                <div class="bar demand" style="width: 100%;"><span>3.65M</span></div>
              </div>
            </div>
            <div class="projection-gap negative">Gap: -350K</div>
          </div>
          <div class="projection-card">
            <div class="projection-year">2035</div>
            <div class="projection-bars">
              <div class="bar-group">
                <div class="bar-label">Supply</div>
                <div class="bar supply" style="width: 87%;"><span>3.40M</span></div>
              </div>
              <div class="bar-group">
                <div class="bar-label">Demand</div>
                <div class="bar demand" style="width: 100%;"><span>3.90M</span></div>
              </div>
            </div>
            <div class="projection-gap negative">Gap: -500K</div>
          </div>
        </div>
        <div class="projection-facts">
          <div class="fact"><span class="fact-icon">👤</span> Median RN Age: ${projections.avgAge} years</div>
          <div class="fact"><span class="fact-icon">🎓</span> Annual Retirement: ${projections.retirementRate}%</div>
          <div class="fact"><span class="fact-icon">📊</span> Job Growth: ${projections.growthRate}% through 2032</div>
        </div>
      </div>
    </div>
  `;
};

const initStrategicReview = () => {
  const toggleBtn = document.getElementById('strategic-toggle');
  const section = document.querySelector('.strategic-review-section');
  const toggleIcon = section?.querySelector('.strategic-toggle-icon');

  if (!toggleBtn || !section) {
    console.warn('Strategic review elements not found');
    return;
  }

  toggleBtn.addEventListener('click', () => {
    section.classList.toggle('open');
    const isOpen = section.classList.contains('open');
    if (toggleIcon) {
      toggleIcon.textContent = isOpen ? '-' : '+';
    }
    if (isOpen) {
      renderStrategicReview();
    }
  });

  // Re-render when filters change
  const originalApplyFilters = applyFilters;
  window.applyFiltersWithStrategic = () => {
    originalApplyFilters();
    if (section?.classList.contains('open')) {
      renderStrategicReview();
    }
  };

  if (section?.classList.contains('open')) {
    if (toggleIcon) {
      toggleIcon.textContent = '-';
    }
    renderStrategicReview();
  }
};

// ==================== ACCREDITED PROGRAMS MODULE ====================

const updateProgramsCount = (count, showing = count) => {
  if (!programsCount) return;
  const label = count === 1 ? 'program' : 'programs';
  if (showing < count) {
    programsCount.textContent = `Showing ${showing} of ${count} ${label}`;
  } else {
    programsCount.textContent = `${count} ${label}`;
  }
};

const updateProgramsLoading = (loaded, total) => {
  if (!programsProgressBar || !programsProgressText) return;
  const percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
  programsProgressBar.style.width = `${percent}%`;
  programsProgressText.textContent = `Loading programs... ${percent}%`;
};

const normalizeProgram = (program) => {
  const rawLevel = (program.level ?? program.program_level ?? '').trim();
  let level = rawLevel;
  if (/^adn$/i.test(level) || /associate degree/i.test(level)) {
    level = 'ASN';
  }

  return {
    institution: program.institution ?? program.institution_name ?? program.school ?? 'Unknown',
    campus: program.campus ?? program.campus_name ?? '-',
    city: program.city ?? '',
    state: program.state ?? '',
    level,
    accreditor: program.accreditor ?? program.accreditation ?? '',
    credentialNotes: program.credential_notes ?? program.credentialNotes ?? ''
  };
};

const deriveAssociatePrograms = (programs) => {
  const extras = [];
  const existing = new Set(
    programs.map((program) => {
      const inst = (program.institution ?? program.institution_name ?? '').toLowerCase();
      const state = (program.state ?? '').toLowerCase();
      const level = (program.program_level ?? program.level ?? '').toUpperCase();
      return `${inst}|${state}|${level}`;
    })
  );

  programs.forEach((program) => {
    const accreditationText = `${program.accreditation_status ?? ''} ${program.credential_notes ?? ''}`.toLowerCase();
    if (!accreditationText.includes('associate degree in nursing')) return;
    const inst = (program.institution ?? program.institution_name ?? '').toLowerCase();
    const state = (program.state ?? '').toLowerCase();
    const baseLevel = (program.program_level ?? program.level ?? '').toUpperCase();
    if (baseLevel === 'ASN' || baseLevel === 'ADN') return;
    const key = `${inst}|${state}|ASN`;
    if (existing.has(key)) return;
    existing.add(key);
    const note = (program.credential_notes ?? '').trim();
    extras.push({
      ...program,
      program_level: 'ASN',
      level: 'ASN',
      credential_notes: note ? `${note} | Associate Degree in Nursing (derived)` : 'Associate Degree in Nursing (derived)'
    });
  });

  return extras.length ? programs.concat(extras) : programs;
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

const DEFAULT_PROGRAM_LEVELS = ['LPN', 'ASN', 'BSN', 'MSN'];

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

  // Use cached search data for performance
  if (programsSearchCache.length) {
    const results = [];
    for (let i = 0; i < programsSearchCache.length; i++) {
      const { entry, haystack } = programsSearchCache[i];
      if (stateFilter && entry.state !== stateFilter) continue;
      if (selectedLevels.length > 0 && !selectedLevels.includes(entry.level)) continue;
      if (query && !haystack.includes(query)) continue;
      results.push(nursingPrograms[i]);
    }
    return results;
  }

  // Fallback if cache not ready
  return nursingPrograms.filter((program) => {
    const entry = normalizeProgram(program);
    if (stateFilter && entry.state !== stateFilter) return false;
    if (selectedLevels.length > 0 && !selectedLevels.includes(entry.level)) return false;
    if (!query) return true;
    const haystack = [entry.institution, entry.campus, entry.city, entry.state, entry.level, entry.accreditor, entry.credentialNotes].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(query);
  });
};

const MAX_PROGRAMS_RENDER = 300;

const renderProgramsTable = (programs) => {
  if (!programsList) return;

  if (!programs.length) {
    programsList.innerHTML = '<tr><td colspan="6">No programs match these filters.</td></tr>';
    updateProgramsCount(0);
    return;
  }

  const displayPrograms = programs.slice(0, MAX_PROGRAMS_RENDER);
  programsList.innerHTML = displayPrograms.map(buildProgramRow).join('');
  updateProgramsCount(programs.length, displayPrograms.length);
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
  updateProgramsCount(total, Math.min(total, MAX_PROGRAMS_RENDER));

  const appendBatch = () => {
    const batch = programs.slice(rendered, Math.min(rendered + batchSize, MAX_PROGRAMS_RENDER));
    if (!batch.length) {
      programsLoading?.classList.remove('active');
      updateProgramsLoading(Math.min(total, MAX_PROGRAMS_RENDER), total);
      return;
    }

    programsList.insertAdjacentHTML('beforeend', batch.map(buildProgramRow).join(''));
    rendered += batch.length;
    updateProgramsLoading(rendered, total);

    if (rendered < Math.min(total, MAX_PROGRAMS_RENDER)) {
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
    const response = await fetch(`/data/programs.json?ts=${Date.now()}`);
    if (!response.ok) throw new Error(`Failed to load programs: ${response.status}`);
    const data = await response.json();

    nursingPrograms = Array.isArray(data) ? data : (data.programs ?? []);
    nursingPrograms = deriveAssociatePrograms(nursingPrograms);
    programsMeta = {
      lastUpdated: data.lastUpdated ?? null,
      sources: data.sources ?? []
    };

    // Pre-compute search haystacks for fast filtering
    programsSearchCache = nursingPrograms.map((program) => {
      const entry = normalizeProgram(program);
      return {
        entry,
        haystack: [entry.institution, entry.campus, entry.city, entry.state, entry.level, entry.accreditor, entry.credentialNotes]
          .filter(Boolean).join(' ').toLowerCase()
      };
    });

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

  const renderProgramsFiltered = () => renderProgramsWithProgress(getFilteredPrograms());
  programsSearch?.addEventListener('input', debounce(renderProgramsFiltered, 300));
  programsStateFilter?.addEventListener('change', renderProgramsFiltered);
  // Add change listeners to all level checkboxes
  programsLevelFilter?.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', renderProgramsFiltered);
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
    const response = await fetch(`${DATA_BASE_URL}/state-beacon.json?ts=${now}`);
    if (!response.ok) throw new Error(`Failed to load state beacon: ${response.status}`);
    stateBeaconData = await response.json();
  } catch (err) {
    console.warn('State Beacon unavailable:', err.message);
    if (!stateBeaconData) stateBeaconData = { lastUpdated: null, states: {} };
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
    stateNewsData = await fetchJson(`${DATA_BASE_URL}/state-news.json?ts=${now}`);
  } catch (err) {
    if (!stateNewsData) stateNewsData = null;
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
    const response = await fetch(`${DATA_BASE_URL}/programs.json?ts=${Date.now()}`);
    if (!response.ok) throw new Error(`Failed to load programs: ${response.status}`);
    const data = await response.json();
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
      hospitalRankings: entry.hospitalRankings ?? [],
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

const buildHomeStateTalkingPoints = (homeEntry, inputs, programsCount = 0) => {
  const points = [];
  const name = homeEntry.name || inputs.homeState || 'your destination';
  const compact = homeEntry.compact ?? homeEntry.licensing?.compact;
  const hourly = homeEntry.compensation?.staffHourlyRange;
  const travel = homeEntry.compensation?.travelWeeklyRange;
  const shiftDiffs = homeEntry.compensation?.shiftDiffs;
  const signOn = homeEntry.compensation?.signOn;
  const benefits = homeEntry.compensation?.benefitsNotes;
  const drivers = homeEntry.market?.drivers ?? [];
  const systems = homeEntry.competition?.systems ?? [];
  const residencies = homeEntry.pipeline?.residencies ?? [];
  const attractions = homeEntry.attractions ?? [];
  const pros = homeEntry.pros ?? [];

  if (pros.length) {
    points.push(`Why ${name}: ${pros[0]}`);
  }
  if (compact !== null) {
    points.push(`${name} is ${compact ? 'a Nurse Licensure Compact state' : 'a non-compact state'} with ${homeEntry.licensing?.endorsementTime || 'clear endorsement timelines'}.`);
  }
  if (hourly || shiftDiffs) {
    const diffNote = shiftDiffs ? ` with ${shiftDiffs}` : '';
    points.push(`Staff RN compensation in ${name} runs ${hourly || 'competitive hourly ranges'}${diffNote}.`);
  }
  if (signOn || benefits) {
    points.push(`Incentives in ${name}: ${signOn || 'sign-on support'}${benefits ? ` plus ${benefits}` : ''}.`);
  }
  if (programsCount || residencies.length) {
    const residencyNote = residencies.length ? ` Residency options include ${residencies.slice(0, 2).join(', ')}.` : '';
    points.push(`Pipeline strength: ${programsCount ? `${programsCount} accredited programs` : 'robust local programs'}.${residencyNote}`);
  }
  if (systems.length) {
    points.push(`Major systems hiring in ${name}: ${systems.slice(0, 3).map((s) => s.name || s).join(', ')}.`);
  }
  if (drivers.length) {
    points.push(`Market drivers in ${name}: ${drivers.slice(0, 2).join(' · ')}.`);
  }
  if (attractions.length) {
    points.push(`Lifestyle highlights: ${attractions.slice(0, 2).join(', ')}.`);
  }

  return points.filter(Boolean).slice(0, 7);
};

const renderBeaconList = (container, items, formatter) => {
  if (!container) return;
  if (!items.length) {
    container.innerHTML = '<div class="empty-state">No data available yet.</div>';
    return;
  }
  container.innerHTML = items.map((item, idx) => formatter(item, idx)).join('');
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
  if (!allNoticesLoaded && !stateNoticesCache.has(state)) {
    await loadStateNotices(state);
  }

  const entry = getBeaconEntry(state);
  const notices = getStateNotices(state);
  const majorNotices = filterNoticesByMajorSystems(notices, entry.warnMajorSystems);
  const noticeCount = majorNotices.length;
  const programsInState = nursingPrograms.filter((program) => normalizeProgram(program).state === state);
  const stateFeed = getStateNewsFeed(state, entry);
  const confidence = computeSignalConfidence(
    noticeCount,
    Array.isArray(stateFeed) ? stateFeed.length : 0,
    entry.warnMajorSystems?.length || 0
  );
  const payPosition = (() => {
    const salaryData = strategicData?.salaryData || NURSING_SALARY_DATA;
    const avgStaffSalary = Math.round(Object.values(salaryData).reduce((sum, d) => sum + d.staffRN, 0) /
      Math.max(Object.keys(salaryData).length, 1));
    const stateSalary = salaryData[state]?.staffRN ?? null;
    if (!stateSalary) return null;
    if (stateSalary >= avgStaffSalary * 1.05) return 'Above market';
    if (stateSalary <= avgStaffSalary * 0.95) return 'Below market';
    return 'At market';
  })();

  const chips = [];
  if (entry.compact !== null) chips.push(`Compact: ${entry.compact ? 'Yes' : 'No'}`);
  if (entry.summary?.demand) chips.push(`Demand: ${entry.summary.demand}`);
  if (entry.summary?.unionization) chips.push(`Union: ${entry.summary.unionization}`);
  if (programsInState.length) chips.push(`Pipeline: ${programsInState.length} programs`);
  if (noticeCount) chips.push(`WARN notices (major systems): ${noticeCount}`);
  if (confidence?.label) chips.push(`Signal confidence: ${confidence.label}`);
  if (payPosition) chips.push(`Pay position: ${payPosition}`);

  if (stateBeaconMeta) {
    stateBeaconMeta.innerHTML = chips.map((chip) => `<span class="state-beacon-chip">${escapeHtml(chip)}</span>`).join('');
  }

  // Hospital Quality Rankings (Top 10 and Worst 10 based on US News / Newsweek scores)
  if (entry.hospitalRankings?.length) {
    const sorted = entry.hospitalRankings
      .map((hospital) => ({
        ...hospital,
        score: Number(hospital.baseScore ?? 50)
      }))
      .sort((a, b) => b.score - a.score);

    const top10 = sorted.slice(0, 10);
    const worst10 = sorted.slice(-10).reverse();

    renderBeaconList(stateBeaconHospitalsTop, top10, (item, idx) => `
      <div class="state-beacon-item">
        <strong>#${idx + 1} ${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(item.metro || '')} • Quality Score: ${item.score}</span>
      </div>
    `);

    renderBeaconList(stateBeaconHospitalsWorst, worst10, (item, idx) => `
      <div class="state-beacon-item">
        <strong>#${sorted.length - 9 + idx} ${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(item.metro || '')} • Quality Score: ${item.score}</span>
      </div>
    `);
  } else {
    renderBeaconList(stateBeaconHospitalsTop, [], () => '');
    renderBeaconList(stateBeaconHospitalsWorst, [], () => '');
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
              <th>Est. Indiana-Educated RNs</th>
              <th>Top Indiana Feeder Schools</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    } else {
      stateBeaconCandidateTable.innerHTML = '';
    }
  }

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

  if (stateBeaconPros) {
    stateBeaconPros.innerHTML = entry.pros.length
      ? entry.pros.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
      : '<li>No pros listed yet.</li>';
  }
  if (stateBeaconCons) {
    stateBeaconCons.innerHTML = entry.cons.length
      ? entry.cons.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
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

  const homeEntry = inputs.homeState ? getBeaconEntry(inputs.homeState) : entry;
  const homePrograms = nursingPrograms.filter(
    (program) => normalizeProgram(program).state === (inputs.homeState || state)
  );
  const talkingPoints = buildHomeStateTalkingPoints(homeEntry, inputs, homePrograms.length);

  renderBeaconList(stateBeaconScript, talkingPoints, (point) => `
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
  const entry = getBeaconEntry(state);
  const notices = getStateNotices(state);
  const majorNotices = filterNoticesByMajorSystems(notices, entry.warnMajorSystems);
  const { best, worst } = buildHospitalRank(majorNotices, entry.warnMajorSystems);
  const competitionSystems = entry.competition?.systems?.length
    ? entry.competition.systems
    : Array.from(groupBy(majorNotices, (n) => n.parent_system || n.employer_name || n.employerName).entries())
      .map(([name, items]) => ({ name, presence: `${items.length} notices`, notes: 'Derived from WARN activity.' }))
      .slice(0, 6);

  const programsInState = nursingPrograms.filter((program) => normalizeProgram(program).state === state);
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
  const homeEntry = inputs.homeState ? getBeaconEntry(inputs.homeState) : entry;
  const homePrograms = nursingPrograms.filter(
    (program) => normalizeProgram(program).state === (inputs.homeState || state)
  );
  const talkingPoints = buildHomeStateTalkingPoints(homeEntry, inputs, homePrograms.length)
    .map((point) => replaceTokens(point, tokens));
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
    pros: entry.pros,
    cons: entry.cons,
    attractions: exportNotes.attractions,
    drawbacks: exportNotes.drawbacks,
    talkingPoints,
    objections,
    newsFeed
  };
};

// Metro data for states (Indiana as default, can be extended)
const STATE_METRO_DATA = {
  IN: {
    nursingEducation: {
      iuSystemPercentage: 35,
      ivyTechPercentage: 28,
      otherSchoolsPercentage: 37,
      totalGraduatesAnnual: 4100,
      retentionRate: 62
    },
    salaryMeta: {
      updatedAt: '2026-02-01',
      updateEveryDays: 7,
      breakdown: [
        { label: 'BLS Indiana RN mean (May 2023)', value: '$39.76/hr • $82,700/yr', note: 'Statewide OEWS data' },
        { label: 'BLS Indianapolis-Carmel-Anderson RN mean (May 2023)', value: '$41.14/hr • $85,580/yr', note: 'Metro OEWS data' },
        { label: 'Indeed company averages (IN/metro)', value: '$34-$42/hr typical', note: 'Company salary pages by system' },
        { label: 'Reddit: r/indianapolis nurses', value: '$25-$31/hr base reported', note: 'Community discussion (2025)' },
        { label: 'Reddit: r/Indiana + r/nursing', value: '$26/hr start • $41/hr @ 13 yrs', note: 'Community-reported (2024-2025)' }
      ],
      sources: [
        { name: 'BLS OEWS Indiana RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_in.htm' },
        { name: 'BLS OEWS Indianapolis MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_26900.htm' },
        { name: 'Indeed: IU Health RN (IN)', url: 'https://www.indeed.com/cmp/Indiana-University-Health/salaries/Registered-Nurse/Indiana' },
        { name: 'Indeed: Ascension RN (Indianapolis)', url: 'https://www.indeed.com/cmp/Ascension/salaries/Registered-Nurse/Indianapolis-IN' },
        { name: 'Indeed: Community Health Network RN (Indianapolis)', url: 'https://www.indeed.com/cmp/Community-Health-Network/salaries/Registered-Nurse/Indianapolis-IN' },
        { name: 'Indeed: Franciscan Health RN (IN)', url: 'https://www.indeed.com/cmp/Franciscan-Health-21c7906f/salaries/Registered-Nurse/Indiana' },
        { name: 'Indeed: Eskenazi Health RN (Indianapolis)', url: 'https://www.indeed.com/cmp/Eskenazi-Health/salaries/Registered-Nurse/Indianapolis-IN' },
        { name: 'Indeed: Parkview Health RN (Fort Wayne)', url: 'https://www.indeed.com/cmp/Parkview-Health-3/salaries/Registered-Nurse/Fort-Wayne-IN' },
        { name: 'Indeed: Lutheran Health Network RN (IN)', url: 'https://www.indeed.com/cmp/Lutheran-Health-Network-of-Indiana/salaries/Registered-Nurse/Indiana' },
        { name: 'Indeed: Deaconess Health System RN (Evansville)', url: 'https://www.indeed.com/cmp/Deaconess-Health-System/salaries/Registered-Nurse/Evansville-IN' },
        { name: 'Indeed: Beacon Health System RN (IN)', url: 'https://www.indeed.com/cmp/Beacon-Health-System/salaries/Registered-Nurse/Indiana' },
        { name: 'Indeed: Trinity Health RN (IN)', url: 'https://www.indeed.com/cmp/Trinity-Health/salaries/Registered-Nurse/Indiana' },
        { name: 'Indeed: Methodist Hospitals RN (IN)', url: 'https://www.indeed.com/cmp/Methodist-Hospitals-1/salaries/Registered-Nurse/Indiana' },
        { name: 'Indeed: Community Healthcare System RN (IN)', url: 'https://www.indeed.com/cmp/Community-Healthcare-System-4/salaries/Registered-Nurse/Indiana' },
        { name: 'Indeed: Northwest Health Porter RN (IN)', url: 'https://www.indeed.com/cmp/Northwest-Health-Porter/salaries/Registered-Nurse/Indiana' },
        { name: 'Indeed: Baptist Health System KY & IN RN (IN)', url: 'https://www.indeed.com/cmp/Baptist-Health-System-Ky-%26-in/salaries/Registered-Nurse/Indiana' },
        { name: 'Reddit: r/indianapolis nurses thread (Sep 2025)', url: 'https://www.reddit.com/r/indianapolis/comments/1lgedw3/nurses_of_indianapolis_where_do_you_work_and_do/' },
        { name: 'Reddit: r/Indiana RN salary thread (Aug 2025)', url: 'https://www.reddit.com/r/Indiana/comments/1msxn09' },
        { name: 'Reddit: r/nursing Indiana pay transparency (Jan 2024)', url: 'https://www.reddit.com/r/nursing/comments/19e4o5y' }
      ]
    },
    metros: [
      {
        name: 'Indianapolis',
        size: 'major',
        population: '2.1M',
        competition: 'high',
        hospitals: [
          { name: 'IU Health Methodist Hospital', system: 'IU Health', score: 96, beds: 802, reviews: 4.3 },
          { name: 'IU Health University Hospital', system: 'IU Health', score: 95, beds: 350, reviews: 4.4 },
          { name: 'Riley Hospital for Children', system: 'IU Health', score: 94, beds: 375, reviews: 4.6 },
          { name: 'Ascension St. Vincent Indianapolis', system: 'Ascension St. Vincent', score: 91, beds: 725, reviews: 4.0 },
          { name: 'Community Hospital East', system: 'Community Health Network', score: 88, beds: 350, reviews: 3.9 },
          { name: 'Community Hospital North', system: 'Community Health Network', score: 87, beds: 303, reviews: 4.0 },
          { name: 'Community Hospital South', system: 'Community Health Network', score: 85, beds: 158, reviews: 3.8 },
          { name: 'Franciscan Health Indianapolis', system: 'Franciscan Health', score: 87, beds: 485, reviews: 4.1 },
          { name: 'Eskenazi Health', system: 'Health & Hospital Corp', score: 85, beds: 315, reviews: 3.8 },
          { name: 'IU Health Saxony Hospital', system: 'IU Health', score: 84, beds: 48, reviews: 4.2 },
          { name: 'IU Health North Hospital', system: 'IU Health', score: 86, beds: 149, reviews: 4.1 },
          { name: 'IU Health West Hospital', system: 'IU Health', score: 85, beds: 127, reviews: 4.0 },
          { name: 'Ascension St. Vincent Carmel', system: 'Ascension St. Vincent', score: 86, beds: 104, reviews: 4.1 },
          { name: 'Ascension St. Vincent Fishers', system: 'Ascension St. Vincent', score: 85, beds: 44, reviews: 4.2 },
          { name: 'Ascension St. Vincent Heart Center', system: 'Ascension St. Vincent', score: 89, beds: 88, reviews: 4.3 },
          { name: 'Franciscan Health Carmel', system: 'Franciscan Health', score: 84, beds: 42, reviews: 4.0 },
          { name: 'Community Westview Hospital', system: 'Community Health Network', score: 82, beds: 72, reviews: 3.7 },
          { name: 'Riverview Health', system: 'Riverview Health', score: 83, beds: 156, reviews: 4.0 },
          { name: 'Witham Health Services', system: 'Witham Health', score: 81, beds: 97, reviews: 3.9 },
          { name: 'Hendricks Regional Health', system: 'Hendricks Regional', score: 84, beds: 127, reviews: 4.1 },
          { name: 'Johnson Memorial Hospital', system: 'Johnson Memorial', score: 80, beds: 81, reviews: 3.8 },
          { name: 'Hancock Regional Hospital', system: 'Hancock Health', score: 82, beds: 65, reviews: 4.0 },
          { name: 'Franciscan Health Mooresville', system: 'Franciscan Health', score: 81, beds: 115, reviews: 3.9 },
          { name: 'Major Health Partners', system: 'Major Health', score: 78, beds: 65, reviews: 3.7 }
        ],
        systems: [
          { name: 'IU Health', facilities: 8, marketShare: '35%' },
          { name: 'Ascension St. Vincent', facilities: 5, marketShare: '22%' },
          { name: 'Community Health Network', facilities: 5, marketShare: '18%' },
          { name: 'Franciscan Health', facilities: 3, marketShare: '10%' },
          { name: 'Independent Hospitals', facilities: 8, marketShare: '15%' }
        ],
          salary: {
            staffRN: '$32-45/hr',
            travelRN: '$2,200-2,800/wk',
            signOn: '$10-25K',
            systems: [
              {
                name: 'IU Health',
                value: '$37.42/hr avg',
                source: 'Indeed (IN)',
                url: 'https://www.indeed.com/cmp/Indiana-University-Health/salaries/Registered-Nurse/Indiana'
              },
              {
                name: 'Ascension St. Vincent',
                value: '$37.70/hr avg',
                source: 'Indeed (Indianapolis)',
                url: 'https://www.indeed.com/cmp/Ascension/salaries/Registered-Nurse/Indianapolis-IN'
              },
              {
                name: 'Community Health Network',
                value: '$41.60/hr avg',
                source: 'Indeed (Indianapolis)',
                url: 'https://www.indeed.com/cmp/Community-Health-Network/salaries/Registered-Nurse/Indianapolis-IN'
              },
              {
                name: 'Franciscan Health',
                value: '$34.94/hr avg',
                source: 'Indeed (IN)',
                url: 'https://www.indeed.com/cmp/Franciscan-Health-21c7906f/salaries/Registered-Nurse/Indiana'
              },
              {
                name: 'Eskenazi Health',
                value: '$41.62/hr avg',
                source: 'Indeed (Indianapolis)',
                url: 'https://www.indeed.com/cmp/Eskenazi-Health/salaries/Registered-Nurse/Indianapolis-IN'
              },
              {
                name: 'Independent Hospitals',
                value: 'Market est. $34-44/hr',
                source: 'BLS + Reddit',
                note: 'Estimate when system-level data is unavailable'
              }
            ]
          },
        factors: [
          { text: 'Major academic medical center (IU Health)', type: 'positive' },
          { text: 'High demand for ICU/ED/OR specialties', type: 'positive' },
          { text: 'Strong nurse residency programs', type: 'positive' },
          { text: 'Competitive multi-system market', type: 'neutral' },
          { text: 'Higher cost of living for Indiana', type: 'negative' }
        ]
      },
      {
        name: 'Fort Wayne',
        size: 'medium',
        population: '420K',
        competition: 'medium',
        hospitals: [
          { name: 'Parkview Regional Medical Center', system: 'Parkview Health', score: 90, beds: 700, reviews: 4.3 },
          { name: 'Parkview Hospital Randallia', system: 'Parkview Health', score: 85, beds: 160, reviews: 4.0 },
          { name: 'Parkview Ortho Hospital', system: 'Parkview Health', score: 87, beds: 37, reviews: 4.4 },
          { name: 'Lutheran Hospital', system: 'Lutheran Health Network', score: 86, beds: 396, reviews: 4.0 },
          { name: 'Lutheran Hospital Downtown', system: 'Lutheran Health Network', score: 83, beds: 140, reviews: 3.8 },
          { name: 'Dupont Hospital', system: 'Lutheran Health Network', score: 84, beds: 131, reviews: 4.1 },
          { name: 'Parkview Wabash Hospital', system: 'Parkview Health', score: 79, beds: 25, reviews: 3.9 },
          { name: 'Parkview Whitley Hospital', system: 'Parkview Health', score: 80, beds: 30, reviews: 4.0 },
          { name: 'Parkview Huntington Hospital', system: 'Parkview Health', score: 79, beds: 36, reviews: 3.8 },
          { name: 'Parkview DeKalb Hospital', system: 'Parkview Health', score: 81, beds: 50, reviews: 4.0 },
          { name: 'Parkview LaGrange Hospital', system: 'Parkview Health', score: 78, beds: 25, reviews: 3.7 },
          { name: 'Parkview Noble Hospital', system: 'Parkview Health', score: 79, beds: 31, reviews: 3.8 },
          { name: 'Kosciusko Community Hospital', system: 'Lutheran Health Network', score: 80, beds: 72, reviews: 3.9 },
          { name: 'Bluffton Regional Medical Center', system: 'Lutheran Health Network', score: 78, beds: 79, reviews: 3.7 }
        ],
        systems: [
          { name: 'Parkview Health', facilities: 10, marketShare: '55%' },
          { name: 'Lutheran Health Network', facilities: 5, marketShare: '35%' },
          { name: 'Independent', facilities: 2, marketShare: '10%' }
        ],
          salary: {
            staffRN: '$28-40/hr',
            travelRN: '$1,900-2,500/wk',
            signOn: '$8-18K',
            systems: [
              {
                name: 'Parkview Health',
                value: '$34.42/hr avg',
                source: 'Indeed (Fort Wayne)',
                url: 'https://www.indeed.com/cmp/Parkview-Health-3/salaries/Registered-Nurse/Fort-Wayne-IN'
              },
              {
                name: 'Lutheran Health Network',
                value: '$38.40/hr avg',
                source: 'Indeed (IN)',
                url: 'https://www.indeed.com/cmp/Lutheran-Health-Network-of-Indiana/salaries/Registered-Nurse/Indiana'
              },
              {
                name: 'Independent',
                value: 'Market est. $30-38/hr',
                source: 'BLS + Reddit',
                note: 'Estimate for non-system facilities'
              }
            ]
          },
        factors: [
          { text: 'Parkview dominates market with excellent benefits', type: 'positive' },
          { text: 'Growing regional healthcare hub', type: 'positive' },
          { text: 'Lower cost of living than Indianapolis', type: 'positive' },
          { text: 'Strong community hospital culture', type: 'positive' },
          { text: 'Less specialty career options', type: 'neutral' }
        ]
      },
      {
        name: 'Evansville',
        size: 'medium',
        population: '315K',
        competition: 'medium',
        hospitals: [
          { name: 'Deaconess Midtown Hospital', system: 'Deaconess Health', score: 88, beds: 476, reviews: 4.1 },
          { name: 'Deaconess Gateway Hospital', system: 'Deaconess Health', score: 86, beds: 192, reviews: 4.0 },
          { name: 'Deaconess Gibson General Hospital', system: 'Deaconess Health', score: 79, beds: 70, reviews: 3.8 },
          { name: 'The Women\'s Hospital', system: 'Deaconess Health', score: 87, beds: 74, reviews: 4.3 },
          { name: 'Ascension St. Vincent Evansville', system: 'Ascension St. Vincent', score: 85, beds: 342, reviews: 3.9 },
          { name: 'Good Samaritan Hospital', system: 'Good Samaritan', score: 80, beds: 161, reviews: 3.7 },
          { name: 'Daviess Community Hospital', system: 'Daviess Community', score: 77, beds: 42, reviews: 3.6 },
          { name: 'Memorial Hospital Jasper', system: 'Memorial Hospital Jasper', score: 79, beds: 63, reviews: 3.8 },
          { name: 'Perry County Memorial Hospital', system: 'Perry County Memorial', score: 75, beds: 25, reviews: 3.5 }
        ],
        systems: [
          { name: 'Deaconess Health System', facilities: 5, marketShare: '60%' },
          { name: 'Ascension St. Vincent', facilities: 1, marketShare: '25%' },
          { name: 'Independent Regional', facilities: 4, marketShare: '15%' }
        ],
          salary: {
            staffRN: '$27-38/hr',
            travelRN: '$1,800-2,400/wk',
            signOn: '$7-15K',
            systems: [
              {
                name: 'Deaconess Health System',
                value: '$39.76/hr avg',
                source: 'Indeed (Evansville)',
                url: 'https://www.indeed.com/cmp/Deaconess-Health-System/salaries/Registered-Nurse/Evansville-IN'
              },
              {
                name: 'Ascension St. Vincent',
                value: '$39.96/hr avg',
                source: 'Indeed (IN)',
                url: 'https://www.indeed.com/cmp/Ascension/salaries/Registered-Nurse/Indiana'
              },
              {
                name: 'Independent Regional',
                value: 'Market est. $29-36/hr',
                source: 'BLS + Reddit',
                note: 'Estimate for independent facilities'
              }
            ]
          },
        factors: [
          { text: 'Tri-state regional healthcare hub (IN/KY/IL)', type: 'positive' },
          { text: 'Very affordable housing market', type: 'positive' },
          { text: 'Deaconess offers strong benefits package', type: 'positive' },
          { text: 'Limited Level I trauma coverage', type: 'neutral' },
          { text: 'Rural areas have chronic shortages', type: 'neutral' }
        ]
      },
      {
        name: 'South Bend-Elkhart',
        size: 'medium',
        population: '325K',
        competition: 'medium',
        hospitals: [
          { name: 'Memorial Hospital of South Bend', system: 'Beacon Health System', score: 87, beds: 537, reviews: 4.0 },
          { name: 'Elkhart General Hospital', system: 'Beacon Health System', score: 84, beds: 263, reviews: 3.9 },
          { name: 'St. Joseph Regional Medical Center', system: 'Trinity Health', score: 85, beds: 254, reviews: 3.8 },
          { name: 'Goshen Health', system: 'Goshen Health', score: 82, beds: 123, reviews: 4.0 }
        ],
        systems: [
          { name: 'Beacon Health System', facilities: 2, marketShare: '50%' },
          { name: 'Trinity Health', facilities: 1, marketShare: '30%' },
          { name: 'Goshen Health', facilities: 1, marketShare: '15%' }
        ],
          salary: {
            staffRN: '$28-39/hr',
            travelRN: '$1,850-2,500/wk',
            signOn: '$8-16K',
            systems: [
              {
                name: 'Beacon Health System',
                value: '$38.50/hr avg',
                source: 'Indeed (South Bend)',
                url: 'https://www.indeed.com/cmp/Beacon-Health-System/salaries/Registered-Nurse/South-Bend-IN'
              },
              {
                name: 'Trinity Health',
                value: '$37.68/hr avg',
                source: 'Indeed (IN)',
                url: 'https://www.indeed.com/cmp/Trinity-Health/salaries/Registered-Nurse/Indiana'
              },
              {
                name: 'Goshen Health',
                value: 'Market est. $30-38/hr',
                source: 'BLS + Reddit',
                note: 'Estimate where job-board ranges are limited'
              }
            ]
          },
        factors: [
          { text: 'Notre Dame University community', type: 'positive' },
          { text: 'Access to Michigan job market', type: 'positive' },
          { text: 'Growing Beacon Health system', type: 'positive' },
          { text: 'Seasonal lake-effect weather', type: 'negative' }
        ]
      },
      {
        name: 'Northwest Indiana',
        size: 'medium',
        population: '775K',
        competition: 'high',
        hospitals: [
          { name: 'Franciscan Health Hammond', system: 'Franciscan Health', score: 85, beds: 402, reviews: 3.9 },
          { name: 'Franciscan Health Crown Point', system: 'Franciscan Health', score: 86, beds: 254, reviews: 4.0 },
          { name: 'Franciscan Health Dyer', system: 'Franciscan Health', score: 84, beds: 215, reviews: 3.9 },
          { name: 'Franciscan Health Michigan City', system: 'Franciscan Health', score: 82, beds: 171, reviews: 3.8 },
          { name: 'Franciscan Health Munster', system: 'Franciscan Health', score: 83, beds: 32, reviews: 4.0 },
          { name: 'Methodist Hospitals Northlake', system: 'Methodist Hospitals', score: 83, beds: 186, reviews: 3.8 },
          { name: 'Methodist Hospitals Southlake', system: 'Methodist Hospitals', score: 81, beds: 151, reviews: 3.7 },
          { name: 'St. Catherine Hospital', system: 'Community Healthcare System', score: 82, beds: 189, reviews: 3.8 },
          { name: 'St. Mary Medical Center', system: 'Community Healthcare System', score: 83, beds: 195, reviews: 3.9 },
          { name: 'Porter Regional Hospital', system: 'Northwest Health', score: 81, beds: 276, reviews: 3.7 },
          { name: 'LaPorte Hospital', system: 'Northwest Health', score: 79, beds: 153, reviews: 3.6 }
        ],
        systems: [
          { name: 'Franciscan Health', facilities: 5, marketShare: '45%' },
          { name: 'Community Healthcare System', facilities: 2, marketShare: '20%' },
          { name: 'Methodist Hospitals', facilities: 2, marketShare: '15%' },
          { name: 'Northwest Health', facilities: 2, marketShare: '15%' }
        ],
          salary: {
            staffRN: '$30-42/hr',
            travelRN: '$2,000-2,600/wk',
            signOn: '$8-18K',
            systems: [
              {
                name: 'Franciscan Health',
                value: '$35.81/hr avg',
                source: 'Indeed (Munster)',
                url: 'https://www.indeed.com/cmp/Franciscan-Health-21c7906f/salaries/Registered-Nurse/Munster-IN'
              },
              {
                name: 'Community Healthcare System',
                value: '$41.51/hr avg',
                source: 'Indeed (IN)',
                url: 'https://www.indeed.com/cmp/Community-Healthcare-System-4/salaries/Registered-Nurse/Indiana'
              },
              {
                name: 'Methodist Hospitals',
                value: '$37.03/hr avg',
                source: 'Indeed (IN)',
                url: 'https://www.indeed.com/cmp/Methodist-Hospitals-1/salaries/Registered-Nurse/Indiana'
              },
              {
                name: 'Northwest Health',
                value: '$38.80/hr avg',
                source: 'Indeed (IN)',
                url: 'https://www.indeed.com/cmp/Northwest-Health-Porter/salaries/Registered-Nurse/Indiana'
              }
            ]
          },
        factors: [
          { text: 'Chicago metro spillover demand', type: 'positive' },
          { text: 'Higher wages due to Illinois competition', type: 'positive' },
          { text: 'Strong union presence (SEIU)', type: 'neutral' },
          { text: 'Urban challenges in Gary/Hammond', type: 'negative' },
          { text: 'Commute options to Chicago hospitals', type: 'positive' }
        ]
      },
      {
        name: 'Bloomington',
        size: 'small',
        population: '175K',
        competition: 'low',
        hospitals: [
          { name: 'IU Health Bloomington Hospital', system: 'IU Health', score: 86, beds: 275, reviews: 4.2 },
          { name: 'IU Health Bedford Hospital', system: 'IU Health', score: 77, beds: 25, reviews: 3.7 },
          { name: 'IU Health Paoli Hospital', system: 'IU Health', score: 76, beds: 25, reviews: 3.6 }
        ],
        systems: [
          { name: 'IU Health', facilities: 3, marketShare: '95%' }
        ],
          salary: {
            staffRN: '$27-37/hr',
            travelRN: '$1,700-2,300/wk',
            signOn: '$6-12K',
            systems: [
              {
                name: 'IU Health',
                value: '$37.42/hr avg',
                source: 'Indeed (IN)',
                url: 'https://www.indeed.com/cmp/Indiana-University-Health/salaries/Registered-Nurse/Indiana'
              }
            ]
          },
        factors: [
          { text: 'Indiana University campus culture', type: 'positive' },
          { text: 'Close connection to IU School of Nursing', type: 'positive' },
          { text: 'Single system dominance', type: 'neutral' },
          { text: 'Limited specialty positions', type: 'negative' }
        ]
      },
      {
        name: 'Lafayette',
        size: 'small',
        population: '230K',
        competition: 'low',
        hospitals: [
          { name: 'IU Health Arnett Hospital', system: 'IU Health', score: 84, beds: 191, reviews: 4.0 },
          { name: 'Franciscan Health Lafayette East', system: 'Franciscan Health', score: 82, beds: 168, reviews: 3.9 },
          { name: 'Franciscan Health Crawfordsville', system: 'Franciscan Health', score: 78, beds: 42, reviews: 3.7 },
          { name: 'Franciscan Health Rensselaer', system: 'Franciscan Health', score: 76, beds: 25, reviews: 3.6 },
          { name: 'IU Health White Memorial Hospital', system: 'IU Health', score: 75, beds: 25, reviews: 3.5 }
        ],
        systems: [
          { name: 'IU Health', facilities: 2, marketShare: '50%' },
          { name: 'Franciscan Health', facilities: 3, marketShare: '45%' }
        ],
          salary: {
            staffRN: '$26-36/hr',
            travelRN: '$1,650-2,200/wk',
            signOn: '$5-12K',
            systems: [
              {
                name: 'IU Health',
                value: '$37.42/hr avg',
                source: 'Indeed (IN)',
                url: 'https://www.indeed.com/cmp/Indiana-University-Health/salaries/Registered-Nurse/Indiana'
              },
              {
                name: 'Franciscan Health',
                value: '$34.94/hr avg',
                source: 'Indeed (IN)',
                url: 'https://www.indeed.com/cmp/Franciscan-Health-21c7906f/salaries/Registered-Nurse/Indiana'
              }
            ]
          },
        factors: [
          { text: 'Purdue University community', type: 'positive' },
          { text: 'Growing tech sector jobs', type: 'positive' },
          { text: 'Two-system competition', type: 'positive' },
          { text: 'Smaller facility sizes', type: 'neutral' }
        ]
      },
      {
        name: 'Terre Haute',
        size: 'small',
        population: '170K',
        competition: 'low',
        hospitals: [
          { name: 'Union Hospital', system: 'Union Health', score: 81, beds: 208, reviews: 3.8 },
          { name: 'Terre Haute Regional Hospital', system: 'HCA Healthcare', score: 78, beds: 175, reviews: 3.5 },
          { name: 'Union Hospital Clinton', system: 'Union Health', score: 75, beds: 25, reviews: 3.5 },
          { name: 'Sullivan County Community Hospital', system: 'Sullivan County', score: 73, beds: 25, reviews: 3.4 },
          { name: 'Greene County General Hospital', system: 'Greene County', score: 72, beds: 25, reviews: 3.3 }
        ],
        systems: [
          { name: 'Union Health', facilities: 2, marketShare: '50%' },
          { name: 'HCA Healthcare', facilities: 1, marketShare: '40%' },
          { name: 'Independent', facilities: 2, marketShare: '10%' }
        ],
          salary: {
            staffRN: '$25-34/hr',
            travelRN: '$1,600-2,100/wk',
            signOn: '$5-10K',
            systems: [
              {
                name: 'Union Health',
                value: 'Market est. $28-35/hr',
                source: 'BLS + Reddit',
                note: 'Estimate where job-board ranges are limited'
              },
              {
                name: 'HCA Healthcare',
                value: 'Market est. $28-36/hr',
                source: 'BLS + Reddit',
                note: 'Estimate where job-board ranges are limited'
              },
              {
                name: 'Independent',
                value: 'Market est. $26-33/hr',
                source: 'BLS + Reddit',
                note: 'Estimate for non-system facilities'
              }
            ]
          },
        factors: [
          { text: 'Very affordable cost of living', type: 'positive' },
          { text: 'Indiana State University', type: 'positive' },
          { text: 'Rural healthcare needs', type: 'neutral' },
          { text: 'Limited career advancement', type: 'negative' },
          { text: 'Economic challenges in region', type: 'negative' }
        ]
      },
      {
        name: 'Muncie-Anderson',
        size: 'small',
        population: '185K',
        competition: 'low',
        hospitals: [
          { name: 'IU Health Ball Memorial Hospital', system: 'IU Health', score: 83, beds: 304, reviews: 3.9 },
          { name: 'IU Health Blackford Hospital', system: 'IU Health', score: 74, beds: 15, reviews: 3.5 },
          { name: 'IU Health Jay Hospital', system: 'IU Health', score: 75, beds: 25, reviews: 3.5 },
          { name: 'Ascension St. Vincent Anderson', system: 'Ascension St. Vincent', score: 80, beds: 141, reviews: 3.7 },
          { name: 'Community Hospital Anderson', system: 'Community Health Network', score: 79, beds: 202, reviews: 3.6 }
        ],
        systems: [
          { name: 'IU Health', facilities: 3, marketShare: '50%' },
          { name: 'Ascension St. Vincent', facilities: 1, marketShare: '25%' },
          { name: 'Community Health Network', facilities: 1, marketShare: '25%' }
        ],
          salary: {
            staffRN: '$25-34/hr',
            travelRN: '$1,550-2,050/wk',
            signOn: '$5-10K',
            systems: [
              {
                name: 'IU Health',
                value: '$37.42/hr avg',
                source: 'Indeed (IN)',
                url: 'https://www.indeed.com/cmp/Indiana-University-Health/salaries/Registered-Nurse/Indiana'
              },
              {
                name: 'Ascension St. Vincent',
                value: '$39.96/hr avg',
                source: 'Indeed (IN)',
                url: 'https://www.indeed.com/cmp/Ascension/salaries/Registered-Nurse/Indiana'
              },
              {
                name: 'Community Health Network',
                value: '$38.16/hr avg',
                source: 'Indeed (Anderson)',
                url: 'https://www.indeed.com/cmp/Community-Health-Network/salaries/Registered-Nurse/Anderson-IN'
              }
            ]
          },
        factors: [
          { text: 'Ball State University nursing program', type: 'positive' },
          { text: 'Lower cost of living', type: 'positive' },
          { text: 'Multi-system presence', type: 'neutral' },
          { text: 'Economic challenges in region', type: 'negative' }
        ]
      },
      {
        name: 'Kokomo-Marion',
        size: 'small',
        population: '145K',
        competition: 'low',
        hospitals: [
          { name: 'Ascension St. Vincent Kokomo', system: 'Ascension St. Vincent', score: 81, beds: 152, reviews: 3.8 },
          { name: 'Community Howard Regional Health', system: 'Community Health Network', score: 80, beds: 140, reviews: 3.7 },
          { name: 'Marion General Hospital', system: 'Marion Health', score: 78, beds: 109, reviews: 3.6 },
          { name: 'Logansport Memorial Hospital', system: 'Logansport Memorial', score: 76, beds: 70, reviews: 3.5 },
          { name: 'Dukes Memorial Hospital', system: 'Dukes Memorial', score: 74, beds: 25, reviews: 3.4 }
        ],
        systems: [
          { name: 'Ascension St. Vincent', facilities: 1, marketShare: '35%' },
          { name: 'Community Health Network', facilities: 1, marketShare: '30%' },
          { name: 'Independent', facilities: 3, marketShare: '35%' }
        ],
          salary: {
            staffRN: '$24-33/hr',
            travelRN: '$1,500-1,950/wk',
            signOn: '$4-8K',
            systems: [
              {
                name: 'Ascension St. Vincent',
                value: '$39.96/hr avg',
                source: 'Indeed (IN)',
                url: 'https://www.indeed.com/cmp/Ascension/salaries/Registered-Nurse/Indiana'
              },
              {
                name: 'Community Health Network',
                value: '$41.63/hr avg',
                source: 'Indeed (IN)',
                url: 'https://www.indeed.com/cmp/Community-Health-Network/salaries/Registered-Nurse/Indiana'
              },
              {
                name: 'Independent',
                value: 'Market est. $26-32/hr',
                source: 'BLS + Reddit',
                note: 'Estimate for independent facilities'
              }
            ]
          },
        factors: [
          { text: 'Strong community hospital culture', type: 'positive' },
          { text: 'Very affordable living', type: 'positive' },
          { text: 'IU Kokomo nursing program nearby', type: 'positive' },
          { text: 'Declining population', type: 'negative' },
          { text: 'Limited specialty opportunities', type: 'negative' }
        ]
      },
      {
        name: 'Columbus-Seymour',
        size: 'small',
        population: '130K',
        competition: 'low',
        hospitals: [
          { name: 'Columbus Regional Hospital', system: 'Columbus Regional', score: 84, beds: 225, reviews: 4.1 },
          { name: 'Schneck Medical Center', system: 'Schneck Medical', score: 82, beds: 93, reviews: 4.0 },
          { name: 'Decatur County Memorial Hospital', system: 'Decatur County Memorial', score: 78, beds: 83, reviews: 3.7 }
        ],
        systems: [
          { name: 'Columbus Regional Health', facilities: 1, marketShare: '60%' },
          { name: 'Schneck Medical Center', facilities: 1, marketShare: '25%' },
          { name: 'Independent', facilities: 1, marketShare: '15%' }
        ],
          salary: {
            staffRN: '$26-35/hr',
            travelRN: '$1,600-2,100/wk',
            signOn: '$5-10K',
            systems: [
              {
                name: 'Columbus Regional Health',
                value: 'Market est. $29-36/hr',
                source: 'BLS + Reddit',
                note: 'Estimate where job-board ranges are limited'
              },
              {
                name: 'Schneck Medical Center',
                value: 'Market est. $28-35/hr',
                source: 'BLS + Reddit',
                note: 'Estimate where job-board ranges are limited'
              },
              {
                name: 'Independent',
                value: 'Market est. $27-34/hr',
                source: 'BLS + Reddit',
                note: 'Estimate for non-system facilities'
              }
            ]
          },
        factors: [
          { text: 'Cummins Inc. corporate headquarters', type: 'positive' },
          { text: 'Strong local economy', type: 'positive' },
          { text: 'Community-focused hospitals', type: 'positive' },
          { text: 'Limited metro amenities', type: 'neutral' }
        ]
      },
      {
        name: 'Richmond-Connersville',
        size: 'small',
        population: '95K',
        competition: 'low',
        hospitals: [
          { name: 'Reid Health', system: 'Reid Health', score: 83, beds: 217, reviews: 4.0 },
          { name: 'Margaret Mary Health', system: 'Margaret Mary Health', score: 79, beds: 25, reviews: 3.8 }
        ],
        systems: [
          { name: 'Reid Health', facilities: 1, marketShare: '85%' },
          { name: 'Margaret Mary Health', facilities: 1, marketShare: '15%' }
        ],
          salary: {
            staffRN: '$25-33/hr',
            travelRN: '$1,550-2,000/wk',
            signOn: '$5-8K',
            systems: [
              {
                name: 'Reid Health',
                value: 'Market est. $28-34/hr',
                source: 'BLS + Reddit',
                note: 'Estimate where job-board ranges are limited'
              },
              {
                name: 'Margaret Mary Health',
                value: 'Market est. $27-33/hr',
                source: 'BLS + Reddit',
                note: 'Estimate where job-board ranges are limited'
              }
            ]
          },
        factors: [
          { text: 'Strong community hospital reputation', type: 'positive' },
          { text: 'Ohio border access', type: 'positive' },
          { text: 'Very affordable living', type: 'positive' },
          { text: 'Single dominant employer', type: 'neutral' },
          { text: 'Declining population', type: 'negative' }
        ]
      },
      {
        name: 'New Albany-Jeffersonville',
        size: 'small',
        population: '180K',
        competition: 'medium',
        hospitals: [
          { name: 'Baptist Health Floyd', system: 'Baptist Health', score: 85, beds: 236, reviews: 4.0 },
          { name: 'Clark Memorial Health', system: 'Clark Memorial', score: 82, beds: 180, reviews: 3.8 },
          { name: 'King\'s Daughters\' Health', system: 'King\'s Daughters\'', score: 80, beds: 75, reviews: 3.7 },
          { name: 'Harrison County Hospital', system: 'Harrison County', score: 76, beds: 25, reviews: 3.5 }
        ],
        systems: [
          { name: 'Baptist Health (Louisville)', facilities: 1, marketShare: '45%' },
          { name: 'Clark Memorial', facilities: 1, marketShare: '30%' },
          { name: 'Independent', facilities: 2, marketShare: '25%' }
        ],
          salary: {
            staffRN: '$28-38/hr',
            travelRN: '$1,800-2,400/wk',
            signOn: '$7-14K',
            systems: [
              {
                name: 'Baptist Health (Louisville)',
                value: '$34.44/hr avg',
                source: 'Indeed (IN)',
                url: 'https://www.indeed.com/cmp/Baptist-Health-System-Ky-%26-in/salaries/Registered-Nurse/Indiana'
              },
              {
                name: 'Clark Memorial',
                value: 'Market est. $30-38/hr',
                source: 'BLS + Reddit',
                note: 'Estimate where job-board ranges are limited'
              },
              {
                name: 'Independent',
                value: 'Market est. $29-36/hr',
                source: 'BLS + Reddit',
                note: 'Estimate for non-system facilities'
              }
            ]
          },
        factors: [
          { text: 'Louisville metro spillover demand', type: 'positive' },
          { text: 'Access to Kentucky job market', type: 'positive' },
          { text: 'Higher wages due to Louisville competition', type: 'positive' },
          { text: 'IU Southeast nursing program nearby', type: 'positive' }
        ]
      }
    ]
  },
  FL: {
    nursingEducation: {
      ufSystemPercentage: 22,
      stateCollegePercentage: 34,
      otherSchoolsPercentage: 44,
      totalGraduatesAnnual: 12500,
      retentionRate: 55
    },
    salaryMeta: {
      updatedAt: '2026-02-01',
      updateEveryDays: 7,
      breakdown: [
        { label: 'BLS Florida RN mean (May 2023)', value: '$37.66/hr • $78,330/yr', note: 'Statewide OEWS data' },
        { label: 'BLS Miami-Fort Lauderdale RN mean (May 2023)', value: '$39.52/hr • $82,200/yr', note: 'Metro OEWS data' },
        { label: 'Job board ranges (FL/metro)', value: '$32-44/hr typical', note: 'Company salary pages by system' }
      ],
      sources: [
        { name: 'BLS OEWS Florida RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_fl.htm' },
        { name: 'BLS OEWS Miami-Fort Lauderdale MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_33100.htm' },
        { name: 'BLS OEWS Tampa-St. Petersburg MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_45300.htm' }
      ]
    },
    metros: [
      {
        name: 'Miami',
        size: 'major',
        population: '6.1M',
        competition: 'high',
        hospitals: [
          { name: 'Jackson Memorial Hospital', system: 'Jackson Health System', score: 93, beds: 1547, reviews: 4.2 },
          { name: 'Baptist Hospital of Miami', system: 'Baptist Health South Florida', score: 92, beds: 728, reviews: 4.3 },
          { name: 'University of Miami Hospital', system: 'UHealth', score: 91, beds: 560, reviews: 4.1 },
          { name: 'Mount Sinai Medical Center', system: 'Mount Sinai', score: 89, beds: 672, reviews: 4.0 },
          { name: 'Aventura Hospital and Medical Center', system: 'HCA Healthcare', score: 86, beds: 407, reviews: 3.9 },
          { name: 'Memorial Regional Hospital', system: 'Memorial Healthcare System', score: 90, beds: 704, reviews: 4.2 },
          { name: 'Broward Health Medical Center', system: 'Broward Health', score: 87, beds: 716, reviews: 3.9 },
          { name: 'Holy Cross Hospital', system: 'Trinity Health', score: 85, beds: 571, reviews: 4.0 },
          { name: 'Cleveland Clinic Weston', system: 'Cleveland Clinic Florida', score: 90, beds: 206, reviews: 4.4 }
        ],
        systems: [
          { name: 'Baptist Health South Florida', facilities: 6, marketShare: '25%' },
          { name: 'Jackson Health System', facilities: 3, marketShare: '20%' },
          { name: 'Memorial Healthcare System', facilities: 4, marketShare: '15%' },
          { name: 'HCA Healthcare', facilities: 5, marketShare: '15%' },
          { name: 'Independent/Other', facilities: 6, marketShare: '25%' }
        ],
        salary: {
          staffRN: '$34-48/hr',
          travelRN: '$2,200-2,800/wk',
          signOn: '$8-20K',
          systems: [
            { name: 'Baptist Health South Florida', value: '$39-44/hr est', source: 'Job boards' },
            { name: 'Jackson Health System', value: '$37-43/hr est', source: 'Job boards' },
            { name: 'Memorial Healthcare System', value: '$38-44/hr est', source: 'Job boards' },
            { name: 'HCA Healthcare', value: '$35-42/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Massive diverse metro with high patient volume', type: 'positive' },
          { text: 'Year-round travel RN demand', type: 'positive' },
          { text: 'Bilingual (English/Spanish) strongly preferred', type: 'neutral' },
          { text: 'High cost of living relative to wages', type: 'negative' },
          { text: 'Seasonal population surge (snowbirds)', type: 'neutral' }
        ]
      },
      {
        name: 'Tampa',
        size: 'major',
        population: '3.2M',
        competition: 'high',
        hospitals: [
          { name: 'Tampa General Hospital', system: 'Tampa General', score: 92, beds: 1041, reviews: 4.2 },
          { name: 'AdventHealth Tampa', system: 'AdventHealth', score: 89, beds: 533, reviews: 4.1 },
          { name: 'St. Joseph\'s Hospital', system: 'BayCare Health System', score: 88, beds: 929, reviews: 4.0 },
          { name: 'Moffitt Cancer Center', system: 'Moffitt Cancer Center', score: 94, beds: 206, reviews: 4.5 },
          { name: 'James A. Haley Veterans Hospital', system: 'VA', score: 87, beds: 352, reviews: 4.0 },
          { name: 'Morton Plant Hospital', system: 'BayCare Health System', score: 86, beds: 687, reviews: 4.0 },
          { name: 'HCA Florida South Tampa Hospital', system: 'HCA Healthcare', score: 84, beds: 112, reviews: 3.8 }
        ],
        systems: [
          { name: 'BayCare Health System', facilities: 6, marketShare: '35%' },
          { name: 'AdventHealth', facilities: 3, marketShare: '20%' },
          { name: 'HCA Healthcare', facilities: 4, marketShare: '18%' },
          { name: 'Tampa General', facilities: 1, marketShare: '15%' },
          { name: 'Independent/Other', facilities: 3, marketShare: '12%' }
        ],
        salary: {
          staffRN: '$32-44/hr',
          travelRN: '$2,100-2,700/wk',
          signOn: '$8-18K',
          systems: [
            { name: 'BayCare Health System', value: '$36-42/hr est', source: 'Job boards' },
            { name: 'AdventHealth', value: '$35-41/hr est', source: 'Job boards' },
            { name: 'Tampa General Hospital', value: '$37-43/hr est', source: 'Job boards' },
            { name: 'HCA Healthcare', value: '$34-40/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Major academic and cancer center hub', type: 'positive' },
          { text: 'Rapid population growth driving demand', type: 'positive' },
          { text: 'Multiple competing systems', type: 'positive' },
          { text: 'Growing elderly population increases acuity', type: 'neutral' },
          { text: 'Hurricane season staffing challenges', type: 'negative' }
        ]
      },
      {
        name: 'Orlando',
        size: 'major',
        population: '2.7M',
        competition: 'high',
        hospitals: [
          { name: 'Orlando Health Orlando Regional Medical Center', system: 'Orlando Health', score: 91, beds: 808, reviews: 4.1 },
          { name: 'AdventHealth Orlando', system: 'AdventHealth', score: 90, beds: 1368, reviews: 4.2 },
          { name: 'Nemours Children\'s Hospital', system: 'Nemours', score: 92, beds: 130, reviews: 4.5 },
          { name: 'Orlando Health Dr. P. Phillips Hospital', system: 'Orlando Health', score: 87, beds: 237, reviews: 4.0 },
          { name: 'HCA Florida Osceola Hospital', system: 'HCA Healthcare', score: 83, beds: 340, reviews: 3.8 },
          { name: 'AdventHealth Celebration', system: 'AdventHealth', score: 85, beds: 239, reviews: 4.0 }
        ],
        systems: [
          { name: 'AdventHealth', facilities: 8, marketShare: '40%' },
          { name: 'Orlando Health', facilities: 6, marketShare: '30%' },
          { name: 'HCA Healthcare', facilities: 4, marketShare: '18%' },
          { name: 'Independent/Other', facilities: 3, marketShare: '12%' }
        ],
        salary: {
          staffRN: '$31-43/hr',
          travelRN: '$2,000-2,600/wk',
          signOn: '$7-16K',
          systems: [
            { name: 'AdventHealth', value: '$35-41/hr est', source: 'Job boards' },
            { name: 'Orlando Health', value: '$36-42/hr est', source: 'Job boards' },
            { name: 'HCA Healthcare', value: '$33-40/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Major tourism economy supports healthcare demand', type: 'positive' },
          { text: 'Rapid metro growth and expansion', type: 'positive' },
          { text: 'Two dominant systems competing for talent', type: 'positive' },
          { text: 'Seasonal tourist volume creates ER surges', type: 'neutral' },
          { text: 'Rising cost of living', type: 'negative' }
        ]
      },
      {
        name: 'Jacksonville',
        size: 'major',
        population: '1.6M',
        competition: 'high',
        hospitals: [
          { name: 'Mayo Clinic Jacksonville', system: 'Mayo Clinic', score: 95, beds: 304, reviews: 4.6 },
          { name: 'Baptist Medical Center Jacksonville', system: 'Baptist Health', score: 90, beds: 948, reviews: 4.1 },
          { name: 'UF Health Jacksonville', system: 'UF Health', score: 89, beds: 695, reviews: 4.0 },
          { name: 'Ascension St. Vincent\'s Medical Center', system: 'Ascension', score: 87, beds: 528, reviews: 4.0 },
          { name: 'Memorial Hospital Jacksonville', system: 'HCA Healthcare', score: 84, beds: 418, reviews: 3.8 },
          { name: 'Baptist Medical Center South', system: 'Baptist Health', score: 86, beds: 271, reviews: 4.0 }
        ],
        systems: [
          { name: 'Baptist Health', facilities: 5, marketShare: '35%' },
          { name: 'UF Health', facilities: 2, marketShare: '20%' },
          { name: 'Ascension', facilities: 2, marketShare: '15%' },
          { name: 'HCA Healthcare', facilities: 3, marketShare: '15%' },
          { name: 'Mayo Clinic / Other', facilities: 3, marketShare: '15%' }
        ],
        salary: {
          staffRN: '$32-44/hr',
          travelRN: '$2,100-2,700/wk',
          signOn: '$8-20K',
          systems: [
            { name: 'Baptist Health', value: '$36-42/hr est', source: 'Job boards' },
            { name: 'Mayo Clinic', value: '$40-48/hr est', source: 'Job boards' },
            { name: 'UF Health', value: '$35-41/hr est', source: 'Job boards' },
            { name: 'HCA Healthcare', value: '$34-40/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Mayo Clinic presence elevates market', type: 'positive' },
          { text: 'Military/veteran population (Naval Station Mayport)', type: 'positive' },
          { text: 'Affordable cost of living for Florida', type: 'positive' },
          { text: 'Growing metro with increasing demand', type: 'positive' },
          { text: 'Sprawling geography impacts commutes', type: 'neutral' }
        ]
      }
    ]
  },
  IL: {
    nursingEducation: {
      uicSystemPercentage: 18,
      communityCollegePercentage: 35,
      otherSchoolsPercentage: 47,
      totalGraduatesAnnual: 8200,
      retentionRate: 60
    },
    salaryMeta: {
      updatedAt: '2026-02-01',
      updateEveryDays: 7,
      breakdown: [
        { label: 'BLS Illinois RN mean (May 2023)', value: '$40.67/hr • $84,600/yr', note: 'Statewide OEWS data' },
        { label: 'BLS Chicago-Naperville-Elgin RN mean (May 2023)', value: '$42.89/hr • $89,210/yr', note: 'Metro OEWS data' },
        { label: 'Job board ranges (IL/metro)', value: '$34-50/hr typical', note: 'Company salary pages by system' }
      ],
      sources: [
        { name: 'BLS OEWS Illinois RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_il.htm' },
        { name: 'BLS OEWS Chicago-Naperville MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_16980.htm' },
        { name: 'BLS OEWS Springfield MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_44100.htm' }
      ]
    },
    metros: [
      {
        name: 'Chicago',
        size: 'major',
        population: '9.4M',
        competition: 'high',
        hospitals: [
          { name: 'Northwestern Memorial Hospital', system: 'Northwestern Medicine', score: 95, beds: 894, reviews: 4.4 },
          { name: 'Rush University Medical Center', system: 'Rush', score: 94, beds: 664, reviews: 4.3 },
          { name: 'University of Chicago Medical Center', system: 'UChicago Medicine', score: 93, beds: 811, reviews: 4.2 },
          { name: 'Advocate Christ Medical Center', system: 'Advocate Health', score: 91, beds: 749, reviews: 4.1 },
          { name: 'Lurie Children\'s Hospital', system: 'Northwestern Medicine', score: 94, beds: 360, reviews: 4.5 },
          { name: 'Loyola University Medical Center', system: 'Trinity Health/Loyola', score: 90, beds: 547, reviews: 4.1 },
          { name: 'Advocate Lutheran General Hospital', system: 'Advocate Health', score: 88, beds: 639, reviews: 4.0 },
          { name: 'Amita Health Resurrection Medical Center', system: 'Ascension', score: 84, beds: 409, reviews: 3.8 },
          { name: 'NorthShore University HealthSystem Evanston', system: 'NorthShore-Edward', score: 89, beds: 491, reviews: 4.1 },
          { name: 'Edward Hospital', system: 'NorthShore-Edward', score: 87, beds: 359, reviews: 4.2 }
        ],
        systems: [
          { name: 'Advocate Health', facilities: 12, marketShare: '25%' },
          { name: 'Northwestern Medicine', facilities: 6, marketShare: '20%' },
          { name: 'Ascension', facilities: 8, marketShare: '15%' },
          { name: 'NorthShore-Edward', facilities: 5, marketShare: '10%' },
          { name: 'UChicago Medicine / Other', facilities: 10, marketShare: '30%' }
        ],
        salary: {
          staffRN: '$36-52/hr',
          travelRN: '$2,400-3,100/wk',
          signOn: '$10-25K',
          systems: [
            { name: 'Northwestern Medicine', value: '$42-50/hr est', source: 'Job boards' },
            { name: 'Advocate Health', value: '$38-46/hr est', source: 'Job boards' },
            { name: 'Rush University Medical Center', value: '$40-48/hr est', source: 'Job boards' },
            { name: 'UChicago Medicine', value: '$41-49/hr est', source: 'Job boards' },
            { name: 'Ascension', value: '$36-43/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'World-class academic medical centers', type: 'positive' },
          { text: 'Strong union presence (SEIU, NNU)', type: 'neutral' },
          { text: 'Massive metro with diverse patient populations', type: 'positive' },
          { text: 'High cost of living in city core', type: 'negative' },
          { text: 'Excellent public transit access to hospitals', type: 'positive' },
          { text: 'Intense competition for specialty RNs', type: 'neutral' }
        ]
      },
      {
        name: 'Springfield',
        size: 'medium',
        population: '210K',
        competition: 'medium',
        hospitals: [
          { name: 'HSHS St. John\'s Hospital', system: 'HSHS', score: 87, beds: 432, reviews: 4.0 },
          { name: 'Memorial Medical Center', system: 'Memorial Health System', score: 88, beds: 500, reviews: 4.1 },
          { name: 'Springfield Memorial Hospital', system: 'Memorial Health System', score: 85, beds: 265, reviews: 3.9 },
          { name: 'Abraham Lincoln Memorial Hospital', system: 'Memorial Health System', score: 80, beds: 25, reviews: 3.7 }
        ],
        systems: [
          { name: 'Memorial Health System', facilities: 3, marketShare: '55%' },
          { name: 'HSHS', facilities: 1, marketShare: '35%' },
          { name: 'Independent', facilities: 1, marketShare: '10%' }
        ],
        salary: {
          staffRN: '$30-40/hr',
          travelRN: '$1,900-2,500/wk',
          signOn: '$7-15K',
          systems: [
            { name: 'Memorial Health System', value: '$34-40/hr est', source: 'Job boards' },
            { name: 'HSHS', value: '$33-39/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'State capital with stable government employment', type: 'positive' },
          { text: 'SIU School of Medicine pipeline', type: 'positive' },
          { text: 'Lower cost of living', type: 'positive' },
          { text: 'Two-system market with moderate competition', type: 'neutral' }
        ]
      },
      {
        name: 'Peoria',
        size: 'medium',
        population: '370K',
        competition: 'medium',
        hospitals: [
          { name: 'OSF Saint Francis Medical Center', system: 'OSF HealthCare', score: 89, beds: 616, reviews: 4.1 },
          { name: 'UnityPoint Health - Methodist', system: 'UnityPoint Health', score: 87, beds: 353, reviews: 4.0 },
          { name: 'UnityPoint Health - Proctor', system: 'UnityPoint Health', score: 84, beds: 186, reviews: 3.9 },
          { name: 'OSF Saint Francis Children\'s Hospital', system: 'OSF HealthCare', score: 90, beds: 136, reviews: 4.3 }
        ],
        systems: [
          { name: 'OSF HealthCare', facilities: 3, marketShare: '50%' },
          { name: 'UnityPoint Health', facilities: 3, marketShare: '40%' },
          { name: 'Independent', facilities: 1, marketShare: '10%' }
        ],
        salary: {
          staffRN: '$29-39/hr',
          travelRN: '$1,850-2,400/wk',
          signOn: '$6-14K',
          systems: [
            { name: 'OSF HealthCare', value: '$33-39/hr est', source: 'Job boards' },
            { name: 'UnityPoint Health', value: '$32-38/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'UICOMP medical campus (Level I trauma)', type: 'positive' },
          { text: 'Two strong competing health systems', type: 'positive' },
          { text: 'Affordable cost of living', type: 'positive' },
          { text: 'Declining regional population', type: 'negative' },
          { text: 'Moderate specialty opportunities', type: 'neutral' }
        ]
      }
    ]
  },
  MI: {
    nursingEducation: {
      umSystemPercentage: 20,
      communityCollegePercentage: 30,
      otherSchoolsPercentage: 50,
      totalGraduatesAnnual: 6500,
      retentionRate: 62
    },
    salaryMeta: {
      updatedAt: '2026-02-01',
      updateEveryDays: 7,
      breakdown: [
        { label: 'BLS Michigan RN mean (May 2023)', value: '$40.22/hr • $83,650/yr', note: 'Statewide OEWS data' },
        { label: 'BLS Detroit-Warren-Dearborn RN mean (May 2023)', value: '$42.15/hr • $87,670/yr', note: 'Metro OEWS data' },
        { label: 'Job board ranges (MI/metro)', value: '$33-46/hr typical', note: 'Company salary pages by system' }
      ],
      sources: [
        { name: 'BLS OEWS Michigan RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_mi.htm' },
        { name: 'BLS OEWS Detroit-Warren MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_19820.htm' },
        { name: 'BLS OEWS Ann Arbor MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_11460.htm' }
      ]
    },
    metros: [
      {
        name: 'Detroit',
        size: 'major',
        population: '4.3M',
        competition: 'high',
        hospitals: [
          { name: 'Beaumont Hospital Royal Oak', system: 'Corewell Health', score: 92, beds: 1070, reviews: 4.2 },
          { name: 'Henry Ford Hospital', system: 'Henry Ford Health', score: 91, beds: 877, reviews: 4.1 },
          { name: 'DMC Harper University Hospital', system: 'Tenet/DMC', score: 87, beds: 421, reviews: 3.9 },
          { name: 'DMC Detroit Receiving Hospital', system: 'Tenet/DMC', score: 85, beds: 237, reviews: 3.8 },
          { name: 'Ascension Providence Rochester', system: 'Ascension', score: 86, beds: 518, reviews: 4.0 },
          { name: 'Beaumont Hospital Dearborn', system: 'Corewell Health', score: 88, beds: 632, reviews: 4.0 },
          { name: 'Henry Ford Macomb Hospital', system: 'Henry Ford Health', score: 86, beds: 349, reviews: 4.0 },
          { name: 'Beaumont Hospital Troy', system: 'Corewell Health', score: 89, beds: 520, reviews: 4.1 },
          { name: 'Ascension St. John Hospital', system: 'Ascension', score: 85, beds: 612, reviews: 3.9 }
        ],
        systems: [
          { name: 'Corewell Health (Beaumont)', facilities: 8, marketShare: '30%' },
          { name: 'Henry Ford Health', facilities: 6, marketShare: '25%' },
          { name: 'Ascension Michigan', facilities: 5, marketShare: '15%' },
          { name: 'Tenet/DMC', facilities: 4, marketShare: '15%' },
          { name: 'Trinity Health / Other', facilities: 4, marketShare: '15%' }
        ],
        salary: {
          staffRN: '$34-47/hr',
          travelRN: '$2,200-2,900/wk',
          signOn: '$10-22K',
          systems: [
            { name: 'Corewell Health', value: '$39-45/hr est', source: 'Job boards' },
            { name: 'Henry Ford Health', value: '$38-44/hr est', source: 'Job boards' },
            { name: 'Tenet/DMC', value: '$35-42/hr est', source: 'Job boards' },
            { name: 'Ascension Michigan', value: '$36-43/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Large metro with multiple major health systems', type: 'positive' },
          { text: 'Strong union presence (MNA, SEIU)', type: 'neutral' },
          { text: 'High demand for ED and trauma nurses', type: 'positive' },
          { text: 'Significant sign-on bonuses market-wide', type: 'positive' },
          { text: 'Urban core safety concerns for some facilities', type: 'negative' }
        ]
      },
      {
        name: 'Grand Rapids',
        size: 'medium',
        population: '1.1M',
        competition: 'medium',
        hospitals: [
          { name: 'Corewell Health Butterworth Hospital', system: 'Corewell Health', score: 91, beds: 875, reviews: 4.2 },
          { name: 'Corewell Health Blodgett Hospital', system: 'Corewell Health', score: 88, beds: 400, reviews: 4.1 },
          { name: 'Trinity Health Saint Mary\'s', system: 'Trinity Health', score: 86, beds: 344, reviews: 4.0 },
          { name: 'Mary Free Bed Rehabilitation Hospital', system: 'Mary Free Bed', score: 89, beds: 167, reviews: 4.3 },
          { name: 'Holland Hospital', system: 'Holland Hospital', score: 84, beds: 189, reviews: 4.0 }
        ],
        systems: [
          { name: 'Corewell Health', facilities: 5, marketShare: '55%' },
          { name: 'Trinity Health', facilities: 2, marketShare: '25%' },
          { name: 'Independent', facilities: 3, marketShare: '20%' }
        ],
        salary: {
          staffRN: '$31-43/hr',
          travelRN: '$2,000-2,600/wk',
          signOn: '$8-18K',
          systems: [
            { name: 'Corewell Health', value: '$36-43/hr est', source: 'Job boards' },
            { name: 'Trinity Health', value: '$34-41/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Growing West Michigan economy', type: 'positive' },
          { text: 'Corewell Health is dominant employer', type: 'neutral' },
          { text: 'Strong community hospital culture', type: 'positive' },
          { text: 'Lower cost of living than Detroit', type: 'positive' },
          { text: 'Growing medical research presence', type: 'positive' }
        ]
      },
      {
        name: 'Ann Arbor',
        size: 'medium',
        population: '370K',
        competition: 'high',
        hospitals: [
          { name: 'Michigan Medicine University Hospital', system: 'Michigan Medicine', score: 95, beds: 1000, reviews: 4.4 },
          { name: 'C.S. Mott Children\'s Hospital', system: 'Michigan Medicine', score: 95, beds: 348, reviews: 4.6 },
          { name: 'Michigan Medicine Cardiovascular Center', system: 'Michigan Medicine', score: 93, beds: 120, reviews: 4.4 },
          { name: 'VA Ann Arbor Healthcare System', system: 'VA', score: 86, beds: 146, reviews: 4.0 },
          { name: 'Trinity Health Ann Arbor', system: 'Trinity Health', score: 85, beds: 537, reviews: 3.9 }
        ],
        systems: [
          { name: 'Michigan Medicine (U-M)', facilities: 4, marketShare: '65%' },
          { name: 'Trinity Health', facilities: 1, marketShare: '20%' },
          { name: 'VA / Other', facilities: 2, marketShare: '15%' }
        ],
        salary: {
          staffRN: '$35-48/hr',
          travelRN: '$2,300-2,900/wk',
          signOn: '$10-20K',
          systems: [
            { name: 'Michigan Medicine', value: '$40-48/hr est', source: 'Job boards' },
            { name: 'Trinity Health', value: '$35-42/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Top-ranked academic medical center (U-M)', type: 'positive' },
          { text: 'Excellent research and specialty opportunities', type: 'positive' },
          { text: 'Strong nurse residency programs', type: 'positive' },
          { text: 'Higher cost of living for Michigan', type: 'negative' },
          { text: 'Single dominant employer limits negotiation', type: 'neutral' }
        ]
      }
    ]
  },
  NY: {
    nursingEducation: {
      sunySystemPercentage: 25,
      cunyCityPercentage: 18,
      otherSchoolsPercentage: 57,
      totalGraduatesAnnual: 14000,
      retentionRate: 56
    },
    salaryMeta: {
      updatedAt: '2026-02-01',
      updateEveryDays: 7,
      breakdown: [
        { label: 'BLS New York RN mean (May 2023)', value: '$51.65/hr • $107,440/yr', note: 'Statewide OEWS data' },
        { label: 'BLS New York-Newark-Jersey City RN mean (May 2023)', value: '$55.19/hr • $114,790/yr', note: 'Metro OEWS data' },
        { label: 'Job board ranges (NY/metro)', value: '$42-65/hr typical', note: 'Company salary pages by system' }
      ],
      sources: [
        { name: 'BLS OEWS New York RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_ny.htm' },
        { name: 'BLS OEWS New York-Newark MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_35620.htm' },
        { name: 'BLS OEWS Buffalo-Cheektowaga MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_15380.htm' }
      ]
    },
    metros: [
      {
        name: 'New York City',
        size: 'major',
        population: '8.3M',
        competition: 'high',
        hospitals: [
          { name: 'NYU Langone Health', system: 'NYU Langone', score: 95, beds: 1069, reviews: 4.4 },
          { name: 'NewYork-Presbyterian/Columbia', system: 'NewYork-Presbyterian', score: 95, beds: 745, reviews: 4.3 },
          { name: 'NewYork-Presbyterian/Weill Cornell', system: 'NewYork-Presbyterian', score: 94, beds: 862, reviews: 4.3 },
          { name: 'Mount Sinai Hospital', system: 'Mount Sinai Health System', score: 93, beds: 1134, reviews: 4.2 },
          { name: 'Memorial Sloan Kettering Cancer Center', system: 'MSK', score: 95, beds: 514, reviews: 4.5 },
          { name: 'Hospital for Special Surgery', system: 'HSS', score: 94, beds: 215, reviews: 4.5 },
          { name: 'Montefiore Medical Center', system: 'Montefiore', score: 90, beds: 1491, reviews: 4.0 },
          { name: 'NYC Health + Hospitals/Bellevue', system: 'NYC H+H', score: 87, beds: 844, reviews: 3.9 },
          { name: 'Northwell Health Lenox Hill Hospital', system: 'Northwell Health', score: 88, beds: 450, reviews: 4.0 },
          { name: 'Maimonides Medical Center', system: 'Maimonides', score: 85, beds: 711, reviews: 3.8 }
        ],
        systems: [
          { name: 'NewYork-Presbyterian', facilities: 6, marketShare: '18%' },
          { name: 'Northwell Health', facilities: 8, marketShare: '15%' },
          { name: 'Mount Sinai Health System', facilities: 7, marketShare: '14%' },
          { name: 'NYC Health + Hospitals', facilities: 11, marketShare: '15%' },
          { name: 'NYU Langone / Other', facilities: 12, marketShare: '38%' }
        ],
        salary: {
          staffRN: '$45-68/hr',
          travelRN: '$2,800-3,800/wk',
          signOn: '$10-25K',
          systems: [
            { name: 'NYU Langone', value: '$52-62/hr est', source: 'Job boards' },
            { name: 'NewYork-Presbyterian', value: '$50-60/hr est', source: 'Job boards' },
            { name: 'Mount Sinai', value: '$48-58/hr est', source: 'Job boards' },
            { name: 'Northwell Health', value: '$46-56/hr est', source: 'Job boards' },
            { name: 'NYC Health + Hospitals', value: '$50-65/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Highest-paying RN market in the US', type: 'positive' },
          { text: 'World-renowned academic medical centers', type: 'positive' },
          { text: 'Strong union protections (NYSNA)', type: 'positive' },
          { text: 'Extremely high cost of living', type: 'negative' },
          { text: 'Safe staffing ratio legislation improving conditions', type: 'positive' },
          { text: 'Intense competition for specialty and Magnet roles', type: 'neutral' }
        ]
      },
      {
        name: 'Buffalo',
        size: 'medium',
        population: '1.2M',
        competition: 'medium',
        hospitals: [
          { name: 'Kaleida Health Buffalo General Medical Center', system: 'Kaleida Health', score: 88, beds: 437, reviews: 4.0 },
          { name: 'Roswell Park Comprehensive Cancer Center', system: 'Roswell Park', score: 93, beds: 133, reviews: 4.4 },
          { name: 'ECMC (Erie County Medical Center)', system: 'ECMC', score: 85, beds: 573, reviews: 3.9 },
          { name: 'Kaleida Health Millard Fillmore Suburban', system: 'Kaleida Health', score: 84, beds: 310, reviews: 3.9 },
          { name: 'Catholic Health Mercy Hospital', system: 'Catholic Health', score: 83, beds: 438, reviews: 3.8 },
          { name: 'Catholic Health Sisters of Charity Hospital', system: 'Catholic Health', score: 82, beds: 267, reviews: 3.7 }
        ],
        systems: [
          { name: 'Kaleida Health', facilities: 4, marketShare: '35%' },
          { name: 'Catholic Health', facilities: 4, marketShare: '30%' },
          { name: 'ECMC', facilities: 1, marketShare: '15%' },
          { name: 'Independent/Other', facilities: 3, marketShare: '20%' }
        ],
        salary: {
          staffRN: '$35-48/hr',
          travelRN: '$2,200-2,800/wk',
          signOn: '$8-18K',
          systems: [
            { name: 'Kaleida Health', value: '$38-46/hr est', source: 'Job boards' },
            { name: 'Catholic Health', value: '$36-44/hr est', source: 'Job boards' },
            { name: 'ECMC', value: '$37-45/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'NCI-designated cancer center (Roswell Park)', type: 'positive' },
          { text: 'Affordable cost of living for New York', type: 'positive' },
          { text: 'Strong union presence (CWA, NYSNA)', type: 'neutral' },
          { text: 'Canadian border proximity adds unique patient mix', type: 'neutral' },
          { text: 'Harsh winter weather impacts commutes', type: 'negative' }
        ]
      },
      {
        name: 'Rochester',
        size: 'medium',
        population: '1.1M',
        competition: 'medium',
        hospitals: [
          { name: 'Strong Memorial Hospital', system: 'UR Medicine', score: 92, beds: 886, reviews: 4.2 },
          { name: 'Rochester General Hospital', system: 'Rochester Regional Health', score: 88, beds: 528, reviews: 4.0 },
          { name: 'Highland Hospital', system: 'UR Medicine', score: 86, beds: 261, reviews: 4.1 },
          { name: 'Unity Hospital', system: 'Rochester Regional Health', score: 84, beds: 287, reviews: 3.9 },
          { name: 'Golisano Children\'s Hospital', system: 'UR Medicine', score: 91, beds: 142, reviews: 4.4 }
        ],
        systems: [
          { name: 'UR Medicine', facilities: 5, marketShare: '50%' },
          { name: 'Rochester Regional Health', facilities: 4, marketShare: '40%' },
          { name: 'Independent', facilities: 2, marketShare: '10%' }
        ],
        salary: {
          staffRN: '$34-47/hr',
          travelRN: '$2,100-2,700/wk',
          signOn: '$8-16K',
          systems: [
            { name: 'UR Medicine', value: '$38-46/hr est', source: 'Job boards' },
            { name: 'Rochester Regional Health', value: '$36-44/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Strong academic medical center (U of R)', type: 'positive' },
          { text: 'Two-system market with healthy competition', type: 'positive' },
          { text: 'Affordable cost of living for New York', type: 'positive' },
          { text: 'Robust pediatric and specialty programs', type: 'positive' },
          { text: 'Winter weather challenges', type: 'negative' }
        ]
      }
    ]
  },
  TX: {
    nursingEducation: {
      utSystemPercentage: 20,
      communityCollegePercentage: 32,
      otherSchoolsPercentage: 48,
      totalGraduatesAnnual: 16000,
      retentionRate: 58
    },
    salaryMeta: {
      updatedAt: '2026-02-01',
      updateEveryDays: 7,
      breakdown: [
        { label: 'BLS Texas RN mean (May 2023)', value: '$40.69/hr • $84,630/yr', note: 'Statewide OEWS data' },
        { label: 'BLS Houston-The Woodlands RN mean (May 2023)', value: '$42.33/hr • $88,050/yr', note: 'Metro OEWS data' },
        { label: 'Job board ranges (TX/metro)', value: '$33-48/hr typical', note: 'Company salary pages by system' }
      ],
      sources: [
        { name: 'BLS OEWS Texas RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_tx.htm' },
        { name: 'BLS OEWS Houston-The Woodlands MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_26420.htm' },
        { name: 'BLS OEWS Dallas-Fort Worth MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_19100.htm' }
      ]
    },
    metros: [
      {
        name: 'Houston',
        size: 'major',
        population: '7.1M',
        competition: 'high',
        hospitals: [
          { name: 'Houston Methodist Hospital', system: 'Houston Methodist', score: 95, beds: 907, reviews: 4.4 },
          { name: 'Memorial Hermann-Texas Medical Center', system: 'Memorial Hermann', score: 93, beds: 1052, reviews: 4.2 },
          { name: 'MD Anderson Cancer Center', system: 'UT MD Anderson', score: 95, beds: 654, reviews: 4.5 },
          { name: 'Texas Children\'s Hospital', system: 'Texas Children\'s', score: 95, beds: 973, reviews: 4.5 },
          { name: 'Ben Taub Hospital', system: 'Harris Health', score: 86, beds: 586, reviews: 3.9 },
          { name: 'St. Luke\'s Health - Baylor St. Luke\'s Medical Center', system: 'CommonSpirit Health', score: 89, beds: 881, reviews: 4.0 },
          { name: 'HCA Houston Healthcare Clear Lake', system: 'HCA Healthcare', score: 84, beds: 525, reviews: 3.8 },
          { name: 'Memorial Hermann The Woodlands', system: 'Memorial Hermann', score: 88, beds: 400, reviews: 4.1 },
          { name: 'Houston Methodist Willowbrook', system: 'Houston Methodist', score: 87, beds: 312, reviews: 4.1 }
        ],
        systems: [
          { name: 'Memorial Hermann', facilities: 10, marketShare: '25%' },
          { name: 'Houston Methodist', facilities: 7, marketShare: '20%' },
          { name: 'HCA Healthcare', facilities: 8, marketShare: '18%' },
          { name: 'Harris Health (safety net)', facilities: 3, marketShare: '10%' },
          { name: 'Texas Children\'s / MD Anderson / Other', facilities: 8, marketShare: '27%' }
        ],
        salary: {
          staffRN: '$34-48/hr',
          travelRN: '$2,300-3,000/wk',
          signOn: '$10-25K',
          systems: [
            { name: 'Houston Methodist', value: '$40-48/hr est', source: 'Job boards' },
            { name: 'Memorial Hermann', value: '$38-46/hr est', source: 'Job boards' },
            { name: 'MD Anderson', value: '$42-50/hr est', source: 'Job boards' },
            { name: 'Texas Children\'s', value: '$39-47/hr est', source: 'Job boards' },
            { name: 'HCA Healthcare', value: '$34-42/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Texas Medical Center is world\'s largest medical complex', type: 'positive' },
          { text: 'Massive and diverse job market', type: 'positive' },
          { text: 'No state income tax boosts take-home pay', type: 'positive' },
          { text: 'High demand for oncology, peds, and trauma RNs', type: 'positive' },
          { text: 'Sprawling metro with long commute times', type: 'negative' },
          { text: 'Hurricane season staffing challenges', type: 'neutral' }
        ]
      },
      {
        name: 'Dallas-Fort Worth',
        size: 'major',
        population: '7.6M',
        competition: 'high',
        hospitals: [
          { name: 'UT Southwestern Medical Center', system: 'UT Southwestern', score: 94, beds: 740, reviews: 4.3 },
          { name: 'Baylor University Medical Center', system: 'Baylor Scott & White', score: 93, beds: 903, reviews: 4.2 },
          { name: 'Parkland Memorial Hospital', system: 'Parkland Health', score: 90, beds: 862, reviews: 4.0 },
          { name: 'Texas Health Presbyterian Dallas', system: 'Texas Health Resources', score: 88, beds: 850, reviews: 4.0 },
          { name: 'Medical City Dallas', system: 'HCA Healthcare', score: 87, beds: 661, reviews: 4.0 },
          { name: 'JPS Health Network', system: 'JPS Health', score: 86, beds: 537, reviews: 3.9 },
          { name: 'Cook Children\'s Medical Center', system: 'Cook Children\'s', score: 92, beds: 443, reviews: 4.4 },
          { name: 'Children\'s Medical Center Dallas', system: 'Children\'s Health', score: 93, beds: 490, reviews: 4.4 },
          { name: 'Baylor Scott & White All Saints - Fort Worth', system: 'Baylor Scott & White', score: 85, beds: 538, reviews: 3.9 }
        ],
        systems: [
          { name: 'Baylor Scott & White', facilities: 10, marketShare: '22%' },
          { name: 'Texas Health Resources', facilities: 14, marketShare: '20%' },
          { name: 'HCA Healthcare', facilities: 12, marketShare: '20%' },
          { name: 'UT Southwestern', facilities: 2, marketShare: '10%' },
          { name: 'Parkland / Other', facilities: 8, marketShare: '28%' }
        ],
        salary: {
          staffRN: '$34-48/hr',
          travelRN: '$2,200-2,900/wk',
          signOn: '$10-22K',
          systems: [
            { name: 'Baylor Scott & White', value: '$38-46/hr est', source: 'Job boards' },
            { name: 'Texas Health Resources', value: '$37-44/hr est', source: 'Job boards' },
            { name: 'UT Southwestern', value: '$40-48/hr est', source: 'Job boards' },
            { name: 'HCA Healthcare', value: '$34-42/hr est', source: 'Job boards' },
            { name: 'Parkland Health', value: '$38-45/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Massive and rapidly growing metro', type: 'positive' },
          { text: 'Multiple competing systems drive wage competition', type: 'positive' },
          { text: 'No state income tax', type: 'positive' },
          { text: 'Strong academic medicine presence', type: 'positive' },
          { text: 'Extreme commute distances across DFW', type: 'negative' },
          { text: 'Corporate relocations driving population growth', type: 'neutral' }
        ]
      },
      {
        name: 'San Antonio',
        size: 'major',
        population: '2.6M',
        competition: 'high',
        hospitals: [
          { name: 'Methodist Hospital San Antonio', system: 'Methodist Healthcare', score: 90, beds: 1536, reviews: 4.1 },
          { name: 'University Hospital San Antonio', system: 'University Health', score: 89, beds: 716, reviews: 4.0 },
          { name: 'Baptist Medical Center San Antonio', system: 'Tenet Healthcare', score: 86, beds: 1577, reviews: 3.9 },
          { name: 'CHRISTUS Santa Rosa Hospital Medical Center', system: 'CHRISTUS Health', score: 85, beds: 433, reviews: 3.9 },
          { name: 'Brooke Army Medical Center (BAMC)', system: 'Military', score: 91, beds: 450, reviews: 4.2 },
          { name: 'Methodist Children\'s Hospital', system: 'Methodist Healthcare', score: 88, beds: 213, reviews: 4.2 }
        ],
        systems: [
          { name: 'Methodist Healthcare (HCA)', facilities: 6, marketShare: '30%' },
          { name: 'Tenet Healthcare', facilities: 4, marketShare: '20%' },
          { name: 'University Health', facilities: 2, marketShare: '18%' },
          { name: 'CHRISTUS Health', facilities: 3, marketShare: '12%' },
          { name: 'Military / Other', facilities: 4, marketShare: '20%' }
        ],
        salary: {
          staffRN: '$32-44/hr',
          travelRN: '$2,100-2,700/wk',
          signOn: '$8-18K',
          systems: [
            { name: 'Methodist Healthcare', value: '$36-43/hr est', source: 'Job boards' },
            { name: 'Tenet Healthcare', value: '$34-41/hr est', source: 'Job boards' },
            { name: 'University Health', value: '$37-44/hr est', source: 'Job boards' },
            { name: 'CHRISTUS Health', value: '$34-41/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Major military healthcare hub (BAMC, Lackland)', type: 'positive' },
          { text: 'Affordable cost of living for large metro', type: 'positive' },
          { text: 'UT Health San Antonio academic pipeline', type: 'positive' },
          { text: 'Growing demand from aging population', type: 'positive' },
          { text: 'Bilingual (English/Spanish) preferred', type: 'neutral' }
        ]
      },
      {
        name: 'Austin',
        size: 'major',
        population: '2.3M',
        competition: 'high',
        hospitals: [
          { name: 'Ascension Seton Medical Center', system: 'Ascension', score: 89, beds: 458, reviews: 4.1 },
          { name: 'Dell Seton Medical Center at UT', system: 'Ascension', score: 91, beds: 211, reviews: 4.2 },
          { name: 'St. David\'s Medical Center', system: 'HCA Healthcare', score: 88, beds: 350, reviews: 4.0 },
          { name: 'St. David\'s North Austin Medical Center', system: 'HCA Healthcare', score: 86, beds: 396, reviews: 3.9 },
          { name: 'Dell Children\'s Medical Center', system: 'Ascension', score: 90, beds: 248, reviews: 4.3 },
          { name: 'Baylor Scott & White Medical Center - Round Rock', system: 'Baylor Scott & White', score: 85, beds: 300, reviews: 4.0 },
          { name: 'St. David\'s South Austin Medical Center', system: 'HCA Healthcare', score: 84, beds: 282, reviews: 3.8 }
        ],
        systems: [
          { name: 'HCA Healthcare (St. David\'s)', facilities: 6, marketShare: '40%' },
          { name: 'Ascension (Seton)', facilities: 4, marketShare: '30%' },
          { name: 'Baylor Scott & White', facilities: 2, marketShare: '15%' },
          { name: 'Independent/Other', facilities: 3, marketShare: '15%' }
        ],
        salary: {
          staffRN: '$33-46/hr',
          travelRN: '$2,200-2,800/wk',
          signOn: '$8-20K',
          systems: [
            { name: 'HCA Healthcare (St. David\'s)', value: '$36-44/hr est', source: 'Job boards' },
            { name: 'Ascension (Seton)', value: '$37-45/hr est', source: 'Job boards' },
            { name: 'Baylor Scott & White', value: '$35-43/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Fastest-growing major metro in Texas', type: 'positive' },
          { text: 'Dell Medical School expanding academic medicine', type: 'positive' },
          { text: 'No state income tax', type: 'positive' },
          { text: 'Rising cost of living challenging affordability', type: 'negative' },
          { text: 'Tech industry driving healthcare benefit competition', type: 'neutral' },
          { text: 'Rapidly expanding suburban hospital capacity', type: 'positive' }
        ]
      }
    ]
  },
  // Kentucky data from KY_DETAILS
  KY: KY_DETAILS.KY
};

let currentHomeStateMetro = null;

const renderHomeState = async (stateAbbrev) => {
  await loadStateBeaconData();
  await ensureProgramsDataForBeacon();

  const entry = getBeaconEntry(stateAbbrev);
  const programsInState = nursingPrograms.filter((program) => normalizeProgram(program).state === stateAbbrev);
  const metroData = STATE_METRO_DATA[stateAbbrev] || STATE_METRO_DATA.IN;
  const metros = metroData?.metros || [];

  // Update header
  if (homeStateName) homeStateName.textContent = entry.name;
  if (homeStateAbbr) homeStateAbbr.textContent = stateAbbrev;

  // Update stats
  const totalHospitals = metros.reduce((sum, m) => sum + (m.hospitals?.length || 0), 0);
  if (homeStateStatHospitals) homeStateStatHospitals.textContent = totalHospitals || '--';
  if (homeStateStatMetros) homeStateStatMetros.textContent = metros.length || '--';
  if (homeStateStatPrograms) homeStateStatPrograms.textContent = programsInState.length || '--';
  if (homeStateStatCompact) homeStateStatCompact.textContent = entry.compact ? 'Yes' : 'No';

  // Render metro cards
  if (homeStateMetroMap) {
    homeStateMetroMap.innerHTML = metros.map((metro, idx) => `
      <div class="metro-city-card" data-metro-index="${idx}">
        <div class="metro-city-icon ${metro.size}">
          ${metro.size === 'major' ? '🏙️' : metro.size === 'medium' ? '🏘️' : '🏠'}
        </div>
        <div class="metro-city-info">
          <div class="metro-city-name">${escapeHtml(metro.name)}</div>
          <div class="metro-city-meta">${escapeHtml(metro.population)} • ${metro.hospitals?.length || 0} hospitals</div>
        </div>
        <div class="metro-city-indicator ${metro.competition}"></div>
      </div>
    `).join('');

    // Add click handlers
    homeStateMetroMap.querySelectorAll('.metro-city-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.metroIndex, 10);
        selectHomeStateMetro(metros[idx], stateAbbrev);
        homeStateMetroMap.querySelectorAll('.metro-city-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
    });
  }

  // Reset detail panel to placeholder
  currentHomeStateMetro = null;
  if (homeStateDetailPlaceholder) homeStateDetailPlaceholder.style.display = 'flex';
  if (homeStateDetailContent) homeStateDetailContent.style.display = 'none';
};

const selectHomeStateMetro = (metro, stateAbbrev) => {
  currentHomeStateMetro = metro;

  // Show detail content, hide placeholder
  if (homeStateDetailPlaceholder) homeStateDetailPlaceholder.style.display = 'none';
  if (homeStateDetailContent) homeStateDetailContent.style.display = 'block';

  // Update header
  if (homeStateMetroName) homeStateMetroName.textContent = metro.name;
  if (homeStateMetroBadge) {
    const badgeText = metro.size === 'major' ? 'Major Metro' : metro.size === 'medium' ? 'Regional Hub' : 'Small Market';
    homeStateMetroBadge.textContent = badgeText;
  }

  // Render hospitals
  const hospitals = metro.hospitals || [];
  if (homeStateHospitalCount) homeStateHospitalCount.textContent = `${hospitals.length} facilities`;
  if (homeStateMetroHospitals) {
    homeStateMetroHospitals.innerHTML = hospitals.map((h, idx) => `
      <div class="hospital-card">
        <div class="hospital-rank">${idx + 1}</div>
        <div class="hospital-info">
          <div class="hospital-name">${escapeHtml(h.name)}</div>
          <div class="hospital-details">
            <span>${escapeHtml(h.system)}</span>
            <span>${h.beds} beds</span>
            <span>⭐ ${h.reviews}</span>
          </div>
        </div>
        <div class="hospital-score">
          <span class="score-value">${h.score}</span>
          <span class="score-label">Score</span>
        </div>
      </div>
    `).join('');
  }

  // Render competition/systems
  const systems = metro.systems || [];
  if (homeStateMetroCompetition) {
    homeStateMetroCompetition.innerHTML = systems.map(s => `
      <div class="competition-card">
        <div class="competition-name">${escapeHtml(s.name)}</div>
        <div class="competition-details">${s.facilities} facilities • ${escapeHtml(s.marketShare)} market share</div>
      </div>
    `).join('');
  }

  // Render salary data
  const metroData = STATE_METRO_DATA[stateAbbrev] || STATE_METRO_DATA.IN;
  const salaryMeta = metroData?.salaryMeta || {};
  const salary = metro.salary || {};
  const breakdown = Array.isArray(salary.breakdown)
    ? salary.breakdown
    : Array.isArray(salaryMeta.breakdown)
      ? salaryMeta.breakdown
      : [];
  const sources = Array.isArray(salary.sources)
    ? salary.sources.filter((src) => src && src.name && src.url)
    : Array.isArray(salaryMeta.sources)
      ? salaryMeta.sources.filter((src) => src && src.name && src.url)
      : [];
  const salarySystems = Array.isArray(salary.systems) ? salary.systems : [];
  const updatedAtRaw = salary.updatedAt || salaryMeta.updatedAt || null;
  const updateEveryDays = Number(salary.updateEveryDays || salaryMeta.updateEveryDays || 7);
  const updatedAt = updatedAtRaw ? new Date(updatedAtRaw) : null;
  const updatedAtValid = updatedAt && !Number.isNaN(updatedAt.getTime());
  const daysMs = 24 * 60 * 60 * 1000;
  const isStale = updatedAtValid && (Date.now() - updatedAt.getTime() > updateEveryDays * daysMs);
  const updatedLabel = updatedAtValid
    ? updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;
  const nextUpdateLabel = updatedAtValid
    ? new Date(updatedAt.getTime() + updateEveryDays * daysMs)
      .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  if (homeStateMetroSalary) {
    const breakdownSectionHtml = breakdown.length
      ? `
        <div class="salary-breakdown-section">
          <div class="salary-breakdown-subtitle">Market benchmarks</div>
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
      `
      : '';
    const systemsSectionHtml = salarySystems.length
      ? `
        <div class="salary-breakdown-section">
          <div class="salary-breakdown-subtitle">Major systems (est.)</div>
          <div class="salary-system-grid">
            ${salarySystems.map((item) => `
              <div class="salary-system-item">
                <div class="salary-system-name">${escapeHtml(item.name || '--')}</div>
                <div class="salary-system-value">${escapeHtml(item.value || '--')}</div>
                ${item.source && item.url ? `
                  <a class="salary-system-source" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
                    ${escapeHtml(item.source)}
                  </a>
                ` : item.source ? `<div class="salary-system-source">${escapeHtml(item.source)}</div>` : ''}
                ${item.note ? `<div class="salary-system-note">${escapeHtml(item.note)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `
      : '';
    const refreshHtml = updatedAtValid
      ? `
        <div class="salary-breakdown-refresh ${isStale ? 'stale' : ''}">
          <span>Updated ${escapeHtml(updatedLabel)}</span>
          ${nextUpdateLabel ? `<span>Next refresh: ${escapeHtml(nextUpdateLabel)}</span>` : ''}
          ${isStale ? '<span class="refresh-flag">Update due</span>' : ''}
        </div>
      `
      : '';
    const sourcesHtml = sources.length
      ? `
        <div class="salary-breakdown-sources">
          <span class="salary-breakdown-sources-label">Sources:</span>
          ${sources.map((src, idx) => `
            <a href="${escapeHtml(src.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(src.name)}</a>${idx < sources.length - 1 ? '<span class="source-sep">•</span>' : ''}
          `).join('')}
        </div>
      `
      : '';
    const breakdownHtml = (breakdownSectionHtml || systemsSectionHtml || refreshHtml || sourcesHtml)
      ? `
        <div class="salary-breakdown">
          <div class="salary-breakdown-title">Estimated salary breakdown</div>
          ${breakdownSectionHtml}
          ${systemsSectionHtml}
          ${refreshHtml}
          ${sourcesHtml}
        </div>
      `
      : '';

    homeStateMetroSalary.innerHTML = `
      <div class="salary-card">
        <div class="salary-value">${escapeHtml(salary.staffRN || '--')}</div>
        <div class="salary-label">Staff RN Hourly</div>
      </div>
      <div class="salary-card">
        <div class="salary-value">${escapeHtml(salary.travelRN || '--')}</div>
        <div class="salary-label">Travel RN Weekly</div>
      </div>
      <div class="salary-card">
        <div class="salary-value">${escapeHtml(salary.signOn || '--')}</div>
        <div class="salary-label">Sign-On Bonus</div>
      </div>
      ${breakdownHtml}
    `;
  }

  // Render factors
  const factors = metro.factors || [];
  if (homeStateMetroFactors) {
    homeStateMetroFactors.innerHTML = factors.map(f => `
      <span class="factor-tag ${f.type}">${escapeHtml(f.text)}</span>
    `).join('');
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

// =============================================================================
// TARGET STATE MODULE (Kentucky Pilot)
// =============================================================================

const targetStateModal = document.getElementById('target-state-modal');
const targetStateCloseBtn = document.getElementById('target-state-close');
const targetStateCloseFooter = document.getElementById('target-state-close-footer');
const targetStateOpenBeacon = document.getElementById('target-state-open-beacon');
const openTargetStateBtn = document.getElementById('open-target-state');
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
const masterExportProgressBar = document.getElementById('master-export-progress-bar');
const masterExportProgressLabel = document.getElementById('master-export-progress-label');
const targetStateExportToggle = document.getElementById('target-state-export-toggle');
const targetStateExportMenu = document.getElementById('target-state-export-menu');

// Target State module elements
const targetStateName = document.getElementById('target-state-name');
const targetStateAbbr = document.getElementById('target-state-abbr');
const targetStateStatHospitals = document.getElementById('target-state-stat-hospitals');
const targetStateStatMetros = document.getElementById('target-state-stat-metros');
const targetStateStatPrograms = document.getElementById('target-state-stat-programs');
const targetStateStatCompact = document.getElementById('target-state-stat-compact');
const targetStateMetroMap = document.getElementById('target-state-metro-map');
const targetStateDetailPlaceholder = document.getElementById('target-state-detail-placeholder');
const targetStateDetailContent = document.getElementById('target-state-detail-content');
const targetStateMetroName = document.getElementById('target-state-metro-name');
const targetStateMetroBadge = document.getElementById('target-state-metro-badge');
const targetStateHospitalCount = document.getElementById('target-state-hospital-count');
const targetStateMetroHospitals = document.getElementById('target-state-metro-hospitals');
const targetStateMetroCompetition = document.getElementById('target-state-metro-competition');
const targetStateMetroSalary = document.getElementById('target-state-metro-salary');
const targetStateMetroFactors = document.getElementById('target-state-metro-factors');

let currentTargetStateMetro = null;
const TARGET_STATE_DEFAULT = 'KY'; // Kentucky as pilot

const renderTargetState = async (stateAbbrev = TARGET_STATE_DEFAULT) => {
  await loadStateBeaconData();
  await ensureProgramsDataForBeacon();

  const entry = getBeaconEntry(stateAbbrev);
  const programsInState = nursingPrograms.filter((program) => normalizeProgram(program).state === stateAbbrev);
  const metroData = STATE_METRO_DATA[stateAbbrev] || STATE_METRO_DATA.KY;
  const metros = metroData?.metros || [];

  // Update header
  if (targetStateName) targetStateName.textContent = entry.name;
  if (targetStateAbbr) targetStateAbbr.textContent = stateAbbrev;

  // Update stats
  const totalHospitals = metros.reduce((sum, m) => sum + (m.hospitals?.length || 0), 0);
  if (targetStateStatHospitals) targetStateStatHospitals.textContent = totalHospitals || '--';
  if (targetStateStatMetros) targetStateStatMetros.textContent = metros.length || '--';
  if (targetStateStatPrograms) targetStateStatPrograms.textContent = programsInState.length || '--';
  if (targetStateStatCompact) targetStateStatCompact.textContent = entry.compact ? 'Yes' : 'No';

  // Render metro cards
  if (targetStateMetroMap) {
    targetStateMetroMap.innerHTML = metros.map((metro, idx) => `
      <div class="metro-city-card" data-metro-index="${idx}">
        <div class="metro-city-icon ${metro.size}">
          ${metro.size === 'major' ? '🏙️' : metro.size === 'medium' ? '🏘️' : '🏠'}
        </div>
        <div class="metro-city-info">
          <div class="metro-city-name">${escapeHtml(metro.name)}</div>
          <div class="metro-city-meta">${escapeHtml(metro.population)} • ${metro.hospitals?.length || 0} hospitals</div>
        </div>
        <div class="metro-city-indicator ${metro.competition}"></div>
      </div>
    `).join('');

    // Add click handlers
    targetStateMetroMap.querySelectorAll('.metro-city-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.metroIndex, 10);
        selectTargetStateMetro(metros[idx], stateAbbrev);
        targetStateMetroMap.querySelectorAll('.metro-city-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
    });
  }

  // Reset detail panel to placeholder
  currentTargetStateMetro = null;
  if (targetStateDetailPlaceholder) targetStateDetailPlaceholder.style.display = 'flex';
  if (targetStateDetailContent) targetStateDetailContent.style.display = 'none';
};

const selectTargetStateMetro = (metro, stateAbbrev) => {
  currentTargetStateMetro = metro;

  // Show detail content, hide placeholder
  if (targetStateDetailPlaceholder) targetStateDetailPlaceholder.style.display = 'none';
  if (targetStateDetailContent) targetStateDetailContent.style.display = 'block';

  // Update header
  if (targetStateMetroName) targetStateMetroName.textContent = metro.name;
  if (targetStateMetroBadge) {
    const badgeText = metro.size === 'major' ? 'Major Metro' : metro.size === 'medium' ? 'Regional Hub' : 'Small Market';
    targetStateMetroBadge.textContent = badgeText;
  }

  // Render hospitals
  const hospitals = metro.hospitals || [];
  if (targetStateHospitalCount) targetStateHospitalCount.textContent = `${hospitals.length} facilities`;
  if (targetStateMetroHospitals) {
    targetStateMetroHospitals.innerHTML = hospitals.map((h, idx) => `
      <div class="hospital-card">
        <div class="hospital-rank">${idx + 1}</div>
        <div class="hospital-info">
          <div class="hospital-name">${escapeHtml(h.name)}</div>
          <div class="hospital-details">
            <span>${escapeHtml(h.system)}</span>
            <span>${h.beds} beds</span>
            <span>⭐ ${h.reviews}</span>
          </div>
        </div>
        <div class="hospital-score">
          <span class="score-value">${h.score}</span>
          <span class="score-label">Score</span>
        </div>
      </div>
    `).join('');
  }

  // Render competition/systems
  const systems = metro.systems || [];
  if (targetStateMetroCompetition) {
    targetStateMetroCompetition.innerHTML = systems.map(s => `
      <div class="competition-card">
        <div class="competition-name">${escapeHtml(s.name)}</div>
        <div class="competition-details">${s.facilities} facilities • ${escapeHtml(s.marketShare)} market share</div>
      </div>
    `).join('');
  }

  // Render salary data
  const metroData = STATE_METRO_DATA[stateAbbrev] || STATE_METRO_DATA.KY;
  const salaryMeta = metroData?.salaryMeta || {};
  const salary = metro.salary || {};
  const breakdown = Array.isArray(salary.breakdown)
    ? salary.breakdown
    : Array.isArray(salaryMeta.breakdown)
      ? salaryMeta.breakdown
      : [];
  const sources = Array.isArray(salary.sources)
    ? salary.sources.filter((src) => src && src.name && src.url)
    : Array.isArray(salaryMeta.sources)
      ? salaryMeta.sources.filter((src) => src && src.name && src.url)
      : [];
  const salarySystems = Array.isArray(salary.systems) ? salary.systems : [];
  const updatedAtRaw = salary.updatedAt || salaryMeta.updatedAt || null;
  const updateEveryDays = Number(salary.updateEveryDays || salaryMeta.updateEveryDays || 7);
  const updatedAt = updatedAtRaw ? new Date(updatedAtRaw) : null;
  const updatedAtValid = updatedAt && !Number.isNaN(updatedAt.getTime());
  const daysMs = 24 * 60 * 60 * 1000;
  const isStale = updatedAtValid && (Date.now() - updatedAt.getTime() > updateEveryDays * daysMs);
  const updatedLabel = updatedAtValid
    ? updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;
  const nextUpdateLabel = updatedAtValid
    ? new Date(updatedAt.getTime() + updateEveryDays * daysMs)
      .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  if (targetStateMetroSalary) {
    const breakdownSectionHtml = breakdown.length
      ? `
        <div class="salary-breakdown-section">
          <div class="salary-breakdown-subtitle">Market benchmarks</div>
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
      `
      : '';
    const systemsSectionHtml = salarySystems.length
      ? `
        <div class="salary-breakdown-section">
          <div class="salary-breakdown-subtitle">Major systems (est.)</div>
          <div class="salary-system-grid">
            ${salarySystems.map((item) => `
              <div class="salary-system-item">
                <div class="salary-system-name">${escapeHtml(item.name || '--')}</div>
                <div class="salary-system-value">${escapeHtml(item.value || '--')}</div>
                ${item.source && item.url ? `
                  <a class="salary-system-source" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
                    ${escapeHtml(item.source)}
                  </a>
                ` : item.source ? `<div class="salary-system-source">${escapeHtml(item.source)}</div>` : ''}
                ${item.note ? `<div class="salary-system-note">${escapeHtml(item.note)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `
      : '';
    const refreshHtml = updatedAtValid
      ? `
        <div class="salary-breakdown-refresh ${isStale ? 'stale' : ''}">
          <span>Updated ${escapeHtml(updatedLabel)}</span>
          ${nextUpdateLabel ? `<span>Next refresh: ${escapeHtml(nextUpdateLabel)}</span>` : ''}
          ${isStale ? '<span class="refresh-flag">Update due</span>' : ''}
        </div>
      `
      : '';
    const sourcesHtml = sources.length
      ? `
        <div class="salary-breakdown-sources">
          <span class="salary-breakdown-sources-label">Sources:</span>
          ${sources.map((src, idx) => `
            <a href="${escapeHtml(src.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(src.name)}</a>${idx < sources.length - 1 ? '<span class="source-sep">•</span>' : ''}
          `).join('')}
        </div>
      `
      : '';
    const breakdownHtml = (breakdownSectionHtml || systemsSectionHtml || refreshHtml || sourcesHtml)
      ? `
        <div class="salary-breakdown">
          <div class="salary-breakdown-title">Estimated salary breakdown</div>
          ${breakdownSectionHtml}
          ${systemsSectionHtml}
          ${refreshHtml}
          ${sourcesHtml}
        </div>
      `
      : '';

    targetStateMetroSalary.innerHTML = `
      <div class="salary-card">
        <div class="salary-value">${escapeHtml(salary.staffRN || '--')}</div>
        <div class="salary-label">Staff RN Hourly</div>
      </div>
      <div class="salary-card">
        <div class="salary-value">${escapeHtml(salary.travelRN || '--')}</div>
        <div class="salary-label">Travel RN Weekly</div>
      </div>
      <div class="salary-card">
        <div class="salary-value">${escapeHtml(salary.signOn || '--')}</div>
        <div class="salary-label">Sign-On Bonus</div>
      </div>
      ${breakdownHtml}
    `;
  }

  // Render factors
  const factors = metro.factors || [];
  if (targetStateMetroFactors) {
    targetStateMetroFactors.innerHTML = factors.map(f => `
      <span class="factor-tag ${f.type}">${escapeHtml(f.text)}</span>
    `).join('');
  }
};

const openTargetState = async () => {
  // Use the map's selected target state, then the dropdown value, then the default
  const state = getMapTargetState() || targetStateSelect?.value || TARGET_STATE_DEFAULT;
  // Sync the dropdown to reflect the active state
  if (targetStateSelect) targetStateSelect.value = state;
  await renderTargetState(state);
  targetStateModal?.classList.add('active');
};

const closeTargetState = () => targetStateModal?.classList.remove('active');

// =============================================================================
// END TARGET STATE MODULE
// =============================================================================

const buildHomeStateExport = (state) => {
  const entry = getBeaconEntry(state);
  const notices = getStateNotices(state);
  const majorNotices = filterNoticesByMajorSystems(notices, entry.warnMajorSystems);
  const programsInState = nursingPrograms.filter((program) => normalizeProgram(program).state === state);
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

const buildTargetStateExport = (stateAbbrev, options = {}) => {
  const { scope = 'all' } = options;
  const entry = getBeaconEntry(stateAbbrev);
  const programsInState = nursingPrograms.filter((program) => normalizeProgram(program).state === stateAbbrev);
  const metroData = STATE_METRO_DATA[stateAbbrev] || STATE_METRO_DATA.KY;
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
      const detail = [metro.population, `${metro.hospitals?.length || 0} hospitals`, metro.competition].filter(Boolean).join(' ??? ');
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
      .join(' • ');
    pushRow('Selected Metro Hospitals', hospital.name, detail);
  });

  (metro.systems || []).forEach((system) => {
    const detail = [system.marketShare, `${system.facilities} facilities`].filter(Boolean).join(' • ');
    pushRow('Selected Metro Systems', system.name, detail);
  });

  if (metro.salary) {
    pushRow('Selected Metro Salary', 'Staff RN Hourly', metro.salary.staffRN || '--');
    pushRow('Selected Metro Salary', 'Travel RN Weekly', metro.salary.travelRN || '--');
    pushRow('Selected Metro Salary', 'Sign-On Bonus', metro.salary.signOn || '--');
    (metro.salary.breakdown || []).forEach((item) => {
      const detail = [item.value, item.note].filter(Boolean).join(' • ');
      pushRow('Selected Metro Salary Breakdown', item.label || 'Benchmark', detail);
    });
  }

  (metro.factors || []).forEach((factor) => {
    pushRow('Selected Metro Factors', factor.text, factor.type || '');
  });

  return rows;
};

const exportTargetState = async ({ format = 'csv', scope = 'all' } = {}) => {
  const state = targetStateSelect?.value || TARGET_STATE_DEFAULT;
  if (scope === 'selected' && !currentTargetStateMetro) {
    showExportToast('Select a metro to export.');
    return;
  }
  await loadStateBeaconData();
  await ensureProgramsDataForBeacon();
  const data = buildTargetStateExport(state, { scope });
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
  const entry = getBeaconEntry(state);
  const notices = getStateNotices(state);
  const majorNotices = filterNoticesByMajorSystems(notices, entry.warnMajorSystems);
  const { best, worst } = buildHospitalRank(majorNotices, entry.warnMajorSystems);
  const competitionSystems = entry.competition?.systems?.length
    ? entry.competition.systems
    : Array.from(groupBy(majorNotices, (n) => n.parent_system || n.employer_name || n.employerName).entries())
      .map(([name, items]) => ({ name, presence: `${items.length} notices`, notes: 'Derived from WARN activity.' }))
      .slice(0, 6);

  const programsInState = nursingPrograms.filter((program) => normalizeProgram(program).state === state);
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
  const metroData = STATE_METRO_DATA[state] || STATE_METRO_DATA.KY || {};
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
    name: entry.name,
    metros,
    metroSummary: {
      count: metros.length,
      totalHospitals
    },
    salaryMeta: metroData.salaryMeta || null,
    recentWarnNotices,
    rural,
    stateBeacon,
    pipeline: entry.pipeline || {},
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
  if (masterExportToggle) masterExportToggle.disabled = true;
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
    if (masterExportToggle) masterExportToggle.disabled = false;
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
  const metroData = STATE_METRO_DATA[state] || STATE_METRO_DATA.KY || {};
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

  masterExportButtons?.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-format]');
    if (!btn) return;
    exportMasterExport(btn.dataset.format);
  });
};

const exportStateBeaconJson = () => {
  if (!stateBeaconStateSelect) return;
  const data = buildStateBeaconExport(stateBeaconStateSelect.value);
  const content = JSON.stringify(data, null, 2);
  downloadFile(content, `state-beacon-${data.state}.json`, 'application/json');
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
  downloadFile(csv, `state-beacon-${data.state}.csv`, 'text/csv');
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

  // Tab switching
  const tabs = document.querySelectorAll('.beacon-tab');
  const tabContents = document.querySelectorAll('.beacon-tab-content');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`beacon-content-${targetTab}`)?.classList.add('active');
    });
  });

  // Filters toggle
  const filtersToggleBtn = document.getElementById('beacon-filters-toggle');
  const filtersPanel = document.getElementById('beacon-filters-panel');
  filtersToggleBtn?.addEventListener('click', () => {
    filtersToggleBtn.classList.toggle('active');
    filtersPanel?.classList.toggle('open');
  });

  // Update quick tags when filters change
  const updateQuickTags = () => {
    const tagSpecialty = document.getElementById('beacon-tag-specialty');
    const tagExperience = document.getElementById('beacon-tag-experience');
    const tagLicense = document.getElementById('beacon-tag-license');
    if (tagSpecialty) tagSpecialty.textContent = stateBeaconSpecialty?.value || 'General RN';
    if (tagExperience) tagExperience.textContent = stateBeaconExperience?.value || 'New grad';
    if (tagLicense) tagLicense.textContent = stateBeaconLicense?.value || 'Compact';
  };

  // Copy button for script
  document.querySelectorAll('.beacon-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.copy;
      const target = document.getElementById(targetId);
      if (target) {
        navigator.clipboard.writeText(target.textContent || '').then(() => {
          const originalText = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = originalText; }, 1500);
        });
      }
    });
  });

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
    updateQuickTags();
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

  // Target State event listeners
  openTargetStateBtn?.addEventListener('click', openTargetState);
  targetStateCloseBtn?.addEventListener('click', closeTargetState);
  targetStateCloseFooter?.addEventListener('click', closeTargetState);
  targetStateSelect?.addEventListener('change', () => {
    renderTargetState(targetStateSelect.value);
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
  targetStateOpenBeacon?.addEventListener('click', () => {
    const state = targetStateSelect?.value || TARGET_STATE_DEFAULT;
    closeTargetState();
    openStateBeacon(state);
  });

  // Initialize quick tags
  updateQuickTags();
};

// ==================== END STATE BEACON MODULE ====================

// Update initApp to include Strategic Review
const originalInitApp = initApp;

window.addEventListener('resize', () => refreshNoticeListWindow());
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => refreshNoticeListWindow());
}

// Start the app if already authenticated
if (checkAuth()) {
  initApp().then(() => {
    initStrategicReview();
  });
}

// Ensure critical event listeners are attached directly
document.addEventListener('DOMContentLoaded', () => {
  // Collapsible sections
  document.querySelectorAll('section[data-collapsible="true"]').forEach(section => {
    const toggle = section.querySelector('.section-toggle');
    if (!toggle) return;
    const label = toggle.querySelector('.section-toggle-label');
    const icon = toggle.querySelector('.section-toggle-icon');
    toggle.addEventListener('click', () => {
      section.classList.toggle('collapsed');
      const isCollapsed = section.classList.contains('collapsed');
      toggle.setAttribute('aria-expanded', String(!isCollapsed));
      if (label) label.textContent = isCollapsed ? 'Expand' : 'Collapse';
      if (icon) icon.textContent = isCollapsed ? '+' : '–';
    });
  });

  // Out of State Factors button
  const factorsBtn = document.getElementById('map-factors-btn');
  const factorsPanel = document.getElementById('map-factors-panel');
  if (factorsBtn && factorsPanel) {
    factorsBtn.addEventListener('click', () => {
      const isVisible = factorsPanel.style.display !== 'none';
      factorsPanel.style.display = isVisible ? 'none' : 'block';
      if (!isVisible && typeof renderMapFactors === 'function') {
        renderMapFactors();
      }
    });
  }

  // Factors close button
  const factorsClose = document.getElementById('map-factors-close');
  if (factorsClose && factorsPanel) {
    factorsClose.addEventListener('click', () => {
      factorsPanel.style.display = 'none';
    });
  }

  // Target mode fallback — only attach if initViewToggle didn't already
  const targetBtn = document.getElementById('map-target-mode-btn');
  if (targetBtn && !targetBtn.dataset.listenerAttached) {
    targetBtn.dataset.listenerAttached = 'true';
    targetBtn.addEventListener('click', () => {
      if (typeof setMapTargetMode === 'function') {
        setMapTargetMode(!isMapTargetMode);
      }
    });
  }

  // Strategic Market Review toggle
  const strategicToggle = document.getElementById('strategic-toggle');
  const strategicSection = document.querySelector('.strategic-review-section');
  if (strategicToggle && strategicSection) {
    strategicToggle.addEventListener('click', () => {
      strategicSection.classList.toggle('open');
      const isOpen = strategicSection.classList.contains('open');
      const toggleIcon = strategicSection.querySelector('.strategic-toggle-icon');
      if (toggleIcon) {
        toggleIcon.textContent = isOpen ? '-' : '+';
      }
      if (isOpen && typeof renderStrategicReview === 'function') {
        renderStrategicReview();
      }
    });
  }
});







