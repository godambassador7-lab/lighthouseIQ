#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'public', 'data');

const readJson = (name) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), 'utf8'));
  } catch {
    return null;
  }
};

const freeSignals = readJson('free-market-signals.json');
const strategic = readJson('strategic.json');
const notices = readJson('notices.json');
const metricFile = readJson('market-required-metrics.json');

const optional = {
  cmsHcris: readJson('cms-hcris-summary.json'),
  cmsCareCompare: readJson('cms-care-compare-summary.json'),
  stateHcaiOshpd: readJson('state-hcai-oshpd-summary.json'),
  irs990: readJson('irs-990-summary.json'),
  hospitalAnnualReports: readJson('hospital-annual-reports-summary.json')
};
const isOk = (obj) => String(obj?.status || '').toLowerCase() === 'ok';
const metricStatus = (key) => String(metricFile?.datasets?.[key]?.status || '').toLowerCase();
const metricOk = (key) => metricStatus(key) === 'ok';

const hasStrategicSalary = Boolean(strategic?.salaryData && Object.keys(strategic.salaryData).length);
const warnCount = Array.isArray(notices?.notices) ? notices.notices.length : 0;

const datasets = [
  {
    key: 'hrsa_nssrn',
    label: 'HRSA NSSRN',
    use: 'Nurse supply',
    integrated: Boolean(freeSignals?.hrsaSpecialtyBaseline),
    status: freeSignals?.sources?.hrsa || 'unknown',
    details: freeSignals?.hrsaSpecialtyBaseline ? 'Specialty baseline loaded' : 'Missing specialty baseline'
  },
  {
    key: 'cms_hcris',
    label: 'CMS HCRIS',
    use: 'Hospital labor spend',
    integrated: isOk(optional.cmsHcris) && metricOk('cmsHcris'),
    status: optional.cmsHcris?.status || metricStatus('cmsHcris') || 'pending',
    details: optional.cmsHcris?.details || 'Awaiting cms-hcris-summary.json'
  },
  {
    key: 'bls_oes',
    label: 'BLS OES',
    use: 'Salary pressure',
    integrated: hasStrategicSalary,
    status: freeSignals?.sources?.bls || 'unknown',
    details: hasStrategicSalary ? 'State salary pressure loaded' : 'Missing salary data'
  },
  {
    key: 'warn_notices',
    label: 'WARN notices',
    use: 'Layoffs',
    integrated: warnCount > 0 && metricOk('warnNotices'),
    status: warnCount > 0 ? 'ok' : 'pending',
    details: warnCount > 0 ? `${warnCount} notices loaded` : 'No notices found'
  },
  {
    key: 'cms_care_compare',
    label: 'CMS Care Compare',
    use: 'Staffing distress',
    integrated: isOk(optional.cmsCareCompare) && metricOk('cmsCareCompare'),
    status: optional.cmsCareCompare?.status || metricStatus('cmsCareCompare') || 'pending',
    details: optional.cmsCareCompare?.details || 'Awaiting cms-care-compare-summary.json'
  },
  {
    key: 'state_hcai_oshpd',
    label: 'State HCAI/OSHPD',
    use: 'Unit staffing',
    integrated: isOk(optional.stateHcaiOshpd) && metricOk('stateHcaiOshpd'),
    status: optional.stateHcaiOshpd?.status || metricStatus('stateHcaiOshpd') || 'pending',
    details: optional.stateHcaiOshpd?.details || 'Awaiting state-hcai-oshpd-summary.json'
  },
  {
    key: 'irs_990s',
    label: 'IRS 990s',
    use: 'Financial health',
    integrated: isOk(optional.irs990) && metricOk('irs990'),
    status: optional.irs990?.status || metricStatus('irs990') || 'pending',
    details: optional.irs990?.details || 'Awaiting irs-990-summary.json'
  },
  {
    key: 'hospital_annual_reports',
    label: 'Hospital annual reports',
    use: 'Expansion/contraction',
    integrated: isOk(optional.hospitalAnnualReports) && metricOk('hospitalAnnualReports'),
    status: optional.hospitalAnnualReports?.status || metricStatus('hospitalAnnualReports') || 'pending',
    details: optional.hospitalAnnualReports?.details || 'Awaiting hospital-annual-reports-summary.json'
  }
];

const integratedCount = datasets.filter((d) => d.integrated).length;

const output = {
  lastUpdated: new Date().toISOString(),
  requiredDatasets: datasets,
  summary: {
    integratedCount,
    totalRequired: datasets.length,
    completenessPct: Math.round((integratedCount / datasets.length) * 100)
  }
};

fs.writeFileSync(path.join(DATA_DIR, 'market-readiness-integration.json'), JSON.stringify(output, null, 2));
console.log('Wrote public/data/market-readiness-integration.json');
