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
const PASSCODE = ''; // Static site: no secret passcode on the client

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
const programsDownload = document.getElementById('programs-download');
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
const stateBeaconNews = document.getElementById('state-beacon-news');
const stateBeaconCompetition = document.getElementById('state-beacon-competition');
const stateBeaconScript = document.getElementById('state-beacon-script');
const stateBeaconPipeline = document.getElementById('state-beacon-pipeline');
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

// =============================================================================
// State
// =============================================================================
let allNotices = []; // All loaded notices
let currentNotices = []; // Filtered notices
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
let currentPage = 1;
let searchQuery = '';
const NOTICE_MAX_COUNT = 100;
const NOTICE_WINDOW_COUNT = 10;
const NOTICES_PER_PAGE = NOTICE_MAX_COUNT;
let lastNoticeWindowCount = 0;
let noticeWindowRaf = null;
let calibrationStats = { minCount: 0, maxCount: 0 };
let nursingPrograms = [];
let programsMeta = { lastUpdated: null, sources: [] };
let programsLoaded = false;
let programsModuleInitialized = false;
let programsRefreshPrompted = false;
let stateBeaconData = null;
let stateBeaconLoaded = false;
let stateBeaconInputs = null;
const STATE_BEACON_DEFAULT = 'FL';
const STATE_BEACON_HOME_DEFAULT = 'IN';
const STATE_BEACON_INPUTS_KEY = 'lni_state_beacon_inputs';
const STATE_BEACON_NOTES_KEY = 'lni_state_beacon_notes';

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

// =============================================================================
// Authentication (Simple client-side - data is public)
// =============================================================================
const SESSION_KEY = 'lni_authenticated';

const checkAuth = () => true;

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

loginOverlay.classList.add('hidden');

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

  // Advanced Practice & Leadership
  'NP': { name: 'Nurse Practitioner', keywords: ['nurse practitioner', 'np ', 'n.p.', 'aprn', 'advanced practice'] },
  'CNS': { name: 'Clinical Nurse Specialist', keywords: ['clinical nurse specialist', 'cns', 'c.n.s.'] },
  'CRNA': { name: 'Nurse Anesthetist (CRNA)', keywords: ['crna', 'nurse anesthetist', 'anesthesia', 'c.r.n.a.'] },
  'CNM': { name: 'Certified Nurse Midwife', keywords: ['midwife', 'cnm', 'nurse midwife', 'c.n.m.'] },
  'Nurse Manager': { name: 'Nurse Manager / Director', keywords: ['nurse manager', 'nursing manager', 'nurse director', 'nursing director', 'unit manager'] },
  'Charge Nurse': { name: 'Charge Nurse', keywords: ['charge nurse', 'charge rn', 'shift supervisor'] },
  'Case Manager': { name: 'Case Management', keywords: ['case manager', 'case management', 'care coordinator', 'utilization review'] },
  'Educator': { name: 'Nurse Educator', keywords: ['nurse educator', 'nursing educator', 'clinical educator', 'staff development'] },
  'Informatics': { name: 'Nursing Informatics', keywords: ['informatics', 'nursing informatics', 'clinical informatics', 'health it'] },
  'Quality': { name: 'Quality / Performance Improvement', keywords: ['quality', 'performance improvement', 'quality assurance', 'qi ', 'pi '] },
  'Research': { name: 'Research Nurse', keywords: ['research', 'clinical research', 'clinical trials', 'research nurse'] },
  'Infection Control': { name: 'Infection Control', keywords: ['infection control', 'infection prevention', 'epidemiology', 'ic nurse'] },

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

const getStateNotices = (state) => {
  const pool = Array.isArray(allNotices) && allNotices.length ? allNotices : currentNotices;
  return pool.filter((notice) => notice.state === state);
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
  const count = mapStateData[stateAbbrev]?.count || 0;
  const scopeLabel = mapScope === 'all' ? 'total notices' : 'healthcare notices';
  mapTooltip.innerHTML = `
    <div class="tooltip-state">${stateName}</div>
    <div class="tooltip-count">${count} ${scopeLabel}</div>
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
    const refreshedLabel = formatRelativeTime(metadata.lastUpdated);
    statUpdated.textContent = refreshedLabel;
    if (dataRefreshBadge) {
      dataRefreshBadge.textContent = `Data refresh: ${refreshedLabel}`;
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
    setMapScope(mapScope);
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

    // Remove all existing layoff classes
    for (let i = 0; i <= 9; i++) {
      shape.classList.remove(`layoff-${i}`);
    }

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

const loadAllNotices = async () => {
  setLoading('Loading notices...');
  try {
    const data = await fetchJson(`${DATA_BASE_URL}/notices.json`);
    allNotices = data.notices ?? [];
    statTotal.textContent = allNotices.length.toString();
    stateDataHealthcare = buildHealthcareStateCounts(allNotices);
    setMapScope(mapScope);
    return allNotices;
  } catch (err) {
    console.error('Failed to load notices:', err);
    setLoading('Failed to load data. Please refresh the page.');
    return [];
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
  let filtered = [...allNotices];

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
  if (resetPage) currentPage = 1;

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
    noticeList.innerHTML = `<div class="empty-state">No notices match these filters.</div>`;
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
  'Advanced Practice & Leadership': ['NP', 'CNS', 'CRNA', 'CNM', 'Nurse Manager', 'Charge Nurse', 'Case Manager', 'Educator', 'Informatics', 'Quality', 'Research', 'Infection Control'],
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

const setMapScope = (scope) => {
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

  updateMapColors();
  if (currentMapView === 'chart') {
    renderBarChart();
  }
};

const initMapScopeToggle = () => {
  mapScopeHealthcareBtn?.addEventListener('click', () => setMapScope('healthcare'));
  mapScopeAllBtn?.addEventListener('click', () => setMapScope('all'));
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
  initSpecialtyMultiSelect();
  initCustomStateSelect();
  initFilters();
  initQuickNav();
  initProjects();
  initStateCalibration();
  initCustomNotices();
  initHelpSection();
  initViewToggle();
    initMapScopeToggle();
    initForecast();
    initProgramsModule();
    initStateBeacon();
    initNewsFeed();
    await initWeatherMap();

  // Load data
  await Promise.all([
    loadMetadata(),
    loadStates()
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

const renderNewsFeed = () => {
  const list = document.getElementById('news-feed-list');
  if (!list) return;

  if (!newsArticles.length) {
    list.innerHTML = '<div class="empty-state">No news articles available.</div>';
    list.style.maxHeight = '';
    list.classList.remove('news-feed-windowed');
    return;
  }

  list.innerHTML = newsArticles.map(article => `
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

  // Apply 5-item scroll window
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

const initNewsFeed = () => {};

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

// Travel nurse specialty pay (weekly rates)
const SPECIALTY_PAY = {
  'CRNA': { weekly: 4996, annual: 259707, demand: 'very high' },
  'Cath Lab': { weekly: 4341, annual: 225732, demand: 'very high' },
  'NICU': { weekly: 2449, annual: 127391, demand: 'high' },
  'NP': { weekly: 2506, annual: 130295, demand: 'high' },
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
  const salaryData = strategicData?.salaryData || NURSING_SALARY_DATA;
  const specialtyPay = strategicData?.specialtyPay || SPECIALTY_PAY;
  const projections = strategicData?.workforceProjections || WORKFORCE_PROJECTIONS;
  const specialtySignals = strategicData?.specialtySignals || null;
  const specialtySignalCards = Array.isArray(specialtySignals?.cards) ? specialtySignals.cards : [];
  const specialtySignalSources = Array.isArray(specialtySignals?.sources) ? specialtySignals.sources : [];
  const specialtySignalStatus = specialtySignals?.status || 'pending';
  const specialtySourceText = specialtySignalSources.map(source => source.name).filter(Boolean).join(' + ');

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

  const renderSpecialtySignals = () => {
    if (specialtySignalCards.length) {
      return specialtySignalCards.map((card) => {
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
            </div>
            <div class="specialty-signal-tip">${isProxy ? 'Based on total RN employment. Specialty-specific data coming soon.' : tip}</div>
          </div>
        `;
      }).join('');
    }

    return Object.values(NURSE_SPECIALTIES).map((spec) => `
      <div class="specialty-signal-card pending">
        <div class="specialty-signal-title">${spec.name}</div>
        <div class="specialty-signal-rows">
          <div><span class="label">Top</span><span class="value">--</span></div>
          <div><span class="label">Least</span><span class="value">--</span></div>
        </div>
        <div class="specialty-signal-tip">Signal pipeline warming up.</div>
      </div>
    `).join('');
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

  container.innerHTML = `
    <div class="strategic-grid">
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
  const toggleIcon = toggleBtn?.querySelector('.strategic-toggle-icon');
  const section = toggleBtn?.closest('.strategic-review-section');

  toggleBtn?.addEventListener('click', () => {
    section?.classList.toggle('open');
    const isOpen = section?.classList.contains('open');
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
    const response = await fetch(`/data/programs.json?ts=${Date.now()}`);
    if (!response.ok) throw new Error(`Failed to load programs: ${response.status}`);
    const data = await response.json();

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

// ==================== STATE BEACON MODULE ====================
const loadStateBeaconData = async () => {
  if (stateBeaconLoaded) return stateBeaconData;
  try {
    const response = await fetch(`${DATA_BASE_URL}/state-beacon.json?ts=${Date.now()}`);
    if (!response.ok) throw new Error(`Failed to load state beacon: ${response.status}`);
    stateBeaconData = await response.json();
  } catch (err) {
    console.warn('State Beacon unavailable:', err.message);
    stateBeaconData = { lastUpdated: null, states: {} };
  }
  stateBeaconLoaded = true;
  return stateBeaconData;
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
    newsKeywords: entry.newsKeywords ?? [STATE_NAMES[state], state].filter(Boolean),
    priorityMetros: entry.priorityMetros ?? []
  };
};

const renderBeaconList = (container, items, formatter) => {
  if (!container) return;
  if (!items.length) {
    container.innerHTML = '<div class="empty-state">No data available yet.</div>';
    return;
  }
  container.innerHTML = items.map((item) => formatter(item)).join('');
};

const buildHospitalRank = (notices) => {
  const grouped = [];
  const healthcareNotices = notices.filter((notice) => isHealthcareNotice(notice));
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

const getWarnCountForHospital = (notices, hospital) => {
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
    const employer = String(notice.employer_name || notice.employerName || '').toLowerCase();
    const system = String(notice.parent_system || '').toLowerCase();
    return targets.some((target) => employer.includes(target) || system.includes(target));
  }).length;
};

const renderStateBeacon = async (state) => {
  await loadStateBeaconData();
  await ensureProgramsDataForBeacon();

  const entry = getBeaconEntry(state);
  const notices = getStateNotices(state);
  const noticeCount = notices.length;
  const programsInState = nursingPrograms.filter((program) => normalizeProgram(program).state === state);

  const chips = [];
  if (entry.compact !== null) chips.push(`Compact: ${entry.compact ? 'Yes' : 'No'}`);
  if (entry.summary?.demand) chips.push(`Demand: ${entry.summary.demand}`);
  if (entry.summary?.unionization) chips.push(`Union: ${entry.summary.unionization}`);
  if (programsInState.length) chips.push(`Pipeline: ${programsInState.length} programs`);
  if (noticeCount) chips.push(`WARN notices: ${noticeCount}`);

  if (stateBeaconMeta) {
    stateBeaconMeta.innerHTML = chips.map((chip) => `<span class="state-beacon-chip">${escapeHtml(chip)}</span>`).join('');
  }

  let hospitalItems = [];
  if (entry.hospitalRankings?.length) {
    const scored = entry.hospitalRankings.map((hospital) => {
      const baseScore = Number(hospital.baseScore ?? 50);
      const warnWeight = Number(hospital.warnWeight ?? 1);
      const warnCount = getWarnCountForHospital(notices, hospital);
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
    const { best, worst } = buildHospitalRank(notices);
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

  const competitionSystems = entry.competition?.systems?.length
    ? entry.competition.systems
    : Array.from(groupBy(notices, (n) => n.parent_system || n.employer_name || n.employerName).entries())
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

  const keywords = (entry.newsKeywords || []).map((word) => word.toLowerCase());
  const newsMatches = newsArticles.filter((article) => {
    const haystack = `${article.title} ${article.summary}`.toLowerCase();
    return keywords.some((word) => word && haystack.includes(word));
  }).slice(0, 6);
  renderBeaconList(stateBeaconNews, newsMatches, (article) => `
    <a href="${article.url}" target="_blank" rel="noopener noreferrer">
      <strong>${escapeHtml(article.title)}</strong>
      <div class="state-beacon-subtitle">${escapeHtml(article.source || '')}</div>
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
      <strong>${escapeHtml(item.concern)}</strong>
      <span>${escapeHtml(item.response)}</span>
    </div>
  `);
};

const buildStateBeaconExport = (state) => {
  const entry = getBeaconEntry(state);
  const notices = getStateNotices(state);
  const { best, worst } = buildHospitalRank(notices);
  const competitionSystems = entry.competition?.systems?.length
    ? entry.competition.systems
    : Array.from(groupBy(notices, (n) => n.parent_system || n.employer_name || n.employerName).entries())
      .map(([name, items]) => ({ name, presence: `${items.length} notices`, notes: 'Derived from WARN activity.' }))
      .slice(0, 6);

  const programsInState = nursingPrograms.filter((program) => normalizeProgram(program).state === state);
  const programsByLevel = programsInState.reduce((acc, program) => {
    const level = normalizeProgram(program).level || 'Other';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const inputs = getStateBeaconInputs() || {};
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
    pipeline: {
      programsCount: programsInState.length,
      programsByLevel,
      majorPrograms: entry.pipeline?.majorPrograms || [],
      residencies: entry.pipeline?.residencies || [],
      clinicalPartners: entry.pipeline?.clinicalPartners || []
    },
    pros: entry.pros,
    cons: entry.cons,
    attractions: exportNotes.attractions,
    drawbacks: exportNotes.drawbacks,
    talkingPoints: entry.talkingPoints,
    objections: entry.objections
  };
};

const exportStateBeaconJson = () => {
  if (!stateBeaconStateSelect) return;
  const data = buildStateBeaconExport(stateBeaconStateSelect.value);
  const content = JSON.stringify(data, null, 2);
  downloadFile(content, `state-beacon-${data.state}.json`, 'application/json');
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

  stateBeaconExportJson?.addEventListener('click', exportStateBeaconJson);
  stateBeaconExportCsv?.addEventListener('click', exportStateBeaconCsv);
  openStateBeaconBtn?.addEventListener('click', () => openStateBeacon(stateBeaconStateSelect.value));
  stateBeaconCloseBtn?.addEventListener('click', closeStateBeacon);
  stateBeaconCloseFooter?.addEventListener('click', closeStateBeacon);
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




