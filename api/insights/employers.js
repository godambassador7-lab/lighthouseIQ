import { getNotices, isHealthcareNotice, readJson } from '../_lib/data.js';

export default function handler(_req, res) {
  const snapshot = readJson('employers.json', null);
  if (snapshot && Array.isArray(snapshot.employers)) {
    return res.status(200).json(snapshot);
  }

  const byEmployer = new Map();
  for (const n of getNotices().filter(isHealthcareNotice)) {
    const employerName = n.employer_name || n.employerName || 'Unknown';
    const employerId = n.employer_id || `${String(n.state || '').toUpperCase()}:${employerName.toLowerCase()}`;
    const row = byEmployer.get(employerId) || {
      employer_id: employerId,
      employer_name: employerName,
      parent_system: n.parent_system || n.parentSystem || null,
      state: n.state || null,
      total_notices: 0,
      total_affected: 0,
      avg_affected: 0,
      avg_lead_time_days: null,
      first_notice_date: null,
      last_notice_date: null
    };
    const affected = Number(n.employees_affected ?? n.employeesAffected ?? 0);
    row.total_notices += 1;
    row.total_affected += Number.isFinite(affected) ? affected : 0;
    const dateValue = n.notice_date || n.noticeDate || n.retrieved_at || n.source?.retrievedAt || null;
    if (dateValue && (!row.first_notice_date || dateValue < row.first_notice_date)) row.first_notice_date = dateValue;
    if (dateValue && (!row.last_notice_date || dateValue > row.last_notice_date)) row.last_notice_date = dateValue;
    byEmployer.set(employerId, row);
  }

  const employers = Array.from(byEmployer.values()).map((e) => ({
    ...e,
    avg_affected: e.total_notices ? Math.round(e.total_affected / e.total_notices) : 0
  }));

  res.status(200).json({ employers, count: employers.length });
}

