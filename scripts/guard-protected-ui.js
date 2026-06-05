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

const requirements = [
  {
    file: 'index.html',
    markers: [
      'chart-view-btn',
      'title="Chart View"',
      'flight-view-btn',
      'RN Flight Pattern',
      'id="rn-flight"',
      'app.js?v=6.6',
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

pairs.forEach(({ file, publicPath, webPath }) => {
  let publicText = '';
  let webText = '';
  try {
    publicText = read(publicPath);
    webText = read(webPath);
  } catch (error) {
    failures.push(error.message);
    return;
  }

  if (normalize(publicText) !== normalize(webText)) {
    failures.push(`Frontend drift detected: public/${file} does not match apps/web/${file}. Update both copies before deploying.`);
  }

  const requirement = requirements.find((entry) => entry.file === file);
  if (!requirement) return;

  [
    { label: `public/${file}`, text: publicText },
    { label: `apps/web/${file}`, text: webText }
  ].forEach(({ label, text }) => {
    requirement.markers.forEach((marker) => {
      if (!text.includes(marker)) {
        failures.push(`${label} is missing protected UI marker: ${marker}`);
      }
    });
  });
});

if (failures.length) {
  console.error('Protected UI guard failed.');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Protected UI guard passed: Chart View and RN Flight Pattern are present and synced.');
