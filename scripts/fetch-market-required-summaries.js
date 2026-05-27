#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

const writeJson = (name, obj) => {
  fs.writeFileSync(path.join(DATA_DIR, name), JSON.stringify(obj, null, 2));
};

const fetchText = async (url) => {
  const res = await fetch(url, { redirect: 'follow' });
  const text = await res.text();
  return { ok: res.ok, status: res.status, url: res.url, text };
};

const buildSummary = async () => {
  const now = new Date().toISOString();

  // CMS HCRIS
  let cmsHcris = { status: 'pending', details: 'Unavailable', lastUpdated: now };
  try {
    const page = await fetchText('https://data.cms.gov/provider-compliance/cost-reports/hospital-provider-cost-report');
    const latest = (page.text.match(/Latest data available[\s\S]{0,120}?(\d{4})/i) || [])[1] || null;
    cmsHcris = {
      status: page.ok ? 'ok' : 'error',
      details: page.ok ? `Reachable${latest ? `; latest year ${latest}` : ''}` : `HTTP ${page.status}`,
      datasetUrl: page.url,
      latestYear: latest,
      lastUpdated: now
    };
  } catch (err) {
    cmsHcris = { status: 'error', details: err.message, lastUpdated: now };
  }

  // CMS Care Compare
  let cmsCare = { status: 'pending', details: 'Unavailable', lastUpdated: now };
  try {
    const page = await fetchText('https://data.cms.gov/provider-data/topics/hospitals');
    cmsCare = {
      status: page.ok ? 'ok' : 'error',
      details: page.ok ? 'Reachable hospital topic page' : `HTTP ${page.status}`,
      datasetUrl: page.url,
      lastUpdated: now
    };
  } catch (err) {
    cmsCare = { status: 'error', details: err.message, lastUpdated: now };
  }

  // HCAI/OSHPD (California)
  let hcai = { status: 'pending', details: 'Unavailable', lastUpdated: now };
  try {
    const page = await fetchText('https://hcai.ca.gov/data/cost-transparency/hospital-financials/');
    hcai = {
      status: page.ok ? 'ok' : 'error',
      details: page.ok ? 'Reachable HCAI hospital financials page' : `HTTP ${page.status}`,
      datasetUrl: page.url,
      scope: 'CA',
      lastUpdated: now
    };
  } catch (err) {
    hcai = { status: 'error', details: err.message, scope: 'CA', lastUpdated: now };
  }

  // IRS 990s via ProPublica Nonprofit Explorer API
  let irs990 = { status: 'pending', details: 'Unavailable', lastUpdated: now };
  try {
    const res = await fetch('https://projects.propublica.org/nonprofits/api/v2/search.json?q=hospital');
    const data = await res.json();
    irs990 = {
      status: res.ok ? 'ok' : 'error',
      details: res.ok ? `Search API reachable; total_results=${Number(data?.total_results || 0)}` : `HTTP ${res.status}`,
      datasetUrl: 'https://projects.propublica.org/nonprofits/api/v2/search.json?q=hospital',
      totalResults: Number(data?.total_results || 0),
      lastUpdated: now
    };
  } catch (err) {
    irs990 = { status: 'error', details: err.message, lastUpdated: now };
  }

  // Hospital annual reports (public investor/annual pages)
  let annual = { status: 'pending', details: 'Unavailable', lastUpdated: now };
  try {
    const hca = await fetchText('https://investor.hcahealthcare.com/financials/annual-reports/default.aspx');
    const commonSpirit = await fetchText('https://www.commonspirit.org/content/dam/shared/en/pdfs/investor-resources/2025-commonspirit-health-annual-report.SECURED.pdf');
    const ok = hca.ok || commonSpirit.ok;
    annual = {
      status: ok ? 'ok' : 'error',
      details: ok ? 'At least one major system annual-report source reachable' : `HCA ${hca.status}, CommonSpirit ${commonSpirit.status}`,
      sources: [
        { name: 'HCA annual reports', url: hca.url, status: hca.status },
        { name: 'CommonSpirit annual report', url: commonSpirit.url, status: commonSpirit.status }
      ],
      lastUpdated: now
    };
  } catch (err) {
    annual = { status: 'error', details: err.message, lastUpdated: now };
  }

  writeJson('cms-hcris-summary.json', cmsHcris);
  writeJson('cms-care-compare-summary.json', cmsCare);
  writeJson('state-hcai-oshpd-summary.json', hcai);
  writeJson('irs-990-summary.json', irs990);
  writeJson('hospital-annual-reports-summary.json', annual);
};

buildSummary()
  .then(() => {
    console.log('Wrote required market dataset summaries');
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
