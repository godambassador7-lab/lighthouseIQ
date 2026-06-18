const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const FILES = [
  'index.html',
  'app.js',
  'styles.css'
];

const pairs = FILES.map((file) => ({
  file,
  publicPath: path.join(ROOT, 'public', file),
  webPath: path.join(ROOT, 'apps', 'web', file)
}));

const requireWebCopy = process.env.PROTECTED_UI_REQUIRE_WEB === '1';

const requirements = [
  {
    file: 'index.html',
    markers: [
      'chart-view-btn',
      'title="Chart View"',
      'flight-view-btn',
      'RN Flight Pattern',
      'id="rn-flight"',
      'app.js?v=8.1',
      'id="calibration-target"',
      'calibration-specialty',
      'target-state-coverage',
      'target-state-schools',
      'target-state-news',
      'styles.css?v=5.12'
    ]
  },
  {
    file: 'app.js',
    markers: [
      'market-line-chart',
      'renderBarChart',
      'renderRnFlightPattern',
      'rnFlightMode',
      'Inbound to state',
      'getRnFlightSourceSvg',
      'getRnFlightVariableSnapshot',
      'Forecast Variables',
      'buildCalibrationSnapshot',
      'TERRITORY_RN_ADVANTAGE_PROFILES',
      'CALIBRATION_JURISDICTIONS',
      'formatCalibrationOption',
      'buildPayerContext',
      'Medicare / Medicaid Selling Context',
      'Recruiter Selling Strategy',
      'CALIBRATION_OUTCOME_KEY',
      'Copy Leadership Summary',
      'Explain this score',
      'Specialty forecast',
      'Compensation intelligence',
      'Facility-level RN Advantage',
      'Forecast accuracy tracking',
      'rn-flight-specialty',
      'Specialty fit',
      'Source audit',
      'populateTargetStateSelector',
      'getStateCoverageRows',
      'getStateNewsFallbackLinks',
      'getProviderRowsForState',
      'setMapHomeState',
      'home-state-glow',
      'contextmenu',
      'getRnFlightOriginRows'
    ]
  },
  {
    file: 'styles.css',
    markers: [
      'market-chart-shell',
      'market-line-chart',
      'rn-flight-shell',
      'rn-flight-variable-panel',
      'calibration-metrics',
      'calibration-payer-panel',
      'calibration-strategy',
      'calibration-source-badges',
      'calibration-freshness-grid',
      'calibration-workflow',
      'calibration-comp-panel',
      'calibration-source-audit',
      'market-forecast-accuracy',
      'rn-flight-source-audit',
      'target-state-coverage-chip',
      'target-state-mini-panel',
      'rn-flight-focus-destination',
      'rn-flight-origin-intensity-5'
    ]
  }
];

const normalize = (value) => value.replace(/\r\n/g, '\n');

const read = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${path.relative(ROOT, filePath)}`);
  }
  return fs.readFileSync(filePath, 'utf8');
};

const failures = [];
const forbiddenMarkers = [
  'map-factors-btn',
  'map-factors-panel',
  'Out of State Factors',
  'renderMapFactors',
  'initMapFactors'
];

pairs.forEach(({ file, publicPath, webPath }) => {
  let publicText = '';
  let webText = '';
  try {
    publicText = read(publicPath);
    if (requireWebCopy) {
      webText = read(webPath);
    }
  } catch (error) {
    failures.push(error.message);
    return;
  }

  if (requireWebCopy && normalize(publicText) !== normalize(webText)) {
    failures.push(`Frontend drift detected: public/${file} does not match apps/web/${file}. Update both copies before deploying.`);
  }

  const requirement = requirements.find((entry) => entry.file === file);
  if (!requirement) return;

  const targets = [{ label: `public/${file}`, text: publicText }];
  if (requireWebCopy) targets.push({ label: `apps/web/${file}`, text: webText });

  targets.forEach(({ label, text }) => {
    requirement.markers.forEach((marker) => {
      if (!text.includes(marker)) {
        failures.push(`${label} is missing protected UI marker: ${marker}`);
      }
    });

    forbiddenMarkers.forEach((marker) => {
      if (text.includes(marker)) {
        failures.push(`${label} still contains removed Out of State Factors marker: ${marker}`);
      }
    });
  });
});

if (failures.length) {
  console.error('Protected UI guard failed.');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(requireWebCopy
  ? 'Protected UI guard passed: Chart View and RN Flight Pattern are present and synced.'
  : 'Protected UI guard passed: Chart View and RN Flight Pattern are present in public assets.');
