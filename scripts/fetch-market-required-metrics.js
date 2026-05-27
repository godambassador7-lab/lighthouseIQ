#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const OUT = path.join(DATA_DIR, 'market-required-metrics.json');

const fetchText = async (url) => {
  const res = await fetch(url, { redirect: 'follow' });
  const text = await res.text();
  return { ok: res.ok, status: res.status, url: res.url, text };
};

const extractFirst = (text, regex) => {
  const m = text.match(regex);
  return m ? m[1] : null;
};

const collect = async () => {
  const now = new Date().toISOString();

  // 1) HRSA NSSRN
  const hrsaUrl = 'https://data.hrsa.gov/topics/health-workforce/nchwa/nursing-workforce-survey-data';
  let hrsa = { status: 'error', metrics: {}, sourceUrl: hrsaUrl };
  try {
    const r = await fetchText(hrsaUrl);
    const year = extractFirst(r.text, /Registered Nurses\s+1977\s*[–-]\s*(\d{4})/i);
    hrsa = {
      status: r.ok ? 'ok' : 'error',
      sourceUrl: r.url,
      fetchedAt: now,
      metrics: {
        latestSurveyYear: year ? Number(year) : null,
        hasDownloadLinks: /ASCII Format|SAS Format|SPSS Format|STATA Format/i.test(r.text)
      }
    };
  } catch (e) {
    hrsa.error = e.message;
  }

  // 2) CMS HCRIS / Hospital Provider Cost Report
  const hcrisUrl = 'https://data.cms.gov/provider-compliance/cost-reports/hospital-provider-cost-report';
  let hcris = { status: 'error', metrics: {}, sourceUrl: hcrisUrl };
  try {
    const r = await fetchText(hcrisUrl);
    const latestYear = extractFirst(r.text, /Latest data available[\s\S]{0,120}?(\d{4})/i);
    hcris = {
      status: r.ok ? 'ok' : 'error',
      sourceUrl: r.url,
      fetchedAt: now,
      metrics: {
        latestDataYear: latestYear ? Number(latestYear) : null,
        updateFrequency: /typically updated once every 12 months/i.test(r.text) ? 'annual' : 'unknown'
      }
    };
  } catch (e) {
    hcris.error = e.message;
  }

  // 3) BLS OES
  const blsUrl = 'https://www.bls.gov/oes/tables.htm';
  let bls = { status: 'error', metrics: {}, sourceUrl: blsUrl };
  try {
    const r = await fetchText(blsUrl);
    const mayYear = extractFirst(r.text, /May\s+(\d{4})/i);
    bls = {
      status: r.ok ? 'ok' : 'error',
      sourceUrl: r.url,
      fetchedAt: now,
      metrics: {
        latestPublicationYear: mayYear ? Number(mayYear) : null,
        hasMetroTables: /Metropolitan and nonmetropolitan area/i.test(r.text)
      }
    };
  } catch (e) {
    bls.error = e.message;
  }

  // 4) WARN notices (local)
  let warn = { status: 'error', metrics: {}, sourceUrl: 'public/data/notices.json' };
  try {
    const notices = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'notices.json'), 'utf8'));
    const rows = Array.isArray(notices?.notices) ? notices.notices : [];
    warn = {
      status: 'ok',
      fetchedAt: now,
      sourceUrl: 'public/data/notices.json',
      metrics: {
        totalNotices: rows.length,
        distinctStates: new Set(rows.map((n) => String(n?.state || '').trim()).filter(Boolean)).size
      }
    };
  } catch (e) {
    warn.error = e.message;
  }

  // 5) CMS Care Compare hospitals topic
  const careUrl = 'https://data.cms.gov/provider-data/topics/hospitals';
  let care = { status: 'error', metrics: {}, sourceUrl: careUrl };
  try {
    const r = await fetchText(careUrl);
    const starReleaseYear = extractFirst(r.text, /April\s+(\d{4})\s+release/i);
    care = {
      status: r.ok ? 'ok' : 'error',
      sourceUrl: r.url,
      fetchedAt: now,
      metrics: {
        latestStarReleaseYear: starReleaseYear ? Number(starReleaseYear) : null,
        hasApiMention: /API\*/i.test(r.text) || /API/i.test(r.text)
      }
    };
  } catch (e) {
    care.error = e.message;
  }

  // 6) State HCAI/OSHPD (CA)
  const hcaiUrl = 'https://hcai.ca.gov/data/cost-transparency/hospital-financials/';
  let hcai = { status: 'error', metrics: {}, sourceUrl: hcaiUrl };
  try {
    const r = await fetchText(hcaiUrl);
    hcai = {
      status: r.ok ? 'ok' : 'error',
      sourceUrl: r.url,
      fetchedAt: now,
      metrics: {
        updateCadence: /updated quarterly/i.test(r.text) ? 'quarterly' : 'unknown',
        hasStaffingHours: /staffing hours/i.test(r.text)
      }
    };
  } catch (e) {
    hcai.error = e.message;
  }

  // 7) IRS 990s (ProPublica API)
  const irsUrl = 'https://projects.propublica.org/nonprofits/api/v2/search.json?q=hospital';
  let irs = { status: 'error', metrics: {}, sourceUrl: irsUrl };
  try {
    const res = await fetch(irsUrl);
    const json = await res.json();
    irs = {
      status: res.ok ? 'ok' : 'error',
      sourceUrl: irsUrl,
      fetchedAt: now,
      metrics: {
        totalResults: Number(json?.total_results || 0),
        sampleReturned: Array.isArray(json?.organizations) ? json.organizations.length : 0
      }
    };
  } catch (e) {
    irs.error = e.message;
  }

  // 8) Hospital annual reports (public pages)
  const hcaAnnualUrl = 'https://investor.hcahealthcare.com/financials/annual-reports/default.aspx';
  const commonSpiritAnnualUrl = 'https://www.commonspirit.org/content/dam/shared/en/pdfs/investor-resources/2025-commonspirit-health-annual-report.SECURED.pdf';
  let annual = { status: 'error', metrics: {}, sourceUrl: hcaAnnualUrl };
  try {
    const hca = await fetchText(hcaAnnualUrl);
    const common = await fetch(commonSpiritAnnualUrl, { redirect: 'follow' });
    const hcaYears = [...new Set((hca.text.match(/20\d{2}\s+Annual Report/gi) || []).map((s) => Number((s.match(/20\d{2}/) || [])[0])))]
      .filter(Number.isFinite)
      .sort((a, b) => b - a);
    annual = {
      status: hca.ok || common.ok ? 'ok' : 'error',
      sourceUrl: hca.url,
      fetchedAt: now,
      metrics: {
        hcaAnnualReportYearsFound: hcaYears.length,
        latestHcaAnnualReportYear: hcaYears[0] || null,
        commonSpiritAnnualReachable: common.ok
      }
    };
  } catch (e) {
    annual.error = e.message;
  }

  const out = {
    lastUpdated: now,
    datasets: {
      hrsaNssrn: hrsa,
      cmsHcris: hcris,
      blsOes: bls,
      warnNotices: warn,
      cmsCareCompare: care,
      stateHcaiOshpd: hcai,
      irs990: irs,
      hospitalAnnualReports: annual
    }
  };

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`Wrote ${OUT}`);
};

collect().catch((err) => {
  console.error(err);
  process.exit(1);
});
